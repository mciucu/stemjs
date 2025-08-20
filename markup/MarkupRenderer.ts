import {BaseUIElement, UI} from "../ui/UIBase.js";
import {MarkupParser} from "./MarkupParser.js";
import {Panel, Link, Image} from "../ui/UIPrimitives";
import {StaticCodeHighlighter} from "../ui/CodeEditor";

interface MarkupElement {
    tag: string;
    children?: MarkupElement[] | string[];
    [key: string]: any;
}

interface MarkupRendererOptions {
    classMap?: MarkupClassMap;
    parser?: MarkupParser;
    value?: string | MarkupElement;
    rawValue?: string;
    [key: string]: any;
}

// TODO @types shouldn't this be in UIBase?
type UIClass = new (...args: any[]) => BaseUIElement;
type MarkupDependency = {
    registerMarkup?: (classMap: MarkupClassMap) => void;
};

// Class that for every markup tag returns the UI class to instantiate for that element
export class MarkupClassMap {
    static GLOBAL: MarkupClassMap = new MarkupClassMap();

    private classMap: Map<string, UIClass>;
    private fallback: MarkupClassMap | null;

    constructor(fallback: MarkupClassMap | null = null, extraClasses: [string, UIClass][] = []) {
        this.classMap = new Map();
        this.fallback = fallback;
        for (const extraClass of extraClasses) {
            this.addClass(extraClass[0], extraClass[1]);
        }
    }

    addClass(className: string, classObject: UIClass): void {
        this.classMap.set(className, classObject);
    }

    registerDependencies(dependencies: MarkupDependency[]): void {
        for (let dependency of dependencies) {
            if (dependency?.registerMarkup) {
                dependency.registerMarkup(this);
            }
        }
    }

    static addClass(className: string, classObject: UIClass): void {
        this.GLOBAL.addClass(className, classObject);
    }

    getClass(className: string): UIClass | undefined {
        let classObject = this.classMap.get(className);
        if (!classObject && this.fallback) {
            classObject = this.fallback.getClass(className);
        }
        return classObject;
    }

    get(className: string): UIClass | undefined {
        return this.getClass(className);
    }

    has(className: string): UIClass | undefined {
        return this.getClass(className);
    }
}

export class MarkupRenderer extends Panel {
    declare options: MarkupRendererOptions;
    private declare classMap: MarkupClassMap;

    setOptions(options: MarkupRendererOptions): void {
        if (!options.classMap) {
            options.classMap = new MarkupClassMap(MarkupClassMap.GLOBAL);
        }
        if (!options.parser) {
            options.parser = new MarkupParser({
                uiElements: options.classMap,
            });
        }
        super.setOptions(options);

        this.setValue(this.options.value || "");
        this.classMap = this.options.classMap;
    }

    setValue(value: string | MarkupElement): void {
        if (typeof value === "string") {
            this.options.rawValue = value;
            try {
                value = this.options.parser!.parse(value);
            } catch (e) {
                console.error("Can't parse ", value, e);
                value = {
                    tag: "span",
                    children: [value]
                };
            }
        }
        this.options.value = value;
    }

    reparse(): void {
        if (this.options.rawValue) {
            this.setValue(this.options.rawValue);
        }
    }

    registerDependencies(dependencies: MarkupDependency[]): void {
        if (dependencies.length > 0) {
            this.classMap.registerDependencies(dependencies);
            this.reparse();
        }
    }

    addClass(className: string, classObject: UIClass): void {
        this.classMap.addClass(className, classObject);
    }

    getClass(className: string): UIClass | undefined {
        return this.classMap.getClass(className);
    }

    getValue(): string | MarkupElement | undefined {
        return this.options.value;
    }

    convertToUI(value: any): any {
        if (value instanceof UI.TextElement || value instanceof UI.Element) {
            // TODO: investigate this!
            return value;
        }

        if (typeof value === "string") {
            return new UI.TextElement(value);
        }
        if (Array.isArray(value)) {
            return value.map(x => this.convertToUI(x));
        }
        if (value.children) {
            value.children = this.convertToUI(value.children);
        }

        let classObject: UIClass | string = this.getClass(value.tag) || value.tag;

        // TODO: maybe just copy to another object, not delete?
        //delete value.tag;
        return UI.createElement(classObject, value, ...(value.children || []));
    }

    render(): any {
        return this.convertToUI(this.getValue());
    }
}

MarkupClassMap.addClass("CodeSnippet", StaticCodeHighlighter);

const SafeUriEnhancer = <T extends UIClass>(BaseClass: T, attribute: string) => class SafeUriClass extends BaseClass {
    setOptions(options: any): any {
        if (options[attribute] && !(this.constructor as typeof SafeUriClass).isSafeUri(options[attribute])) {
            options = Object.assign({}, options, {[attribute]: undefined});
        }
        return super.setOptions(options);
    }

    static isSafeUri(uri: string): boolean {
        return uri.indexOf(":") === -1 ||
               uri.startsWith("http:") ||
               uri.startsWith("https:") ||
               uri.startsWith("mailto:");
    }
};

MarkupClassMap.addClass("Link", SafeUriEnhancer(Link, "href"));
MarkupClassMap.addClass("Image", SafeUriEnhancer(Image, "src"));
