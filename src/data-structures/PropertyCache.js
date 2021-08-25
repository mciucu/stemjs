import {isString} from "../base/Utils";

// Basically a WeakMap with a default getter and which provides control over the Symbol key
export class PropertyCache {
    // When getter is null, assume that the first argument is the getter.
    constructor(key, getter = null) {
        if (isString(key)) {
            key = Symbol.for(key);
        }
        if (getter == null) {
            getter = key;
            key = Symbol();
        }
        this.key = key;
        this.getter = getter;
    }

    get(obj, getter = this.getter) {
        const key = this.key;
        if (obj.hasOwnProperty(key)) {
            return obj[key];
        }
        return obj[key] = getter(obj);
    }
}