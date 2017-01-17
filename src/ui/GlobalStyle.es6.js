import {UI} from "UI";
import {StyleSet} from "Style";
import {styleRule} from "../decorators/Style";
import {buildColors} from "Color";

let GlobalStyle = {
};

const COLOR = {
    PLAIN: "#ffffff",
    PRIMARY: "#337ab7",
    SUCCESS: "#5cb85c",
    INFO: "#5bc0de",
    WARNING: "#f0ad4e",
    DANGER: "#d9534f",
    GOOGLE: "#de4b39", // TODO: WTF Denis?
    FACEBOOK: "#3b5998",
};

class ButtonGroupStyle extends StyleSet {
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
            "margin-bottom": "5px",
            "display": "block",
        },
        ">:first-child": {
            "margin-top": "0px",
        },
    };

    Orientation(orientation) {
        for (let type of Object.keys(UI.Orientation)) {
            if (orientation == UI.Orientation[type]) {
                return this[type];
            }
        }
    }

};

class RadioButtonGroupStyle extends StyleSet {
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
};

class ButtonStyle extends StyleSet {
    computeButtonColorClass(colors) {
        let darker1 = {
            backgroundColor: colors[1],
        };
        let darker2 = {
            backgroundColor: colors[2],
        };
        let darker3 = {
            backgroundColor: colors[3],
        };
        let regular = {
            backgroundColor: colors[0],
            borderColor: colors[4],
            color: colors[5],
        };
        return Object.assign({}, regular, {
            ":hover": darker1,
            ":hover:disabled": regular,
            ":focus": darker1,
            ":active": darker2,
            ":hover:active": darker3,
            ":focus:active": darker3,
            ".active": darker3,
        });
    };

    // DEFAULT uses MEDIUM as size and PLAIN as level
    @styleRule
    DEFAULT = [{
        outline: "0",
        border: "0.1em solid transparent",
        padding: "0.4em 0.8em",
        borderRadius: "0.3em",
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
        "font-size": "14px",
    }, this.computeButtonColorClass(buildColors(COLOR.PLAIN))];

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

    Size(size) {
        for (let type of Object.keys(UI.Size)) {
            if (size == UI.Size[type]) {
                return this[type];
            }
        }
    }

    @styleRule
    PLAIN = {};

    @styleRule
    PRIMARY = this.computeButtonColorClass(buildColors(COLOR.PRIMARY));

    @styleRule
    SUCCESS = this.computeButtonColorClass(buildColors(COLOR.SUCCESS));

    @styleRule
    INFO = this.computeButtonColorClass(buildColors(COLOR.INFO));

    @styleRule
    WARNING = this.computeButtonColorClass(buildColors(COLOR.WARNING));

    @styleRule
    DANGER = this.computeButtonColorClass(buildColors(COLOR.DANGER));

    @styleRule
    GOOGLE = this.computeButtonColorClass(buildColors(COLOR.GOOGLE));

    @styleRule
    FACEBOOK = this.computeButtonColorClass(buildColors(COLOR.FACEBOOK));

    Level(level) {
        if (this[level]) {
            return this[level];
        }
        for (let type of Object.keys(UI.Level)) {
            if (level == UI.Level[type]) {
                return this[type];
            }
        }
    }
};


GlobalStyle.Button = ButtonStyle.getInstance();
GlobalStyle.RadioButtonGroup = RadioButtonGroupStyle.getInstance();
GlobalStyle.ButtonGroup = ButtonGroupStyle.getInstance();

export {GlobalStyle};
