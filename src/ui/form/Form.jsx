import {FormStyle} from "./Style";
import {UI} from "../UIBase";
import {registerStyle} from "../style/Theme";

@registerStyle(FormStyle)
class Form extends UI.Primitive("form") {
    extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.form);
    }

    onMount() {
        // Form elements by default refresh the page when a button inside them is clicked, so we prevent that.
        this.addNodeListener("submit", (event) => event.preventDefault());
    }
}

@registerStyle(FormStyle)
class FormGroup extends UI.Element {
    extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.formGroup);
    }

    setError(errorMessage) {
        this.errorField.node.textContent = errorMessage;
        this.addClass(this.styleSheet.hasError);
    }

    removeError() {
        this.errorField.node.textContent = "";
        this.removeClass(this.styleSheet.hasError);
    }

    getErrorField() {
        return <span ref="errorField" style={{float: "right"}}></span>;
    }

    getChildrenToRender() {
        return [this.render(), this.getErrorField()];
    }
}


class FormField extends FormGroup {
    inline() {
        return !(this.options.inline === false ||
                 (this.parent && this.parent.options && this.parent.options.inline === false));
    }

    extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.formField);
        if (this.inline()) {
            attr.addClass(this.styleSheet.sameLine);
        } else {
            attr.addClass(this.styleSheet.separatedLine);
        }
    }

    getLabel() {
        if (this.options.label) {
            return <strong>{this.options.label}</strong>;
        }
        return null;
    }

    render() {
        if (this.options.contentFirst) {
            return [<label>{[super.render(),this.getLabel()]}</label>];
        } else {
            return [<label>{[this.getLabel(),super.render()]}</label>];
        }
    }
}

export {Form, FormGroup, FormField};
