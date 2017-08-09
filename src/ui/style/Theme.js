import {Dispatchable} from "../../base/Dispatcher";
import {UI} from "../UIBase";
import {StyleSheet} from "../Style";

function getInstance(styleSheet) {
    if (typeof styleSheet === "function") {
        if (typeof styleSheet.getInstance === "function") {
            styleSheet = styleSheet.getInstance();
        } else {
            styleSheet = styleSheet();
        }
    }
    return styleSheet;
}

function getInstanceForObject(obj) {
    if (!obj) {
        return null;
    }
    let styleSheet = (obj.theme && obj.theme.get(obj)) || obj.styleSheet || obj.styleSet;
    return getInstance(styleSheet);
}

class Theme extends Dispatchable {
    constructor(name="") {
        super();
        this.styleSheetSymbol = Symbol("Theme" + name);
        this.classSet = new Set();
        this.properties = {}
    }

    register(cls, styleSheet) {
        cls.theme = this;
        if (!cls.styleSheet) {
            cls.styleSheet = styleSheet;
        }
        this.set(cls, styleSheet);
    }

    set(cls, styleSheet) {
        cls[this.styleSheetSymbol] = styleSheet;
        this.classSet.add(cls, styleSheet);
    }

    get(cls) {
        if (!(typeof cls === "function")) {
            cls = cls.constructor;
        }
        return cls[this.styleSheetSymbol];
    }

    getProperties() {
        return this.properties;
    }

    getProperty(key, defaultValue) {
        return this.properties[key] || defaultValue;
    }

    setProperties(properties, prefix) {
        if (!prefix) {
            Object.assign(this.properties, properties);
        } else {
            for (const key in properties) {
                this.setProperty(prefix + key, properties[key]);
            }
        }
    }

    setProperty(key, value) {
        this.properties[key] = value;
    }

    static register(cls, styleSheet) {
        return this.Global.register(...arguments);
    }

    static get(cls) {
        return this.Global.get(...arguments);
    }
}

Theme.Global = new Theme("Global");

// We're going to add some methods to UI.Element, to be able to access their style sheets
function styleSheetGetter() {
    return getInstanceForObject(this.options) || getInstanceForObject(this.constructor);
}

// TODO: should fixate on a single nomenclature, just use StyleSheet everywhere
UI.Element.prototype.getStyleSheet = UI.Element.prototype.getStyleSet = styleSheetGetter;

// TODO: not sure if I like the getter pattern
Object.defineProperty(UI.Element.prototype, "styleSheet", {
    get: function() {
        return this.getStyleSheet();
    },
    set: function (value) {
        throw Error("Don't change the styleSheet of a UI Element, change this attribute in this.options");
    }
});

function registerStyle(styleClass, theme=Theme.Global) {
    return (target) => {
        theme.register(target, styleClass);
    }
}

StyleSheet.theme = Theme.Global;

export {Theme, registerStyle};
