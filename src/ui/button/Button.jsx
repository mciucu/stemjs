import {IconableInterface} from "../SimpleElements";
import {UI} from "../UIBase";
import {registerStyle} from "../style/Theme";
import {ButtonStyle} from "./ButtonStyle";
import {Level} from "../Constants.js";

@registerStyle(ButtonStyle)
export class Button extends UI.Primitive(IconableInterface, "button") {
    extraNodeAttributes(attr) {
        const {styleSheet} = this;
        // These might be null
        debugger;
        attr.addClass(styleSheet.Size(this.getSize()));
        const level = Level.SECONDARY; //this.getLevel();
        attr.addClass(styleSheet.Level(level));
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
