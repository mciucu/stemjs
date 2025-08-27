// TODO: this file existed to hold generic classes in a period of fast prototyping, has a lot of old code
import {UI, UIElement} from "./UIBase";

export * from "./primitives/Link";
export * from "./primitives/IFrame";
export * from "./primitives/Image";

// Type definitions
export interface PanelOptions {
    title?: string;
}

// A very simple class, all this does is implement the `getTitle()` method
// TODO Just deprecate this class?
export class Panel<T extends PanelOptions = PanelOptions> extends UIElement<T> {
    getTitle(): string | undefined {
        return this.options.title;
    }
}