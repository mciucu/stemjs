import {isString, isBoolean, isNumber, titleCase} from "../base/Utils";
import {type UICleanChild} from "../ui/UIBase";

export interface EnumOptions {
    value?: any;
    name?: string;
    [key: string]: any;
}

// The `this` type of the statics below. A decorator can't retype the class it decorates, so an enum class only
// ever inherits what BaseEnum declares: allEntries can't be T[], and every other member is generic in its own
// T, which would only ever infer the constraint. NoInfer leaves the construct signature as the single site
// that says what the entries are. The entries themselves have no inference site at all, so ts-plugin/ declares
// those - and allEntries with them, a property having nothing to infer from.
export interface EnumConstructor<T extends BaseEnum> {
    new (obj: EnumOptions): T;
    allEntries: BaseEnum[];
    defaultName(value: any): string;
    init(key: string, obj?: any): NoInfer<T>;
    all(): NoInfer<T>[];
    fromValue(value: any): NoInfer<T> | null;
    makeFieldLoader(): (value: any) => NoInfer<T> | any;
}

export class BaseEnum {
    // Set by makeEnum, so every enum class has it without declaring it
    declare static allEntries: BaseEnum[];

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

    toUI(parent?: any): UICleanChild;
    toUI(): UICleanChild {
        return this.toString();
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
        return Array.from(this.allEntries) as T[];
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
export function makeEnum<T extends BaseEnum, C extends new (...args: any[]) => T & Record<string, any>>(cls: C): C & EnumConstructor<T> {
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
