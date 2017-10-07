import {UI} from "../UIBase";
import {CreateNodeAttributesMap} from "../NodeAttributes";
import {InputStyle} from "./Style";
import {registerStyle} from "../style/Theme";


@registerStyle(InputStyle)
class InputableElement extends UI.Element {
    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.addClass(this.styleSheet.inputElement);
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
}


class NumberInput extends Input {
    getInputType() {
        return "number";
    }

    getValue() {
        let val = super.getValue();
        return parseInt(val) || parseFloat(val);
    }
}
NumberInput.domAttributesMap = CreateNodeAttributesMap(UI.Element.domAttributesMap, [
    ["min"],
    ["max"],
    ["step"],
]);


class EmailInput extends Input {
    getInputType() {
        return "email";
    }
}


class PasswordInput extends Input {
    getInputType() {
        return "password";
    }
}


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

    getAsFormData() {
        let formData = new FormData();
        for (let file of this.getFiles()) {
            formData.append(file.name, file);
        }
        return formData;
    }
}
FileInput.domAttributesMap = CreateNodeAttributesMap(UI.Element.domAttributesMap, [
    ["multipleFiles", {domName: "multiple", noValue: true}],
    ["fileTypes", {domName: "accept"}],
]);


class CheckboxInput extends Input {
    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.addClass(this.styleSheet.checkboxInput);
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


class RadioInput extends CheckboxInput {
    getInputType() {
        return "radio";
    }

    getValue() {
        return this.node.checked;
    }

    setValue(newValue) {
        this.node.checked = newValue;
    }
}
RadioInput.domAttributesMap = CreateNodeAttributesMap(CheckboxInput.domAttributesMap, [
    ["name"]
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
        if (this.options.hasOwnProperty("value")) {
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
        attr.addClass(this.styleSheet.select);
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

export {InputStyle, Input, SubmitInput, TextInput, NumberInput, EmailInput, PasswordInput, FileInput,
        CheckboxInput, RadioInput, TextArea, Select};
