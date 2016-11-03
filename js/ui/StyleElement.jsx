// TODO: not sure is this needs to actually be *.jsx
import {UI} from "UIBase";
import {Dispatchable} from "Dispatcher";
import {DOMAttributes} from "DOMAttributes";

// TODO: should this be actually better done throught the dynamic CSS API, without doing through the DOM?
UI.StyleInstance = class StyleInstance extends UI.TextElement {
    constructor(options) {
        super(options);
        this.setOptions(options);
    }

    setOptions(options) {
        this.options = options;
        this.options.attributes = this.options.attributes || {};
        this.attributes = new Map();
        for (let key in this.options.attributes) {
            this.attributes.set(key, this.options.attributes[key]);
        }
    }

    getValue() {
        let str = this.options.selector + "{";
        for (let [key, value] of this.attributes) {
            if (typeof value === "function") {
                value = value();
            }
            // Ignore keys with null or undefined value
            if (value == null) {
                continue;
            }
            // TODO: if key starts with vendor-, replace it with the browser specific one (and the plain one)
            // TODO: if key is camelCase, it should be changed to dash-case here
            // TODO: on some attributes, do we want to automatically add a px suffix?
            str += key + ":" + value + ";"
        }
        return str + "}"
    }

    copyState(element) {
        this.setOptions(element.options);
    }

    setAttribute(name, value) {
        this.attributes.set(name, value);
        this.redraw();
    }

    deleteAttribute(name) {
        this.attributes.delete(name);
        this.redraw();
    }
};

UI.StyleElement = class StyleElement extends UI.Element {
    getPrimitiveTag() {
        return "style";
    }

    getDOMAttributes() {
        // TODO: allow custom style attributes (media, scoped, etc)
        let attr = new DOMAttributes({});
        attr.setAttribute("name", this.options.name);
        return attr;
    }
};

const ALLOWED_SELECTOR_STARTS = new Set([":", ">", " ", "+", "~", "[", "."]);

// TODO: figure out how to work with animation frames, this only creates a wrapper class
UI.DynamicStyleElement = class DynamicStyleElement extends UI.StyleElement {
    toString() {
        return this.getClassName();
    }

    // TODO: use a cached decorator here
    getClassName() {
        if (this.className) {
            return this.className;
        }
        this.constructor.instanceCounter = (this.constructor.instanceCounter || 0) + 1;
        this.className = "autocls-" + this.constructor.instanceCounter;
        return this.className;
    }

    // A cyclic dependency in the style object will cause an infinite loop here
    getStyleInstances(selector, style) {
        let result = [];
        let ownStyle = {}, haveOwnStyle = false;
        for (let key in style) {
            let value = style[key];
            let isProperValue = (typeof value === "string" || value instanceof String
                              || typeof value === "number" || value instanceof Number
                              || typeof value === "function");
            if (isProperValue) {
                ownStyle[key] = value;
                haveOwnStyle = true;
            } else {
                // Check that this actually is a valid subselector
                let firstChar = String(key).charAt(0);
                if (!ALLOWED_SELECTOR_STARTS.has(firstChar)) {
                    // TODO: Log here?
                    continue;
                }
                // TODO: maybe optimize for waste here?
                let subStyle = this.getStyleInstances(selector + key, value);
                result.push(...subStyle);
            }
        }

        if (haveOwnStyle) {
            result.unshift(new UI.StyleInstance({selector: selector, key: selector, attributes: ownStyle}));
        }
        return result;
    }

    renderHTML() {
        return this.getStyleInstances("." + this.getClassName(), this.options.style || {});
    }

    setStyle(key, value) {
        this.options.style[key] = value;
        this.children[0].setAttribute(key, value);
    }

    setSubStyle(selector, key, value) {
        throw Error("Implement me!");
    }

    getStyleObject() {
        return this.options.style;
    }
};

// Class meant to group multiple classes inside a single <style> element, for convenience
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

    css(style) {
        if (arguments.length > 1) {
            style = Object.assign({}, ...arguments);
        }
        let element = new UI.DynamicStyleElement({style: style});
        this.elements.add(element);
        let styleInstances = element.renderHTML();
        for (let styleInstance of styleInstances) {
            this.styleElement.appendChild(styleInstance);
        }
        return element;
    }

    keyframe(styles) {
        throw Error("Not implemented yet!");
    }

    addBeforeUpdateListener(callback) {
        return this.addListener("beforeUpdate", callback);
    }

    update() {
        let start = performance.now();
        this.dispatch("beforeUpdate", this);
        let children = [];
        for (let value of this.elements) {
            if (value instanceof UI.StyleElement) {
                let styleElements = value.renderHTML();
                children.push(...styleElements);
            }
        }
        this.styleElement.options.children = children;
        this.styleElement.redraw();
        console.log("Duration: ", (performance.now() - start));
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

// Disable for now
// UI.ConstructorStyleSetMixin = function (BaseClass) {
//     if (!(BaseClass instanceof UI.ConstructorInitMixin)) {
//         BaseClass = UI.ConstructorInitMixin(BaseClass);
//     }
//
//     class ConstructorStyleSetMixin extends BaseClass {
//         static getStyleSet(options={}) {
//             if (!this.prototype.css) {
//                 this.prototype.css = new StyleSet(options);
//             }
//             return this.prototype.css;
//         }
//     }
//
//     return ConstructorStyleSetMixin;
// };

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
