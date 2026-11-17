// Builds a program that sees what the editor sees - the augmented text, with our own noise filtered back out -
// so command-line checking agrees with the editor. typecheck.js is the CLI over this; the tests use it directly.

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const {getAugmentedSource, toSourceOffset} = require("./transform");
const {isNumericCoercion} = require("./numericCoercion");
const {isCollectedChild} = require("./jsxChildren");
const {isRegisteredStyleReplacement} = require("./registeredStyle");
const {isSkippedStemSource, stemRootDiagnostic} = require("./stemSources");
const {childrenFieldDiagnostics} = require("./childrenField");

const PLUGIN_NAME = "ts-plugin-registered-styles";

// The user's own text, built once per file that reports, so line and column line up with what they see
const sourceFiles = new WeakMap();
function sourceFileFor(ts, fileName, augmented) {
    if (!sourceFiles.has(augmented)) {
        sourceFiles.set(augmented, ts.createSourceFile(fileName, augmented.sourceText, ts.ScriptTarget.ESNext, true));
    }
    return sourceFiles.get(augmented);
}

// configFile names a tsconfig other than the project's tsconfig.json, relative to projectRoot
function parseConfig(ts, projectRoot, configFile = null) {
    const configPath = configFile ? path.resolve(projectRoot, configFile) : ts.findConfigFile(projectRoot, ts.sys.fileExists, "tsconfig.json");
    const {config, error} = ts.readConfigFile(configPath, ts.sys.readFile);
    if (error) {
        throw new Error(ts.flattenDiagnosticMessageText(error.messageText, "\n"));
    }
    const parsed = ts.parseJsonConfigFileContent(config, ts.sys, path.dirname(configPath));
    // We only ever check. Without this, a project with allowJs and no outDir plans to emit next to every input and
    // reports TS5055 for each .js file it would overwrite - one phantom error per unmigrated file.
    parsed.options.noEmit = true;
    return {...parsed, configPath};
}

// Use the same configuration the editor plugin gets from tsconfig.json, plus the JSX runtime the project
// compiles with, which is what says whether a tag stands for an instance or for a React element
function getPluginConfig(options) {
    const entry = (options.plugins || []).find(entry => entry.name === PLUGIN_NAME) || {};
    return {...entry, jsxFactory: options.jsxFactory, jsxImportSource: options.jsxImportSource};
}

// Replaced by something of its own length, so every offset the augmented source is built from stays valid
function neutralizeNoCheck(text) {
    return text.split("@ts-nocheck").join(" ts-nocheck");
}

function createAugmentingHost(ts, options, augmentedFiles, previewNoCheck) {
    const host = ts.createCompilerHost(options, true);
    const getSourceFile = host.getSourceFile.bind(host);

    host.getSourceFile = (fileName, languageVersion, onError, shouldCreate) => {
        let text = host.readFile(fileName);
        if (text == null || fileName.includes("node_modules")) {
            return getSourceFile(fileName, languageVersion, onError, shouldCreate);
        }
        if (previewNoCheck) {
            text = neutralizeNoCheck(text);
        }
        const augmented = process.env.NO_STEM_PLUGIN
            ? null
            : getAugmentedSource(ts, fileName, text, getPluginConfig(options));
        if (augmented) {
            augmented.sourceText = text;
        }
        if (!augmented) {
            // Only build the file ourselves when we rewrote it - otherwise the host still knows best
            return previewNoCheck
                ? ts.createSourceFile(fileName, text, languageVersion, true)
                : getSourceFile(fileName, languageVersion, onError, shouldCreate);
        }
        augmentedFiles.set(path.normalize(fileName), augmented);
        return ts.createSourceFile(fileName, augmented.text, languageVersion, true);
    };

    return host;
}

// Everything we appended is our own doing, and so is the implicit any on a member we renamed.
// STEM_PLUGIN_DEBUG shows the appended half instead: a mistake in what we generate otherwise fails as a
// missing member at the *call site*, with the error that explains it hidden.
function isOurs(augmented, start) {
    if (!augmented) {
        return false;
    }
    if (start >= augmented.originalLength) {
        return !process.env.STEM_PLUGIN_DEBUG;
    }
    // A field is where the user wrote it, and start is in the text the compiler sees, further along past an insertion
    const sourceStart = toSourceOffset(augmented.shifts, start);
    return augmented.fields.some(field => sourceStart >= field.sourceStart && sourceStart < field.sourceStart + field.name.length);
}

