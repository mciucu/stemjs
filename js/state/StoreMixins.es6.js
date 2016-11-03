import * as Utils from "Utils";
import {Ajax} from "Ajax";
import {Cleanable} from "Dispatcher";
import {StoreObject, BaseStore} from "GlobalState";

// TODO: should this be in another file?
// TODO: this should extend BaseStore, and copy the methods from StoreObject
class SingletonStore extends StoreObject {
    constructor(objectType, options={}) {
        super();
        this.objectType = objectType;
        this.options = options;
        if (this.getState()) {
            this.getState().addStore(this);
        }
    }

    get() {
        return this;
    }

    all() {
        return [this];
    }

    getState() {
        // Allow explicit no state
        if (this.options.hasOwnProperty("state")) {
            return this.options.state;
        } else {
            return GlobalState;
        }
    }

    getDependencies() {
        return this.options.dependencies || [];
    }

    applyEvent(event) {
        this.update(event);
    }

    fakeCreate(obj) {
        Object.assign(this, obj);
    }
}

function AjaxFetchMixin(BaseStoreClass) {
    return class AjaxFetchMixin extends BaseStoreClass {
        fetch(id, successCallback, errorCallback, forceFetch=false) {
            if (!forceFetch) {
                let obj = this.get(id);
                if (obj) {
                    successCallback(obj);
                    return;
                }
            }
            if (!this.fetchJobs) {
                this.fetchJobs = [];
            }
            this.fetchJobs.push({id: id, success: successCallback, error: errorCallback});
            if (!this.fetchTimeout) {
                this.fetchTimeout = setTimeout(() => {
                    this.executeAjaxFetch();
                }, this.options.fetchTimeoutDuration || 0);
            }
        };

        getFetchRequestData(ids, fetchJobs) {
            return {
                ids: ids,
            };
        }

        getFetchRequestObject(ids, fetchJobs) {
            let requestData = this.getFetchRequestData(ids, fetchJobs);

            // TODO: options.fetchURL should also support a function(ids, fetchJobs), do it when needed
            return {
                url: this.options.fetchURL,
                type: this.options.fetchType || "GET",
                dataType: "json",
                data: requestData,
                cache: false,
                success: (data) => {
                    if (data.error) {
                        console.error("Failed to fetch objects of type ", this.objectType, ":\n", data.error);
                        for (let fetchJob of fetchJobs) {
                            if (fetchJob.error) {
                                fetchJob.error(data.error);
                            }
                        }
                        return;
                    }
                    GlobalState.importState(data.state || {});
                    for (let fetchJob of fetchJobs) {
                        let obj = this.get(fetchJob.id);
                        if (obj) {
                            fetchJob.success(obj);
                        } else {
                            console.error("Failed to fetch object ", fetchJob.id, " of type ", this.objectType);
                            if (fetchJob.error) {
                                fetchJob.error();
                            }
                        }
                    }
                },
                error: (xhr, errmsg, err) => {
                    console.error("Error in fetching objects:\n" + xhr.status + ":\n" + xhr.responseText);
                    for (let fetchJob of fetchJobs) {
                        if (fetchJob.error) {
                            fetchJob.error("Network error");
                        }
                    }
                }
            }
        }

        //returns an array of ajax requests that have to be executed
        getFetchRequests(fetchJobs) {
            let idFetchJobs = new Map();

            for (let fetchJob of fetchJobs) {
                let objectId = fetchJob.id;
                if (!idFetchJobs.has(objectId)) {
                    idFetchJobs.set(objectId, new Array());
                }
                idFetchJobs.get(objectId).push(fetchJob);
            }

            let maxChunkSize = this.options.maxFetchObjectCount || 256;

            let idChunks = Utils.splitInChunks(Array.from(idFetchJobs.keys()), maxChunkSize);
            let fetchJobsChunks = Utils.splitInChunks(Array.from(idFetchJobs.values()), maxChunkSize);

            let requests = [];
            for (let i = 0; i < idChunks.length; i += 1) {
                requests.push(this.getFetchRequestObject(idChunks[i], Utils.unwrapArray(fetchJobsChunks[i])))
            }

            return requests;
        }

        executeAjaxFetch() {
            let fetchJobs = this.fetchJobs;
            this.fetchJobs = null;

            let requests = this.getFetchRequests(fetchJobs);

            for (let requestObject of requests) {
                Ajax.request(requestObject);
            }

            clearTimeout(this.fetchTimeout);
            this.fetchTimeout = null;
        };

    }
}

