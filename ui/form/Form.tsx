import {FormStyle} from "./Style";
import {TextUIElement, UI} from "../UIBase";
import {registerStyle} from "../style/Theme";
import {NodeAttributes} from "../NodeAttributes";

@registerStyle(FormStyle)
export class Form extends UI.Primitive("form") {
    extraNodeAttributes(attr: NodeAttributes) {
        attr.addClass(this.styleSheet.form);
    }

    onMount() {
        // Form elements by default refresh the page when a button inside them is clicked, so we prevent that.
        this.addNodeListener("submit", (event) => event.preventDefault());
    }
}

@registerStyle(FormStyle)
export class FormGroup extends UI.Element {
    declare errorField?: TextUIElement;

    extraNodeAttributes(attr: NodeAttributes) {
        attr.addClass(this.styleSheet.formGroup);
    }

    setError(errorMessage: string) {
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


export class FormField extends FormGroup {
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
