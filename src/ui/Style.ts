import {StyleElement, KeyframeElement, DynamicStyleElement} from "./StyleElement";
import {Dispatchable} from "../base/Dispatcher";
import {PREFERRED_CLASS_NAME_KEY} from "../decorators/Style.js";
import {Theme, ThemeProps} from "./style/Theme";

interface StyleSheetOptions {
    parent: HTMLElement;
    theme?: Theme;
    name?: string;
    delayedMount?: boolean;
}

interface StyleObject {
    [key: string]: any;
}

interface KeyframeObject {
    [key: string]: StyleObject;
}

// Class meant to group multiple classes inside a single <style> element, for convenience
// TODO: pattern should be more robust, to be able to only update classes
class StyleSheet extends Dispatchable {
    static elementNameCounter?: number;
    static theme?: Theme;

    options: StyleSheetOptions;
    elements: Set<DynamicStyleElement | KeyframeElement>;
    declare styleElement?: StyleElement;
    declare themeProps?: ThemeProps;
    declare _firstUpdate?: boolean;
    declare container?: StyleElement; // The default for most style sheets

    constructor(options: StyleSheetOptions = {}) {
        super();
        this.options = {
            ...this.getDefaultOptions(options),
            ...options,
        };
        this.elements = new Set();
        const {delayedMount} = this.options;
        if (!delayedMount) {
            this.ensureMounted();
        }

        this.themeProps = this.options.theme.props;
    }

    getDefaultOptions(options: StyleSheetOptions): StyleSheetOptions {
        const theme = options.theme || Theme.Global;
        return {
            parent: document.head,
            theme,
            name: options.name || (this.constructor as typeof StyleSheet).getElementName(theme), // call only if needed
        }
    }

    ensureMounted(): void {
        if (this.styleElement) {
            return;
        }
        const styleElementOptions = {
            children: [],
            name: this.options.name,
        };
        this.styleElement = StyleElement.create(this.options.parent, styleElementOptions);
    }

    static getInstance(theme = (this.theme || Theme.Global)): StyleSheet {
        return theme.getStyleSheetInstance(this);
    }

    // Just to have the same pattern as objects or not
    getInstance(): StyleSheet {
        return this;
    }

    // Generate an instance, and also make sure to instantiate all style elements
    static initialize(): void {
        const styleSheet = this.getInstance();

        for (const key in this.prototype) {
            // Just hit the getter to instantiate the style
            if (!(styleSheet as any)[key]) {
                console.log("This is here to prevent a bundling optimization bug");
            }
        }
    }

    static getElementName(theme: Theme): string {
        this.elementNameCounter = (this.elementNameCounter || 0) + 1;
        let name = this.name;
        if (theme !== Theme.Global) {
            name += "-" + theme.name;
        }
        name = name.replaceAll("$", ""); // Fix minify mangling
        if (this.elementNameCounter > 1) {
            name += "-" + this.elementNameCounter;
        }
        return name;
    }

    ensureFirstUpdate(): void {
        if (this._firstUpdate) {
            return;
        }

        this._firstUpdate = true;
        this.ensureMounted();
        // Call all listeners before update for the very first time, to update any possible variables
        this.dispatch("beforeUpdate", this);
    }

    css(style: StyleObject, ...args: StyleObject[]): DynamicStyleElement {
        this.ensureFirstUpdate();
        if (arguments.length > 1) {
            style = Object.assign({}, style, ...args);
        }
        let elementOptions: any = {style: style};

        if (style[PREFERRED_CLASS_NAME_KEY]) {
            elementOptions.name = style[PREFERRED_CLASS_NAME_KEY];
        }

        let element = new DynamicStyleElement(elementOptions);
        this.elements.add(element);
        let styleInstances = element.render();
        for (let styleInstance of styleInstances as any[]) {
            this.styleElement!.appendChild(styleInstance);
        }
        return element;
    }

    keyframes(keyframes: KeyframeObject, ...args: KeyframeObject[]): KeyframeElement {
        this.ensureFirstUpdate();
        // This is not really necessarily as I don't believe it will ever be used
        if (arguments.length > 1) {
            keyframes = Object.assign({}, keyframes, ...args);
        }
        let element = new KeyframeElement({keyframe: keyframes});
        this.elements.add(element);
        this.styleElement!.appendChild(element);
        return element;
    }

    addBeforeUpdateListener(callback: Function): any {
        return this.addListener("beforeUpdate", callback);
    }

    update(): void {
        if (!this._firstUpdate) {
            return;
        }
        this.dispatch("beforeUpdate", this);

        for (const key of Object.keys(this)) {
            if ((this as any)[key] instanceof DynamicStyleElement) {
                const desc = (this as any)["__style__" + key];
                const func = desc && desc.objInitializer;
                if (func) {
                    (this as any)[key].options.style = func.call(this);
                }
            }
        }

        let children: any[] = [];
        for (let value of this.elements) {
            if (value instanceof StyleElement) {
                let styleElements = value.render();
                children.push(...(styleElements as any[]));
            }
        }
        this.styleElement!.options.children = children;
        this.styleElement!.redraw();
    }
}

// Helper class, meant to only keep one class active for an element from a set of classes
// TODO @types remove
class ExclusiveClassSet {
    classList: any[];
    element: any;

    constructor(classList: any[], element: any) {
        // TODO: check that classList is an array (or at least iterable)
        this.classList = classList;
        this.element = element;
    }

    // TODO @typing deprecate this?
    static fromObject(obj: any, element: any): ExclusiveClassSet {
        let classList: any[] = [];
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                classList.push(obj[key]);
            }
        }
        return Object.assign(new ExclusiveClassSet(classList, element), obj);
    }

    set(element: any, classInstance?: any): void {
        if (!classInstance) {
            classInstance = element;
            element = this.element;
        }
        for (let cls of this.classList) {
            if (cls === classInstance) {
                element.addClass(cls);
            } else {
                element.removeClass(cls);
            }
        }
    }
}

function wrapCSS(context: string, style: StyleObject): StyleObject {
    return {
        [context]: style
    };
}

function hover(style: StyleObject): StyleObject {
    return wrapCSS(":hover", style);
}

function active(style: StyleObject): StyleObject {
    return wrapCSS(":active", style);
}

function focus(style: StyleObject): StyleObject {
    return wrapCSS(":focus", style);
}

export {StyleSheet, ExclusiveClassSet, wrapCSS, hover, focus, active};

export * from "../decorators/Style";
