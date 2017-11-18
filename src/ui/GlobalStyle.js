import {StyleSheet} from "./Style";
import {styleRule} from "../decorators/Style";
import {enhance} from "./Color";
import {Device} from "../base/Device";
import {Orientation, Level, Size} from "./Constants";
import {Theme} from "style/Theme";

// TODO: export these properly, don't use a namespace here
let GlobalStyle = {
};

export function getTextColor(backgroundColor) {
    return enhance(backgroundColor, 1);
}

Theme.setProperties({
    COLOR_BACKGROUND: "#fff",
    COLOR_BACKGROUND_ALTERNATIVE: "#eee",
    COLOR_BACKGROUND_BODY: "#f8f8f8",
    COLOR_FOREGROUND_BODY: "#f2f2f2",
    COLOR_BACKGROUND_BADGE: "#777",
    COLOR_PRIMARY: "#337ab7",
    COLOR_SECONDARY: "#358ba4",
    COLOR_SUCCESS: "#5cb85c",
    COLOR_INFO: "#5bc0de",
    COLOR_WARNING: "#f0ad4e",
    COLOR_DANGER: "#d9534f",

    COLOR_LINK: "#337ab7",

    FONT_SIZE_EXTRA_SMALL: "10px",
    FONT_SIZE_SMALL: "12px",
    FONT_SIZE_DEFAULT: "14px",
    FONT_SIZE_LARGE: "17px",
    FONT_SIZE_EXTRA_LARGE: "21px",

    BASE_BORDER_RADIUS: 0,
    BASE_BOX_SHADOW: "0px 0px 10px rgb(160, 162, 168)",
    BASE_BORDER_WIDTH: 0,
    BASE_BORDER_STYLE: "solid",
    BASE_BORDER_COLOR: "#ddd",

    BUTTON_BORDER_RADIUS: "0.2rem",

    CARD_PANEL_HEADER_HEIGHT: 30,
    CARD_PANEL_HEADER_HEIGHT_LARGE: 40,
    CARD_PANEL_HEADING_PADDING: 10,
    CARD_PANEL_HEADING_PADDING_LARGE: 20,
    CARD_PANEL_TEXT_TRANSFORM: "inherit",

    DARK_BOX_SHADOW: "0px 0px 10px rgba(0, 0, 0, .6)",

    ROW_LIST_ROW_HEIGHT: 30,
    ROW_LIST_ROW_HEIGHT_LARGE: 40,
    ROW_LIST_ROW_PADDING: 10,
    ROW_LIST_ROW_PADDING_LARGE: 20,
    ROW_LIST_ROW_BORDER_WIDTH: 1,

    FONT_FAMILY_SANS_SERIF: "Lato, 'Segoe UI', 'Lucida Sans Unicode', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    FONT_FAMILY_SERIF: "serif",
    FONT_FAMILY_MONOSPACE: "'Source Code Pro', Menlo, Monaco, Consolas, 'Courier New', monospace",
    FONT_FAMILY_DEFAULT: () => Theme.getProperties().FONT_FAMILY_SANS_SERIF,

    NAV_MANAGER_NAVBAR_HEIGHT: 50,
    NAV_MANAGER_BOX_SHADOW_NAVBAR: "0px 0px 10px rgb(0, 0, 0)",
    NAV_MANAGER_BOX_SHADOW_SIDE_PANEL: "0px 0px 10px #202e3e",

    MAIN_CONTAINER_EXTRA_PADDING_TOP_DESKTOP: 0,
    MAIN_CONTAINER_EXTRA_PADDING_TOP_MOBILE: 0,
    MAIN_CONTAINER_EXTRA_PADDING_BOTTOM_DESKTOP: 0,
    MAIN_CONTAINER_EXTRA_PADDING_BOTTOM_MOBILE: 0,

    FLAT_TAB_AREA_COLOR_BACKGROUND: "#f3f3f3",
    FLAT_TAB_AREA_LINE_HEIGHT: 30,
    FLAT_TAB_AREA_PADDING_SIDES: 10,
});

