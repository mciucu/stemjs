import {UI} from "../UIBase.js";
import {registerStyle} from "../style/Theme.js";
import {GlobalContainerStyle} from "./Style.js";
import {Device} from "../../base/Device.js";

@registerStyle(GlobalContainerStyle)
export class GlobalContainer extends UI.Element {
    onMount() {
        if (!Device.isTouchDevice() || !Device.isMobileDevice()) {
            Object.assign(document.body.style, {
                overflow: "hidden",
            });
        }
        GlobalContainer.Global = GlobalContainer.Global || this;
    }
}
