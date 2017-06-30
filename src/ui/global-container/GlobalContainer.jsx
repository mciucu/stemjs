import {UI, registerStyle} from "../UI";
import {GlobalContainerStyle} from "./Style";
import {Device} from "../../base/Device";

@registerStyle(GlobalContainerStyle)
class GlobalContainer extends UI.Element {
    extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.default);
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