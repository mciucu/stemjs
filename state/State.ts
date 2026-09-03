import {type Callback, type CleanupJobs, Dispatchable, type RemoveHandle} from "../base/Dispatcher";
import {isString} from "../base/Utils";
// Store imports this module back, so the reference has to stay erasable
import {type StoreObject} from "./Store";

export type StoreId = string | number;
export type StoreIdOrNull = StoreId | null | undefined;

export interface StoreEvent {
    // Absent on an event built locally, where the applyX method being called is the type
    type?: string;
    objectId?: StoreId;
    data?: any;
    isFake?: boolean;
    [key: string]: any;
}

interface StateEvent extends StoreEvent {
    objectType?: string;
    state?: RawStateData; // events may have an extra state that is applied before the object
}

declare global {
    // ts-plugin/ adds an entry for every @globalStore class, keyed by the name its store was declared with,
    // so looking a store up by that name says what it holds. Empty without the plugin, which only costs
    // precision - an unlisted name still resolves through the general signature.
    interface StemStoreRegistry {}
}

// getStore() hands back the store class itself, so its statics are callable on the result. Each one below
// mirrors what StoreObject declares, which is where the shapes are decided.
export interface StoreInterface<BaseType extends StoreObject = StoreObject> {
    objectType: string;
    dependencies: string[];
    getState(): State;
    applyEvent(event: StateEvent): BaseType | undefined;
    get(id: StoreId): BaseType | undefined;
    importState(objects: any[]): void;
    clear?(): void;
    toJSON(): any[];
    getObjects(): Map<string, BaseType>;
    all(): BaseType[];
    filterBy(filter: Record<string, any>): BaseType[];
    findBy(filter: Record<string, any>): BaseType | undefined;
    // Every store is a Dispatchable
    addChangeListener(callback: Callback): RemoveHandle | CleanupJobs | undefined;
}

export type RawStateData = Record<string, any[]>;

export interface StateLoadOptions {
    state?: RawStateData;
    events?: StateEvent | StateEvent[];
}

export type StateData = RawStateData | StateLoadOptions;

export class State extends Dispatchable {
    stores = new Map<string, StoreInterface>();

    getStore<Name extends keyof StemStoreRegistry>(objectType: Name): StoreInterface<StemStoreRegistry[Name]> | undefined;
    getStore(objectType: string | { objectType?: string } | null | undefined): StoreInterface | undefined;
    getStore(objectType: string | { objectType?: string } | null | undefined): StoreInterface | undefined {
        const objectName = isString(objectType) ? objectType?.toLowerCase() : objectType?.objectType;
        return this.stores.get(objectName);
    }

    getStoreForEvent(event: StateEvent): StoreInterface | undefined {
        const objectType = event.objectType;
        return this.getStore(objectType);
    }

    addStore(store: StoreInterface): void {
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

    // Bound to the instance, so it can be handed straight to an event stream as a listener
    applyEventWrapper = (event: StateEvent | StateEvent[] | null | undefined): void => this.applyEvent(event);

    registerStream(streamName: string): void {
        console.error("Websockets are not enabled, can't register stream:", streamName);
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
            const objectType = allKeys.next().value!; // size > 0 guarantees a remaining key
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
        const state: Record<string, any> = {};
        for (const store of this.stores.values()) {
            state[store.objectType] = store.toJSON();
        }
        return state;
    }
}

// When creating a store without an explicit state, this value should be assumed
export const GlobalState = new State();
