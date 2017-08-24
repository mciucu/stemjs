import {UI} from "../UIBase";
import {Button} from "./Button";
import {SimpleStyledElement} from "../Bootstrap3";
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

    extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.DEFAULT);
    }

    render() {
        this.buttons = [];
        for (let i = 0; i < this.options.givenOptions.length; i += 1) {
            this.buttons.push(
                <Button key={i} onClick={() => {this.setIndex(i);}} size={this.getSize()}
                  label={this.options.givenOptions[i].toString()} level={this.getLevel()}
                  className={this.index === i ? "active" : ""}/>);
        }
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
