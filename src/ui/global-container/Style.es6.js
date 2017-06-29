import {styleRule, StyleSet} from "../Style";
import {Device} from "../../base/Device";

class GlobalContainerStyle extends StyleSet {
    static NAVBAR_HEIGHT = 50;

    constructor() {
        super({updateOnResize: Device.isMobileDevice()});

    }

    @styleRule
    default = {
        height: () => {return Device.isMobileDevice() ? `${window.innerHeight}px` : "100vh"},
        width: "100%",
        paddingTop: `${this.constructor.NAVBAR_HEIGHT + (Device.isMobileDevice() ? 3 : 10)}px`,
        paddingBottom: `${Device.isMobileDevice() ? 25 : 10}px`,
        ">*": {
            height: "100%",
            width: "100%",
            overflow: Device.isMobileDevice() ? "" : "auto",
        }
    };
}

export {GlobalContainerStyle};