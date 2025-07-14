// TODO: this file should be called StoreExtenders
import {unwrapArray, splitInChunks, isString} from "../base/Utils";
import {Ajax} from "../base/Ajax";
import {GlobalState} from "./State";

// Type definitions for StoreMixins
interface FetchJob {
    id: any;
    success: (obj: any) => void;
    error?: (error?: any) => void;
}

interface FetchRequestData {
    ids: any[];
    [key: string]: any;
}

interface FetchRequestObject {
    url: string;
    type?: string;
    dataType: string;
    data: FetchRequestData;
    cache: boolean;
    success: (data: any) => void;
    error: (error: any) => void;
}

type StoreClass = new (...args: any[]) => any;
type StoreObjectClass = new (...args: any[]) => any;

interface AjaxFetchable {
    fetchJobs?: FetchJob[];
    fetchTimeout?: number;
    fetchTimeoutDuration: number;
    fetchURL: string;
    fetchType?: string;
    maxFetchObjectCount?: number;
    objectType: string;
    get(id: any): any;
}

interface VirtualObject {
    id: any;
    hasTemporaryId(): boolean;
    updateId(newId: any): void;
    dispatch(event: string, data?: any): void;
}

interface VirtualStore {
    objects: Map<string, any>;
    addObject(id: any, obj: any): void;
    dispatch(event: string, ...args: any[]): void;
}

// TODO This should be an async method
export const AjaxFetchMixin = <T extends StoreClass>(BaseStoreClass: T) => class AjaxFetchMixin extends BaseStoreClass {
    declare fetchJobs?: FetchJob[];
    declare fetchTimeout?: number;
    declare fetchTimeoutDuration: number;
    declare fetchURL: string;
    declare fetchType?: string;
    declare maxFetchObjectCount?: number;
    declare objectType: string;

    fetch(id: any, successCallback: (obj: any) => void, errorCallback?: (error?: any) => void, forceFetch: boolean = false): void {
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
            }, this.fetchTimeoutDuration);
        }
    };

    getFetchRequestData(ids: any[], fetchJobs: FetchJob[]): FetchRequestData {
        return {
            ids,
        };
    }

    getFetchRequestObject(ids: any[], fetchJobs: FetchJob[]): FetchRequestObject {
        let requestData = this.getFetchRequestData(ids, fetchJobs);

        // TODO: options.fetchURL should also support a function(ids, fetchJobs), do it when needed
        return {
            url: this.fetchURL,
            type: this.fetchType || "GET",
            dataType: "json",
            data: requestData,
            cache: false,
            success: (data: any) => {
                GlobalState.load(data);
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
            error: (error: any) => {
                console.error("Failed to fetch objects of type ", this.objectType, ":\n", error);
                for (let fetchJob of fetchJobs) {
                    if (fetchJob.error) {
                        fetchJob.error(error);
                    }
                }
            }
        };
    }

    //returns an array of ajax requests that have to be executed
    getFetchRequests(fetchJobs: FetchJob[]): FetchRequestObject[] {
        let idFetchJobs = new Map<any, FetchJob[]>();

        for (let fetchJob of fetchJobs) {
            let objectId = fetchJob.id;
            if (!idFetchJobs.has(objectId)) {
                idFetchJobs.set(objectId, []);
            }
            idFetchJobs.get(objectId)!.push(fetchJob);
        }

        let maxChunkSize = this.maxFetchObjectCount || 256;

        let idChunks = splitInChunks(Array.from(idFetchJobs.keys()), maxChunkSize);
        let fetchJobsChunks = splitInChunks(Array.from(idFetchJobs.values()), maxChunkSize);

        let requests: FetchRequestObject[] = [];
        for (let i = 0; i < idChunks.length; i += 1) {
            requests.push(this.getFetchRequestObject(idChunks[i], unwrapArray(fetchJobsChunks[i])));
        }

        return requests;
    }

    executeAjaxFetch(): void {
        let fetchJobs = this.fetchJobs;
        this.fetchJobs = undefined;

        let requests = this.getFetchRequests(fetchJobs!);

        for (let requestObject of requests) {
            Ajax.fetch(requestObject as any);
        }

        clearTimeout(this.fetchTimeout);
        this.fetchTimeout = undefined;
    }

};

export const VirtualStoreObjectMixin = <T extends StoreObjectClass>(BaseStoreObjectClass: T) => class VirtualStoreObjectMixin extends BaseStoreObjectClass {
    declare id: any;

    hasTemporaryId(): boolean {
        return isString(this.id) && this.id.startsWith("temp-");
    }

    // Meant for updating temporary objects that need to exist before being properly created
    updateId(newId: any): void {
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
export const VirtualStoreMixin = <T extends StoreClass>(BaseStoreClass: T) => class VirtualStoreMixin extends BaseStoreClass {
    declare objects: Map<string, any>;
    static virtualIdCounter: number;
    static generateVirtualId(): number {
        if (!this.virtualIdCounter) {
            this.virtualIdCounter = 0;
        }
        this.virtualIdCounter += 1;
        return this.virtualIdCounter;
    }

    generateVirtualId(): number {
        return (this.constructor as typeof VirtualStoreMixin).generateVirtualId();
    }

    // TODO: we probably shouldn't have getVirtualObject take in an event
    getVirtualObject(event: any): any {
        return this.objects.get("temp-" + event.virtualId);
    }

    applyUpdateObjectId(object: VirtualObject, id: any): void {
        if (object.id === id) {
            return;
        }
        let oldId = object.id;
        object.updateId(id);
        this.objects.delete(oldId);
        this.addObject(object.id, object);
        this.dispatch("updateObjectId", object, oldId);
    }

    applyCreateOrUpdateEvent(event: any, sendDispatch: boolean = true): any {
        if (event.virtualId) {
            let existingVirtualObject = this.getVirtualObject(event);
            if (existingVirtualObject) {
                this.applyUpdateObjectId(existingVirtualObject, event.objectId);
            }
        }

        return super.applyCreateOrUpdateEvent(event, sendDispatch);
    }
};
