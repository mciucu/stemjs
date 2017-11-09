import {Dispatchable} from "../base/Dispatcher";

class State extends Dispatchable {
    constructor() {
        super();
        this.stores = new Map();
        // A version of applyEvent that's binded to this
        // TODO: applyEvent should use the @bind decorator
        this.applyEventWrapper = (event) => {
            this.applyEvent(event);
        }
    }

    getStore(objectType) {
        objectType = objectType && objectType.toLowerCase();
        return this.stores.get(objectType);
    }

    getStoreForEvent(event) {
        const objectType = event.objectType || event.store;
        return this.getStore(objectType);
    }

    addStore(store) {
        let objectType = store.objectType.toLowerCase();
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
        let store = this.getStoreForEvent(event);
        if (store) {
            return store.applyEvent(event);
        } else {
            console.log("GlobalState: Missing store for event: ", event);
        }
    }

    get(objectType, objectId) {
        let store = this.getStore(objectType);
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
        let storeState = stateMap.get(objectType);
        stateMap.delete(objectType);

        let store = this.getStore(objectType);

        if (!store) {
            console.error("Failed to import state, can't find store ", objectType);
            return;
        }
        for (let dependency of store.getDependencies()) {
            this.importStateFromTempMap(dependency.toLowerCase(), stateMap);
        }
        store.importState(storeState);
    }

    // Imports the state information from a plain object
    importState(state) {
        if (Array.isArray(state)) {
            for (let obj of state) {
                this.importState(obj);
            }
            return;
        }
        // Import everything in a map and then do an implicit topological sort by dependencies
        let stateMap = new Map();
        for (let objectType in state) {
            stateMap.set(objectType.toLowerCase(), state[objectType]);
        }
        while (stateMap.size > 0) {
            let allKeys = stateMap.keys();
            let objectType = allKeys.next().value;
            this.importStateFromTempMap(objectType, stateMap);
        }
    }
}

let GlobalState = new State();

// When creating a store without an explicit state, this value should be assumes
// Change it to null for instance of you don't want stores to be added to any state by default
let DefaultState = GlobalState;

self.GlobalState = GlobalState;

export {State, GlobalState, DefaultState};
