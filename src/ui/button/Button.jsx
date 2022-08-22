import {IconableInterface} from "../SimpleElements";
import {UI} from "../UIBase";
import {registerStyle} from "../style/Theme";
import {ButtonStyle} from "./ButtonStyle";

@registerStyle(ButtonStyle)
export class Button extends UI.Primitive(IconableInterface, "button") {
    extraNodeAttributes(attr) {
        const {styleSheet} = this;
        // These might be null
        attr.addClass(styleSheet.Size(this.getSize()));
        attr.addClass(styleSheet.Level(this.getLevel()));
    }

    disable() {
        this.setEnabled(false);
    }

    enable() {
        this.setEnabled(true);
    }

    setEnabled(enabled) {
        this.updateOptions({disabled: !enabled});
    };
}
