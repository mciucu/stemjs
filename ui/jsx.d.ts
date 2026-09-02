import {BaseUIElement, UIElement, WrittenUIOptions, HTMLTagType, SVGTagType} from "./UIBase";

// What a tag takes, not what the element holds
type IntrinsicElementsMap = {
    [Key in HTMLTagType]: WrittenUIOptions<HTMLElementTagNameMap[Key]>;
} & {
    [Key in SVGTagType]: WrittenUIOptions<SVGElementTagNameMap[Key]>;
};

declare global {
    namespace JSX {
        type Element = BaseUIElement;

        type IntrinsicElements = IntrinsicElementsMap;

        interface ElementClass extends BaseUIElement<any> {}

        // No ElementAttributesProperty: a tag is written with more than `options` holds, and the ts-plugin
        // declares what each class's tag takes. Without it TypeScript falls back to the constructor's
        // parameter, which is what is held, so a string ref or a lone child reports

        interface ElementChildrenAttribute {
            children: {};
        }
    }
}