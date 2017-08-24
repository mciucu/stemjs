import {StyleSheet} from "./Style";
import {styleRule} from "../decorators/Style";
import {buildColors, enhance} from "./Color";
import {Device} from "../base/Device";
import {Orientation, Level, Size} from "./Constants";
import {Theme} from "style/Theme";

let GlobalStyle = {
};

Theme.Global.setProperties({
    COLOR_PLAIN: "#fff",
    COLOR_PLAIN_ALTERNATIVE: "#eee",
    COLOR_GRAY: "#777",
    COLOR_PRIMARY: "#337ab7",
    COLOR_SECONDARY: "#358ba4",
    COLOR_SUCCESS: "#5cb85c",
    COLOR_INFO: "#5bc0de",
    COLOR_WARNING: "#f0ad4e",
    COLOR_DANGER: "#d9534f",

    FONT_SIZE_EXTRA_SMALL: "9px",
    FONT_SIZE_SMALL: "10px",
    FONT_SIZE_DEFAULT: "12px",
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

    ROW_LIST_ROW_HEIGHT: 30,
    ROW_LIST_ROW_HEIGHT_LARGE: 40,
    ROW_LIST_ROW_PADDING: 10,
    ROW_LIST_ROW_PADDING_LARGE: 20,
    ROW_LIST_ROW_BORDER_WIDTH: 1,

    FONT_FAMILY_SANS_SERIF: "'Segoe UI', 'Lucida Sans Unicode', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    FONT_FAMILY_SERIF: "serif",
    FONT_FAMILY_MONOSPACE: "'Source Code Pro', 'Monaco', 'Consolas', monospace",

    NAV_MANAGER_NAVBAR_HEIGHT: 50,
    NAV_MANAGER_BOX_SHADOW_NAV_MANAGER: "0px 0px 10px rgb(0, 0, 0)",
    NAV_MANAGER_BOX_SHADOW_SIDE_PANEL: "0px 0px 10px #202e3e",
    // NAV_MANAGER_SIDE_PANEL_BACKGROUND_COLOR: "#202e3e",
    // NAV_MANAGER_SIDE_PANEL_HOVER_COLOR: "#364251",
    // NAV_MANAGER_NAV_BAR_BACKGROUND_COLOR: "#1c2937",
    // NAV_MANAGER_NAV_BAR_HOVER_COLOR: "#323e4b",
    // NAV_MANAGER_HR_COLOR: "#364251",
    // NAV_MANAGER_TEXT_COLOR: "#eee",

    MAIN_CONTAINER_EXTRA_PADDING_TOP_DESKTOP: 0,
    MAIN_CONTAINER_EXTRA_PADDING_TOP_MOBILE: 0,
    MAIN_CONTAINER_EXTRA_PADDING_BOTTOM_DESKTOP: 0,
    MAIN_CONTAINER_EXTRA_PADDING_BOTTOM_MOBILE: 0,
});

class ButtonGroupStyle extends StyleSheet {
    @styleRule
    HORIZONTAL = {
        ">*": {
            "margin-left": "5px",
            "display": "inline-block",
        },
        ">:first-child": {
            "margin-left": "0px",
        },
    };

    @styleRule
    VERTICAL = {
        ">*": {
            "margin-top": "5px",
            "display": "block",
        },
        ">:first-child": {
            "margin-top": "0px",
        },
    };

    Orientation(orientation) {
        for (let type of Object.keys(Orientation)) {
            if (orientation == Orientation[type]) {
                return this[type];
            }
        }
    }
}

