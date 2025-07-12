import {dashCase, isNumber, isString, isPlainObject, setObjectPrototype, resolveFuncValue} from "../base/Utils";

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
]);

// Used to map from option key to a DOM attribute name.
// Can recursively fall back to a base mapping, to allow extending of a parent class
export class DOMAttributesMap {
    allowedAttributesMap = new Map<string, any>();
    reverseNameMap = new Map<string, string>();
    fallbackMapping: DOMAttributesMap | null;
    allowedPrefixes: string[];

    constructor(fallbackMapping: DOMAttributesMap | null, allowedAttributesArray: any[] = [], allowedPrefixes: string[] = []) {
        this.fallbackMapping = fallbackMapping;

        for (let attribute of allowedAttributesArray) {
            if (!Array.isArray(attribute)) {
                attribute = [attribute];
            }

            this.setAttribute(attribute[0], attribute[1]);
        }

        this.allowedPrefixes = allowedPrefixes;
    }

    setAttribute(key: string, value?: any): void {
        value = value || {};
        value.domName = value.domName || key;

        this.allowedAttributesMap.set(key, value);
        this.reverseNameMap.set(value.domName, key);
    }

    get(key: string): any {
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

export class NodeAttributes {
    [key: string]: any;
    className?: string | ClassNameSet;
    style?: Record<string, any> | string;
    styleString?: string;
    whitelistedAttributes?: Record<string, boolean>;
    static defaultAttributesMap: DOMAttributesMap;
    static defaultEventsMap: DOMAttributesMap;

    constructor(obj?: any) {
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
    setAttribute(key: string, value: any, node?: HTMLElement, attributesMap: DOMAttributesMap = (this.constructor as any).defaultAttributesMap): void {
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

    applyStyleToNode(key: string, value: any, node?: HTMLElement): void {
        if (typeof value === "function") {
            value = value();
        }
        if (isNumber(value) && value != 0 && defaultToPixelsAttributes.has(dashCase(key))) {
            value = value + "px";
        }
        if (node && (node.style as any)[key] !== value) {
            (node.style as any)[key] = value;
        }
    }

    // Should the style property have been passed in as a string, save it to the variable that will be applied before the string object.
    ensureNoStringStyle(): void {
        if (isString(this.style)) {
            this.styleString = this.style; // Keep in a temp value
            delete this.style;
        }
    }

    setStyle(key: string | Record<string, any>, value?: any, node?: HTMLElement): void {
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

    removeStyle(key: string, node?: HTMLElement): void {
        if (this.style) {
            delete this.style[key];
        }
        if (node?.style[key]) {
            delete node.style[key];
        }
    }

    static getClassArray(classes: any): string[] {
        if (!classes) {
            return [];
        }
        if (Array.isArray(classes)) {
            return classes.map(x => String(x).trim());
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

    addClass(classes: any, node?: HTMLElement): void {
        classes = (this.constructor as typeof NodeAttributes).getClassArray(classes);

        for (const cls of classes) {
            this.getClassNameSet().add(cls);
            if (node) {
                node.classList.add(cls);
            }
        }
    }

    removeClass(classes: any, node?: HTMLElement): void {
        classes = (this.constructor as typeof NodeAttributes).getClassArray(classes);

        for (const cls of classes) {
            this.getClassNameSet().delete(cls);
            if (node) {
                node.classList.remove(cls);
            }
        }
    }

    hasClass(className: string | any): boolean {
        return this.getClassNameSet().has(isString(className) ? className : className.className);
    }

    // Apply the attribute only if it's in the attributesMap
    applyAttribute(key: string, node: HTMLElement, attributesMap: DOMAttributesMap): void {
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

    applyClassName(node: HTMLElement): void {
        if (this.className) {
            const className = String(this.className);
            if (node.className !== className) {
                node.className = className;
            }
        } else {
            if (node.className) {
                node.removeAttribute("class");
            }
        }
    }

    apply(node: HTMLElement, attributesMap: DOMAttributesMap): void {
        const addedAttributes: Record<string, boolean> = {};
        const whitelistedAttributes = this.whitelistedAttributes || {};

        // First update existing node attributes and delete old ones
        // TODO: optimize to not run this if the node was freshly created
        const nodeAttributes = node.attributes;
        for (let i = nodeAttributes.length - 1; i >= 0; i--) {
            const attr = nodeAttributes[i];
            const attributeName = attr.name;
            if (attributeName === "style" || attributeName === "class") {
                // TODO: maybe should do work here?
                continue;
            }

            const key = attributesMap.getKeyFromDOMName(attributeName);

            if (key && this.hasOwnProperty(key)) {
                let value = this[key];
                const attributeOptions = attributesMap.get(key);
                if (attributeOptions?.noValue) {
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
        for (const key in this) {
            if (addedAttributes[key]) {
                continue;
            }
            this.applyAttribute(key, node, attributesMap);
        }

        this.applyClassName(node);

        node.removeAttribute("style");
        this.ensureNoStringStyle();
        if (this.styleString) {
            // @ts-ignore
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
    ["checked", {noValue: true}],
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
    ["data"],
    //["value"], // Value is intentionally disabled
], [
    "data-",
    "aria-",
]);

NodeAttributes.defaultEventsMap = new DOMAttributesMap(null, [
    ["click"],
    ["mouseenter"],
    ["mouseleave"],
    ["doubleClick", {domName: "dblclick"}],
]);
