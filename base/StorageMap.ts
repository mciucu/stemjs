import {Dispatchable} from "./Dispatcher";

// Class for working with the Window.localStorage and Window.sessionStorage objects
// All keys are prefixed with our custom name, so we don't have to worry about polluting the global storage namespace
// Keys must be strings, and values are modified by the serialize/deserialize methods,
// which by default involve JSON conversion
export class StorageMap extends Dispatchable {
    static SEPARATOR = "-@#%-";
    
    storage: Storage;
    name: string;
    prefix: string;

    constructor(storage: Storage, name: string = "") {
        super();
        this.storage = storage;
        this.name = name;
        this.prefix = name + (this.constructor as typeof StorageMap).SEPARATOR;
    }

    getPrefix(): string {
        return this.prefix;
    }

    getRawKey(key: string): string {
        return this.getPrefix() + key;
    }

    // Method to serialize the values
    serialize(value: any): string {
        return JSON.stringify(value);
    }

    // Method to deserialize the value (which can be null if there is no value)
    deserialize(value: string | null): any {
        return value && JSON.parse(value);
    }

    set(key: string, value: any): boolean {
        try {
            this.storage.setItem(this.getRawKey(key), this.serialize(value));
        } catch(e) {
            return false;
        }
        return true;
    }

    delete(key: string): void {
        this.storage.removeItem(this.getRawKey(key));
    }

    getRaw(key: string): string | null {
        return this.storage.getItem(this.getRawKey(key));
    }

    get(key: string, defaultValue: any = null): any {
        const value = this.getRaw(key);
        if (value == null) {
            return defaultValue;
        }
        return this.deserialize(value);
    }

    has(key: string): boolean {
        return (this.getRaw(key) != null);
    }

    keys(): string[] {
        const result: string[] = [];
        const totalStorageKeys = this.storage.length;
        const prefixLength = this.getPrefix().length;
        for (let i = 0; i < totalStorageKeys; i++) {
            const key = this.storage.key(i);
            if (key && key.startsWith(this.getPrefix())) {
                result.push(key.substr(prefixLength));
            }
        }
        return result;
    }

    values(): any[] {
        return this.keys().map(key => this.get(key));
    }

    entries(): [string, any][] {
        return this.keys().map(key => [key, this.get(key)]);
    }

    [Symbol.iterator](): [string, any][] {
        return this.entries();
    }

    // Remove all of the keys that start with out prefix
    clear(): void {
        for (const key of this.keys()) {
            this.delete(key);
        }
    }
}

// SessionStorageMap can be used to preserve data on tab refreshes
export class SessionStorageMap extends StorageMap {
    constructor(name: string = "") {
        super(window.sessionStorage, name);
    }
}

// LocalStorageMap can be used to store data across all our tabs
export class LocalStorageMap extends StorageMap {
    static CHANGE_DISPATCHABLE?: Dispatchable;

    constructor(name: string = "") {
        super(window.localStorage, name);
    }

    // Since we don't want a listener attached to window storage event for each map, we create a global one
    // Any raw key that contains our separator has its original map identified and gets dispatched only for that map
    static getChangeDispatchable(): Dispatchable {
        if (!this.CHANGE_DISPATCHABLE) {
            this.CHANGE_DISPATCHABLE = new Dispatchable();
            window.addEventListener("storage", (event: StorageEvent) => {
                if (!event.key) return;
                const separatorIndex = event.key.indexOf(this.SEPARATOR);
                if (separatorIndex === -1) {
                    // This is not an event associated with a storage map
                    return;
                }
                const name = event.key.substr(0, separatorIndex);
                const actualKey = event.key.substr(separatorIndex + this.SEPARATOR.length);
                const newEvent = {
                    originalEvent: event,
                    key: actualKey,
                    oldValue: event.oldValue,
                    newValue: event.newValue,
                };
                this.CHANGE_DISPATCHABLE!.dispatch(name, newEvent);
            });
        }
        return this.CHANGE_DISPATCHABLE;
    }

    // Add a listener for all change event on the current map
    // Only works if we're being backed by Window.localStorage and only received events from other tabs (not the current tab)
    // The event has the following fields: key, oldValue, newValue, url, storageArea, originalEvent
    // The key is modified to be the same the one you used in the map
    addChangeListener(callback: (event: any) => void, doDeserialization: boolean = true): any {
        let realCallback = callback;
        if (doDeserialization) {
            realCallback = (event: any) => {
                event.oldValue = this.deserialize(event.oldValue);
                event.newValue = this.deserialize(event.newValue);
                callback(event);
            };
        }

        return (this.constructor as typeof LocalStorageMap).getChangeDispatchable().addListener(this.name, realCallback);
    }
}