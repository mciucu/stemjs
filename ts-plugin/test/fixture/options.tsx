// A tag is written with more than the element holds: createElement collects the children and resolves a
// string ref before the constructor runs. UIElement derives what a tag takes from its generic; a class that
// respells `options` gets it respelled by the plugin, whether it is a declaration or a mixin's expression.

import {UI, UIElement, type ElementOptions, type ExtendedOptions} from "../../../ui/UIBase";

interface SheetOptions {
    open?: boolean;
}

class Sheet extends UIElement {
    declare options: ElementOptions<SheetOptions>;
}

// A mixin: a class expression, which no interface can merge with
const Draggable = <T extends new (...args: any[]) => UIElement>(Base: T) => class Draggable extends Base {
    declare options: ElementOptions<{handle?: string}>;
};

class Card extends Draggable(UIElement) {}

// Built on the base's options, which keeps the base's own tag shape under the new option
class Wide extends Sheet {
    declare options: ExtendedOptions<Sheet, {wide?: boolean}>;
}

class Holder extends UIElement {
    respelled(): void {
        // The respelled option reaches the tag
        this.options.children = [<Sheet open/>];
    }

    fromMixin(): void {
        this.options.children = [<Card handle="top"/>];
    }

    extended(): void {
        this.options.children = [<Wide open wide/>];
    }

    written(): void {
        // A string ref and a lone child are how a tag is written, and neither is what it holds
        this.options.children = [<Sheet ref="sheet"><div/></Sheet>];
    }

    held(): void {
        // What it holds is an array of clean children, whatever the tag wrote
        const sheet = <Sheet><div/></Sheet>;
        sheet.options.children!.push(<div/>);
    }

    wrongOption(): void {
        // @ts-expect-error
        this.options.children = [<Sheet closed/>];
    }
}

export {Holder, UI};
