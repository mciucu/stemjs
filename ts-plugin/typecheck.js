#!/usr/bin/env node
// Command-line counterpart of the editor plugin: type-checks the project with the same awareness of
// @registerStyle and @field. An un-annotated @field only has a type because of this, so this is what
// `npm run typecheck` should run - plain `tsc` sees the field as an implicit any.
// Usage: node stem-core/ts-plugin/typecheck.js [--filter <substring>]

const path = require("path");
const {getAugmentedSource} = require("./transform");

// The project being checked is the one we're run from, and so is its TypeScript - stem is a submodule and
// generally has no node_modules of its own
const projectRoot = process.cwd();
const ts = require(require.resolve("typescript", {paths: [projectRoot, __dirname, ...module.paths]}));

const PLUGIN_NAME = "ts-plugin-registered-styles";

function parseConfig() {
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

function createAugmentingHost(options, augmentedFiles) {
    const host = ts.createCompilerHost(options, true);
    const getSourceFile = host.getSourceFile.bind(host);

    host.getSourceFile = (fileName, languageVersion, onError, shouldCreate) => {
        const text = host.readFile(fileName);
        if (text == null || fileName.includes("node_modules")) {
            return getSourceFile(fileName, languageVersion, onError, shouldCreate);
        }
        const augmented = process.env.NO_STEM_PLUGIN
            ? null
            : getAugmentedSource(ts, fileName, text, getPluginConfig(options));
        if (!augmented) {
            return getSourceFile(fileName, languageVersion, onError, shouldCreate);
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

function main() {
    const filterIndex = process.argv.indexOf("--filter");
    const filter = filterIndex === -1 ? null : process.argv[filterIndex + 1];

    const {options, fileNames} = parseConfig();
    const augmentedFiles = new Map();
    const program = ts.createProgram(fileNames, options, createAugmentingHost(options, augmentedFiles));

    const diagnostics = ts.getPreEmitDiagnostics(program).filter(diagnostic => {
        // Project-wide diagnostics have no file to match against, so a filtered run isn't asking about them
        if (!diagnostic.file) {
            return !filter;
        }
        if (isOurs(augmentedFiles.get(path.normalize(diagnostic.file.fileName)), diagnostic.start)) {
            return false;
        }
        return !filter || diagnostic.file.fileName.includes(filter);
    }).map(diagnostic => {
        if (!diagnostic.file) {
            return diagnostic;
        }
        const augmented = augmentedFiles.get(path.normalize(diagnostic.file.fileName));
        return {...diagnostic, messageText: restoreNames(augmented, diagnostic.messageText)};
    });

    const formatHost = {
        getCanonicalFileName: fileName => fileName,
        getCurrentDirectory: () => projectRoot,
        getNewLine: () => ts.sys.newLine,
    };
    if (diagnostics.length > 0) {
        process.stdout.write(ts.formatDiagnostics(diagnostics, formatHost));
    }
    console.error(`${diagnostics.length} errors`);
    process.exitCode = diagnostics.length > 0 ? 1 : 0;
}

main();
