// TypeScript types every JSX expression as JSX.Element, whatever the tag, and there is no per-tag result
// type to declare - UI.createElement's own overloads are only consulted for a direct call. The plugin
// states the rule instead: a JSX element stands for an instance of its tag. A wrong tag still reports.

import {UI, UIElement} from "../../../ui/UIBase";

class Panel extends UIElement {
    open(): void {}
}

class Drawer extends UIElement {
    slide(): void {}
}

class Holder extends UIElement {
    declare panel: Panel;
    declare panels: Panel[];

    assign(): void {
        // Assigned straight from the tag it is declared as
        this.panel = <Panel/>;
    }

    viaName(): void {
        // Held in a name first, then handed on
        const panel = <Panel/>;
        this.panels.push(panel);
    }

    reachMember(): void {
        // A member the tag has but BaseUIElement does not
        const panel = <Panel/>;
        panel.open();
    }

    viaMap(entries: number[]): void {
        // Mapping to a tag builds an array of it
        this.panels = entries.map(() => <Panel/>);
    }

    viaMapBlock(entries: number[]): void {
        // A block-bodied callback counts too, when its only return is the element
        this.panels = entries.map(() => {
            return <Panel/>;
        });
    }

    wrongTag(): void {
        // The wrong tag is still the wrong tag
        // @ts-expect-error
        this.panel = <Drawer/>;
    }

    intrinsic(): void {
        // An intrinsic tag has no class to stand for, so it reports as before
        // @ts-expect-error
        this.panel = <div/>;
    }

    wrongMember(): void {
        const panel = <Panel/>;
        // A member neither the tag nor BaseUIElement has
        // @ts-expect-error
        panel.slide();
    }
}

export {Holder, UI};
