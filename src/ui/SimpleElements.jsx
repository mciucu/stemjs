// TODO: this file should be broken down
import {BaseUIElement, UI} from "./UIBase";
import {BasicLevelStyleSheet} from "./GlobalStyle";
import {registerStyle} from "./style/Theme";
import {buildColors} from "./Color";
import {styleRule} from "../decorators/Style";

// TODO handle is instance of UI.Element or if UI class
let MakeIconFunc = (icon, options) => {
    if (icon instanceof UI.Element) {
        return icon;
    }
    return <span className={"fa fa-" + icon} {...options} />;
}

// Change the icon function
export function SetMakeIcon(func) {
    MakeIconFunc = func;
}

export function MakeIcon() {
    return MakeIconFunc(...arguments);
}

// Same as for icons, but for text
let MakeTextFunc = (text, options) => {
    if (text instanceof BaseUIElement) {
        return text;
    }
    return new UI.TextElement(text);
}

export function SetMakeText(func) {
    MakeTextFunc = func;
}

export function MakeText() {
    return MakeTextFunc(...arguments);
}

export class SimpleStyledElement extends UI.Element {
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


export class IconableInterface extends SimpleStyledElement {
    render() {
        return [this.beforeChildren(), this.getLabel(), super.render()];
    };

    getLabel() {
        return this.options.label;
    }

    setLabel(label) {
        this.updateOptions({label});
    }

    setIcon(icon) {
        this.updateOptions({icon});
    }

    getIcon() {
        const {icon} = this.options;
        return icon && MakeIcon(icon);
    }

    beforeChildren() {
        return this.getIcon();
    }
}

// TODO: move this to another file
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
    @styleRule
    container = {
        fontSize: 12,
        fontWeight: "bold",
        border: "0.1em solid transparent",
        padding: "0.07em 0.4em",
        borderRadius: "0.3em",
        textAlign: "center",
        whiteSpace: "nowrap",
        verticalAlign: "bottom",
        lineHeight: 4 / 3 + "",
        display: "inline-block",
        touchAction: "manipulation",
        ":disabled": {
            opacity: "0.7",
            cursor: "not-allowed",
        },
        ...this.colorStyleRule(this.themeProps.COLOR_BACKGROUND_BADGE),
    };

    @styleRule
    EXTRA_SMALL = {
        fontSize: 10,
        padding: "0.05em 0.2em",
        borderWidth: "0.05em",
    };

    @styleRule
    SMALL = {
        fontSize: 10,
    };

    @styleRule
    MEDIUM = {};

    @styleRule
    LARGE = {
        fontSize: 14,
    };

    @styleRule
    EXTRA_LARGE = {
        fontSize: 17,
        padding: "0.05em 0.2em",
    };
}


@registerStyle(LabelStyle)
export class Label extends UI.Primitive(IconableInterface, "span") {
    extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.Size(this.getSize()));
        attr.addClass(this.styleSheet.Level(this.getLevel()));
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
    @styleRule
    container = {
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
        fontSize: 12,
        ...this.colorStyleRule(this.themeProps.COLOR_BACKGROUND_BADGE),
    };

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
export class Badge extends UI.Primitive(IconableInterface, "span") {
    extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.Size(this.getSize()));
        attr.addClass(this.styleSheet.Level(this.getLevel()));
    }
}
