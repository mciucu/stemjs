import {ElementOptions, TextUIElement, UI, type PartialOptions} from "../UIBase";
import {NodeAttributes} from "../NodeAttributes";

export interface TemporaryMessageAreaOptions {
    value?: string;
    margin?: number;
}

export class TemporaryMessageArea extends UI.Primitive("span") {
    declare options: ElementOptions<TemporaryMessageAreaOptions>;
    clearValueTimeout?: any;
    textElement: any;

    getDefaultOptions() {
        return {
            margin: 10
        } as PartialOptions<TemporaryMessageArea>;
    }

    render() {
        return [<UI.TextElement ref="textElement" value={this.options.value || ""}/>];
    }

    extraNodeAttributes(attr: NodeAttributes): void {
        attr.setStyle({
            marginLeft: this.options.margin,
            marginRight: this.options.margin,
        });
    }

    setValue(value: string): void {
        this.options.value = value;
        this.textElement.setValue(value);
    }

    setColor(color: string): void {
        this.setStyle("color", color);
    }

    showMessage(message: string, color: string = "black", displayDuration: number = 2000): void {
        this.setColor(color);
        this.clear();
        this.setValue(message);
        if (displayDuration) {
            this.clearValueTimeout = this.attachTimeout(() => this.clear(), displayDuration);
        }
    }

    clear(): void {
        this.setValue("");
        if (this.clearValueTimeout) {
            clearTimeout(this.clearValueTimeout);
            this.clearValueTimeout = undefined;
        }
    }
}
