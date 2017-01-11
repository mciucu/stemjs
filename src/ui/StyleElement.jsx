// TODO: not sure is this needs to actually be *.jsx
import {UI} from "./UIBase";
import {dashCase} from "../base/Utils";
import {NodeAttributes} from "./NodeAttributes";

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
            // TODO: on some attributes, do we want to automatically add a px suffix?
            str += dashCase(key) + ":" + value + ";"
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
    getNodeType() {
        return "style";
    }

    getNodeAttributes() {
        // TODO: allow custom style attributes (media, scoped, etc)
        let attr = new NodeAttributes({});
        if (this.options.name) {
            attr.setAttribute("name", this.options.name);
        }
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

    render() {
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
