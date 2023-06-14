import {Dispatchable, CleanupJobs} from "../base/Dispatcher";
import {GlobalState} from "./State";

// The store information is kept in a symbol, to not interfere with serialization/deserialization
export const StoreSymbol = Symbol("Store");
export const EventDispatcherSymbol = Symbol("EventDispatcher");

export class StoreObject extends Dispatchable {
    constructor(obj, event) {
        super();
        Object.assign(this, obj);
    }

    static makeFieldLoader(fieldDescriptor) {
        fieldDescriptor.cacheField = false;
        fieldDescriptor.rawField = fieldDescriptor.rawField || (key => key + "Id");

        return (value, obj) => {
            const store = obj.getStore(this[StoreSymbol].objectType);
            return store.get(value);
        }
    }

    setStore(store) {
        this[StoreSymbol] = store;
    }

    getStore(storeName) {
        const ownStore = this[StoreSymbol];
        if (storeName) {
            return ownStore.getState().getStore(storeName);
        }
        return ownStore;
    }

    // By default, applying an event just shallow copies the fields from event.data
    applyEvent(event) {
        Object.assign(this, event.data);
    }

    applyEventAndDispatch(event) {
        this.applyEvent(event);
        this.dispatchChange(event);
    }

    addDeleteListener(callback) {
        return this.addListener("delete", callback);
    }

    // Add a listener on updates from events with this specific type.
    // Can accept an array as eventType
    addEventListener(eventType, callback) {
        if (Array.isArray(eventType)) {
            const handlers = eventType.map(e => this.addEventListener(e, callback));
            return new CleanupJobs(handlers);
        }
        // Ensure the private event dispatcher exists
        if (!this[EventDispatcherSymbol]) {
            this[EventDispatcherSymbol] = new Dispatchable();
            this.addChangeListener((event) => {
                this[EventDispatcherSymbol].dispatch(event.type, event, this);
            });
        }
        return this[EventDispatcherSymbol].addListener(eventType, callback);
    }

    toJSON() {
        const obj = {};
        for (const key in this) {
            if (this.hasOwnProperty(key)) {
                obj[key] = this[key];
            }
        }
        return obj;
    }
}

export class BaseStore extends Dispatchable {
    constructor(objectType, ObjectClass=StoreObject, options={}) {
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

    loadRaw(responseOrState) {
        const state = responseOrState?.state || responseOrState || {};

        // Since the backend might have a different lettering case, need a more complex search here
        for (const [key, value] of Object.entries(state)) {
            if (String(key).toLowerCase() === this.objectType) {
                return value || [];
            }
        }

        return [];
    }

    // For a response/state raw object, return the objects that we have in store
    load(responseOrState) {
        const rawObjects = this.loadRaw(responseOrState);
        return rawObjects.map(obj => this.get(obj.id));
    }

    loadObject(responseOrState, index = 0) {
        return this.load(responseOrState)?.[index];
    }

    getState() {
        return this.state;
    }
}

// Store type primarily intended to store objects that come from a server DB, and have a unique numeric .id field
// TODO: do we ever decouple this from BaseStore? Maybe merge.
export class GenericObjectStore extends BaseStore {
    objects = new Map();

    get(id) {
        if (id == null) {
            return null;
        }
        return this.objects.get(String(id));
    }

    addObject(id, obj) {
        this.objects.set(String(id), obj);
    }

    clear() {
        this.objects.clear();
        this.dispatch("change", null, null);
    }

    getObjectIdForEvent(event) {
        return String(event.objectId || event.data.id);
    }

    getObjectForEvent(event) {
        let objectId = this.getObjectIdForEvent(event);
        return this.get(objectId);
    }

    all(asIterable) {
        let values = this.objects.values();
        if (!asIterable) {
            values = Array.from(values);
        }
        return values;
    }

    find(callback) {
        return this.all().find(callback);
    }

    filter(callback) {
        return this.all().filter(callback);
    }

    // TODO Stores should have configurable indexes from FK ids, for quick filtering
    filterBy(filter) {
        const entries = Object.entries(filter); // Some minimal caching

        return this.filter(obj => {
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
        })
    }

    findBy(filter) {
        // TODO - need a better implementation with rapid termination
        return this.filterBy(filter)[0];
    }

    toJSON() {
        return this.all().map(entry => entry.toJSON());
    }

    applyCreateOrUpdateEvent(event, sendDispatch=true) {
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

    applyDeleteEvent(event) {
        const obj = this.getObjectForEvent(event);
        if (obj) {
            this.objects.delete(this.getObjectIdForEvent(event));
            obj.dispatch("delete", event, obj);
            this.dispatch("delete", obj, event);
            this.dispatch("change", obj, event);
        }
        return obj;
    }

    applyEvent(event) {
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

    importState(objects = []) {
        for (const obj of objects) {
            this.create(obj);
        }
    }

    makeEventFromObject(obj, eventExtra=null) {
        return {
            isFake: true,
            type: "create",
            objectType: this.objectType,
            objectId: obj.id,
            data: obj,
            ...eventExtra,
        }
    }

    // Create a fake creation event, to insert the raw object
    create(obj, eventExtra=null, dispatchEvent=true) {
        if (!obj) {
            return;
        }

        const event = this.makeEventFromObject(obj, eventExtra);
        return this.applyCreateOrUpdateEvent(event, dispatchEvent);
    }

    // Add a listener on all object creation events
    // If fakeExisting, will also pass existing objects to your callback
    addCreateListener(callback, fakeExisting) {
        if (fakeExisting) {
            for (const obj of this.objects.values()) {
                const event = this.makeEventFromObject(obj);
                callback(obj, event);
            }
        }

        return this.addListener("create", callback);
    }

    // Add a listener for any object deletions
    addDeleteListener(callback) {
        return this.addListener("delete", callback);
    }
}

export class SingletonStore extends BaseStore {
    constructor(objectType, options={}) {
        super(objectType, SingletonStore, options);
    }

    get() {
        return this;
    }

    all() {
        return [this];
    }

    toJSON() {
        return JSON.stringify([this]);
    }

    applyEvent(event) {
        Object.assign(this, event.data);
        this.dispatchChange(event);
    }

    importState(obj) {
        Object.assign(this, obj);
        this.dispatchChange(obj);
    }

    // Use the same logic as StoreObject when listening to events
    addEventListener = StoreObject.prototype.addEventListener.bind(this);
}

export const Store = (objectType, ObjectClass, options={}) => class Store extends GenericObjectStore {
    constructor() {
        super(objectType, ObjectClass, options);
    }
};

export function MakeStore(...args) {
    const Cls = Store(...args);
    return new Cls();
}


// Experimental, to allow the store to also have the store methods be available on the object class
export function registerStore(objectType, options={dependencies: []}) {
    return (Cls) => {
        const store = MakeStore(objectType, Cls, options);

        Cls.store = store;
        Cls.objectType = objectType;

        const proxy = new Proxy(Cls, {
            get(target, key) {
                if (key in target) {
                    return target[key];
                } else {
                    return store[key];
                }
            }
        });

        store.ObjectClass = proxy;

        return proxy;
    }
}
