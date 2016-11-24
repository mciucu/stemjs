import {UI} from "./UIBase";

class FAIcon extends UI.Primitive("i") {
    getIcon() {
        return this.options.icon;
    }

    getDOMAttributes() {
        let attr = super.getDOMAttributes();

        attr.addClass("fa");
        attr.addClass("fa-" + this.getIcon());

        return attr;
    }

    setIcon(icon) {
        this.options.icon = icon;
        this.redraw();
    }
}

class FACollapseIcon extends FAIcon {
    getIcon() {
        if (this.options.collapsed) {
            return "angle-right";
        } else {
            return "angle-down";
        }
    }

    setCollapsed(collapsed) {
        this.options.collapsed = collapsed;
        this.redraw();
    }
}

export {FAIcon, FACollapseIcon};
