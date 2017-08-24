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
    let styleSheet = (obj.theme && obj.theme.get(obj)) || obj.styleSheet;
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

UI.Element.prototype.getStyleSheet = function styleSheetGetter() {
    return getInstanceForObject(this.options) || getInstanceForObject(this.constructor);
};

function registerStyle(styleClass, theme=Theme.Global) {
    return (target) => {
        theme.register(target, styleClass);
    }
}

StyleSheet.theme = Theme.Global;

export {Theme, registerStyle};
