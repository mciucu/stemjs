// Wrapper over the Ace code editor, needs ace to be loaded
// TODO: should be renamed to AceCodeEditor?
import {UI} from "./UIBase";
import {StyleSheet, styleRule} from "./Style";
import {registerStyle} from "./style/Theme";
import {EnqueueableMethodMixin, enqueueIfNotLoaded} from "../base/EnqueueableMethodMixin";


class CodeEditor extends EnqueueableMethodMixin(UI.Element) {
    static requireAce(callback) {
        throw Error("You need to implement requireAce");
    }

    isLoaded() {
        return !!this.getAce();
    }

    setOptions(options) {
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

        super.setOptions(options);

        if (this.options.aceMode) {
            this.options.aceMode = this.options.aceMode.toLowerCase();
        }

        if (this.options.aceMode === "cpp" || this.options.aceMode === "c") {
            this.options.aceMode = "c_cpp";
        }

        if (this.getAce()) {
            this.applyAceOptions();
        }
    }

    redraw() {
        if (this.getAce()) {
            this.aceResize();
            this.applyRef();
            return;
        }
        super.redraw();
    }

    whenLoaded(callback) {
        if (this.isLoaded()) {
            callback();
        } else {
            this.addListenerOnce("aceReady", callback);
        }
    }

    onMount() {
        // Sometimes when the parent div resizes the ace editor doesn't fully update.
        this.addListener("resize", () => {
            this.aceResize();
        });

        this.addListener("change", () => {
            this.aceResize();
        });

        if (!window.ace) {
            this.constructor.requireAce(() => {
                this.onDelayedMount();
            });
            return;
        }
        this.onDelayedMount();
    }

    onDelayedMount() {
        this.ace = window.ace.edit(this.node);

        // Removes some warnings
        this.getAce().$blockScrolling = Infinity;

        this.resolveQueuedMethods();

        this.applyAceOptions();

        //#voodoo was here to automatically redraw when unhiding
        //This Ace event listener might be useful in the future
        this.getAce().renderer.$textLayer.addEventListener("changeCharacterSize", (event) => {
            this.aceResize();
        });
        this.dispatch("aceReady");
    }

    getAce() {
        return this.ace;
    }

    getValue() {
        return this.getAce().getValue();
    }