class RadioButtonGroupStyle extends StyleSheet {
    @styleRule
    DEFAULT = {
        ">*": {
            borderRadius: "0",
        },
        ">:last-child": {
            borderTopRightRadius: "0.3em",
            borderBottomRightRadius: "0.3em",
        },
        ">:first-child": {
            borderTopLeftRadius: "0.3em",
            borderBottomLeftRadius: "0.3em",
        }
    };
}

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
        if (!textColor) {
            textColor = enhance(color, 1);
        }
        return colorToStyleFunction(color, textColor);
    }

    @styleRule
    PRIMARY = this.colorStyleRule(this.themeProperties.COLOR_PRIMARY);

    @styleRule
    SECONDARY = this.colorStyleRule(this.themeProperties.COLOR_SECONDARY);

    @styleRule
    PLAIN = this.colorStyleRule(this.themeProperties.COLOR_PLAIN);

    @styleRule
    SUCCESS = this.colorStyleRule(this.themeProperties.COLOR_SUCCESS);

    @styleRule
    INFO = this.colorStyleRule(this.themeProperties.COLOR_INFO);

    @styleRule
    WARNING = this.colorStyleRule(this.themeProperties.COLOR_WARNING);

    @styleRule
    DANGER = this.colorStyleRule(this.themeProperties.COLOR_DANGER);
};


let buttonColorToStyle = (color) => {
    const colors = buildColors(color);
    let darker1 = {
        backgroundColor: colors[2],
    };
    let darker2 = {
        backgroundColor: colors[3],
    };
    let darker3 = {
        backgroundColor: colors[4],
    };
    const regular = {
        backgroundColor: colors[1],
        borderColor: colors[5],
        color: colors[6],
    };
    const hoverDisabled = Object.assign({}, regular);
    return Object.assign({}, regular, {
        ":hover": darker1,
        ":hover:disabled": hoverDisabled,
        ":focus": darker1,
        ":active": darker2,
        ":hover:active": darker3,
        ":focus:active": darker3,
        ".active": darker3,
    });
};

class ButtonStyle extends BasicLevelStyleSheet(buttonColorToStyle) {
    // DEFAULT uses MEDIUM as size and PLAIN as level
    @styleRule
    DEFAULT = [{
        outline: "0",
        border: "0.1em solid transparent",
        padding: "0.4em 0.8em",
        borderRadius: this.themeProperties.BUTTON_BORDER_RADIUS || this.themeProperties.BASE_BORDER_RADIUS,
        textAlign: "center",
        whiteSpace: "nowrap",
        verticalAlign: "middle",
        lineHeight: 4/3 + "",
        marginBottom: "0",
        display: "inline-block",
        touchAction: "manipulation",
        userSelect: "none",
        ":disabled": {
            opacity: "0.7",
            cursor: "not-allowed",
        },
    }, {
        fontSize: "14px",
    }, this.colorStyleRule(this.themeProperties.COLOR_PLAIN)];

    getLevel(level) {
        return super.getLevel(level) || this.INFO;
    }

    @styleRule
    EXTRA_SMALL = {
        fontSize: "12px",
        padding: "0.2em 0.4em",
        borderWidth: "0.05em",
    };

    @styleRule
    SMALL = {
        fontSize: "12px",
    };

    @styleRule
    MEDIUM = {};

    @styleRule
    LARGE = {
        fontSize: "17px",
    };

    @styleRule
    EXTRA_LARGE = {
        fontSize: "21px",
        padding: "0.2em 0.4em",
    };
}

let labelColorToStyle = (color) => {
    const colors = buildColors(color);
    let darker = {
        backgroundColor: colors[2],
        color: colors[6],
        textDecoration: "none",
    };
    let regular = {
        backgroundColor: colors[1],
        borderColor: colors[5],
        color: colors[6],
    };
    return Object.assign({}, regular, {
        ":hover": darker,
        ":hover:disabled": regular,
        ":focus": darker,
        ":active": darker,
    });
};

class LabelStyle extends BasicLevelStyleSheet(labelColorToStyle) {
    // DEFAULT uses MEDIUM as size and PLAIN as level
    @styleRule
    DEFAULT = [{
        fontWeight: "bold",
        border: "0.1em solid transparent",
        padding: "0.07em 0.4em",
        borderRadius: "0.3em",
        textAlign: "center",
        whiteSpace: "nowrap",
        verticalAlign: "bottom",
        lineHeight: 4/3 + "",
        display: "inline-block",
        touchAction: "manipulation",
        ":disabled": {
            opacity: "0.7",
            cursor: "not-allowed",
        },
    }, {
        "font-size": "12px",
    }, this.colorStyleRule(this.themeProperties.COLOR_GRAY)];

    @styleRule
    EXTRA_SMALL = {
        fontSize: "10px",
        padding: "0.05em 0.2em",
        borderWidth: "0.05em",
    };

