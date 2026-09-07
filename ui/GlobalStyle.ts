import {StyleSheet, type StyleRuleObject} from "./Style";
import {styleRule} from "../decorators/Style";
import {enhance} from "./Color";
import {Device} from "../base/Device";
import {Orientation, Level, Size, type LevelType, type SizeType, type OrientationType} from "./Constants";
import {Theme} from "./style/Theme";
import {FloatType} from "./style/ThemeTypes";

// Type definitions for CSS style objects
interface CSSStyleObject {
    [key: string]: string | number | (() => string | number) | CSSStyleObject;
}

// TODO @types move to Theme?
interface ThemeProps {
    [key: string]: string | number | ((props: ThemeProps) => string | number);
}

export function getTextColor(backgroundColor: string): string {
    return enhance(backgroundColor, 1);
}

Theme.setProperties({
    // TODO use _COLOR as a suffix
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

    FONT_SIZE_EXTRA_SMALL: 10,
    FONT_SIZE_SMALL: 12,
    FONT_SIZE_DEFAULT: 14,
    FONT_SIZE_LARGE: 17,
    FONT_SIZE_EXTRA_LARGE: 21,

    FONT_WEIGHT_DEFAULT: 400,
    FONT_WEIGHT_BOLD: 700,

    GENERAL_LINE_HEIGHT: "1.5",

    BASE_DISABLED_OPACITY: FloatType(0.6),

    DEFAULT_TRANSITION_DURATION_MS: 250,
    DEFAULT_TRANSITION: (props: ThemeProps) => props.DEFAULT_TRANSITION_DURATION_MS + "ms ease",

    BASE_BORDER_RADIUS: 0,
    BASE_BOX_SHADOW: "0px 0px 10px rgb(160, 162, 168)",
    BASE_BORDER_WIDTH: 0,
    BASE_BORDER_STYLE: "solid",
    BASE_BORDER_COLOR: "#ddd",

    BUTTON_PADDING: "6px 12px",
    BUTTON_BORDER_RADIUS: (props: ThemeProps) => props.BASE_BORDER_RADIUS,
    BUTTON_COLOR: (props: ThemeProps) => props.COLOR_BACKGROUND,
    BUTTON_FONT_WEIGHT: (props: ThemeProps) => props.FONT_WEIGHT_DEFAULT,

    TOGGLE_COLOR: "#086472",
    TOGGLE_BACKGROUND: "#D2E2E5",
    TOGGLE_PILL_SIZE: 20,
    TOGGLE_DISABLED_BACKGROUND: "#78AAB2",
    TOGGLE_SHADOW: "0 1px 1px 0 rgba(0,0,0,.14), 0 2px 1px -1px rgba(0,0,0,.12), 0 1px 3px 0 rgba(0,0,0,.2)",

    CARD_HEADER_BACKGROUND_COLOR: "#ccc",
    CARD_HEADER_TEXT_COLOR: "#222",
    CARD_HEADER_HEIGHT: "",

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
    FONT_FAMILY_DEFAULT: (props: ThemeProps) => props.FONT_FAMILY_SANS_SERIF,

    NAV_MANAGER_NAVBAR_HEIGHT: 50,
    NAV_MANAGER_BOX_SHADOW_NAVBAR: "0px 0px 10px rgb(0, 0, 0)",
    NAV_MANAGER_BOX_SHADOW_SIDE_PANEL: "0px 0px 10px #202e3e",

    MAIN_CONTAINER_EXTRA_PADDING_TOP_DESKTOP: 0,
    MAIN_CONTAINER_EXTRA_PADDING_TOP_MOBILE: 0,
    MAIN_CONTAINER_EXTRA_PADDING_BOTTOM_DESKTOP: 0,
    MAIN_CONTAINER_EXTRA_PADDING_BOTTOM_MOBILE: 0,

    FLAT_TAB_AREA_LINE_HEIGHT: 30,
    FLAT_TAB_AREA_PADDING_SIDES: 10,
    FLAT_TAB_AREA_UNDERLINE_HEIGHT: 3,

    INPUT_BACKGROUND: "#fff",
    INPUT_BORDER_COLOR: "#E5EAE9",
    INPUT_BORDER_RADIUS: 4,
});

