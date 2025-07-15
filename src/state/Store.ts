import {Dispatchable, CleanupJobs} from "../base/Dispatcher";
import {GlobalState, RawStateData, State, StateData, StoreEvent, StoreId} from "./State";
import {toArray} from "../base/Utils";

interface FieldDescriptor {
    cacheField?: boolean;
    rawField?: string | ((key: string) => string);
    [key: string]: any;
}

type StoreObjectClass<T extends StoreObject = StoreObject> = new (...args: any[]) => T;

interface StoreOptions {
    state?: State;
    dependencies?: string[]; // Other stores that should have their objects loaded before this
    [key: string]: any;
}

// The store information is kept in a symbol, to not interfere with serialization/deserialization
export const StoreSymbol = Symbol("Store");
export const EventDispatcherSymbol = Symbol("EventDispatcher");

export class StoreObject extends Dispatchable {
    declare [StoreSymbol]?: any;
    declare [EventDispatcherSymbol]?: Dispatchable;
    [key: string]: any;

    constructor(obj: any, event?: StoreEvent) {
        super();
        Object.assign(this, obj);
    }

    static makeFieldLoader(fieldDescriptor: FieldDescriptor): (value: any, obj: any) => any {
        fieldDescriptor.cacheField = false;
        fieldDescriptor.rawField = fieldDescriptor.rawField || (key => key + "Id");

        return (value: any, obj: any) => {
            const store = obj.getStore((this as any)[StoreSymbol].objectType);
            return store.get(value);
        };
    }

    setStore(store: any): void {
        this[StoreSymbol] = store;
    }

    getStore(storeName?: string): BaseStore {
        const ownStore = this[StoreSymbol];
        if (storeName) {
            return ownStore.getState().getStore(storeName);
        }
        return ownStore;
    }

    // By default, applying an event just shallow copies the fields from event.data
    applyEvent(event: StoreEvent): void {
        Object.assign(this, event.data);
    }

    applyEventAndDispatch(event: StoreEvent): void {
        this.applyEvent(event);
        this.dispatchChange(event);
    }

    addDeleteListener(callback: (...args: any[]) => void): any {
        return this.addListener("delete", callback);
    }

    // Add a listener on updates from events with this specific type.
    // Can accept an array as eventType
    addEventListener(eventType: string | string[], callback: (...args: any[]) => void): any {
        if (Array.isArray(eventType)) {
            const handlers = eventType.map(e => this.addEventListener(e, callback));
            return new CleanupJobs(handlers);
        }
        // Ensure the private event dispatcher exists
        if (!this[EventDispatcherSymbol]) {
            this[EventDispatcherSymbol] = new Dispatchable();
            this.addChangeListener((event) => {
                this[EventDispatcherSymbol]!.dispatch(event.type, event, this);
            });
        }
        return this[EventDispatcherSymbol]!.addListener(eventType, callback);
    }

    toJSON(): any {
        const obj: any = {};
        for (const key in this) {
            if (this.hasOwnProperty(key)) {
                obj[key] = this[key];
            }
        }
        return obj;
    }
}

export abstract class BaseStore<T extends StoreObject = StoreObject> extends Dispatchable {
    objectType: string;
    ObjectClass: StoreObjectClass<T>;
    state: State;
    dependencies: string[];
    [key: string]: any;

    constructor(objectType: string, ObjectClass: StoreObjectClass<T> = StoreObject as unknown as StoreObjectClass<T>, options: StoreOptions = {}) {
        super();
        this.objectType = objectType.toLowerCase();
        this.ObjectClass = ObjectClass;
        Object.assign(this, {
            state: GlobalState, // Can be null as well
            dependencies: [], // A list of other stores we want imported first
            ...options
        });
        this.state?.addStore(this);
    }

    loadRaw(responseOrState: StateData): any[] {
        const state = (responseOrState?.state || responseOrState || {}) as RawStateData;

        // Since the backend might have a different lettering case, need a more complex search here
        for (const [key, value] of Object.entries(state)) {
            if (String(key).toLowerCase() === this.objectType) {
                return toArray(value);
            }
        }

        return [];
    }

    // For a response/state raw object, return the objects that we have in store
    load(responseOrState: StateData): T[] {
        const rawObjects = this.loadRaw(responseOrState);
        return rawObjects.map(obj => this.get(obj.id));
    }

    loadObject(responseOrState: StateData): T | undefined {
        return this.load(responseOrState)?.[0];
    }

    getState(): any {
        return this.state;
    }

    // Abstract methods that subclasses should implement
    abstract get(id: StoreId): T | undefined;
    abstract applyEvent(event: StoreEvent): any;
    abstract importState(state: any): void;
    abstract toJSON(): any;
}

// Store type primarily intended to store objects that come from a server DB, and have a unique numeric .id field
// TODO: do we ever decouple this from BaseStore? Maybe merge.
export class GenericObjectStore<T extends StoreObject = StoreObject> extends BaseStore<T> {
    objects = new Map<string, T>();

    get(id: StoreId): T | undefined {
        if (id == null) {
            return;
        }
        return this.objects.get(String(id));
    }

    addObject(id: NonNullable<StoreId>, obj: T): void {
        this.objects.set(String(id), obj);
    }

    clear(): void {
        this.objects.clear();
        this.dispatch("change", null, null);
    }

    getObjectIdForEvent(event: StoreEvent): string {
        const id = event.objectId || (event.data as any)?.id;
        return String(id);
    }

    getObjectForEvent(event: StoreEvent): T | null {
        let objectId = this.getObjectIdForEvent(event);
        return this.get(objectId);
    }

    values(): IterableIterator<T> {
        return this.objects.values();
    }

    all(): T[] {
        const values = this.objects.values();
        return Array.from(values);
    }