    @styleRule
    SMALL = {
        fontSize: "10px",
    };

    @styleRule
    MEDIUM = {};

    @styleRule
    LARGE = {
        fontSize: "14px",
    };

    @styleRule
    EXTRA_LARGE = {
        fontSize: "17px",
        padding: "0.05em 0.2em",
    };
}

let badgeColorToStyle = (color) => {
    const colors = buildColors(color);
    return {
        backgroundColor: colors[1],
        borderColor: colors[5],
        color: colors[6],
    };
};

class BadgeStyle extends BasicLevelStyleSheet(badgeColorToStyle) {
    // DEFAULT uses MEDIUM as size and PLAIN as level
    @styleRule
    DEFAULT = [{
        display: "inline-block",
        padding: "0.25em 0.55em",
        fontWeight: "700",
        lineHeight: "1",
        color: "#fff",
        textAlign: "center",
        whiteSpace: "nowrap",
        verticalAlign: "middle",
        backgroundColor: "#777",
        borderRadius: "0.8em",
    }, {
        "font-size": "12px",
    }, this.colorStyleRule(this.themeProperties.COLOR_GRAY)];

    @styleRule
    EXTRA_SMALL = {
        fontSize: "10px",
        padding: "0.1em 0.2em",
    };

    @styleRule
    SMALL = {
        fontSize: "10px",
    };

    @styleRule
    MEDIUM = {};

    @styleRule
    LARGE = {
        fontSize: "14px",
    };

    @styleRule
    EXTRA_LARGE = {
        fontSize: "17px",
        padding: "0.1em 0.2em",
    };
}

let progressBarColorToStyle = (color) => {
    let colors = buildColors(color);
    return {
        backgroundColor: colors[1],
    };
};

class ProgressBarStyle extends BasicLevelStyleSheet(progressBarColorToStyle) {
    @styleRule
    CONTAINER = {
        height: "20px",
        marginBottom: "20px",
        overflow: "hidden",
        backgroundColor: "#f5f5f5",
        borderRadius: "4px",
        boxShadow: "inset 0 1px 2px rgba(0, 0, 0, .1)",
    };

    @styleRule
    DEFAULT = [{
        float: "left",
        width: "0",
        height: "100%",
        lineHeight: "20px",
        color: "#fff",
        textAlign: "center",
        backgroundColor: "#337ab7",
        boxShadow: "inset 0 -1px 0 rgba(0, 0, 0, .15)",
        transition: "width .6s ease",
        fontColor: "#ffffff",
    }, {
        fontSize: "12px",
    }, this.colorStyleRule(this.themeProperties.COLOR_PRIMARY)];

    @styleRule
    STRIPED = {
        backgroundImage: "linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent)",
        backgroundSize: "40px 40px",
    };

    @styleRule
    ACTIVE = {
        animation: "progress-bar-stripes 2s linear infinite",
    };

    @styleRule
    EXTRA_SMALL = {
        fontSize: "8px",
    };

    @styleRule
    SMALL = {
        fontSize: "10px",
    };

    @styleRule
    MEDIUM = {};

    @styleRule
    LARGE = {
        fontSize: "14px",
    };

    @styleRule
    EXTRA_LARGE = {
        fontSize: "17px",
        padding: "0.1em 0.2em",
    };
}

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
    @styleRule
    fullHeight = {
        height: "100%",
    };

    @styleRule
    hidden = {
        display: "hidden"
    };
}


GlobalStyle.Button = ButtonStyle.getInstance();
GlobalStyle.RadioButtonGroup = RadioButtonGroupStyle.getInstance();
GlobalStyle.ButtonGroup = ButtonGroupStyle.getInstance();
GlobalStyle.Label = LabelStyle.getInstance();
GlobalStyle.Badge = BadgeStyle.getInstance();
GlobalStyle.ProgressBar = ProgressBarStyle.getInstance();
GlobalStyle.FlexContainer = FlexContainerStyle.getInstance();
GlobalStyle.Container = ContainerStyle.getInstance();
GlobalStyle.Utils = Utils.getInstance();

export {GlobalStyle};
