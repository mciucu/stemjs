import {buildColors} from "../Color";
import {BasicLevelStyleSheet} from "../GlobalStyle";
import {styleRule} from "../../decorators/Style";
import {StyleSheet} from "../Style";
import {Orientation} from "../Constants";

export const buttonColorToStyle = (color) => {
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

export class ButtonStyle extends BasicLevelStyleSheet(buttonColorToStyle) {
    base = {
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
    };

    // DEFAULT uses MEDIUM as size and BASE as level
    @styleRule
    DEFAULT = [this.base, {
        fontSize: "14px",
    }, this.colorStyleRule(this.themeProperties.COLOR_BACKGROUND)];

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
            if (orientation == Orientation[type]) {
                return this[type];
            }
        }
    }
}

export class RadioButtonGroupStyle extends StyleSheet {
    @styleRule
    DEFAULT = {
        pointerEvents: "none",
        ">*": {
            pointerEvents: "initial",
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
