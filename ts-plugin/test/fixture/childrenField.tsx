// A component field named children replaces the element's own child list: the plugin reports it where it is declared,
// though its type fits. A field of another name, one only declared, and children on a class that isn't an element, are
// left alone.

import {UIElement} from "../../../ui/UIBase";

export class Shelf extends UIElement {
    children = [] as UIElement[];
}

export class Rack extends UIElement {
    items: UIElement[] = [];
}

// Only its type narrowed: nothing is emitted for it
export class Bin extends UIElement {
    declare children: UIElement[];
}

export class Tree {
    children: Tree[] = [];
}
