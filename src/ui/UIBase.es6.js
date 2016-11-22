import * as Utils from "../base/Utils";
import {NodeWrapper} from "./NodeWrapper";
import {DOMAttributes, ATTRIBUTE_NAMES_MAP} from "./DOMAttributes";

var UI = {
    renderingStack: [], //keeps track of objects that are redrawing, to know where to assign refs automatically
};

UI.TextElement = class UITextElement {
    constructor(options) {
        let value = "";
        if (typeof options === "string" || options instanceof String || typeof options === "number" || options instanceof Number) {
            value = String(options);
            options = null;
        } else {
            value = options.value || value;
        }
        this.setValue(value);
        if (options) {
            this.options = options;
        }
    }

    mount(parent, nextSibling) {
        this.parent = parent;
        if (!this.node) {
            this.createNode();
        }
        this.redraw();
        parent.node.insertBefore(this.node, nextSibling);
    }

    canOverwrite(existingChild) {
        return existingChild.constructor === this.constructor;
    }

    getPrimitiveTag() {
        return Node.TEXT_NODE;
    }

    cleanup() {
        // Nothing to do for plain text elements
    }

    copyState(element) {
        this.setValue(element.getValue());
    }

    createNode() {
        this.node = document.createTextNode(this.value);
        return this.node;
    }

    setValue(value) {
        this.value = String(value);
        if (this.node) {
            this.redraw();
        }
    }

    getValue() {
        return this.value;
    }

    redraw() {
        if (this.node) {
            let newValue = this.getValue();
            if (this.node.nodeValue !== newValue) {
                this.node.nodeValue = newValue;
            }
        }
        //TODO: make common with UI.Element
        if (this.options && this.options.ref) {
            let obj = this.options.ref.parent;
            let name = this.options.ref.name;
            obj[name] = this;
        }
    }
};

//Some changes to the basic API for UI.Element need to be mirrored in UI.TextElement
class UIElement extends NodeWrapper {
    constructor(options) {
        options = options || {};
        super(null, options, true);
        this.children = [];
        this.setOptions(options);
    };

    setOptions(options) {
        this.options = options || {};
        this.options.children = this.options.children || [];

        if (options.hasOwnProperty("class")) {
            console.error("Invalid UIElement attribute: class. Did you mean className?");
        }
    }

    updateOptions(options) {
        let updatedOptions = Object.assign(this.options, options);
        this.setOptions(updatedOptions);
    }

    copyState(element) {
        this.setOptions(element.options);
    }

    //TODO: should be renamed to getDocumentTag or getTag, or getHTMLTag ?
    getPrimitiveTag() {
        return this.options.primitiveTag || "div";
    }

    static create(parentNode, options) {
        let uiElement = new this(options);
        uiElement.mount(parentNode, null);
        return uiElement;
    }

    getGivenChildren() {
        return this.options.children || [];
    }

    getTitle() {
        return this.options.title || "";
    }

    renderHTML() {
        return this.options.children;
    };

    createNode() {
        this.node = document.createElement(this.getPrimitiveTag());
        return this.node;
    }

    destroyNode() {
        this.cleanup();
        this.node.remove();
        this.node = undefined;
    }

    // Abstract, gets called when removing DOM node associated with the
    cleanup() {
        this.runCleanupJobs();
        for (let child of this.children) {
            child.cleanup();
        }
        this.clearNode();
        super.cleanup();
    }

    applyRef() {
        // TODO: remove old field names
        if (this.options.ref) {
            let obj = this.options.ref.parent;
            let name = this.options.ref.name;
            obj[name] = this;
        }
    }

    canOverwrite(existingChild) {
        return this.constructor === existingChild.constructor &&
                this.getPrimitiveTag() === existingChild.getPrimitiveTag();
    }

    overwriteChild(existingChild, newChild) {
        existingChild.copyState(newChild);
        return existingChild;
    }

    getElementKeyMap(elements) {
        let childrenKeyMap = new Map();

        for (let i = 0; i < elements.length; i += 1) {
            let childKey = (elements[i].options && elements[i].options.key) || ("autokey" + i);

            childrenKeyMap.set(childKey, elements[i]);
        }

        return childrenKeyMap;
    }

