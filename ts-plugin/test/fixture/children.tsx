// createElement collects a tag's children into an array however many are written, so an element that mutates
// them in place declares them as one. TypeScript counts what the tag writes instead, and reports a lone child
// against an array-typed prop. The plugin states the rule; a child that doesn't belong there still reports.

import {UI, UIElement, type UIChild} from "../../../ui/UIBase";

class Page extends UIElement {}

// Nothing the UI can render: no toUI, and not a string, a number or an element
class Ledger {
    entries: number[] = [];
}

interface DeckOptions {
    // Mutated in place by add(), so it holds an array whatever the tag wrote
    children?: UIChild[];
}

class Deck extends UIElement<DeckOptions> {
    add(page: Page): void {
        this.options.children!.push(page);
    }
}

declare const ledger: Ledger;
declare const pages: UIChild[];

class Album extends UIElement {
    one(): void {
        // One child is collected into the array the prop holds, the same as any other count
        const deck = <Deck><Page/></Deck>;
        deck.add(<Page/>);
    }

    several(): void {
        // Which is what TypeScript already expects of two or more
        const deck = <Deck><Page/><Page/></Deck>;
        deck.add(<Page/>);
    }

    array(): void {
        // An array written as the single child is the whole prop rather than one entry
        const deck = <Deck>{pages}</Deck>;
        deck.add(<Page/>);
    }

    text(): void {
        // Text is a child like any other
        const deck = <Deck>only me</Deck>;
        deck.add(<Page/>);
    }

    wrongChild(): void {
        // A child the prop can't hold still reports, whether it is alone
        // @ts-expect-error
        const deck = <Deck>{ledger}</Deck>;
        deck.add(<Page/>);
    }

    wrongChildren(): void {
        // ...or in company
        // @ts-expect-error
        const deck = <Deck><Page/>{ledger}</Deck>;
        deck.add(<Page/>);
    }
}

export {Album, UI};
