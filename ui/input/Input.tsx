import {UI, UIElement, UIElementOptions, UIElementChild, HTMLTagType} from "../UIBase";
import {DOMAttributesMap, NodeAttributes} from "../NodeAttributes";
import {InputStyle} from "./Style";
import {registerStyle} from "../style/Theme";
import {StemDate} from "../../time/Date";
import {CleanupJobs, RemoveHandle} from "../../base/Dispatcher";

export interface InputableElementOptions<ValueType> extends UIElementOptions {
    initialValue?: ValueType;
    value?: any;
    readOnly?: boolean;
}

export interface InputOptions<ValueType> extends InputableElementOptions<ValueType> {
    type?: string;
}

export interface NumberInputOptions extends InputOptions<number> {
    min?: number;
    max?: number;
    step?: number;
}

export interface FileInputOptions extends InputOptions<FileList> {
    multipleFiles?: boolean;
    fileTypes?: string;
}

export interface CheckboxInputOptions extends InputOptions<boolean> {
    checked?: boolean;
    indeterminate?: boolean;
    noStupid?: boolean;
}

export interface SelectOptions<ValueType> extends InputableElementOptions<ValueType> {
    options?: ValueType[];
    selected?: ValueType;
    formatter?: (obj: ValueType) => string;
    serializer?: (obj: ValueType) => string;
}

// TODO @types fucking Typescript not implementing decorators properly
export interface InputableElement<ValueType, ExtraOptions extends InputableElementOptions<ValueType> = InputableElementOptions<ValueType>, NodeType extends (HTMLElement | SVGElement) = HTMLElement> {
    // @ts-ignore
    styleSheet: InputStyle;
}

// TODO rename to BaseInputElement
// TODO handle the setOptions - initialValue lifecycle
@registerStyle(InputStyle)
export class InputableElement<
    ValueType,
    ExtraOptions extends InputableElementOptions<ValueType> = InputableElementOptions<ValueType>,
    NodeType extends (HTMLElement | SVGElement) = HTMLElement
> extends UIElement<ExtraOptions, NodeType> {
    extraNodeAttributes(attr: NodeAttributes): void {
        super.extraNodeAttributes(attr);
        attr.addClass(this.styleSheet.inputElement);
    }

    isEqual(valueA: ValueType, valueB: ValueType): boolean {
        return valueA === valueB;
    }

    setOptions(options: typeof this.options): void {
        const oldInitialValue = this.options.initialValue;
        super.setOptions(options);
        const {initialValue} = this.options;
        if (oldInitialValue == null && initialValue == null) {
            return;
        }
        // TODO @branch reimplement to be like Denis's code
        if (this.node && !this.isEqual(initialValue, oldInitialValue)) {
            this.setValue(initialValue);
        }
    }

    focus(): void {
        this.node!.focus();
    }

    blur(): void {
        this.node!.blur();
    }

    onMount(): void {
        const {initialValue} = this.options;
        if (initialValue) {
            this.setValue(initialValue);
        }
    }

    addChangeListener(callback: (value: any, element: this) => void): CleanupJobs {
        const callbackWrapper = () => {
            callback(this.getValue(), this);
        }
        return new CleanupJobs([
            this.addNodeListener("change", callbackWrapper),
            this.addNodeListener("input", callbackWrapper),
        ]);
    }

    addInputListener(callback: EventListener): RemoveHandle {
        return this.addNodeListener("input", callback);
    }

    // You need to implement these
    getValue(): ValueType | null {
        throw new Error("Not implemented");
    };

    setValue(value: ValueType): void {
        throw new Error("Not implemented");
    }
}


export class Input<
    ValueType = string,
    ExtraOptions extends InputOptions<ValueType> = InputOptions<ValueType>
