import {unwrapArray} from "../base/Utils";
import {Dispatchable} from "../base/Dispatcher";
import {DOMAttributes, ATTRIBUTE_NAMES_MAP} from "./DOMAttributes";

var UI = {
    renderingStack: [], //keeps track of objects that are redrawing, to know where to assign refs automatically
};

class BaseUIElement extends Dispatchable {
    canOverwrite(existingChild) {
        return this.constructor === existingChild.constructor &&
               this.getNodeType() === existingChild.getNodeType();
    }

    applyRef() {
        if (this.options && this.options.ref) {
            let obj = this.options.ref.parent;
            let name = this.options.ref.name;
            obj[name] = this;
        }
    }

    removeRef() {
        if (this.options && this.options.ref) {
            let obj = this.options.ref.parent;
            let name = this.options.ref.name;
            if (obj[name] === this) {
                obj[name] = undefined;
            }
        }
    }

    onUnmount() {}

    destroyNode() {
        this.onUnmount();
        this.cleanup();
        this.removeRef();
        this.node.remove();
        this.node = undefined; // Clear for gc
    }
}

UI.TextElement = class UITextElement extends BaseUIElement {
    constructor(value="") {
        super();
        if (value && value.value) {
            this.value = value.value;
            this.options = value;
        } else {
            this.value = (value != null) ? value : "";
        }
    }

    mount(parent, nextSibling) {
        this.parent = parent;
        if (!this.node) {
            this.createNode();
            this.applyRef();
        } else {
            this.redraw();
        }
        parent.node.insertBefore(this.node, nextSibling);
    }

    getNodeType() {
        return Node.TEXT_NODE;
    }

    copyState(element) {
        this.value = element.value;
        this.options = element.options;
    }

    createNode() {
        return this.node = document.createTextNode(this.getValue());
    }

    setValue(value) {
        this.value = (value != null) ? value : "";
        if (this.node) {
            this.redraw();
        }
    }

    getValue() {
        return String(this.value);
    }

    redraw() {
        if (this.node) {
            let newValue = this.getValue();
            // TODO: check if this is best for performance
            if (this.node.nodeValue !== newValue) {
                this.node.nodeValue = newValue;
            }
        }
        this.applyRef();
    }
};

class UIElement extends BaseUIElement {
    constructor(options={}) {
        super();
        this.children = [];
        this.options = options; // TODO: this is a hack, to not break all the code that references this.options in setOptions
        this.setOptions(options);
    };

    setOptions(options) {
        this.options = options;
        this.options.children = this.options.children || [];
    }

    updateOptions(options) {
        this.setOptions(Object.assign(this.options, options));
        this.redraw();
    }

    setChildren(...args) {
        this.updateOptions({children: unwrapArray(args)})
    }

    // Used when we want to reuse the current element, with the options from the passed in argument
    // Is only called when element.canOverwrite(this) is true
    copyState(element) {
        this.setOptions(element.options);
    }

    getNodeType() {
        return this.options.nodeType || "div";
    }

    static create(parentNode, options) {
        let uiElement = new this(options);
        uiElement.mount(parentNode, null);
        return uiElement;
    }

    // TODO: should be renamed to renderContent
    getGivenChildren() {
        return this.options.children || [];
    }

    render() {
        return this.options.children;
    };

