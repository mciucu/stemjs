import {
    unwrapArray,
    setObjectPrototype,
    suffixNumber,
    isPlainObject,
    unwrapElementWithFunc
} from "../base/Utils";
import {CleanupJobs, Dispatchable, OncePerTickRunner} from "../base/Dispatcher";
import {NodeAttributes} from "./NodeAttributes";
import {applyDebugFlags} from "./Debug";
import {Theme} from "./style/Theme.js";

export const RenderStack = []; //keeps track of objects that are redrawing, to know where to assign refs automatically
export const redrawPerTickRunner = new OncePerTickRunner((obj, event) => obj.node && obj.redraw(event));

// TODO Maybe get rid of the UI namespace
export const UI = {};

export function cleanChildren(children) {
    return unwrapArray(children, unwrapElementWithFunc);
}

export class BaseUIElement extends Dispatchable {
    canOverwrite(existingChild) {
        return this.constructor === existingChild.constructor &&
               this.getNodeType() === existingChild.getNodeType();
    }

    applyRef() {
        if (this.options?.ref) {
            let obj = this.options.ref.parent;
            let name = this.options.ref.name ?? this.options.ref.key; // TODO: should be key
            obj[name] = this;
        }

        // We do this here since this is done on every redraw, and we just needed a way to hook into all redraw
        this.cancelEnqueuedRedraw();
    }

    removeRef() {
        if (this.options?.ref) {
            let obj = this.options.ref.parent;
            let name = this.options.ref.name;
            if (obj[name] === this) {
                obj[name] = undefined;
            }
        }
    }

    // Calls a queueMicrotask(() => this.redraw()), but only if one isn't already enqueued
    // The enqueued task will be canceled if a redraw is manually called in the meantime
    enqueueRedraw(event) {
        redrawPerTickRunner.maybeEnqueue(this, event);
    }

    cancelEnqueuedRedraw() {
        redrawPerTickRunner.clear(this);
    }

    // Lifecycle methods, called when the element was first inserted in the DOM, and before it's removed
    onMount() {}

    onUnmount() {}

    destroyNode() {
        this.dispatch("unmount", this);
        this.onUnmount();
        this.cleanup();
        this.removeRef();
        this.node?.remove();
        delete this.node; // Clear for gc
    }
}


