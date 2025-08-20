import {globalStore, BaseStore, StoreClass, StoreObject} from "../state/Store";
import {StoreId} from "../state/State";

@globalStore
export class Currency extends BaseStore("Currency") {
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

    static getByIsoCode(isoCode: string | number = ""): Currency | undefined {
        const isoCodeStr = String(isoCode).toLowerCase();
        return this.find((currency: Currency) => currency.getIsoCode() === isoCodeStr);
    }

    static get<T extends StoreObject>(this: StoreClass<T>, id: StoreId): T | undefined {
        const self = this as any as typeof Currency;
        return super.get(id) || (self.getByIsoCode(id) as any);
    }
}
