import {Dispatchable} from "../base/Dispatcher";
import {NumberFormatter} from "./NumberFormatter";

export class Currency {
    constructor(isoCode, isoNumber, decimalDigits, name, extra = {}) {
        this.isoCode = isoCode;
        this.isoNumber = isoNumber;
        this.decimalDigits = decimalDigits;
        this.name = name;
        Object.assign(this, extra);
    }

    getDecimalCount() {
        return this.decimalDigits;
    }

    getName() {
        return this.name;
    }

    getSymbol() {
        return this.symbol;
    }

    getISOCode() {
        return this.isoCode;
    }

    getISONumber() {
        return this.isoNumber;
    }
}

let tokenMap = new Map([
    ["S", (amount, currency, formatter) => currency.getSymbol()],
    ["N", (amount, currency, formatter) => formatter.formatAmount(amount)],
    ["iso", (amount, currency, formatter) => currency.getISOCode().toLowerCase()],
    ["ISO", (amount, currency, formatter) => currency.getISOCode()],
]);

// Return $ x.xx or x,xx $
export class CurrencyFormatter {
    constructor(pattern, numberFormatter = NumberFormatter.PLAIN) {
        // Tokenize pattern
    }

    getNumberFormatter() {
        return this.numberFormatter;
    }

    formatAmount(amount) {
        return this.getNumberFormatter().format(amount);
    }

    format(amount, currency) {
    }
}

const CurrencyData = [
    ["AED", 784, 2, "United Arab Emirates dirham"],
    ["EUR", 978, 2, "Euro", {symbol: "€"}],
    // Add more currency objects here
];

export class CurrencyExchange extends Dispatchable {
    exchangeRatesMap = new Map();

    getExchangeRate(fromCurrency, toCurrency, options={}) {
        // First see if we have the pair, otherwise
        const key = fromCurrency.getISOCode() + "_" + toCurrency.getISOCode();
        let value = this.exchangeRatesMap.get(key);
        return value || this.defaultRate;
    }
}

const Currencies = CurrencyData.map(currencyData => new Currency(...currencyData));
