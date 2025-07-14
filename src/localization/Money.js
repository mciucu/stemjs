import {Currency, CurrencyStore} from "./CurrencyStore.js";
import {StoreObject} from "../state/Store";
import {isString} from "../base/Utils.js";

const MoneyErrors = {
    INVALID_CURRENCY_PROVIDED: "Invalid currency provided.",
    CURRENCY_MISMATCH: "Currency mismatch.",
    INVALID_AMOUNT: "Invalid amount",
};

export class Money {
    static useFormatter = false; // TODO: preserving behaviour now, reconsider defaults

    defaultDecimalsDisplayed = 2; // TODO: this should be a property of the currency

    // Also accepts an object {amount, currency} as single argument
    constructor(amount, currency) {
        this.amount = amount;
        if (!currency) {
            // Amount is valid to be 0, that's why we need ?? instead of ||
            this.amount = amount.amount ?? amount.balance;
            currency = amount.currency || amount.currencyId || amount.getCurrency(); // Will fail if none of these exist
        }
        // The currency argument can be represented by a currency id or an instance of the Currency class
        currency = currency instanceof Currency ? currency : CurrencyStore.get(currency);
        if (!currency) {
            throw MoneyErrors.INVALID_CURRENCY_PROVIDED;
        }

        this.currency = currency;

        if (isString(this.amount)) {
            // A string amount is treated in main units.
            const value = parseFloat(this.amount);
            if (isNaN(value)) {
                throw MoneyErrors.INVALID_AMOUNT;
            }
            // Rounding to nearest integer, so 0.01 and 0.03 are alrays 10000 and 30000
            this.amount = Math.round(this.currency.mainUnitsToAmount(value));
        }
    }

    static optionally(obj, currency) {
        if (obj != null) {
            try {
                return new this(obj, currency);
            } catch (e) {
                return undefined; // just to make it different?
            }

        }
        return null;
    }

    static makeFieldLoader(fieldDescriptor) {
        const currencyFieldName = fieldDescriptor.currencyField || "currency";
        return (value, obj) => this.optionally(value, obj[currencyFieldName] || obj[currencyFieldName + "Id"]);
    }

    static format(amount, currency) {
        return (new Money(amount, currency)).toMainUnitString();
    }

    getAmount() {
        return this.amount;
    }

    getCurrency() {
        return this.currency;
    }

    subtract(money) {
        this.ensureCurrencyMatch(money);
        const difference = this.getAmount() - money.getAmount();
        return new Money(difference, this.getCurrency());
    }

    add(money, quantity = 1) {
        this.ensureCurrencyMatch(money);
        const sum = this.getAmount() + money.getAmount() * quantity;

        return new Money(sum, this.getCurrency());
    }

    multiply(value) {
        return new Money(this.getAmount() * value, this.getCurrency());
    }

    divide(value) {
        // TODO Check division by 0
        return this.multiply(1.0 / value);
    }

    isZero() {
        return this.getAmount() === 0;
    }

    equals(money) {
        this.ensureCurrencyMatch(money);
        return this.getAmount() === money.getAmount();
    }

    greaterThan(money) {
        this.ensureCurrencyMatch(money);
        return this.getAmount() > money.getAmount();
    }

    lessThan(money) {
        this.ensureCurrencyMatch(money);
        return this.getAmount() > money.getAmount();
    }

    toMainUnitString({decimalsDisplayed = this.defaultDecimalsDisplayed, includeSymbol = true} = {}) {
        const amount = this.getAmount();
        const currency = this.getCurrency();

        return (includeSymbol ? currency.getMainUnitSymbol() : "") + currency.amountToMainUnits(amount).toFixed(decimalsDisplayed);
    }

    toSubunitString(decimalsDisplayed = 0) {
        const amount = this.getAmount();
        const currency = this.getCurrency();

        return Math.round(currency.amountToSubunits(amount)).toFixed(decimalsDisplayed) + currency.getSubunitSymbol();
    }

    getMainUnitNumericValue() {
        const currency = this.getCurrency();
        const amount = this.getAmount();

        if (currency.getDecimalAmount(amount)) {
            return currency.amountToMainUnits(amount).toFixed(2);
        } else {
            return currency.amountToMainUnits(amount);
        }
    }

    toString() {
        const currency = this.getCurrency();
        const amount = this.getAmount();

        if (this.constructor.useFormatter) {
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

    valueOf() {
        return this.amount;
    }

    ensureCurrencyMatch(money) {
        if (this.getCurrency() != money.getCurrency()) { // There should never be more than a store object per currency
            // Money error should be stopped early, since we don't want to make a bad API call
            throw MoneyErrors.CURRENCY_MISMATCH;
        }
    }

    toJSON() {
        return {
            amount: this.amount,
            currencyId: this.currency.id,
        }
    }
}

// TODO: go through our objects and extend this class for all that have an amount
// A generic store object that has a currency and an amount
export class MoneyObject extends StoreObject {
    getCurrency() {
        return CurrencyStore.get(this.currencyId);
    }

    getAmount() {
        const currency = this.getCurrency();
        return new Money(this.amount, currency);
    }
}
