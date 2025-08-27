import {UI, UIElementChild} from "../UIBase";
import {Button} from "./Button";
import {SimpleStyledElement, SimpleStyledElementOptions} from "../SimpleElements";
import {Orientation, OrientationType} from "../Constants";
import {registerStyle} from "../style/Theme";
import {ButtonGroupStyle, RadioButtonGroupStyle} from "./ButtonStyle";
import {NodeAttributes} from "../NodeAttributes";

export interface ButtonGroupOptions extends SimpleStyledElementOptions {
    orientation?: OrientationType;
}

export interface RadioButtonGroupOptions extends SimpleStyledElementOptions {
    givenOptions: any[];
    index?: number;
}

// Interface declarations for proper typing
export interface ButtonGroup {
    // @ts-ignore
    styleSheet: ButtonGroupStyle;
}

export interface RadioButtonGroup {
    // @ts-ignore
    styleSheet: RadioButtonGroupStyle;
}

@registerStyle(ButtonGroupStyle)
export class ButtonGroup extends SimpleStyledElement<ButtonGroupOptions> {
    getDefaultOptions(): Partial<ButtonGroupOptions> {
        return {
            orientation: Orientation.HORIZONTAL,
        };
    }

    extraNodeAttributes(attr: NodeAttributes): void {
        attr.addClass(this.styleSheet.Orientation(this.options.orientation!));
    }
}

@registerStyle(RadioButtonGroupStyle)
export class RadioButtonGroup extends SimpleStyledElement<RadioButtonGroupOptions> {
    private index: number = 0;
    private buttons: Button[] = [];

    setOptions(options: RadioButtonGroupOptions): void {
        super.setOptions(options);
        this.index = this.options.index || 0;
    }

    render(): UIElementChild {
        this.buttons = this.options.givenOptions.map((option, index) =>
            <Button key={index} onClick={() => this.setIndex(index)} size={this.getSize()}
                    label={option.toString()} level={this.getLevel()}
                    className={this.index === index ? "active" : ""}/>);
        return this.buttons;
    }

    getIndex(): number {
        return this.index;
    }

    getValue(): any {
        return this.options.givenOptions[this.index];
    }

    setIndex(index: number): void {
        this.dispatch("setIndex", {
            index: index,
            oldIndex: this.index,
            value: this.options.givenOptions[index],
            oldValue: this.options.givenOptions[this.index]
        });
        this.buttons[this.index].removeClass("active");
        this.index = index;
        this.buttons[this.index].addClass("active");
    }
}