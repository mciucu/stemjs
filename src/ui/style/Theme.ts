import {Dispatchable} from "../../base/Dispatcher";
import {resolveFuncValue} from "../../base/Utils";
import {CallThrottler} from "../../base/CallModifier";
import {ThemeType} from "./ThemeTypes";

export type RawThemeProps = Record<string, any>;


export class Theme extends Dispatchable {
    static Global = new this(null, "Global");

    classSet = new Set<any>();
    styleSheetInstances = new Map<any, any>(); // map from StyleSheet class to instance
    updateThrottled: Function = (new CallThrottler({throttle: 50})).wrap(() => this.updateStyleSheets()); // TODO @cleanup CallThrottler syntax is really ugly
    name: string;
    baseTheme: Theme | null;
    properties: RawThemeProps;
    propTypes: Record<string, ThemeType>;
    props: any;
    styleSheetSymbol: symbol;

    constructor(baseTheme: Theme | null, name: string, props?: RawThemeProps) {
        super();
        this.name = name;
        this.baseTheme = baseTheme;
        this.properties = {
            theme: this,
            ...props,
        };

        this.propTypes = {};

        this.props = new Proxy(this.properties, {
            get: (properties, key: string, receiver) => {
                const rawValue = this.getProperty(key);
                const value = resolveFuncValue(rawValue, {args: [this.props]});

                if (globalThis.STEM_DEBUG && value === undefined) {
                    console.warn("Failed to find theme prop", key);
                }

                return value;
            },
            set: (properties, key: string, value) => {
                this.setProperties({[key]: value});
                // TODO this should also update all themes that inherit from us
                return true;
            }
        });

        this.styleSheetSymbol = Symbol(this.name + "StyleSheet");

        window.addEventListener("resize", () => this.updateThrottled());
    }

    // Create a new Theme, based on the current one
    fork(name: string, extraProps?: RawThemeProps): Theme {
        return new Theme(this, name, extraProps);
    }

    register(cls: any, styleSheet: any): void {
        cls.theme = this;
        cls[this.styleSheetSymbol] = styleSheet;
        this.classSet.add(cls);
    }

    getStyleSheet(cls: any): any {
        return cls[this.styleSheetSymbol] || this.baseTheme?.getStyleSheet(cls);
    }

    getProperty(key: string): any {
        if (this.properties.hasOwnProperty(key)) {
            // Return nulls as well
            return this.properties[key];
        }
        return this.baseTheme?.getProperty(key);
    }

    setProperties(properties: RawThemeProps, update: boolean = true): void {
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

    getAllStyleSheets(): any[] {
        const styleSheetSet = new Set(this.styleSheetInstances.values());
        for (const cls of this.classSet.values()) {
            styleSheetSet.add(this.getStyleSheet(cls));
        }
        return Array.from(styleSheetSet).map(styleSheet => styleSheet.getInstance(this));
    }

    getStyleSheetInstance(Cls: any): any {
        let instance = this.styleSheetInstances.get(Cls);
        if (!instance) {
            instance = new Cls({theme: this});
            this.styleSheetInstances.set(Cls, instance);
        }
        return instance;
    }

    updateStyleSheets(): void {
        this.dispatch("beforeUpdateStyleSheets");
        for (const styleSheet of this.getAllStyleSheets()) {
            styleSheet.update();
        }
        this.dispatch("afterUpdateStyleSheets");
    }

    // TODO @branch styleSheet should have a type
    static register(cls: any, styleSheet: any): void {
        return this.Global.register(cls, styleSheet);
    }

    static setProperties(properties: RawThemeProps): void {
        this.Global.setProperties(properties);
    }

    static get props() {
        return this.Global.props;
    }
}

export function registerStyle(styleClass: any, theme: Theme = Theme.Global): (target: any) => void {
    return (target: any) => theme.register(target, styleClass);
}
