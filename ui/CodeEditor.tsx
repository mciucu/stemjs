// Wrapper over the Ace code editor, needs ace to be loaded
// TODO: should be renamed to AceCodeEditor?
import {UI, UIElement} from "./UIBase";
import {StyleSheet, styleRule} from "./Style";
import {registerStyle} from "./style/Theme";
import {EnqueueableMethodMixin, enqueueIfNotLoaded} from "../base/EnqueueableMethodMixin";
import {ensure} from "../base/Require";
import {NodeAttributes} from "./NodeAttributes";

// Type definitions for Ace Editor
declare global {
    interface Window {
        ace: any;
    }
}

export interface CodeEditorOptions {
    aceMode?: string;
    readOnly?: boolean;
    aceTheme?: string;
    aceKeyboardHandler?: string;
    fontSize?: number;
    tabSize?: number;
    showLineNumber?: boolean;
    showPrintMargin?: boolean;
    printMarginSize?: number;
    lineWrapping?: boolean;
    numLines?: number;
    maxLines?: number;
    minLines?: number;
    value?: string;
    enableBasicAutocompletion?: boolean;
    enableLiveAutocompletion?: boolean;
    enableSnippets?: boolean;
}

export class CodeEditor extends EnqueueableMethodMixin(UIElement<CodeEditorOptions>) {
    static langToolsSrc: string | null = null;
    static AceRange: any;
    
    protected ace: any;
    protected apiChange: boolean = false;

    static requireAce(callback: () => void): void {
        throw Error("You need to implement requireAce");
    }

    isLoaded(): boolean {
        return !!this.getAce();
    }

    setOptions(options: CodeEditorOptions): void {
        let defaultOptions = {
            aceMode: "text",
            readOnly: false,
            aceTheme: "dawn",
            aceKeyboardHandler: "ace",
            fontSize: 14,
            tabSize: 4,
            showLineNumber: true,
            showPrintMargin: false,
            printMarginSize: 80,
        };
        options = Object.assign(defaultOptions, options);

        if (options.aceMode) {
            options.aceMode = options.aceMode.toLowerCase();
        }

        if (options.aceMode === "cpp" || options.aceMode === "c") {
            options.aceMode = "c_cpp";
        }

        super.setOptions(options);

        if (this.getAce()) {
            this.applyAceOptions();
        }
    }

    redraw() {
        if (this.getAce()) {
            this.aceResize();
            this.applyRef();
            return true;
        }
        return super.redraw();
    }

    whenLoaded(callback: () => void): void {
        if (this.isLoaded()) {
            callback();
        } else {
            this.addListenerOnce("aceReady", callback);
        }
    }

    onMount(): void {
        // Sometimes when the parent div resizes the ace editor doesn't fully update.
        this.addListener("resize", () => {
            this.aceResize();
        });

        this.addListener("change", () => {
            this.aceResize();
        });

        if (!window.ace) {
            (this.constructor as typeof CodeEditor).requireAce(() => {
                this.onDelayedMount();
            });
            return;
        }
        this.onDelayedMount();
    }

    onDelayedMount(): void {
        this.ace = window.ace.edit(this.node);

        // Removes some warnings
        this.getAce().$blockScrolling = Infinity;

        this.resolveQueuedMethods();

        this.applyAceOptions();

        //#voodoo was here to automatically redraw when unhiding
        //This Ace event listener might be useful in the future
        this.getAce().renderer.$textLayer.addEventListener("changeCharacterSize", (event: any) => {
            this.aceResize();
        });
        this.dispatch("aceReady");
    }

    onUnmount(): void {
        this.getAce().destroy();
    }

    getAce(): any {
        return this.ace;
    }

    getValue(): string {
        return this.getAce().getValue();
    }

