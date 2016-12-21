// TODO: this file needs to be cleaned up and renamed DOM -> Node
// TODO: most of the functionality here can probably be moved to UI.Element
function CreateAllowedAttributesMap(oldAttributesMap, allowedAttributesArray) {
    let allowedAttributesMap = new Map(oldAttributesMap);

    for (let attribute of allowedAttributesArray || []) {
        if (!attribute) continue;
        if (!Array.isArray(attribute)) {
            attribute = [attribute];
        }
        if (attribute.length < 2) {
            attribute.push({});
        }
        allowedAttributesMap.set(attribute[0], attribute[1]);
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

// Should be as few of these as possible
const ATTRIBUTE_NAMES_MAP = CreateAllowedAttributesMap([
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


// TODO: should all the logic from this class be moved to UI.Element or UI.createElement ??
class DOMAttributes {
    constructor(options, attributeNamesMap) {
        let attributesMap;

        for (let attributeName in options) {
            let attributeProperties = attributeNamesMap.get(attributeName);
            if (attributeProperties || attributeName.startsWith("aria-")) {
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

        if (options.classes) {
            // User filter here to prevent empty classes
            this.classes = new Set(options.classes);
        } else if (options.className) {
            this.className = String(options.className);
        }

        this.style = options.style;
    }

    // TODO: there's no real use-case for this method
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
            // TODO: check here if different
            node.setAttribute(key, value);
        }
    }

    setStyle(key, value, node) {
        if (value === undefined) {
            // TODO: why return here and not remove the old value?
            return;
        }
        if (typeof value === "function") {
            value = value();
        }
        if (!this.style) {
            this.style = {};
        }
        this.style[key] = value;
        if (node && node.style[key] !== value) {
            node.style[key] = value;
        }
    }

    addClass(classes, node) {
        if (!classes) return;

        if (!this.classes) {
            if (this.className) {
                this.classes = new Set(this.className.split(" "));
                this.className = undefined;
            } else {
                this.classes = new Set();
            }
        }

        if (Array.isArray(classes)) {
            for (let cls of classes) {
                this.classes.add(cls);
                if (node) {
                    node.classList.add(cls);
                }
            }
        } else {
            classes = String(classes);
            this.addClass(classes.split(" "), node);
        }
    }

    removeClass(classes, node) {
        if (!classes) return;

        if (!this.classes) {
            if (this.className) {
                this.classes = new Set(this.className.split(" "));
                this.className = undefined;
            } else {
                this.classes = new Set();
            }
        }

        if (Array.isArray(classes)) {
            for (let cls of classes) {
                this.classes.delete(cls);
                if (node) {
                    node.classList.remove(cls);
                }
            }
        } else {
            this.removeClass(classes.split(" "), node);
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
            node.className = this.className;
        } else if (this.classes && this.classes.size > 0) {
            node.className = Array.from(this.classes).join(" ");
            // TODO: find out which solution is best
            // This solution works for svg nodes as well
            // for (let cls of this.classes) {
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

export {CreateAllowedAttributesMap, DOMAttributes, ATTRIBUTE_NAMES_MAP};
