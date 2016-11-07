define(["./UIBase"], function (_UIBase) {
    "use strict";

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    var _get = function get(object, property, receiver) {
        if (object === null) object = Function.prototype;
        var desc = Object.getOwnPropertyDescriptor(object, property);

        if (desc === undefined) {
            var parent = Object.getPrototypeOf(object);

            if (parent === null) {
                return undefined;
            } else {
                return get(parent, property, receiver);
            }
        } else if ("value" in desc) {
            return desc.value;
        } else {
            var getter = desc.get;

            if (getter === undefined) {
                return undefined;
            }

            return getter.call(receiver);
        }
    };

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    _UIBase.UI.CodeEditor = function (_UI$Element) {
        _inherits(CodeEditor, _UI$Element);

        function CodeEditor() {
            _classCallCheck(this, CodeEditor);

            return _possibleConstructorReturn(this, (CodeEditor.__proto__ || Object.getPrototypeOf(CodeEditor)).apply(this, arguments));
        }

        _createClass(CodeEditor, [{
            key: "setOptions",
            value: function setOptions(options) {
                _get(CodeEditor.prototype.__proto__ || Object.getPrototypeOf(CodeEditor.prototype), "setOptions", this).call(this, options);
                if (this.ace) {
                    this.applyAceOptions();
                }
            }
        }, {
            key: "applyAceOptions",
            value: function applyAceOptions() {
                var _this2 = this;

                //set the language mode
                this.ace.getSession().setMode("ace/mode/" + (this.options.aceMode || "text"));

                var defaultOptions = {
                    readOnly: false,
                    aceTheme: "dawn",
                    fontSize: 14,
                    tabSize: 4,
                    showLineNumber: true,
                    showPrintMargin: false,
                    printMarginSize: 80
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
                var langTools = "/static/js/ext/ace/ext-language_tools.js";
                require([langTools], function () {
                    _this2.setBasicAutocompletion(_this2.options.enableBasicAutocompletion);
                    _this2.setLiveAutocompletion(_this2.options.enableLiveAutocompletion);
                    _this2.setSnippets(_this2.options.enableSnippets);
                });
            }
        }, {
            key: "redraw",
            value: function redraw() {
                if (this.ace) {
                    this.ace.resize();
                    return;
                }
                _get(CodeEditor.prototype.__proto__ || Object.getPrototypeOf(CodeEditor.prototype), "redraw", this).call(this);
            }
        }, {
            key: "onMount",
            value: function onMount() {
                var _this3 = this;

                if (!window.ace) {
                    console.error("You need to have the ace library loaded to get this working");
                }
                this.ace = ace.edit(this.node);

                // Removes some warnings
                this.ace.$blockScrolling = Infinity;
                this.applyAceOptions();

                //#voodoo was here to automatically redraw when unhiding
                //This Ace event listener might be useful in the future
                this.ace.renderer.$textLayer.addEventListener("changeCharacterSize", function (event) {
                    _this3.ace.resize();
                });

                // Sometimes when the parent div resizes the ace editor doesn't fully update.
                this.addListener("resize", function () {
                    _this3.ace.resize();
                });

                this.addListener("change", function () {
                    _this3.ace.resize();
                });
            }
        }, {
            key: "setValue",
            value: function setValue(sourceCode, fakeUserChange) {
                // We need to wrap the ace call in these flags so any event listeners can know if this change
                // was done by us or by the user
                this.apiChange = !fakeUserChange;
                this.ace.setValue(sourceCode, -1);
                this.apiChange = false;
            }
        }, {
            key: "getValue",
            value: function getValue() {
                return this.ace.getValue();
            }
        }, {
            key: "getAce",
            value: function getAce() {
                return this.ace;
            }
        }, {
            key: "setReadOnly",
            value: function setReadOnly(value) {
                this.ace.setReadOnly(value);
            }
        }, {
            key: "setAceMode",
            value: function setAceMode(aceMode) {
                if (aceMode.hasOwnProperty("aceMode")) {
                    aceMode = aceMode.aceMode;
                }
                this.ace.getSession().setMode("ace/mode/" + aceMode);
            }
        }, {
            key: "getAceMode",
            value: function getAceMode() {
                return this.ace.getSession().getMode();
            }
        }, {
            key: "setAceTheme",
            value: function setAceTheme(theme) {
                if (theme.hasOwnProperty("aceName")) {
                    theme = theme.aceName;
                }
                this.ace.setTheme("ace/theme/" + theme);
            }
        }, {
            key: "getAceTheme",
            value: function getAceTheme() {
                return this.ace.getTheme();
            }
        }, {
            key: "setAceFontSize",
            value: function setAceFontSize(fontSize) {
                this.ace.setOptions({
                    fontSize: fontSize + "px"
                });
            }
        }, {
            key: "getAceFontSize",
            value: function getAceFontSize() {
                return this.ace.getFontSize();
            }
        }, {
            key: "setAceTabSize",
            value: function setAceTabSize(tabSize) {
                this.ace.setOptions({
                    tabSize: tabSize
                });
            }
        }, {
            key: "getAceTabSize",
            value: function getAceTabSize() {
                return this.ace.getOption("tabSize");
            }
        }, {
            key: "setAceLineNumberVisible",
            value: function setAceLineNumberVisible(value) {
                this.ace.renderer.setShowGutter(value);
            }
        }, {
            key: "getAceLineNumberVisible",
            value: function getAceLineNumberVisible() {
                return this.ace.renderer.getShowGutter();
            }
        }, {
            key: "setAcePrintMarginVisible",
            value: function setAcePrintMarginVisible(value) {
                this.ace.setShowPrintMargin(value);
            }
        }, {
            key: "getAcePrintMarginVisible",
            value: function getAcePrintMarginVisible() {
                return this.ace.getShowPrintMargin();
            }
        }, {
            key: "setAcePrintMarginSize",
            value: function setAcePrintMarginSize(printMarginSize) {
                this.ace.setPrintMarginColumn(printMarginSize);
            }
        }, {
            key: "getAcePrintMarginSize",
            value: function getAcePrintMarginSize() {
                return this.ace.getPrintMarginColumn();
            }
        }, {
            key: "setBasicAutocompletion",
            value: function setBasicAutocompletion(value) {
                this.ace.setOptions({
                    enableBasicAutocompletion: value
                });
            }
        }, {
            key: "setLiveAutocompletion",
            value: function setLiveAutocompletion(value) {
                this.ace.setOptions({
                    enableLiveAutocompletion: value
                });
            }
        }, {
            key: "setSnippets",
            value: function setSnippets(value) {
                this.ace.setOptions({
                    enableSnippets: value
                });
            }
        }, {
            key: "insert",
            value: function insert(text) {
                this.ace.insert(text);
            }
        }, {
            key: "append",
            value: function append(text) {
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
            }
        }]);

        return CodeEditor;
    }(_UIBase.UI.Element);

    _UIBase.UI.StaticCodeHighlighter = function (_UI$CodeEditor) {
        _inherits(StaticCodeHighlighter, _UI$CodeEditor);

        function StaticCodeHighlighter() {
            _classCallCheck(this, StaticCodeHighlighter);

            return _possibleConstructorReturn(this, (StaticCodeHighlighter.__proto__ || Object.getPrototypeOf(StaticCodeHighlighter)).apply(this, arguments));
        }

        _createClass(StaticCodeHighlighter, [{
            key: "onMount",
            value: function onMount() {
                _get(StaticCodeHighlighter.prototype.__proto__ || Object.getPrototypeOf(StaticCodeHighlighter.prototype), "onMount", this).call(this);
                //default font
                this.ace.setFontSize(this.options.fontSize || this.getData("font-size", 13));
                // Make not editable by user
                this.setReadOnly(true);
                // Enable code wrapping
                this.ace.getSession().setUseWrapMode(true);
            }
        }]);

        return StaticCodeHighlighter;
    }(_UIBase.UI.CodeEditor);
});
