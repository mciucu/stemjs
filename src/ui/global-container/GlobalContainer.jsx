import {UI} from "../UI";
import {GlobalContainerStyle} from "./Style";
import {Device} from "../../base/Device";

class GlobalContainer extends UI.Element {
    static styleSet = GlobalContainerStyle.getInstance();

    getStyleSet() {
        return this.options.styleSet || this.constructor.styleSet;
    }

    extraNodeAttributes(attr) {
        attr.addClass(this.getStyleSet().default);
    }

    onMount() {
        if (!Device.isTouchDevice()) {
            Object.assign(document.body.style, {
                overflow: "hidden",
            });
        }
        GlobalContainer.Global = GlobalContainer.Global || this;
    }
}

export {GlobalContainer};