UI.TextElement = class UITextElement extends BaseUIElement {
    constructor(value="") {
        super();
        if (value && value.hasOwnProperty("value") && isPlainObject(value)) {
            this.value = value.value;
            this.options = value;
        } else {
            this.value = value ?? "";
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
        this.onMount();
    }

    getNodeType() {
        return Node.TEXT_NODE;
    }

    copyState(element) {
        this.value = element.value;
        this.options = element.options;
    }

    createNode() {
        this.node = document.createTextNode(this.getValue());
        applyDebugFlags(this);
        return this.node;
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

    toString() {
        return this.getValue();
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

// TODO: rename to Element
export class UIElement extends BaseUIElement {
    constructor(options={}) {
        super();
        this.children = [];  // These are the rendered children
        this.options = options; // TODO: this is a hack, to not break all the code that references this.options in setOptions
        this.state = this.getDefaultState();  // TODO @cleanup implement a simpler state pattern, that allows custom state types
        this.setOptions(options); // TODO maybe this actually needs to be removed, since on a copy we don't want the default options of the other object
    };

    getDefaultOptions(options) {}

    // Return our options without the UI specific fields, so they can be passed along
    getCleanedOptions() {
        let options = {
            ...this.options,
        };

        delete options.ref;
        delete options.children;
        delete options.key;
        delete options.nodeType;

        return options;
    }

    getDefaultState() {
        return {};
    }

    getPreservedOptions() {}

    setOptions(options) {
        let defaultOptions = this.getDefaultOptions(options);
        if (defaultOptions) {
            options = Object.assign(defaultOptions, options);
        }
        this.options = options;
    }

    // TODO: should probably add a second arg, doRedraw=true - same for setOptions
    updateOptions(options) {
        this.setOptions(Object.assign(this.options, options));
        // TODO: if the old options and the new options are deep equal, we can skip this redraw, right?
        this.redraw();
    }

    setChildren(...args) {
        this.updateOptions({children: cleanChildren(args)})
    }

    // Used when we want to reuse the current element, with the options from the passed in argument
    // Is only called when element.canOverwrite(this) is true
    copyState(element) {
        let options = element.options;
        let preservedOptions = this.getPreservedOptions();
        if (preservedOptions) {
            options = Object.assign({}, options, preservedOptions);
        }
        this.setOptions(options);
        this.addListenersFromOptions();
    }

    getNodeType() {
        return this.options.nodeType || "div";
    }

    static create(parentNode, options) {
        const uiElement = new this(options);
        uiElement.mount(parentNode, null);
        uiElement.dispatch("mount", uiElement);
        return uiElement;
    }

    // TODO: should be renamed to renderContent
    getGivenChildren() {
        return this.options.children || [];
    }

    render() {
        return this.options.children;
    }

    createNode() {
        this.node = document.createElement(this.getNodeType());
        applyDebugFlags(this);
        return this.node;
    }

    // Abstract, gets called when removing DOM node associated with the
    cleanup() {
        this.runCleanupJobs();
        for (const child of this.children) {
            child.destroyNode();
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
            return null;
        }
        let childrenKeyMap = new Map();

        for (let i = 0; i < elements.length; i += 1) {
            let childKey = (elements[i].options && elements[i].options.key) || ("autokey" + i);

            childrenKeyMap.set(childKey, elements[i]);
        }

        return childrenKeyMap;
    }

    getChildrenToRender() {
        return this.render();
    }

    getExtraContext() {
        const {theme} = this.options;
        if (theme) {
            return {theme};
        }
        return null;  // cleanObject({theme}, {emptyAsNull: true});
    }

    updateContext(context = this.parent?.context) {
        const extraContext = this.getExtraContext();
        this.context = extraContext ? {...context, ...extraContext} : context;
    }

    getChildrenForRedraw() {
        RenderStack.push(this);
        let children = cleanChildren(this.getChildrenToRender());
        RenderStack.pop();
        return children;
    }

    redraw() {
        if (!this.node) {
            console.error("Element not yet mounted. Redraw aborted!", this);
            return false;
        }

        this.updateContext();

        let newChildren = this.getChildrenForRedraw();

        if (newChildren === this.children) {
            for (const child of newChildren) {
                child.redraw();
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

            // Not a UIElement, to be converted to a TextElement probably
            if (!newChild.getNodeType) {
                if (newChild.toUI) {
                    newChild = newChild.toUI(this); // TODO move this inside the unwrap logic
                } else {
                    newChild = new UI.TextElement({value: String(newChild)});
                }
                newChildren[i] = newChild;
            }

            let newChildKey = newChild.options?.key || ("autokey" + i);
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

            for (const currentChild of this.children) {
                if (!newChildrenSet.has(currentChild)) {
                    currentChild.destroyNode();
                }
            }
        }

        this.children = newChildren;

        // TODO this end logic is duplicated
        this.applyNodeAttributes();
        this.applyRef();

        return true;
    }

    // TODO This is actually slightly wrong, since we need to reuse the attr object we previously created
    getOptionsAsNodeAttributes() {
        return setObjectPrototype(this.options, NodeAttributes);
    }

    instantiateNodeAttributes() {
        return new NodeAttributes(this.options);
    }

    getNodeAttributes() {
        const attr = this.instantiateNodeAttributes();
        // Add the default class "container" from our style sheet (if there is one)
        const containerClassName = this.styleSheet?.container;
        if (containerClassName) {
            attr.addClass(containerClassName);
        }
        return attr;
    }

    extraNodeAttributes(attr) {}

    applyNodeAttributes() {
        const attr = this.getNodeAttributes();
        this.extraNodeAttributes(attr);
        attr.apply(this.node, this.constructor.domAttributesMap);
    }

    setAttribute(key, value) {
        this.getOptionsAsNodeAttributes().setAttribute(key, value, this.node, this.constructor.domAttributesMap);
    }

    setStyle(key, value) {
        if (typeof key === "object") {
            for (const [styleKey, styleValue] of Array.from(Object.entries(key))) {
                this.setStyle(styleKey, styleValue);
            }
            return;
        }
        this.getOptionsAsNodeAttributes().setStyle(key, value, this.node);
    }

    removeStyle(key) {
        this.getOptionsAsNodeAttributes().removeStyle(key, this.node);
    }

    addClass(className) {
        this.getOptionsAsNodeAttributes().addClass(className, this.node);
    }

    removeClass(className) {
        this.getOptionsAsNodeAttributes().removeClass(className, this.node);
    }

    hasClass(className) {
        return this.getOptionsAsNodeAttributes().hasClass(className);
    }

    toggleClass(className) {
        if (!this.hasClass(className)) {
            this.addClass(className);
        } else {
            this.removeClass(className);
        }
    }

    getTheme() {
        return this.options.theme || this.context?.theme || Theme.Global;
    }

    get styleSheet() {
        let {styleSheet} = this.options;
        const theme = this.getTheme();

        if (!styleSheet) {
            styleSheet = theme.getStyleSheet(this.constructor);
        }
        return styleSheet?.getInstance(theme);
    }

    get themeProps() {
        return this.options.styleSheet?.themeProps || this.getTheme().props;
    }

    addListenersFromOptions() {
        for (const key in this.options) {
            if (typeof key === "string" && key.startsWith("on") && key.length > 2) {
                const eventType = key.substring(2);

                const addListenerMethodName = "add" + eventType + "Listener";
                const handlerMethodName = "on" + eventType + "AutoHandler";

                // We create a wrapper handler, to not worry about updates changing the callback.
                // The handlerMethod might have been previously added
                // by a previous call to this function or manually by the user
                if (this[handlerMethodName]) {
                    // Don't double add
                    continue;
                }

                const haveListenerMethod = (typeof this[addListenerMethodName] === "function");
                const nodeEvent = this.constructor.nodeEventsMap.getKeyFromDOMName(eventType.toLowerCase());

                if (haveListenerMethod || nodeEvent) {
                    this[handlerMethodName] = (...args) => {
                        if (this.options[key]) {
                            this.options[key](...args, this);
                        }
                    };

                    // Actually add the listener
                    if (haveListenerMethod) {
                        this[addListenerMethodName](this[handlerMethodName]);
                    } else {
                        this.addNodeListener(eventType.toLowerCase(), this[handlerMethodName]);
                    }
                }
            }
        }
    }

    refLink(name) {
        return {parent: this, name: name};
    }

    refLinkArray(arrayName, index) {
        if (!this[arrayName]) {
            this[arrayName] = [];
        }
        return {parent: this[arrayName], name: index};
    }

    bindToNode(node, doRedraw) {
        this.node = node;
        if (doRedraw) {
            this.clearNode();
            this.redraw();
        }
        return this;
    }

    mount(parent, nextSiblingNode) {
        if (!parent.node) {
            parent = new UI.Element().bindToNode(parent);
        }
        this.parent = parent;
        if (this.node) {
            parent.insertChildNodeBefore(this, nextSiblingNode);
            this.dispatch("changeParent", this.parent);
            return;
        }

        this.createNode();
        this.redraw();

        parent.insertChildNodeBefore(this, nextSiblingNode);

        this.addListenersFromOptions();

        this.onMount();
    }

    // You need to overwrite the next child manipulation routines if this.options.children !== this.children
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

        const nextChildNode = position + 1 < this.options.children.length ? this.children[position + 1].node : null;

        child.mount(this, nextChildNode);

        return child;
    }

    eraseChild(child, destroy = true) {
        let index = this.options.children.indexOf(child);

        if (index < 0) {
            // child not found
            return null;
        }
        return this.eraseChildAtIndex(index, destroy);
    }

    eraseChildAtIndex(index, destroy = true) {
        if (index < 0 || index >= this.options.children.length) {
            console.error("Erasing child at invalid index ", index, this.options.children.length);
            return null;
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
    }

    getWidth() {
        return this.getWidthOrHeight("width");
    }

    setHeight(value) {
        this.setStyle("height", suffixNumber(value, "px"));
        this.dispatch("resize");
    }

    setWidth(value) {
        this.setStyle("width", suffixNumber(value, "px"));
        this.dispatch("resize");
    }

    addNodeListener(name, callback, ...args) {
        this.node.addEventListener(name, callback, ...args);
        const handler = {
            remove: () => {
                this.removeNodeListener(name, callback, ...args);
            }
        };
        this.addCleanupJob(handler);
        return handler;
    }

    removeNodeListener(name, callback) {
        this.node.removeEventListener(name, callback);
    }

    // TODO: methods can be automatically generated by addNodeListener(UI.Element, "dblclick", "DoubleClick") for instance
    addClickListener(callback) {
        return this.addNodeListener("click", callback);
    }

    removeClickListener(callback) {
        this.removeNodeListener("click", callback);
    }

    addPressStartListener(callback) {
        return new CleanupJobs([
            this.addNodeListener("mousedown", callback),
            this.addNodeListener("touchstart", callback)
        ]);
    }

    removePressStartListener(callback) {
        this.removeNodeListener("mousedown", callback)
        this.removeNodeListener("touchstart", callback);
    }

    addPressStopListener(callback) {
        return new CleanupJobs([
            this.addNodeListener("mouseup", callback),
            this.addNodeListener("touchend", callback)
        ]);
    }

    removePressStopListener(callback) {
        this.removeNodeListener("mouseup", callback)
        this.removeNodeListener("touchend", callback);
    }

    addDoubleClickListener(callback) {
        return this.addNodeListener("dblclick", callback);
    }

    removeDoubleClickListener(callback) {
        this.removeNodeListener("dblclick", callback);
    }
}

UI.createElement = function (tag, options, ...children) {
    if (!tag) {
        console.error("Create element needs a valid object tag, did you mistype a class name?");
        return null;
    }

    options = options || {};

    options.children = cleanChildren(children);

    if (options.ref) {
        if (typeof options.ref === "string") {
            if (RenderStack.length > 0) {
                options.ref = {
                    parent: RenderStack[RenderStack.length - 1],
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

UIElement.domAttributesMap = NodeAttributes.defaultAttributesMap;
UIElement.nodeEventsMap = NodeAttributes.defaultEventsMap;

UI.Element = UIElement;

UI.str = (value) => new UI.TextElement(value);

// Keep a map for every base class, and for each base class keep a map for each nodeType, to cache classes
const primitiveMap = new WeakMap();

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
        getNodeType() {
            return nodeType;
        }
    };
    baseClassPrimitiveMap.set(nodeType, resultClass);
    return resultClass;
};
