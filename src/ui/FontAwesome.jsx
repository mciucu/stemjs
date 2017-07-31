// Contains classes to abstract some generic Font Awesome usecases.
import {UI} from "./UIBase";
import {Direction} from "./Constants";

class FAIcon extends UI.Primitive("i") {
    getIcon() {
        return this.options.icon;
    }

    extraNodeAttributes(attr) {
        attr.addClass("fa");
        attr.addClass("fa-" + this.getIcon());
        if (this.options.size) {
            attr.addClass("fa-" + this.options.size);
        }
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

    toggleCollapsed() {
        this.setCollapsed(!this.options.collapsed);
    }
}

class FASortIcon extends FAIcon {
    getIcon() {
        if (this.options.direction === Direction.UP) {
            return "sort-asc";
        } else if (this.options.direction === Direction.DOWN){
            return "sort-desc";
        } else {
            return "sort";
        }
    }

    setDirection(direction) {
        this.options.direction = direction;
        this.redraw();
    }
}

export {FAIcon, FACollapseIcon, FASortIcon};
