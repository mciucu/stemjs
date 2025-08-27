import {Dispatchable} from "../base/Dispatcher";

export class State extends Dispatchable {
    stores = new Map();

    getStore(objectType) {
        objectType = objectType?.objectType || objectType?.toLowerCase();
        return this.stores.get(objectType);
    }

    getStoreForEvent(event) {
        const objectType = event.objectType || event.store;
        return this.getStore(objectType);
    }

    addStore(store) {
        const objectType = store.objectType;
        if (!this.stores.has(objectType)) {
            this.stores.set(objectType, store);
        } else {
            throw Error("GlobalState: Adding a store for an existing object type: " + store.objectType);
        }
    }

    applyEvent(event) {
        if (event == null) {
            return;
        }
        if (Array.isArray(event)) {
            for (let individualEvent of event) {
                this.applyEvent(individualEvent);
            }
            return;
        }
        if (event.state) {
            this.importState(event.state);
            // We can have events that only have a state
            if (!this.getStoreForEvent(event)) {
                return;
            }
        }
        const store = this.getStoreForEvent(event);
        if (store) {
            return store.applyEvent(event);
        } else {
            console.log("GlobalState: Missing store for event: ", event);
        }
    }

    get(objectType, objectId) {
        const store = this.getStore(objectType);
        if (store) {
            let args = Array.prototype.slice.call(arguments, 1);
            return store.get(...args);
        } else {
            console.error("GlobalState: Can't find store ", objectType);
            return null;
        }
    }

    // Import the store for objectType and remove it from stateMap
    importStateFromTempMap(objectType, stateMap) {
        const storeState = stateMap.get(objectType);
        stateMap.delete(objectType);
        if (storeState == null) {
            // Probably a dependency that isn't in the state
            return;
        }

        const store = this.getStore(objectType);

        if (!store) {
            console.error("Failed to import state, can't find store ", objectType);
            return;
        }
        for (const dependency of store.dependencies) {
            this.importStateFromTempMap(dependency.toLowerCase(), stateMap);
        }
        store.importState(storeState);
    }

    // Imports the state information from a plain object
    importState(state) {
        if (Array.isArray(state)) {
            for (const obj of state) {
                this.importState(obj);
            }
            return;
        }
        if (state.state || state.events) {
            // Must be a recursive object
            // TODO Technically not correct since we need to respect disableState/Event import for the request itself
            this.load(state);
            return;
        }
        // Import everything in a map and then do an implicit topological sort by dependencies
        const stateMap = new Map();
        for (const [objectType, objects] of Object.entries(state)) {
            stateMap.set(objectType.toLowerCase(), objects);
        }
        while (stateMap.size > 0) {
            const allKeys = stateMap.keys();
            const objectType = allKeys.next().value;
            this.importStateFromTempMap(objectType, stateMap);
        }
    }

    // Loads both the state and the events
    load({state, events}, disableStateImport, disableEventsImport) {
        if (state && !disableStateImport) {
            this.importState(state);
        }
        if (events && !disableEventsImport) {
            this.applyEvent(events);
        }
    }

    clear() {
        for (const store of this.stores.values()) {
            store.clear && store.clear();
        }
    }

    toJSON() {
        const state = {};
        for (const store of this.stores.values()) {
            state[store.objectType] = store.toJSON();
        }
        return state;
    }
}

// When creating a store without an explicit state, this value should be assumed
export const GlobalState = new State();
