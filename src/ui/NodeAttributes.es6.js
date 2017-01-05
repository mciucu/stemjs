// TODO: most of the functionality here can probably be moved to UI.Element

// TODO: this method should be made static in NodeAttributes
function CreateNodeAttributesMap(oldAttributesMap, allowedAttributesArray) {
    let allowedAttributesMap = new Map(oldAttributesMap);

    for (let attribute of allowedAttributesArray || []) {
        if (!attribute) continue;
        if (!Array.isArray(attribute)) {
            attribute = [attribute];
        }
        allowedAttributesMap.set(attribute[0], attribute[1] || {});
    }

    for (let [key, value] of allowedAttributesMap) {
        if (!value) {
            value = {};
        }

        if (!value.domName) {
            value.domName = key;
        }

        allowedAttributesMap.set(key, value);
    }
    return allowedAttributesMap;
}

class ClassNameSet extends Set {
    // Can't use classic super in constructor since Set is build-in type and will throw an error
    // TODO: see if could still be made to have this as constructor
    static create(className) {
        let value = new Set(String(className || "").split(" "));
        value.__proto__ = this.prototype;
        return value;
    }

    toString() {
        return Array.from(this).join(" ");
    }
}

// TODO: should all the logic from this class be moved to UI.Element or UI.createElement ??
class NodeAttributes {
    constructor(options, attributeNamesMap) {
        let attributesMap;

        for (let attributeName in options) {
            if (attributeName.startsWith("data-") || attributeName.startsWith("aria-")) {
                if (!attributesMap) {
                    attributesMap = new Map();
                }

                attributesMap.set(attributeName, options[attributeName]);
                continue;
            }

            let attributeProperties = attributeNamesMap.get(attributeName);
            if (attributeProperties) {
                let value = options[attributeName];

                if (attributeProperties.noValue) {
                    if (value) {
                        value = "";
                    } else {
                        value = undefined;
                    }
                }

                if (!attributesMap) {
                    attributesMap = new Map();
                }

                attributesMap.set(attributeProperties.domName, value);
            }
        }

        if (attributesMap) {
            this.attributes = attributesMap;
        }

        if (options.className) {
            this.className = options.className;
        }

        this.style = options.style;
    }

    // TODO: there's no real use-case for this method
    // TODO: merge this with UI.Element
    setAttribute(key, value, node) {
        if (!this.attributes) {
            this.attributes = new Map();
        }

        if (value === undefined) {
            return;
        }
        if (typeof value === "function") {
            value = value();
        }
        this.attributes.set(key, value);
        if (node) {
            // TODO: check here if different?
            node.setAttribute(key, value);
        }
    }

    // TODO: merge this with UI.Element
    setStyle(key, value, node) {
        if (value === undefined) {
            // TODO: why return here and not remove the old value?
            return;
        }
        if (typeof value === "function") {
            value = value();
        }
        this.style = this.style || {};
        this.style[key] = value;
        if (node && node.style[key] !== value) {
            node.style[key] = value;
        }
    }

    static getClassArray(classes) {
        if (!classes) {
            return [];
        }
        if (Array.isArray(classes)) {
            return classes.map(x => String(x).trim());
        } else {
            return String(classes).trim().split(" ");
        }
    }

    // TODO: this logic should be merged with UI.Element
    // Add a class to a string, returns the result
    static addClassTo(className, classInstance) {
        classInstance = String(classInstance);
        if (!className) {
            return classInstance;
        } else {
            return className + " " + classInstance;
        }
    }

    static removeClassFrom(className, classInstance) {
        let classArray = this.getClassArray(className);
        let result = "";
        for (let cls of classArray) {
            if (cls != classInstance) {
                if (result) {
                    result += " ";
                }
                result += cls;
            }
        }
        return result;
    }

    getClassNameSet() {
        if (!(this.className instanceof ClassNameSet)) {
            this.className = ClassNameSet.create(this.className || "");
        }
        return this.className;
    }

    addClass(classes, node) {
        classes = this.constructor.getClassArray(classes);

        let classNameSet = this.getClassNameSet();

        for (let cls of classes) {
            classNameSet.add(cls);
            if (node) {
                node.classList.add(cls);
            }
        }
    }

    removeClass(classes, node) {
        classes = this.constructor.getClassArray(classes);
        let classNameSet = this.getClassNameSet();

        for (let cls of classes) {
            classNameSet.delete(cls);
            if (node) {
                node.classList.remove(cls);
            }
        }
    }

    apply(node) {
        if (this.attributes) {
            // First update existing node attributes and delete old ones
            let nodeAttributes = node.attributes;
            for (let i = nodeAttributes.length - 1; i >= 0; i--) {
                let attr = nodeAttributes[i];
                let key = attr.name;
                if (key === "style" || key === "class") {
                    continue;
                }
                if (this.attributes.has(key)) {
                    let value = this.attributes.get(key);
                    if (typeof value !== "undefined") {
                        node.setAttribute(key, value);
                    } else {
                        node.removeAttribute(key);
                    }
                    this.attributes.delete(key);
                } else {
                    node.removeAttribute(key);
                }
            }
            // Add new attributes
            for (let [key, value] of this.attributes) {
                if (typeof value !== "undefined") {
                    node.setAttribute(key, value);
                }
            }
        }

        if (this.className) {
            node.className = String(this.className);
            // TODO: find out which solution is best
            // This solution works for svg nodes as well
            // for (let cls of this.getClassNameSet()) {
            //    node.classList.add(cls);
            // }
        } else {
            node.removeAttribute("class");
        }

        node.removeAttribute("style");
        if (this.style) {
            for (let key in this.style) {
                let value = this.style[key];
                if (typeof value === "function") {
                    value = value();
                }
                node.style[key] = value;
            }
        }
    }
}

// Default node attributes, should be as few of these as possible
NodeAttributes.defaultAttributesMap = CreateNodeAttributesMap([
    ["id"],
    ["action"],
    ["colspan"],
    ["default"],
    ["disabled", {noValue: true}],
    ["fixed"],
    ["forAttr", {domName: "for"}],
    ["hidden"],
    ["href"],
    ["rel"],
    ["minHeight"],
    ["minWidth"],
    ["role"],
    ["target"],
    ["HTMLtitle", {domName: "title"}],
    ["type"],
    ["placeholder"],
    ["src"],
    ["height"],
    ["width"],
    //["value"], // Value is intentionally disabled
]);

export {CreateNodeAttributesMap, NodeAttributes};
