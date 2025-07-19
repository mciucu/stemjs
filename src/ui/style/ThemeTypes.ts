import {isString} from "../../base/Utils";

export class ThemeType<T = any> {
    type: string;
    value: T;
    options: any;

    constructor(type: string, value: T, options?: any) {
        options = options || {};
        if (isString(options)) {
            options = {comment: options};
        }
        this.type = type;
        this.value = value;
        this.options = options;
    }
}

// TODO this should also have a validator here for instance
export function MakeThemeType<T>(type: string): (value: T, options?: any) => ThemeType<T> {
    return (value: T, options: any = {}) => new ThemeType<T>(type, value, options);
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
