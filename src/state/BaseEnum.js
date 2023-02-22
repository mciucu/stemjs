import {isString, isBoolean, isNumber, titleCase} from "../base/Utils.js";

export class BaseEnum {
    constructor(obj) {
        this.value = obj.value;
        this.name = obj.name || String(this.value);
        Object.assign(this, obj);
    }

    getName() {
        return this.name;
    }

    getValue() {
        return this.value;
    }

    toString() {
        return this.getName();
    }

    valueOf() {
        return this.value;
    }

    static defaultName(value) {
        value = String(value).replace(/_/g, " ");
        return titleCase(value);
    }

    static init(key, obj) {
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

    static all() {
        return this.allEntries;
    }

    static fromValue(value) {
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

    static makeFieldLoader() {
        // TODO log if invalid value?
        return (value) => this.fromValue(value) || value;
    }
}

// Experimental enum maker method
export function makeEnum(cls) {
    // TODO: have it working so that if cls doesn't manually inherit BaseEnum, everything still works.
    //  Object.setPrototypeOf(cls, BaseEnum);
    //  cls.prototype.__proto__ = BaseEnum.prototype;
    const allEntries = [];
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
