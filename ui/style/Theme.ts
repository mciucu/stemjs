import {Dispatchable} from "../../base/Dispatcher";
import {CallThrottler, isFunction, resolveFuncValue} from "../../base/Utils";
import {ThemeType} from "./ThemeTypes.js";


export class Theme extends Dispatchable {
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

        this.propTypes = {};

        this.props = new Proxy(this.properties, {
            get: (properties, key, receiver) => {
                const rawValue = this.getProperty(key);
                const value = resolveFuncValue(rawValue, {args: [this.props]});

                if (self.STEM_DEBUG && value === undefined) {
                    console.warn("Failed to find theme prop", key);
                }

                return value;
            },
            set: (properties, key, value) => {
                this.setProperties({[key]: value});
                // TODO this should also update all themes that inherit from us
                return true;
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
        if (this.properties.hasOwnProperty(key)) {
            // Return nulls as well
            return this.properties[key];
        }
        return this.baseTheme?.getProperty(key);
    }

    setProperties(properties, update=true) {
        for (const [key, value] of Object.entries(properties)) {
            if (value instanceof ThemeType) {
                this.properties[key] = value.value;
                this.propTypes[key] = value;
            } else {
                this.properties[key] = value;
            }
        }
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

export function registerStyle(styleClass, theme=Theme.Global) {
    return (target) => theme.register(target, styleClass);
}
