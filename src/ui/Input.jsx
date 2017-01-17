// TODO: this file was started with a lot of old patterns, that need to be updated
// TODO: remove everything from UI namespace, export instead
// TODO: need a major clean-up
import {StyleSet} from "./Style";
import {styleRule} from "../decorators/Style";
import {UI} from "./UIBase";
import {CreateNodeAttributesMap} from "./NodeAttributes";

class FormStyle extends StyleSet {
    @styleRule
    formControl = {
        display: "block",
        width: "100%",
        height: "34px",
        padding: "6px 12px",
        fontSize: "14px",
        lineHeight: "1.42857143",
        color: "#555",
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        borderRadius: "4px",
        boxShadow: "inset 0 1px 1px rgba(0, 0, 0, .075)",
        transition: "border-color ease-in-out .15s, box-shadow ease-in-out .15s",
        ":focus": {
            borderColor: "#66afe9",
            outline: "0",
            boxShadow: "inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102, 175, 233, .6)",
        },
        "[disabled]": {
          opacity: "1",
          cursor: "not-allowed",
        },
        "[readonly]": {
          opacity: "1",
        },
    };

    @styleRule
    formGroup = {
        marginBottom: "15px",
    };

    @styleRule
    hasError = {
        color: "#a94442",
    }
}

class Form extends UI.Primitive("form") {
    getNodeAttributes() {
        let attr = super.getNodeAttributes();
        attr.addClass("form form-horizontal");
        return attr;
    }

    onMount() {
        // Insert here code to not refresh page
    }
}

class Input extends UI.Primitive("input") {
    getNodeAttributes() {
        let attr = super.getNodeAttributes();

        let type = this.getInputType();
        if (type) {
            attr.setAttribute("type", type);
        }

        return attr;
    }

    redraw() {
        super.redraw();
        if (this.options.hasOwnProperty("value")) {
            this.setValue(this.options.value);
        }
    }

    getValue() {
        return this.node.value;
    }

    setValue(newValue) {
        this.node.value = newValue;
    }

    getInputType() {
        // Must be overloaded
        return null;
    }

    onInput(callback) {
        this.addNodeListener("input change", callback);
    }

    onKeyUp(callback) {
        this.addNodeListener("keyup", callback);
    }
}

class FormControl extends Input {
    static styleSet = FormStyle.getInstance();

    getNodeAttributes() {
        let attr = super.getNodeAttributes();
        attr.addClass(this.getStyleSet().formControl);
        return attr;
    }

    getStyleSet() {
        return this.options.styleSet || this.constructor.styleSet;
    }
}

class FormSettingsGroup extends UI.Element {
    static styleSet = FormStyle.getInstance();

    setOptions(options) {
        super.setOptions(options);

        this.options.labelWidth = this.options.labelWidth || "41%";
        this.options.contentWidth = this.options.contentWidth || "59%";
    }

    getNodeAttributes() {
        let attr = super.getNodeAttributes();
        attr.addClass(this.getStyleSet().FormGroup);
        return attr;
    }

    getStyleSet() {
        return this.options.styleSet || this.constructor.styleSet;
    }

    getLabelStyle() {
        return {
            float: "left",
            display: "inline-block",
            height: "32px",
            "line-height": "32px"
        };
    }

    getContentStyle() {
        return {
            float: "left",
            display: "inline-block",
            "margin-top": "1px",
            "margin-bottom": "1px",
            "min-height": "30px"
        };
    }

    render() {
        let labelStyle = Object.assign(this.getLabelStyle(), {width: this.options.labelWidth});
        labelStyle = Object.assign(labelStyle, this.options.labelStyle);
        let contentStyle = Object.assign(this.getContentStyle(), {width: this.options.contentWidth});
        contentStyle = Object.assign(contentStyle, this.options.contentStyle);
        let label = this.options.label ? <div style={labelStyle}>
                {this.options.label}
            </div> : null;
        let content = <div style={contentStyle}>
                {this.options.children}
            </div>;
        if (this.options.contentFirst) {
            return [content, label];
        }
        return [label, content];
    }
}

class FormGroup extends UI.Element {
    setOptions(options) {
        super.setOptions(options);
        this.options.labelWidth = this.options.labelWidth || "16%";
        this.options.contentWidth = this.options.contentWidth || "32%";
        this.options.errorFieldWidth = this.options.errorFieldWidth || "48%";
    }

    getNodeAttributes() {
        let attr = super.getNodeAttributes();
        attr.addClass("form-group");
        return attr;
    }

    getDefaultStyle() {
        return {
            float: "left",
            position: "relative",
            "min-height": "1px",
            "padding-right": "15px",
            "padding-left": "15px"
        };
    }

    render() {
        let labelStyle = Object.assign(this.getDefaultStyle(), {width: this.options.labelWidth});
        labelStyle = Object.assign(labelStyle, this.options.style);
        let contentStyle = Object.assign(this.getDefaultStyle(), {width: this.options.contentWidth});
        contentStyle = Object.assign(contentStyle, this.options.style);
        let errorFieldStyle = Object.assign(this.getDefaultStyle(), {width: this.options.errorFieldWidth});
        return [
            this.options.label ? <label className="control-label" style={labelStyle}>
                {this.options.label}
            </label> : null,
            <div style={contentStyle}>
                {this.options.children}
            </div>,
            <span ref="errorField" style={errorFieldStyle}>
            </span>
        ];
    }

    setError(errorMessage) {
        this.errorField.node.textContent = errorMessage;
        this.addClass(this.getStyleSet().hasError);
    }

    removeError() {
        this.errorField.node.textContent = "";
        this.removeClass(this.getStyleSet().hasError);
    }
}

