// TypeScript language service plugin: makes `this.styleSheet` resolve to the style sheet passed to @registerStyle.
//
// See transform.js for what gets declared and why. The declarations are appended to the file the compiler sees, so
// the editor's offsets stay valid; everything this file does beyond that is hiding the appended region from results
// that are shown to (or applied by) the editor.

const {getStyleAugmentations} = require("./transform");

function init(modules) {
    const ts = modules.typescript;

    function create(info) {
        const host = info.languageServiceHost;
        const log = (message) => info.project.projectService.logger.info("[registered-styles] " + message);
        const styleModule = info.config && info.config.styleModule;

        // For each file we augment, the length of the original text - anything at or past it is ours, not the user's
        const originalLengths = new Map();

        const getScriptSnapshot = host.getScriptSnapshot.bind(host);
        host.getScriptSnapshot = (fileName) => {
            const snapshot = getScriptSnapshot(fileName);
            if (!snapshot || !/\.tsx?$/.test(fileName) || fileName.includes("node_modules")) {
                return snapshot;
            }
            const text = snapshot.getText(0, snapshot.getLength());
            let augmentations = "";
            try {
                augmentations = getStyleAugmentations(ts, fileName, text, styleModule);
            } catch (error) {
                log("failed to augment " + fileName + ": " + error.message);
            }
            if (!augmentations) {
                originalLengths.delete(fileName);
                return snapshot;
            }
            originalLengths.set(fileName, text.length);
            return ts.ScriptSnapshot.fromString(text + augmentations);
        };

        // The document registry caches parsed files by version, so augmented files need a version of their own
        const getScriptVersion = host.getScriptVersion.bind(host);
        host.getScriptVersion = (fileName) => {
            const version = getScriptVersion(fileName);
            return originalLengths.has(fileName) ? version + "+styles" : version;
        };

        const isOurs = (fileName, start) => {
            const limit = originalLengths.get(fileName);
            return limit != null && start >= limit;
        };
        const keepSpans = (items, getFileName, getStart) => (items || []).filter(
            item => !isOurs(getFileName(item), getStart(item))
        );
        const byTextSpan = (items, fileName) => keepSpans(items, item => item.fileName || fileName, item => item.textSpan.start);
        const byFileTextChanges = (changes) => (changes || []).map(change => ({
            ...change,
            textChanges: change.textChanges.filter(textChange => !isOurs(change.fileName, textChange.span.start)),
        })).filter(change => change.textChanges.length > 0);

        const proxy = Object.create(null);
        for (const key of Object.keys(info.languageService)) {
            const method = info.languageService[key];
            proxy[key] = (...args) => method.apply(info.languageService, args);
        }

        for (const key of ["getSemanticDiagnostics", "getSyntacticDiagnostics", "getSuggestionDiagnostics"]) {
            proxy[key] = (fileName) => info.languageService[key](fileName).filter(
                diagnostic => !isOurs(fileName, diagnostic.start)
            );
        }

        for (const key of ["getReferencesAtPosition", "getDocumentHighlights", "getImplementationAtPosition",
                           "getTypeDefinitionAtPosition", "findRenameLocations"]) {
            proxy[key] = (fileName, ...args) => {
                const result = info.languageService[key](fileName, ...args);
                if (!result) {
                    return result;
                }
                if (key === "getDocumentHighlights") {
                    return result.map(entry => ({
                        ...entry,
                        highlightSpans: entry.highlightSpans.filter(span => !isOurs(entry.fileName, span.textSpan.start)),
                    })).filter(entry => entry.highlightSpans.length > 0);
                }
                return byTextSpan(result, fileName);
            };
        }

        proxy.getDefinitionAtPosition = (fileName, position) =>
            byTextSpan(info.languageService.getDefinitionAtPosition(fileName, position), fileName);

        proxy.getDefinitionAndBoundSpan = (fileName, position) => {
            const result = info.languageService.getDefinitionAndBoundSpan(fileName, position);
            if (!result || !result.definitions) {
                return result;
            }
            const definitions = byTextSpan(result.definitions, fileName);
            return definitions.length > 0 ? {...result, definitions} : undefined;
        };

        for (const key of ["getFormattingEditsForDocument", "getFormattingEditsForRange", "getFormattingEditsAfterKeystroke"]) {
            proxy[key] = (fileName, ...args) => (info.languageService[key](fileName, ...args) || []).filter(
                edit => !isOurs(fileName, edit.span.start)
            );
        }

        for (const key of ["getCodeFixesAtPosition", "getCombinedCodeFix", "organizeImports", "getEditsForFileRename"]) {
            proxy[key] = (...args) => {
                const result = info.languageService[key](...args);
                if (key === "getCombinedCodeFix") {
                    return {...result, changes: byFileTextChanges(result.changes)};
                }
                if (key === "getCodeFixesAtPosition") {
                    return (result || []).map(fix => ({...fix, changes: byFileTextChanges(fix.changes)}));
                }
                return byFileTextChanges(result);
            };
        }

        proxy.getEditsForRefactor = (...args) => {
            const result = info.languageService.getEditsForRefactor(...args);
            return result ? {...result, edits: byFileTextChanges(result.edits)} : result;
        };

        proxy.getNavigationTree = (fileName) => {
            const tree = info.languageService.getNavigationTree(fileName);
            if (!tree || !tree.childItems) {
                return tree;
            }
            return {...tree, childItems: tree.childItems.filter(item => !isOurs(fileName, item.spans[0].start))};
        };

        log("loaded");
        return proxy;
    }

    return {create};
}

module.exports = init;