function restoreNames(augmented, messageText) {
    if (!augmented) {
        return messageText;
    }
    if (typeof messageText !== "string") {
        return {
            ...messageText,
            messageText: restoreNames(augmented, messageText.messageText),
            next: messageText.next && messageText.next.map(entry => restoreNames(augmented, entry)),
        };
    }
    let restored = messageText;
    for (const field of augmented.fields) {
        restored = restored.split(field.placeholder).join(field.name);
    }
    return restored;
}

// The builder knows a file changed by its version, so the version is a hash of the text the compiler sees: an edit to
// the file, to what the plugin appends or to the plugin's own transform each changes it
function setVersionsFromText(host) {
    const createHash = text => crypto.createHash("sha256").update(text).digest("hex");
    host.createHash = createHash;
    const getSourceFile = host.getSourceFile;
    host.getSourceFile = (...args) => {
        const sourceFile = getSourceFile(...args);
        if (sourceFile) {
            sourceFile.version = createHash(sourceFile.text);
        }
        return sourceFile;
    };
}

// Hands back the file an earlier check built while its text on disk is as it was then: parsed and bound, and the same
// object, which is what lets the program that follows reuse the old one's structure
function keepSourceFiles(host, keptFiles, augmentedFiles) {
    const getSourceFile = host.getSourceFile;
    host.getSourceFile = (fileName, ...rest) => {
        const text = host.readFile(fileName);
        const kept = keptFiles.get(fileName);
        if (kept && kept.text === text) {
            if (kept.augmented) {
                augmentedFiles.set(path.normalize(fileName), kept.augmented);
            }
            return kept.sourceFile;
        }
        const sourceFile = getSourceFile(fileName, ...rest);
        if (sourceFile && text != null) {
            keptFiles.set(fileName, {text, sourceFile, augmented: augmentedFiles.get(path.normalize(fileName))});
        } else {
            keptFiles.delete(fileName);
        }
        return sourceFile;
    };
}

// Written beside itself and renamed over, so a run that starts while another writes reads a whole file or the one before.
// The check is done by now, so a file that can't be written costs only the next run's head start.
function writeBuildInfo(fileName, text) {
    const temporary = `${fileName}.${process.pid}.tmp`;
    try {
        fs.mkdirSync(path.dirname(fileName), {recursive: true});
        fs.writeFileSync(temporary, text);
        fs.renameSync(temporary, fileName);
    } catch (error) {
        fs.rmSync(temporary, {force: true});
        console.error(`Can't keep the build info in ${fileName}: ${error.message}`);
    }
}

