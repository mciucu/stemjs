#!/usr/bin/env node
// Command-line counterpart of the editor plugin: type-checks the project with the same `@registerStyle` awareness.
// Usage: node stem-core/ts-plugin/typecheck.js [--filter <substring>]

const path = require("path");
const ts = require("typescript");
const {getStyleAugmentations} = require("./transform");

// The project being checked is the one we're run from, not stem's own directory
const projectRoot = process.cwd();

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
function getStyleModule(options) {
    const plugin = (options.plugins || []).find(entry => entry.name === "ts-plugin-registered-styles");
    return plugin && plugin.styleModule;
}

function createAugmentingHost(options, originalLengths) {
    const host = ts.createCompilerHost(options, true);
    const getSourceFile = host.getSourceFile.bind(host);

    host.getSourceFile = (fileName, languageVersion, onError, shouldCreate) => {
        const text = host.readFile(fileName);
        if (text == null || fileName.includes("node_modules")) {
            return getSourceFile(fileName, languageVersion, onError, shouldCreate);
        }
        const augmentations = process.env.NO_STYLE_PLUGIN
            ? ""
            : getStyleAugmentations(ts, fileName, text, getStyleModule(options));
        if (!augmentations) {
            return getSourceFile(fileName, languageVersion, onError, shouldCreate);
        }
        originalLengths.set(path.normalize(fileName), text.length);
        return ts.createSourceFile(fileName, text + augmentations, languageVersion, true);
    };

    return host;
}

function main() {
    const filterIndex = process.argv.indexOf("--filter");
    const filter = filterIndex === -1 ? null : process.argv[filterIndex + 1];

    const {options, fileNames} = parseConfig();
    const originalLengths = new Map();
    const program = ts.createProgram(fileNames, options, createAugmentingHost(options, originalLengths));

    const diagnostics = ts.getPreEmitDiagnostics(program).filter(diagnostic => {
        // Project-wide diagnostics have no file to match against, so a filtered run isn't asking about them
        if (!diagnostic.file) {
            return !filter;
        }
        // Anything reported inside the appended declarations is our own doing, not the user's code
        const limit = originalLengths.get(path.normalize(diagnostic.file.fileName));
        if (limit != null && diagnostic.start >= limit) {
            return false;
        }
        return !filter || diagnostic.file.fileName.includes(filter);
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
}

main();
