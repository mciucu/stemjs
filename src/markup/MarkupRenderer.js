import {UI} from "../ui/UI";
import {MarkupParser} from "./MarkupParser";
import {StaticCodeHighlighter, Panel, Link, Image} from "../ui/UI";

// Class that for every markup tag returns the UI class to instantiate for that element
class MarkupClassMap {
    constructor(fallback, extraClasses=[]) {
        this.classMap = new Map();
        this.fallback = fallback;
        for (const extraClass of extraClasses) {
            this.addClass(extraClass[0], extraClass[1]);
        }
    }

    addClass(className, classObject) {
        this.classMap.set(className, classObject);
    }

    registerDependencies(dependencies) {
        for (let dependency of dependencies) {
            if (dependency && dependency.registerMarkup) {
                dependency.registerMarkup(this);
            }
        }
    }

    static addClass(className, classObject) {
        this.GLOBAL.addClass(className, classObject);
    }

    getClass(className) {
        let classObject = this.classMap.get(className);
        if (!classObject && this.fallback) {
            classObject = this.fallback.getClass(className);
        }
        return classObject;
    }

    get(className) {
        return this.getClass(className);
    }

    has(className) {
        return this.getClass(className);
    }
};

MarkupClassMap.GLOBAL = new MarkupClassMap();

class MarkupRenderer extends Panel {
    setOptions(options) {
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
        if (this.options.classMap) {
            this.classMap = this.options.classMap;
        }
    }

    setValue(value) {
        if (typeof value === "string") {
            this.options.rawValue = value;
            try {
                value = this.options.parser.parse(value);
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

    reparse() {
        if (this.options.rawValue) {
            this.setValue(this.options.rawValue);
        }
    }

    registerDependencies(dependencies) {
        if (dependencies.length > 0) {
            this.classMap.registerDependencies(dependencies);
            this.reparse();
        }
    }

    addClass(className, classObject) {
        this.classMap.addClass(className, classObject);
    }

    getClass(className) {
        return this.classMap.getClass(className);
    }

    getValue() {
        return this.options.value;
    }

    convertToUI(value) {
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

        let classObject = this.getClass(value.tag) || value.tag;

        // TODO: maybe just copy to another object, not delete?
        //delete value.tag;
        return UI.createElement(classObject, value, ...(value.children || []));
    }

    render() {
        return this.convertToUI(this.getValue());
    }
}

MarkupClassMap.addClass("CodeSnippet", StaticCodeHighlighter);

const SafeUriEnhancer = (BaseClass, attribute) => class SafeUriClass extends BaseClass {
    setOptions(options) {
        if (options.hasOwnProperty(attribute) && !this.constructor.isSafeUri(options[attribute])) {
            return super.setOptions(Object.assign({}, options, {[attribute]: undefined}));
        }
        return super.setOptions(options);
    }

    static isSafeUri(uri) {
        return uri.indexOf(":") === -1 ||
               uri.startsWith("http:") ||
               uri.startsWith("https:") ||
               uri.startsWith("mailto:");
    }
};

MarkupClassMap.addClass("Link", SafeUriEnhancer(Link, "href"));
MarkupClassMap.addClass("Image", SafeUriEnhancer(Image, "src"));

export {MarkupClassMap, MarkupRenderer};
