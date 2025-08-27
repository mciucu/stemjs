import {UI} from "../UIBase.js";

export class BaseInputElement extends UI.Element {
    getValue() {
        return this.value;
    }

    // TODO This should be an options object, not a list of bools
    setValue(value, dispatchChange=true, doRedraw = true) {
        if (this.isEqual(this.value, value)) {
            return;
        }
        this.value = value;
        if (doRedraw && this.node) {
            this.redraw();
        }
        if (dispatchChange) {
            this.dispatchChange(value);
        }
    }

    isEqual(valueA, valueB) {
        return valueA === valueB;
    }

    setOptions(options) {
        const oldInitialValue = this.options.initialValue;
        super.setOptions(options);
        const {initialValue} = this.options;
        if (this.value === undefined || !this.node || !this.isEqual(initialValue, oldInitialValue)) {
            this.setValue(initialValue, false, false);
        }
        if (this.options.hasOwnProperty("value")) {
            this.setValue(this.options.value);
        }
    }

    focus() {
        this.node.focus();
    }

    blur() {
        this.node.blur();
    }
}
