// Drives the plugin the way tsserver does, to check what the editor is actually shown: the placeholder must
// never reach the screen, and anything landing on a relocated member has to come back to where it's written.

const path = require("path");
const init = require("../index");

const FIXTURE = path.join(__dirname, "fixture");
const OPTIONS = {stemRoot: "@stemjs"};

// Held in memory rather than on disk, because it has to report an error and the fixture compiles clean.
// Everything below the JSX element sits further along in the text the compiler sees than in the file.
const SHIFTED = path.join(FIXTURE, "shifted.tsx");
const SHIFTED_SOURCE = [
    `import {UI, UIElement} from "../../../ui/UIBase";`,
    ``,
    `class Panel extends UIElement {`,
    `    open(): void {}`,
    `}`,
    ``,
    `class Holder extends UIElement {`,
    `    declare panel: Panel;`,
    ``,
    `    assign(): void {`,
    `        this.panel = <Panel/>;`,
    `        const count: number = "not a number";`,
    `        const doubled = count * 2;`,
    `        const box: {width: number} = {width: "wide"};`,
    `        // TODO: nothing here`,
    `        this.panel.open();`,
    `        this.missingMember();`,
    `    }`,
    `}`,
    ``,
    `export {Holder, UI};`,
].join("\n");

function createPlugin(ts) {
    const configPath = ts.findConfigFile(FIXTURE, ts.sys.fileExists, "tsconfig.json");
    const {config} = ts.readConfigFile(configPath, ts.sys.readFile);
    const {options, fileNames} = ts.parseJsonConfigFileContent(config, ts.sys, FIXTURE);

    const readSnapshot = (fileName) => {
        const text = fileName === SHIFTED ? SHIFTED_SOURCE : ts.sys.readFile(fileName);
        return text === undefined ? undefined : ts.ScriptSnapshot.fromString(text);
    };

    const host = {
        getScriptFileNames: () => [...fileNames, SHIFTED],
        getScriptVersion: () => "1",
        getScriptSnapshot: readSnapshot,
        getCurrentDirectory: () => FIXTURE,
        getCompilationSettings: () => options,
        getDefaultLibFileName: (settings) => ts.getDefaultLibFilePath(settings),
        fileExists: (fileName) => fileName === SHIFTED || ts.sys.fileExists(fileName),
        readFile: (fileName) => (fileName === SHIFTED ? SHIFTED_SOURCE : ts.sys.readFile(fileName)),
        readDirectory: ts.sys.readDirectory,
        directoryExists: ts.sys.directoryExists,
        getDirectories: ts.sys.getDirectories,
    };

    const languageService = ts.createLanguageService(host, ts.createDocumentRegistry());
    const plugin = init({typescript: ts}).create({
        languageService,
        languageServiceHost: host,
        project: {projectService: {logger: {info: () => {}}}},
        config: OPTIONS,
    });
    // create() replaced the host's snapshots; raw reads the files as they are, which is what the editor shows
    const raw = ts.createLanguageService({...host, getScriptSnapshot: readSnapshot}, ts.createDocumentRegistry());
    return {plugin, raw};
}

