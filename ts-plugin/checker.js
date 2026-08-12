// Builds a program that sees what the editor sees - the augmented text, with our own noise filtered back out -
// so command-line checking agrees with the editor. typecheck.js is the CLI over this; the tests use it directly.

const path = require("path");
const {getAugmentedSource} = require("./transform");

const PLUGIN_NAME = "ts-plugin-registered-styles";

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

function createAugmentingHost(ts, options, augmentedFiles) {
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

// The diagnostics the user is answerable for, in the project rooted at projectRoot
function getProjectDiagnostics(ts, projectRoot, filter = null) {
    const {options, fileNames} = parseConfig(ts, projectRoot);
    const augmentedFiles = new Map();
    const program = ts.createProgram(fileNames, options, createAugmentingHost(ts, options, augmentedFiles));

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
        return !filter || diagnostic.file.fileName.includes(filter);
    }).map(diagnostic => {
        if (!diagnostic.file) {
            return diagnostic;
        }
        const augmented = augmentedFiles.get(path.normalize(diagnostic.file.fileName));
        return {...diagnostic, messageText: restoreNames(augmented, diagnostic.messageText)};
    });
}

module.exports = {getProjectDiagnostics};
