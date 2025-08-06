import {unwrapArray, splitInChunks, isString} from "../../base/Utils";
import {Ajax} from "../../base/Ajax";
import {GlobalState, StoreId} from "../State";
import {URLFetchOptions} from "../../base/Fetch";
import {BaseStore, StoreOptions, StoreObject, StoreClass} from "../Store";

// Type definitions for StoreMixins
export interface FetchJob {
    id: StoreId;
    success: (obj: any) => void;
    error?: (error?: any) => void;
}

export interface FetchRequestData {
    [key: string]: any;
}

export interface FetchOptions extends StoreOptions {
    fetchURL?: string;
    fetchType?: string;
    maxFetchObjectCount?: number;
    fetchTimeoutDuration?: number;
}

export const AjaxFetchMixin = <T extends StoreObject = StoreObject>(objectType: string, fetchOptions: FetchOptions = {}, BaseClass?: StoreClass<T>) => class AjaxFetchStore extends BaseStore(objectType, fetchOptions, BaseClass) {
    static fetchJobs?: FetchJob[];
    static fetchTimeout?: number;
    static fetchTimeoutDuration: number = fetchOptions.fetchTimeoutDuration || 50;
    static fetchURL: string = fetchOptions.fetchURL || "";
    static fetchType: string = fetchOptions.fetchType || "GET";
    static maxFetchObjectCount: number = fetchOptions.maxFetchObjectCount || 256;

    // TODO This should be an async method
    static fetch(id: StoreId, successCallback: (obj: any) => void, errorCallback?: (error?: any) => void, forceFetch: boolean = false): void {
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

    static getFetchRequestData(entries: [StoreId, FetchJob[]][]): FetchRequestData {
        return {
            ids: entries.map(entry => entry[0])
        };
    }

    static getFetchRequestObject(entries: [StoreId, FetchJob[]][]): URLFetchOptions {
        const requestData = this.getFetchRequestData(entries);
        const fetchJobs: FetchJob[] = unwrapArray(entries.map(entry => entry[1]));

        // TODO: options.fetchURL should also support a function(ids, fetchJobs), do it when needed
        return {
            url: this.fetchURL,
            type: this.fetchType,
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
    static getFetchRequests(fetchJobs: FetchJob[]): URLFetchOptions[] {
        const idFetchJobs = new Map<StoreId, FetchJob[]>();

        for (const fetchJob of fetchJobs) {
            let objectId = fetchJob.id;
            if (!idFetchJobs.has(objectId)) {
                idFetchJobs.set(objectId, []);
            }
            idFetchJobs.get(objectId)!.push(fetchJob);
        }

        const maxChunkSize = this.maxFetchObjectCount;

        const fetchChunks = splitInChunks(Array.from(idFetchJobs.entries()), maxChunkSize);

        return fetchChunks.map((chunkEntries) => this.getFetchRequestObject(chunkEntries));
    }

    static executeAjaxFetch(): void {
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
