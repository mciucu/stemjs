// TODO: this file needs to be revisited
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

//TODO: should be as few of these as possible
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

class DOMAttributes {
    constructor(options, attributeNamesMap=ATTRIBUTE_NAMES_MAP) {
        this.attributes = new Map();
        //this.className = null;
        this.classes = new Set();
        this.styleMap = null;
        //TODO: the set of allowed name should be static in the constructor

        for (let attributeName in options) {
            // No hasOwnProperty for perfomance
            if (attributeName.startsWith("data-") || attributeName.startsWith("aria-")) {
                this.attributes.set(attributeName, options[attributeName]);
            }

            if (attributeNamesMap.has(attributeName)) {

                let attribute = attributeNamesMap.get(attributeName);
                let value = options[attributeName];

                if (attribute.noValue) {
                    if (value) {
                        value = "";
                    } else {
                        value = undefined;
                    }
                }

                this.attributes.set(attribute.domName, value);
            }
        }

        if (options.hasOwnProperty("classes")) {
            // User filter here to prevent empty classes
            this.classes = new Set(options.classes.filter(cls => cls));
        } else if (options.hasOwnProperty("className")) {
            // regex matches any whitespace character or comma
            this.classes = new Set((options.className + "").split(/[\s,]+/).filter(cls => cls));
        }

        if (options.hasOwnProperty("style")) {
            this.styleMap = new Map();
            for (let key in options.style) {
                this.styleMap.set(key, options.style[key]);
            }
        }
    }

    setAttribute(key, value, node) {
        if (value === undefined) {
            return;
        }
        this.attributes.set(key, value);
        if (node) {
            // TODO: check here if different
            node.setAttribute(key, value);
        }
    }

    setStyle(key, value, node) {
        if (value === undefined) {
            return;
        }
        if (!this.styleMap) {
            this.styleMap = new Map();
        }
        this.styleMap.set(key, value);
        if (node && node.style[key] !== value) {
            node.style[key] = value;
        }
    }

    addClass(classes, node) {
        if (!classes) return;

        if (Array.isArray(classes)) {
            for (let cls of classes) {
                this.classes.add(cls);
                if (node) {
                    node.classList.add(cls);
                }
            }
        } else {
            this.addClass(classes.split(/[\s,]+/), node);
        }
    }

    removeClass(classes, node) {
        if (!classes) return;

        if (Array.isArray(classes)) {
            for (let cls of classes) {
                this.classes.delete(cls);
                if (node) {
                    node.classList.remove(cls);
                }
            }
        } else {
            this.removeClass(classes.split(/[\s,]+/), node);
        }
    }

    apply(node) {
        //TODO: attributes and styles should be synched (remove missing ones)
        for (let [key, value] of this.attributes) {
            if (typeof value !== "undefined") {
                node.setAttribute(key, value);
            } else {
                node.removeAttribute(key);
            }
        }

        // node.removeAttribute("class");
        if (this.classes && this.classes.size > 0) {
            node.className = Array.from(this.classes).join(" ");
            // TODO: find out which solution is best
            // This solution works for svg nodes as well
            //for (let cls of this.classes) {
            //    node.classList.add(cls);
            //}
        // if (this.classes && this.classes.size > 0) {
        //     node.className = "";
        //     for (let cls of this.classes) {
        //         node.classList.add(cls);
        //     }
        } else {
            node.removeAttribute("class");
        }

        node.removeAttribute("style");
        if (this.styleMap) {
            for (let [key, value] of this.styleMap) {
                if (node.style[key] !== value) {
                    node.style[key] = value;
                }
            }
        }
    }
}

export {CreateAllowedAttributesMap, DOMAttributes, ATTRIBUTE_NAMES_MAP};
