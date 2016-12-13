import {UI} from "../ui/UI";
import {MarkupParser} from "./MarkupParser";

// Class that for every markup tag returns the UI class to instanciate for that element
UI.MarkupClassMap = class MarkupClassMap {
    constructor(fallback) {
        this.classMap = new Map();
        this.fallback = fallback;
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

UI.MarkupClassMap.GLOBAL = new UI.MarkupClassMap();

UI.MarkupRenderer = class MarkupRenderer extends UI.Panel {
    setOptions(options) {
        if (!options.classMap) {
            options.classMap = new UI.MarkupClassMap(UI.MarkupClassMap.GLOBAL);
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

    convertToUI(value) {
        if (value instanceof UI.TextElement || value instanceof UI.Element) {
            // TODO: investigate this!
            return value;
        }

        if (typeof value === "string") {
            return new UI.TextElement(value);
        }
        if (Array.isArray(value)) {
            let result = new Array(value.length);
            for (let i = 0; i < value.length; i += 1) {
                result[i] = this.convertToUI(value[i]);
            }
            return result;
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
        return this.convertToUI(this.options.value);
    }
};

UI.MarkupClassMap.addClass("CodeSnippet", UI.StaticCodeHighlighter);
UI.MarkupClassMap.addClass("Link", UI.Link);
UI.MarkupClassMap.addClass("Image", UI.Image);
