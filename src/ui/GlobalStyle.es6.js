import {UI} from "UI";
import {StyleSet} from "Style";
import {styleRule, styleRuleInherit} from "../decorators/Style";
import {buildColors} from "Color";

let GlobalStyle = {
};

const COLOR = {
    PLAIN: "#ffffff",
    GRAY: "#777",
    PRIMARY: "#337ab7",
    SUCCESS: "#5cb85c",
    INFO: "#5bc0de",
    WARNING: "#f0ad4e",
    DANGER: "#d9534f",
    GOOGLE: "#de4b39",
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
            "margin-top": "5px",
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
}

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
}

function BasicLevelStyleSet(colorClassFunction) {
    class BasicLevelStyleClass extends StyleSet {
        colorClassBuilder = colorClassFunction

        @styleRule
        PLAIN = {};

        @styleRule
        GRAY = {};

        @styleRule
        PRIMARY = this.colorClassBuilder(buildColors(COLOR.PRIMARY));

        @styleRule
        SUCCESS = this.colorClassBuilder(buildColors(COLOR.SUCCESS));

        @styleRule
        INFO = this.colorClassBuilder(buildColors(COLOR.INFO));

        @styleRule
        WARNING = this.colorClassBuilder(buildColors(COLOR.WARNING));

        @styleRule
        DANGER = this.colorClassBuilder(buildColors(COLOR.DANGER));

        @styleRule
        GOOGLE = this.colorClassBuilder(buildColors(COLOR.GOOGLE));

        @styleRule
        FACEBOOK = this.colorClassBuilder(buildColors(COLOR.FACEBOOK));

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
    }

    return BasicLevelStyleClass;
};

let buttonColorClassBuilder = (colors) => {
    let darker1 = {
        backgroundColor: colors[2],
    };
    let darker2 = {
        backgroundColor: colors[3],
    };
    let darker3 = {
        backgroundColor: colors[4],
    };
    let regular = {
        backgroundColor: colors[1],
        borderColor: colors[5],
        color: colors[6],
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

class ButtonStyle extends BasicLevelStyleSet(buttonColorClassBuilder) {
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
        fontSize: "14px",
    }, this.colorClassBuilder(buildColors(COLOR.PLAIN))];

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
}

let labelColorClassBuilder = (colors) => {
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

class LabelStyle extends BasicLevelStyleSet(labelColorClassBuilder) {
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
    }, this.colorClassBuilder(buildColors(COLOR.GRAY))];

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

    Size(size) {
        for (let type of Object.keys(UI.Size)) {
            if (size == UI.Size[type]) {
                return this[type];
            }
        }
    }
}

let badgeColorClassBuilder = (colors) => {
    return {
        backgroundColor: colors[1],
        borderColor: colors[5],
        color: colors[6],
    };
};

class BadgeStyle extends BasicLevelStyleSet(labelColorClassBuilder) {
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
    }, this.colorClassBuilder(buildColors(COLOR.GRAY))];

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

    Size(size) {
        for (let type of Object.keys(UI.Size)) {
            if (size == UI.Size[type]) {
                return this[type];
            }
        }
    }
}


function cardPanelColorClassBuilder(color) {
    let colors = buildColors(color);
    class CardPanelLevelStyle extends StyleSet {
        @styleRule
        heading = {
            color: colors[6],
            backgroundColor: colors[0],
            borderBottomColor: colors[4],
        };

        @styleRule
        panel = {
            borderColor: colors[4],
        };
    }

    return CardPanelLevelStyle;
};

function cardPanelSizeClassBuilder(fontSize) {
    let panelStyle = {};
    if (fontSize) {
        panelStyle.fontSize = fontSize;
    }
    class CardPanelSizeStyle extends StyleSet {
        @styleRule
        panel = panelStyle;
    };

    return CardPanelSizeStyle;
};

