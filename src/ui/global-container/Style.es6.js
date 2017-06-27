import {styleRule, StyleSet} from "../Style";
import {Device} from "../../base/Device";

class GlobalContainerStyle extends StyleSet {
    static NAVBAR_HEIGHT = 50;

    constructor() {
        super({updateOnResize: Device.isTouchDevice()});

    }

    @styleRule
    default = {
        height: () => {return Device.isTouchDevice() ? `${window.innerHeight}px` : "100vh"},
        width: "100%",
        paddingTop: `${this.constructor.NAVBAR_HEIGHT + (Device.isTouchDevice() ? 3 : 10)}px`,
        paddingBottom: `${Device.isTouchDevice() ? 25 : 10}px`,
    };

    @styleRule
    fullContainer = {
        height: "100%",
        width: "100%",
        overflow: Device.isTouchDevice() ? "" : "auto",
    }
}

export {GlobalContainerStyle};