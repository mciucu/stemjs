// Builds a program that sees what the editor sees - the augmented text, with our own noise filtered back out -
// so command-line checking agrees with the editor. typecheck.js is the CLI over this; the tests use it directly.

const path = require("path");
const {getAugmentedSource, toSourceOffset} = require("./transform");
const {isNumericCoercion} = require("./numericCoercion");

const PLUGIN_NAME = "ts-plugin-registered-styles";

// The user's own text, built once per file that reports, so line and column line up with what they see
const sourceFiles = new Map();
function sourceFileFor(ts, fileName, augmented) {
    if (!sourceFiles.has(fileName)) {
        sourceFiles.set(fileName, ts.createSourceFile(fileName, augmented.sourceText, ts.ScriptTarget.ESNext, true));
    }
    return sourceFiles.get(fileName);
}

function parseConfig(ts, projectRoot) {
    const configPath = ts.findConfigFile(projectRoot, ts.sys.fileExists, "tsconfig.json");
    const {config, error} = ts.readConfigFile(configPath, ts.sys.readFile);
    if (error) {
        throw new Error(ts.flattenDiagnosticMessageText(error.messageText, "\n"));
    }
    const parsed = ts.parseJsonConfigFileContent(config, ts.sys, path.dirname(configPath));
    // We only ever check. Without this, a project with allowJs and no outDir plans to emit next to every input and
    // reports TS5055 for each .js file it would overwrite - one phantom error per unmigrated file.
    parsed.options.noEmit = true;
    return parsed;
}

// Use the same configuration the editor plugin gets from tsconfig.json
function getPluginConfig(options) {
    return (options.plugins || []).find(entry => entry.name === PLUGIN_NAME) || {};
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
    return augmented.fields.some(field => start >= field.sourceStart && start < field.sourceStart + field.name.length);
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

// The diagnostics the user is answerable for, in the project rooted at projectRoot. previewNoCheck
// answers what a file would report if it weren't silenced, which is how a migration measures itself.
function getProjectDiagnostics(ts, projectRoot, filter = null, previewNoCheck = false) {
    const {options, fileNames} = parseConfig(ts, projectRoot);
    const augmentedFiles = new Map();
    const program = ts.createProgram(fileNames, options, createAugmentingHost(ts, options, augmentedFiles, previewNoCheck));
    const checker = program.getTypeChecker();

    return ts.getPreEmitDiagnostics(program).filter(diagnostic => {
        // Project-wide diagnostics have no file to match against, so a filtered run isn't asking about them
        if (!diagnostic.file) {
            return !filter;
        }
        // Third-party sources aren't ours to fix, and skipLibCheck only spares us the .d.ts ones
        if (diagnostic.file.fileName.includes("node_modules")) {
            return false;
        }
        if (isOurs(augmentedFiles.get(path.normalize(diagnostic.file.fileName)), diagnostic.start)) {
            return false;
        }
        if (isNumericCoercion(ts, checker, diagnostic)) {
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

module.exports = {getProjectDiagnostics};
