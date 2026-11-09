// skipStemCheck: Stem's own sources answer to Stem's settings. A project stricter than Stem (strict: true, say)
// sets it to see only its own errors, the way skipLibCheck spares it the errors inside .d.ts files.

const path = require("path");
const {getStemRoot, UI_MODULE} = require("./transform");

// This plugin lives in Stem's ts-plugin folder, so Stem is the folder above it
const STEM_ROOT = path.resolve(__dirname, "..") + path.sep;

function isSkippedStemSource(config, fileName) {
    return !!(config && config.skipStemCheck) && path.resolve(fileName).startsWith(STEM_ROOT);
}

// Reported when stemRoot doesn't resolve. Every declaration the plugin adds imports from it, so they all type as any,
// and the compiler's "cannot find module" lands in the text the plugin hides: without this, nothing would say so.
const STEM_ROOT_UNRESOLVED = 99001;

function stemRootDiagnostic(ts, config, compilerOptions, projectDir) {
    const uiModule = getStemRoot(config) + UI_MODULE;
    const {resolvedModule} = ts.resolveModuleName(uiModule, path.join(projectDir, "index.ts"), compilerOptions, ts.sys);
    if (resolvedModule) {
        return null;
    }
    return {
        category: ts.DiagnosticCategory.Error,
        code: STEM_ROOT_UNRESOLVED,
        file: undefined,
        start: undefined,
        length: undefined,
        messageText: `Stem's ts-plugin can't find "${uiModule}", so the types it adds are any: set "stemRoot" in its tsconfig plugin entry to where this project imports Stem from.`,
    };
}

module.exports = {isSkippedStemSource, stemRootDiagnostic};
