import {Dispatchable} from "../../base/Dispatcher";
import {resolveFuncValue} from "../../base/Utils";
import {CallThrottler} from "../../base/CallModifier";
import {ThemeType, type ThemeValue} from "./ThemeTypes";
import type {StyleSheet} from "../Style"; // Type-only on purpose: a runtime edge here would close a cycle
import type {UIElement} from "../UIBase"; // Type-only on purpose: a runtime edge here would close a cycle

declare global {
    // Every module that sets theme properties registers them here, so a reader sees the union of all of them.
    // A contributor extends it from its own literal rather than restating the names
    interface StemThemeProps {
        // Parked by the constructor, so a prop function can reach the theme it is being resolved against
        theme: Theme;
    }
}

// What reading one written prop answers with, following the two unwrappings setProperties and the props
// proxy perform: a ThemeType hands over the value it wraps, and a function is called with the other props.
// Recursive because the two compose - ColorType() wraps a ThemeValue, which may itself be the function
type ResolvedThemeValue<Written> =
    Written extends ThemeType<infer Wrapped> ? ResolvedThemeValue<Wrapped> :
    Written extends (props: any) => infer Resolved ? Resolved :
    Written;

// What a contributor's literal reads back as, which is what it registers
export type ResolvedThemeProps<Written> = {
    [Key in keyof Written]: ResolvedThemeValue<Written[Key]>;
};

// What one prop may be written as: the value, a function of the other props, or either wrapped in a ThemeType
export type WrittenThemeValue<Resolved> = ThemeValue<Resolved> | ThemeType<ThemeValue<Resolved>>;

// What a theme holds, read through Theme.props or an element's themeProps. Left open besides the registry
// until every contributor has registered; dropping the fallback is what turns an unregistered name from an
// `any` into a typo, and costs whatever is still unregistered downstream
export type ThemeProps = StemThemeProps & Record<string, any>;

// What setProperties takes: any subset, each value written directly or as a function of the others.
// Left open besides, since a key can be computed and a downstream repo may not have registered its own
export type WrittenThemeProps = {[Key in keyof StemThemeProps]?: WrittenThemeValue<StemThemeProps[Key]>} & Record<string, any>;


// What @registerStyle decorates: any class that makes elements, abstract ones included. `typeof UIElement`
// carries UIElement's own generic construct signature, which no concrete subclass satisfies - Backlog item 12
type ElementClassLike = abstract new (...args: any[]) => UIElement<any, any, any, any>;

// A symbol index signature would say where the sheet is kept, but no class satisfies one as an argument
type StyledElementClass = ElementClassLike & {theme?: Theme};

export class Theme extends Dispatchable {
    static Global = new this(null, "Global");

    classSet = new Set<StyledElementClass>();
    missingProps = new Set<string>();
    styleSheetInstances = new Map<typeof StyleSheet, StyleSheet>(); // map from StyleSheet class to instance
    updateThrottled: Function = (new CallThrottler({throttle: 50})).wrap(() => this.updateStyleSheets()); // TODO @cleanup CallThrottler syntax is really ugly
    name: string;
    baseTheme: Theme | null;
    properties: WrittenThemeProps;
    propTypes: Record<string, ThemeType>;
    props: ThemeProps;
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

        // The proxy resolves each value as it is read, so what it presents is the resolved form of its target
        this.props = new Proxy(this.properties, {
            get: (_properties, key: string, _receiver) => {
                const rawValue = this.getProperty(key);
                const value = resolveFuncValue(rawValue, {args: [this.props]});

                if (globalThis.STEM_DEBUG && value === undefined && !this.missingProps.has(key)) {
                    this.missingProps.add(key);
                    console.warn("Failed to find theme prop", key);
                }

                return value;
            },
            set: (_properties, key: string, value) => {
                this.setProperties({[key]: value});
                // TODO this should also update all themes that inherit from us
                return true;
            }
        }) as ThemeProps;

        this.styleSheetSymbol = Symbol(this.name + "StyleSheet");

        window.addEventListener("resize", () => this.updateThrottled());
    }

    // Create a new Theme, based on the current one
    fork(name: string, extraProps?: ThemeProps): Theme {
        return new Theme(this, name, extraProps);
    }

    // A constructor type rather than `typeof UIElement`, which no concrete subclass satisfies - Backlog item 12
    register(cls: StyledElementClass, styleSheet: typeof StyleSheet): void {
        cls.theme = this;
        cls[this.styleSheetSymbol] = styleSheet;
        this.classSet.add(cls);
    }

    // Answers with what register stored, which is the class rather than an instance
    getStyleSheet(cls: StyledElementClass): typeof StyleSheet {
        return cls[this.styleSheetSymbol] || this.baseTheme?.getStyleSheet(cls);
    }

    getProperty(key: string): unknown {
        if (this.properties.hasOwnProperty(key)) {
            // Return nulls as well
            return this.properties[key];
        }
        return this.baseTheme?.getProperty(key);
    }

    setProperties(properties: WrittenThemeProps, update: boolean = true): void {
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

    getAllStyleSheets(): StyleSheet[] {
        // Deduplicated after resolving, since a cached instance and the class it was built from are two objects
        const styleSheets = [...this.styleSheetInstances.values()];
        for (const cls of this.classSet.values()) {
            styleSheets.push(this.getStyleSheet(cls).getInstance(this));
        }
        // Deduplicated style instances
        return [...new Set(styleSheets)];
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

    static register(cls: StyledElementClass, styleSheet: typeof StyleSheet): void {
        return this.Global.register(cls, styleSheet);
    }

    static setProperties(properties: WrittenThemeProps): void {
        this.Global.setProperties(properties);
    }

    static get props() {
        return this.Global.props;
    }
}

// TODO @types move this to Style.ts, makes more sense to be there
// Returning the widened class here is what a decorator can't do (microsoft/TypeScript#4881); the styleSheet
// member is declared by ts-plugin/transform.js instead, so this only ever registers.
export function registerStyle<T extends typeof StyleSheet>(styleClass: T, theme: Theme = Theme.Global) {
    return function <ElementClass extends ElementClassLike>(target: ElementClass): ElementClass {
        theme.register(target, styleClass);
        return target;
    };
}
