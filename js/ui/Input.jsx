import {UI} from "UIBase";
import "UIPrimitives";
import {CreateAllowedAttributesMap} from "DOMAttributes";

UI.Form = class Form extends UI.Element {
    getPrimitiveTag() {
        return "form";
    }

    getDOMAttributes() {
        let attr = super.getDOMAttributes();
        attr.addClass("form form-horizontal");
        return attr;
    }

    onMount() {
        // Insert here code to not refresh page
    }
};

UI.Input = class Input extends UI.Element {
    getPrimitiveTag() {
        return "input";
    }

    getDOMAttributes() {
        let attr = super.getDOMAttributes();

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
        this.addDOMListener("input change", callback);
    }

    onKeyUp(callback) {
        this.addDOMListener("keyup", callback);
    }
};

UI.FormControl = class FormControl extends UI.Input {
    getDOMAttributes() {
        let attr = super.getDOMAttributes();
        attr.addClass("form-control");
        return attr;
    }
};

UI.FormSettingsGroup = class FormSettingsGroup extends UI.Element {
    setOptions(options) {
        super.setOptions(options);

        this.options.labelWidth = this.options.labelWidth || "41%";
        this.options.contentWidth = this.options.contentWidth || "59%";
    }

    getDOMAttributes() {
        let attr = super.getDOMAttributes();
        attr.addClass("form-group");
        return attr;
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

    renderHTML() {
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
};

UI.FormGroup = class FormGroup extends UI.Element {
    setOptions(options) {
        super.setOptions(options);
        this.options.labelWidth = this.options.labelWidth || "16%";
        this.options.contentWidth = this.options.contentWidth || "32%";
        this.options.errorFieldWidth = this.options.errorFieldWidth || "48%";
    }

    getDOMAttributes() {
        let attr = super.getDOMAttributes();
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

    renderHTML() {
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
        this.addClass("has-error");
    }

    removeError() {
        this.errorField.node.textContent = "";
        this.removeClass("has-error");
    }
};

UI.Input.domAttributesMap = CreateAllowedAttributesMap(UI.Element.domAttributesMap, [
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

UI.SubmitInput = class SubmitInput extends UI.Input {
    getInputType() {
        return "submit";
    }
};

UI.SubmitInput.domAttributesMap = CreateAllowedAttributesMap(UI.Element.domAttributesMap, [
    ["formenctype"],
    ["formmethod"],
    ["formnovalidate"],
    ["formtarget"]
]);

UI.TextInputInterface = function (BaseInputClass) {
    return class TextInput extends BaseInputClass {
        getInputType() {
            return "text";
        }
    };
};

UI.TextInput = UI.TextInputInterface(UI.Input);
UI.FormTextInput = UI.TextInputInterface(UI.FormControl);

UI.NumberInputInterface = function(BaseInputClass) {
    let numberInput = class NumberInput extends BaseInputClass {
        getInputType() {
            return "number";
        }

        getValue() {
            let val = super.getValue();
            return parseInt(val) || parseFloat(val);
        }
    };

    numberInput.domAttributesMap = CreateAllowedAttributesMap(UI.Element.domAttributesMap, [
        ["min"],
        ["max"],
        ["step"],
    ]);
    return numberInput;
};

UI.NumberInput = UI.NumberInputInterface(UI.Input);
UI.FormNumberInput = UI.NumberInputInterface(UI.FormControl);

UI.EmailInputInterface = function (BaseInputClass) {
    return class EmailInput extends BaseInputClass {
        getInputType() {
            return "email";
        }
    };
};

UI.EmailInput = UI.EmailInputInterface(UI.Input);
UI.FormEmailInput = UI.EmailInputInterface(UI.FormControl);

UI.PasswordInputInterface = function(BaseInputClass) {
    return class PasswordInput extends BaseInputClass {
        getInputType() {
            return "password";
        }
    };
};

UI.PasswordInput = UI.PasswordInputInterface(UI.Input);
UI.FormPasswordInput = UI.PasswordInputInterface(UI.FormControl);

UI.FileInputInterface = function(BaseInputClass) {
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

    fileInput.domAttributesMap = CreateAllowedAttributesMap(UI.Element.domAttributesMap, [
        ["multipleFiles", {domName: "multiple", noValue: true}],
        ["fileTypes", {domName: "accept"}],
    ]);
    return fileInput;
};

UI.FileInput = UI.FileInputInterface(UI.Input);
UI.FormFileInput = UI.FileInputInterface(UI.FormControl);


UI.CheckboxInput = class CheckboxInput extends UI.Input {
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
};

UI.CheckboxInput.domAttributesMap = CreateAllowedAttributesMap(UI.Element.domAttributesMap, [
    ["checked", {noValue: true}]
]);

UI.TextArea = class TextArea extends UI.Element {
    getPrimitiveTag() {
        return "textarea";
    }

    applyDOMAttributes() {
        super.applyDOMAttributes();
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
};

UI.InputField = class InputField extends UI.Element {
    renderHTML() {
    }
};

UI.Slider = class Slider extends UI.Element {
};

UI.Select = class Select extends UI.Element {
    getPrimitiveTag() {
        return "select";
    }

    renderHTML() {
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
};
