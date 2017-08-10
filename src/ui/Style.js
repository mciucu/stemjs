// This file may be deprecated in time by CSSNativeStyleSheet, but the API will be backwards compatible
import {UI} from "./UIBase";
import {StyleElement, KeyframeElement, DynamicStyleElement} from "./StyleElement";
import {Dispatchable} from "../base/Dispatcher";

// Class meant to group multiple classes inside a single <style> element, for convenience
// TODO: pattern should be more robust, to be able to only update classes
// TODO: should probably be renamed to StyleSheet?
class StyleSheet extends Dispatchable {
    constructor(options={}) {
        super();
        this.options = Object.assign({
            updateOnResize: false,
            parent: document.head,
            name: options.name || this.constructor.getElementName(), // call only if needed
        }, options);
        this.elements = new Set();
        if (this.options.updateOnResize) {
            this.attachEventListener(window, "resize", () => {
                this.update();
            });
        }
        if (!this.options.delayedMount) {
            this.ensureMounted();
        }
    }

    ensureMounted() {
        if (this.styleElement) {
            return;
        }
        const styleElementOptions = {
            children: [],
            name: this.options.name,
        };
        this.styleElement = StyleElement.create(this.options.parent, styleElementOptions);
    }

    static getInstance() {
        if (!this.hasOwnProperty("singletonInstance")) {
            this.singletonInstance = new this();
        }
        return this.singletonInstance;
    }

    static getElementName() {
        this.elementNameCounter = (this.elementNameCounter || 0) + 1;
        let name = this.name;
        if (this.elementNameCounter > 1) {
            name += "-" + this.elementNameCounter;
        }
        return name;
    }

    getTheme() {
        return this.options.theme || this.constructor.theme;
    }

    getThemeProperty(key, defaultValue) {
        const theme = this.getTheme();
        return (theme && theme.getProperty(key, defaultValue)) || defaultValue;
    }

    get themeProperties() {
        const theme = this.getTheme();
        return (theme && theme.getProperties()) || {};
    }

    ensureFirstUpdate() {
        if (this._firstUpdate) {
            return;
        }

        this._firstUpdate = true;
        this.ensureMounted();
        // Call all listeners before update for the very first time, to update any possible variables
        this.dispatch("beforeUpdate", this);
    }

    css(style) {
        this.ensureFirstUpdate();
        if (arguments.length > 1) {
            style = Object.assign({}, ...arguments);
        }
        let elementOptions = {style: style};

        // Get the preferred name, maybe cleanup later
        const nameKey = "prefferedClassName";
        if (style[nameKey]) {
            elementOptions.name = style[nameKey];
            delete style[nameKey];
        }

        let element = new DynamicStyleElement(elementOptions);
        this.elements.add(element);
        let styleInstances = element.render();
        for (let styleInstance of styleInstances) {
            this.styleElement.appendChild(styleInstance);
        }
        return element;
    }

    keyframes(keyframes) {
        this.ensureFirstUpdate();
        // This is not really necessarily as I don't believe it will ever be used
        if (arguments.length > 1) {
            keyframes = Object.assign({}, ...arguments);
        }
        let element = new KeyframeElement({keyframe: keyframes});
        this.elements.add(element);
        this.styleElement.appendChild(element);
        return element;
    }

    addBeforeUpdateListener(callback) {
        return this.addListener("beforeUpdate", callback);
    }

    update() {
        if (!this._firstUpdate) {
            return;
        }
        this.dispatch("beforeUpdate", this);
        let children = [];
        for (let value of this.elements) {
            if (value instanceof StyleElement) {
                let styleElements = value.render();
                children.push(...styleElements);
            }
        }
        this.styleElement.options.children = children;
        this.styleElement.redraw();
    }
}

// Helper class, meant to only keep one class active for an element from a set of classes
// TODO: move to another file
class ExclusiveClassSet {
    constructor(classList, element) {
        // TODO: check that classList is an array (or at least iterable)
        this.classList = classList;
        this.element = element;
    }

    static fromObject(obj, element) {
        let classList = [];
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                classList.push(obj[key]);
            }
        }
        return Object.assign(new ExclusiveClassSet(classList, element), obj);
    }

    set(element, classInstance) {
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

function wrapCSS(context, style) {
    let result = {};
    result[context] = style;
    return result;
}

function hover(style) {
    return wrapCSS(":hover", style);
}

function active(style) {
    return wrapCSS(":active", style);
}

function focus(style) {
    return wrapCSS(":focus", style);
}

let styleMap = new WeakMap();

// TODO: deprecate this global css method, or at least rewrite it
function css(style) {
    if (arguments.length > 1) {
        style = Object.assign({}, ...arguments);
    }
    // If using the exact same object, return the same class
    let styleWrapper = styleMap.get(style);
    if (!styleWrapper) {
        styleWrapper = DynamicStyleElement.create(document.body, {style: style});
        styleMap.set(style, styleWrapper);
    }
    return styleWrapper;
}

export {css, StyleSheet, ExclusiveClassSet, styleMap, wrapCSS, hover, focus, active};

export const StyleSet = StyleSheet;

export * from "../decorators/Style";
