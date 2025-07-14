import {isString, isBoolean, isNumber, titleCase} from "../base/Utils.js";

export interface EnumOptions {
    value?: any;
    name?: string;
    [key: string]: any;
}

export interface EnumConstructor<T extends BaseEnum> {
    new (obj: EnumOptions): T;
    allEntries: T[];
    defaultName(value: any): string;
    init(key: string, obj?: any): T;
    all(): T[];
    fromValue(value: any): T | null;
    makeFieldLoader(): (value: any) => T | any;
}

export class BaseEnum {
    value: any;
    name: string;
    [key: string]: any;

    constructor(obj: EnumOptions) {
        this.value = obj.value;
        this.name = obj.name || String(this.value);
        Object.assign(this, obj);
    }

    getName(): string {
        return this.name;
    }

    getValue(): any {
        return this.value;
    }

    toString(): string {
        return this.getName();
    }

    valueOf(): any {
        return this.value;
    }

    static defaultName(value: any): string {
        value = String(value).replace(/_/g, " ");
        return titleCase(value);
    }

    static init<T extends BaseEnum>(this: EnumConstructor<T>, key: string, obj?: any): T {
        const objIsSimple = isString(obj) || isNumber(obj) || isBoolean(obj);
        const value = (objIsSimple && obj) || key.toLowerCase();
        if (objIsSimple) {
            obj = null;
        }

        return new this({
            name: this.defaultName(key),
            value,
            ...obj,
        });
    }

    static all<T extends BaseEnum>(this: EnumConstructor<T>): T[] {
        // Clone the Array to be able to make changes
        return Array.from(this.allEntries);
    }

    static fromValue<T extends BaseEnum>(this: EnumConstructor<T>, value: any): T | null {
        if (value instanceof this) {
            return value;
        }
        for (const entry of this.all()) {
            if (entry.value === value) {
                return entry;
            }
        }
        return null;
    }

    static makeFieldLoader<T extends BaseEnum>(this: EnumConstructor<T>): (value: any) => T | any {
        // TODO log if invalid value?
        return (value: any) => this.fromValue(value) || value;
    }
}

// Experimental enum maker method
export function makeEnum<T extends BaseEnum>(cls: EnumConstructor<T> & Record<string, any>): Readonly<EnumConstructor<T> & Record<string, any>> {
    // TODO: have it working so that if cls doesn't manually inherit BaseEnum, everything still works.
    //  Object.setPrototypeOf(cls, BaseEnum);
    //  cls.prototype.__proto__ = BaseEnum.prototype;
    const allEntries: T[] = [];
    for (const key in cls) {
        const uppercaseKey = key.toUpperCase();
        if (key === uppercaseKey) {
            cls[key] = cls.init(key, cls[key]);
            allEntries.push(cls[key]);
        }
    }

    cls.allEntries = allEntries;

    return Object.freeze(cls);
}
