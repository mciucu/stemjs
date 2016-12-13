import {Dispatchable} from "../base/Dispatcher";

// Generic class through which we interact with HTML nodes
// TODO: is there a reason to keep this intermediary class?
class NodeWrapper extends Dispatchable {
    constructor(domNode, options) {
        super();
        this.node = domNode;
        this.options = options || {};
    }

    insertChildNodeBefore(childElement, nextSiblingNode) {
        this.node.insertBefore(childElement.node, nextSiblingNode);
    }

    // TODO: should be renamed emptyNode()
    clearNode() {
        while (this.node && this.node.lastChild) {
            this.node.removeChild(this.node.lastChild);
        }
    }

    // TODO: element method should be removed, there's no need to jquery dependencies
    get element() {
        if (!this._element) {
            this._element = $(this.node);
        }
        return this._element;
    }

    // TODO: rethink this!
    uniqueId() {
        if (!this.hasOwnProperty("uniqueIdStr")) {
        // TODO: should this be global?
            if (!this.constructor.hasOwnProperty("objectCount")) {
                this.constructor.objectCount = 0;
            }
            this.constructor.objectCount += 1;
            this.uniqueIdStr = this.constructor.objectCount + "-" + Math.random().toString(36).substr(2);
        }
        return this.uniqueIdStr;
    }

    getOffset() {
        let node = this.node;
        if (!node) {
            return {left: 0, top: 0};
        }
        let nodePosition = (node.style ? node.style.position : null);
        let left = 0;
        let top = 0;
        while (node) {
            let nodeStyle = node.style || {};
            if (nodePosition === "absolute" && nodeStyle.position === "relative") {
                return {left: left, top: top};
            }
            left += node.offsetLeft;
            top += node.offsetTop;
            node = node.offsetParent;
        }
        return {left: left, top: top};
    }

    getStyle(attribute) {
        return window.getComputedStyle(this.node, null).getPropertyValue(attribute);
    }

    // TODO: should be called isInDocument
    isInDocument() {
        return document.body.contains(this.node);
    }

    getWidthOrHeight(parameter) {
        let node = this.node;
        if (!node) {
            return 0;
        }
        let value = parseFloat(parameter === "width" ? node.offsetWidth : node.offsetHeight);
        // If for unknown reasons this happens, maybe this will work
        if (value == null) {
            value = parseFloat(this.getStyle(parameter));
        }
        if (isNaN(value)) {
            value = 0;
        }
        if (this.getStyle("box-sizing") === "border-box") {
            let attributes = ["padding-", "border-"];
            let directions = {
                width: ["left", "right"],
                height: ["top", "bottom"]
            };
            for (let i = 0; i < 2; i += 1) {
                for (let j = 0; j < 2; j += 1) {
                    value -= parseFloat(this.getStyle(attributes[i] + directions[parameter][j]));
                }
            }
        }
        return value;
    }

    getHeight() {
        return this.getWidthOrHeight("height");
    };

    getWidth() {
        return this.getWidthOrHeight("width");
    }

    setHeight(value) {
        if (typeof value === "number") {
            value += "px";
        }
        this.setStyle("height", value);
        this.dispatch("resize");
    };

    setWidth(value) {
        if (typeof value === "number") {
            value += "px";
        }
        this.setStyle("width", value);
        this.dispatch("resize");
    }

    addNodeListener(name, callback) {
        this.node.addEventListener(name, callback);
    }

    removeDOMListener(name, callback) {
        this.node.removeEventListener(name, callback);
    }

    addClickListener(callback) {
        this.addNodeListener("click", callback);
    }

    removeClickListener(callback) {
        this.removeDOMListener("click", callback);
    }

    addDoubleClickListener(callback) {
        this.addNodeListener("dblclick", callback);
    }

    removeDoubleClickListener(callback) {
        this.removeDOMListener("dblclick", callback);
    }

    // TODO: we need a consistent nomenclature, should be called addChangeListener
    addChangeListener(callback) {
        this.addNodeListener("change", callback);
    }

    // TODO: this should be done with decorators
    ensureFieldExists(name, value) {
        if (!this.hasOwnProperty(name)) {
            this[name] = value(this);
        }
        return this[name];
    }
}

export {NodeWrapper};