// A check of the project that can be run again. Without options it is one plain program. buildInfoFile, a path outside
// the sources, makes it incremental across processes: the semantic diagnostics of a file whose text, and whose
// dependencies' declarations, are as they were in the last run come from that file instead of the checker. keepFiles
// makes each run after the first in the same process reparse only the files that changed on disk.
function createProjectCheck(ts, projectRoot, {filter = null, previewNoCheck = false, configFile = null, buildInfoFile = null, keepFiles = false} = {}) {
    const buildInfoPath = buildInfoFile && path.resolve(projectRoot, buildInfoFile);
    // What a run leaves the next with keepFiles: each file as it was built, the builder that checked them, and the options
    // both were made under, as text. The builder goes with the files: what it remembers points into them.
    const kept = keepFiles ? {files: new Map(), builder: null, options: null} : null;

    // The diagnostics the user is answerable for, the program they come from and the parsed tsconfig
    return () => {
        const config = parseConfig(ts, projectRoot, configFile);
        const {options, fileNames} = config;
        const augmentedFiles = new Map();
        const host = createAugmentingHost(ts, options, augmentedFiles, previewNoCheck);
        let builder = null;
        if (buildInfoPath || kept) {
            const incrementalOptions = buildInfoPath ? {...options, incremental: true, tsBuildInfoFile: buildInfoPath} : options;
            setVersionsFromText(host);
            if (kept) {
                // A tsconfig that changed parses a file differently, and has the plugin add other things to it: start over
                const optionsText = JSON.stringify(options);
                if (optionsText !== kept.options) {
                    kept.files.clear();
                    kept.builder = null;
                    kept.options = optionsText;
                }
                keepSourceFiles(host, kept.files, augmentedFiles);
            }
            builder = kept && kept.builder
                ? ts.createSemanticDiagnosticsBuilderProgram(fileNames, incrementalOptions, host, kept.builder)
                : ts.createIncrementalProgram({rootNames: fileNames, options: incrementalOptions, host, createProgram: ts.createSemanticDiagnosticsBuilderProgram});
        }
        const program = builder ? builder.getProgram() : ts.createProgram(fileNames, options, host);
        if (kept) {
            kept.builder = builder;
            const inProgram = new Set(program.getSourceFiles().map(file => file.fileName));
            for (const fileName of kept.files.keys()) {
                if (!inProgram.has(fileName)) {
                    kept.files.delete(fileName);
                }
            }
        }
        const preEmitDiagnostics = ts.getPreEmitDiagnostics(builder || program);
        if (buildInfoPath) {
            // With noEmit, emitting writes only the build info
            builder.emit(undefined, writeBuildInfo);
        }
        const diagnostics = projectDiagnostics(ts, projectRoot, program, options, augmentedFiles, preEmitDiagnostics, filter);
        return {diagnostics, program, config};
    };
}

// previewNoCheck answers what a file would report if it weren't silenced, which is how a migration measures itself
function getProjectDiagnostics(ts, projectRoot, filter = null, previewNoCheck = false, configFile = null) {
    return createProjectCheck(ts, projectRoot, {filter, previewNoCheck, configFile})().diagnostics;
}

// What the compiler reported, less what the plugin itself caused, with the names and positions as the user wrote them
function projectDiagnostics(ts, projectRoot, program, options, augmentedFiles, preEmitDiagnostics, filter) {
    const checker = program.getTypeChecker();
    const pluginConfig = getPluginConfig(options);
    const stemRootProblem = augmentedFiles.size > 0 ? stemRootDiagnostic(ts, pluginConfig, options, projectRoot) : null;

    const childrenFields = program.getSourceFiles().filter(file => !file.isDeclarationFile).flatMap(file => childrenFieldDiagnostics(ts, checker, file));
    return [...(stemRootProblem ? [stemRootProblem] : []), ...preEmitDiagnostics, ...childrenFields].filter(diagnostic => {
        // Project-wide diagnostics have no file to match against, so a filtered run isn't asking about them
        if (!diagnostic.file) {
            return !filter;
        }
        // Third-party sources aren't ours to fix, and skipLibCheck only spares us the .d.ts ones
        if (diagnostic.file.fileName.includes("node_modules")) {
            return false;
        }
        if (isSkippedStemSource(pluginConfig, diagnostic.file.fileName)) {
            return false;
        }
        if (isOurs(augmentedFiles.get(path.normalize(diagnostic.file.fileName)), diagnostic.start)) {
            return false;
        }
        if (isNumericCoercion(ts, checker, diagnostic)) {
            return false;
        }
        if (isCollectedChild(ts, checker, diagnostic, options)) {
            return false;
        }
        if (isRegisteredStyleReplacement(ts, checker, diagnostic)) {
            return false;
        }
        return !filter || diagnostic.file.fileName.includes(filter);
    }).map(diagnostic => {
        if (!diagnostic.file) {
            return diagnostic;
        }
        const augmented = augmentedFiles.get(path.normalize(diagnostic.file.fileName));
        const mapped = {...diagnostic, messageText: restoreNames(augmented, diagnostic.messageText)};
        if (augmented && augmented.shifts && augmented.shifts.length > 0) {
            // The line is already right - an inserted assertion never carries a newline - but the column
            // and the excerpt have to come from the text as written
            mapped.start = toSourceOffset(augmented.shifts, diagnostic.start);
            mapped.file = sourceFileFor(ts, diagnostic.file.fileName, augmented);
        }
        return mapped;
    });
}

module.exports = {createProjectCheck, getProjectDiagnostics};
