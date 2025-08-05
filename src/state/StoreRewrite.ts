import {CleanupJobs, Dispatchable} from "../base/Dispatcher";
import {GlobalState, RawStateData, State, StateData, StoreEvent, StoreId} from "./State";
import {toArray} from "../base/Utils";

interface FieldDescriptor {
    cacheField?: boolean;
    rawField?: string | ((key: string) => string);
    [key: string]: any;
}

export interface StoreOptions {
    state?: State;
    dependencies?: string[]; // Other stores that should have their objects loaded before this
}

// The store information is kept in a symbol, to not interfere with serialization/deserialization
export const StoreSymbol = Symbol("Store");
export const EventDispatcherSymbol = Symbol("EventDispatcher");

export class StoreObject extends Dispatchable {
    declare [EventDispatcherSymbol]?: Dispatchable;
    declare id: StoreId;

    constructor(obj: any, event?: StoreEvent) {
        super();
        Object.assign(this, obj);
    }

    getStore(storeName?: string): typeof StoreObject {
        const ownStore = this.constructor as typeof StoreObject;
        if (storeName) {
            return ownStore.getState().getStore(storeName) as typeof StoreObject;
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

// STATIC BEGIN
    static objectType: string;
    static state: State = GlobalState;
    static dependencies: string[] = [];
    static objects = new Map<string, StoreObject>();

    static makeFieldLoader(fieldDescriptor: FieldDescriptor): (value: any, obj: any) => any {
        fieldDescriptor.cacheField = false;
        fieldDescriptor.rawField = fieldDescriptor.rawField || (key => key + "Id");

        return (value: any, obj: any) => {
            const store = obj.getStore(this[StoreSymbol].objectType);
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
        const rawObjects = (this as typeof StoreObject).loadRaw(responseOrState);
        return rawObjects.map(obj => (this as typeof StoreObject).get<BaseType>(obj.id)).filter(Boolean) as BaseType[];
    }

    static loadObject<BaseType extends StoreObject>(this: typeof StoreObject & {new (...args: any[]): BaseType}, responseOrState: StateData): BaseType | undefined {
        return this.load<BaseType>(responseOrState)?.[0];
    }

    static getState(): State {
        return this.state;
    }

    static get<T extends StoreObject>(this: typeof StoreObject, id: StoreId): T | undefined {
        if (id == null) {
            return;
        }
        return this.objects.get(String(id)) as any;
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

    static getObjectForEvent(event: StoreEvent): T | null {
        let objectId = this.getObjectIdForEvent(event);
        return this.get(objectId);
    }

    static values(): IterableIterator<T> {
        return this.objects.values();
    }

    static all(): T[] {
        const values = this.objects.values();
        return Array.from(values);
    }

    static find(callback: (value: T) => boolean): T | undefined {
        return this.all().find(callback);
    }

    static filter(callback: (value: T) => boolean): T[] {
        return this.all().filter(callback);
    }

    // TODO Stores should have configurable indexes from FK ids, for quick filtering
    static filterBy(filter: Record<string, any>): T[] {
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

    static findBy(filter: Record<string, any>): T | undefined {
        // TODO - need a better implementation with rapid termination
        return this.filterBy(filter)[0];
    }

    static toJSON(): any[] {
        return this.all().map((entry: T) => entry.toJSON());
    }

    static applyCreateOrUpdateEvent(event: StoreEvent, sendDispatch: boolean = true): T {
        let obj = this.getObjectForEvent(event);

        if (obj) {
            obj.applyEventAndDispatch(event);
        } else {
            const objectData = {
                ...event.data,
                [StoreSymbol]: this,  // We'll need to have to access loaders in the constructor
            }
            obj = new this(objectData, event, this) as T;
            this.addObject(this.getObjectIdForEvent(event), obj);
            if (sendDispatch) {
                (this as unknown as Dispatchable).dispatch("create", obj, event);
            }
        }
        if (sendDispatch) {
            (this as unknown as Dispatchable).dispatchChange(obj, event);
        }
        return obj;
    }

    static applyDeleteEvent(event: StoreEvent): T | null {
        const obj = this.getObjectForEvent(event);
        if (obj) {
            this.objects.delete(this.getObjectIdForEvent(event));
            obj.dispatch("delete", event, obj);
            (this as unknown as Dispatchable).dispatch("delete", obj, event);
            (this as unknown as Dispatchable).dispatch("change", obj, event);
        }
        return obj;
    }

    static applyEvent(event: StoreEvent): T | null {
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
    static create(obj: any, eventExtra: any = null, dispatchEvent: boolean = true): T | undefined {
        if (!obj) {
            return;
        }

        const event = this.makeEventFromObject(obj, eventExtra);
        return this.applyCreateOrUpdateEvent(event, dispatchEvent);
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

export function MakeCoolStore(objectType: string, options: StoreOptions = {}): (typeof StoreObject) & Dispatchable {
    class Store extends StoreObject {
        static objectType = objectType;
        static state = options.state || GlobalState;
        static dependencies = options.dependencies || [];
        static objects = new Map<string, Store>();
    }
    Object.assign(Store, new Dispatchable());
    return Store as any;
}