function VirtualStoreObjectMixin(BaseStoreObjectClass) {
    return class VirtualStoreObjectMixin extends BaseStoreObjectClass {
        // TOOD: both of these methods should probaly be implemented in a mixin class (in StoreMixins.js)
        hasTemporaryId() {
            return (typeof this.id === "string" || this.id instanceof String) && this.id.startsWith("temp-");
        }

        // Meant for updating temporary objects that need to exist before being properly created
        updateId(newId) {
            if (this.id == newId) {
                return;
            }
            let oldId = this.id;
            if (!this.id.startsWith("temp-")) {
                console.error("This is only meant to replace temporary ids!");
            }
            let store = this.constructor.store;
            //TODO: should not access members of store direcly, use a method
            store.objects.delete(this.id);
            this.id = newId;
            store.objects.set(this.id, this);
            store.dispatch("updateObjectId", this, oldId);
            this.dispatch("updateId", {oldId: oldId});
        }
    }
}

function VirtualStoreMixin(BaseStoreClass) {
    return class VirtualStoreMixin extends BaseStoreClass {
        static generateVirtualId() {
            if (!this.virtualIdCounter) {
                this.virtualIdCounter = 0;
            }
            this.virtualIdCounter += 1;
            return this.virtualIdCounter;
        }

        generateVirtualId() {
            return this.constructor.generateVirtualId();
        }

        // TODO: we probably shouldn't have getVirtualObject take in an event
        getVirtualObject(event) {
            return this.objects.get("temp-" + event.virtualId);
        }

        get(id) {
            return this.objects.get(id);
        }

        applyUpdateObjectId(object, event) {
            object.updateId(event.objectId);
        }

        applyCreateEvent(event, sendDispatch=true) {
            if (event.virtualId) {
                let existingVirtualObject = this.getVirtualObject(event);
                if (existingVirtualObject) {
                    this.applyUpdateObjectId(existingVirtualObject, event);
                }
            }

            return super.applyCreateEvent(...arguments);
        }
    }
}

// TODO: not sure if the pattern used by the next class is good
// Mixin class meant for easier adding listeners to store objects, while also adding those listeners to cleanup jobs
// Should probably be used by UI elements that want to add listeners to store objects
function StoreObjectSubscribable(BaseClass) {
    // TODO: is this the best way to ensure Cleanable inheritance?
    if (!(BaseClass instanceof Cleanable)) {
        BaseClass = Cleanable(BaseClass);
    }
    class StoreObjectSubscribable extends BaseClass {
        setStoreObject(obj) {
            if (this.storeObject) {
                console.error("You already have a store object: ", this.storeObject, " and want to set it to ", obj);
            }
            this.storeObject = obj;
        }

        getStoreObject() {
            if (!this.storeObject) {
                console.error("You need to specify either a callback or call setStoreObject before");
            }
            return this.storeObject;
        }

        addListener(obj, eventName, callback) {
            if (!callback) {
                callback = eventName;
                eventName = obj;
                obj = this.getStoreObject();
            }
            this.addCleanupTask(obj.addListener(eventName, callback));
        }

        addUpdateListener(obj, callback) {
            if (!callback) {
                callback = obj;
                obj = this.getStoreObject();
            }
            this.addCleanupTask(obj.addUpdateListener(callback));
        }

        addEventListener(obj, eventType, callback) {
            if (!callback) {
                callback = eventType;
                eventType = obj;
                obj = this.getStoreObject();
            }
            this.addCleanupTask(obj.addEventListener(eventType, callback));
        }
    }
    
    return StoreObjectSubscribable;
}

export {AjaxFetchMixin, VirtualStoreMixin, VirtualStoreObjectMixin, StoreObjectSubscribable, SingletonStore};
