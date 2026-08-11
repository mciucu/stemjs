// TypeScript language service plugin for Stem's decorators: makes `this.styleSheet` resolve to the style
// sheet passed to @registerStyle, and an un-annotated `@field(X) name` resolve to what X loads.
//
// See transform.js for what gets declared and why. Two things are true of the text the compiler is handed:
// the declarations are appended past the end of the file, and an un-annotated @field member is renamed to
// an equal-length placeholder. So the file keeps its exact shape and offsets mean the same thing on both
// sides - everything this file does is to keep the two halves from showing through: the appended region is
// hidden from results the editor displays, and anything that lands on a relocated member is mapped back to
// where that member is actually written.

const {getAugmentedSource} = require("./transform");

function init(modules) {
    const ts = modules.typescript;

    function create(info) {
        const host = info.languageServiceHost;
        const languageService = info.languageService;
        const log = (message) => info.project.projectService.logger.info("[stem] " + message);
        const config = info.config || {};

        // Per augmented file: where the user's text ends, and the members we relocated out of it
        const augmentedFiles = new Map();
        // Every placeholder we've handed out, to keep them out of completions across files
        const placeholderNames = new Set();

        const getScriptSnapshot = host.getScriptSnapshot.bind(host);
        host.getScriptSnapshot = (fileName) => {
            const snapshot = getScriptSnapshot(fileName);
            if (!snapshot || !/\.tsx?$/.test(fileName) || fileName.includes("node_modules")) {
                return snapshot;
            }
            const text = snapshot.getText(0, snapshot.getLength());
            let augmented = null;
            try {
                augmented = getAugmentedSource(ts, fileName, text, config);
            } catch (error) {
                log("failed to augment " + fileName + ": " + error.message);
            }
            if (!augmented) {
                augmentedFiles.delete(fileName);
                return snapshot;
            }
            augmentedFiles.set(fileName, augmented);
            for (const field of augmented.fields) {
                placeholderNames.add(field.placeholder);
            }
            return ts.ScriptSnapshot.fromString(augmented.text);
        };

        // The document registry caches parsed files by version, so augmented files need a version of their own
        const getScriptVersion = host.getScriptVersion.bind(host);
        host.getScriptVersion = (fileName) => {
            const version = getScriptVersion(fileName);
            return augmentedFiles.has(fileName) ? version + "+stem" : version;
        };

        const isOurs = (fileName, start) => {
            const augmented = augmentedFiles.get(fileName);
            return Boolean(augmented) && start >= augmented.originalLength;
        };

        // The member a position falls in, on the side of the file the user has open. Inclusive of the end,
        // so a cursor resting right after the name still counts as being on it.
        const fieldAtSource = (fileName, position) => {
            const augmented = augmentedFiles.get(fileName);
            return augmented && augmented.fields.find(
                field => position >= field.sourceStart && position <= field.sourceStart + field.name.length
            );
        };

        const fieldAtAppended = (fileName, start) => {
            const augmented = augmentedFiles.get(fileName);
            return augmented && augmented.fields.find(
                field => start >= field.appendedStart && start < field.appendedStart + field.name.length
            );
        };

        // Ask about the declaration we appended rather than the placeholder standing in for it
        const toAppendedPosition = (fileName, position) => {
            const field = fieldAtSource(fileName, position);
            return field ? field.appendedStart + (position - field.sourceStart) : position;
        };

        // ...and report it back at the member the class actually declares
        const toSourceSpan = (fileName, textSpan) => {
            const field = fieldAtAppended(fileName, textSpan.start);
            if (!field) {
                return undefined;
            }
            return {start: field.sourceStart + (textSpan.start - field.appendedStart), length: textSpan.length};
        };

        // Results that landed in the appended region are moved back to the member, or dropped if they point
        // at something else of ours (the interface declaration itself, say) that has nowhere to go
        const mapSpans = (items, defaultFileName) => (items || []).map(item => {
            const fileName = item.fileName || defaultFileName;
            if (!isOurs(fileName, item.textSpan.start)) {
                return item;
            }
            const textSpan = toSourceSpan(fileName, item.textSpan);
            return textSpan ? {...item, textSpan, contextSpan: undefined} : null;
        }).filter(Boolean);

        const restoreNames = (fileName, text) => {
            const augmented = augmentedFiles.get(fileName);
            if (!augmented || typeof text !== "string") {
                return text;
            }
            let restored = text;
            for (const field of augmented.fields) {
                restored = restored.split(field.placeholder).join(field.name);
            }
            return restored;
        };

        // A message can name a placeholder even when it's reported somewhere we leave alone ("did you mean
        // ...?" being the likely one), so the name is put back on the way out
        const restoreDiagnosticNames = (diagnostic) => {
            const fileName = diagnostic.file && diagnostic.file.fileName;
            if (!fileName || !augmentedFiles.has(fileName)) {
                return diagnostic;
            }
            const restoreChain = (messageText) => {
                if (typeof messageText === "string") {
                    return restoreNames(fileName, messageText);
                }
                return {
                    ...messageText,
                    messageText: restoreNames(fileName, messageText.messageText),
                    next: messageText.next && messageText.next.map(restoreChain),
                };
            };
            return {...diagnostic, messageText: restoreChain(diagnostic.messageText)};
        };

        const proxy = Object.create(null);
        for (const key of Object.keys(languageService)) {
            const method = languageService[key];
            proxy[key] = (...args) => method.apply(languageService, args);
        }

        for (const key of ["getSemanticDiagnostics", "getSyntacticDiagnostics", "getSuggestionDiagnostics"]) {
            proxy[key] = (fileName) => languageService[key](fileName).filter(diagnostic => {
                if (isOurs(fileName, diagnostic.start)) {
                    return false;
                }
                // A placeholder is un-annotated on purpose; its implicit any is ours to answer for, not the user's
                const field = fieldAtSource(fileName, diagnostic.start);
                return !field || diagnostic.start >= field.sourceStart + field.name.length;
            }).map(restoreDiagnosticNames);
        }

        proxy.getQuickInfoAtPosition = (fileName, position) => {
            const field = fieldAtSource(fileName, position);
            if (!field) {
                return languageService.getQuickInfoAtPosition(fileName, position);
            }
            const quickInfo = languageService.getQuickInfoAtPosition(fileName, field.appendedStart);
            if (!quickInfo) {
                return quickInfo;
            }
            return {...quickInfo, textSpan: {start: field.sourceStart, length: field.name.length}};
        };

        for (const key of ["getReferencesAtPosition", "getImplementationAtPosition", "getTypeDefinitionAtPosition",
                           "findRenameLocations"]) {
            proxy[key] = (fileName, position, ...args) => {
                const result = languageService[key](fileName, toAppendedPosition(fileName, position), ...args);
                return result ? mapSpans(result, fileName) : result;
            };
        }

        proxy.getDocumentHighlights = (fileName, position, filesToSearch) => {
            const result = languageService.getDocumentHighlights(fileName, toAppendedPosition(fileName, position), filesToSearch);
            if (!result) {
                return result;
            }
            return result.map(entry => ({
                ...entry,
                highlightSpans: mapSpans(entry.highlightSpans, entry.fileName),
            })).filter(entry => entry.highlightSpans.length > 0);
        };

        proxy.getDefinitionAtPosition = (fileName, position) =>
            mapSpans(languageService.getDefinitionAtPosition(fileName, toAppendedPosition(fileName, position)), fileName);

        proxy.getDefinitionAndBoundSpan = (fileName, position) => {
            const field = fieldAtSource(fileName, position);
            const result = languageService.getDefinitionAndBoundSpan(fileName, toAppendedPosition(fileName, position));
            if (!result || !result.definitions) {
                return result;
            }
            const definitions = mapSpans(result.definitions, fileName);
            if (definitions.length === 0) {
                return undefined;
            }
            const textSpan = field ? {start: field.sourceStart, length: field.name.length} : result.textSpan;
            return {...result, textSpan, definitions};
        };

        proxy.getCompletionsAtPosition = (fileName, position, options, formatOptions) => {
            const result = languageService.getCompletionsAtPosition(fileName, position, options, formatOptions);
            if (!result) {
                return result;
            }
            return {...result, entries: result.entries.filter(entry => !placeholderNames.has(entry.name))};
        };

        // Renaming a class member the editor knows only as a placeholder would be a rename to a placeholder
        const writesAPlaceholder = (changes) => (changes || []).some(
            change => change.textChanges.some(textChange => [...placeholderNames].some(name => textChange.newText.includes(name)))
        );

        const keepOurEditsOut = (changes) => (changes || []).map(change => ({
            ...change,
            textChanges: change.textChanges.filter(textChange => !isOurs(change.fileName, textChange.span.start)),
        })).filter(change => change.textChanges.length > 0);

        for (const key of ["getFormattingEditsForDocument", "getFormattingEditsForRange", "getFormattingEditsAfterKeystroke"]) {
            proxy[key] = (fileName, ...args) => (languageService[key](fileName, ...args) || []).filter(
                edit => !isOurs(fileName, edit.span.start)
            );
        }

        proxy.getCodeFixesAtPosition = (...args) => (languageService.getCodeFixesAtPosition(...args) || [])
            .filter(fix => !writesAPlaceholder(fix.changes))
            .map(fix => ({...fix, changes: keepOurEditsOut(fix.changes)}));

        proxy.getCombinedCodeFix = (...args) => {
            const result = languageService.getCombinedCodeFix(...args);
            return {...result, changes: keepOurEditsOut(result.changes)};
        };

        for (const key of ["organizeImports", "getEditsForFileRename"]) {
            proxy[key] = (...args) => keepOurEditsOut(languageService[key](...args));
        }

        proxy.getEditsForRefactor = (...args) => {
            const result = languageService.getEditsForRefactor(...args);
            return result ? {...result, edits: keepOurEditsOut(result.edits)} : result;
        };

        // The outline is built from the class body, where the placeholders live, so it gets the names back
        const restoreNavigationItem = (fileName, item) => ({
            ...item,
            text: restoreNames(fileName, item.text),
            childItems: item.childItems && item.childItems
                .filter(child => !isOurs(fileName, child.spans[0].start))
                .map(child => restoreNavigationItem(fileName, child)),
        });

        proxy.getNavigationTree = (fileName) => {
            const tree = languageService.getNavigationTree(fileName);
            return tree ? restoreNavigationItem(fileName, tree) : tree;
        };

        proxy.getNavigationBarItems = (fileName) => (languageService.getNavigationBarItems(fileName) || [])
            .filter(item => !isOurs(fileName, item.spans[0].start))
            .map(item => restoreNavigationItem(fileName, item));

        proxy.getNavigateToItems = (...args) => (languageService.getNavigateToItems(...args) || [])
            .filter(item => !isOurs(item.fileName, item.textSpan.start))
            .map(item => ({...item, name: restoreNames(item.fileName, item.name)}));

        log("loaded");
        return proxy;
    }

    return {create};
}

module.exports = init;
