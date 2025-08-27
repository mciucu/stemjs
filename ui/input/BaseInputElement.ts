import {UI, UIElement} from "../UIBase";

export interface InputElementOptions<T = any> {
    initialValue?: T;
    value?: T;
}

// TODO @types should be an abstract class
export class BaseInputElement<T = any> extends UIElement<InputElementOptions<T>, HTMLInputElement> {
    protected value?: T;

    getValue(): T | undefined {
        return this.value;
    }

    // TODO This should be an options object, not a list of bools
    setValue(value: T, dispatchChange: boolean = true, doRedraw: boolean = true): void {
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

    isEqual(valueA: T | undefined, valueB: T | undefined): boolean {
        return valueA === valueB;
    }

    setOptions(options: any): void {
        const oldInitialValue = this.options?.initialValue;
        super.setOptions(options);
        const {initialValue} = this.options;
        if (this.value === undefined || !this.node || !this.isEqual(initialValue, oldInitialValue)) {
            this.setValue(initialValue, false, false);
        }
        if (this.options.hasOwnProperty("value")) {
            this.setValue(this.options.value);
        }
    }

    focus(): void {
        this.node?.focus();
    }

    blur(): void {
        this.node?.blur();
    }

    dispatchChange(value: T): void {
        // Implementation will be provided by subclasses or mixins
    }
}