// Contains classes to abstract some generic Font Awesome usecases.
import {UI, UIElementOptions} from "./UIBase";
import {Direction, DirectionType} from "./Constants";
import {NodeAttributes} from "./NodeAttributes";

export interface FAIconOptions extends UIElementOptions {
    icon?: string;
    size?: string;
}

export interface FACollapseIconOptions extends FAIconOptions {
    collapsed?: boolean;
}

export interface FASortIconOptions extends FAIconOptions {
    direction?: DirectionType;
}

class FAIcon extends UI.Primitive("i")<FAIconOptions> {
    getIcon(): string {
        return this.options.icon || "";
    }

    extraNodeAttributes(attr: NodeAttributes): void {
        attr.addClass("fa");
        attr.addClass("fa-" + this.getIcon());
        if (this.options.size) {
            attr.addClass("fa-" + this.options.size);
        }
    }

    setIcon(icon: string): void {
        this.options.icon = icon;
        this.redraw();
    }
}

class FACollapseIcon extends FAIcon {
    declare options: FACollapseIconOptions;

    getIcon(): string {
        if (this.options.collapsed) {
            return "angle-right";
        } else {
            return "angle-down";
        }
    }

    setCollapsed(collapsed: boolean): void {
        this.options.collapsed = collapsed;
        this.redraw();
    }

    toggleCollapsed(): void {
        this.setCollapsed(!this.options.collapsed);
    }
}

class FASortIcon extends FAIcon {
    declare options: FASortIconOptions;

    getIcon(): string {
        if (this.options.direction === Direction.UP) {
            return "sort-asc";
        } else if (this.options.direction === Direction.DOWN){
            return "sort-desc";
        } else {
            return "sort";
        }
    }
}

export {FAIcon, FACollapseIcon, FASortIcon};