    @enqueueIfNotLoaded
    applyAceOptions() {
        //set the language mode
        this.setAceMode(this.options.aceMode);
        this.setAceKeyboardHandler(this.options.aceKeyboardHandler);
        this.setAceTheme(this.options.aceTheme);
        this.setAceFontSize(this.options.fontSize);
        this.setAceTabSize(this.options.tabSize);
        this.setAceLineNumberVisible(this.options.showLineNumber);
        this.setAcePrintMarginVisible(this.options.showPrintMargin);
        this.setAcePrintMarginSize(this.options.printMarginSize);
        this.setReadOnly(this.options.readOnly);
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
            let langTools ="/static/js/ext/ace/ext-language_tools.js";
            require([langTools], () => {
                this.setBasicAutocompletion(this.options.enableBasicAutocompletion);
                this.setLiveAutocompletion(this.options.enableLiveAutocompletion);
                this.setSnippets(this.options.enableSnippets);
            });
        }
    }

    @enqueueIfNotLoaded
    aceResize() {
        this.getAce().resize();
    }

    @enqueueIfNotLoaded
    setValue(sourceCode, fakeUserChange) {
        // We need to wrap the ace call in these flags so any event listeners can know if this change
        // was done by us or by the user
        this.apiChange = !fakeUserChange;
        this.getAce().setValue(sourceCode, -1);
        this.apiChange = false;
    }

    @enqueueIfNotLoaded
    setAceOptions(options) {
        this.getAce().setOptions(options);
    }

    // TODO: should this be setEditable?
    @enqueueIfNotLoaded
    setReadOnly(value) {
        this.getAce().setReadOnly(value);
    };

    @enqueueIfNotLoaded
    setAceMode(aceMode) {
        if (aceMode.hasOwnProperty("aceMode")) {
            aceMode = aceMode.aceMode;
        }
        this.getAce().getSession().setMode("ace/mode/" + aceMode);
    }

    getAceKeyboardHandler() {
        return this.getAce().$keybindingId;
    }

    @enqueueIfNotLoaded
    setAceKeyboardHandler(keyboardHandler) {
        if (keyboardHandler.hasOwnProperty("aceName")) {
            keyboardHandler = keyboardHandler.aceName;
        }
        this.getAce().setKeyboardHandler("ace/keyboard/" + keyboardHandler);
    }

    getAceMode() {
        return this.getAce().getSession().getMode();
    }

    @enqueueIfNotLoaded
    setAceTheme(theme) {
        if (theme.hasOwnProperty("aceName")) {
            theme = theme.aceName;
        }
        this.getAce().setTheme("ace/theme/" + theme);
    }

    getAceTheme() {
        return this.getAce().getTheme();
    }

    @enqueueIfNotLoaded
    setAceFontSize(fontSize) {
        this.getAce().setOptions({
            fontSize: fontSize + "px"
        });
    }

    getAceFontSize() {
        return this.getAce().getFontSize();
    }

    @enqueueIfNotLoaded
    setAceTabSize(tabSize) {
        this.getAce().setOptions({
            tabSize: tabSize
        });
    }

    getAceTabSize() {
        return this.getAce().getOption("tabSize");
    }

    @enqueueIfNotLoaded
    setAceLineNumberVisible(value) {
        this.getAce().renderer.setShowGutter(value);
    }

    getAceLineNumberVisible() {
        return this.getAce().renderer.getShowGutter();
    }

    @enqueueIfNotLoaded
    setAcePrintMarginVisible(value) {
        this.getAce().setShowPrintMargin(value);
    }

    getAcePrintMarginVisible() {
        return this.getAce().getShowPrintMargin();
    }

    @enqueueIfNotLoaded
    setAcePrintMarginSize(printMarginSize) {
        this.getAce().setPrintMarginColumn(printMarginSize);
    }

    getAcePrintMarginSize() {
        return this.getAce().getPrintMarginColumn();
    }

    @enqueueIfNotLoaded
    setBasicAutocompletion(value) {
        this.getAce().setOptions({
            enableBasicAutocompletion: value
        });
    }

    @enqueueIfNotLoaded
    setLiveAutocompletion(value) {
        this.getAce().setOptions({
            enableLiveAutocompletion: value
        });
    }

    @enqueueIfNotLoaded
    setSnippets(value) {
        this.getAce().setOptions({
            enableSnippets: value
        });
    }

    @enqueueIfNotLoaded
    setAnnotations(annotations) {
        this.getAce().getSession().setAnnotations(annotations);
    }

    @enqueueIfNotLoaded
    setUseWrapMode(value) {
        this.getAce().getSession().setUseWrapMode(value);
    }

    @enqueueIfNotLoaded
    setIndentedSoftWrap(value) {
        this.getAce().setOption("indentedSoftWrap", value);
    }

    @enqueueIfNotLoaded
    blockScroll() {
        this.getAce().$blockScrolling = Infinity;
    }

    @enqueueIfNotLoaded
    setFoldStyle(foldStyle) {
        this.getAce().getSession().setFoldStyle(foldStyle);
    }

    @enqueueIfNotLoaded
    setHighlightActiveLine(value) {
        this.getAce().setHighlightActiveLine(value);
    }

    @enqueueIfNotLoaded
    setHighlightGutterLine(value) {
        this.getAce().setHighlightGutterLine(value);
    }

    @enqueueIfNotLoaded
    setShowGutter(value) {
        this.getAce().renderer.setShowGutter(value);
    }

    getScrollTop() {
        return this.getAce().getSession().getScrollTop();
    }

    @enqueueIfNotLoaded
    setScrollTop(value) {
        this.getAce().getSession().setScrollTop(value);
    }

    @enqueueIfNotLoaded
    addMarker(startLine, startCol, endLine, endCol, ...args) {
        const Range = this.constructor.AceRange;
        return this.getAce().getSession().addMarker(new Range(startLine, startCol, endLine, endCol), ...args);
    }

    @enqueueIfNotLoaded
    removeMarker(marker) {
        this.getAce().getSession().removeMarker(marker);
    }

    getRendererLineHeight() {
        return this.getAce().renderer.lineHeight;
    }

    getTextRange(startLine, startCol, endLine, endCol) {
        const Range = this.constructor.AceRange;
        return this.getAce().getSession().doc.getTextRange(new Range(startLine, startCol, endLine, endCol));
    }

    @enqueueIfNotLoaded
    setTextRange(startLine, startCol, endLine, endCol, text) {
        const Range = this.constructor.AceRange;
        this.getAce().getSession().replace(new Range(startLine, startCol, endLine, endCol), text);
    }

    @enqueueIfNotLoaded
    removeLine(line) {
        const Range = this.constructor.AceRange;
        this.getAce().getSession().getDocument().remove(new Range(line, 0, line + 1, 0));
    }

    @enqueueIfNotLoaded
    insertAtLine(line, str) {
        let column = this.getAce().session.getLine(line - 1).length;
        this.getAce().gotoLine(line, column);
        this.insert(str);
    }

    @enqueueIfNotLoaded
    replaceLine(line, str) {
        const Range = this.constructor.AceRange;
        this.getAce().getSession().getDocument().replace(new Range(line, 0, line + 1, 0), str);
    }

    @enqueueIfNotLoaded
    addAceSessionEventListener(event, callback) {
        this.getAce().getSession().addEventListener(event, callback);
    }

    @enqueueIfNotLoaded
    addAceSessionChangeListener(callback) {
        this.addAceSessionEventListener("change", callback);
    }

    @enqueueIfNotLoaded
    addAceChangeListener(callback) {
        this.getAce().on("change", callback);
    }

    @enqueueIfNotLoaded
    addAceEventListener() {
        this.getAce().addEventListener(...arguments);
    }

    @enqueueIfNotLoaded
    focus() {
        this.getAce().focus();
    }

    @enqueueIfNotLoaded
    gotoEnd() {
        let editor = this.getAce();
        let editorRow = editor.session.getLength() - 1;
        let editorColumn = editor.session.getLine(editorRow).length;
        editor.gotoLine(editorRow + 1, editorColumn);
    }

    @enqueueIfNotLoaded
    setUndoManager(undoManager) {
        this.getAce().getSession().setUndoManager(undoManager);
    }

    @enqueueIfNotLoaded
    setAceRendererOption(key, value) {
        this.getAce().renderer.setOption(key, value);
    }

    // Inserts the text at the current cursor position
    @enqueueIfNotLoaded
    insert(text) {
        this.getAce().insert(text);
    }

    // Appends the text at the end of the document
    @enqueueIfNotLoaded
    append(text) {
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

    copyTextToClipboard() {
        this.getAce().selectAll();
        this.getAce().focus();
        document.execCommand('copy');
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


@registerStyle(StaticCodeHighlighterStyle)
class StaticCodeHighlighter extends CodeEditor {
    setOptions(options) {
        options = Object.assign({
            fontSize: 13,
            readOnly: true,
            lineWrapping: true,
        }, options);
        super.setOptions(options);
    }

    extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.hideActive)
    }
}

export {CodeEditor, StaticCodeHighlighter};
