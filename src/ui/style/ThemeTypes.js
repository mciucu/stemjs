import {isString} from "../../base/Utils.js";

export class ThemeType {
    constructor(type, value, options) {
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
export function MakeThemeType(type) {
    return (value, options={}) => new ThemeType(type, value, options);
}

export const ColorType = MakeThemeType("Color");
export const SizeType = MakeThemeType("Size");
export const BorderType = MakeThemeType("Border");
export const TextShadowType = MakeThemeType("Text Shadow");
export const BoxShadowType = MakeThemeType("Box Shadow");
export const FontFamilyType = MakeThemeType("Font Family");
export const FontWeightType = MakeThemeType("Font Weight");
export const BoolType = MakeThemeType("Boolean");
export const ObjectType = MakeThemeType("Generic Object")
