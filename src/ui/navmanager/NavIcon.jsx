import {NavElement} from "NavManager";
import {NavbarStyle} from "NavStyle";

let navStyle = NavbarStyle.getInstance();

class NavIcon extends NavElement {
    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.setStyle(navStyle.icon);
    }

    getValue() {
        return [
            this.getIcon(),
            this.getContent()
        ];
    }

    onMount() {
        this.addClickListener((event) => {
            event.stopPropagation();
        });
    }
}

export {NavIcon};
