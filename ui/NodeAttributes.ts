import {dashCase, isNumber, isString, isPlainObject, setObjectPrototype, resolveFuncValue} from "../base/Utils";
import type {StyleRuleObject, StyleRuleValue} from "./Style"; // Type-only on purpose: a runtime edge here would close a cycle
import type {StyleValue} from "./UIBase"; // Type-only on purpose: a runtime edge here would close a cycle

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
    "gap",
    "column-gap",
    "row-gap",
]);

// What the map holds per attribute: the DOM name it is written under, which defaults to the option's own name
export interface DOMAttributeDescriptor {
    domName?: string;
    noValue?: boolean; // The attribute is written bare, so the option is only ever tested for truthiness
}

// An attribute is named on its own, or paired with the DOM name it differs from
export type DOMAttributeEntry = string | [string] | [string, DOMAttributeDescriptor];

// Used to map from option key to a DOM attribute name.
// Can recursively fall back to a base mapping, to allow extending of a parent class
export class DOMAttributesMap {
    allowedAttributesMap = new Map<string, DOMAttributeDescriptor>();
    reverseNameMap = new Map<string, string>();
    fallbackMapping: DOMAttributesMap | null;
    allowedPrefixes: string[];

    constructor(fallbackMapping: DOMAttributesMap | null, allowedAttributesArray: DOMAttributeEntry[] = [], allowedPrefixes: string[] = []) {
        this.fallbackMapping = fallbackMapping;

        for (let attribute of allowedAttributesArray) {
            if (!Array.isArray(attribute)) {
                attribute = [attribute];
            }

            this.setAttribute(attribute[0], attribute[1]);
        }

        this.allowedPrefixes = allowedPrefixes;
    }

    setAttribute(key: string, value?: DOMAttributeDescriptor): void {
        value = value || {};
        value.domName = value.domName || key;

        this.allowedAttributesMap.set(key, value);
        this.reverseNameMap.set(value.domName, key);
    }

    get(key: string): DOMAttributeDescriptor | undefined {
        for (const prefix of this.allowedPrefixes) {
            if (key.startsWith(prefix)) {
                return {
                    domName: key,
                };
            }
        }
        let value = this.allowedAttributesMap.get(key);
        if (!value && this.fallbackMapping) {
            value = this.fallbackMapping.get(key);
        }
        return value;
    }

    has(key: string): boolean {
        return this.allowedAttributesMap.has(key) || (this.fallbackMapping && this.fallbackMapping.has(key));
    }

    getKeyFromDOMName(key: string): string | undefined {
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
    static create(className?: string): ClassNameSet {
        const value = new Set(String(className || "").split(" "));
        return setObjectPrototype(value, this);
    }

    toString(): string {
        return Array.from(this).join(" ");
    }
}

// Anything that stringifies to a class name. Style rules are DynamicStyleElements, not strings, so this is what
// className has to accept for `className={this.styleSheet.someRule}` to typecheck.
export type ClassNameValue = string | number | ClassNameSet | StyleRuleValue;

// What addClass takes. It stringifies whatever it is handed, so a rule read off a sheet is as good as the
// class name it stands for
export type ClassNameArgument = ClassNameValue | StyleRuleObject | null | undefined;

export type NodeElement = HTMLElement | SVGElement;


// Writing an attribute is not free even with the same value: an <img> or <iframe> given its src again loads it again (and fires
// load, whose handler may redraw, which writes it again). So a redraw writes only what changed.
function setChangedAttribute(node: NodeElement, name: string, value: unknown): void {
    const text = String(value);
    if (node.getAttribute(name) !== text) {
        node.setAttribute(name, text);
    }
}

// Detached, so applyStyle building a style there costs the browser no style work
let styleScratch: HTMLElement | null = null;

export class NodeAttributes {
    [key: string]: any;
    static defaultAttributesMap: DOMAttributesMap;
    
    // Type hint for style property when it exists (not automatically created)
    declare style?: Record<string, any> | string;
    declare className?: ClassNameValue;
    declare styleString?: string;
    declare whitelistedAttributes?: Record<string, boolean>;

