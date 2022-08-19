import {dashCase, isNumber, isString, isPlainObject, setObjectPrototype} from "../base/Utils";

export const defaultToPixelsAttributes = new Set([
    "border-radius",
    "border-bottom-left-radius",
    "border-bottom-right-radius",
    "border-top-left-radius",
    "border-top-right-radius",
    "border-bottom-width",
    "border-left-width",
    "border-right-width",
    "border-top-width",
    "border-width",
    "bottom",
    "font-size",
    "font-stretch",
    "height",
    "layer-grid-char",
    "layer-grid-char-spacing",
    "layer-grid-line",
    "left",
    "letter-spacing",
    "line-height",
    "margin",
    "margin-bottom",
    "margin-left",
    "margin-right",
    "margin-top",
    "marker-offset",
    "max-height",
    "max-width",
    "min-height",
    "min-width",
    "outline-width",
    "padding",
    "padding-bottom",
    "padding-left",
    "padding-right",
    "padding-top",
    "right",
    "size",
    "top",
    "width",
    "word-spacing",
]);

// Used to map from option key to a DOM attribute name.
// Can recursively fall back to a base mapping, to allow extending of a parent class
export class DOMAttributesMap {
    allowedAttributesMap = new Map();
    reverseNameMap = new Map();

    constructor(fallbackMapping, allowedAttributesArray = [], allowedPrefixes = []) {
        this.fallbackMapping = fallbackMapping;

        for (let attribute of allowedAttributesArray) {
            if (!Array.isArray(attribute)) {
                attribute = [attribute];
            }

            this.setAttribute(attribute[0], attribute[1]);
        }

        this.allowedPrefixes = allowedPrefixes;
    }

    setAttribute(key, value) {
        value = value || {};
        value.domName = value.domName || key;

        this.allowedAttributesMap.set(key, value);
        this.reverseNameMap.set(value.domName, key);
    }

    get(key) {
        for (const prefix of this.allowedPrefixes) {
            if (key.startsWith(prefix)) {
                return {
                    domName: key,
                }
            }
        }
        let value = this.allowedAttributesMap.get(key);
        if (!value && this.fallbackMapping) {
            value = this.fallbackMapping.get(key);
        }
        return value;
    }

    has(key) {
        return this.allowedAttributesMap.has(key) || (this.fallbackMapping && this.fallbackMapping.has(key));
    }

    getKeyFromDOMName(key) {
        let value = this.reverseNameMap.get(key);
        if (!value && this.fallbackMapping) {
            value = this.fallbackMapping.getKeyFromDOMName(key);
        }
        return value;
    }
}

// A class that can be used to work with a className field as with a Set, while having a toString() usable in the DOM
// It's used when a UI object has a className attribute, that a string, but we still want it to be modified if we call addClass and removeClass
// In that case, the string gets converted to a ClassNameSet
export class ClassNameSet extends Set {
    // Can't use classic super in constructor since Set is build-in type and will throw an error
    // TODO: see if could still be made to have this as constructor
    static create(className) {
        let value = new Set(String(className || "").split(" "));
        return setObjectPrototype(value, this);
    }

    toString() {
        return Array.from(this).join(" ");
    }
}

export class NodeAttributes {
    constructor(obj) {
        Object.assign(this, obj);
        // className and style should be deep copied to be modifiable, the others shallow copied
        if (this.className instanceof ClassNameSet) {
            this.className = ClassNameSet.create(String(this.className));
        }
        if (isPlainObject(this.style)) {
            // Make a copy, since we might modify it later
            this.style = Object.assign({}, this.style);
        }
    }

    // Change the attribute & apply it, regardless if it exists in the attribute map (in that case it's whitelisted)
    // TODO: should this use the domName or the reverseName? Still needs work
    setAttribute(key, value, node, attributesMap=this.constructor.defaultAttributesMap) {
        // TODO: might want to find a better way than whitelistAttributes field to do this
        if (!attributesMap.has(key)) {
            this.whitelistedAttributes = this.whitelistedAttributes || {}; // TODO: reconsider the whitelisted attributes
            this.whitelistedAttributes[key] = true;
        }
        this[key] = value;
        if (node) {
            this.applyAttribute(key, node, attributesMap);
        }
    }

    applyStyleToNode(key, value, node) {
        if (typeof value === "function") {
            value = value();
        }
        if (isNumber(value) && value != 0 && defaultToPixelsAttributes.has(dashCase(key))) {
            value = value + "px";
        }
        if (node && node.style[key] !== value) {
            node.style[key] = value;
        }
    }

    // Should the style property have been passed in as a string, save it to the variable that will be applied before the string object.
    ensureNoStringStyle() {
        if (isString(this.style)) {
            this.styleString = this.style; // Keep in a temp value
            delete this.style;
        }
    }

