import {Dispatchable} from "./Dispatcher";

// Class for working with the Window.localStorage and Window.sessionStorage objects
// All keys are prefixed with our custom name, to
class StorageSerializer extends Dispatchable {
    constructor(storage, name) {
        super();
        this.storage = storage;
        this.name = name; // TODO: default to unique id
        this.prefix = name + ".-";
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
        return JSON.parse(value);
    }

    set(key, value) {
        this.storage.setItem(this.getRawKey(key), this.serialize(value));
    }

    delete(key) {
        this.storage.removeItem(this.getRawKey(key));
    }

    getRaw(key) {
        return this.storage.getItem(this.getRawKey(key));
    }

    get(key, defaultValue) {
        const value = this.getRaw(key);
        if (value == null) {
            return defaultValue || value;
        }
        return this.deserialize(value);
    }

    has(key) {
        return (this.getRaw(key) != null);
    }

    // Remove all of the keys that start with out prefix
    clear() {
        const totalStorageKeys = this.storage.length;
        for (let i = 0; i < totalStorageKeys; i++) {
            const key = this.storage.key(i);
            if (key.startsWith(this.getPrefix())) {
                this.storage.removeItem(key);
            }
        }
    }

    // Add a listener for all change event on the current store
    // Only works if we're being backed by Window.localStorage and only received events from other tabs
    // The event has the following fields: key, oldValue, newValue, url, storageArea
    addChangeListener(callback) {
        if (this.storage !== window.localStorage) {
            throw Error("Only localStorage has events");
        }
        window.addEventListener("storage", (event) => {
            if (event.storageArea === this.storage) {
                // TODO: remove the prefix from the key
                callback(event);
            }
        })
    }
}

export class LocalStorageSerializer extends StorageSerializer {
    constructor(name) {
        super(window.localStorage, name);
    }
}

export class SessionStorageSerializer extends StorageSerializer {
    constructor(name) {
        super(window.sessionStorage, name);
    }
}
