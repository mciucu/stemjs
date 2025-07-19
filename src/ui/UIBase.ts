import {
    unwrapArray,
    setObjectPrototype,
    suffixNumber,
    isPlainObject,
    unwrapElementWithFunc,
    isString,
    Nullable
} from "../base/Utils";
import {CleanupJobs, Dispatchable, OncePerTickRunner, RemoveHandle} from "../base/Dispatcher";
import {DOMAttributesMap, NodeAttributes} from "./NodeAttributes";
import {Theme, ThemeProps} from "./style/Theme";
import {StyleSheet} from "./Style";

export type SVGTagType = keyof SVGElementTagNameMap;
export type HTMLTagType = keyof HTMLElementTagNameMap;
export type UIElementCleanChild = BaseUIElement | string | number;
export type UIElementChild = Iterable<UIElementChild> | UIElementCleanChild | null | undefined | false;
type RefLinkOptions = {
    parent: UIElement<any, any>;
    name?: string;
    key?: string;
};


// Type definitions
export interface UIElementOptions {
    children: UIElementCleanChild[];
    ref?: RefLinkOptions;
    key?: string;
    active?: boolean; // Tabs or switchers can put this on children
    nodeType?: HTMLTagType;
    className?: string;
    style?: string | CSSStyleDeclaration;
    theme?: Theme;
    styleSheet?: StyleSheet;
    //[key: string]: any;
}

export const RenderStack: BaseUIElement[] = []; //keeps track of objects that are redrawing, to know where to assign refs automatically
export const redrawPerTickRunner = new OncePerTickRunner((obj: BaseUIElement, event: any) => obj.node && obj.redraw(event));

// TODO Maybe get rid of the UI namespace
export interface UINamespace {
    TextElement: typeof TextUIElement;
    Element: typeof UIElement;
    SVGElement: typeof UIElement;
    createElement: (tag: typeof BaseUIElement<any> | HTMLTagType, options?: UIElementOptions | null, ...children: any[]) => BaseUIElement | null;
    str: (value: any) => any;
    Primitive: <ExtraOptions = void, T extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap>(nodeType: T, BaseClass?: typeof UIElement) => typeof UIElement<ExtraOptions, HTMLElementTagNameMap[T]>;
}

export const UI: UINamespace = {} as UINamespace;

export function cleanChildren(children: UIElementChild): UIElementCleanChild[] {
    return unwrapArray(children, unwrapElementWithFunc);
}

export abstract class BaseUIElement<NodeType extends ChildNode = SVGElement | HTMLElement | Text> extends Dispatchable {
    declare node?: NodeType;
    declare parent?: UIElement;
    declare options?: UIElementOptions;
    declare context?: any;

    canOverwrite(existingChild: BaseUIElement): boolean {
        return this.constructor === existingChild.constructor &&
               this.getNodeType() === existingChild.getNodeType();
    }

    applyRef(): void {
        if (this.options?.ref) {
            const obj = this.options.ref.parent;
            const name = this.options.ref.name ?? this.options.ref.key; // TODO: should be key
            obj[name] = this;
        }

        // We do this here since this is done on every redraw, and we just needed a way to hook into all redraw
        this.cancelEnqueuedRedraw();
    }

    removeRef(): void {
        if (this.options?.ref) {
            const obj = this.options.ref.parent;
            const name = this.options.ref.name;
            if (obj[name] === this) {
                obj[name] = undefined;
            }
        }
    }

    // Calls a queueMicrotask(() => this.redraw()), but only if one isn't already enqueued
    // The enqueued task will be canceled if a redraw is manually called in the meantime
    enqueueRedraw(event?: any): void {
        redrawPerTickRunner.maybeEnqueue(this, event);
    }

    cancelEnqueuedRedraw(): void {
        redrawPerTickRunner.clear(this);
    }

    // Lifecycle methods, called when the element was first inserted in the DOM, and before it's removed
    onMount(): void {}

    onUnmount(): void {}

    abstract getNodeType(): string | number;

