import {mapIterator} from "../base/Utils";

// A map that supports multiple values to the same key
export class MultiMap<K = any, V = any> {
    private map: Map<K, V[]>;

    constructor() {
        this.map = new Map();
    }

    static iterator<T>(items: T[]): IterableIterator<T> {
        return items[Symbol.iterator]();
    }

    // Methods that are called before every access inside
    // the internal map
    normalizeKey(key: K): K {
        return key;
    }
    
    normalizeValue(value: V): V {
        return value;
    }

    append(key: K, value: V): void {
        const nKey = this.normalizeKey(key);
        const nValue = this.normalizeValue(value);
        if (this.map.has(nKey)) {
            this.map.get(nKey)!.push(nValue);
        } else {
            this.map.set(nKey, [nValue]);
        }
    }

    has(key: K): boolean {
        return this.map.has(this.normalizeKey(key));
    }

    delete(key: K): boolean {
        return this.map.delete(this.normalizeKey(key));
    }

    set(key: K, value: V): void {
        this.map.set(this.normalizeKey(key), [this.normalizeValue(value)]);
    }

    // Return the first value
    get(key: K): V | null {
        const nKey = this.normalizeKey(key);
        if (this.map.has(nKey)) {
            return this.map.get(nKey)![0];
        }
        return null;
    }

    getAll(key: K): V[] | null {
        const nKey = this.normalizeKey(key);
        if (this.map.has(nKey)) {
            return this.map.get(nKey)!.slice();
        }
        return null;
    }

    forEach(callback: (value: V, key: K, map: this) => void, context?: any): void {
        for (const [key, value] of this.entries()) {
            callback.call(context, value, key, this);
        }
    }

    keys(): IterableIterator<K> {
        return mapIterator(this.entries(), entry => entry[0]);
    }

    values(): IterableIterator<V> {
        return mapIterator(this.entries(), entry => entry[1]);
    }

    *entries(): IterableIterator<[K, V]> {
        for (const [key, values] of this.map.entries()) {
            for (const value of values) {
                yield [key, value];
            }
        }
    }

    [Symbol.iterator](): IterableIterator<[K, V]> {
        return this.entries();
    }
}