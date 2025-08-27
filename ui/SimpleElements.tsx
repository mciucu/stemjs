import {BaseUIElement, UI, UIElement, UIElementChild} from "./UIBase";
import {BasicLevelStyleSheet} from "./GlobalStyle";
import {registerStyle} from "./style/Theme";
import {buildColors} from "./Color";
import {styleRule} from "../decorators/Style";
import {isFunction} from "../base/Utils";
import {NodeAttributes} from "./NodeAttributes";
import {LevelType, SizeType} from "./Constants";

// Type definitions
export type IconType = string | BaseUIElement | ((options: any) => BaseUIElement);
export type MakeIconFunction = (icon: IconType, options?: any) => BaseUIElement | null;
export type MakeTextFunction = (text: string | BaseUIElement, options?: any) => BaseUIElement;

export interface SimpleStyledElementOptions {
    icon?: IconType;
    label?: string | BaseUIElement;
    level?: string;
    size?: string;
}

export function DefaultMakeIcon(icon: IconType, options: any = {}): BaseUIElement | null {
    if (isFunction(icon)) {
        return (icon as (options: any) => UIElement)(options);
    }
    if (icon instanceof UIElement) {
        return icon;
    }
    const iconOptions = {...options};
    iconOptions.className = (iconOptions.className || "") + " fa fa-" + icon;
    return <span {...iconOptions} />;
}

let MakeIconFunc: MakeIconFunction = DefaultMakeIcon;

// Change the icon function
export function SetMakeIcon(func: MakeIconFunction): void {
    MakeIconFunc = func;
}

export function MakeIcon(icon: IconType, options?: any): UIElement | null {
    return MakeIconFunc(icon, options);
}

// Same as for icons, but for text
let MakeTextFunc: MakeTextFunction = (text: string | BaseUIElement, _options?: any): BaseUIElement => {
    if (text instanceof BaseUIElement) {
        return text;
    }
    return new UI.TextElement(String(text));
}

export function SetMakeText(func: MakeTextFunction): void {
    MakeTextFunc = func;
}

export function MakeText(text: string | BaseUIElement, options?: any): BaseUIElement {
    return MakeTextFunc(text, options);
}

export class SimpleStyledElement<T extends SimpleStyledElementOptions = SimpleStyledElementOptions> extends UIElement<T> {
    getLevel(): LevelType | undefined {
        return (this.options as any).level || (this.parent && (this.parent as any).getLevel && (this.parent as any).getLevel());
    }

    setLevel(level: LevelType): void {
        this.updateOptions({level} as Partial<T>);
    }

    getSize(): SizeType | undefined {
        return (this.options as any).size || (this.parent && (this.parent as any).getSize && (this.parent as any).getSize());
    }

    setSize(size: SizeType): void {
        this.updateOptions({size} as Partial<T>);
    }
}


export class IconableInterface<T = void> extends SimpleStyledElement<T & SimpleStyledElementOptions> {
    render(): UIElementChild {
        return [this.beforeChildren(), this.getLabel(), super.render()];
    }

    getLabel(): string | BaseUIElement | undefined {
        return this.options.label;
    }

    setLabel(label: string | BaseUIElement): void {
        this.updateOptions({label} as any);
    }

    setIcon(icon: IconType): void {
        this.updateOptions({icon} as any);
    }

    getIcon(): UIElement | null {
        const icon = (this.options as any).icon;
        return icon ? MakeIcon(icon) : null;
    }

    beforeChildren(): UIElement | null {
        return this.getIcon();
    }
}

// TODO: move this to another file
let labelColorToStyle = (color: string): any => {
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


// Interface declaration for proper typing
export interface Label {
    get styleSheet(): LabelStyle;
}

@registerStyle(LabelStyle)
export class Label extends UI.Primitive("span", IconableInterface) {
    extraNodeAttributes(attr: NodeAttributes): void {
        attr.addClass(this.styleSheet.Size(this.getSize()));
        attr.addClass(this.styleSheet.Level(this.getLevel()));
    }
}

let badgeColorToStyle = (color: string): any => {
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


// Interface declaration for proper typing
export interface Badge {
    get styleSheet(): BadgeStyle;
}

@registerStyle(BadgeStyle)
export class Badge extends UI.Primitive("span", IconableInterface as any) {
    extraNodeAttributes(attr: NodeAttributes): void {
        attr.addClass((this.styleSheet as any).Size(this.getSize()));
        attr.addClass((this.styleSheet as any).Level(this.getLevel()));
    }
}