    constructor(obj?: Record<string, any>) {
        Object.assign(this, obj);
        // className and style should be deep copied to be modifiable, the others shallow copied
        if (this.className instanceof ClassNameSet) {
            this.className = ClassNameSet.create(String(this.className));
        }
        if (isPlainObject(this.style)) {
            // Make a copy, since we might modify it later
            this.style = {...this.style};
        }
    }

    // Change the attribute & apply it, regardless if it exists in the attribute map (in that case it's whitelisted)
    // TODO: should this use the domName or the reverseName? Still needs work
    setAttribute(key: string, value: unknown, node?: NodeElement, attributesMap: DOMAttributesMap = this.constructor.defaultAttributesMap): void {
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

    applyStyleToNode(key: string, value: StyleValue<string>, node?: NodeElement): void {
        if (typeof value === "function") {
            value = value();
        }
        if (isNumber(value) && value != 0 && defaultToPixelsAttributes.has(dashCase(key))) {
            value = value + "px";
        }
        // CSSStyleDeclaration is indexable by number, not by an arbitrary property name, and the key here is
        // whatever an options object carried. Naming the shape instead buys nothing: value is already declared
        if (node && (node.style as any)[key] !== value) {
            (node.style as any)[key] = value;
        }
    }

    // Should the style property have been passed in as a string, save it to the variable that will be applied before the string object.
    ensureNoStringStyle(): asserts this is {style?: Record<string, any>} {
        if (isString(this.style)) {
            this.styleString = this.style; // Keep in a temp value
            delete this.style;
        }
    }

    setStyle(key: string | Record<string, StyleValue<string>>, value?: StyleValue<string>, node?: NodeElement): void {
        value = resolveFuncValue(value);
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

    removeStyle(key: string, node?: NodeElement): void {
        if (this.style) {
            delete this.style[key];
        }
        if (node?.style[key]) {
            node.style[key] = ""; // A style property is an accessor on the prototype, so delete would leave it
        }
    }

    static getClassArray(classes: ClassNameArgument | ClassNameArgument[]): string[] {
        if (!classes) {
            return [];
        }
        if (Array.isArray(classes)) {
            // Split each entry too: a rule set stringifies to several names, and classList.add takes one
            return classes.flatMap(x => String(x).trim().split(" "));
        } else {
            return String(classes).trim().split(" ");
        }
    }

    getClassNameSet(): ClassNameSet {
        if (!(this.className instanceof ClassNameSet)) {
            this.className = ClassNameSet.create(this.className as string || "");
        }
        return this.className as ClassNameSet;
    }

    addClass(classes: ClassNameArgument | ClassNameArgument[], node?: NodeElement): void {
        for (const cls of this.constructor.getClassArray(classes)) {
            this.getClassNameSet().add(cls);
            if (node) {
                node.classList.add(cls);
            }
        }
    }

    removeClass(classes: ClassNameArgument | ClassNameArgument[], node?: NodeElement): void {
        for (const cls of this.constructor.getClassArray(classes)) {
            this.getClassNameSet().delete(cls);
            if (node) {
                node.classList.remove(cls);
            }
        }
    }

    hasClass(className: string | {className: string}): boolean {
        return this.getClassNameSet().has(isString(className) ? className : className.className);
    }

    // Apply the attribute only if it's in the attributesMap, returning the DOM name it was written under
    applyAttribute(key: string, node: NodeElement, attributesMap: DOMAttributesMap): string | undefined {
        let attributeOptions = attributesMap.get(key);
        if (!attributeOptions) {
            if (this.whitelistedAttributes && (key in this.whitelistedAttributes)) {
                attributeOptions = {
                    domName: key,
                };
            } else {
                return;
            }
        }
        let value = this[key];
        if (typeof value === "function") {
            value = value();
        }
        if (attributeOptions.noValue) {
            value = value ? "" : undefined;
        }
        if (value == null) {
            node.removeAttribute(attributeOptions.domName);
            return;
        }
        setChangedAttribute(node, attributeOptions.domName, value);
        return attributeOptions.domName;
    }

    applyClassName(node: NodeElement): void {
        if (this.className) {
            const className = String(this.className);
            if (node.className !== className) {
                (node as Element).className = className;
            }
        } else {
            if (node.className) {
                node.removeAttribute("class");
            }
        }
    }

    apply(node: NodeElement, attributesMap: DOMAttributesMap): void {
        // Write this element's attributes, then remove the node's others. In lowercase, as HTML keeps names (tabIndex is tabindex)
        const writtenNames: string[] = [];
        for (const key in this) {
            const name = this.applyAttribute(key, node, attributesMap);
            if (name) {
                writtenNames.push(name.toLowerCase());
            }
        }
        for (const name of node.getAttributeNames()) {
            if (name !== "style" && name !== "class" && !writtenNames.includes(name.toLowerCase())) {
                node.removeAttribute(name);
            }
        }

        this.applyClassName(node);
        this.applyStyle(node);
    }

    // The node's style becomes exactly this element's (one set from outside goes), built on a detached element and written only
    // when its text differs: writing even the same style makes the browser recompute it. A node with no style is written directly
    applyStyle(node: NodeElement): void {
        this.ensureNoStringStyle();
        const scratch = node.hasAttribute("style") ? (styleScratch ??= document.createElement("div")) : null;
        const target = scratch || node;
        scratch?.removeAttribute("style");
        if (this.styleString) {
            target.style.cssText = this.styleString;
        }
        const style = this.style || {};
        for (const key of Object.keys(style)) {
            this.applyStyleToNode(key, style[key], target);
        }
        if (scratch) {
            const cssText = scratch.getAttribute("style");
            if (!cssText) {
                node.removeAttribute("style");
            } else if (node.getAttribute("style") !== cssText) {
                node.setAttribute("style", cssText);
            }
        }
    }
}

// Default node attributes, should be as few of these as possible
NodeAttributes.defaultAttributesMap = new DOMAttributesMap(null, [
    ["id"],
    ["action"],
    ["autofocus", {noValue: true}],
    ["checked", {noValue: true}],
    ["colSpan", {domName: "colspan"}],
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
    ["draggable"],
    ["spellcheck"],
    ["data"],
    //["value"], // Value is intentionally disabled
], [
    "data-",
    "aria-",
]);

// The DOM events an element takes as options by default, onKeyDown={...} listening to "keydown" on its node: an option's
// name and the event it listens to. A class's own adder for one wins (addXListener for onX), in the types too: a class
// with an addScrollListener of its own makes its onScroll its own, called as that adder calls it. onChange isn't here: on
// every element it is Stem's own change event (Dispatchable's addChangeListener).
export const DOM_NODE_EVENTS = {
    Click: "click",
    DoubleClick: "dblclick",
    MouseEnter: "mouseenter",
    MouseLeave: "mouseleave",
    KeyDown: "keydown",
    KeyUp: "keyup",
    Input: "input",
    Focus: "focus",
    Blur: "blur",
    FocusIn: "focusin",
    FocusOut: "focusout",
    MouseDown: "mousedown",
    MouseUp: "mouseup",
    MouseMove: "mousemove",
    ContextMenu: "contextmenu",
    AuxClick: "auxclick",
    Scroll: "scroll",
    DragStart: "dragstart",
    DragEnd: "dragend",
    DragEnter: "dragenter",
    DragOver: "dragover",
    DragLeave: "dragleave",
    Drop: "drop",
    Paste: "paste",
    Load: "load",
    Error: "error",
} as const satisfies Record<string, keyof HTMLElementEventMap>;

// How an element's tag takes the ones it has no adder for: each handler gets its own event type, then the element
export type DOMNodeEventOptions<Element> = {
    [Name in keyof typeof DOM_NODE_EVENTS as `add${Name}Listener` extends keyof Element ? never : `on${Name}`]?:
        (event: HTMLElementEventMap[(typeof DOM_NODE_EVENTS)[Name]], element: Element) => unknown;
};
