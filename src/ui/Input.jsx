// TODO: this file was started with a lot of old patterns, that need to be updated
// TODO: remove everything from UI namespace, export instead
// TODO: need a major clean-up
import {StyleSet} from "./Style";
import {styleRule} from "../decorators/Style";
import {UI} from "./UIBase";
import {CreateNodeAttributesMap} from "./NodeAttributes";

class FormStyle extends StyleSet {
    @styleRule
    form = {
        margin: "0 auto",
    };

    @styleRule
    formGroup = {
        marginBottom: "10px",
    };

    @styleRule
    formField = {
        ">label": {
            width: "100%",
        },
        display: "block",
        padding: "6px 0px",
        lineHeight: "1.42857143",
        color: "#555",
        maxWidth: "600px",
        margin: "0 auto",
        "[disabled]": {
            opacity: "1",
            cursor: "not-allowed",
        },
        "[readonly]": {
            opacity: "1",
        },
    };

    @styleRule
    sameLine = {
        ">label>*:nth-child(1)": {
            display: "inline-block",
            textAlign: "right",
            paddingRight: "1em",
            width: "30%",
            verticalAlign: "middle",
        },
        ">label>*:nth-child(2)": {
            display: "inline-block",
            width: "70%",
            verticalAlign: "middle",
        },
    };

    separatedLineInputStyle = {
        marginRight: "0.5em",
        width: "100%",
        height: "2.4em",
    };

    @styleRule
    separatedLine = {
        padding: "6px 10px",
        ">label>input": this.separatedLineInputStyle,
        ">label>select": this.separatedLineInputStyle,
        ">label>textarea": this.separatedLineInputStyle,
        ">label>input[type='checkbox']": {
            marginLeft: "10px",
            verticalAlign: "middle",
        }
    };

    @styleRule
    hasError = {
        color: "#a94442",
    };
}

class InputStyle extends StyleSet {
    @styleRule
    inputElement = {
        transition: "border-color ease-in-out .15s, box-shadow ease-in-out .15s",
        padding: "0.4em 0.54em",
        border: "1px solid #ccc",
        borderRadius: "4px",
        fontSize: "90%",
        ":focus": {
            outline: "0",
            borderColor: "#66afe9",
            boxShadow: "inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102,175,233,.6)",
        },
    };

    @styleRule
    checkboxInput = {
        marginLeft: "0.2em",
        display: "inline-block",
        width: "initial !important",
        marginRight:"0.5em",
    };

    @styleRule
    select = {
        height: "2.12em",
    }
}

class Form extends UI.Primitive("form") {
    static styleSet = FormStyle.getInstance();

    getStyleSet() {
        return this.options.styleSet || this.constructor.styleSet;
    }

    extraNodeAttributes(attr) {
        attr.addClass(this.getStyleSet().form);
    }

    onMount() {
        // Form elements by default refresh the page when a button inside them is clicked.
        this.addNodeListener("submit", (event) => event.preventDefault());
    }
}


class InputableElement extends UI.Element {
    static styleSet = InputStyle.getInstance();

    getStyleSet() {
        return this.options.styleSet || this.constructor.styleSet;
    }

    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.addClass(this.getStyleSet().inputElement);
    }
}


class Input extends UI.Primitive(InputableElement, "input") {
    extraNodeAttributes(attr) {
        let type = this.getInputType();
        if (type) {
            attr.setAttribute("type", type);
        }
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


class FormGroup extends UI.Element {
    static styleSet = FormStyle.getInstance();
    getStyleSet() {
        return this.options.styleSet || this.constructor.styleSet;
    }

    extraNodeAttributes(attr) {
        attr.addClass(this.getStyleSet().formGroup);
    }

    setError(errorMessage) {
        this.errorField.node.textContent = errorMessage;
        this.addClass(this.getStyleSet().hasError);
    }

    removeError() {
        this.errorField.node.textContent = "";
        this.removeClass(this.getStyleSet().hasError);
    }

    getErrorField() {
        return <span ref="errorField"></span>;
    }

    render() {
        return [this.getGivenChildren(), this.getErrorField()];
    }
}


class FormField extends FormGroup {
    inline() {
        return !(this.options.inline === false ||
                 (this.parent && this.parent.options && this.parent.options.inline === false));
    }

    extraNodeAttributes(attr) {
        attr.addClass(this.getStyleSet().formField);
        if (this.inline()) {
            attr.addClass(this.getStyleSet().sameLine);
        } else {
            attr.addClass(this.getStyleSet().separatedLine);
        }
    }

    getLabel() {
        if (this.options.label) {
            return <strong>{this.options.label}</strong>;
        }
        return null;
    }

    getGivenChildren() {
        if (this.options.contentFirst) {
            return [<label>{[super.getGivenChildren(),this.getLabel()]}</label>];
        } else {
            return [<label>{[this.getLabel(),super.getGivenChildren()]}</label>];
        }
    }
}


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


class TextInput extends Input {
    getInputType() {
        return "text";
    }
};


class NumberInput extends Input {
    getInputType() {
        return "number";
    }

    getValue() {
        let val = super.getValue();
        return parseInt(val) || parseFloat(val);
    }
};
NumberInput.domAttributesMap = CreateNodeAttributesMap(UI.Element.domAttributesMap, [
    ["min"],
    ["max"],
    ["step"],
]);


class EmailInput extends Input {
    getInputType() {
        return "email";
    }
};


class PasswordInput extends Input {
    getInputType() {
        return "password";
    }
};


class FileInput extends Input {
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
FileInput.domAttributesMap = CreateNodeAttributesMap(UI.Element.domAttributesMap, [
    ["multipleFiles", {domName: "multiple", noValue: true}],
    ["fileTypes", {domName: "accept"}],
]);


class CheckboxInput extends Input {
    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.addClass(this.getStyleSet().checkboxInput);
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


class TextArea extends UI.Primitive(InputableElement, "textarea") {
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


class Select extends UI.Primitive(InputableElement, "select") {
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
            selectOptions.push(<option {...options}>{this.givenOptions[i].toString()}</option>);
        }

        return selectOptions;
    }

    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.addClass(this.getStyleSet().select);
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

export {InputStyle, Form, Input, FormGroup, FormField, SubmitInput, TextInput, NumberInput, EmailInput, PasswordInput, FileInput,
        CheckboxInput, TextArea, Select};
