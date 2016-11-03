// TODO: may be better to split this file
import {Dispatchable, CleanupJobs} from "Dispatcher";

class GlobalStateClass extends Dispatchable {
    constructor() {
        super();
        this.stores = new Map();
        // TODO: applyEvent should have a bind decorator instead of this
        this.applyEventWrapper = (event) => {
            this.applyEvent(event);
        }
    }

    getStore(objectType) {
        objectType = objectType.toLowerCase();
        return this.stores.get(objectType);
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
        if (Array.isArray(event)) {
            for (let individualEvent of event) {
                this.applyEvent(individualEvent);
            }
            return;
        }
        if (!event.hasOwnProperty("objectType")) {
            console.error("GlobalState: Event does not contain 'objectType' property: ", event);
            return;
        }
        let store = this.getStore(event.objectType);
        if (store) {
            return store.applyEvent(event);
        } else {
            console.log("GlobalState: Missing store for event: ", event);
        }
    }

    // TODO: should just pass the other arguments after object type to the store get
    get(objectType, objectId) {
        let store = this.getStore(objectType);
        if (store) {
            return store.get(objectId);
        } else {
            console.error("GlobalState: Can't find store ", objectType);
            return null;
        }
    }

    // TODO: this logic is a bit messy, does a topological sort of dependencies (consider merging next 2 methods)
    importStateAndRemove(objectType, stateMap) {
        let objects = stateMap.get(objectType);
        stateMap.delete(objectType);

        let store = this.getStore(objectType);

        if (!store) {
            console.error("GlobalState: Can't find store ", objectType);
            return;
        }
        for (let dependency of store.getDependencies()) {
            this.importStateAndRemove(dependency.toLowerCase(), stateMap);
        }
        objects = objects || [];
        for (let object of objects) {
            // TODO: this makes the assumption that a store should implement fakeCreate, not sure if it should
            store.fakeCreate(object);
        }
    }

    importState(state) {
        let stateMap = new Map();
        for (let objectType in state) {
            stateMap.set(objectType.toLowerCase(), state[objectType]);
        }
        while (stateMap.size > 0) {
            let allKeys = stateMap.keys();
            let objectType = allKeys.next().value;
            this.importStateAndRemove(objectType, stateMap);
        }
    }
}

class StoreObject extends Dispatchable {
    constructor(obj) {
        super();
        Object.assign(this, obj);
    };

    // By default, applying an event just shallow copies the fields from event.data
    update(event) {
        Object.assign(this, event.data);
    };

    // Add a listener for all updates, callback will receive the events after they were applied
    addUpdateListener(callback) {
        return this.addListener("update", callback);
    }

    // Add a listener on updated from events with this specific type.
    // Can accept an array as eventType
    // Returns an object that implements the Cleanup interface.
    addEventListener(eventType, callback) {
        if (Array.isArray(eventType)) {
            // let jobs = eventType.map(type => this.addEventListener(type, callback));
            // return new CleanupJobs(jobs);

            let cleanupJobs = new CleanupJobs();
            for (let type of eventType) {
                cleanupJobs.add(this.addEventListener(type, callback));
            }
            return cleanupJobs;
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
            return GlobalState;
        }
    }

    // Is used by the state object to see which stores need to be loaded first
    getDependencies() {
        return this.options.dependencies || [];
    }

    // These methods should be implemented when inheriting (abstract)
    fakeCreate(obj) {}
}

class GenericObjectStore extends BaseStore {
    constructor(objectType, ObjectWrapper=StoreObject, options={}) {
        super(...arguments);
        this.objects = new Map();
    }

    has(id) {
        return !!this.get(id);
    }

    get(id) {
        if (!id) {
            return null;
        }
        return this.objects.get(parseInt(id));
    }

    all(asIterable) {
        let values = this.objects.values();
        if (!asIterable) {
            values = Array.from(values);
        }
        return values;
    }

    createObject(event) {
        return new this.ObjectWrapper(event.data, event);
    }

    applyCreateEvent(event, sendDispatch=true) {
        let existingObject = this.get(event.objectId);

        if (existingObject) {
            let refreshEvent = Object.assign({}, event);
            refreshEvent.type = "refresh";
            existingObject.update(refreshEvent);
            existingObject.dispatch("update", event);
            return existingObject;
        } else {
            let newObject = this.createObject(event);
            this.objects.set(event.objectId, newObject);

            if (sendDispatch) {
                this.dispatch("create", newObject, event);
            }
            return newObject;
        }
    }

    applyUpdateOrCreateEvent(event) {
        var obj = this.get(event.objectId);
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
        let objDeleted = this.objects.delete(event.objectId);
        objDeleted.dispatch("delete", event, objDeleted);
        this.dispatch("delete", objDeleted, event);
        return objDeleted;
    }

    applyEventToObject(obj, event) {
        obj.update(event);
        obj.dispatch("update", event);
        this.dispatch("update", obj, event);
        return obj;
    }

    applyEvent(event) {
        if (event.type === "create") {
            return this.applyCreateEvent(event);
        } else if (event.type === "delete") {
            return this.applyDeleteEvent(event);
        } else if (event.type === "updateOrCreate") {
            return this.applyUpdateOrCreateEvent(event);
        } else {
            var obj = this.get(event.objectId);
            if (!obj) {
                console.error("I don't have object of type ", this.objectType, " ", event.objectId);
                return;
            }
            return this.applyEventToObject(obj, event);
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

var GlobalState = new GlobalStateClass();

if (window) {
    window.GlobalState = GlobalState;
}

export {GlobalStateClass, GlobalState, StoreObject, GenericObjectStore, BaseStore};
