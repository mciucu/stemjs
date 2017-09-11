import {styleRule, StyleSheet} from "../Style";
import {Device} from "../../base/Device";
import {Theme} from "../style/Theme";

class GlobalContainerStyle extends StyleSheet {
    constructor() {
        super({updateOnResize: Device.isMobileDevice()});
    }

    @styleRule
    default = {
        height: () => {return Device.isMobileDevice() ? `${window.innerHeight}px` : "100vh"},
        paddingTop: this.themeProperties.NAV_MANAGER_NAVBAR_HEIGHT,
        background: this.themeProperties.COLOR_BACKGROUND_BODY,
        width: "100%",
        ">*": {
            height: "100%",
            width: "100%",
            paddingTop:
                (Device.isMobileDevice() ? this.themeProperties.MAIN_CONTAINER_EXTRA_PADDING_TOP_MOBILE :
                                           this.themeProperties.MAIN_CONTAINER_EXTRA_PADDING_TOP_DESKTOP
                ),
            paddingBottom:
                (Device.isMobileDevice() ? this.themeProperties.MAIN_CONTAINER_EXTRA_PADDING_BOTTOM_MOBILE :
                                           this.themeProperties.MAIN_CONTAINER_EXTRA_PADDING_BOTTOM_DESKTOP
                ),
            overflow: Device.isMobileDevice() ? "" : "auto",
        }
    };
}

export {GlobalContainerStyle};