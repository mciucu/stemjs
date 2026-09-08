import {isString, isBoolean, isNumber, titleCase} from "../base/Utils";
import {type BaseUIElement, type UICleanChild} from "../ui/UIBase";

// What an entry is keyed by: the simple value it declares, or the lowercased key when it declares none.
// init also accepts a boolean, where false falls through to the key and only true can reach a value
export type EnumValue = string | number;

export interface EnumOptions {
    value?: EnumValue;
    name?: string;
    [key: string]: any;
}

// The config a class is written with, read back off the class itself
export type EnumConfigOf<T extends BaseEnum<any>> = NonNullable<T["enumConfig"]>;

// The `this` type of the statics below. A decorator can't retype the class it decorates, so an enum class only
// ever inherits what BaseEnum declares: allEntries can't be T[], and every other member is generic in its own
// T, which would only ever infer the constraint. NoInfer leaves the construct signature as the single site
// that says what the entries are. The entries themselves have no inference site at all, so ts-plugin/ declares
// those - and allEntries with them, a property having nothing to infer from.
export interface EnumConstructor<T extends BaseEnum<any>> {
    new (obj: EnumConfigOf<T>): T;
    allEntries: BaseEnum<any>[];
    defaultName(value: EnumValue): string;
    init(key: string, obj?: any): NoInfer<T>; // Left open: see the implementation
    all(): NoInfer<T>[];
    fromValue(value: EnumValue | BaseEnum<any>): NoInfer<T> | null;
    makeFieldLoader(): (value: EnumValue) => NoInfer<T> | EnumValue;
}

// A subclass names the config its entries are written with, which is also what its constructor takes.
// Don't make the subclass itself generic: ts-plugin skips a class carrying type parameters of its own, and
// every entry declaration goes with it
export class BaseEnum<Config extends EnumOptions = EnumOptions> {
    // Never assigned. It is the only site carrying Config onto the instance type, which is what lets a
    // static read it back - a class is structural, so `T extends BaseEnum<infer C>` matches the default
    declare readonly enumConfig?: Config;

    // Set by makeEnum, so every enum class has it without declaring it
    declare static allEntries: BaseEnum<any>[];

    value: NonNullable<Config["value"]>;
    name: string;
    [key: string]: any;

    constructor(obj: Config) {
        this.value = obj.value;
        this.name = obj.name || String(this.value);
        Object.assign(this, obj);
    }

    getName(): string {
        return this.name;
    }

    getValue(): NonNullable<Config["value"]> {
        return this.value;
    }

    toString(): string {
        return this.getName();
    }

    toUI(parent?: BaseUIElement): UICleanChild;
    toUI(): UICleanChild {
        return this.toString();
    }

    valueOf(): NonNullable<Config["value"]> {
        return this.value;
    }

    static defaultName(value: EnumValue): string {
        value = String(value).replace(/_/g, " ");
        return titleCase(value);
    }

    // obj is left open: it is an EnumValue or an EnumOptions, and which one is remembered in a boolean
    // that no narrowing follows to the spread below
    static init<T extends BaseEnum<any>>(this: EnumConstructor<T>, key: string, obj?: any): T {
        const objIsSimple = isString(obj) || isNumber(obj) || isBoolean(obj);
        // A branch, not an ||: an entry declared 0 or "" is a value the key must not replace
        const value = objIsSimple ? obj : key.toLowerCase();
        if (objIsSimple) {
            obj = null;
        }

        return new this({
            name: this.defaultName(key),
            value,
            ...obj,
        });
    }

    static all<T extends BaseEnum<any>>(this: EnumConstructor<T>): T[] {
        // Clone the Array to be able to make changes
        return Array.from(this.allEntries) as T[];
    }

    static fromValue<T extends BaseEnum<any>>(this: EnumConstructor<T>, value: EnumValue | BaseEnum<any>): T | null {
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

    static makeFieldLoader<T extends BaseEnum<any>>(this: EnumConstructor<T>): (value: EnumValue) => T | EnumValue {
        // TODO log if invalid value?
        return (value: EnumValue) => this.fromValue(value) || value;
    }
}

// Experimental enum maker method
export function makeEnum<T extends BaseEnum<any>, C extends new (...args: any[]) => T & Record<string, any>>(cls: C): C & EnumConstructor<T> {
    // TODO: have it working so that if cls doesn't manually inherit BaseEnum, everything still works.
    //  Object.setPrototypeOf(cls, BaseEnum);
    //  cls.prototype.__proto__ = BaseEnum.prototype;
    const enumCls = cls as any as EnumConstructor<T> & Record<string, any>;
    const allEntries: T[] = [];
    for (const key in enumCls) {
        const uppercaseKey = key.toUpperCase();
        if (key === uppercaseKey) {
            enumCls[key] = enumCls.init(key, enumCls[key]);
            allEntries.push(enumCls[key]);
        }
    }

    enumCls.allEntries = allEntries;

    return Object.freeze(enumCls) as C & EnumConstructor<T>;
}
