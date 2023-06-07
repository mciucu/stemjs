import {UI} from "../UIBase.js";
import {IconableInterface} from "../SimpleElements.jsx";
import {registerStyle} from "../style/Theme.js";
import {ButtonStyle} from "./ButtonStyle.js";

@registerStyle(ButtonStyle)
export class Button extends UI.Primitive(IconableInterface, "button") {
    extraNodeAttributes(attr) {
        const {styleSheet} = this;
        // TODO Maybe StyleSheet should have a method onElementRedraw(attr, element), that just adds container by default
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