// A rule is named after the value that selects it, so a sheet only declares the levels and sizes it styles
type LevelRules = {[Key in LevelType]?: StyleRuleObject};
type SizeRules = {[Key in Exclude<SizeType, null>]?: StyleRuleObject};

export interface BasicLevelSizeStyleSheet extends LevelRules, SizeRules {}

export class BasicLevelSizeStyleSheet extends StyleSheet {
    Level(level: LevelType) {
        return level ? this[level] : null;
    }

    Size(size: SizeType) {
        return size ? this[size] : null;
    }
}

export const BasicLevelStyleSheet = (colorToStyleFunction: (color: string, textColor: string) => CSSStyleObject) => {
    class BasicLevelStyleClass extends BasicLevelSizeStyleSheet {
        colorStyleRule(color: string, textColor?: string): CSSStyleObject {
            return colorToStyleFunction(color, textColor || getTextColor(color));
        }

        @styleRule
        BASE = this.colorStyleRule(this.themeProps.COLOR_BACKGROUND);

        @styleRule
        primary = this.colorStyleRule(this.themeProps.COLOR_PRIMARY);

        @styleRule
        secondary = this.colorStyleRule(this.themeProps.COLOR_SECONDARY);

        @styleRule
        success = this.colorStyleRule(this.themeProps.COLOR_SUCCESS);

        @styleRule
        info = this.colorStyleRule(this.themeProps.COLOR_INFO);

        @styleRule
        warning = this.colorStyleRule(this.themeProps.COLOR_WARNING);

        @styleRule
        error = this.colorStyleRule(this.themeProps.COLOR_DANGER);
    }

    return BasicLevelStyleClass;
};


class FlexContainerStyle extends StyleSheet {
    @styleRule
    horizontal = {
        display: "flex",
        ">*": {
            marginLeft: 20,
            flex: "1",
        },
        ">:first-child": {
            marginLeft: 0,
        },
    };

    @styleRule
    vertical = {
        display: "flex",
        flexDirection: "column",
        ">*": {
            marginTop: 20,
            flex: "1",
        },
        ">:first-child": {
            marginTop: 0,
        }
    };

    Orientation(orientation: OrientationType) {
        return this[orientation];
    }
}

class ContainerStyle extends StyleSheet {
    getSizeStyle(mobilePixels: number, desktopPercent: number): CSSStyleObject {
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

    @styleRule
    lg = this.getSizeStyle(2, 3);

    @styleRule
    xl = this.getSizeStyle(2, 1);

    Size(size: SizeType) {
        return size ? this[size] : null;
    }
}


class StyleUtils extends StyleSheet {
    // TODO @types
    get Utils() {
        return StyleUtils.getInstance();
    }

    get Container() {
        return ContainerStyle.getInstance();
    }

    get FlexContainer() {
        return FlexContainerStyle.getInstance();
    }

    extraTop = (): number => this.themeProps[Device.isMobileDevice() ? "MAIN_CONTAINER_EXTRA_PADDING_TOP_MOBILE" :
        "MAIN_CONTAINER_EXTRA_PADDING_TOP_DESKTOP"];

    @styleRule
    fullHeight = {
        height: "100%",
    };

    @styleRule
    hidden = {
        display: "none",
    };

    // Use this class for content that has no space between it and the navbar.
    @styleRule
    fullContainer = {
        width: "100%",
        height: () => "calc(100% + " + this.extraTop() + "px)",
        marginTop: () => -this.extraTop()
    }
}

// TODO simplify this
export const GlobalStyle = StyleUtils.getInstance();
