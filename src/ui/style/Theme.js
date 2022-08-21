import {Dispatchable} from "../../base/Dispatcher";
import {CallThrottler, isFunction} from "../../base/Utils";


class Theme extends Dispatchable {
    static Global = new this(null, "Global");

    classSet = new Set();
    styleSheetInstances = new Map(); // map from StyleSheet class to instance
    updateThrottled = (new CallThrottler({throttle: 50})).wrap(() => this.updateStyleSheets()); // TODO @cleanup CallThrottler syntax is really ugly

    constructor(baseTheme, name, props) {
        super();
        this.name = name;
        this.baseTheme = baseTheme;
        this.properties = {
            theme: this,
            ...props,
        }

        this.props = new Proxy(this.properties, {
            get: (properties, key, receiver) => {
                let value = this.getProperty(key);
                if (isFunction(value)) {
                    value = value(this.props);
                }
                return value;
            },
            set: (properties, key, value) => {
                this.setProperties({key: value});
                // TODO this should also update all themes that inherit from us
                return value;
            }
        });

        this.styleSheetSymbol = Symbol(this.name + "StyleSheet");

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

    getProperty(key) {
        return this.properties[key] ?? this.baseTheme?.getProperty(key);
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
            styleSheet.update();
        }
        this.dispatch("afterUpdateStyleSheets");
    }

    static register(cls, styleSheet) {
        return this.Global.register(...arguments);
    }

    static setProperties(properties) {
        this.Global.setProperties(...arguments);
    }

    static get props() {
        return this.Global.props;
    }
}

function registerStyle(styleClass, theme=Theme.Global) {
    return (target) => theme.register(target, styleClass);
}

export {Theme, registerStyle};
