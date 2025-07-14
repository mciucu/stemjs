import {Dispatchable} from "../base/Dispatcher";
import {isString} from "../base/Utils";

export type StoreId = string | number | null | undefined;

export interface StoreEvent {
    type: string;
    objectId?: StoreId;
    data?: any;
    isFake?: boolean;
    [key: string]: any;
}

interface StateEvent extends StoreEvent {
    objectType?: string;
    state?: RawStateData; // events may have an extra state that is applied before the object
}

interface Store {
    objectType: string;
    dependencies: string[];
    applyEvent(event: StateEvent): any;
    get(id: StoreId): any;
    importState(objects: any[]): void;
    clear?(): void;
    toJSON(): any;
}

export type RawStateData = Record<string, any[]>;

interface StateLoadOptions {
    state?: RawStateData;
    events?: StateEvent | StateEvent[];
}

export type StateData = RawStateData | StateLoadOptions;

export class State extends Dispatchable {
    stores = new Map<string, Store>();

    getStore(objectType: string | { objectType?: string } | null | undefined): Store | undefined {
        const objectName = isString(objectType) ? objectType?.toLowerCase() : objectType?.objectType;
        return this.stores.get(objectName);
    }

    getStoreForEvent(event: StateEvent): Store | undefined {
        const objectType = event.objectType;
        return this.getStore(objectType);
    }

    addStore(store: Store): void {
        const objectType = store.objectType;
        if (!this.stores.has(objectType)) {
            this.stores.set(objectType, store);
        } else {
            throw new Error("GlobalState: Adding a store for an existing object type: " + store.objectType);
        }
    }

    applyEvent(event: StateEvent | StateEvent[] | null | undefined): void {
        if (event == null) {
            return;
        }
        if (Array.isArray(event)) {
            for (const individualEvent of event) {
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
            store.applyEvent(event);
        } else {
            console.log("GlobalState: Missing store for event: ", event);
        }
    }

    get(objectType: string, id: StoreId): any {
        const store = this.getStore(objectType);
        if (store) {
            return store.get(id);
        } else {
            console.error("GlobalState: Can't find store ", objectType);
            return null;
        }
    }

    // Import the store for objectType and remove it from stateMap
    importStateFromTempMap(objectType: string, stateMap: Map<string, any[]>): void {
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
    importState(state: StateData | StateData[]): void {
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
        const stateMap = new Map<string, any[]>();
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
    load({state, events}: StateLoadOptions, disableStateImport?: boolean, disableEventsImport?: boolean): void {
        if (state && !disableStateImport) {
            this.importState(state);
        }
        if (events && !disableEventsImport) {
            this.applyEvent(events);
        }
    }

    clear(): void {
        for (const store of this.stores.values()) {
            store.clear && store.clear();
        }
    }

    toJSON(): Record<string, any> {
        const state = {};
        for (const store of this.stores.values()) {
            state[store.objectType] = store.toJSON();
        }
        return state;
    }
}

// When creating a store without an explicit state, this value should be assumed
export const GlobalState = new State();
