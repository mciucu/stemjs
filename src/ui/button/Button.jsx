import {IconableInterface} from "../SimpleElements";
import {UI} from "../UIBase";
import {registerStyle} from "../style/Theme";
import {ButtonStyle} from "./ButtonStyle";

@registerStyle(ButtonStyle)
export class Button extends UI.Primitive(IconableInterface, "button") {
    extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.DEFAULT);
        // These might be null
        attr.addClass(this.styleSheet.Size(this.getSize()));
        attr.addClass(this.styleSheet.Level(this.getLevel()));
    }

    disable() {
        this.options.disabled = true;
        this.node.disabled = true;
    }

    enable() {
        this.options.disabled = false;
        this.node.disabled = false;
    }

    setEnabled(enabled) {
        this.options.disabled = !enabled;
        this.node.disabled = !enabled;
    };
}
