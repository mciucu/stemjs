// An operator reads its operands through valueOf at runtime, and TypeScript consults neither valueOf nor
// Symbol.toPrimitive. The plugin states the rule instead, so a class that answers with a number compares and
// multiplies like one - and a type that does not still reports.

class Money {
    cents: number = 0;

    valueOf(): number {
        return this.cents;
    }
}

class Weight {
    grams: number = 0;

    valueOf(): number {
        return this.grams;
    }
}

class Label {
    text: string = "";

    valueOf(): string {
        return this.text;
    }
}

declare const money: Money;
declare const other: Money;
declare const weight: Weight;
declare const label: Label;
declare const count: number;
declare const flag: boolean;
declare const loose: string | number;
declare const untyped: any;

// Both operands coerce, whether against their own type or across two of them
export const cheaper = money < other;
export const heavier = weight > money;
export const difference = money - other;

// Scaling takes a bare number, and zero or an untyped value is no unit to disagree with
export const doubled = money * 2;
export const perItem = money / count;
export const inCredit = money > 0;
export const unknownUnit = money - untyped;

// From here on compile.test.js lists what reports, since a directive is consumed before the plugin rules on it

// A bare number names no unit, so a class that has one can't be ordered against it or have it taken away
export const overBudget = money > 1000;
export const scaled = weight >= 2 * money;
export const discounted = money - count;

// A string's valueOf is not a number's, so this stays an error
export const mislabelled = label > 1;

// Nor does a boolean coerce, which is what makes `count + (a > b)` worth reporting
export const counted = count * flag;

// A union only coerces when every constituent does
export const looselyOrdered = loose - count;

// `+` concatenates just as readily as it adds, so an object reaching it still reports
export const summed = money + count;
