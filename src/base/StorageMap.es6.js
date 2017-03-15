import {Dispatchable} from "./Dispatcher";

// Class for working with the Window.localStorage and Window.sessionStorage objects
// All keys are prefixed with our custom name, so we don't have to worry about polluting the global storage namespace
// Keys must be strings, and values are modified by the serialize/deserialize methods,
// which by default involve JSON conversion
class StorageMap extends Dispatchable {
    static SEPARATOR = "-@#%-";

    constructor(storage, name="") {
        super();
        this.storage = storage;
        this.name = name;
        this.prefix = name + this.constructor.SEPARATOR;
    }

    getPrefix() {
        return this.prefix;
    }

    getRawKey(key) {
        return this.getPrefix() + key;
    }

    // Method to serialize the values
    serialize(value) {
        return JSON.stringify(value);
    }

    // Method to deserialize the value (which can be null if there is no value)
    deserialize(value) {
        return value && JSON.parse(value);
    }

    set(key, value) {
        try {
            this.storage.setItem(this.getRawKey(key), this.serialize(value));
        }
        catch(e) {
            return false;
        }
        return true;
    }

    delete(key) {
        this.storage.removeItem(this.getRawKey(key));
    }

    getRaw(key) {
        return this.storage.getItem(this.getRawKey(key));
    }

    get(key, defaultValue = null) {
        const value = this.getRaw(key);
        if (value == null) {
            return defaultValue;
        }
        return this.deserialize(value);
    }

    has(key) {
        return (this.getRaw(key) != null);
    }

    keys() {
        let result = [];
        const totalStorageKeys = this.storage.length;
        const prefixLenth = this.getPrefix().length;
        for (let i = 0; i < totalStorageKeys; i++) {
            const key = this.storage.key(i);
            if (key.startsWith(this.getPrefix())) {
                result.push(key.substr(prefixLenth));
            }
        }
        return result;
    }

    values() {
        return this.keys().map(key => this.get(key));
    }

    entries() {
        return this.keys().map(key => [key, this.get(key)]);
    }

    [Symbol.iterator]() {
        return this.entries();
    }

    // Remove all of the keys that start with out prefix
    clear() {
        for (let key of this.keys()) {
            this.delete(key);
        }
    }
}

// SessionStorageMap can be used to preserve data on tab refreshes
export class SessionStorageMap extends StorageMap {
    constructor(name="") {
        super(window.sessionStorage, name);
    }
}

// LocalStorageMap can be used to store data across all our tabs
export class LocalStorageMap extends StorageMap {
    constructor(name="") {
        super(window.localStorage, name);
    }

    // Since we don't want a listener attached to window storage event for each map, we create a global one
    // Any raw key that contains our separator has its original map identified and gets dispatched only for that map
    static getChangeDispatchable() {
        if (!this.CHANGE_DISPATCHABLE) {
            this.CHANGE_DISPATCHABLE = new Dispatchable();
            window.addEventListener("storage", (event) => {
                let separatorIndex = event.key.indexOf(this.SEPARATOR);
                if (separatorIndex === -1) {
                    // This is not an event associated with a storage map
                    return;
                }
                const name = event.key.substr(0, separatorIndex);
                const actualKey = event.key.substr(separatorIndex + this.SEPARATOR.length);
                let newEvent = {
                    originalEvent: event,
                    key: actualKey,
                    oldValue: event.oldValue,
                    newValue: event.newValue,
                };
                this.CHANGE_DISPATCHABLE.dispatch(name, newEvent);
            });
        }
        return this.CHANGE_DISPATCHABLE;
    }

    // Add a listener for all change event on the current map
    // Only works if we're being backed by Window.localStorage and only received events from other tabs (not the current tab)
    // The event has the following fields: key, oldValue, newValue, url, storageArea, originalEvent
    // The key is modified to be the same the one you used in the map
    addChangeListener(callback, doDeserialization=true) {
        let realCallback = callback;
        if (doDeserialization) {
            realCallback = (event) => {
                event.oldValue = this.deserialize(event.oldValue);
                event.newValue = this.deserialize(event.newValue);
                callback(event);
            }
        }

        return this.constructor.getChangeDispatchable().addListener(this.name, realCallback);
    }
}
