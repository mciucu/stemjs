import {TextUIElement, UI, type UIChild} from "./UIBase";
import {dashCase, isFunction, isNumber, isString} from "../base/Utils";
import {NodeAttributes, styleValueWithUnit} from "./NodeAttributes";

// The counter every generated class and keyframe name is numbered from
declare global {
    var styleInstanceCounter: number | undefined;
}

interface StyleAttributes {
    selectorName?: string; // Written on the style object rather than the options, and moved across by render
    [key: string]: string | number | Function | Array<string | number> | null | undefined;
}

type StyleAttributeValue = StyleAttributes[string];

interface StyleInstanceOptions {
    value?: string; // The rule text, which render() computes from the attributes below
    selector?: string;
    key?: string;
    attributes?: StyleAttributes;
}

interface StyleElementOptions {
    name?: string;
}

export interface DynamicStyleElementOptions extends StyleElementOptions {
    style?: StyleAttributes | (() => StyleAttributes);
    selectorName?: string;
}

interface KeyframeElementOptions extends StyleElementOptions {
    keyframe?: Record<string, StyleAttributes>;
}

// A style's key as CSS names the property: dashed, and a vendor's prefix (WebkitAppRegion, msTransform) with the dash before it
export function cssPropertyName(key: string): string {
    const dashed = dashCase(key);
    return dashed !== key && /^(webkit|moz|ms)-/.test(dashed) ? "-" + dashed : dashed;
}

// A selector list's parts: split at the commas that are outside brackets, parentheses and quotes
function splitSelectorList(selector: string): string[] {
    const parts: string[] = [];
    let depth = 0;
    let quote = "";
    let start = 0;
    for (let i = 0; i < selector.length; i++) {
        const char = selector[i];
        if (quote) {
            if (char === "\\") {
                i++;
            } else if (char === quote) {
                quote = "";
            }
        } else if (char === '"' || char === "'") {
            quote = char;
        } else if (char === "(" || char === "[") {
            depth++;
        } else if (char === ")" || char === "]") {
            depth--;
        } else if (char === "," && depth === 0) {
            parts.push(selector.slice(start, i));
            start = i + 1;
        }
    }
    parts.push(selector.slice(start));
    return parts;
}

// A nested key's parts, each as it is appended to the parent's selector. The space around a comma isn't part of a selector,
// so the parts after the first take the first one's leading space: " th, td" is a th and a td inside the parent
export function nestedKeyParts(key: string): string[] {
    if (!key.includes(",")) {
        return [key];
    }
    const [first, ...rest] = splitSelectorList(key);
    const leadingSpace = first.slice(0, first.length - first.trimStart().length);
    return [first.trimEnd(), ...rest.map(part => leadingSpace + part.trim())];
}

const ALLOWED_SELECTOR_STARTS = new Set([":", ">", " ", "+", "~", "[", "."]);

// The selector of a rule nested under another. Either may be a list, and then each part of the parent takes each part of the key.
// A later part of the key that can't follow a selector (a tag's name: the th of ">td,th") stands by itself, as it always has
export function nestedSelector(parent: string, keyParts: string[]): string {
    if (keyParts.length === 1 && !parent.includes(",")) {
        return parent + keyParts[0];
    }
    const parentParts = splitSelectorList(parent).map(part => part.trim());
    return keyParts.flatMap(keyPart => {
        return ALLOWED_SELECTOR_STARTS.has(keyPart.charAt(0)) ? parentParts.map(parentPart => parentPart + keyPart) : [keyPart];
    }).join(",");
}

// TODO: should this be actually better done throught the dynamic CSS API, without doing through the DOM?
// So far it's actually better like this, since we want to edit the classes inline
export class StyleInstance extends TextUIElement<StyleInstanceOptions> {
    attributes: Map<string, StyleAttributeValue>;

    constructor(options: StyleInstanceOptions) {
        super(options);
        this.setOptions(options);
    }

    setOptions(options: StyleInstanceOptions): void {
        this.options = options;
        this.options.attributes = this.options.attributes || {};
        this.attributes = new Map();
        for (let key in this.options.attributes) {
            this.attributes.set(key, this.options.attributes[key]);
        }
    }

    getValue(): string {
        let str = this.options.selector + "{";
        for (let [key, value] of this.attributes) {
            if (typeof value === "function") {
                value = value();
            }
            // Ignore keys with null or undefined value
            if (value == null) {
                continue;
            }

            key = cssPropertyName(key);

            // A number for a size is in pixels, but a small line height (styleValueWithUnit)
            value = styleValueWithUnit(key, value);

            const buildKeyValue = (key: string, value: StyleAttributeValue): string => key + ":" + value + ";";

            if (Array.isArray(value)) {
                for (const v of value) {
                    str += buildKeyValue(key, v);
                }
            } else {
                str += buildKeyValue(key, value);
            }
        }
        return str + "}";
    }

    copyState(element: StyleInstance): void {
        this.setOptions(element.options);
    }

