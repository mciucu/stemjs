import {Dispatchable} from "../../base/Dispatcher";
import {CallThrottler} from "../../base/Utils";


class Theme extends Dispatchable {
    static PropsSymbol = Symbol("Props");
    static Global = new this(null, "Global");

    classSet = new Set();
    styleSheetInstances = new Map(); // map from StyleSheet class to instance
    styleSheetSymbol = Symbol(this.name + "StyleSheet");
    updateThrottled = (new CallThrottler({throttle: 50})).wrap(() => this.updateStyleSheets()); // TODO @cleanup CallThrottler syntax is really ugly

    constructor(baseTheme, name, props) {
        super();
        this.name = name;
        this.baseTheme = baseTheme;
        this.properties = {
            theme: this,
            ...props,
        }

        window.addEventListener("resize", () => this.updateThrottled());
    }

    // Create a new Theme, based on the current one
    fork(name, extraProps) {
        return new Theme(this, name, extraProps);
    }

    register(cls, styleSheet) {
        cls.theme = this;
        cls[this.styleSheetSymbol] = styleSheet;
        this.classSet.add(cls);
    }

    getStyleSheet(cls) {
        return cls[this.styleSheetSymbol] || this.baseTheme?.getStyleSheet(cls);
    }

    setProperties(properties, update=true) {
        Object.assign(this.properties, properties);
        if (update) {
            this.updateThrottled();
        }
    }

    getAllStyleSheets() {
        let styleSheetSet = new Set(this.styleSheetInstances.values());
        for (const cls of this.classSet.values()) {
            styleSheetSet.add(this.getStyleSheet(cls));
        }
        return Array.from(styleSheetSet).map(styleSheet => styleSheet.getInstance(this));
    }

    getStyleSheetInstance(Cls) {
        let instance = this.styleSheetInstances.get(Cls);
        if (!instance) {
            instance = new Cls({theme: this});
            this.styleSheetInstances.set(Cls, instance);
        }
        return instance;
    }

    updateStyleSheets() {
        this.dispatch("beforeUpdateStyleSheets");
        for (const styleSheet of this.getAllStyleSheets()) {
            if (styleSheet.update) {
                styleSheet.update();
            }
        }
        this.dispatch("afterUpdateStyleSheets");
    }

    static register(cls, styleSheet) {
        return this.Global.register(...arguments);
    }

    static get(cls) {
        return this.Global.get(...arguments);
    }

    static setProperties(properties) {
        this.Global.setProperties(...arguments);
    }

    get props() {
        let props = this[this.constructor.PropsSymbol];
        if (!props) {
            props = this[this.constructor.PropsSymbol] = new Proxy(this.properties, {
                get: (properties, key, receiver) => {
                    let value = properties[key] || this.baseTheme?.props[key];
                    if (typeof value === "function") {
                        value = value(props);
                    }
                    return value;
                },
                set: (properties, key, value) => {
                    this.properties[key] = value;
                    this.updateThrottled();
                    return value;
                }
            });
        }
        return props;
    }

    static get props() {
        return this.Global.props;
    }
}

function registerStyle(styleClass, theme=Theme.Global) {
    return (target) => {
        theme.register(target, styleClass);
    }
}

export {Theme, registerStyle};