    find(callback: (value: T) => boolean): T | undefined {
        return (this.all() as T[]).find(callback);
    }

    filter(callback: (value: T) => boolean): T[] {
        return (this.all() as T[]).filter(callback);
    }

    // TODO Stores should have configurable indexes from FK ids, for quick filtering
    filterBy(filter: Record<string, any>): T[] {
        const entries = Object.entries(filter); // Some minimal caching

        return this.filter((obj: T) => {
            for (const [key, value] of entries) {
                const objectValue = (obj as any)[key];
                // Can match by array (any value) or otherwise exact match
                if (Array.isArray(value)) {
                    if (!value.includes(objectValue)) {
                        return false;
                    }
                } else {
                    if (objectValue != value) {
                        return false;
                    }
                }
            }
            return true;
        });
    }

    findBy(filter: Record<string, any>): T | undefined {
        // TODO - need a better implementation with rapid termination
        return this.filterBy(filter)[0];
    }

    toJSON(): any[] {
        return (this.all() as T[]).map((entry: T) => entry.toJSON());
    }

    applyCreateOrUpdateEvent(event: StoreEvent, sendDispatch: boolean = true): T {
        let obj = this.getObjectForEvent(event);

        if (obj) {
            obj.applyEventAndDispatch(event);
        } else {
            obj = new this.ObjectClass(event.data, event, this);
            obj.setStore(this);
            this.addObject(this.getObjectIdForEvent(event), obj);
            if (sendDispatch) {
                this.dispatch("create", obj, event);
            }
        }
        if (sendDispatch) {
            this.dispatchChange(obj, event);
        }
        return obj;
    }

    applyDeleteEvent(event: StoreEvent): T | null {
        const obj = this.getObjectForEvent(event);
        if (obj) {
            this.objects.delete(this.getObjectIdForEvent(event));
            obj.dispatch("delete", event, obj);
            this.dispatch("delete", obj, event);
            this.dispatch("change", obj, event);
        }
        return obj;
    }

    applyEvent(event: StoreEvent): T | null {
        event.data = event.data || {};

        if (event.type === "create" || event.type === "createOrUpdate") {
            return this.applyCreateOrUpdateEvent(event);
        }

        if (event.type === "delete") {
            return this.applyDeleteEvent(event);
        }

        // We're in the general case
        const obj = this.getObjectForEvent(event);
        if (!obj) {
            console.error("Missing object of type ", this.objectType, " ", event.objectId);
            return null;
        }

        obj.applyEventAndDispatch(event);

        this.dispatch("change", obj, event); // TODO this is not a store event, but how can we still register for all of these?

        return obj;
    }

    importState(objects: any[] = []): void {
        for (const obj of objects) {
            this.create(obj);
        }
    }

    makeEventFromObject(obj: any, eventExtra: any = null): StoreEvent {
        return {
            isFake: true,
            type: "create",
            objectType: this.objectType,
            objectId: obj.id,
            data: obj,
            ...eventExtra,
        };
    }

    // Create a fake creation event, to insert the raw object
    create(obj: any, eventExtra: any = null, dispatchEvent: boolean = true): T | undefined {
        if (!obj) {
            return;
        }

        const event = this.makeEventFromObject(obj, eventExtra);
        return this.applyCreateOrUpdateEvent(event, dispatchEvent);
    }

    // Add a listener on all object creation events
    // If fakeExisting, will also pass existing objects to your callback
    addCreateListener(callback: (...args: any[]) => void, fakeExisting?: boolean) {
        if (fakeExisting) {
            for (const obj of this.objects.values()) {
                const event = this.makeEventFromObject(obj);
                callback(obj, event);
            }
        }

        return this.addListener("create", callback);
    }

    // Add a listener for any object deletions
    addDeleteListener(callback: (...args: any[]) => void) {
        return this.addListener("delete", callback);
    }
}

export class SingletonStore<T extends SingletonStore<T> = any> extends BaseStore<any> {
    constructor(objectType: string, options: StoreOptions = {}) {
        super(objectType, SingletonStore as any, options);
    }

    get(): T {
        return this as unknown as T;
    }

    all(): T[] {
        return [this as unknown as T];
    }

    toJSON(): string {
        return JSON.stringify([this]);
    }

    applyEvent(event: StoreEvent): void {
        Object.assign(this, event.data);
        this.dispatchChange(event);
    }

    importState(obj: any): void {
        Object.assign(this, obj);
        this.dispatchChange(obj);
    }

    // Use the same logic as StoreObject when listening to events
    addEventListener = StoreObject.prototype.addEventListener.bind(this);
}

export const Store = <T extends StoreObject = StoreObject>(objectType: string, ObjectClass: StoreObjectClass<T>, options: StoreOptions = {}) => class Store extends GenericObjectStore<T> {
    constructor() {
        super(objectType, ObjectClass, options);
    }
};

export function MakeStore<T extends StoreObject = StoreObject>(objectType: string, ObjectClass: StoreObjectClass<T>, options?: StoreOptions): GenericObjectStore<T> {
    const Cls = Store(objectType, ObjectClass, options);
    return new Cls();
}


// Experimental, to allow the store to also have the store methods be available on the object class
export function registerStore(objectType: string, options: StoreOptions = {dependencies: []}) {
    return <T extends StoreObject = StoreObject>(Cls: StoreObjectClass<T>) => {
        const store = MakeStore(objectType, Cls, options);

        (Cls as any).store = store;

        const proxy = new Proxy(Cls, {
            get(target: StoreObjectClass<T>, key: string | symbol) {
                if (key in target) {
                    return target[key as keyof StoreObjectClass<T>];
                } else {
                    return (store as any)[key];
                }
            }
        });

        store.ObjectClass = proxy;

        return proxy;
    }
}
