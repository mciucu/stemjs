import {StyleElement, KeyframeElement, DynamicStyleElement} from "./StyleElement";
import {Dispatchable} from "../base/Dispatcher";

// Class meant to group multiple classes inside a single <style> element, for convenience
// TODO: pattern should be more robust, to be able to only update classes
class StyleSheet extends Dispatchable {
    constructor(options={}) {
        super();
        this.options = Object.assign({
            parent: document.head,
            name: options.name || this.constructor.getElementName(), // call only if needed
        }, options);
        this.elements = new Set();
        if (!this.options.delayedMount) {
            this.ensureMounted();
        }
        this.getTheme().addStyleSheet(this);
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

    // Generate an instance, and also make sure to instantiate all style elements
    static initialize() {
        const styleSheet = this.getInstance();

        for (const key in this.prototype) {
            // Just hit the getter to instantiate the style
            if (!styleSheet[key]) {
                console.log("This is here to prevent a bundling optimization bug");
            }
        }
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

    setTheme(theme) {
        this.options.theme = theme;
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

        for (const key of Object.keys(this)) {
            if (this[key] instanceof DynamicStyleElement) {
                const desc = this["__style__" + key];
                const func = desc && desc.objInitializer;
                if (func) {
                    this[key].options.style = func.call(this);
                }
            }
        }

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
    return {
        [context]: style
    };
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

export {StyleSheet, ExclusiveClassSet, styleMap, wrapCSS, hover, focus, active};

export * from "../decorators/Style";
