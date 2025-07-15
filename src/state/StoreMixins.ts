// TODO: this file should be called StoreExtenders
import {unwrapArray, splitInChunks, isString} from "../base/Utils";
import {Ajax} from "../base/Ajax";
import {GlobalState, StoreId} from "./State";
import {FetchOptions, URLFetchOptions} from "../base/Fetch";

// Type definitions for StoreMixins
interface FetchJob {
    id: StoreId;
    success: (obj: any) => void;
    error?: (error?: any) => void;
}

interface FetchRequestData {
    ids: StoreId[];
    [key: string]: any;
}

type StoreClass = new (...args: any[]) => any;
type StoreObjectClass = new (...args: any[]) => any;

interface VirtualObject {
    id: StoreId;
    hasTemporaryId(): boolean;
    updateId(newId: StoreId): void;
    dispatch(event: string, data?: any): void;
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

    fetch(id: StoreId, successCallback: (obj: any) => void, errorCallback?: (error?: any) => void, forceFetch: boolean = false): void {
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

    getFetchRequestData(entries: [StoreId, FetchJob[]][]): FetchRequestData {
        return {
            ids: entries.map(entry => entry[0])
        };
    }

    getFetchRequestObject(entries: [StoreId, FetchJob[]][]): URLFetchOptions {
        const requestData = this.getFetchRequestData(entries);
        const fetchJobs: FetchJob[] = unwrapArray(entries.map(entry => entry[1]));

        // TODO: options.fetchURL should also support a function(ids, fetchJobs), do it when needed
        return {
            url: this.fetchURL,
            type: this.fetchType || "GET",
            dataType: "json",
            data: requestData,
            cache: "no-cache",
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
    getFetchRequests(fetchJobs: FetchJob[]): URLFetchOptions[] {
        const idFetchJobs = new Map<StoreId, FetchJob[]>();

        for (const fetchJob of fetchJobs) {
            let objectId = fetchJob.id;
            if (!idFetchJobs.has(objectId)) {
                idFetchJobs.set(objectId, []);
            }
            idFetchJobs.get(objectId)!.push(fetchJob);
        }

        const maxChunkSize = this.maxFetchObjectCount || 256;

        const fetchChunks = splitInChunks(Array.from(idFetchJobs.entries()), maxChunkSize);

        return fetchChunks.map((chunkEntries) => this.getFetchRequestObject(chunkEntries));
    }

    executeAjaxFetch(): void {
        const fetchJobs = this.fetchJobs;
        delete this.fetchJobs;

        const requests = this.getFetchRequests(fetchJobs!);

        for (const requestObject of requests) {
            Ajax.fetch(requestObject);
        }

        clearTimeout(this.fetchTimeout);
        this.fetchTimeout = undefined;
    }

};

export const VirtualStoreObjectMixin = <T extends StoreObjectClass>(BaseStoreObjectClass: T) => class VirtualStoreObjectMixin extends BaseStoreObjectClass {
    declare id: StoreId;

    hasTemporaryId(): boolean {
        return isString(this.id) && this.id.startsWith("temp-");
    }

    // Meant for updating temporary objects that need to exist before being properly created
    updateId(newId: StoreId): void {
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

    applyUpdateObjectId(object: VirtualObject, id: string): void {
        if (object.id === id) {
            return;
        }
        const oldId = String(object.id);
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
