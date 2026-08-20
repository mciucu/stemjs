// TODO: this file existed to hold generic classes in a period of fast prototyping, has a lot of old code
import {UI, UIElement, UIElementOptions} from "./UIBase";

export * from "./primitives/Link";
export * from "./primitives/IFrame";
export * from "./primitives/Image";

/** @deprecated Use UIElementOptions - title is on every element now. */
export type PanelOptions = UIElementOptions;

/** @deprecated Extend UIElement - getTitle() is on every element now. */
export class Panel<T extends UIElementOptions = UIElementOptions> extends UIElement<T> {
}
