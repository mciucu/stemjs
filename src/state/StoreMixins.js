// TODO: this file should be called StoreExtenders
import {unwrapArray, splitInChunks} from "../base/Utils";
import {Ajax} from "../base/Ajax";
import {GlobalState} from "./State";

const AjaxFetchMixin = (BaseStoreClass) => class AjaxFetchMixin extends BaseStoreClass {
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
            error: (error) => {
                console.error("Failed to fetch objects of type ", this.objectType, ":\n", error);
                for (let fetchJob of fetchJobs) {
                    if (fetchJob.error) {
                        fetchJob.error(error);
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

        let idChunks = splitInChunks(Array.from(idFetchJobs.keys()), maxChunkSize);
        let fetchJobsChunks = splitInChunks(Array.from(idFetchJobs.values()), maxChunkSize);

        let requests = [];
        for (let i = 0; i < idChunks.length; i += 1) {
            requests.push(this.getFetchRequestObject(idChunks[i], unwrapArray(fetchJobsChunks[i])))
        }

        return requests;
    }

    executeAjaxFetch() {
        let fetchJobs = this.fetchJobs;
        this.fetchJobs = null;

        let requests = this.getFetchRequests(fetchJobs);

        for (let requestObject of requests) {
            Ajax.fetch(requestObject);
        }

        clearTimeout(this.fetchTimeout);
        this.fetchTimeout = null;
    };

};

const VirtualStoreObjectMixin = (BaseStoreObjectClass) => class VirtualStoreObjectMixin extends BaseStoreObjectClass {
    hasTemporaryId() {
        return (typeof this.id === "string" || this.id instanceof String) && this.id.startsWith("temp-");
    }

    // Meant for updating temporary objects that need to exist before being properly created
    updateId(newId) {
            if (this.id == newId) {
                return;
            }
            let oldId = this.id;
            if (!this.hasTemporaryId()) {
                console.error("This is only meant to replace temporary ids!");
            }
            this.id = newId;
            this.dispatch("updateId", {oldId: oldId});
        }
};

// TODO: there's still a bug in this class when not properly matching virtual obj sometimes I think
const VirtualStoreMixin = (BaseStoreClass) => class VirtualStoreMixin extends BaseStoreClass {
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

    applyUpdateObjectId(object, id) {
        if (object.id === id) {
            return;
        }
        let oldId = object.id;
        object.updateId(id);
        this.objects.delete(oldId);
        this.objects.set(object.id, object);
        this.dispatch("updateObjectId", object, oldId);
    }

    applyCreateEvent(event, sendDispatch=true) {
        if (event.virtualId) {
            let existingVirtualObject = this.getVirtualObject(event);
            if (existingVirtualObject) {
                this.applyUpdateObjectId(existingVirtualObject, event.objectId);
            }
        }

        return super.applyCreateEvent(...arguments);
    }
};

export {AjaxFetchMixin, VirtualStoreMixin, VirtualStoreObjectMixin};
