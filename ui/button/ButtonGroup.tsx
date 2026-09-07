import {UI, type UIChild} from "../UIBase";
import {Button} from "./Button";
import {SimpleStyledElement, type SimpleStyledElementOptions} from "../SimpleElements";
import {Orientation, type OrientationType} from "../Constants";
import {registerStyle} from "../style/Theme";
import {ButtonGroupStyle, RadioButtonGroupStyle} from "./ButtonStyle";
import {NodeAttributes} from "../NodeAttributes";

export interface ButtonGroupOptions extends SimpleStyledElementOptions {
    orientation?: OrientationType;
}

export interface RadioButtonGroupOptions<T = any> extends SimpleStyledElementOptions {
    givenOptions: T[];
    index?: number;
}

// What setIndex dispatches, so a listener does not have to restate it
export interface RadioButtonGroupSetIndex<T = any> {
    index: number;
    oldIndex: number;
    value: T;
    oldValue: T;
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
export class RadioButtonGroup<T = any> extends SimpleStyledElement<RadioButtonGroupOptions<T>> {
    private index: number = 0;
    private buttons: Button[] = [];

    setOptions(options: RadioButtonGroupOptions<T>): void {
        super.setOptions(options);
        this.index = this.options.index || 0; // TODO @cleanup This should be an input type
    }

    render(): UIChild {
        this.buttons = this.options.givenOptions.map(
            (option, index) => <Button
                key={index}
                onClick={() => this.setIndex(index)}
                size={this.getSize()}
                label={option.toString()}
                level={this.getLevel()}
                className={this.index === index ? "active" : ""}
            />
        );
        return this.buttons;
    }

    getIndex(): number {
        return this.index;
    }

    getValue(): T {
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


