import {UI} from "./UIBase";
import "./StyleElement";
import {Dispatchable} from "../base/Dispatcher";

// Class meant to group multiple classes inside a single <style> element, for convenience
// TODO: should probably be implemented with document.styleSheet
// TODO: pattern should be more robust, to be able to only update classes
class StyleSet extends Dispatchable {
    constructor(options={}) {
        super();
        this.options = options;
        this.elements = new Set();
        if (this.options.updateOnResize) {
            window.addEventListener("resize", () => {
                this.update();
            });
        }
        let styleElementOptions = {
            children: [],
            name: this.options.name,
        };
        this.styleElement = UI.StyleElement.create(document.head, styleElementOptions);
    }

    ensureFirstUpdate() {
        if (!this._firstUpdate) {
            this._firstUpdate = true;
            // Call all listeners before update for the very first time, to update any possible variables
            this.dispatch("beforeUpdate", this);
        }
    }

    css(style) {
        this.ensureFirstUpdate();
        if (arguments.length > 1) {
            style = Object.assign({}, ...arguments);
        }
        let element = new UI.DynamicStyleElement({style: style});
        this.elements.add(element);
        let styleInstances = element.render();
        for (let styleInstance of styleInstances) {
            this.styleElement.appendChild(styleInstance);
        }
        return element;
    }

    keyframe(styles) {
        this.ensureFirstUpdate();
        throw Error("Not implemented yet!");
    }

    addBeforeUpdateListener(callback) {
        return this.addListener("beforeUpdate", callback);
    }

    update() {
        this.dispatch("beforeUpdate", this);
        let children = [];
        for (let value of this.elements) {
            if (value instanceof UI.StyleElement) {
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

function css(style) {
    if (arguments.length > 1) {
        style = Object.assign({}, ...arguments);
    }
    // If using the exact same object, return the same class
    let styleWrapper = styleMap.get(style);
    if (!styleWrapper) {
        styleWrapper = UI.DynamicStyleElement.create(document.body, {style: style});
        styleMap.set(style, styleWrapper);
    }
    return styleWrapper;
}

export {css, StyleSet, ExclusiveClassSet, styleMap, wrapCSS, hover, focus, active};
