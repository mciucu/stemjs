import {isString} from "../../base/Utils";

// A bare string is shorthand for the comment. Nothing reads these back, here or downstream
export interface ThemeTypeOptions {
    comment?: string;
}

// Carries two types: the value it was handed, so a reader sees what the prop starts out as, and the type its
// maker declares, which is the wider one an override is checked against. SizeType(14) is ThemeType<14, string | number>
export class ThemeType<Value = any, Declared = Value> {
    // Never assigned - it's here so ResolvedThemeValue can read the declared type back off the wrapper
    declare readonly declaredValue: Declared;

    type: string;
    value: Value;
    options: ThemeTypeOptions;

    constructor(type: string, value: Value, options?: ThemeTypeOptions | string) {
        options = options || {};
        if (isString(options)) {
            options = {comment: options};
        }
        this.type = type;
        this.value = value;
        this.options = options;
    }
}

// A theme value may be a function of the other props: Theme's props proxy passes every value
// through resolveFuncValue(rawValue, {args: [this.props]}), which calls it until it isn't a function.
//
// The parameter is left open on purpose. A contributor registers its literal by extending StemThemeProps
// from what that literal reads back as, so naming ThemeProps here would make the registry reference itself.
// Only the return type is ever read back, so nothing is lost. A value function written against a theme that
// already exists does get a typed parameter, through WrittenThemeValue.
export type ThemeValue<T> = T | ((props: any) => T);

// TODO this should also have a validator here for instance
// Value is inferred from the argument instead of being widened to Declared, so the initial value survives into
// the type a reader sees: SizeType(14) hands back ThemeType<14, string | number>, not ThemeType<string | number>.
// const keeps the literal for an editor whose own inference would widen it back to string
export function MakeThemeType<Declared>(type: string) {
    return <const Value extends ThemeValue<Declared>>(value: Value, options: ThemeTypeOptions | string = {}) =>
        new ThemeType<Value, Declared>(type, value, options);
}

export const ColorType = MakeThemeType<string>("Color");
export const SizeType = MakeThemeType<string | number>("Size");
export const BorderType = MakeThemeType<string>("Border");
export const TextShadowType = MakeThemeType<string>("Text Shadow");
export const BoxShadowType = MakeThemeType<string>("Box Shadow");
export const FontFamilyType = MakeThemeType<string>("Font Family");
export const FontWeightType = MakeThemeType<string | number>("Font Weight");
export const FloatType = MakeThemeType<number>("Float");
export const BoolType = MakeThemeType<boolean>("Boolean");
export const ObjectType = MakeThemeType<object>("Generic Object");