    redraw() {
        if (!this.node) {
            console.warn("Element not yet mounted. Redraw aborted!", this);
            return false;
        }

        UI.renderingStack.push(this);
        let newChildren = Utils.unwrapArray(this.renderHTML());
        UI.renderingStack.pop();

        if (newChildren === this.children) {
            for (let i = 0; i < newChildren.length; i += 1) {
                newChildren[i].redraw();
            }
            //TODO: also handle ref stuff here
            this.applyDOMAttributes();
            return;
        }

        let domNode = this.node;
        let childrenKeyMap = this.getElementKeyMap(this.children);

        for (let i = 0; i < newChildren.length; i++) {
            let newChild = newChildren[i];
            let prevChildNode = (i > 0) ? newChildren[i - 1].node : null;
            let currentChildNode = (prevChildNode) ? prevChildNode.nextSibling : domNode.firstChild;

            // Not an UIElement, to be converted to a TextElement
            if (!newChild.getPrimitiveTag) {
                newChild = newChildren[i] = new UI.TextElement(newChild);
            }

            // this means we are an UIElement
            let newChildKey = (newChild.options && newChild.options.key) || ("autokey" + i);
            let existingChild = childrenKeyMap.get(newChildKey);

            if (existingChild && newChildren[i].canOverwrite(existingChild)) {
                // We're replacing an existing child element, it might be the very same object
                if (existingChild !== newChildren[i]) {
                    newChildren[i] = this.overwriteChild(existingChild, newChildren[i]);
                }
                newChildren[i].redraw();
                if (newChildren[i].node !== currentChildNode) {
                    domNode.insertBefore(newChildren[i].node, currentChildNode);
                }
            } else {
                // Getting here means we are not replacing anything, should just render
                newChild.mount(this, currentChildNode);
            }
        }

        let newChildrenNodes = new Set();
        for (let i = 0; i < newChildren.length; i += 1) {
            newChildrenNodes.add(newChildren[i].node);
        }

        for (let i = 0; i < this.children.length; i += 1) {
            if (!newChildrenNodes.has(this.children[i].node)) {
                //TODO: should call this.children[i].destroyNode()
                this.children[i].cleanup();
                domNode.removeChild(this.children[i].node);
            }
        }

        this.children = newChildren;

        this.applyDOMAttributes();

        this.applyRef();

        return true;
    }

    applyDOMAttributes() {
        this.domAttributes = this.getDOMAttributes();
        this.domAttributes.apply(this.node);
    }

    setAttribute(key, value) {
        this.options[key] = value;

        if (typeof value === "function") {
            value = value(this);
        }

        if (this.node) {
            this.node.setAttribute(key, value);
        }
    }

    setStyle(attributeName, value) {
        if (this.options.style) {
            this.options.style[attributeName] = value;
        } else {
            this.options.style = {
                [attributeName]: value
            }
        }

        if (typeof value === "function") {
            value = value(this);
        }

        if (this.node) {
            this.node.style[attributeName] = value;
        }
    }

    addClass(className) {
        this.domAttributes.addClass(String(className), this.node);
    }

    removeClass(className) {
        this.domAttributes.removeClass(String(className), this.node);
    }

    hasClass(className) {
        return this.node && this.node.classList.contains(className);
    }

    toggleClass(className) {
        if (!this.hasClass(className)) {
            this.addClass(className);
        } else {
            this.removeClass(className);
        }
    }

    getDOMAttributes() {
        if (this.constructor.extraDOMAttributes) {
            let domAttributes = super.getDOMAttributes();
            this.extraDOMAttributes(domAttributes);
            return domAttributes;
        } else {
            return new DOMAttributes(this.options, this.constructor.domAttributesMap);
        }
    }

    refLink(name) {
        return {parent: this, name: name};
    }

