import {StyleSheet, styleRule} from "./Style";
import {Device} from "../base/Device";

class ContainerStyle extends StyleSheet {
    getSizeStyle(mobilePixels: number, desktopPercent: number) {
        return {
            margin: Device.isMobileDevice() ? `0 ${mobilePixels}px` : `0% ${desktopPercent}%`,
        }
    }

    @styleRule
    xs = this.getSizeStyle(6, 15);

    @styleRule
    sm = this.getSizeStyle(4, 10);

    @styleRule
    md = this.getSizeStyle(4, 6);
}

export const Container = ContainerStyle.getInstance();
