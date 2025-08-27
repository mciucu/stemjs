import {isString} from "../base/Utils";

// Basically a WeakMap with a default getter and which provides control over the Symbol key
export class PropertyCache<T = any, R = any> {
    private key: symbol;
    private getter: (obj: T) => R;

    // When getter is missing, assume that the first argument is the getter.
    constructor(key: string | symbol | ((obj: T) => R), getter?: ((obj: T) => R)) {
        if (isString(key)) {
            key = Symbol.for(key);
        }
        if (!getter) {
            this.getter = key as (obj: T) => R;
            this.key = Symbol();
        } else {
            this.key = key as symbol;
            this.getter = getter;
        }
    }

    get(obj: T, getter: (obj: T) => R = this.getter): R {
        const key = this.key;
        if ((obj as any).hasOwnProperty(key)) {
            return (obj as any)[key];
        }
        return (obj as any)[key] = getter(obj);
    }
}