    setStyle(key, value, node) {
        if (!isString(key)) {
            // If the key is not a string, it should be a plain object
            for (const styleKey of Object.keys(key)) {
                this.setStyle(styleKey, key[styleKey], node);
            }
            return;
        }
        if (value === undefined) {
            this.removeStyle(key, node);
            return;
        }
        this.ensureNoStringStyle();
        this.style = this.style || {};
        this.style[key] = value;
        this.applyStyleToNode(key, value, node);
    }

    removeStyle(key, node) {
        if (this.style) {
            delete this.style[key];
        }
        if (node && node.style[key]) {
            delete node.style[key];
        }
    }

    static getClassArray(classes) {
        if (!classes) {
            return [];
        }
        if (Array.isArray(classes)) {
            return classes.map(x => String(x).trim());
        } else {
            return String(classes).trim().split(" ");
        }
    }

    getClassNameSet() {
        if (!(this.className instanceof ClassNameSet)) {
            this.className = ClassNameSet.create(this.className || "");
        }
        return this.className;
    }

    addClass(classes, node) {
        classes = this.constructor.getClassArray(classes);

        for (let cls of classes) {
            this.getClassNameSet().add(cls);
            if (node) {
                node.classList.add(cls);
            }
        }
    }

    removeClass(classes, node) {
        classes = this.constructor.getClassArray(classes);

        for (let cls of classes) {
            this.getClassNameSet().delete(cls);
            if (node) {
                node.classList.remove(cls);
            }
        }
    }

    hasClass(className) {
        return this.getClassNameSet().has(isString(className) ? className : className.className);
    }

    // Apply the attribute only if it's in the attributesMap
    applyAttribute(key, node, attributesMap) {
        let attributeOptions = attributesMap.get(key);
        if (!attributeOptions) {
            if (this.whitelistedAttributes && (key in this.whitelistedAttributes)) {
                attributeOptions = {
                    domName: key,
                }
            } else {
                return;
            }
        }
        let value = this[key];
        if (typeof value === "function") {
            value = value();
        }
        if (attributeOptions.noValue) {
            if (value) {
                value = "";
            } else {
                value = undefined;
            }
        }
        if (typeof value !== "undefined") {
            node.setAttribute(attributeOptions.domName, value);
        } else {
            node.removeAttribute(attributeOptions.domName);
        }
    }

    applyClassName(node) {
        if (this.className) {
            const className = String(this.className);
            if (node.className != className) {
                node.className = className;
            }
        } else {
            if (node.className) {
                node.removeAttribute("class");
            }
        }
    }

    apply(node, attributesMap) {
        let addedAttributes = {};
        let whitelistedAttributes = this.whitelistedAttributes || {};

        // First update existing node attributes and delete old ones
        // TODO: optimize to not run this if the node was freshly created
        let nodeAttributes = node.attributes;
        for (let i = nodeAttributes.length - 1; i >= 0; i--) {
            let attr = nodeAttributes[i];
            let attributeName = attr.name;
            if (attributeName === "style" || attributeName === "class") {
                // TODO: maybe should do work here?
                continue;
            }

            let key = attributesMap.getKeyFromDOMName(attributeName);

            if (this.hasOwnProperty(key)) {
                let value = this[key];
                let attributeOptions = attributesMap.get(key);
                if (attributeOptions && attributeOptions.noValue) {
                    if (value) {
                        value = "";
                    } else {
                        value = undefined;
                    }
                }
                if (value != null) {
                    node.setAttribute(attributeName, value);
                    addedAttributes[key] = true;
                } else {
                    node.removeAttribute(attributeName);
                }
            } else {
                node.removeAttribute(attributeName);
            }
        }
        // Add new attributes
        for (let key in this) {
            if (addedAttributes[key]) {
                continue;
            }
            this.applyAttribute(key, node, attributesMap);
        }

        this.applyClassName(node);

        node.removeAttribute("style");
        this.ensureNoStringStyle();
        if (this.styleString) {
            node.style = this.styleString;
        }
        if (this.style) {
            for (const key of Object.keys(this.style)) {
                this.applyStyleToNode(key, this.style[key], node);
            }
        }
    }
}

// Default node attributes, should be as few of these as possible
NodeAttributes.defaultAttributesMap = new DOMAttributesMap(null, [
    ["id"],
    ["action"],
    ["colspan"],
    ["default"],
    ["disabled", {noValue: true}],
    ["fixed"],
    ["forAttr", {domName: "for"}], // TODO: have a consistent nomenclature for there!
    ["hidden"],
    ["href"],
    ["rel"],
    ["minHeight"],
    ["minWidth"],
    ["role"],
    ["target"],
    ["domTitle", {domName: "title"}],  // TODO titleAttr?
    ["type"],
    ["placeholder"],
    ["src"],
    ["alt"],
    ["height"],
    ["width"],
    ["tabIndex"],
    //["value"], // Value is intentionally disabled
], [
    "data-",
    "aria-",
]);