    abstract mount(parent: UIElement<any, any> | HTMLElement, nextSibling?: Node | null): void;

    abstract redraw(event?: any): void;

    abstract createNode(): NodeType;

    abstract copyState(element: BaseUIElement): void;

    destroyNode(): void {
        this.dispatch("unmount", this);
        this.onUnmount();
        this.cleanup();
        this.removeRef();
        this.node?.remove();
        delete this.node; // Clear for gc
    }
}

type TextElementOptions = {value: string};

export class TextUIElement extends BaseUIElement<Text> {
    value: string;
    // @ts-ignore
    declare options?: TextElementOptions & UIElementOptions;

    constructor(value: string | TextElementOptions = "") {
        super();
        if (isPlainObject(value) && value?.value) {
            this.value = value.value;
            this.options = value as TextElementOptions & UIElementOptions;
        } else {
            this.value = (value as string) ?? "";
        }
    }

    mount(parent: UIElement, nextSibling?: Node | null): void {
        this.parent = parent;
        if (!this.node) {
            this.createNode();
            this.applyRef();
        } else {
            this.redraw();
        }
        parent.node!.insertBefore(this.node!, nextSibling);
        this.onMount();
    }

    getNodeType(): number {
        return Node.TEXT_NODE;
    }

    copyState(element: TextUIElement): void {
        this.value = element.value;
        this.options = element.options;
    }

    createNode(): Text {
        this.node = document.createTextNode(this.getValue());
        applyDebugFlags(this);
        return this.node;
    }

    setValue(value: any): void {
        this.value = (value != null) ? value : "";
        if (this.node) {
            this.redraw();
        }
    }

    getValue(): string {
        return String(this.value);
    }

    toString(): string {
        return this.getValue();
    }

    redraw(): void {
        if (this.node) {
            let newValue = this.getValue();
            // TODO: check if this is best for performance
            if (this.node.nodeValue !== newValue) {
                this.node.nodeValue = newValue;
            }
        }
        this.applyRef();
    }
}

UI.TextElement = TextUIElement;

export class UIElement<
    ExtraOptions = void,
    NodeType extends (HTMLElement | SVGElement) = HTMLElement,
    OptionsType extends UIElementOptions = Partial<Omit<NodeType, "children">> & UIElementOptions & ExtraOptions
