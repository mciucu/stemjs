import {UI} from "UI";
import {NavElement} from "NavElement";
import {FAIcon} from "../FontAwesome";

class NavIcon extends NavElement {
    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.setStyle(this.getStyleSet().icon);
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
        attr.setStyle(this.getStyleSet().sideIcon);
    }

    getIcon() {
        return <FAIcon icon="bars" size={UI.Size.LARGE}/>;
    }
}


class RightSideIcon extends NavIcon {
    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.setStyle(this.getStyleSet().sideIcon);
    }

    getIcon() {
        return <FAIcon icon="ellipsis-v" size={UI.Size.LARGE}/>;
    }
}


class WrappedIcon extends NavIcon {
    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.setStyle(this.getStyleSet().wrappedIcon);
    }

    getIcon() {
        return <FAIcon icon="ellipsis-h" size={UI.Size.LARGE}/>;
    }
}

export {NavIcon, LeftSideIcon, RightSideIcon, WrappedIcon};
