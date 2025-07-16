import {StoreObject, Store} from "../state/Store";
import {StoreId} from "../state/State";

export class Currency extends StoreObject {
    declare decimalDigits: number;
    declare symbol: string;
    declare subdivisionSymbol: string;
    declare subdivisionDecimalDigits: number;
    declare isoCode: string;

    getDecimalDigitsCount(): number {
        return this.decimalDigits;
    }

    getMainUnitSymbol(): string {
        return this.symbol;
    }

    getSubunitSymbol(): string {
        return this.subdivisionSymbol;
    }

    // TODO: this should be static
    amountToMainUnits(amount: number): number {
        return amount / 10 ** this.decimalDigits;
    }

    amountToSubunits(amount: number): number {
        return amount / 10 ** (this.decimalDigits - this.subdivisionDecimalDigits);
    }

    subunitsToAmount(subunits: number): number {
        return subunits * 10 ** (this.decimalDigits - this.subdivisionDecimalDigits);
    }

    mainUnitsToAmount(mainUnits: number): number {
        return mainUnits * 10 ** this.decimalDigits;
    }

    isMainUnitAmount(amount: number): boolean {
        return amount >= 10 ** this.decimalDigits;
    }

    // Returns as an integer the number main units (ex. dollars)
    getMainUnitsAmount(amount: number): number {
        return Math.floor(this.amountToMainUnits(amount));
    }

    getDecimalAmount(amount: number): number {
        return this.amountToMainUnits(amount) % 1;
    }

    // Returns as an integer the rounded number of subdivisions outside of whole amount (eg. $3.71 -> 71)
    getSubunitAmount(amount: number): number {
        return Math.floor(this.amountToSubunits(amount));
    }

    getIsoCode(): string {
        return this.isoCode.toLowerCase();
    }

    getFormatter(): Intl.NumberFormat {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: this.isoCode.toUpperCase(),
            maximumFractionDigits: 2,
        });
    }

    toString(): string {
        return this.getIsoCode().toUpperCase();
    }
}

class CurrencyStoreClass extends Store("Currency", Currency) {
    getByIsoCode(isoCode: string | number = ""): Currency | undefined {
        const isoCodeStr = String(isoCode).toLowerCase();
        return this.find((currency: Currency) => currency.getIsoCode() === isoCodeStr);
    }

    get(id: StoreId): Currency | undefined {
        return super.get(id) || this.getByIsoCode(id);
    }
}

export const CurrencyStore = new CurrencyStoreClass();

