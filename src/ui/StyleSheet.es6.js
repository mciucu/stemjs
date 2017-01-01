import {Dispatchable} from "../base/Dispatcher";

class StyleRule extends Dispatchable {
    constructor(selector, style={}) {
        super();
        this.style = style;
    }
}

class StyleRuleGroup extends Dispatchable {
    constructor(styleSheet, style) {
        super();
        this.styleSheet = styleSheet;
        this.style = style;
        this.rules = [];
        this.className = this.constructor.getClassName();
    }

    static getClassName() {
        this.instanceCounter = (this.instanceCounter || 0) + 1;
        return "autocls-" + this.instanceCounter;
    }

    toString() {
        return this.className;
    }

    createRule(selector, style={}) {
        let styleRule = new StyleRule(selector, style);
        this.rules.push(styleRule);
        return styleRule;
    }

    update() {
    }
}

class StyleSheet extends Dispatchable {
    constructor(options={}) {
        super();
        this.options = options;
        this.elements = new Set();
        if (this.options.updateOnResize) {
            this.attachEventListener(window, "resize", () => {
                this.update();
            });
        }
        this.styleElement = document.createElement("style");
        // Webkit hack, as seen on the internets
	    this.styleElement.appendChild(document.createTextNode(''));
        // Insert the style element
        (options.parent || document.head).appendChild(this.styleElement);
        this.domSheet = this.styleElement.node.sheet;
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
        let element = new StyleRuleGroup(this, style);
        this.elements.add(element);
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
        for (let value of this.elements) {
            value.update();
        }
    }
}

export {StyleSheet};
