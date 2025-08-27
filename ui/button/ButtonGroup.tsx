import {UI} from "../UIBase";
import {Button} from "./Button";
import {SimpleStyledElement} from "../SimpleElements";
import {Orientation} from "../Constants";
import {registerStyle} from "../style/Theme";
import {ButtonGroupStyle, RadioButtonGroupStyle} from "./ButtonStyle";

@registerStyle(ButtonGroupStyle)
class ButtonGroup extends SimpleStyledElement {
    getDefaultOptions() {
        return {
            orientation: Orientation.HORIZONTAL,
        };
    }

    extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.Orientation(this.options.orientation));
    }
}


@registerStyle(RadioButtonGroupStyle)
class RadioButtonGroup extends SimpleStyledElement {
    setOptions(options) {
        super.setOptions(options);
        this.index = this.options.index || 0;
    }

    render() {
        this.buttons = this.options.givenOptions.map((option, index) =>
            <Button key={index} onClick={() => this.setIndex(index)} size={this.getSize()}
                    label={option.toString()} level={this.getLevel()}
                    className={this.index === index ? "active" : ""}/>);
        return this.buttons;
    }

    getIndex() {
        return this.index;
    }

    getValue() {
        return this.options.givenOptions[this.index];
    }

    setIndex(index) {
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

export {ButtonGroup, RadioButtonGroup};