class CardPanelStyle {
    defaultClassBuilder = function() {
        class DefaultCardPanelStyle extends cardPanelColorClassBuilder(COLOR.PLAIN) {
            @styleRuleInherit
            heading = {
                padding: "0.8em 1.2em",
                borderBottomWidth: "0.08em",
                borderBottomStyle: "solid",
            };

            @styleRule
            body = {
                padding: "0.35em",
            };

            @styleRuleInherit
            panel = {
                borderWidth: "0.08em",
                borderRadius: "0.3em",
                borderStyle: "solid",
                backgroundColor: "#ffffff",
            };
        }

        return DefaultCardPanelStyle;
    };

    DEFAULT = new (this.defaultClassBuilder())();

    EXTRA_SMALL = new (cardPanelSizeClassBuilder("11px"))();

    SMALL = new (cardPanelSizeClassBuilder("12px"))();

    MEDIUM = new (cardPanelSizeClassBuilder)();

    LARGE = new (cardPanelSizeClassBuilder("17px"))();

    EXTRA_LARGE = new (cardPanelSizeClassBuilder("21px"))();

    Size(size) {
        for (let type of Object.keys(UI.Size)) {
            if (size == UI.Size[type]) {
                return this[type];
            }
        }
    }

    PRIMARY = new (cardPanelColorClassBuilder(COLOR.PRIMARY))();

    SUCCESS = new (cardPanelColorClassBuilder(COLOR.SUCCESS))();

    INFO = new (cardPanelColorClassBuilder(COLOR.INFO))();

    WARNING = new (cardPanelColorClassBuilder(COLOR.WARNING))();

    DANGER = new (cardPanelColorClassBuilder(COLOR.DANGER))();

    GOOGLE = new (cardPanelColorClassBuilder(COLOR.GOOGLE))();

    FACEBOOK = new (cardPanelColorClassBuilder(COLOR.FACEBOOK))();

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
}


let progressBarColorClassBuilder = (colors) => {
    return {
        backgroundColor: colors[1],
    };
}

class ProgressBarStyle extends BasicLevelStyleSet(progressBarColorClassBuilder) {
    @styleRule
    CONTAINER = {
        height: "20px",
        marginBottom: "20px",
        overflow: "hidden",
        backgroundColor: "#f5f5f5",
        borderRadius: "4px",
        boxShadow: "inset 0 1px 2px rgba(0, 0, 0, .1)",
    }
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
    }, this.colorClassBuilder(buildColors(COLOR.PRIMARY))];

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

    Size(size) {
        for (let type of Object.keys(UI.Size)) {
            if (size == UI.Size[type]) {
                return this[type];
            }
        }
    }
}

class FlexContainerStyle extends StyleSet {
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
        for (let type of Object.keys(UI.Orientation)) {
            if (orientation == UI.Orientation[type]) {
                return this[type];
            }
        }
    }
}

class ContainerStyle extends StyleSet {
    @styleRule
    EXTRA_SMALL = {
        margin: "0% 15%",
    };

    @styleRule
    SMALL = {
        margin: "0% 10%",
    };

    @styleRule
    MEDIUM = {
        margin: "0% 6%",
    };

    @styleRule
    LARGE = {
        margin: "0% 3%",
    };

    @styleRule
    EXTRA_LARGE = {
        margin: "0% 1%",
    };

    Size(size) {
        for (let type of Object.keys(UI.Size)) {
            if (size == UI.Size[type]) {
                return this[type];
            }
        }
    }
}


GlobalStyle.Button = ButtonStyle.getInstance();
GlobalStyle.RadioButtonGroup = RadioButtonGroupStyle.getInstance();
GlobalStyle.ButtonGroup = ButtonGroupStyle.getInstance();
GlobalStyle.Label = LabelStyle.getInstance();
GlobalStyle.Badge = BadgeStyle.getInstance();
GlobalStyle.CardPanel = new CardPanelStyle();
GlobalStyle.ProgressBar = ProgressBarStyle.getInstance();
GlobalStyle.FlexContainer = FlexContainerStyle.getInstance();
GlobalStyle.Container = ContainerStyle.getInstance();

export {GlobalStyle};
