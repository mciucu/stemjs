import {Currency, CurrencyStore} from "./CurrencyStore";
import {StoreObject} from "../state/Store";
import {isString} from "../base/Utils";

const MoneyErrors = {
    INVALID_CURRENCY_PROVIDED: "Invalid currency provided.",
    CURRENCY_MISMATCH: "Currency mismatch.",
    INVALID_AMOUNT: "Invalid amount",
};

interface MoneyLike {
    amount?: number;
    balance?: number;
    currency?: Currency | string | number;
    currencyId?: string | number;
    getCurrency?: () => Currency;
}

interface ToStringOptions {
    decimalsDisplayed?: number;
    includeSymbol?: boolean;
}

interface FieldDescriptor {
    currencyField?: string;
}

export class Money {
    static useFormatter: boolean = false; // TODO: preserving behaviour now, reconsider defaults

    defaultDecimalsDisplayed: number = 2; // TODO: this should be a property of the currency
    private amount: number;
    private currency: Currency;

    // Also accepts an object {amount, currency} as single argument
    constructor(amount: number | string | MoneyLike, currency?: Currency | string | number) {
        this.amount = amount as number;
        if (!currency) {
            // Amount is valid to be 0, that's why we need ?? instead of ||
            const moneyLike = amount as MoneyLike;
            this.amount = moneyLike.amount ?? moneyLike.balance ?? 0;
            currency = moneyLike.currency || moneyLike.currencyId || moneyLike.getCurrency?.(); // Will fail if none of these exist
        }
        // The currency argument can be represented by a currency id or an instance of the Currency class
        const currencyInstance = currency instanceof Currency ? currency : CurrencyStore.get(currency as string | number);
        if (!currencyInstance) {
            throw MoneyErrors.INVALID_CURRENCY_PROVIDED;
        }

        this.currency = currencyInstance;

        if (isString(this.amount)) {
            // A string amount is treated in main units.
            const value = parseFloat(this.amount as string);
            if (isNaN(value)) {
                throw MoneyErrors.INVALID_AMOUNT;
            }
            // Rounding to nearest integer, so 0.01 and 0.03 are alrays 10000 and 30000
            this.amount = Math.round(this.currency.mainUnitsToAmount(value));
        }
    }

    static optionally(obj: any, currency?: Currency | string | number): Money | null | undefined {
        if (obj != null) {
            try {
                return new this(obj, currency);
            } catch (e) {
                return undefined; // just to make it different?
            }

        }
        return null;
    }

    static makeFieldLoader(fieldDescriptor: FieldDescriptor): (value: any, obj: any) => Money | null | undefined {
        const currencyFieldName = fieldDescriptor.currencyField || "currency";
        return (value: any, obj: any) => this.optionally(value, obj[currencyFieldName] || obj[currencyFieldName + "Id"]);
    }

    static format(amount: number | string | MoneyLike, currency?: Currency | string | number): string {
        return (new Money(amount, currency)).toMainUnitString();
    }

    getAmount(): number {
        return this.amount;
    }

    getCurrency(): Currency {
        return this.currency;
    }

    subtract(money: Money): Money {
        this.ensureCurrencyMatch(money);
        const difference = this.getAmount() - money.getAmount();
        return new Money(difference, this.getCurrency());
    }

    add(money: Money, quantity: number = 1): Money {
        this.ensureCurrencyMatch(money);
        const sum = this.getAmount() + money.getAmount() * quantity;

        return new Money(sum, this.getCurrency());
    }

    multiply(value: number): Money {
        return new Money(this.getAmount() * value, this.getCurrency());
    }

    divide(value: number): Money {
        // TODO Check division by 0
        return this.multiply(1.0 / value);
    }

    isZero(): boolean {
        return this.getAmount() === 0;
    }

    equals(money: Money): boolean {
        this.ensureCurrencyMatch(money);
        return this.getAmount() === money.getAmount();
    }

    greaterThan(money: Money): boolean {
        this.ensureCurrencyMatch(money);
        return this.getAmount() > money.getAmount();
    }

    lessThan(money: Money): boolean {
        this.ensureCurrencyMatch(money);
        return this.getAmount() < money.getAmount(); // Fixed bug: was using > instead of <
    }

    toMainUnitString(options: ToStringOptions = {}): string {
        const {decimalsDisplayed = this.defaultDecimalsDisplayed, includeSymbol = true} = options;
        const amount = this.getAmount();
        const currency = this.getCurrency();

        return (includeSymbol ? currency.getMainUnitSymbol() : "") + currency.amountToMainUnits(amount).toFixed(decimalsDisplayed);
    }

    toSubunitString(decimalsDisplayed: number = 0): string {
        const amount = this.getAmount();
        const currency = this.getCurrency();

        return Math.round(currency.amountToSubunits(amount)).toFixed(decimalsDisplayed) + currency.getSubunitSymbol();
    }

    getMainUnitNumericValue(): string | number {
        const currency = this.getCurrency();
        const amount = this.getAmount();

        if (currency.getDecimalAmount(amount)) {
            return currency.amountToMainUnits(amount).toFixed(2);
        } else {
            return currency.amountToMainUnits(amount);
        }
    }

    toString(): string {
        const currency = this.getCurrency();
        const amount = this.getAmount();

        if ((this.constructor as typeof Money).useFormatter) {
            const mainUnitAmount = currency.amountToMainUnits(amount);
            return currency.getFormatter().format(mainUnitAmount);
        }

        if (currency.isMainUnitAmount(amount)) {
            if (currency.getDecimalAmount(amount)) {
                return this.toMainUnitString();
            }
            return this.toMainUnitString({decimalsDisplayed: 0});
        } else {
            return this.toSubunitString();
        }
    }

    valueOf(): number {
        return this.amount;
    }

    ensureCurrencyMatch(money: Money): void {
        if (this.getCurrency() != money.getCurrency()) { // There should never be more than a store object per currency
            // Money error should be stopped early, since we don't want to make a bad API call
            throw MoneyErrors.CURRENCY_MISMATCH;
        }
    }

    toJSON(): {amount: number, currencyId: string | number} {
        return {
            amount: this.amount,
            currencyId: this.currency.id,
        }
    }
}

// TODO: go through our objects and extend this class for all that have an amount
// A generic store object that has a currency and an amount
export class MoneyObject extends StoreObject {
    declare currencyId: string | number;
    declare amount: number;

    getCurrency(): Currency | undefined {
        return CurrencyStore.get(this.currencyId);
    }

    getAmount(): Money {
        const currency = this.getCurrency();
        return new Money(this.amount, currency);
    }
}
