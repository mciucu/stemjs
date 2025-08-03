import {BaseUIElement, HTMLTagType, SVGTagType, UIElementOptions} from "./UIBase";

// Completely override React's JSX namespace
declare global {
    namespace JSX {
        // Make Element type mirror our jsx function overloads
        type ElementType = string | typeof BaseUIElement<any>;
        type Element = BaseUIElement;

        interface IntrinsicElements {
            tr: UIOptions<HTMLTableRowElement>;
            [Key in HTMLTagType]: UIOptions<HTMLElementTagNameMap[Key]>;
            [Key in SVGTagType]: UIOptions<SVGElementTagNameMap[Key]>;
        }

        type IntrinsicClassAttributes<BaseClass extends UIElement<ExtraOptions, NodeType>> = UIOptions<NodeType, ExtraOptions>;

        // Allow class constructors that extend BaseUIElement
        interface ElementClass extends BaseUIElement<any> {}

        interface ElementAttributesProperty {
            options: {};
        }

        interface ElementChildrenAttribute {
            children: {};
        }
    }
}
