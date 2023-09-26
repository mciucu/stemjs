import {buildColors} from "../Color";
import {BasicLevelStyleSheet} from "../GlobalStyle";
import {styleRule} from "../../decorators/Style";
import {StyleSheet} from "../Style";
import {Orientation} from "../Constants";

export const buttonColorToStyle = (color) => {
    const colors = buildColors(color);
    const darker1 = {
        backgroundColor: colors[2],
    };
    const darker2 = {
        backgroundColor: colors[3],
    };
    const darker3 = {
        backgroundColor: colors[4],
    };
    const regular = {
        backgroundColor: colors[1],
        borderColor: colors[5],
        color: colors[6],
    };
    return {
        ...regular,
        ":hover": darker1,
        ":hover:disabled": {
            ...regular,
        },
        ":focus": darker1,
        ":active": darker2,
        ":hover:active": darker3,
        ":focus:active": darker3,
        ".active": darker3,
    };
};

export class ButtonStyle extends BasicLevelStyleSheet(buttonColorToStyle) {
    @styleRule
    container = {
        outline: 0,
        border: "1px solid",
        padding: "6px 32px",
        borderRadius: this.themeProps.BUTTON_BORDER_RADIUS,
        fontFamily: "inherit",
        fontSize: this.themeProps.FONT_SIZE_DEFAULT,
        fontWeight: this.themeProps.BUTTON_FONT_WEIGHT,
        textAlign: "center",
        whiteSpace: "nowrap",
        verticalAlign: "middle",
        touchAction: "manipulation",
        userSelect: "none",
        cursor: "pointer",
        ":disabled": {
            opacity: 0.7,
            cursor: "not-allowed",
        },
        ...this.colorStyleRule(this.themeProps.BUTTON_COLOR)
    };

    getLevel(level) {
        return super.getLevel(level) || this.INFO;
    }

    @styleRule
    EXTRA_SMALL = {
        fontSize: this.themeProps.FONT_SIZE_EXTRA_SMALL,
        padding: "0.2em 0.4em",
        borderWidth: "0.05em",
    };

    @styleRule
    SMALL = {
        fontSize: this.themeProps.FONT_SIZE_SMALL,
    };

    @styleRule
    LARGE = {
        fontSize: this.themeProps.FONT_SIZE_LARGE,
    };

    @styleRule
    EXTRA_LARGE = {
        fontSize: this.themeProps.FONT_SIZE_EXTRA_LARGE,
        padding: "0.2em 0.4em",
    };
}

export class ButtonGroupStyle extends StyleSheet {
    @styleRule
    HORIZONTAL = {
        pointerEvents: "none",
        ">*": {
            "margin-left": "5px",
            "display": "inline-block",
            pointerEvents: "initial",
        },
        ">:first-child": {
            "margin-left": "0px",
        },
    };

    @styleRule
    VERTICAL = {
        pointerEvents: "none",
        ">*": {
            "margin-top": "5px",
            "display": "block",
            pointerEvents: "initial",
        },
        ">:first-child": {
            "margin-top": "0px",
        },
    };

    Orientation(orientation) {
        for (let type of Object.keys(Orientation)) {
            if (orientation === Orientation[type]) {
                return this[type];
            }
        }
    }
}

export class RadioButtonGroupStyle extends StyleSheet {
    @styleRule
    container = {
        pointerEvents: "none",
        ">*": {
            pointerEvents: "initial",
            borderRadius: 0,
            margin: 0,
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