    @enqueueIfNotLoaded
    applyAceOptions(): void {
        // TODO maybe only this should be with enqueueIfNotLoaded
        this.setAceMode(this.options.aceMode!);
        this.setAceKeyboardHandler(this.options.aceKeyboardHandler!);
        this.setAceTheme(this.options.aceTheme!);
        this.setAceFontSize(this.options.fontSize!);
        this.setAceTabSize(this.options.tabSize!);
        this.setAceLineNumberVisible(this.options.showLineNumber!);
        this.setAcePrintMarginVisible(this.options.showPrintMargin!);
        this.setAcePrintMarginSize(this.options.printMarginSize!);
        this.setReadOnly(this.options.readOnly!);
        this.setUseWrapMode(this.options.lineWrapping || false);

        if (this.options.numLines) {
            this.options.maxLines = this.options.minLines = this.options.numLines;
        }

        if (this.options.maxLines) {
            this.setAceOptions({
                maxLines: this.options.maxLines
            });
        }

        if (this.options.minLines) {
            this.setAceOptions({
                minLines: this.options.minLines
            });
        }

        if (this.options.value) {
            this.setValue(this.options.value, -1);
        }
        if (this.options.hasOwnProperty("enableBasicAutocompletion") ||
            this.options.hasOwnProperty("enableLiveAutocompletion")) {
            const {langToolsSrc} = this.constructor as typeof CodeEditor;
            if (!langToolsSrc) {
                console.warn("Autocompletion requires setting 'langToolSrc' in CodeEditor");
            } else {
                ensure([langToolsSrc], () => {
                    this.setBasicAutocompletion(this.options.enableBasicAutocompletion!);
                    this.setLiveAutocompletion(this.options.enableLiveAutocompletion!);
                    this.setSnippets(this.options.enableSnippets!);
                });
            }
        }
    }

    @enqueueIfNotLoaded
    aceResize(): void {
        this.getAce().resize();
    }

    @enqueueIfNotLoaded
    setValue(sourceCode: string, fakeUserChange?: any): void {
        // We need to wrap the ace call in these flags so any event listeners can know if this change
        // was done by us or by the user
        this.apiChange = !fakeUserChange;
        this.getAce().setValue(sourceCode, -1);
        this.apiChange = false;
    }

    @enqueueIfNotLoaded
    setAceOptions(options: any): void {
        this.getAce().setOptions(options);
    }

    // TODO: should this be setEditable?
    @enqueueIfNotLoaded
    setReadOnly(value: boolean): void {
        this.getAce().setReadOnly(value);
    }

    @enqueueIfNotLoaded
    setAceMode(aceMode: string | {aceMode: string}): void {
        if (aceMode.hasOwnProperty("aceMode")) {
            aceMode = (aceMode as any).aceMode;
        }
        this.getAce().getSession().setMode("ace/mode/" + aceMode);
    }

    getAceKeyboardHandler(): string {
        return this.getAce().$keybindingId;
    }

    @enqueueIfNotLoaded
    setAceKeyboardHandler(keyboardHandler: string | {aceName: string}): void {
        if (keyboardHandler.hasOwnProperty("aceName")) {
            keyboardHandler = (keyboardHandler as any).aceName;
        }
        this.getAce().setKeyboardHandler("ace/keyboard/" + keyboardHandler);
    }

    getAceMode(): any {
        return this.getAce().getSession().getMode();
    }

    @enqueueIfNotLoaded
    setAceTheme(theme: string | {aceName: string}): void {
        if (theme.hasOwnProperty("aceName")) {
            theme = (theme as any).aceName;
        }
        this.getAce().setTheme("ace/theme/" + theme);
    }

    getAceTheme(): string {
        return this.getAce().getTheme();
    }

    @enqueueIfNotLoaded
    setAceFontSize(fontSize: number): void {
        this.getAce().setOptions({
            fontSize: fontSize + "px"
        });
    }

    getAceFontSize(): string {
        return this.getAce().getFontSize();
    }

    @enqueueIfNotLoaded
    setAceTabSize(tabSize: number): void {
        this.getAce().setOptions({
            tabSize: tabSize
        });
    }

    getAceTabSize(): number {
        return this.getAce().getOption("tabSize");
    }

    @enqueueIfNotLoaded
    setAceLineNumberVisible(value: boolean): void {
        this.getAce().renderer.setShowGutter(value);
    }

