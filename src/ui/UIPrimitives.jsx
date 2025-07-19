// TODO: this file existed to hold generic classes in a period of fast prototyping, has a lot of old code
import {UI, UIElement} from "./UIBase";

export * from "./primitives/Link.jsx";
export * from "./primitives/IFrame.jsx";
export * from "./primitives/Image.jsx";

// A very simple class, all this does is implement the `getTitle()` method
// TODO Just deprecate this class?
export class Panel extends UIElement {
    getTitle() {
        return this.options.title;
    }
}
