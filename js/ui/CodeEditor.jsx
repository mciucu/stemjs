// Wrapper over the ace code editor, needs ace to be globally loaded
import {UI} from "UIBase";

UI.CodeEditor = class CodeEditor extends UI.Element {
    setOptions(options) {
        super.setOptions(options);
        if (this.ace) {
            this.applyAceOptions();
        }
    }

    applyAceOptions() {
        //set the language mode
        this.ace.getSession().setMode("ace/mode/" + (this.options.aceMode || "text"));

        let defaultOptions = {
            readOnly: false,
            aceTheme: "dawn",
            fontSize: 14,
            tabSize: 4,
            showLineNumber: true,
            showPrintMargin: false,
            printMarginSize: 80,
        };
        this.options = Object.assign(defaultOptions, this.options);
        this.setAceTheme(this.options.aceTheme);
        this.setAceFontSize(this.options.fontSize);
        this.setAceTabSize(this.options.tabSize);
        this.setAceLineNumberVisible(this.options.showLineNumber);
        this.setAcePrintMarginVisible(this.options.showPrintMargin);
        this.setAcePrintMarginSize(this.options.printMarginSize);
        this.setReadOnly(this.options.readOnly);


        //this.ace.setOptions({
        //    useSoftTabs: false
        //});

        if (this.options.numLines) {
            this.options.maxLines = this.options.minLines = this.options.numLines;
        }

        if (this.options.maxLines) {
            this.ace.setOptions({
                maxLines: this.options.maxLines
            });
        }

        if (this.options.minLines) {
            this.ace.setOptions({
                minLines: this.options.minLines
            });
        }

        this.ace.getSession().setUseWrapMode(this.options.lineWrapping || false);

        if (this.options.value) {
            this.setValue(this.options.value, -1);
        }
        let langTools ="/static/js/ext/ace/ext-language_tools.js";
        require([langTools], () => {
            this.setBasicAutocompletion(this.options.enableBasicAutocompletion);
            this.setLiveAutocompletion(this.options.enableLiveAutocompletion);
            this.setSnippets(this.options.enableSnippets);
        });
    }

    redraw() {
        if (this.ace) {
            this.ace.resize();
            return;
        }
        super.redraw();
    }

    onMount() {
        if (!window.ace) {
            console.error("You need to have the ace library loaded to get this working");
        }
        this.ace = ace.edit(this.node);

        // Removes some warnings
        this.ace.$blockScrolling = Infinity;
        this.applyAceOptions();

        //#voodoo was here to automatically redraw when unhiding
        //This Ace event listener might be useful in the future
        this.ace.renderer.$textLayer.addEventListener("changeCharacterSize", (event) => {
            this.ace.resize();
        });

        // Sometimes when the parent div resizes the ace editor doesn't fully update.
        this.addListener("resize", () => {
            this.ace.resize();
        });

        this.addListener("change", () => {
            this.ace.resize();
        });
    };

    setValue(sourceCode, fakeUserChange) {
        // We need to wrap the ace call in these flags so any event listeners can know if this change
        // was done by us or by the user
        this.apiChange = !fakeUserChange;
        this.ace.setValue(sourceCode, -1);
        this.apiChange = false;
    };

    getValue() {
        return this.ace.getValue();
    };

    getAce() {
        return this.ace;
    }

    // TODO: should this be setEditable?
    setReadOnly(value) {
        this.ace.setReadOnly(value);
    };

    setAceMode(aceMode) {
        if (aceMode.hasOwnProperty("aceMode")) {
            aceMode = aceMode.aceMode;
        }
        this.ace.getSession().setMode("ace/mode/" + aceMode);
    };
    getAceMode() {
        return this.ace.getSession().getMode();
    };

    setAceTheme(theme) {
        if (theme.hasOwnProperty("aceName")) {
            theme = theme.aceName;
        }
        this.ace.setTheme("ace/theme/" + theme);
    };

    getAceTheme() {
        return this.ace.getTheme();
    };

    setAceFontSize(fontSize) {
        this.ace.setOptions({
            fontSize: fontSize + "px"
        });
    };

    getAceFontSize() {
        return this.ace.getFontSize();
    };

    setAceTabSize(tabSize) {
        this.ace.setOptions({
            tabSize: tabSize
        });
    };

    getAceTabSize() {
        return this.ace.getOption("tabSize");
    };

    setAceLineNumberVisible(value) {
        this.ace.renderer.setShowGutter(value);
    };

    getAceLineNumberVisible() {
        return this.ace.renderer.getShowGutter();
    };

    setAcePrintMarginVisible(value) {
        this.ace.setShowPrintMargin(value);
    };

    getAcePrintMarginVisible() {
        return this.ace.getShowPrintMargin();
    };

    setAcePrintMarginSize(printMarginSize) {
        this.ace.setPrintMarginColumn(printMarginSize);
    };

    getAcePrintMarginSize() {
        return this.ace.getPrintMarginColumn();
    };

    setBasicAutocompletion(value) {
        this.ace.setOptions({
            enableBasicAutocompletion: value
        });
    }

    setLiveAutocompletion(value) {
        this.ace.setOptions({
            enableLiveAutocompletion: value
        });
    }

    setSnippets(value) {
        this.ace.setOptions({
            enableSnippets: value
        });
    }

    // Inserts the text at the current cursor position
    insert(text) {
        this.ace.insert(text);
    };

    // Appends the text at the end of the document
    append(text) {
        var lastRow = this.ace.getSession().getLength() - 1;
        if (lastRow < 0) {
            lastRow = 0;
        }
        var lastRowLength = this.ace.getSession().getLine(lastRow).length;
        var scrolledToBottom = this.ace.isRowFullyVisible(lastRow);
        // console.log("Scroll to bottom ", scrolledToBottom);
        this.ace.getSession().insert({
            row: lastRow,
            column: lastRowLength
        }, text);

        this.ace.resize();

        if (scrolledToBottom) {
            // TODO: Include scroll lock option!
            // TODO: See if scrolling to bottom can be done better
            // !!!!!TODO: for some reason the scroll bar height is not being updated, this needs to be fixed!!!!
            this.ace.scrollToLine(this.ace.getSession().getLength() - 1, true, true, function () {});
        }
    };
};

UI.StaticCodeHighlighter = class StaticCodeHighlighter extends UI.CodeEditor {
    onMount() {
        super.onMount();
        //default font
        this.ace.setFontSize(this.options.fontSize || this.getData("font-size", 13));
        // Make not editable by user
        this.setReadOnly(true);
        // Enable code wrapping
        this.ace.getSession().setUseWrapMode(true);
    }
};
