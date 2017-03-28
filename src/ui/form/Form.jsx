import {FormStyle} from "./Style";
import {UI} from "../UIBase";

class Form extends UI.Primitive("form") {
    static styleSet = FormStyle.getInstance();

    getStyleSet() {
        return this.options.styleSet || this.constructor.styleSet;
    }

    extraNodeAttributes(attr) {
        attr.addClass(this.getStyleSet().form);
    }

    onMount() {
        // Form elements by default refresh the page when a button inside them is clicked, so we prevent that.
        this.addNodeListener("submit", (event) => event.preventDefault());
    }
}


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

export {Form, FormGroup, FormField};
