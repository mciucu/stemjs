// Basically a WeakMap with a default getter
export class PropertyCache {
    constructor(key, getter) {
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