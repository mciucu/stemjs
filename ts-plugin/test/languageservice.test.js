// Drives the plugin the way tsserver does, to check what the editor is actually shown: the placeholder must
// never reach the screen, and anything landing on a relocated member has to come back to where it's written.

const path = require("path");
const init = require("../index");

const FIXTURE = path.join(__dirname, "fixture");
const OPTIONS = {stemRoot: "@stemjs"};

function createPlugin(ts) {
    const configPath = ts.findConfigFile(FIXTURE, ts.sys.fileExists, "tsconfig.json");
    const {config} = ts.readConfigFile(configPath, ts.sys.readFile);
    const {options, fileNames} = ts.parseJsonConfigFileContent(config, ts.sys, FIXTURE);

    const host = {
        getScriptFileNames: () => fileNames,
        getScriptVersion: () => "1",
        getScriptSnapshot: (fileName) => {
            const text = ts.sys.readFile(fileName);
            return text === undefined ? undefined : ts.ScriptSnapshot.fromString(text);
        },
        getCurrentDirectory: () => FIXTURE,
        getCompilationSettings: () => options,
        getDefaultLibFileName: (settings) => ts.getDefaultLibFilePath(settings),
        fileExists: ts.sys.fileExists,
        readFile: ts.sys.readFile,
        readDirectory: ts.sys.readDirectory,
        directoryExists: ts.sys.directoryExists,
        getDirectories: ts.sys.getDirectories,
    };

    const languageService = ts.createLanguageService(host, ts.createDocumentRegistry());
    return init({typescript: ts}).create({
        languageService,
        languageServiceHost: host,
        project: {projectService: {logger: {info: () => {}}}},
        config: OPTIONS,
    });
}

module.exports = (ts, check) => {
    const plugin = createPlugin(ts);
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

    const outline = plugin.getNavigationTree(storesFile);
    const chatMessage = outline.childItems.find(item => item.text === "ChatMessage");
    check("the outline shows real names", chatMessage.childItems.map(item => item.text).sort().join(","),
        "content,createdAt,describe,editedAt,messageThread");
};