    setAttribute(name: string, value: StyleAttributeValue): void {
        this.attributes.set(name, value);
        this.redraw();
    }

    deleteAttribute(name: string): void {
        this.attributes.delete(name);
        this.redraw();
    }
}

export class StyleElement<ExtraOptions = {}> extends UI.Primitive("style")<ExtraOptions & StyleElementOptions, HTMLStyleElement> {
    getNodeAttributes(): NodeAttributes {
        // TODO: allow custom style attributes (media, scoped, etc)
        const attr = new NodeAttributes({});
        if (this.options.name) {
            attr.setAttribute("name", this.options.name);
        }
        return attr;
    }
}

// TODO: figure out how to work with animation frames, this only creates a wrapper class
export class DynamicStyleElement extends StyleElement<DynamicStyleElementOptions> {
    className?: string;

    toString(): string {
        return this.getClassName();
    }

    // Overwrite valueOf, so when using the + operator should seamlessly concatenate to create a valid className
    valueOf(): string {
        return " " + this.getClassName() + " ";
    }

    // TODO: use a cached decorator here
    getClassName(): string {
        if (this.className) {
            return this.className;
        }
        self.styleInstanceCounter = (self.styleInstanceCounter || 0) + 1;
        this.className = (this.options.name ||  "autocls") + "-" + self.styleInstanceCounter;
        return this.className;
    }

    getSelector(): string {
        return this.options.selectorName || "." + this.getClassName();
    }

    // A cyclic dependency in the style object will cause an infinite loop here
    getStyleInstances(selector: string, style: StyleAttributes): StyleInstance[] {
        const result: StyleInstance[] = [];
        const ownStyle: StyleAttributes = {};
        let haveOwnStyle = false;
        for (const key in style) {
            const value = style[key];
            if (value == null) {
                continue;
            }
            const isProperValue = (isString(value) || isNumber(value) || isFunction(value) || Array.isArray(value));
            if (value instanceof KeyframeElement) {
                // A @keyframesRule (animationName: this.spin) stands for its generated name, as a @styleRule does for its class
                ownStyle[key] = value.getKeyframeName();
                haveOwnStyle = true;
            } else if (isProperValue) {
                ownStyle[key] = value;
                haveOwnStyle = true;
            } else {
                // Check that this actually is a valid subselector
                const keyParts = nestedKeyParts(String(key));
                if (!ALLOWED_SELECTOR_STARTS.has(keyParts[0].charAt(0))) {
                    console.error(`First character of your selector is invalid. The key is "${key}"`);
                    continue;
                }
                // TODO: maybe optimize for waste here?
                const subStyle = this.getStyleInstances(nestedSelector(selector, keyParts), value as StyleAttributes);
                result.push(...subStyle);
            }
        }

        if (haveOwnStyle) {
            result.unshift(new StyleInstance({selector: selector, key: selector, attributes: ownStyle}));
        }
        return result;
    }

    render(): StyleInstance[] {
        // On a style element `style` is the rule body it generates, not the node's own inline style
        let style = (this.options.style || {}) as StyleAttributes | (() => StyleAttributes);
        if (typeof style === "function") {
            style = style();
        }
        if (style.selectorName) {
            this.options.selectorName = style.selectorName;
            delete style.selectorName;
        }
        return this.getStyleInstances(this.getSelector(), style);
    }

    setStyle(key: string, value: StyleAttributeValue): void {
        if (this.options.style && typeof this.options.style === 'object') {
            (this.options.style as StyleAttributes)[key] = value;
            (this.children[0] as StyleInstance).setAttribute(key, value);
        }
    }

    setSubStyle(_selector: string, _key: string, _value: StyleAttributeValue): void {
        throw Error("Implement me!");
    }

    getStyleObject(): StyleAttributes | (() => StyleAttributes) | undefined {
        return this.options.style;
    }
}

export class KeyframeElement extends StyleElement<KeyframeElementOptions> {
    keyframeName?: string;

    toString(): string {
        return this.getKeyframeName();
    }

    getKeyframeName(): string {
        if (this.keyframeName) {
            return this.keyframeName;
        }
        self.styleInstanceCounter = (self.styleInstanceCounter || 0) + 1;
        this.keyframeName = (this.options.name || "autokeyframe") + "-" + self.styleInstanceCounter;
        return this.keyframeName;
    }

    getValue(style: StyleAttributes): string {
        let str = "{";
        for (let key in style) {
            let value = style[key];
            if (typeof value === "function") {
                value = value();
            }
            if (value == null) {
                continue;
            }
            str += cssPropertyName(key) + ":" + value + ";";
        }
        return str + "}";
    }

    getKeyframeInstance(keyframe: Record<string, StyleAttributes>): string {
        let result = "{";
        for (let key in keyframe) {
            let value = keyframe[key];
            result += key + " " + this.getValue(value);
        }
        return result + "}";
    }

    render(): string {
        return "@keyframes " + this.getKeyframeName() + this.getKeyframeInstance(this.options.keyframe || {});
    }
}