    getAceLineNumberVisible(): boolean {
        return this.getAce().renderer.getShowGutter();
    }

    @enqueueIfNotLoaded
    setAcePrintMarginVisible(value: boolean): void {
        this.getAce().setShowPrintMargin(value);
    }

    getAcePrintMarginVisible(): boolean {
        return this.getAce().getShowPrintMargin();
    }

    @enqueueIfNotLoaded
    setAcePrintMarginSize(printMarginSize: number): void {
        this.getAce().setPrintMarginColumn(printMarginSize);
    }

    getAcePrintMarginSize(): number {
        return this.getAce().getPrintMarginColumn();
    }

    @enqueueIfNotLoaded
    setBasicAutocompletion(value: boolean): void {
        this.getAce().setOptions({
            enableBasicAutocompletion: value
        });
    }

    @enqueueIfNotLoaded
    setLiveAutocompletion(value: boolean): void {
        this.getAce().setOptions({
            enableLiveAutocompletion: value
        });
    }

    @enqueueIfNotLoaded
    setSnippets(value: boolean): void {
        this.getAce().setOptions({
            enableSnippets: value
        });
    }

    @enqueueIfNotLoaded
    setAnnotations(annotations: any[]): void {
        this.getAce().getSession().setAnnotations(annotations);
    }

    @enqueueIfNotLoaded
    setUseWrapMode(value: boolean): void {
        this.getAce().getSession().setUseWrapMode(value);
    }

    @enqueueIfNotLoaded
    setIndentedSoftWrap(value: boolean): void {
        this.getAce().setOption("indentedSoftWrap", value);
    }

    @enqueueIfNotLoaded
    blockScroll(): void {
        this.getAce().$blockScrolling = Infinity;
    }

    @enqueueIfNotLoaded
    setFoldStyle(foldStyle: string): void {
        this.getAce().getSession().setFoldStyle(foldStyle);
    }

    @enqueueIfNotLoaded
    setHighlightActiveLine(value: boolean): void {
        this.getAce().setHighlightActiveLine(value);
    }

    @enqueueIfNotLoaded
    setHighlightGutterLine(value: boolean): void {
        this.getAce().setHighlightGutterLine(value);
    }

    @enqueueIfNotLoaded
    setShowGutter(value: boolean): void {
        this.getAce().renderer.setShowGutter(value);
    }

    getScrollTop(): number {
        return this.getAce().getSession().getScrollTop();
    }

    @enqueueIfNotLoaded
    setScrollTop(value: number): void {
        this.getAce().getSession().setScrollTop(value);
    }

    @enqueueIfNotLoaded
    addMarker(startLine: number, startCol: number, endLine: number, endCol: number, ...args: any[]): any {
        const Range = (this.constructor as typeof CodeEditor).AceRange;
        return this.getAce().getSession().addMarker(new Range(startLine, startCol, endLine, endCol), ...args);
    }

    @enqueueIfNotLoaded
    removeMarker(marker: any): void {
        this.getAce().getSession().removeMarker(marker);
    }

    getRendererLineHeight(): number {
        return this.getAce().renderer.lineHeight;
    }

    getTextRange(startLine: number, startCol: number, endLine: number, endCol: number): string {
        const Range = (this.constructor as typeof CodeEditor).AceRange;
        return this.getAce().getSession().doc.getTextRange(new Range(startLine, startCol, endLine, endCol));
    }

    @enqueueIfNotLoaded
    setTextRange(startLine: number, startCol: number, endLine: number, endCol: number, text: string): void {
        const Range = (this.constructor as typeof CodeEditor).AceRange;
        this.getAce().getSession().replace(new Range(startLine, startCol, endLine, endCol), text);
    }

    @enqueueIfNotLoaded
    removeLine(line: number): void {
        const Range = (this.constructor as typeof CodeEditor).AceRange;
        this.getAce().getSession().getDocument().remove(new Range(line, 0, line + 1, 0));
    }

