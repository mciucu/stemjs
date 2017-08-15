import {UI} from "UI";
import {NavElement} from "NavElement";
import {FAIcon} from "../FontAwesome";
import {Size} from "../Constants";

class NavIcon extends NavElement {
    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.setStyle(this.styleSheet.icon);
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


class LeftSideIcon extends NavIcon {
    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.setStyle(this.styleSheet.sideIcon);
    }

    getIcon() {
        return <FAIcon icon="bars" size={Size.LARGE}/>;
    }
}


class RightSideIcon extends NavIcon {
    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.setStyle(this.styleSheet.sideIcon);
    }

    getIcon() {
        return <FAIcon icon="ellipsis-v" size={Size.LARGE}/>;
    }
}


class WrappedIcon extends NavIcon {
    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.setStyle(this.styleSheet.wrappedIcon);
    }

    getIcon() {
        return <FAIcon icon="ellipsis-h" size={Size.LARGE}/>;
    }
}

export {NavIcon, LeftSideIcon, RightSideIcon, WrappedIcon};