Input.domAttributesMap = CreateNodeAttributesMap(UI.Element.domAttributesMap, [
    ["autocomplete"],
    ["autofocus", {noValue: true}],
    ["formaction"],
    ["maxLength", {domName: "maxlength"}],
    ["minLength", {domName: "minlength"}],
    ["name"],
    ["placeholder"],
    ["readonly"],
    ["required"],
    ["value"],
]);

class SubmitInput extends Input {
    getInputType() {
        return "submit";
    }
}

SubmitInput.domAttributesMap = CreateNodeAttributesMap(UI.Element.domAttributesMap, [
    ["formenctype"],
    ["formmethod"],
    ["formnovalidate"],
    ["formtarget"]
]);

let TextInputInterface = function (BaseInputClass) {
    return class TextInput extends BaseInputClass {
        getInputType() {
            return "text";
        }
    };
};

let TextInput = TextInputInterface(Input);
let FormTextInput = TextInputInterface(FormControl);

let NumberInputInterface = function(BaseInputClass) {
    let numberInput = class NumberInput extends BaseInputClass {
        getInputType() {
            return "number";
        }

        getValue() {
            let val = super.getValue();
            return parseInt(val) || parseFloat(val);
        }
    };

    numberInput.domAttributesMap = CreateNodeAttributesMap(UI.Element.domAttributesMap, [
        ["min"],
        ["max"],
        ["step"],
    ]);
    return numberInput;
};

let NumberInput = NumberInputInterface(Input);
let FormNumberInput = NumberInputInterface(FormControl);

let EmailInputInterface = function (BaseInputClass) {
    return class EmailInput extends BaseInputClass {
        getInputType() {
            return "email";
        }
    };
};

let EmailInput = EmailInputInterface(Input);
let FormEmailInput = EmailInputInterface(FormControl);

let PasswordInputInterface = function(BaseInputClass) {
    return class PasswordInput extends BaseInputClass {
        getInputType() {
            return "password";
        }
    };
};

let PasswordInput = PasswordInputInterface(Input);
let FormPasswordInput = PasswordInputInterface(FormControl);

let FileInputInterface = function(BaseInputClass) {
    let fileInput = class FileInput extends BaseInputClass {
        getInputType() {
            return "file";
        }

        getFiles() {
            return this.node.files;
        }

        getFile() {
            // TODO: this is valid only if multipleFiles is false
            return this.getFiles()[0];
        }
    };

    fileInput.domAttributesMap = CreateNodeAttributesMap(UI.Element.domAttributesMap, [
        ["multipleFiles", {domName: "multiple", noValue: true}],
        ["fileTypes", {domName: "accept"}],
    ]);
    return fileInput;
};

let FileInput = FileInputInterface(Input);
let FormFileInput = FileInputInterface(FormControl);


class CheckboxInput extends Input {
    setOptions(options) {
        options.style = options.style || {};
        options.style = Object.assign({
        }, options.style);
        super.setOptions(options);
    }

    getInputType() {
        return "checkbox";
    }

    getValue() {
        return this.node.checked;
    }

    setValue(newValue) {
        this.node.checked = newValue;
    }
}

CheckboxInput.domAttributesMap = CreateNodeAttributesMap(UI.Element.domAttributesMap, [
    ["checked", {noValue: true}]
]);

class TextArea extends UI.Primitive("textarea") {
    applyNodeAttributes() {
        super.applyNodeAttributes();
        this.node.readOnly = this.options.readOnly || false;
    }

    setReadOnly(value) {
        this.options.readOnly = value;
        this.node.readOnly = value;
    }

    getValue() {
        return this.node.value;
    }

    redraw() {
        super.redraw();
        if (this.options.value) {
            this.node.value = this.options.value + "";
        }
    }

    setValue(value) {
        this.options.value = value;
        this.node.value = value;
    }

    onInput(callback) {
        this.addNodeListener("input change", callback);
    }

    onKeyUp(callback) {
        this.addNodeListener("keyup", callback);
    }
}

class InputField extends UI.Element {
    render() {
    }
}

class Slider extends UI.Element {}

class Select extends UI.Primitive("select") {
    render() {
        this.givenOptions = this.options.options || [];
        let selectOptions = [];

        for (let i = 0; i < this.givenOptions.length; i += 1) {
            let options = {
                key: i
            };
            if (this.givenOptions[i] == this.options.selected) {
                options.selected = true;
            }
            selectOptions.push(<option {...options}>{this.givenOptions[i].toString()}</option>)
        }

        return selectOptions;
    }

    get() {
        let selectedIndex = this.getIndex();
        return this.givenOptions[selectedIndex];
    }

    set(value) {
        for (let i = 0; i < this.givenOptions.length; i++) {
            if (this.givenOptions[i] === value) {
                this.setIndex(i);
                return;
            }
        }
        console.error("Can't set the select option ", value, "\nAvailable options: ", this.givenOptions);
    }

    getIndex() {
        return this.node.selectedIndex;
    }

    setIndex(index) {
        this.node.selectedIndex = index;
        this.options.selected = this.givenOptions[index];
    }

    redraw() {
        super.redraw();
        if (this.options.selected) {
            this.set(this.options.selected);
        }
    }
}

export {FormStyle, Form, Input, FormControl, FormSettingsGroup, FormGroup, SubmitInput, TextInput, FormTextInput, NumberInput,
        FormNumberInput, EmailInput, FormEmailInput, PasswordInput, FormPasswordInput, FileInput, FormFileInput, CheckboxInput, TextArea,
        InputField, Slider, Select};
