// A separate implementation of StyleSheet, using native CSSStyleSheet

import {Dispatchable} from "../base/Dispatcher";
import {dashCase} from "../base/Utils";

class StyleRuleInstance {
    constructor(styleSheet, index, selector, style) {
        // super();
        if (index == -1) {
            index = styleSheet.cssRules.length;
        }
        this.selector = selector;
        this.styleSheet = styleSheet;
        this.style = style;
        let ruleText = this.getCSSText();
        let insertedIndex = styleSheet.insertRule(ruleText, index);
        this.cssRule = styleSheet.cssRules[insertedIndex];
    }

    getCSSText() {
        let style = this.style;
        let text = this.selector + "{";
        for (let key of Object.keys(style)) {
            let value = style[key];
            if (typeof value === "function") {
                value = value();
            }
            // Ignore keys with null or undefined value
            if (value == null) {
                continue;
            }
            // TODO: if key starts with vendor-, replace it with the browser specific one (and the plain one)
            // TODO: on some attributes, do we want to automatically add a px suffix?
            text += dashCase(key) + ":" + value + ";";
        }
        return text + "}";
    }

    setAttribute(key, value) {
        this.style[key] = value;
        this.update();
    }

    apply(style) {
        this.style = style;
        this.cssRule.cssText = this.getCSSText();
    }

    update() {
        this.apply(this.style);
    }
}

const ALLOWED_SELECTOR_STARTS = new Set([":", ">", " ", "+", "~", "[", "."]);

class StyleRuleGroup {
    constructor(styleSheet, style) {
        // super();
        this.styleSheet = styleSheet; // this is the native CSSStyleSheet
        this.className = this.constructor.getClassName();
        this.selectorMap = new Map();
        this.apply(style);
    }

    static getClassName() {
        this.instanceCounter = (this.instanceCounter || 0) + 1;
        return "acls-" + this.instanceCounter;
    }

    toString() {
        return this.className;
    }

    getSelector() {
        return "." + this.toString();
    }

    getStyleObject() {
        return this.style;
    }

    addRuleInstance(selector, style={}) {
        selector = String(selector);
        let existingRuleInstance = this.selectorMap.get(selector);
        if (existingRuleInstance) {
            existingRuleInstance.apply(style);
            return existingRuleInstance;
        }
        let ruleInstance = new StyleRuleInstance(this.styleSheet, -1, selector, style);
        this.selectorMap.set(selector, ruleInstance);
        return ruleInstance;
    }

    // A cyclic dependency in the style object will cause an infinite loop here
    static getStyleInstances(selector, style) {
        let result = [];
        let ownStyle = {}, haveOwnStyle = false;

        for (let key of Object.keys(style)) {
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
                    console.error("Unprocessable style key ", key);
                    continue;
                }
                let subStyle = this.getStyleInstances(selector + key, value);
                result.push(...subStyle);
            }
        }

        if (haveOwnStyle) {
            result.unshift({selector: selector, style: ownStyle});
        }
        return result;
    }

    apply(style) {
        this.style = style;
        let desiredStyleInstances = this.constructor.getStyleInstances(this.getSelector(), style);
        for (let styleInstance of desiredStyleInstances) {
            this.addRuleInstance(styleInstance.selector, styleInstance.style);
        }
        // TODO: remove rules for selector that aren't present anymore
    }

    update() {
        for (let ruleInstance of this.selectorMap.values()) {
            ruleInstance.update();
        }
    }
}

class StyleSheet extends Dispatchable {
    constructor(options={}) {
        super();
        options = Object.assign({
            updateOnResize: false,
            parent: document.head,
            name: options.name || this.constructor.getElementName(), // call only if needed
        }, options);

        this.options = options;
        this.elements = new Set();
        if (this.options.updateOnResize) {
            // TODO: add cleanup job here
            window.addEventListener("resize", () => {
                this.update();
            });
        }
        if (options.styleElement) {
            this.styleElement = options.styleElement;
        } else {
            this.styleElement = document.createElement("style");
            // Webkit hack, as seen on the internets
            this.styleElement.appendChild(document.createTextNode(""));
            // Insert the style element
            options.parent.appendChild(this.styleElement);
        }
    }

    static getInstance() {
        return (this.singletonInstance = this.singletonInstance || new this());
    }

    static getElementName() {
        this.elementNameCounter = (this.elementNameCounter || 0) + 1;
        let name = this.constructor.name;
        if (this.elementNameCounter > 1) {
            name += "-" + this.elementNameCounter;
        }
        return name;
    }

    getNativeStyleSheet() {
        return this.styleElement.sheet;
    }

    ensureFirstUpdate() {
        if (!this._firstUpdate) {
            this._firstUpdate = true;
            // Call all listeners before update for the very first time, to update any possible variables
            this.dispatch("beforeUpdate", this);
        }
    }

    css() {
        return this.styleRule(...arguments);
    }

    setDisabled(disabled) {
        this.getNativeStyleSheet().disabled = disabled;
    }

    styleRule(style) {
        this.ensureFirstUpdate();
        if (arguments.length > 1) {
            style = Object.assign({}, ...arguments);
        }
        let element = new StyleRuleGroup(this.getNativeStyleSheet(), style);
        this.elements.add(element);
        return element;
    }

    keyframe(keyframe) {
        this.ensureFirstUpdate();
        throw Error("Not implemented yet!");
    }

    keyframes(keyframes) {
        this.ensureFirstUpdate();
        throw Error("Not implemented yet!");
    }

    addBeforeUpdateListener(callback) {
        return this.addListener("beforeUpdate", callback);
    }

    update() {
        this.dispatch("beforeUpdate", this);
        for (let value of this.elements) {
            value.update();
        }
    }
}

export {StyleSheet};
