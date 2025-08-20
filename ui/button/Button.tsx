import {HTMLTagType, UI} from "../UIBase";
import {IconableInterface} from "../SimpleElements";
import {registerStyle} from "../style/Theme";
import {ButtonStyle} from "./ButtonStyle";
import {NodeAttributes} from "../NodeAttributes";

export interface Button {
    // @ts-ignore
    styleSheet: ButtonStyle;
}

export interface ButtonOptions {
    disabled?: boolean;
}

@registerStyle(ButtonStyle)
export class Button<ExtraOptions extends ButtonOptions = ButtonOptions> extends IconableInterface<ExtraOptions> {
    getNodeType(): HTMLTagType {
        return "button";
    }

    extraNodeAttributes(attr: NodeAttributes) {
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

    setEnabled(enabled: boolean) {
        this.updateOptions({disabled: !enabled});
    };
}