    createNode() {
        return this.node = document.createElement(this.getNodeType());
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

    overwriteChild(existingChild, newChild) {
        existingChild.copyState(newChild);
        return existingChild;
    }

    getElementKeyMap(elements) {
        if (!elements || !elements.length) {
            return;
        }
        let childrenKeyMap = new Map();

        for (let i = 0; i < elements.length; i += 1) {
            let childKey = (elements[i].options && elements[i].options.key) || ("autokey" + i);

            childrenKeyMap.set(childKey, elements[i]);
        }

        return childrenKeyMap;
    }

    redraw() {
        if (!this.node) {
            console.error("Element not yet mounted. Redraw aborted!", this);
            return false;
        }

        UI.renderingStack.push(this);
        let newChildren = unwrapArray(this.render());
        UI.renderingStack.pop();

        if (newChildren === this.children) {
            for (let i = 0; i < newChildren.length; i += 1) {
                newChildren[i].redraw();
            }
            this.applyNodeAttributes();
            this.applyRef();
            return true;
        }

        let domNode = this.node;
        let childrenKeyMap = this.getElementKeyMap(this.children);

        for (let i = 0; i < newChildren.length; i++) {
            let newChild = newChildren[i];
            let prevChildNode = (i > 0) ? newChildren[i - 1].node : null;
            let currentChildNode = (prevChildNode) ? prevChildNode.nextSibling : domNode.firstChild;

            // Not a UIElement, to be converted to a TextElement
            if (!newChild.getNodeType) {
                newChild = newChildren[i] = new UI.TextElement(newChild);
            }

            let newChildKey = (newChild.options && newChild.options.key) || ("autokey" + i);
            let existingChild = childrenKeyMap && childrenKeyMap.get(newChildKey);

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

        if (this.children.length) {
            // Remove children that don't need to be here
            let newChildrenSet = new Set(newChildren);

            for (let i = 0; i < this.children.length; i += 1) {
                if (!newChildrenSet.has(this.children[i])) {
                    this.children[i].destroyNode();
                }
            }
        }

        this.children = newChildren;

        this.applyNodeAttributes();

        this.applyRef();

        return true;
    }

    getNodeAttributes() {
        let attr = new DOMAttributes(this.options, this.constructor.domAttributesMap);
        this.extraNodeAttributes(attr);
        return attr;
    }

    extraNodeAttributes(attr) {
        // Overwrite this if you want to add any other attributes from the default ones
    }

    applyNodeAttributes() {
        this.domAttributes = this.getNodeAttributes();
        this.domAttributes.apply(this.node);
    }

    setAttribute(key, value) {
        this.options[key] = value;

        if (this.node) {
            if (typeof value === "function") {
                value = value(this);
            }
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

        if (this.node) {
            if (typeof value === "function") {
                value = value(this);
            }
            this.node.style[attributeName] = value;
        }
    }

    // TODO: rewrite to not use this.domAttributes
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

    refLink(name) {
        return {parent: this, name: name};
    }

    refLinkArray(arrayName, index) {
        if (!this.hasOwnProperty(arrayName)) {
            this[arrayName] = [];
        }
        return {parent: this[arrayName], name: index};
    }

    mount(parent, nextSiblingNode) {
        if (!parent.node) {
            let parentWrapper = new UI.Element();
            parentWrapper.node = parent;
            parent = parentWrapper;
        }
        this.parent = parent;
        if (!this.node) {
            this.createNode();
        }
        this.redraw();

        parent.insertChildNodeBefore(this, nextSiblingNode);

        // TODO: not a great pattern to have this here
        if (this.options.onClick) {
            this.onClickHandler = (event) => {
                UI.event = event;
                if (this.options.onClick) {
                    this.options.onClick(this, event);
                }
            };
            this.addClickListener(this.onClickHandler);
        }
        this.onMount();
    }

    onMount() {
        // Nothing by default
    }

    // You need to overwrite the next child manipulation rutines if this.options.children !== this.children
    appendChild(child) {
        // TODO: the next check should be done with a decorator
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

    insertChildNodeBefore(childElement, nextSiblingNode) {
        this.node.insertBefore(childElement.node, nextSiblingNode);
    }

    // TODO: should be renamed emptyNode()
    clearNode() {
        while (this.node && this.node.lastChild) {
            this.node.removeChild(this.node.lastChild);
        }
    }

    // TODO: rethink this, should probably be in utils
    uniqueId() {
        if (!this.hasOwnProperty("uniqueIdStr")) {
            // TODO: should this be global?
            this.constructor.objectCount = (this.constructor.objectCount || 0) + 1;
            this.uniqueIdStr = this.constructor.objectCount + "R" + Math.random().toString(36).substr(2);
        }
        return this.uniqueIdStr;
    }

    // TODO: this doesn't belong here
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
        // TODO: WHY THIS?
        return window.getComputedStyle(this.node, null).getPropertyValue(attribute);
    }

    isInDocument() {
        return document.body.contains(this.node);
    }

    // TODO: this method also doesn't belong here
    getWidthOrHeight(parameter) {
        let node = this.node;
        if (!node) {
            return 0;
        }
        let value = parseFloat(parameter === "width" ? node.offsetWidth : node.offsetHeight);
        return value || 0;
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
        return {
            remove: () => this.removeNodeListener(name, callback),
        }
    }

    removeNodeListener(name, callback) {
        this.node.removeEventListener(name, callback);
    }

    addClickListener(callback) {
        this.addNodeListener("click", callback);
    }

    removeClickListener(callback) {
        this.removeNodeListener("click", callback);
    }

    addDoubleClickListener(callback) {
        this.addNodeListener("dblclick", callback);
    }

    removeDoubleClickListener(callback) {
        this.removeNodeListener("dblclick", callback);
    }

    addChangeListener(callback) {
        this.addNodeListener("change", callback);
    }
}

UIElement.domAttributesMap = ATTRIBUTE_NAMES_MAP;

UI.createElement = function (tag, options) {
    if (!tag) {
        console.error("Create element needs a valid object tag, did you mistype a class name?");
        return;
    }

    options = options || {};

    options.children = [];

    for (let i = 2; i < arguments.length; i += 1) {
        options.children.push(arguments[i]);
    }

    options.children = unwrapArray(options.children);

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
                          "Are you using the options from another object? Shame!", options);
        }

        options.key = "_ref" + options.ref.name;
    }

    if (options.hasOwnProperty("class")) {
        console.error("Invalid UI Element attribute: class. Did you mean className?");
    }

    if (typeof tag === "string") {
        options.nodeType = tag;
        tag = UIElement;
    }

    return new tag(options);
};

UI.Element = UIElement;

UI.str = function (value) {
    return new UI.TextElement(value);
};

// Keep a map for every base class, and for each base class keep a map for each nodeType, to cache classes
let primitiveMap = new WeakMap();

UI.Primitive = (BaseClass, nodeType) => {
    if (!nodeType) {
        nodeType = BaseClass;
        BaseClass = UI.Element;
    }
    let baseClassPrimitiveMap = primitiveMap.get(BaseClass);
    if (!baseClassPrimitiveMap) {
        baseClassPrimitiveMap = new Map();
        primitiveMap.set(BaseClass, baseClassPrimitiveMap);
    }
    let resultClass = baseClassPrimitiveMap.get(nodeType);
    if (resultClass) {
        return resultClass;
    }
    resultClass = class Primitive extends BaseClass {
        static get name() {
            return "Primitive-" + nodeType;
        }

        getNodeType() {
            return nodeType;
        }
    };
    baseClassPrimitiveMap.set(nodeType, resultClass);
    return resultClass;
};

// TODO: code shouldn't use UIElement directly, but through UI.Element
export {UIElement, UI};
