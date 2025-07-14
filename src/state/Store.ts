import {Dispatchable, CleanupJobs} from "../base/Dispatcher";
import {GlobalState} from "./State";
import {toArray} from "../base/Utils";

// Type definitions for Store system
interface StoreEvent {
    type: string;
    objectType?: string;
    objectId?: string | number;
    data?: any;
    isFake?: boolean;
    [key: string]: any;
}

interface FieldDescriptor {
    cacheField?: boolean;
    rawField?: string | ((key: string) => string);
    [key: string]: any;
}

type ObjectClass<T = any> = new (...args: any[]) => T;

interface StoreOptions {
    state?: any;
    dependencies?: string[];
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

    getStore(storeName?: string): any {
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

export class BaseStore extends Dispatchable {
    objectType: string;
    ObjectClass: ObjectClass;
    state: any;
    dependencies: string[];
    [key: string]: any;

    constructor(objectType: string, ObjectClass: ObjectClass = StoreObject, options: StoreOptions = {}) {
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

    loadRaw(responseOrState: any): any[] {
        const state = responseOrState?.state || responseOrState || {};

        // Since the backend might have a different lettering case, need a more complex search here
        for (const [key, value] of Object.entries(state)) {
            if (String(key).toLowerCase() === this.objectType) {
                return toArray(value);
            }
        }

        return [];
    }

    // For a response/state raw object, return the objects that we have in store
    load(responseOrState: any): any[] {
        const rawObjects = this.loadRaw(responseOrState);
        return rawObjects.map(obj => this.get(obj.id));
    }

    loadObject(responseOrState: any, index: number = 0): any {
        return this.load(responseOrState)?.[index];
    }

    getState(): any {
        return this.state;
    }

    // Abstract methods that subclasses should implement
    get(id: any): any {
        throw new Error("get method must be implemented by subclass");
    }

    applyEvent(event: StoreEvent): any {
        throw new Error("applyEvent method must be implemented by subclass");
    }

    importState(state: any): void {
        throw new Error("importState method must be implemented by subclass");
    }

    toJSON(): any {
        throw new Error("toJSON method must be implemented by subclass");
    }
}

// Store type primarily intended to store objects that come from a server DB, and have a unique numeric .id field
// TODO: do we ever decouple this from BaseStore? Maybe merge.
export class GenericObjectStore extends BaseStore {
    objects = new Map<string, any>();

    get(id: any): any {
        if (id == null) {
            return null;
        }
        return this.objects.get(String(id));
    }

    addObject(id: any, obj: any): void {
        this.objects.set(String(id), obj);
    }

    clear(): void {
        this.objects.clear();
        this.dispatch("change", null, null);
    }

    getObjectIdForEvent(event: StoreEvent): string {
        return String(event.objectId || event.data.id);
    }

    getObjectForEvent(event: StoreEvent): any {
        let objectId = this.getObjectIdForEvent(event);
        return this.get(objectId);
    }

    all(asIterable?: boolean): any[] | IterableIterator<any> {
        let values = this.objects.values();
        if (!asIterable) {
            return Array.from(values);
        }
        return values;
    }

    find(callback: (value: any) => boolean): any {
        return (this.all() as any[]).find(callback);
    }

    filter(callback: (value: any) => boolean): any[] {
        return (this.all() as any[]).filter(callback);
    }

    // TODO Stores should have configurable indexes from FK ids, for quick filtering
    filterBy(filter: Record<string, any>): any[] {
        const entries = Object.entries(filter); // Some minimal caching

        return this.filter((obj: any) => {
            for (const [key, value] of entries) {
                const objectValue = obj[key];
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

    findBy(filter: Record<string, any>): any {
        // TODO - need a better implementation with rapid termination
        return this.filterBy(filter)[0];
    }

    toJSON(): any[] {
        return (this.all() as any[]).map((entry: any) => entry.toJSON());
    }

    applyCreateOrUpdateEvent(event: StoreEvent, sendDispatch: boolean = true): any {
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

    applyDeleteEvent(event: StoreEvent): any {
        const obj = this.getObjectForEvent(event);
        if (obj) {
            this.objects.delete(this.getObjectIdForEvent(event));
            obj.dispatch("delete", event, obj);
            this.dispatch("delete", obj, event);
            this.dispatch("change", obj, event);
        }
        return obj;
    }

    applyEvent(event: StoreEvent): any {
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
    create(obj: any, eventExtra: any = null, dispatchEvent: boolean = true): any {
        if (!obj) {
            return;
        }

        const event = this.makeEventFromObject(obj, eventExtra);
        return this.applyCreateOrUpdateEvent(event, dispatchEvent);
    }

    // Add a listener on all object creation events
    // If fakeExisting, will also pass existing objects to your callback
    addCreateListener(callback: (...args: any[]) => void, fakeExisting?: boolean): any {
        if (fakeExisting) {
            for (const obj of this.objects.values()) {
                const event = this.makeEventFromObject(obj);
                callback(obj, event);
            }
        }

        return this.addListener("create", callback);
    }

    // Add a listener for any object deletions
    addDeleteListener(callback: (...args: any[]) => void): any {
        return this.addListener("delete", callback);
    }
}

export class SingletonStore extends BaseStore {
    constructor(objectType: string, options: StoreOptions = {}) {
        super(objectType, SingletonStore as any, options);
    }

    get(): this {
        return this;
    }

    all(): this[] {
        return [this];
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

export const Store = (objectType: string, ObjectClass: ObjectClass, options: StoreOptions = {}) => class Store extends GenericObjectStore {
    constructor() {
        super(objectType, ObjectClass, options);
    }
};

export function MakeStore(objectType: string, ObjectClass: ObjectClass, options?: StoreOptions): GenericObjectStore {
    const Cls = Store(objectType, ObjectClass, options);
    return new Cls();
}


// Experimental, to allow the store to also have the store methods be available on the object class
export function registerStore(objectType: string, options: StoreOptions = {dependencies: []}) {
    return (Cls: ObjectClass) => {
        const store = MakeStore(objectType, Cls, options);

        (Cls as any).store = store;

        const proxy = new Proxy(Cls, {
            get(target: ObjectClass, key: string | symbol) {
                if (key in target) {
                    return target[key as keyof ObjectClass];
                } else {
                    return (store as any)[key];
                }
            }
        });

        store.ObjectClass = proxy;

        return proxy;
    }
}
