import {BaseUIElement, UIElement, UIOptions, HTMLTagType, SVGTagType} from "./UIBase";

type IntrinsicElementsMap = {
    [Key in HTMLTagType]: UIOptions<HTMLElementTagNameMap[Key]>;
} & {
    [Key in SVGTagType]: UIOptions<SVGElementTagNameMap[Key]>;
};

declare global {
    namespace JSX {
        type Element = BaseUIElement;

        type IntrinsicElements = IntrinsicElementsMap;

        interface ElementClass extends BaseUIElement<any> {}

        interface ElementAttributesProperty {
            options: {};
        }

        interface ElementChildrenAttribute {
            children: {};
        }
    }
}