import {styleRule, StyleSet} from "../Style";
import {Device} from "../../base/Device";
import {Theme} from "../style/Theme";

class GlobalContainerStyle extends StyleSet {
    constructor() {
        super({updateOnResize: Device.isMobileDevice()});
    }

    @styleRule
    default = {
        height: () => {return Device.isMobileDevice() ? `${window.innerHeight}px` : "100vh"},
        width: "100%",
        ">*": {
            height: "100%",
            width: "100%",
            paddingTop: this.themeProperties.NAV_MANAGER_NAVBAR_HEIGHT +
                (Device.isMobileDevice() ? this.themeProperties.MAIN_CONTAINER_EXTRA_PADDING_TOP_DESKTOP :
                                           this.themeProperties.MAIN_CONTAINER_EXTRA_PADDING_TOP_MOBILE
                ),
            paddingBottom:
                (Device.isMobileDevice() ? this.themeProperties.MAIN_CONTAINER_EXTRA_PADDING_BOTTOM_DESKTOP :
                                           this.themeProperties.MAIN_CONTAINER_EXTRA_PADDING_BOTTOM_MOBILE
                ),
            overflow: Device.isMobileDevice() ? "" : "auto",
        }
    };
}

export {GlobalContainerStyle};