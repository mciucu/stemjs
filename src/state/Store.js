import {Dispatchable, CleanupJobs} from "../base/Dispatcher";
import {DefaultState} from "./State";

// The store information is kept in a symbol, to not interfere with serialization/deserialization
export const StoreSymbol = Symbol("Store");
export const EventDispatcherSymbol = Symbol("EventDispatcher");

class StoreObject extends Dispatchable {
    constructor(obj, event, store) {
        super();
        Object.assign(this, obj);
        this.setStore(store);
    };

    static getStoreName() {
        return this.name;
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
    };

    addDeleteListener(callback) {
        return this.addListener("delete", callback);
    }

    // Add a listener on updates from events with this specific type.
    // Can accept an array as eventType
    // Returns an object that implements the Cleanup interface.
    addEventListener(eventType, callback) {
        if (Array.isArray(eventType)) {
            const handlers = eventType.map(e => this.addEventListener(e, callback));
            return new CleanupJobs(handlers);
        }
        // Ensure the private event dispatcher exists
        if (!this[EventDispatcherSymbol]) {
            this[EventDispatcherSymbol] = new Dispatchable();
            this.addUpdateListener((event) => {
                this[EventDispatcherSymbol].dispatch(event.type, event, this);
            });
        }
        return this[EventDispatcherSymbol].addListener(eventType, callback);
    }

    getStreamName() {
        throw "getStreamName not implemented";
    }

    // TODO: this should not be here by default
    registerToStream() {
        this.getStore().getState().registerStream(this.getStreamName());
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

class BaseStore extends Dispatchable {
    constructor(objectType, ObjectWrapper=StoreObject, options={}) {
        super();
        this.options = options;
        this.objectType = objectType.toLowerCase();
        this.ObjectWrapper = ObjectWrapper;
        this.attachToState();
    }

    getObjectType() {
        return this.objectType;
    }

    // For a response obj with a state field, return the objects that we have in store
    loadFromResponse(response) {
        const responseState = response?.state || {};

        // Since the backend might have a different lettering case, need a more complex search here
        for (const [key, value] of Object.entries(responseState)) {
            if (String(key).toLowerCase() === this.getObjectType()) {
                return value.map(obj => this.get(obj.id));
            }
        }

        return [];
    }

    loadObjectFromResponse(response, index = 0) {
        return this.loadFromResponse(response)?.[index];
    }

    attachToState() {
        if (this.getState()) {
            this.getState().addStore(this);
        }
    }

    getState() {
        // Allow explicit no state
        if (this.options.hasOwnProperty("state")) {
            return this.options.state;
        } else {
            return DefaultState;
        }
    }

    // Is used by the state object to see which stores need to be loaded first
    getDependencies() {
        return this.options.dependencies || [];
    }
}

// Store type primarily intended to store objects that come from a server DB, and have a unique numeric .id field
// TODO: do we ever decouple this from BaseStore? Maybe merge.
class GenericObjectStore extends BaseStore {
    objects = new Map();

    has(id) {
        return !!this.get(id);
    }

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
        this.dispatch("update", null, null);
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

    filterBy(filter) {
        const entries = Object.entries(filter); // Some minimal caching

        return this.filter(obj => {
            for (const [key, value] of entries) {
                if (obj[key] != value) {
                    return false;
                }
            }
            return true;
        })
    }

    toJSON() {
        return this.all().map(entry => entry.toJSON());
    }

    createObject(event) {
        const obj = new this.ObjectWrapper(event.data, event, this);
        obj.setStore(this);
        return obj;
    }

    applyCreateEvent(event, sendDispatch=true) {
        let obj = this.getObjectForEvent(event);
        let dispatchType = "create";

        if (obj) {
            let refreshEvent = Object.assign({}, event);
            dispatchType = "update";
            refreshEvent.type = "refresh";
            obj.applyEvent(refreshEvent);
            obj.dispatch("update", event);
        } else {
            obj = this.createObject(event);
            this.addObject(this.getObjectIdForEvent(event), obj);
        }
        if (sendDispatch) {
            this.dispatch(dispatchType, obj, event);
        }
        return obj;
    }

    applyUpdateOrCreateEvent(event) {
        let obj = this.getObjectForEvent(event);
        if (!obj) {
            obj = this.applyCreateEvent(event, false);
            this.dispatch("create", obj, event);
        } else {
            this.applyEventToObject(obj, event);
        }
        this.dispatch("updateOrCreate", obj, event);
        return obj;
    }

    applyDeleteEvent(event) {
        let objDeleted = this.getObjectForEvent(event);
        if (objDeleted) {
            this.objects.delete(this.getObjectIdForEvent(event));
            objDeleted.dispatch("delete", event, objDeleted);
            this.dispatch("delete", objDeleted, event);
        }
        return objDeleted;
    }

    applyEventToObject(obj, event) {
        obj.applyEvent(event);
        obj.dispatch("update", event);
        this.dispatch("update", obj, event);
        return obj;
    }

    applyEvent(event) {
        event.data = event.data || {};

        if (event.type === "create") {
            return this.applyCreateEvent(event);
        } else if (event.type === "delete") {
            return this.applyDeleteEvent(event);
        } else if (event.type === "updateOrCreate") {
            return this.applyUpdateOrCreateEvent(event);
        } else {
            var obj = this.getObjectForEvent(event);
            if (!obj) {
                console.error("I don't have object of type ", this.objectType, " ", event.objectId);
                return;
            }
            return this.applyEventToObject(obj, event);
        }
    }

    importState(objects) {
        objects = objects || [];
        for (let obj of objects) {
            this.fakeCreate(obj);
        }
    }

    // Create a fake creation event, to insert the raw object
    fakeCreate(obj, eventType="fakeCreate", dispatchEvent=true) {
        if (!obj) {
            return;
        }

        let event = {
            objectType: this.objectType,
            objectId: obj.id,
            type: eventType,
            data: obj,
        };

        return this.applyCreateEvent(event, dispatchEvent);
    }

    // Add a listener on all object creation events
    // If fakeExisting, will also pass existing objects to your callback
    addCreateListener(callback, fakeExisting) {
        if (fakeExisting) {
            for (let object of this.objects.values()) {
                let event = {
                    objectType: this.objectType,
                    objectId: object.id,
                    type: "fakeCreate",
                    data: object,
                };
                callback(object, event);
            }
        }

        return this.addListener("create", callback);
    }

    // Add a listener for any object deletions
    addDeleteListener(callback) {
        return this.addListener("delete", callback);
    }

    addChangeListener(callback) {
        return this.addListener(["create", "update", "delete"], callback);
    }
}

class SingletonStore extends BaseStore {
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
        this.dispatch("update", event, this);
    }

    importState(obj) {
        Object.assign(this, obj);
        this.dispatch("update", obj, this);
    }

    // Use the same logic as StoreObject when listening to events
    addEventListener = StoreObject.prototype.addEventListener.bind(this);
}

const Store = (objectType, ObjectWrapper, options={}) => class Store extends GenericObjectStore {
    constructor() {
        super(objectType, ObjectWrapper, options);
    }
};

export function MakeStore(...args) {
    const Cls = Store(...args);
    return new Cls();
}

export {StoreObject, BaseStore, GenericObjectStore, SingletonStore, Store};