    refLinkArray(arrayName, index) {
        if (!this.hasOwnProperty(arrayName)) {
            this[arrayName] = [];
        }

        while (index >= this[arrayName].length) {
            this[arrayName].push(null);
        }

        return {parent: this[arrayName], name: index};
    }

    mount(parent, nextSiblingNode) {
        if (!parent.node) {
            parent = new NodeWrapper(parent);
        }
        this.parent = parent;
        if (!this.node) {
            this.createNode();
        }
        this.redraw();

        parent.insertChildNodeBefore(this, nextSiblingNode);

        // TODO: this should be cleaned up
        if (this.options.onClick) {
            this.onClickHandler = (event) => {
                UI.event = event;
                if (this.options.onClick) {
                    this.options.onClick(this);
                }
            };
            this.addClickListener(this.onClickHandler);
            //TODO: THIS NEEDS TO BE REMOVED
        }
        this.onMount();
    }

    onMount() {}

    // You need to overwrite this if this.options.children !== this.children
    appendChild(child) {
        if (this.children !== this.options.children) {
            throw "Can't properly handle appendChild, you need to implement it for " + this.constructor;
        }
        this.options.children.push(child);
        child.mount(this, null);
        return child;
    }

    insertChild(child, position) {
        if (this.children !== this.options.children) {
            throw "Can't properly handle insertChild, you need to implement it for " + this.constructor;
        }
        position = position || 0;

        this.options.children.splice(position, 0, child);

        child.mount(this, position + 1 < this.options.children.length ? this.children[position + 1].node : null);

        return child;
    }

    eraseChild(child, destroy=true) {
        let index = this.options.children.indexOf(child);

        if (index < 0) {
            // child not found
            return null;
        }
        return this.eraseChildAtIndex(index, destroy);
    }

    eraseChildAtIndex(index, destroy=true) {
        if (index < 0 || index >= this.options.children.length) {
            console.error("Erasing child at invalid index ", index, this.options.children.length);
            return;
        }
        if (this.children !== this.options.children) {
            throw "Can't properly handle eraseChild, you need to implement it for " + this.constructor;
        }
        let erasedChild = this.options.children.splice(index, 1)[0];
        if (destroy) {
            erasedChild.destroyNode();
        } else {
            this.node.removeChild(erasedChild.node);
        }
        return erasedChild;
    }

    eraseAllChildren() {
        while (this.children.length > 0) {
            this.eraseChildAtIndex(this.children.length - 1);
        }
    }

    show() {
        this.removeClass("hidden");
    }

    hide() {
        this.addClass("hidden");
    }
}

UIElement.domAttributesMap = ATTRIBUTE_NAMES_MAP;

UI.createElement = function (tag, options) {
    if (!tag) {
        console.error("Create element needs a valid object tag, did you mistype a class name?");
        return;
    }

    options = options || {};

    if (!options.children || arguments.length > 2) {
        options.children = [];

        for (let i = 2; i < arguments.length; i += 1) {
            options.children.push(arguments[i]);
        }

    }
    options.children = [];

    for (let i = 2; i < arguments.length; i += 1) {
        options.children.push(arguments[i]);
    }

    options.children = Utils.unwrapArray(options.children);

    if (options.ref) {
        if (typeof options.ref === "string") {
            if (UI.renderingStack.length > 0) {
                options.ref = {
                    parent: UI.renderingStack[UI.renderingStack.length - 1],
                    name: options.ref
                };
            } else {
                throw Error("Failed to automatically link ref, there needs to be an element in the rendering stack");
            }
        }

        if (options.key) {
            console.error("Warning! UI Element cannot have both a key and a ref fieldname. Key will be overriden.\n" +
                          "Are you using the options from another object?", options);
        }

        options.key = "_ref" + options.ref.name;
    }

    if (typeof tag === "string") {
        options.primitiveTag = tag;
        tag = UIElement;
    }

    return new tag(options);
};

UI.Element = UIElement;

UI.str = function (value) {
    return new UI.TextElement({value: value});
};

// TODO: code shouldn't use UIElement directly, but through UI.Element
export {UIElement, UI, ATTRIBUTE_NAMES_MAP};