module.exports = (ts, check) => {
    const {plugin, raw} = createPlugin(ts);
    const storesFile = path.join(FIXTURE, "stores.ts");
    const text = ts.sys.readFile(storesFile);

    const declarationPosition = text.indexOf("@field(MessageThread) messageThread") + "@field(MessageThread) ".length;
    const usagePosition = text.indexOf("this.messageThread.title") + "this.".length;
    const rawIdPosition = text.indexOf("this.messageThreadId") + "this.".length;

    const typeAt = (position) => {
        const info = plugin.getQuickInfoAtPosition(storesFile, position);
        return info ? ts.displayPartsToString(info.displayParts) : "<none>";
    };

    check("hover on a usage", typeAt(usagePosition), "(property) ChatMessage.messageThread: MessageThread");
    check("hover on the declaration", typeAt(declarationPosition), "(property) ChatMessage.messageThread: MessageThread");
    check("hover on an implied raw id", typeAt(rawIdPosition), "(property) messageThreadId: StoreId");

    const quickInfo = plugin.getQuickInfoAtPosition(storesFile, declarationPosition);
    check("the hover span is the member itself",
        text.substr(quickInfo.textSpan.start, quickInfo.textSpan.length), "messageThread");

    const definitions = plugin.getDefinitionAtPosition(storesFile, usagePosition);
    check("go-to-definition finds one place", definitions.length, 1);
    check("go-to-definition stays inside the file", definitions[0].textSpan.start < text.length, true);
    check("go-to-definition lands on the member",
        text.substr(definitions[0].textSpan.start, definitions[0].textSpan.length), "messageThread");

    // A JSX element is typed as its tag, not as JSX.Element, and the span comes back where it was written
    const jsxFile = path.join(FIXTURE, "jsx.tsx");
    const jsxText = ts.sys.readFile(jsxFile);
    const jsxTypeAt = (position) => {
        const info = plugin.getQuickInfoAtPosition(jsxFile, position);
        return info ? ts.displayPartsToString(info.displayParts) : "<none>";
    };

    const namePosition = jsxText.indexOf("panel.open()");
    check("hover on a JSX-derived name", jsxTypeAt(namePosition), "const panel: Panel");

    const jsxQuickInfo = plugin.getQuickInfoAtPosition(jsxFile, namePosition);
    check("the hover span is where the name is written",
        jsxText.substr(jsxQuickInfo.textSpan.start, jsxQuickInfo.textSpan.length), "panel");

    const members = plugin.getCompletionsAtPosition(jsxFile, namePosition + "panel.".length, {});
    const memberNames = (members ? members.entries : []).map(entry => entry.name);
    check("completion offers the tag's own member", memberNames.includes("open"), true);
    check("completion does not offer another tag's", memberNames.includes("slide"), false);

    const renames = plugin.findRenameLocations(storesFile, usagePosition, false, false);
    check("rename covers the declaration and all four usages", renames.length, 5);
    check("every rename location is the real name",
        renames.every(location => text.substr(location.textSpan.start, location.textSpan.length) === "messageThread"), true);
    check("rename includes the declaration itself",
        renames.some(location => location.textSpan.start === declarationPosition), true);

    const completions = plugin.getCompletionsAtPosition(storesFile, usagePosition, {}, {});
    const names = completions.entries.map(entry => entry.name);
    check("completion offers the member", names.includes("messageThread"), true);
    check("completion offers the implied raw id", names.includes("messageThreadId"), true);
    check("completion hides every placeholder", names.some(name => /\$\d+$/.test(name)), false);

    const diagnostics = plugin.getSemanticDiagnostics(storesFile);
    check("no diagnostics of our own leak out",
        diagnostics.map(diagnostic => ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")).join(" | "), "");

    const [assignment, literal] = plugin.getSemanticDiagnostics(SHIFTED);
    check("an error is underlined where the file has it",
        SHIFTED_SOURCE.substr(assignment.start, assignment.length), "count");

    const [related] = literal.relatedInformation;
    check("so is the declaration an error points back to",
        SHIFTED_SOURCE.substr(related.start, related.length), "width");

    const hints = plugin.provideInlayHints(
        SHIFTED, {start: 0, length: SHIFTED_SOURCE.length}, {includeInlayVariableTypeHints: true}
    );
    check("an inlay hint sits after the name it types",
        hints.map(hint => SHIFTED_SOURCE.slice(0, hint.position).split("\n").pop().trim() + hint.text).join(" | "),
        "const doubled: number");

    const [, , missing] = plugin.getSemanticDiagnostics(SHIFTED);
    const [fix] = plugin.getCodeFixesAtPosition(
        SHIFTED, missing.start, missing.start + missing.length, [missing.code], {}, {}
    );
    check("a quick fix writes inside the class, not past the end of the file",
        fix.changes[0].textChanges[0].span.start < SHIFTED_SOURCE.indexOf("export {"), true);

    const callPosition = SHIFTED_SOURCE.indexOf("this.panel.open(") + "this.panel.open(".length;
    const signatureHelp = plugin.getSignatureHelpItems(SHIFTED, callPosition, {});
    check("signature help answers about the call the cursor is in",
        (signatureHelp?.items || []).map(item => item.prefixDisplayParts.map(part => part.text).join("")).join(" | "),
        "open(");
    check("its applicable span is where the arguments are written", signatureHelp?.applicableSpan.start, callPosition);

    const spanText = (span) => SHIFTED_SOURCE.substr(span.start, span.length);

    const outlining = plugin.getOutliningSpans(SHIFTED);
    check("every outlining span is a block in the file",
        outlining.every(span => spanText(span.textSpan).trimStart().startsWith("{")), true);
    const assignBlock = outlining.find(span => spanText(span.hintSpan).startsWith("assign(): void"));
    check("and stops at the brace that closes it", assignBlock && spanText(assignBlock.textSpan).endsWith("}"), true);

    const [todo] = plugin.getTodoComments(SHIFTED, [{text: "TODO", priority: 0}]);
    check("a todo is marked where it is written", SHIFTED_SOURCE.substr(todo.position, 4), "TODO");

    const bracePosition = SHIFTED_SOURCE.indexOf("assign(): void {") + "assign(): void ".length;
    check("brace matching finds the pair",
        plugin.getBraceMatchingAtPosition(SHIFTED, bracePosition).map(spanText).join(""), "{}");

    const selection = plugin.getSmartSelectionRange(SHIFTED, SHIFTED_SOURCE.indexOf("const count") + "const ".length);
    check("selection starts at the name under the caret", spanText(selection.textSpan), "count");

    const holder = plugin.getNavigationTree(SHIFTED).childItems.find(item => item.text === "Holder");
    check("the outline's span is the class as written",
        spanText(holder.spans[0]).startsWith("class Holder") && spanText(holder.spans[0]).endsWith("}"), true);
    check("and its name span is the name", spanText(holder.nameSpan), "Holder");

    const hierarchy = plugin.prepareCallHierarchy(SHIFTED, SHIFTED_SOURCE.indexOf("assign(): void") + 2);
    const called = Array.isArray(hierarchy) ? hierarchy[0] : hierarchy;
    check("call hierarchy points at the method name", spanText(called.selectionSpan), "assign");
    check("and covers the method through to its end", spanText(called.span).endsWith("}"), true);

    const boxPosition = SHIFTED_SOURCE.indexOf("const box");
    const upToBox = SHIFTED_SOURCE.slice(0, boxPosition).split("\n");
    check("a position is reported at the line and column the file has",
        JSON.stringify(plugin.toLineColumnOffset(SHIFTED, boxPosition)),
        JSON.stringify({line: upToBox.length - 1, character: upToBox[upToBox.length - 1].length}));

    // Nothing is inserted or appended as far as the editor's colours are concerned
    const wholeFile = {start: 0, length: SHIFTED_SOURCE.length};
    const listSpans = (entries) => entries.map(entry => `${entry.textSpan.start}+${entry.textSpan.length}`).join(" ");
    check("classification says what a service without the plugin says",
        listSpans(plugin.getSemanticClassifications(SHIFTED, wholeFile)),
        listSpans(raw.getSemanticClassifications(SHIFTED, wholeFile)));
    check("and so does its encoded form",
        plugin.getEncodedSyntacticClassifications(SHIFTED, wholeFile).spans.join(),
        raw.getEncodedSyntacticClassifications(SHIFTED, wholeFile).spans.join());

    const outline = plugin.getNavigationTree(storesFile);
    const chatMessage = outline.childItems.find(item => item.text === "ChatMessage");
    check("the outline shows real names", chatMessage.childItems.map(item => item.text).sort().join(","),
        "content,createdAt,describe,editedAt,messageThread");
};
