import {UI, UIElementOptions, UIElementChild} from "./UIBase";
import {dashCase, isFunction, isNumber, isString} from "../base/Utils";
import {NodeAttributes, defaultToPixelsAttributes} from "./NodeAttributes";

interface StyleInstanceOptions extends UIElementOptions {
    selector?: string;
    key?: string;
    attributes?: Record<string, any>;
}

interface StyleAttributes {
    [key: string]: string | number | Function | Array<string | number> | null | undefined;
}

interface StyleElementOptions {
    name?: string;
}

interface DynamicStyleElementOptions extends StyleElementOptions {
    style?: StyleAttributes | (() => StyleAttributes);
    selectorName?: string;
}

interface KeyframeElementOptions extends StyleElementOptions {
    keyframe?: Record<string, StyleAttributes>;
}

// TODO: should this be actually better done throught the dynamic CSS API, without doing through the DOM?
// So far it's actually better like this, since we want to edit the classes inline
export class StyleInstance extends UI.TextElement {
    declare options: StyleInstanceOptions;
    attributes: Map<string, any>;

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

            key = dashCase(key);

            // If it's a size property, and the value is a number, assume it's in pixels
            if (isNumber(value) && value != 0 && defaultToPixelsAttributes.has(key)) {
                value = value + "px";
            }

            // TODO: if key starts with vendor-, replace it with the browser specific one (and the plain one)
            const buildKeyValue = (key: string, value: any): string => key + ":" + value + ";";

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

    setAttribute(name: string, value: any): void {
        this.attributes.set(name, value);
        this.redraw();
    }

    deleteAttribute(name: string): void {
        this.attributes.delete(name);
        this.redraw();
    }
}

export class StyleElement<ExtraOptions = StyleElementOptions> extends UI.Primitive<ExtraOptions>("style") {
    getNodeAttributes(): NodeAttributes {
        // TODO: allow custom style attributes (media, scoped, etc)
        const attr = new NodeAttributes({});
        if (this.options.name) {
            attr.setAttribute("name", this.options.name);
        }
        return attr;
    }
}

const ALLOWED_SELECTOR_STARTS = new Set([":", ">", " ", "+", "~", "[", "."]);

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
        (self as any).styleInstanceCounter = ((self as any).styleInstanceCounter || 0) + 1;
        this.className = (this.options.name ||  "autocls") + "-" + (self as any).styleInstanceCounter;
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
            if (isProperValue) {
                ownStyle[key] = value;
                haveOwnStyle = true;
            } else {
                // Check that this actually is a valid subselector
                const firstChar = String(key).charAt(0);
                if (!ALLOWED_SELECTOR_STARTS.has(firstChar)) {
                    console.error(`First character of your selector is invalid. The key is "${key}"`);
                    continue;
                }
                // TODO: maybe optimize for waste here?
                const subStyle = this.getStyleInstances(selector + key, value as StyleAttributes);
                result.push(...subStyle);
            }
        }

        if (haveOwnStyle) {
            result.unshift(new StyleInstance({selector: selector, key: selector, attributes: ownStyle}));
        }
        return result;
    }

    render(): UIElementChild {
        let style = this.options.style || {};
        if (typeof style === "function") {
            style = style();
        }
        if ((style as any).selectorName) {
            this.options.selectorName = (style as any).selectorName;
            delete (style as any).selectorName;
        }
        return this.getStyleInstances(this.getSelector(), style);
    }

    setStyle(key: string, value: any): void {
        if (this.options.style && typeof this.options.style === 'object') {
            (this.options.style as StyleAttributes)[key] = value;
            (this.children[0] as StyleInstance).setAttribute(key, value);
        }
    }

    setSubStyle(selector: string, key: string, value: any): void {
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
        (self as any).styleInstanceCounter = ((self as any).styleInstanceCounter || 0) + 1;
        this.keyframeName = (this.options.name || "autokeyframe") + "-" + (self as any).styleInstanceCounter;
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
            str += dashCase(key) + ":" + value + ";";
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

    render(): UIElementChild {
        return "@keyframes " + this.getKeyframeName() + this.getKeyframeInstance(this.options.keyframe || {});
    }
}