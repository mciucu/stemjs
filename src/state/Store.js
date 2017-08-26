import {Dispatchable, CleanupJobs} from "../base/Dispatcher";
import {DefaultState} from "./State";

// The store information is kept in a symbol, to not interfere with serialization/deserialization
export const StoreSymbol = Symbol("Store");

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

    getStore() {
        return this[StoreSymbol];
    }

    // By default, applying an event just shallow copies the fields from event.data
    applyEvent(event) {
        Object.assign(this, event.data);
    };

    // Add a listener for all updates, callback will receive the events after they were applied
    addUpdateListener(callback) {
        return this.addListener("update", callback);
    }

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
        if (!this._eventDispatcher) {
            this._eventDispatcher = new Dispatchable();
            this.addUpdateListener((event) => {
                this._eventDispatcher.dispatch(event.type, event, this);
            });
        }
        return this._eventDispatcher.addListener(eventType, callback);
    }

    getStreamName() {
        throw "getStreamName not implemented";
    }

    registerToStream() {
        this.getStore().getState().registerStream(this.getStreamName());
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
class GenericObjectStore extends BaseStore {
    constructor(objectType, ObjectWrapper=StoreObject, options={}) {
        super(...arguments);
        this.objects = new Map();
    }

    has(id) {
        return !!this.get(id);
    }

    get(id) {
        if (id == null) {
            return null;
        }
        return this.objects.get(parseInt(id));
    }

    getObjectIdForEvent(event) {
        return event.objectId || event.data.id;
    }

    getObjectForEvent(event) {
        let objectId = this.getObjectIdForEvent(event);
        return this.get(objectId);
    }

    // TODO: should this default to iterable?
    all(asIterable) {
        let values = this.objects.values();
        if (!asIterable) {
            values = Array.from(values);
        }
        return values;
    }

    createObject(event) {
        const obj = new this.ObjectWrapper(event.data, event, this);
        obj.setStore(this);
        return obj;
    }

    applyCreateEvent(event, sendDispatch=true) {
        let existingObject = this.getObjectForEvent(event);

        if (existingObject) {
            let refreshEvent = Object.assign({}, event);
            refreshEvent.type = "refresh";
            existingObject.applyEvent(refreshEvent);
            existingObject.dispatch("update", event);
            return existingObject;
        } else {
            let newObject = this.createObject(event);
            this.objects.set(this.getObjectIdForEvent(event), newObject);

            if (sendDispatch) {
                this.dispatch("create", newObject, event);
            }
            return newObject;
        }
    }

    applyUpdateOrCreateEvent(event) {
        var obj = this.getObjectForEvent(event);
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
    fakeCreate(obj, eventType="fakeCreate") {
        if (!obj) {
            return;
        }
        var event = {
            objectType: this.objectType,
            objectId: obj.id,
            type: eventType,
            data: obj,
        };
        return this.applyCreateEvent(event);
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

    // Add a listener for any updates to objects in store
    // The callback will receive the object and the event
    addUpdateListener(callback) {
        return this.addListener("update", callback);
    }

    // Add a listener for any object deletions
    addDeleteListener(callback) {
        return this.addListener("delete", callback);
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

    applyEvent(event) {
        Object.assign(this, event.data);
        this.dispatch("update", event, this);
    }

    importState(obj) {
        Object.assign(this, obj);
        this.dispatch("update", event, this);
    }

    addUpdateListener(callback) {
        return this.addListener("update", callback);
    }
}

// Use the same logic as StoreObject when listening to events
SingletonStore.prototype.addEventListener = StoreObject.prototype.addEventListener;

export {StoreObject, BaseStore, GenericObjectStore, SingletonStore};
