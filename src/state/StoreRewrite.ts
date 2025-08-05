import {CleanupJobs, Dispatchable} from "../base/Dispatcher";
import {GlobalState, RawStateData, State, StateData, StoreEvent, StoreId} from "./State";
import {isNotNull, toArray} from "../base/Utils";

interface FieldDescriptor {
    cacheField?: boolean;
    rawField?: string | ((key: string) => string);
    [key: string]: any;
}

export interface StoreOptions {
    state?: State;
    dependencies?: string[]; // Other stores that should have their objects loaded before this
}

// A symbol to dispatch state events by type, since Dispatchable owns generic dispatchers
export const EventDispatcherSymbol = Symbol("EventDispatcher");

export class StoreObject extends Dispatchable {
    declare [EventDispatcherSymbol]?: Dispatchable;
    declare id: StoreId;

    constructor(obj: any, event?: StoreEvent) {
        super();
        Object.assign(this, obj);
    }

    getStore(storeName?: string): (typeof StoreObject) & Dispatchable {
        const ownStore = this.constructor as typeof StoreObject;
        if (storeName) {
            return ownStore.getState().getStore(storeName) as any;
        }
        return ownStore as any;
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

// STATIC BEGIN
    static objectType: string;
    static state: State = GlobalState;
    static dependencies: string[] = [];
    static objects = new Map<string, StoreObject>();

    static makeFieldLoader(fieldDescriptor: FieldDescriptor): (value: any, obj: any) => any {
        fieldDescriptor.cacheField = false;
        fieldDescriptor.rawField = fieldDescriptor.rawField || (key => key + "Id");

        return (value: any, obj: any) => {
            const store = obj.getStore((this.constructor as typeof StoreObject).objectType);
            return store.get(value);
        };
    }

    static loadRaw(responseOrState: StateData): any[] {
        const state = (responseOrState?.state || responseOrState || {}) as RawStateData;

        // Since the backend might have a different lettering case, need a more complex search here
        for (const [key, value] of Object.entries(state)) {
            if (String(key).toLowerCase() === this.objectType.toLowerCase()) {
                return toArray(value);
            }
        }

        return [];
    }

    // For a response/state raw object, return the objects that we have in store
    static load<BaseType extends StoreObject>(this: typeof StoreObject & {new (...args: any[]): BaseType}, responseOrState: StateData): BaseType[] {
        const rawObjects = this.loadRaw(responseOrState);
        return rawObjects.map(obj => this.get<BaseType>(obj.id)).filter(isNotNull);
    }

    static loadObject<BaseType extends StoreObject>(this: typeof StoreObject & {new (...args: any[]): BaseType}, responseOrState: StateData): BaseType | undefined {
        return this.load<BaseType>(responseOrState)?.[0];
    }

    static getState(): State {
        return this.state;
    }

    static get<T extends StoreObject>(this: {new (...args: any[]): T} & typeof StoreObject, id: StoreId): T | undefined {
        if (id == null) {
            return;
        }
        return this.objects.get(String(id)) as T;
    }

    static addObject<T extends StoreObject>(this: typeof StoreObject, id: NonNullable<StoreId>, obj: T): void {
        this.objects.set(String(id), obj);
    }

    static clear(): void {
        this.objects.clear();
        (this as unknown as Dispatchable).dispatchChange();
    }

    static getObjectIdForEvent(event: StoreEvent): string {
        const id = event.objectId || (event.data as any)?.id;
        return String(id);
    }

    static getObjectForEvent<T extends StoreObject>(this: {new (...args: any[]): T} & typeof StoreObject, event: StoreEvent): T | undefined {
        let objectId = this.getObjectIdForEvent(event);
        return this.get(objectId);
    }

    static values<T extends StoreObject>(this: {new (...args: any[]): T} & typeof StoreObject): IterableIterator<T> {
        return this.objects.values() as IterableIterator<T>;
    }

    static all<T extends StoreObject>(this: {new (...args: any[]): T} & typeof StoreObject): T[] {
        const values = this.objects.values();
        return Array.from(values) as T[];
    }

    static find<T extends StoreObject>(this: {new (...args: any[]): T} & typeof StoreObject, callback: (value: T) => boolean): T | undefined {
        return this.all<T>().find(callback);
    }

    static filter<T extends StoreObject>(this: {new (...args: any[]): T} & typeof StoreObject, callback: (value: T) => boolean): T[] {
        return this.all<T>().filter(callback);
    }

    // TODO Stores should have configurable indexes from FK ids, for quick filtering
    static filterBy<T extends StoreObject>(this: {new (...args: any[]): T} & typeof StoreObject, filter: Record<string, any>): T[] {
        const entries = Object.entries(filter); // Some minimal caching

        return this.filter<T>((obj: T) => {
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

    static findBy<T extends StoreObject>(this: {new (...args: any[]): T} & typeof StoreObject, filter: Record<string, any>): T | undefined {
        // TODO - need a better implementation with rapid termination
        return this.filterBy<T>(filter)[0];
    }

    static toJSON<T extends StoreObject>(this: {new (...args: any[]): T} & typeof StoreObject): any[] {
        return this.all<T>().map((entry: T) => entry.toJSON());
    }

    static applyCreateOrUpdateEvent<T extends StoreObject>(this: {new (...args: any[]): T} & typeof StoreObject, event: StoreEvent, sendDispatch: boolean = true): T {
        let obj = this.getObjectForEvent<T>(event);

        if (obj) {
            obj.applyEventAndDispatch(event);
        } else {
            obj = new this(event.data, event) as T;
            this.addObject<T>(this.getObjectIdForEvent(event), obj);
            if (sendDispatch) {
                (this as unknown as Dispatchable).dispatch("create", obj, event);
            }
        }
        if (sendDispatch) {
            (this as unknown as Dispatchable).dispatchChange(obj, event);
        }
        return obj;
    }

    static applyDeleteEvent<T extends StoreObject>(this: {new (...args: any[]): T} & typeof StoreObject, event: StoreEvent): T | null {
        const obj = this.getObjectForEvent<T>(event);
        if (obj) {
            this.objects.delete(this.getObjectIdForEvent(event));
            obj.dispatch("delete", event, obj);
            (this as unknown as Dispatchable).dispatch("delete", obj, event);
            (this as unknown as Dispatchable).dispatch("change", obj, event);
        }
        return obj;
    }

    static applyEvent<T extends StoreObject>(this: {new (...args: any[]): T} & typeof StoreObject, event: StoreEvent): T | null {
        event.data = event.data || {};

        if (event.type === "create" || event.type === "createOrUpdate") {
            return this.applyCreateOrUpdateEvent<T>(event);
        }

        if (event.type === "delete") {
            return this.applyDeleteEvent<T>(event);
        }

        // We're in the general case
        const obj = this.getObjectForEvent<T>(event);
        if (!obj) {
            console.error("Missing object of type ", this.objectType, " ", event.objectId);
            return null;
        }

        obj.applyEventAndDispatch(event);

        (this as unknown as Dispatchable).dispatchChange(obj, event); // TODO this is not a store event, but how can we still register for all of these?

        return obj;
    }

    static importState(objects: any[] = []): void {
        for (const obj of objects) {
            this.create(obj);
        }
    }

    static makeEventFromObject(obj: any, eventExtra: any = null): StoreEvent {
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
    static create<T extends StoreObject>(this: {new (...args: any[]): T} & typeof StoreObject, obj: any, eventExtra: any = null, dispatchEvent: boolean = true): T | undefined {
        if (!obj) {
            return;
        }

        const event = this.makeEventFromObject(obj, eventExtra);
        return this.applyCreateOrUpdateEvent<T>(event, dispatchEvent);
    }

    // Add a listener on all object creation events
    // If fakeExisting, will also pass existing objects to your callback
    static addCreateListener(callback: (...args: any[]) => void, fakeExisting?: boolean) {
        if (fakeExisting) {
            for (const obj of this.objects.values()) {
                const event = this.makeEventFromObject(obj);
                callback(obj, event);
            }
        }

        return (this as unknown as Dispatchable).addListener("create", callback);
    }

    // Add a listener for any object deletions
    static addDeleteListener(callback: (...args: any[]) => void) {
        return (this as unknown as Dispatchable).addListener("delete", callback);
    }
}

export function coolStore<T extends new (...args: any[]) => any>(constructor: T): T {
    // Register the store with GlobalState immediately
    GlobalState.addStore(constructor as any);
    return constructor;
}

export function BaseStore(objectType: string, options: StoreOptions = {}): (typeof StoreObject) & Dispatchable {
    const state = options.state || GlobalState

    class Store extends StoreObject {
        static objectType = objectType.toLowerCase();
        static state = state;
        static dependencies = options.dependencies || [];
        static objects = new Map<string, Store>();
    }
    
    // Copy Dispatchable instance properties and methods to the Store class
    const dispatchableInstance = new Dispatchable();
    Object.assign(Store, dispatchableInstance);
    
    // Copy Dispatchable prototype methods and getters/setters to Store
    const dispatchableProto = Dispatchable.prototype;
    Object.getOwnPropertyNames(dispatchableProto).forEach(name => {
        if (name === "constructor") {
            return;
        }
        const descriptor = Object.getOwnPropertyDescriptor(dispatchableProto, name);
        if (descriptor) {
            Object.defineProperty(Store, name, descriptor);
        }
    });

    return Store as any;
}
