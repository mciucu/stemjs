import {BaseUIElement, UIElement, WrittenUIOptions, HTMLTagType, SVGTagType, ElementEventOptions} from "./UIBase";

// What a tag takes, not what the element holds. Its events (ElementEventOptions) are handed the element with its own node type
type IntrinsicElementsMap = {
    [Key in HTMLTagType]: WrittenUIOptions<HTMLElementTagNameMap[Key]> & ElementEventOptions<UIElement<{}, HTMLElementTagNameMap[Key]>>;
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

        // A class's tag also takes its events, worked out from the element it makes: its own adders win over the DOM's
        type LibraryManagedAttributes<Component, Props> =
            Component extends abstract new (...args: any) => infer Element ? Props & ElementEventOptions<Element> : Props;
    }
}