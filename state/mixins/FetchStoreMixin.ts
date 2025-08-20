import {unwrapArray, splitInChunks, isString} from "../../base/Utils";
import {Ajax} from "../../base/Ajax";
import {GlobalState, StoreId} from "../State";
import {URLFetchOptions} from "../../base/Fetch";
import {BaseStore, StoreOptions, StoreObject, StoreClass} from "../Store";

// Options a fetch can be called with, might be overridden
export interface BaseFetchOptions {
    force?: boolean;
}

export type FetchJob<T extends StoreObject, ExtraOptions = {}> = {
    id: StoreId;
    success: (obj: T) => void;
    error?: (error?: any) => void;
} & ExtraOptions;

export interface FetchRequestData {
    [key: string]: any;
}

export interface FetchMixinOptions extends StoreOptions {
    fetchURL?: string;
    fetchType?: string;
    maxFetchObjectCount?: number;
    fetchTimeoutDuration?: number;
}

export const FetchStoreMixin = <
    T extends StoreObject = StoreObject,
    FetchOptions extends BaseFetchOptions = BaseFetchOptions
>(
    objectType: string,
    storeOptions: FetchMixinOptions = {},
    BaseClass?: StoreClass<T>
) => // @ts-ignore
class AjaxFetchStore extends BaseStore(objectType, storeOptions, BaseClass) {
    static fetchJobs: FetchJob<T, FetchOptions>[] = [];
    static fetchTimeout?: number;
    static fetchTimeoutDuration: number = storeOptions.fetchTimeoutDuration || 50;
    static fetchURL: string = storeOptions.fetchURL || "";
    static fetchType: string = storeOptions.fetchType || "GET";
    static maxFetchObjectCount: number = storeOptions.maxFetchObjectCount || 256;

    static async fetch<T extends StoreObject & AjaxFetchStore>(this: StoreClass<T> & typeof AjaxFetchStore, id: StoreId, fetchOptions: Partial<FetchOptions> = {}): Promise<T> {
        return new Promise((resolve, reject) => {
            this.fetchSync<T>(id, resolve, reject, fetchOptions);
        });
    }

    // TODO Deprecate this and move to only fetch
    static fetchSync<T extends StoreObject & AjaxFetchStore>(this: StoreClass<T> & typeof AjaxFetchStore, id: StoreId, successCallback: (obj: T) => void, errorCallback?: (error?: any) => void, fetchOptions: Partial<FetchOptions> = {}): void {
        if (!fetchOptions.force) {
            let obj = this.get(id);
            if (obj) {
                successCallback(obj);
                return;
            }
        }
        this.fetchJobs.push({id: id, success: successCallback, error: errorCallback, ...fetchOptions} as any);
        if (!this.fetchTimeout) {
            this.fetchTimeout = setTimeout(() => {
                this.executeAjaxFetch();
            }, this.fetchTimeoutDuration);
        }
    };

    static getFetchRequestData(entries: [StoreId, FetchJob<any>[]][]): FetchRequestData {
        return {
            ids: entries.map(entry => entry[0])
        };
    }

    static getFetchRequestObject(entries: [StoreId, FetchJob<any>[]][]): URLFetchOptions {
        const requestData = this.getFetchRequestData(entries);
        const fetchJobs: FetchJob<any>[] = unwrapArray(entries.map(entry => entry[1]));

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
    static getFetchRequests(fetchJobs: FetchJob<any>[]): URLFetchOptions[] {
        const idFetchJobs = new Map<StoreId, FetchJob<any>[]>();

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
        this.fetchJobs = [];

        const requests = this.getFetchRequests(fetchJobs!);

        for (const requestObject of requests) {
            Ajax.fetch(requestObject);
        }

        clearTimeout(this.fetchTimeout);
        this.fetchTimeout = undefined;
    }
};
