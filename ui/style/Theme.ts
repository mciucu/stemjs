import {Dispatchable} from "../../base/Dispatcher";
import {resolveFuncValue} from "../../base/Utils";
import {CallThrottler} from "../../base/CallModifier";
import {ThemeType} from "./ThemeTypes";
import type {StyleSheet} from "../Style";
import type {UIElement} from "../UIBase";

export type ThemeProps = Record<string, any>;


export class Theme extends Dispatchable {
    static Global = new this(null, "Global");

    classSet = new Set<typeof UIElement>();
    styleSheetInstances = new Map<typeof StyleSheet, StyleSheet>(); // map from StyleSheet class to instance
    updateThrottled: Function = (new CallThrottler({throttle: 50})).wrap(() => this.updateStyleSheets()); // TODO @cleanup CallThrottler syntax is really ugly
    name: string;
    baseTheme: Theme | null;
    properties: ThemeProps;
    propTypes: Record<string, ThemeType>;
    props: any;
    styleSheetSymbol: symbol;

    constructor(baseTheme: Theme | null, name: string, props?: ThemeProps) {
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
    fork(name: string, extraProps?: ThemeProps): Theme {
        return new Theme(this, name, extraProps);
    }

    register(cls: typeof UIElement, styleSheet: typeof StyleSheet): void {
        cls.theme = this;
        cls[this.styleSheetSymbol] = styleSheet;
        this.classSet.add(cls);
    }

    getStyleSheet(cls: any): StyleSheet {
        return cls[this.styleSheetSymbol] || this.baseTheme?.getStyleSheet(cls);
    }

    getProperty(key: string): any {
        if (this.properties.hasOwnProperty(key)) {
            // Return nulls as well
            return this.properties[key];
        }
        return this.baseTheme?.getProperty(key);
    }

    setProperties(properties: ThemeProps, update: boolean = true): void {
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

    getStyleSheetInstance<T extends typeof StyleSheet>(Cls: T): InstanceType<T> {
        let instance = this.styleSheetInstances.get(Cls);
        if (!instance) {
            instance = new Cls({theme: this});
            this.styleSheetInstances.set(Cls, instance);
        }
        return instance as InstanceType<T>;
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

    static setProperties(properties: ThemeProps): void {
        this.Global.setProperties(properties);
    }

    static get props() {
        return this.Global.props;
    }
}

// TODO @types move this to Style.ts, makes more sense to be there
// There's a fucking Typescript proposal from 10 years ago that developers are bullshitting against: https://github.com/Microsoft/TypeScript/issues/4881
// It needs to be implemented before the new type is properly recognized
export function registerStyle<T extends typeof StyleSheet>(styleClass: T, theme: Theme = Theme.Global) {
    return function<TBase extends typeof UIElement<any, any>> (target: TBase): (TBase & {styleSheet: InstanceType<T>})  {
        theme.register(target, styleClass);
        return target as any;
    };
}