    @enqueueIfNotLoaded
    insertAtLine(line: number, str: string): void {
        let column = this.getAce().session.getLine(line - 1).length;
        this.getAce().gotoLine(line, column);
        this.insert(str);
    }

    @enqueueIfNotLoaded
    replaceLine(line: number, str: string): void {
        const Range = (this.constructor as typeof CodeEditor).AceRange;
        this.getAce().getSession().getDocument().replace(new Range(line, 0, line + 1, 0), str);
    }

    @enqueueIfNotLoaded
    addAceSessionEventListener(event: string, callback: (...args: any[]) => void): void {
        this.getAce().getSession().addEventListener(event, callback);
    }

    @enqueueIfNotLoaded
    addAceSessionChangeListener(callback: (...args: any[]) => void): void {
        this.addAceSessionEventListener("change", callback);
    }

    @enqueueIfNotLoaded
    addAceChangeListener(callback: Function): void {
        this.getAce().on("change", callback);
    }

    @enqueueIfNotLoaded
    addChangeListener(callback: Function): undefined {
        this.getAce().getSession().addEventListener("change", callback);
        // TODO We should return the handler to remove the listener here
        return undefined;
    }

    @enqueueIfNotLoaded
    addAceEventListener(...args: any[]): void {
        this.getAce().addEventListener(...args);
    }

    @enqueueIfNotLoaded
    focus(): void {
        this.getAce().focus();
    }

    @enqueueIfNotLoaded
    gotoEnd(): void {
        let editor = this.getAce();
        let editorRow = editor.session.getLength() - 1;
        let editorColumn = editor.session.getLine(editorRow).length;
        editor.gotoLine(editorRow + 1, editorColumn);
    }

    @enqueueIfNotLoaded
    setUndoManager(undoManager: any): void {
        this.getAce().getSession().setUndoManager(undoManager);
    }

    @enqueueIfNotLoaded
    setAceRendererOption(key: string, value: any): void {
        this.getAce().renderer.setOption(key, value);
    }

    // Inserts the text at the current cursor position
    @enqueueIfNotLoaded
    insert(text: string): void {
        this.getAce().insert(text);
    }

    // Appends the text at the end of the document
    @enqueueIfNotLoaded
    append(text: string): void {
        var lastRow = this.getAce().getSession().getLength() - 1;
        if (lastRow < 0) {
            lastRow = 0;
        }
        var lastRowLength = this.getAce().getSession().getLine(lastRow).length;
        var scrolledToBottom = this.getAce().isRowFullyVisible(lastRow);
        // console.log("Scroll to bottom ", scrolledToBottom);
        this.getAce().getSession().insert({
            row: lastRow,
            column: lastRowLength
        }, text);

        this.aceResize();

        if (scrolledToBottom) {
            // TODO: Include scroll lock option!
            // TODO: See if scrolling to bottom can be done better
            // TODO: for some reason the scroll bar height is not being updated, this needs to be fixed
            this.getAce().scrollToLine(this.getAce().getSession().getLength() - 1, true, true, function () {});
        }
    }

    copyTextToClipboard(): void {
        this.getAce().selectAll();
        this.getAce().focus();
        document.execCommand("copy");
    }
}


class StaticCodeHighlighterStyle extends StyleSheet {
    @styleRule
    hideActive = {
        " .ace_gutter-active-line": {
            display: "none",
        },
        " .ace_active-line": {
            display: "none",
        },
        " .ace_cursor": {
            display: "none",
        }
    }
}

// Interface declaration for proper typing
export interface StaticCodeHighlighter {
    get styleSheet(): StaticCodeHighlighterStyle;
}

@registerStyle(StaticCodeHighlighterStyle)
export class StaticCodeHighlighter extends CodeEditor {
    setOptions(options: CodeEditorOptions): void {
        options = Object.assign({
            fontSize: 13,
            readOnly: true,
            lineWrapping: true,
        }, options);
        super.setOptions(options);
    }

    extraNodeAttributes(attr: NodeAttributes): void {
        attr.addClass(this.styleSheet.hideActive);
    }
}
