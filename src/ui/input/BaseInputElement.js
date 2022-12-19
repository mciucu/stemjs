import {UI} from "../UIBase.js";

export class BaseInputElement extends UI.Element {
    getValue() {
        return this.value;
    }

    setValue(value, dispatchChange=true) {
        if (this.isEqual(this.value, value)) {
            return;
        }
        this.value = value;
        if (this.node) {
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
            this.setValue(initialValue);
        }
    }

    focus() {
        this.node.focus();
    }

    blur() {
        this.node.blur();
    }
}