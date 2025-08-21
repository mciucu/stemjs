import {UI} from "../UIBase";
import {NavElement} from "./NavElement";
import {FAIcon} from "../FontAwesome";
import {Size} from "../Constants";
import {NodeAttributes} from "../NodeAttributes";

export class NavIcon extends NavElement {
    extraNodeAttributes(attr: NodeAttributes): void {
        super.extraNodeAttributes(attr);
        attr.addClass(this.styleSheet.icon);
    }

    getValue(): any[] {
        return [
            this.getIcon(),
            this.getContent()
        ];
    }

    getContent(): any {
        return null;
    }

    getIcon(): any {
        return null;
    }

    onMount(): void {
        this.addClickListener((event: Event) => {
            event.stopPropagation();
        });
    }
}


export class LeftSideNavIcon extends NavIcon {
    extraNodeAttributes(attr: NodeAttributes): void {
        super.extraNodeAttributes(attr);
        attr.addClass(this.styleSheet.sideIcon);
    }

    getIcon(): any {
        return <FAIcon icon="bars" size={Size.LARGE}/>;
    }
}


export class RightSideNavIcon extends NavIcon {
    extraNodeAttributes(attr: NodeAttributes): void {
        super.extraNodeAttributes(attr);
        attr.addClass(this.styleSheet.sideIcon);
    }

    getIcon(): any {
        return <FAIcon icon="ellipsis-v" size={Size.LARGE}/>;
    }
}


export class WrappedNavIcon extends NavIcon {
    extraNodeAttributes(attr: NodeAttributes): void {
        super.extraNodeAttributes(attr);
        attr.addClass(this.styleSheet.wrappedIcon);
    }

    getIcon(): any {
        return <FAIcon icon="ellipsis-h" size={Size.LARGE}/>;
    }
}
