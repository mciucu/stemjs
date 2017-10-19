import {UI} from "../UIBase";
import {registerStyle} from "../style/Theme";
import {GlobalContainerStyle} from "./Style";
import {Device} from "../../base/Device";

@registerStyle(GlobalContainerStyle)
class GlobalContainer extends UI.Element {
    extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.default);
    }

    onMount() {
        if (!Device.isTouchDevice() || !Device.isMobileDevice()) {
            Object.assign(document.body.style, {
                overflow: "hidden",
            });
        }
        GlobalContainer.Global = GlobalContainer.Global || this;
    }
}

export {GlobalContainer};