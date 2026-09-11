import {StyleSheet, type StyleRuleObject} from "./Style";
import {styleRule} from "../decorators/Style";
import {enhance} from "./Color";
import {Device} from "../base/Device";
import {type LevelType, type SizeType, type OrientationType} from "./Constants";
import {Theme, type ResolvedThemeProps, type ThemeProps} from "./style/Theme";
import {BorderType, BoxShadowType, ColorType, FloatType, FontFamilyType, FontWeightType, ObjectType,
        SizeType as ThemeSizeType} from "./style/ThemeTypes"; // ./Constants exports a SizeType too

// Type definitions for CSS style objects
export interface CSSStyleObject {
    [key: string]: string | number | (() => string | number) | CSSStyleObject;
}

export function getTextColor(backgroundColor: string): string {
    return enhance(backgroundColor, 1);
}

// Named so the registry below can derive the prop names and types from it rather than restate them.
// A plain value is wrapped in the ThemeType that matches it, so a reader sees the value it starts out as. It
// stays bare where the only wrapper that fits is wider: SizeType around a plain string or a plain number would
// widen it to string | number for every reader.
// A value function stays bare as well and pins its type with a return annotation, because wrapping one costs
// its props parameter the type - naming ThemeProps inside a call here makes the registry reference itself
const GLOBAL_THEME_PROPS = {
    // TODO use _COLOR as a suffix
    COLOR_BACKGROUND: ColorType("#fff"),
    COLOR_BACKGROUND_ALTERNATIVE: ColorType("#eee"),
    COLOR_BACKGROUND_BODY: ColorType("#f8f8f8"),
    COLOR_FOREGROUND_BODY: ColorType("#f2f2f2"),
    COLOR_BACKGROUND_BADGE: ColorType("#777"),
    COLOR_PRIMARY: ColorType("#337ab7"),
    COLOR_SECONDARY: ColorType("#358ba4"),
    COLOR_SUCCESS: ColorType("#5cb85c"),
    COLOR_INFO: ColorType("#5bc0de"),
    COLOR_WARNING: ColorType("#f0ad4e"),
    COLOR_DANGER: ColorType("#d9534f"),

    COLOR_LINK: ColorType("#337ab7"),
    TEXT_PRIMARY_COLOR: (props: ThemeProps): string => getTextColor(props.COLOR_BACKGROUND),

    FONT_SIZE_EXTRA_SMALL: ThemeSizeType(10),
    FONT_SIZE_SMALL: ThemeSizeType(12),
    FONT_SIZE_DEFAULT: ThemeSizeType(14),
    FONT_SIZE_LARGE: ThemeSizeType(17),
    FONT_SIZE_EXTRA_LARGE: ThemeSizeType(21),

    FONT_WEIGHT_DEFAULT: FontWeightType(400),
    FONT_WEIGHT_BOLD: FontWeightType(700),

    GENERAL_LINE_HEIGHT: "1.5",

    BASE_DISABLED_OPACITY: FloatType(0.6),

    DEFAULT_TRANSITION_DURATION_MS: 250,
    DEFAULT_TRANSITION: (props: ThemeProps): string => props.DEFAULT_TRANSITION_DURATION_MS + "ms ease",

    BASE_BORDER_RADIUS: ThemeSizeType(0),
    BASE_BOX_SHADOW: BoxShadowType("0px 0px 10px rgb(160, 162, 168)"),
    BASE_BORDER_WIDTH: ThemeSizeType(0),
    BASE_BORDER_STYLE: BorderType("solid"),
    BASE_BORDER_COLOR: ColorType("#ddd"),

    BUTTON_PADDING: "6px 12px",
    BUTTON_BORDER_RADIUS: (props: ThemeProps): string | number => props.BASE_BORDER_RADIUS,
    BUTTON_COLOR: (props: ThemeProps): string => props.COLOR_BACKGROUND,
    BUTTON_FONT_WEIGHT: (props: ThemeProps): string | number => props.FONT_WEIGHT_DEFAULT,

    TOGGLE_COLOR: ColorType("#086472"),
    TOGGLE_BACKGROUND: ColorType("#D2E2E5"),
    // A plain number too: ToggleInput builds calc(100% - Npx) from it, which a CSS string would break
    // without the compiler noticing, since string + string is as legal as number + string
    TOGGLE_PILL_SIZE: 20,
    TOGGLE_DISABLED_BACKGROUND: ColorType("#78AAB2"),
    TOGGLE_SHADOW: BoxShadowType("0 1px 1px 0 rgba(0,0,0,.14), 0 2px 1px -1px rgba(0,0,0,.12), 0 1px 3px 0 rgba(0,0,0,.2)"),

    CARD_BORDER_RADIUS: (props: ThemeProps): string | number => props.BASE_BORDER_RADIUS,
    CARD_HEADER_BACKGROUND_COLOR: ColorType("#ccc"),
    CARD_HEADER_TEXT_COLOR: ColorType("#222"),
    CARD_HEADER_HEIGHT: ThemeSizeType(""),

    CARD_PANEL_HEADER_HEIGHT: ThemeSizeType(30),
    CARD_PANEL_HEADER_HEIGHT_LARGE: ThemeSizeType(40),
    CARD_PANEL_HEADING_PADDING: ThemeSizeType(10),
    CARD_PANEL_HEADING_PADDING_LARGE: ThemeSizeType(20),
    CARD_PANEL_TEXT_TRANSFORM: "inherit",

    DARK_BOX_SHADOW: BoxShadowType("0px 0px 10px rgba(0, 0, 0, .6)"),

    ROW_LIST_ROW_HEIGHT: ThemeSizeType(30),
    ROW_LIST_ROW_HEIGHT_LARGE: ThemeSizeType(40),
    ROW_LIST_ROW_PADDING: ThemeSizeType(10),
    ROW_LIST_ROW_PADDING_LARGE: ThemeSizeType(20),
    ROW_LIST_ROW_BORDER_WIDTH: ThemeSizeType(1),

    FONT_FAMILY_SANS_SERIF: FontFamilyType("Lato, 'Segoe UI', 'Lucida Sans Unicode', 'Helvetica Neue', Helvetica, Arial, sans-serif"),
    FONT_FAMILY_SERIF: FontFamilyType("serif"),
    FONT_FAMILY_MONOSPACE: FontFamilyType("'Source Code Pro', Menlo, Monaco, Consolas, 'Courier New', monospace"),
    FONT_FAMILY_DEFAULT: (props: ThemeProps): string => props.FONT_FAMILY_SANS_SERIF,

    NAV_MANAGER_NAVBAR_HEIGHT: ThemeSizeType(50),
    NAV_MANAGER_BOX_SHADOW_NAVBAR: BoxShadowType("0px 0px 10px rgb(0, 0, 0)"),
    NAV_MANAGER_BOX_SHADOW_SIDE_PANEL: BoxShadowType("0px 0px 10px #202e3e"),
    NAV_MANAGER_COLOR_NAV_BAR: (props: ThemeProps): string => props.COLOR_PRIMARY,
    NAV_MANAGER_COLOR_SIDE_PANEL: (props: ThemeProps): string => enhance(props.COLOR_PRIMARY, 0.05),
    NAV_MANAGER_NAV_BAR_BACKGROUND_COLOR: (props: ThemeProps): string => props.NAV_MANAGER_COLOR_NAV_BAR,
    NAV_MANAGER_NAV_BAR_HOVER_COLOR: (props: ThemeProps): string => enhance(props.NAV_MANAGER_COLOR_NAV_BAR, 0.1),
    NAV_MANAGER_SIDE_PANEL_BACKGROUND_COLOR: (props: ThemeProps): string => props.NAV_MANAGER_COLOR_SIDE_PANEL,
    NAV_MANAGER_SIDE_PANEL_HOVER_COLOR: (props: ThemeProps): string => enhance(props.NAV_MANAGER_COLOR_SIDE_PANEL, 0.1),
    NAV_MANAGER_HR_COLOR: (props: ThemeProps): string => enhance(props.NAV_MANAGER_COLOR_SIDE_PANEL, 0.15),
    NAV_MANAGER_TEXT_COLOR: (props: ThemeProps): string => enhance(props.COLOR_PRIMARY, 1),

    // Left as plain numbers rather than sizes: extraTop() negates one and adds "px" to it, so a CSS
    // string would give calc(100% + 1empx) and NaN
    MAIN_CONTAINER_EXTRA_PADDING_TOP_DESKTOP: 0,
    MAIN_CONTAINER_EXTRA_PADDING_TOP_MOBILE: 0,
    MAIN_CONTAINER_EXTRA_PADDING_BOTTOM_DESKTOP: 0,
    MAIN_CONTAINER_EXTRA_PADDING_BOTTOM_MOBILE: 0,

    // Plain numbers for the same reason: tabs/Style.ts subtracts the underline height from the padding
    FLAT_TAB_AREA_LINE_HEIGHT: 30,
    FLAT_TAB_AREA_PADDING_SIDES: 10,
    FLAT_TAB_AREA_UNDERLINE_HEIGHT: 3,
    FLAT_TAB_AREA_TAB_STYLE: ObjectType({}),

    INPUT_BACKGROUND: ColorType("#fff"),
    INPUT_BORDER_COLOR: ColorType("#E5EAE9"),
    INPUT_BORDER_RADIUS: ThemeSizeType(4),
    INPUT_DEFAULT_HEIGHT: ThemeSizeType("auto"),

    CHECKBOX_SIZE: ThemeSizeType("1.14em"),
    CHECKBOX_BORDER_COLOR: (props: ThemeProps): string => props.BASE_BORDER_COLOR,
    CHECKBOX_BORDER_RADIUS: (props: ThemeProps): string | number => props.BASE_BORDER_RADIUS,
    CHECKBOX_ENABLED_BACKGROUND_COLOR: (props: ThemeProps): string => props.COLOR_PRIMARY,
    CHECKBOX_CHECKMARK_COLOR: (props: ThemeProps): string => props.COLOR_BACKGROUND,

    POPUP_BACKGROUND: (props: ThemeProps): string => props.COLOR_BACKGROUND,
    POPUP_SHADOW: (props: ThemeProps): string => props.BASE_BOX_SHADOW,
    POPUP_BORDER: BorderType("none"),
    POPUP_MAX_HEIGHT: ThemeSizeType("none"),
    POPUP_MAX_WIDTH: ThemeSizeType("none"),
};

Theme.setProperties(GLOBAL_THEME_PROPS);

declare global {
    interface StemThemeProps extends ResolvedThemeProps<typeof GLOBAL_THEME_PROPS> {}
}

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
