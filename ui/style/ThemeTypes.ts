import {isString} from "../../base/Utils";
import {type ThemeProps} from "./Theme";

// A bare string is shorthand for the comment. Nothing reads these back, here or downstream
export interface ThemeTypeOptions {
    comment?: string;
}

export class ThemeType<T = any> {
    type: string;
    value: T;
    options: ThemeTypeOptions;

    constructor(type: string, value: T, options?: ThemeTypeOptions | string) {
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
// through resolveFuncValue(rawValue, {args: [this.props]}), which calls it until it isn't a function
export type ThemeValue<T> = T | ((props: ThemeProps) => T);

// TODO this should also have a validator here for instance
export function MakeThemeType<T>(type: string): (value: ThemeValue<T>, options?: ThemeTypeOptions | string) => ThemeType<ThemeValue<T>> {
    return (value: ThemeValue<T>, options: ThemeTypeOptions | string = {}) => new ThemeType<ThemeValue<T>>(type, value, options);
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
