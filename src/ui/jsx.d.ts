import {BaseUIElement, HTMLTagType, SVGTagType, UIElementOptions} from "./UIBase";

declare global {
    namespace JSX {
        interface Element extends BaseUIElement {}
        
        interface IntrinsicElements {
            [Key in HTMLTagType]: Partial<Omit<HTMLElementTagNameMap[Key], "children">> & UIElementOptions;
            [Key in SVGTagType]: Partial<Omit<SVGElementTagNameMap[Key], "children">> & UIElementOptions;
        }

        interface ElementChildrenAttribute {
            children: {};
        }
    }
}