define(["UIBase", "DOMAttributes", "UIPrimitives"], function (_UIBase, _DOMAttributes) {
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

    _UIBase.UI.Form = function (_UI$Element) {
        _inherits(Form, _UI$Element);

        function Form() {
            _classCallCheck(this, Form);

            return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
            key: "getPrimitiveTag",
            value: function getPrimitiveTag() {
                return "form";
            }
        }, {
            key: "getDOMAttributes",
            value: function getDOMAttributes() {
                var attr = _get(Form.prototype.__proto__ || Object.getPrototypeOf(Form.prototype), "getDOMAttributes", this).call(this);
                attr.addClass("form form-horizontal");
                return attr;
            }
        }, {
            key: "onMount",
            value: function onMount() {
                // Insert here code to not refresh page
            }
        }]);

        return Form;
    }(_UIBase.UI.Element);

    _UIBase.UI.Input = function (_UI$Element2) {
        _inherits(Input, _UI$Element2);

        function Input() {
            _classCallCheck(this, Input);

            return _possibleConstructorReturn(this, (Input.__proto__ || Object.getPrototypeOf(Input)).apply(this, arguments));
        }

        _createClass(Input, [{
            key: "getPrimitiveTag",
            value: function getPrimitiveTag() {
                return "input";
            }
        }, {
            key: "getDOMAttributes",
            value: function getDOMAttributes() {
                var attr = _get(Input.prototype.__proto__ || Object.getPrototypeOf(Input.prototype), "getDOMAttributes", this).call(this);

                var type = this.getInputType();
                if (type) {
                    attr.setAttribute("type", type);
                }

                return attr;
            }
        }, {
            key: "redraw",
            value: function redraw() {
                _get(Input.prototype.__proto__ || Object.getPrototypeOf(Input.prototype), "redraw", this).call(this);
                if (this.options.hasOwnProperty("value")) {
                    this.setValue(this.options.value);
                }
            }
        }, {
            key: "getValue",
            value: function getValue() {
                return this.node.value;
            }
        }, {
            key: "setValue",
            value: function setValue(newValue) {
                this.node.value = newValue;
            }
        }, {
            key: "getInputType",
            value: function getInputType() {
                // Must be overloaded
                return null;
            }
        }, {
            key: "onInput",
            value: function onInput(callback) {
                this.addDOMListener("input change", callback);
            }
        }, {
            key: "onKeyUp",
            value: function onKeyUp(callback) {
                this.addDOMListener("keyup", callback);
            }
        }]);

        return Input;
    }(_UIBase.UI.Element);

    _UIBase.UI.FormControl = function (_UI$Input) {
        _inherits(FormControl, _UI$Input);

        function FormControl() {
            _classCallCheck(this, FormControl);

            return _possibleConstructorReturn(this, (FormControl.__proto__ || Object.getPrototypeOf(FormControl)).apply(this, arguments));
        }

        _createClass(FormControl, [{
            key: "getDOMAttributes",
            value: function getDOMAttributes() {
                var attr = _get(FormControl.prototype.__proto__ || Object.getPrototypeOf(FormControl.prototype), "getDOMAttributes", this).call(this);
                attr.addClass("form-control");
                return attr;
            }
        }]);

        return FormControl;
    }(_UIBase.UI.Input);

    _UIBase.UI.FormSettingsGroup = function (_UI$Element3) {
        _inherits(FormSettingsGroup, _UI$Element3);

        function FormSettingsGroup() {
            _classCallCheck(this, FormSettingsGroup);

            return _possibleConstructorReturn(this, (FormSettingsGroup.__proto__ || Object.getPrototypeOf(FormSettingsGroup)).apply(this, arguments));
        }

        _createClass(FormSettingsGroup, [{
            key: "setOptions",
            value: function setOptions(options) {
                _get(FormSettingsGroup.prototype.__proto__ || Object.getPrototypeOf(FormSettingsGroup.prototype), "setOptions", this).call(this, options);

                this.options.labelWidth = this.options.labelWidth || "41%";
                this.options.contentWidth = this.options.contentWidth || "59%";
            }
        }, {
            key: "getDOMAttributes",
            value: function getDOMAttributes() {
                var attr = _get(FormSettingsGroup.prototype.__proto__ || Object.getPrototypeOf(FormSettingsGroup.prototype), "getDOMAttributes", this).call(this);
                attr.addClass("form-group");
                return attr;
            }
        }, {
            key: "getLabelStyle",
            value: function getLabelStyle() {
                return {
                    float: "left",
                    display: "inline-block",
                    height: "32px",
                    "line-height": "32px"
                };
            }
        }, {
            key: "getContentStyle",
            value: function getContentStyle() {
                return {
                    float: "left",
                    display: "inline-block",
                    "margin-top": "1px",
                    "margin-bottom": "1px",
                    "min-height": "30px"
                };
            }
        }, {
            key: "renderHTML",
            value: function renderHTML() {
                var labelStyle = Object.assign(this.getLabelStyle(), { width: this.options.labelWidth });
                labelStyle = Object.assign(labelStyle, this.options.labelStyle);
                var contentStyle = Object.assign(this.getContentStyle(), { width: this.options.contentWidth });
                contentStyle = Object.assign(contentStyle, this.options.contentStyle);
                var label = this.options.label ? _UIBase.UI.createElement(
                    "div",
                    { style: labelStyle },
                    this.options.label
                ) : null;
                var content = _UIBase.UI.createElement(
                    "div",
                    { style: contentStyle },
                    this.options.children
                );
                if (this.options.contentFirst) {
                    return [content, label];
                }
                return [label, content];
            }
        }]);

        return FormSettingsGroup;
    }(_UIBase.UI.Element);

    _UIBase.UI.FormGroup = function (_UI$Element4) {
        _inherits(FormGroup, _UI$Element4);

        function FormGroup() {
            _classCallCheck(this, FormGroup);

            return _possibleConstructorReturn(this, (FormGroup.__proto__ || Object.getPrototypeOf(FormGroup)).apply(this, arguments));
        }

        _createClass(FormGroup, [{
            key: "setOptions",
            value: function setOptions(options) {
                _get(FormGroup.prototype.__proto__ || Object.getPrototypeOf(FormGroup.prototype), "setOptions", this).call(this, options);
                this.options.labelWidth = this.options.labelWidth || "16%";
                this.options.contentWidth = this.options.contentWidth || "32%";
                this.options.errorFieldWidth = this.options.errorFieldWidth || "48%";
            }
        }, {
            key: "getDOMAttributes",
            value: function getDOMAttributes() {
                var attr = _get(FormGroup.prototype.__proto__ || Object.getPrototypeOf(FormGroup.prototype), "getDOMAttributes", this).call(this);
                attr.addClass("form-group");
                return attr;
            }
        }, {
            key: "getDefaultStyle",
            value: function getDefaultStyle() {
                return {
                    float: "left",
                    position: "relative",
                    "min-height": "1px",
                    "padding-right": "15px",
                    "padding-left": "15px"
                };
            }
        }, {
            key: "renderHTML",
            value: function renderHTML() {
                var labelStyle = Object.assign(this.getDefaultStyle(), { width: this.options.labelWidth });
                labelStyle = Object.assign(labelStyle, this.options.style);
                var contentStyle = Object.assign(this.getDefaultStyle(), { width: this.options.contentWidth });
                contentStyle = Object.assign(contentStyle, this.options.style);
                var errorFieldStyle = Object.assign(this.getDefaultStyle(), { width: this.options.errorFieldWidth });
                return [this.options.label ? _UIBase.UI.createElement(
                    "label",
                    { className: "control-label", style: labelStyle },
                    this.options.label
                ) : null, _UIBase.UI.createElement(
                    "div",
                    { style: contentStyle },
                    this.options.children
                ), _UIBase.UI.createElement("span", { ref: "errorField", style: errorFieldStyle })];
            }
        }, {
            key: "setError",
            value: function setError(errorMessage) {
                this.errorField.node.textContent = errorMessage;
                this.addClass("has-error");
            }
        }, {
            key: "removeError",
            value: function removeError() {
                this.errorField.node.textContent = "";
                this.removeClass("has-error");
            }
        }]);

        return FormGroup;
    }(_UIBase.UI.Element);

    _UIBase.UI.Input.domAttributesMap = (0, _DOMAttributes.CreateAllowedAttributesMap)(_UIBase.UI.Element.domAttributesMap, [["autocomplete"], ["autofocus", { noValue: true }], ["formaction"], ["maxLength", { domName: "maxlength" }], ["minLength", { domName: "minlength" }], ["name"], ["placeholder"], ["readonly"], ["required"], ["value"]]);

    _UIBase.UI.SubmitInput = function (_UI$Input2) {
        _inherits(SubmitInput, _UI$Input2);

        function SubmitInput() {
            _classCallCheck(this, SubmitInput);

            return _possibleConstructorReturn(this, (SubmitInput.__proto__ || Object.getPrototypeOf(SubmitInput)).apply(this, arguments));
        }

        _createClass(SubmitInput, [{
            key: "getInputType",
            value: function getInputType() {
                return "submit";
            }
        }]);

        return SubmitInput;
    }(_UIBase.UI.Input);

    _UIBase.UI.SubmitInput.domAttributesMap = (0, _DOMAttributes.CreateAllowedAttributesMap)(_UIBase.UI.Element.domAttributesMap, [["formenctype"], ["formmethod"], ["formnovalidate"], ["formtarget"]]);

    _UIBase.UI.TextInputInterface = function (BaseInputClass) {
        return function (_BaseInputClass) {
            _inherits(TextInput, _BaseInputClass);

            function TextInput() {
                _classCallCheck(this, TextInput);

                return _possibleConstructorReturn(this, (TextInput.__proto__ || Object.getPrototypeOf(TextInput)).apply(this, arguments));
            }

            _createClass(TextInput, [{
                key: "getInputType",
                value: function getInputType() {
                    return "text";
                }
            }]);

            return TextInput;
        }(BaseInputClass);
    };

    _UIBase.UI.TextInput = _UIBase.UI.TextInputInterface(_UIBase.UI.Input);
    _UIBase.UI.FormTextInput = _UIBase.UI.TextInputInterface(_UIBase.UI.FormControl);

    _UIBase.UI.NumberInputInterface = function (BaseInputClass) {
        var numberInput = function (_BaseInputClass2) {
            _inherits(NumberInput, _BaseInputClass2);

            function NumberInput() {
                _classCallCheck(this, NumberInput);

                return _possibleConstructorReturn(this, (NumberInput.__proto__ || Object.getPrototypeOf(NumberInput)).apply(this, arguments));
            }

            _createClass(NumberInput, [{
                key: "getInputType",
                value: function getInputType() {
                    return "number";
                }
            }, {
                key: "getValue",
                value: function getValue() {
                    var val = _get(NumberInput.prototype.__proto__ || Object.getPrototypeOf(NumberInput.prototype), "getValue", this).call(this);
                    return parseInt(val) || parseFloat(val);
                }
            }]);

            return NumberInput;
        }(BaseInputClass);

        numberInput.domAttributesMap = (0, _DOMAttributes.CreateAllowedAttributesMap)(_UIBase.UI.Element.domAttributesMap, [["min"], ["max"], ["step"]]);
        return numberInput;
    };

    _UIBase.UI.NumberInput = _UIBase.UI.NumberInputInterface(_UIBase.UI.Input);
    _UIBase.UI.FormNumberInput = _UIBase.UI.NumberInputInterface(_UIBase.UI.FormControl);

    _UIBase.UI.EmailInputInterface = function (BaseInputClass) {
        return function (_BaseInputClass3) {
            _inherits(EmailInput, _BaseInputClass3);

            function EmailInput() {
                _classCallCheck(this, EmailInput);

                return _possibleConstructorReturn(this, (EmailInput.__proto__ || Object.getPrototypeOf(EmailInput)).apply(this, arguments));
            }

            _createClass(EmailInput, [{
                key: "getInputType",
                value: function getInputType() {
                    return "email";
                }
            }]);

            return EmailInput;
        }(BaseInputClass);
    };

    _UIBase.UI.EmailInput = _UIBase.UI.EmailInputInterface(_UIBase.UI.Input);
    _UIBase.UI.FormEmailInput = _UIBase.UI.EmailInputInterface(_UIBase.UI.FormControl);

    _UIBase.UI.PasswordInputInterface = function (BaseInputClass) {
        return function (_BaseInputClass4) {
            _inherits(PasswordInput, _BaseInputClass4);

            function PasswordInput() {
                _classCallCheck(this, PasswordInput);

                return _possibleConstructorReturn(this, (PasswordInput.__proto__ || Object.getPrototypeOf(PasswordInput)).apply(this, arguments));
            }

            _createClass(PasswordInput, [{
                key: "getInputType",
                value: function getInputType() {
                    return "password";
                }
            }]);

            return PasswordInput;
        }(BaseInputClass);
    };

    _UIBase.UI.PasswordInput = _UIBase.UI.PasswordInputInterface(_UIBase.UI.Input);
    _UIBase.UI.FormPasswordInput = _UIBase.UI.PasswordInputInterface(_UIBase.UI.FormControl);

    _UIBase.UI.FileInputInterface = function (BaseInputClass) {
        var fileInput = function (_BaseInputClass5) {
            _inherits(FileInput, _BaseInputClass5);

            function FileInput() {
                _classCallCheck(this, FileInput);

                return _possibleConstructorReturn(this, (FileInput.__proto__ || Object.getPrototypeOf(FileInput)).apply(this, arguments));
            }

            _createClass(FileInput, [{
                key: "getInputType",
                value: function getInputType() {
                    return "file";
                }
            }, {
                key: "getFiles",
                value: function getFiles() {
                    return this.node.files;
                }
            }, {
                key: "getFile",
                value: function getFile() {
                    // TODO: this is valid only if multipleFiles is false
                    return this.getFiles()[0];
                }
            }]);

            return FileInput;
        }(BaseInputClass);

        fileInput.domAttributesMap = (0, _DOMAttributes.CreateAllowedAttributesMap)(_UIBase.UI.Element.domAttributesMap, [["multipleFiles", { domName: "multiple", noValue: true }], ["fileTypes", { domName: "accept" }]]);
        return fileInput;
    };

    _UIBase.UI.FileInput = _UIBase.UI.FileInputInterface(_UIBase.UI.Input);
    _UIBase.UI.FormFileInput = _UIBase.UI.FileInputInterface(_UIBase.UI.FormControl);

    _UIBase.UI.CheckboxInput = function (_UI$Input3) {
        _inherits(CheckboxInput, _UI$Input3);

        function CheckboxInput() {
            _classCallCheck(this, CheckboxInput);

            return _possibleConstructorReturn(this, (CheckboxInput.__proto__ || Object.getPrototypeOf(CheckboxInput)).apply(this, arguments));
        }

        _createClass(CheckboxInput, [{
            key: "setOptions",
            value: function setOptions(options) {
                options.style = options.style || {};
                options.style = Object.assign({}, options.style);
                _get(CheckboxInput.prototype.__proto__ || Object.getPrototypeOf(CheckboxInput.prototype), "setOptions", this).call(this, options);
            }
        }, {
            key: "getInputType",
            value: function getInputType() {
                return "checkbox";
            }
        }, {
            key: "getValue",
            value: function getValue() {
                return this.node.checked;
            }
        }, {
            key: "setValue",
            value: function setValue(newValue) {
                this.node.checked = newValue;
            }
        }]);

        return CheckboxInput;
    }(_UIBase.UI.Input);

    _UIBase.UI.CheckboxInput.domAttributesMap = (0, _DOMAttributes.CreateAllowedAttributesMap)(_UIBase.UI.Element.domAttributesMap, [["checked", { noValue: true }]]);

    _UIBase.UI.TextArea = function (_UI$Element5) {
        _inherits(TextArea, _UI$Element5);

        function TextArea() {
            _classCallCheck(this, TextArea);

            return _possibleConstructorReturn(this, (TextArea.__proto__ || Object.getPrototypeOf(TextArea)).apply(this, arguments));
        }

        _createClass(TextArea, [{
            key: "getPrimitiveTag",
            value: function getPrimitiveTag() {
                return "textarea";
            }
        }, {
            key: "applyDOMAttributes",
            value: function applyDOMAttributes() {
                _get(TextArea.prototype.__proto__ || Object.getPrototypeOf(TextArea.prototype), "applyDOMAttributes", this).call(this);
                this.node.readOnly = this.options.readOnly || false;
            }
        }, {
            key: "setReadOnly",
            value: function setReadOnly(value) {
                this.options.readOnly = value;
                this.node.readOnly = value;
            }
        }, {
            key: "getValue",
            value: function getValue() {
                return this.node.value;
            }
        }, {
            key: "redraw",
            value: function redraw() {
                _get(TextArea.prototype.__proto__ || Object.getPrototypeOf(TextArea.prototype), "redraw", this).call(this);
                if (this.options.value) {
                    this.node.value = this.options.value + "";
                }
            }
        }, {
            key: "setValue",
            value: function setValue(value) {
                this.options.value = value;
                this.node.value = value;
            }
        }]);

        return TextArea;
    }(_UIBase.UI.Element);

    _UIBase.UI.InputField = function (_UI$Element6) {
        _inherits(InputField, _UI$Element6);

        function InputField() {
            _classCallCheck(this, InputField);

            return _possibleConstructorReturn(this, (InputField.__proto__ || Object.getPrototypeOf(InputField)).apply(this, arguments));
        }

        _createClass(InputField, [{
            key: "renderHTML",
            value: function renderHTML() {}
        }]);

        return InputField;
    }(_UIBase.UI.Element);

    _UIBase.UI.Slider = function (_UI$Element7) {
        _inherits(Slider, _UI$Element7);

        function Slider() {
            _classCallCheck(this, Slider);

            return _possibleConstructorReturn(this, (Slider.__proto__ || Object.getPrototypeOf(Slider)).apply(this, arguments));
        }

        return Slider;
    }(_UIBase.UI.Element);

    _UIBase.UI.Select = function (_UI$Element8) {
        _inherits(Select, _UI$Element8);

        function Select() {
            _classCallCheck(this, Select);

            return _possibleConstructorReturn(this, (Select.__proto__ || Object.getPrototypeOf(Select)).apply(this, arguments));
        }

        _createClass(Select, [{
            key: "getPrimitiveTag",
            value: function getPrimitiveTag() {
                return "select";
            }
        }, {
            key: "renderHTML",
            value: function renderHTML() {
                this.givenOptions = this.options.options || [];
                var selectOptions = [];

                for (var i = 0; i < this.givenOptions.length; i += 1) {
                    var options = {
                        key: i
                    };
                    if (this.givenOptions[i] == this.options.selected) {
                        options.selected = true;
                    }
                    selectOptions.push(_UIBase.UI.createElement(
                        "option",
                        options,
                        this.givenOptions[i].toString()
                    ));
                }

                return selectOptions;
            }
        }, {
            key: "get",
            value: function get() {
                var selectedIndex = this.getIndex();
                return this.givenOptions[selectedIndex];
            }
        }, {
            key: "set",
            value: function set(value) {
                for (var i = 0; i < this.givenOptions.length; i++) {
                    if (this.givenOptions[i] === value) {
                        this.setIndex(i);
                        return;
                    }
                }
                console.error("Can't set the select option ", value, "\nAvailable options: ", this.givenOptions);
            }
        }, {
            key: "getIndex",
            value: function getIndex() {
                return this.node.selectedIndex;
            }
        }, {
            key: "setIndex",
            value: function setIndex(index) {
                this.node.selectedIndex = index;
                this.options.selected = this.givenOptions[index];
            }
        }, {
            key: "redraw",
            value: function redraw() {
                _get(Select.prototype.__proto__ || Object.getPrototypeOf(Select.prototype), "redraw", this).call(this);
                if (this.options.selected) {
                    this.set(this.options.selected);
                }
            }
        }]);

        return Select;
    }(_UIBase.UI.Element);
});