> extends InputableElement<ValueType, ExtraOptions, HTMLInputElement> {
    static domAttributesMap = new DOMAttributesMap(UI.Element.domAttributesMap, [
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
        ["pattern"],
        ["type"],
    ]);

    getNodeType(): HTMLTagType {
        return "input";
    }

    extraNodeAttributes(attr: NodeAttributes): void {
        super.extraNodeAttributes(attr);
        attr.setAttribute("type", this.getInputType() || this.options.type);
    }

    getRawValue(): string {
        return this.node.value;
    }

    getValue(): ValueType {
        return this.getRawValue().trim() as ValueType;
    }

    setValue(newValue?: ValueType | string): void {
        if (newValue != null) {
            this.node.value = newValue as string;
        } else {
            this.node.removeAttribute("value");
        }
    }

    setOptions(options: typeof this.options): void {
        const oldInitialValue = this.options.initialValue;
        const oldValue = this.options.value;
        super.setOptions(options);
        if (!this.node) {
            return;
        }
        const {initialValue, value} = this.options;
        if (initialValue && initialValue !== oldInitialValue) {
            this.setValue(initialValue);
        }
        if (value && value !== oldValue) {
            this.setValue(value);
        }
    }

    getInputType(): string | null {
        // Must be overloaded
        return null;
    }

    addKeyUpListener(callback: EventListener): RemoveHandle {
        return this.addNodeListener("keyup", callback);
    }

    onMount(): void {
        // TODO Fix value and initialValue logic
        this.setValue(this.options.value || this.options.initialValue);
    }
}

export class SubmitInput extends Input {
    static domAttributesMap = new DOMAttributesMap(Input.domAttributesMap, [
        ["formenctype"],
        ["formmethod"],
        ["formnovalidate"],
        ["formtarget"]
    ]);

    getInputType(): string {
        return "submit";
    }
}


export class TextInput extends Input {
    getInputType(): string {
        return "text";
    }
}

export class NumberInput extends Input<number, NumberInputOptions> {
    static domAttributesMap = new DOMAttributesMap(Input.domAttributesMap, [
        ["min"],
        ["max"],
        ["step"],
    ]);

    getInputType(): string {
        return "number";
    }

    getValue(): number | null {
        return this.node.valueAsNumber;
    }
}


export class TelInput extends Input {
    getInputType(): string {
        return "tel";
    }
}

export class TimeInput extends Input<StemDate> {
    getInputType(): string {
        return "time";
    }

    setValue(value: Date | string): void {
        if (value instanceof Date) {
            value = StemDate.format(value, "HH:mm");
        }
        super.setValue(value);
    }

    // Returns a Date with that hour
    getValue(baseDate: StemDate = new StemDate()): StemDate {
        let newDate = new StemDate(baseDate);
        newDate.setHours(0, 0, 0, this.node.valueAsNumber);
        return newDate;
    }
}


export class EmailInput extends Input {
    getInputType(): string {
        return "email";
    }

    isValid(): boolean {
        const value = this.getValue();
        // Default regex pattern is RFC 5322 Format
        const regex = new RegExp(this.options.pattern || "([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])");
        return regex.test(value);
    }
}


export class PasswordInput extends Input {
    getInputType(): string {
        return "password";
    }
}


export class FileInput extends Input<FileInputOptions> {
    declare node: HTMLInputElement

    static domAttributesMap = new DOMAttributesMap(Input.domAttributesMap, [
        ["multipleFiles", {domName: "multiple", noValue: true}],
        ["fileTypes", {domName: "accept"}],
    ]);

    getInputType(): string {
        return "file";
    }

    getFiles(): FileList | null {
        return this.node.files;
    }

    getTotalSize(): number {
        let totalSize = 0;
        const files = this.getFiles();
        if (files) {
            for (const file of files) {
                totalSize += file.size;
            }
        }
        return totalSize;
    }

    getFile(): File | undefined {
        // TODO: this is valid only if multipleFiles is false
        const files = this.getFiles();
        return files?.[0];
    }

    getAsFormData(): FormData {
        let formData = new FormData();
        const files = this.getFiles();
        if (files) {
            for (let file of files) {
                formData.append(file.name, file);
            }
        }
        return formData;
    }

    clear(): void {
        this.node.value = "";
    }
}


export class RawCheckboxInput extends Input<boolean, CheckboxInputOptions> {
    static domAttributesMap = new DOMAttributesMap(Input.domAttributesMap, [
        ["checked", {noValue: true}]
    ]);

    extraNodeAttributes(attr: NodeAttributes): void {
        super.extraNodeAttributes(attr);
        attr.addClass(this.styleSheet.checkboxInput);
    }

