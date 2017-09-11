import {UI} from "./UIBase";
import {BasicLevelStyleSheet, GlobalStyle} from "./GlobalStyle";
import {Orientation} from "./Constants";
import {registerStyle} from "./style/Theme";
import {buildColors} from "./Color";
import {styleRule} from "../decorators/Style";

class SimpleStyledElement extends UI.Element {
    getLevel() {
        return this.options.level || (this.parent && this.parent.getLevel && this.parent.getLevel());
    }

    setLevel(level) {
        this.updateOptions({level});
    }

    getSize() {
        return this.options.size || (this.parent && this.parent.getSize && this.parent.getSize());
    }

    setSize(size) {
        this.updateOptions({size});
    }
}


class IconableInterface extends SimpleStyledElement {
    render() {
        return [this.beforeChildren(), this.getLabel(), super.render()];
    };

    getLabel() {
        return (this.options.label != null) ? this.options.label : "";
    }

    setLabel(label) {
        this.updateOptions({label: label});
    }

    //TODO: this should live in a base iconable class, of which you'd only use this.beforeChildren
    getFaIcon() {
        return this.options.faIcon;
    }

    setFaIcon(value) {
        this.options.faIcon = value;
        this.redraw();
    }

    beforeChildren() {
        if (!this.getFaIcon()) {
            return null;
        }
        let iconOptions = {
            className: "fa fa-" + this.getFaIcon(),
        };
        if (this.getLabel()) {
            iconOptions.style = {
                marginRight: "5px",
            }
        }

        return <span {...iconOptions} />;
    }
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

export class LabelStyle extends BasicLevelStyleSheet(labelColorToStyle) {
    // DEFAULT uses MEDIUM as size and BASE as level
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
    }, this.colorStyleRule(this.themeProperties.COLOR_BACKGROUND_BADGE)];

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


@registerStyle(LabelStyle)
class Label extends UI.Primitive(IconableInterface, "span") {
    extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.DEFAULT);

        if (this.getSize()) {
            attr.addClass(this.styleSheet.Size(this.getSize()));
        }

        if (this.getLevel()) {
            attr.addClass(this.styleSheet.Level(this.getLevel()));
        }
    }
}

let badgeColorToStyle = (color) => {
    const colors = buildColors(color);
    return {
        backgroundColor: colors[1],
        borderColor: colors[5],
        color: colors[6],
    };
};

export class BadgeStyle extends BasicLevelStyleSheet(badgeColorToStyle) {
    // DEFAULT uses MEDIUM as size and BASE as level
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
    }, this.colorStyleRule(this.themeProperties.COLOR_BACKGROUND_BADGE)];

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


@registerStyle(BadgeStyle)
class Badge extends UI.Primitive(IconableInterface, "span") {
    extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.DEFAULT);

        if (this.getSize()) {
            attr.addClass(this.styleSheet.Size(this.getSize()));
        }

        if (this.getLevel()) {
            attr.addClass(this.styleSheet.Level(this.getLevel()));
        }
    }
}

let progressBarColorToStyle = (color) => {
    let colors = buildColors(color);
    return {
        backgroundColor: colors[1],
    };
};

class ProgressBarStyle extends BasicLevelStyleSheet(progressBarColorToStyle) {
    @styleRule
    container = {
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
    striped = {
        backgroundImage: "linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent)",
        backgroundSize: "40px 40px",
    };

    @styleRule
    active = {
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

@registerStyle(ProgressBarStyle)
class ProgressBar extends SimpleStyledElement {
    extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.container);
    }

    render() {
        let valueInPercent = (this.options.value || 0) * 100;
        let orientation = Orientation.HORIZONTAL;
        if (this.options.hasOwnProperty("orientation")) {
            orientation = this.options.orientation;
        }
        let barStyle;
        if (orientation === Orientation.HORIZONTAL) {
            barStyle = {
                width: valueInPercent + "%",
                height: this.options.height + "px",
            };
        } else {
            barStyle = {
                height: valueInPercent + "%",
                width: "5px",
            }
        }
        let barOptions = {
            className: this.styleSheet.DEFAULT,
            style: barStyle,
        };

        if (this.options.disableTransition) {
            Object.assign(barOptions.style, {
                transition: "none",
            });
        }

        if (this.options.level) {
            barOptions.className += " " + this.styleSheet.Level(this.getLevel());
        }
        if (this.options.striped) {
            barOptions.className += " " + this.styleSheet.striped;
        }
        if (this.options.active) {
            barOptions.className += " " + this.styleSheet.active;
        }
        if (this.options.color) {
            barOptions.style.backgroundColor = this.options.color;
        }

        return <div {...barOptions}>
            <span>{this.options.label}</span>
        </div>;
    }

    set(value) {
        if (value < 0)
            value = 0;
        else if (value > 1)
            value = 1;
        this.options.value = value;
        this.redraw();
    }
}


export {SimpleStyledElement, IconableInterface, Label, Badge, ProgressBar};
