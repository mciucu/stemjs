import {UI} from "./UIBase";
import {dashCase} from "../base/Utils";
import {NodeAttributes, defaultToPixelsAttributes} from "./NodeAttributes";

// TODO: should this be actually better done throught the dynamic CSS API, without doing through the DOM?
// So far it's actually better like this, since browsers like Chrome allow users to edit classes
class StyleInstance extends UI.TextElement {
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

            key = dashCase(key);

            // If it's a size property, and the value is a number, assume it's in pixels
            if ((value instanceof Number || typeof value === "number") &&
                value != 0 && defaultToPixelsAttributes.has(key)) {
                value = value + "px";
            }

            // TODO: if key starts with vendor-, replace it with the browser specific one (and the plain one)
            str += key + ":" + value + ";";
        }
        return str + "}";
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
}

class StyleElement extends UI.Primitive("style") {
    getNodeAttributes() {
        // TODO: allow custom style attributes (media, scoped, etc)
        let attr = new NodeAttributes({});
        if (this.options.name) {
            attr.setAttribute("name", this.options.name);
        }
        return attr;
    }
}

const ALLOWED_SELECTOR_STARTS = new Set([":", ">", " ", "+", "~", "[", "."]);

// TODO: figure out how to work with animation frames, this only creates a wrapper class
class DynamicStyleElement extends StyleElement {
    toString() {
        return this.getClassName();
    }

    // Overwrite valueOf, so when using the + operator should seamlessly concatenate to create a valid className
    valueOf() {
        return " " + this.getClassName();
    }

    // TODO: use a cached decorator here
    getClassName() {
        if (this.className) {
            return this.className;
        }
        this.constructor.instanceCounter = (this.constructor.instanceCounter || 0) + 1;
        this.className = (this.options.name ||  "autocls") + "-" + this.constructor.instanceCounter;
        return this.className;
    }

    getSelector() {
        return this.options.selectorName || "." + this.getClassName();
    }

    // A cyclic dependency in the style object will cause an infinite loop here
    getStyleInstances(selector, style) {
        let result = [];
        let ownStyle = {}, haveOwnStyle = false;
        for (let key in style) {
            let value = style[key];
            if (value == null) {
                continue;
            }
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
                    console.error("First character of your selector is invalid.");
                    continue;
                }
                // TODO: maybe optimize for waste here?
                let subStyle = this.getStyleInstances(selector + key, value);
                result.push(...subStyle);
            }
        }

        if (haveOwnStyle) {
            result.unshift(new StyleInstance({selector: selector, key: selector, attributes: ownStyle}));
        }
        return result;
    }

    render() {
        let style = this.options.style || {};
        if (typeof style === "function") {
            style = style();
        }
        if (style.selectorName) {
            this.options.selectorName = style.selectorName;
            delete style.selectorName;
        }
        return this.getStyleInstances(this.getSelector(), style);
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
}

class KeyframeElement extends StyleElement {
    toString() {
        return this.getKeyframeName();
    }

    getKeyframeName() {
        if (this.keyframeName) {
            return this.keyframeName;
        }
        this.constructor.instanceCounter = (this.constructor.instanceCounter || 0) + 1;
        this.keyframeName = (this.options.name || "autokeyframe") + "-" + this.constructor.instanceCounter;
        return this.keyframeName;
    }

    getValue(style) {
        let str = "{";
        for (let key in style) {
            let value = style[key];
            if (typeof value === "function") {
                value = value();
            }
            if (value == null) {
                continue;
            }
            str += dashCase(key) + ":" + value + ";";
        }
        return str + "}";
    }

    getKeyframeInstance(keyframe) {
        let result = "{";
        for (let key in keyframe) {
            let value = keyframe[key];
            result += key + " " + this.getValue(value);
        }
        return result + "}";
    }

    render() {
        return "@keyframes " + this.getKeyframeName() + this.getKeyframeInstance(this.options.keyframe || {});
    }
}

export {StyleInstance, StyleElement, KeyframeElement, DynamicStyleElement}