export class BasicLevelSizeStyleSheet extends StyleSheet {
    Level(level) {
        if (this[level]) {
            return this[level];
        }
        for (let type of Object.keys(Level)) {
            if (level == Level[type]) {
                return this[type];
            }
        }
        return "";
    }

    Size(size) {
        for (let type of Object.keys(Size)) {
            if (size == Size[type]) {
                return this[type];
            }
        }
        return "";
    }
}

export const BasicLevelStyleSheet = (colorToStyleFunction) => class BasicLevelStyleClass extends BasicLevelSizeStyleSheet {
    colorStyleRule(color, textColor) {
        return colorToStyleFunction(color, textColor || getTextColor(color));
    }

    @styleRule
    BASE = this.colorStyleRule(this.themeProperties.COLOR_BACKGROUND);

    @styleRule
    PRIMARY = this.colorStyleRule(this.themeProperties.COLOR_PRIMARY);

    @styleRule
    SECONDARY = this.colorStyleRule(this.themeProperties.COLOR_SECONDARY);

    @styleRule
    SUCCESS = this.colorStyleRule(this.themeProperties.COLOR_SUCCESS);

    @styleRule
    INFO = this.colorStyleRule(this.themeProperties.COLOR_INFO);

    @styleRule
    WARNING = this.colorStyleRule(this.themeProperties.COLOR_WARNING);

    @styleRule
    DANGER = this.colorStyleRule(this.themeProperties.COLOR_DANGER);
};


class FlexContainerStyle extends StyleSheet {
    @styleRule
    HORIZONTAL = {
        display: "flex",
        ">*": {
            marginLeft: "20px",
            flex: "1",
        },
        ">:first-child": {
            marginLeft: "0px",
        },
    };

    @styleRule
    VERTICAL = {
        display: "flex",
        flexDirection: "column",
        ">*": {
            marginTop: "20px",
            flex: "1",
        },
        ">:first-child": {
            marginTop: "0px",
        }
    };

    Orientation(orientation) {
        for (let type of Object.keys(Orientation)) {
            if (orientation == Orientation[type]) {
                return this[type];
            }
        }
    }
}

class ContainerStyle extends StyleSheet {
    getSizeStyle(mobilePixels, desktopPercent) {
        return {
            margin: Device.isMobileDevice() ? `0 ${mobilePixels}px` : `0% ${desktopPercent}%`,
        }
    }

    @styleRule
    EXTRA_SMALL = this.getSizeStyle(6, 15);

    @styleRule
    SMALL = this.getSizeStyle(4, 10);

    @styleRule
    MEDIUM = this.getSizeStyle(4, 6);

    @styleRule
    LARGE = this.getSizeStyle(2, 3);

    @styleRule
    EXTRA_LARGE = this.getSizeStyle(2, 1);

    Size(size) {
        for (let type of Object.keys(Size)) {
            if (size == Size[type]) {
                return this[type];
            }
        }
    }
}


class Utils extends StyleSheet {
    extraTop = () => this.themeProperties[Device.isMobileDevice() ? "MAIN_CONTAINER_EXTRA_PADDING_TOP_MOBILE" :
        "MAIN_CONTAINER_EXTRA_PADDING_TOP_DESKTOP"];

    @styleRule
    fullHeight = {
        height: "100%",
    };

    @styleRule
    hidden = {
        display: "hidden"
    };

    // Use this class for content that has no space between it and the navbar.
    @styleRule
    fullContainer = {
        width: "100%",
        height: () => "calc(100% + " + this.extraTop() + "px)",
        marginTop: () => -this.extraTop()
    }
}

GlobalStyle.FlexContainer = FlexContainerStyle.getInstance();
GlobalStyle.Container = ContainerStyle.getInstance();
GlobalStyle.Utils = Utils.getInstance();

export {GlobalStyle};