    getInputType(): string {
        return "checkbox";
    }

    getValue(): boolean {
        return this.node.checked;
    }

    setValue(newValue: boolean, indeterminate?: boolean): void {
        this.node.checked = newValue;
        if (indeterminate != null) {
            this.setIndeterminate(indeterminate);
        }
    }

    setIndeterminate(value: boolean): void {
        this.options.indeterminate = value;
        this.node && (this.node.indeterminate = value);
    }

    getIndeterminate(): boolean | undefined {
        return this.options.indeterminate;
    }

    // TODO @branch fix this
    render(): UIElementChild {
        super.render();
        if (this.options.noStupid) {
            // Temp hack
            return;
        }
        if (this.options.value != this.getValue() || this.getIndeterminate() != this.node?.indeterminate) {
            this.setValue(this.options.value, this.options.indeterminate);
        }
    }
}


export class RadioInput extends RawCheckboxInput {
    static domAttributesMap = new DOMAttributesMap(RawCheckboxInput.domAttributesMap, [
        ["name"],
    ]);

    getInputType(): string {
        return "radio";
    }

    getValue(): boolean {
        return this.node.checked;
    }

    setValue(newValue: boolean): void {
        this.node.checked = newValue;
    }
}


export class TextArea extends InputableElement<string, InputableElementOptions<string>, HTMLTextAreaElement> {
    getNodeType(): HTMLTagType {
        return "textarea";
    }

    applyNodeAttributes(): void {
        super.applyNodeAttributes();
        this.node.readOnly = this.options.readOnly || false;
    }

    setReadOnly(value: boolean): void {
        this.options.readOnly = value;
        this.node.readOnly = value;
    }

    getValue(): string {
        return this.node.value;
    }

    redraw(): boolean {
        const result = super.redraw();
        if (this.options.hasOwnProperty("value")) {
            this.node.value = this.options.value + "";
        }
        return result;
    }

    setValue(value: any): void {
        this.options.value = value;
        this.node.value = value;
    }

    addKeyUpListener(callback: EventListener): RemoveHandle {
        return this.addNodeListener("keyup", callback);
    }
}


// TODO this element is inconsistent with the rest. Properly fix the initialValue pattern
export class Select<ValueType, ExtraOptions = void> extends InputableElement<ValueType, SelectOptions<ValueType> & ExtraOptions, HTMLSelectElement> {
    givenOptions: ValueType[] = [];

    getNodeType(): HTMLTagType {
        return "select"
    }

    render(): UIElementChild {
        this.givenOptions = this.options.options || [];
        let selectOptions: any[] = [];

        for (let i = 0; i < this.givenOptions.length; i += 1) {
            let options: any = {
                key: i
            };
            if (this.givenOptions[i] == this.options.selected) {
                options.selected = true;
            }
            selectOptions.push(<option {...options}>{this.serializeEntry(this.givenOptions[i])}</option>);
        }

        return selectOptions;
    }

    serializeEntry(obj: ValueType): string {
        const formatter = this.options.formatter || this.options.serializer;
        if (formatter) {
            return formatter(obj);
        } else {
            return obj.toString();
        }
    }

    extraNodeAttributes(attr: NodeAttributes): void {
        super.extraNodeAttributes(attr);
        attr.addClass(this.styleSheet.select || "");
    }

    get(): ValueType {
        let selectedIndex = this.getIndex();
        return this.givenOptions[selectedIndex];
    }

    getValue(): ValueType {
        return this.get();
    }

    set(value: ValueType): void {
        for (let i = 0; i < this.givenOptions.length; i++) {
            if (this.givenOptions[i] === value) {
                this.setIndex(i);
                return;
            }
        }
        console.error("Can't set the select option ", value, "\nAvailable options: ", this.givenOptions);
    }

    setValue(value: ValueType): void {
        this.set(value);
    }

    getIndex(): number {
        return this.node.selectedIndex;
    }

    setIndex(index: number): void {
        this.node.selectedIndex = index;
        this.options.selected = this.givenOptions[index];
    }

    redraw(): boolean {
        const result = super.redraw();
        if (this.options.selected) {
            this.set(this.options.selected);
        }
        return result;
    }
}