import {UI} from "UI";
import {NavElement} from "NavElement";
import {FAIcon} from "../FontAwesome";
import {Size} from "../Constants";

export class NavIcon extends NavElement {
    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.addClass(this.styleSheet.icon);
    }

    getValue() {
        return [
            this.getIcon(),
            this.getContent()
        ];
    }

    getContent() {
        return null;
    }

    getIcon() {
        return null;
    }

    onMount() {
        this.addClickListener((event) => {
            event.stopPropagation();
        });
    }
}


export class LeftSideNavIcon extends NavIcon {
    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.addClass(this.styleSheet.sideIcon);
    }

    getIcon() {
        return <FAIcon icon="bars" size={Size.LARGE}/>;
    }
}


export class RightSideNavIcon extends NavIcon {
    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.addClass(this.styleSheet.sideIcon);
    }

    getIcon() {
        return <FAIcon icon="ellipsis-v" size={Size.LARGE}/>;
    }
}


export class WrappedNavIcon extends NavIcon {
    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.addClass(this.styleSheet.wrappedIcon);
    }

    getIcon() {
        return <FAIcon icon="ellipsis-h" size={Size.LARGE}/>;
    }
}
