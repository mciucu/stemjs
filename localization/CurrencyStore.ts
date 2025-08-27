import {StoreObject, Store} from "../state/Store.js";

export class Currency extends StoreObject {
    getDecimalDigitsCount() {
        return this.decimalDigits;
    }

    getMainUnitSymbol() {
        return this.symbol;
    }

    getSubunitSymbol() {
        return this.subdivisionSymbol;
    }

    // TODO: this should be static
    amountToMainUnits(amount) {
        return amount / 10 ** this.decimalDigits;
    }

    amountToSubunits(amount) {
        return amount / 10 ** (this.decimalDigits - this.subdivisionDecimalDigits);
    }

    subunitsToAmount(subunits) {
        return subunits * 10 ** (this.decimalDigits - this.subdivisionDecimalDigits);
    }

    mainUnitsToAmount(mainUnits) {
        return mainUnits * 10 ** this.decimalDigits;
    }

    isMainUnitAmount(amount) {
        return amount >= 10 ** this.decimalDigits;
    }

    // Returns as an integer the number main units (ex. dollars)
    getMainUnitsAmount(amount) {
        return Math.floor(this.amountToMainUnits(amount));
    }

    getDecimalAmount(amount) {
        return this.amountToMainUnits(amount) % 1;
    }

    // Returns as an integer the rounded number of subdivisions outside of whole amount (eg. $3.71 -> 71)
    getSubunitAmount(amount) {
        return Math.floor(this.amountToSubunits(amount));
    }

    getIsoCode() {
        return this.isoCode.toLowerCase();
    }

    getFormatter() {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: this.isoCode.toUpperCase(),
            maximumFractionDigits: 2,
        });
    }

    toString() {
        return this.getIsoCode().toUpperCase();
    }
}

class CurrencyStoreClass extends Store("Currency", Currency) {
    getByIsoCode(isoCode="") {
        isoCode = String(isoCode).toLowerCase();
        return this.find(currency => currency.getIsoCode() === isoCode);
    }

    get(id) {
        return super.get(id) || this.getByIsoCode(id);
    }
}

export const CurrencyStore = new CurrencyStoreClass();