> extends BaseUIElement<NodeType> {
    static domAttributesMap: DOMAttributesMap = NodeAttributes.defaultAttributesMap;
    static nodeEventsMap: DOMAttributesMap = NodeAttributes.defaultEventsMap;

    children: BaseUIElement[] = [];
    declare state: any;
    declare options: OptionsType;

    constructor(options: OptionsType = {} as OptionsType) {
        super();
        this.children = [];  // These are the rendered children
        this.options = options; // TODO: this is a hack, to not break all the code that references this.options in setOptions
        this.state = this.getDefaultState();  // TODO @cleanup implement a simpler state pattern, that allows custom state types
        this.setOptions(options); // TODO maybe this actually needs to be removed, since on a copy we don't want the default options of the other object
    }

    getDefaultOptions(options?: OptionsType): Partial<OptionsType> | undefined {
        return undefined;
    }

    // Return our options without the UI specific fields, so they can be passed along
    getCleanedOptions(): Partial<OptionsType> {
        const options = {
            ...this.options,
        };

        delete options.ref;
        delete options.children;
        delete options.key;
        delete options.nodeType;

        return options;
    }

    getDefaultState(): any {
        return {};
    }

    getPreservedOptions(): Partial<OptionsType> | undefined {
        return undefined;
    }

    setOptions(options: OptionsType): void {
        const defaultOptions = this.getDefaultOptions(options);
        if (defaultOptions) {
            options = Object.assign(defaultOptions, options);
        }
        this.options = options;
    }

    // TODO: should probably add a second arg, doRedraw=true - same for setOptions
    updateOptions(options: Partial<OptionsType>): void {
        this.setOptions(Object.assign(this.options, options));
        // TODO: if the old options and the new options are deep equal, we can skip this redraw, right?
        this.redraw();
    }

    setChildren(...args: UIElementChild[]): void {
        this.updateOptions({children: cleanChildren(args)} as Partial<OptionsType>);
    }

    // Used when we want to reuse the current element, with the options from the passed in argument
    // Is only called when element.canOverwrite(this) is true
    copyState(element: typeof this): void {
        let options = element.options;
        let preservedOptions = this.getPreservedOptions();
        if (preservedOptions) {
            options = {...options, ...preservedOptions};
        }
        this.setOptions(options || {} as OptionsType);
        this.addListenersFromOptions();
    }

    getNodeType(): HTMLTagType {
        return this.options?.nodeType || "div";
    }

    static create<T extends UIElement>(this: new (options?: UIElementOptions) => T, parentNode: UIElement | HTMLElement, options?: UIElementOptions): T {
        const uiElement = new this(options);
        uiElement.mount(parentNode, null);
        uiElement.dispatch("mount", uiElement);
        return uiElement;
    }

    // TODO: should be renamed to renderContent
    getGivenChildren(): UIElementChild {
        return this.options?.children || [];
    }

    render(): UIElementChild {
        return this.options?.children;
    }

    createNode(): NodeType {
        this.node = document.createElement(this.getNodeType()) as NodeType;
        applyDebugFlags(this);
        return this.node;
    }

    // Abstract, gets called when removing DOM node associated with the
    cleanup(): void {
        this.runCleanupJobs();
        for (const child of this.children) {
            child.destroyNode();
        }
        this.clearNode();
        super.cleanup();
    }

    overwriteChild<ChildType extends BaseUIElement>(existingChild: ChildType, newChild: ChildType): ChildType {
        existingChild.copyState(newChild);
        return existingChild;
    }

    getElementKeyMap(elements: BaseUIElement[]): Map<string, BaseUIElement> | null {
        if (!Array.isArray(elements)) {
            return null;
        }
        const childrenKeyMap = new Map<string, BaseUIElement>();

        for (let i = 0; i < elements.length; i += 1) {
            const childKey = (elements[i].options && elements[i].options.key) || ("autokey" + i);

            childrenKeyMap.set(childKey, elements[i]);
        }

        return childrenKeyMap;
    }

    getChildrenToRender(): UIElementChild {
        return this.render();
    }

    // TODO @types type this
    getExtraContext(): any {
        const theme = this.options?.theme;
        if (theme) {
            return {theme};
        }
        return null;  // cleanObject({theme}, {emptyAsNull: true});
    }

    updateContext(context: any = this.parent?.context): void {
        const extraContext = this.getExtraContext();
        this.context = extraContext ? {...context, ...extraContext} : context;
    }

    // TODO @types these children are clean
    getChildrenForRedraw(): any[] {
        RenderStack.push(this);
        const children = cleanChildren(this.getChildrenToRender());
        RenderStack.pop();
        return children;
    }

    redraw(): boolean {
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

        const domNode = this.node;
        const childrenKeyMap = this.getElementKeyMap(this.children);

        for (let i = 0; i < newChildren.length; i++) {
            let newChild = newChildren[i];
            let prevChildNode = (i > 0) ? newChildren[i - 1].node : null;
            let currentChildNode = (prevChildNode) ? prevChildNode.nextSibling : domNode.firstChild;

            // Not a UIElement, to be converted to a TextElement probably
            if (!newChild.getNodeType) {
                if (newChild.toUI) {
                    newChild = newChild.toUI(this); // TODO move this inside the unwrap logic
                } else {
                    newChild = new UI.TextElement(String(newChild));
                }
                newChildren[i] = newChild;
            }

            const newChildKey = newChild.options?.key || ("autokey" + i);
            const existingChild = childrenKeyMap?.get(newChildKey);

            if (existingChild && newChildren[i].canOverwrite(existingChild)) {
                // We're replacing an existing child element, it might be the very same object
                if (existingChild !== newChildren[i]) {
                    newChildren[i] = this.overwriteChild(existingChild, newChildren[i]);
                }
                newChildren[i].redraw();
                if (newChildren[i].node !== currentChildNode) {
                    domNode.insertBefore(newChildren[i].node!, currentChildNode);
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
    getOptionsAsNodeAttributes(): NodeAttributes {
        return setObjectPrototype(this.options || {}, NodeAttributes);
    }

    instantiateNodeAttributes(): NodeAttributes {
        return new NodeAttributes(this.options);
    }

    getNodeAttributes(): NodeAttributes {
        const attr = this.instantiateNodeAttributes();
        // Add the default class "container" from our style sheet (if there is one)
        const containerClassName = this.styleSheet?.container;
        if (containerClassName) {
            attr.addClass(containerClassName);
        }
        return attr;
    }

    extraNodeAttributes(attr: NodeAttributes): void {}

    applyNodeAttributes(): void {
        const attr = this.getNodeAttributes();
        this.extraNodeAttributes(attr);
        attr.apply(this.node as HTMLElement, (this.constructor as typeof UIElement).domAttributesMap);
    }

    setAttribute(key: string, value: any): void {
        this.getOptionsAsNodeAttributes().setAttribute(key, value, this.node as HTMLElement, (this.constructor as any).domAttributesMap);
    }

    setStyle(key: string | Record<string, any>, value?: any): void {
        if (typeof key === "object") {
            for (const [styleKey, styleValue] of Array.from(Object.entries(key))) {
                this.setStyle(styleKey, styleValue);
            }
            return;
        }
        this.getOptionsAsNodeAttributes().setStyle(key, value, this.node as HTMLElement);
    }

    removeStyle(key: string): void {
        this.getOptionsAsNodeAttributes().removeStyle(key, this.node as HTMLElement);
    }

    addClass(className: string): void {
        this.getOptionsAsNodeAttributes().addClass(className, this.node as HTMLElement);
    }

    removeClass(className: string): void {
        this.getOptionsAsNodeAttributes().removeClass(className, this.node as HTMLElement);
    }

    hasClass(className: string): boolean {
        return this.getOptionsAsNodeAttributes().hasClass(className);
    }

    toggleClass(className: string): void {
        if (!this.hasClass(className)) {
            this.addClass(className);
        } else {
            this.removeClass(className);
        }
    }

    getTheme(): Theme {
        return this.options?.theme || this.context?.theme || Theme.Global;
    }

    get styleSheet(): Nullable<StyleSheet> {
        let {styleSheet} = (this.options as any) || {};
        const theme = this.getTheme();

        if (!styleSheet) {
            styleSheet = theme.getStyleSheet(this.constructor);
        }
        return styleSheet?.getInstance(theme);
    }

    get themeProps(): ThemeProps {
        return this.options?.styleSheet?.themeProps || this.getTheme().props;
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
                const nodeEvent = (this.constructor as typeof UIElement).nodeEventsMap.getKeyFromDOMName(eventType.toLowerCase());

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

    refLink(name: string): RefLinkOptions {
        return {parent: this, name: name};
    }

    refLinkArray(arrayName: string, index: number): { parent: any[]; name: number } {
        if (!this[arrayName]) {
            this[arrayName] = [];
        }
        return {parent: this[arrayName], name: index};
    }

    bindToNode(node: HTMLElement, doRedraw?: boolean): this {
        this.node = node as NodeType;
        if (doRedraw) {
            this.clearNode();
            this.redraw();
        }
        return this;
    }

    mount(parentNode: UIElement<any, any> | HTMLElement, nextSiblingNode?: Node | null): void {
        const parent = (parentNode instanceof HTMLElement) ? new UIElement().bindToNode(parentNode) : parentNode;
        this.parent = parent;
        if (this.node) {
            parent.insertChildNodeBefore(this, nextSiblingNode);
            this.dispatch("changeParent", this.parent);
            return;
        }

        this.createNode();
        this.redraw();

        parent.insertChildNodeBefore(this, nextSiblingNode || null);

        this.addListenersFromOptions();

        this.onMount();
    }

    // You need to overwrite the next child manipulation routines if this.options.children !== this.children
    appendChild(child: BaseUIElement): BaseUIElement {
        // TODO: the next check should be done with a decorator
        if (this.children !== this.options?.children) {
            throw "Can't properly handle appendChild, you need to implement it for " + this.constructor;
        }
        this.options.children = this.options.children || [];
        this.options.children.push(child);
        child.mount(this, null);
        return child;
    }

    insertChild(child: BaseUIElement, position?: number): BaseUIElement {
        if (this.children !== this.options?.children) {
            throw "Can't properly handle insertChild, you need to implement it for " + this.constructor;
        }
        position = position || 0;

        this.options!.children = this.options!.children || [];
        this.options!.children.splice(position, 0, child);

        const nextChildNode = position + 1 < this.options!.children.length ? this.children[position + 1].node : null;

        (child as UIElement).mount(this, nextChildNode);

        return child;
    }

    eraseChild(child: BaseUIElement, destroy: boolean = true): BaseUIElement | null {
        if (!this.options?.children) return null;
        let index = this.options.children.indexOf(child);

        if (index < 0) {
            // child not found
            return null;
        }
        return this.eraseChildAtIndex(index, destroy);
    }

    eraseChildAtIndex(index: number, destroy: boolean = true): BaseUIElement | null {
        if (!this.options?.children || index < 0 || index >= this.options.children.length) {
            console.error("Erasing child at invalid index ", index, this.options.children?.length || 0);
            return null;
        }
        if (this.children !== this.options.children) {
            throw "Can't properly handle eraseChild, you need to implement it for " + this.constructor;
        }
        let erasedChild = this.options.children.splice(index, 1)[0] as BaseUIElement;
        if (destroy) {
            erasedChild.destroyNode();
        } else {
            this.node.removeChild(erasedChild.node);
        }
        return erasedChild;
    }

    show(): void {
        this.removeClass("hidden");
    }

    hide(): void {
        this.addClass("hidden");
    }

    insertChildNodeBefore(childElement: BaseUIElement, nextSiblingNode: Node | null): void {
        this.node!.insertBefore(childElement.node!, nextSiblingNode);
    }

    // TODO: should be renamed emptyNode()
    clearNode(): void {
        while (this.node?.lastChild) {
            this.node.removeChild(this.node.lastChild);
        }
    }

    isInDocument(): boolean {
        return document.body.contains(this.node!);
    }

    // TODO: this method also doesn't belong here
    getWidthOrHeight(parameter: "width" | "height"): number {
        let node = this.node as HTMLElement;
        if (!node) {
            return 0;
        }
        let value = parseFloat(parameter === "width" ? String(node.offsetWidth) : String(node.offsetHeight));
        return value || 0;
    }

    getHeight(): number {
        return this.getWidthOrHeight("height");
    }

    getWidth(): number {
        return this.getWidthOrHeight("width");
    }

    setHeight(value: number | string): void {
        this.setStyle("height", suffixNumber(value, "px"));
        this.dispatch("resize");
    }

    setWidth(value: number | string): void {
        this.setStyle("width", suffixNumber(value, "px"));
        this.dispatch("resize");
    }

    addNodeListener(name: string, callback: EventListener, ...args: any[]): RemoveHandle {
        (this.node as HTMLElement).addEventListener(name, callback, ...(args as []));
        const handler = {
            remove: () => {
                this.removeNodeListener(name, callback);
            }
        };
        this.addCleanupJob(handler);
        return handler;
    }

    removeNodeListener(name: string, callback: EventListener): void {
        (this.node as HTMLElement).removeEventListener(name, callback);
    }

    // TODO: methods can be automatically generated by addNodeListener(UI.Element, "dblclick", "DoubleClick") for instance
    addClickListener(callback: EventListener): RemoveHandle {
        return this.addNodeListener("click", callback);
    }

    removeClickListener(callback: EventListener): void {
        this.removeNodeListener("click", callback);
    }

    addPressStartListener(callback: EventListener): CleanupJobs {
        return new CleanupJobs([
            this.addNodeListener("mousedown", callback),
            this.addNodeListener("touchstart", callback)
        ]);
    }

    removePressStartListener(callback: EventListener): void {
        this.removeNodeListener("mousedown", callback);
        this.removeNodeListener("touchstart", callback);
    }

    addPressStopListener(callback: EventListener): CleanupJobs {
        return new CleanupJobs([
            this.addNodeListener("mouseup", callback),
            this.addNodeListener("touchend", callback)
        ]);
    }

    removePressStopListener(callback: EventListener): void {
        this.removeNodeListener("mouseup", callback);
        this.removeNodeListener("touchend", callback);
    }

    addDoubleClickListener(callback: EventListener): RemoveHandle {
        return this.addNodeListener("dblclick", callback);
    }

    removeDoubleClickListener(callback: EventListener): void {
        this.removeNodeListener("dblclick", callback);
    }
}

const SVG_TAGS = new Set(["svg", "g", "defs", "radialGradient", "stop", "ellipse", "clipPath", "ellipse", "path", "text"]); // TODO @types full set

function isSVGTag(tag: string): tag is SVGTagType {
    return SVG_TAGS.has(tag);
}

UI.createElement = function (tag: typeof BaseUIElement<any> | HTMLTagType | SVGTagType, options?: UIElementOptions | null, ...children: any[]): BaseUIElement | null {
    if (!tag) {
        console.error("Create element needs a valid object tag, did you mistype a class name?");
        return null;
    }

    options = options || {} as UIElementOptions;

    options.children = cleanChildren(children);

    if (options.ref) {
        if (typeof options.ref === "string") {
            if (RenderStack.length > 0) {
                options.ref = {
                    parent: RenderStack[RenderStack.length - 1] as UIElement<any>,
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

    if (isString(tag)) {
        options.nodeType = tag as HTMLTagType; // TODO @types just shutting down the types
        if (isSVGTag(tag)) {
            return new UI.SVGElement<void, SVGElementTagNameMap[typeof tag]>(options);
        }
        return new UIElement<void, HTMLElementTagNameMap[typeof tag]>(options);
    }

    return new (tag as typeof UIElement)(options);
};

UI.Element = UIElement;

UI.str = (value: string) => new TextUIElement(value);

// Keep a map for every base class, and for each base class keep a map for each nodeType, to cache classes
const primitiveMap: WeakMap<typeof UIElement, Map<string, typeof UIElement<any>>> = new WeakMap();

UI.Primitive = <ExtraOptions = void, T extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap>(nodeType: T, BaseClass: typeof UIElement = UIElement): typeof UIElement<ExtraOptions, HTMLElementTagNameMap[T]> => {
    let baseClassPrimitiveMap = primitiveMap.get(BaseClass);
    if (!baseClassPrimitiveMap) {
        baseClassPrimitiveMap = new Map();
        primitiveMap.set(BaseClass, baseClassPrimitiveMap);
    }
    let resultClass = baseClassPrimitiveMap.get(nodeType);
    if (resultClass) {
        return resultClass as any;
    }
    resultClass = class Primitive extends BaseClass<ExtraOptions, HTMLElementTagNameMap[T]> {
        declare node?: HTMLElementTagNameMap[T];
        
        getNodeType(): T {
            return nodeType;
        }
        
        createNode(): HTMLElementTagNameMap[T] {
            this.node = document.createElement(nodeType);
            applyDebugFlags(this);
            return this.node;
        }
    };
    baseClassPrimitiveMap.set(nodeType, resultClass);
    return resultClass as any;
};

export function applyDebugFlags(element: BaseUIElement): void {
    if (globalThis.STEM_DEBUG && element.node) {
        (element.node as any).stemElement = element;
    }
}
