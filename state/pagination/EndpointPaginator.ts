import {Dispatchable} from "../../base/Dispatcher";
import {isDeepEqual} from "../../base/Utils";
import {StoreClass, StoreObject} from "../Store";
import {LoadEndpoint} from "../../base/Fetch";

export abstract class BasePaginator<T> extends Dispatchable {
    fetchingNow: boolean = false;
    lastPageRequested: number | null = null; // The last page we requested
    lastPageLoaded: number | null = null; // The last page we successfully received
    pageSize: number;

    abstract getTotalEntries(): number;
    abstract getCurrentPageEntries(): T[];
    abstract fetchPage(page: number): Promise<T[]> | T[];

    getPageSize(): number {
        return this.pageSize;
    }

    setPageSize(pageSize: number) {
        this.pageSize = pageSize;
        const activePageIndex = this.lastPageLoaded ? this.getRange()[0] : 1;
        this.fetchPage(Math.floor((activePageIndex + pageSize - 1) / pageSize));
    }

    isLoading(): boolean {
        return this.fetchingNow;
    }

    // Return true if we've ever started a fetch
    haveInitiatedFetch() {
        return this.lastPageRequested != null;
    }

    haveLoadedLastRequestedPage() {
        return this.lastPageRequested && this.lastPageRequested === this.lastPageLoaded;
    }

    getNumPages(): number {
        return Math.max(1, Math.ceil(this.getTotalEntries() / this.getPageSize()));
    }

    getRange(page: number | null = this.lastPageLoaded): number[] {
        const pageSize = this.getPageSize();
        const totalEntries = this.getTotalEntries();
        return [
            Math.max(0, Math.min(totalEntries, (page - 1) * pageSize + 1)),
            Math.min(totalEntries, page * pageSize),
        ];
    }

    fetchFirstPage() {
        return this.fetchPage(1);
    }
}

// TODO @types template by object type
export class EndpointPaginator<T extends StoreObject> extends BasePaginator<T> {
    totalEntriesCount: number = 0; // The number of total objects we're paginating
    lastResponse: any = null;
    lastResponseObjects?: T[] = null;
    store: StoreClass<T>;
    endpoint: string;
    filters: any;
    storeFilters: any;
    error: any = null;
    loadedLastPage: boolean = false;

    constructor(store: StoreClass<T>, endpoint: string, apiFilters: any = {}, storeFilters: any = {}) {
        super();
        this.store = store;
        this.endpoint = endpoint;
        this.filters = apiFilters;
        this.storeFilters = storeFilters;
        this.pageSize = this.filters.pageSize || 10;
    }

    getError(): any {
        return this.error;
    }

    getTotalEntries() {
        return this.totalEntriesCount;
    }

    getCurrentPageEntries(): T[] {
        return this.lastResponseObjects;
    }

    // Fetches the page and returns the new objects
    // Catching errors is left to the upper layers
    async fetchPage(page: number | null = this.lastPageRequested, passErrors: boolean = true): Promise<T[]> {
        page = Math.min(page, this.getNumPages());

        const request = {
            page,
            ...this.filters,
            pageSize: this.pageSize,
        };

        let response = null;

        this.error = null;
        this.fetchingNow = true;
        this.lastPageRequested = page;
        this.dispatch("pageRequested", page, this);
        try {
            response = this.lastResponse = await LoadEndpoint(this.endpoint, request);
        } catch (error) {
            this.error = error;
            this.dispatch("pageLoadFailed", error);
            if (passErrors) {
                throw error;
            }
            return;
        } finally { // All error are thrown up here
            this.fetchingNow = false;
        }

        // TODO: handle multiple pending requests that can come back out of order
        //  Should block a new request until the previous hasn't finished probably
        this.lastPageLoaded = page;
        this.totalEntriesCount = response.count;

        this.lastResponseObjects = this.store.load(response);
        this.loadedLastPage = (this.lastResponseObjects.length < this.getPageSize()) || (response.count === this.getPageSize() * page);

        this.dispatch("pageLoaded", this.lastResponseObjects, response, this);

        return this.lastResponseObjects;
    }

    async fetchNextPage(): Promise<any> {
        return this.fetchPage(this.lastPageRequested! + 1);
    }

    getLastResponse() {
        return this.lastResponse;
    }

    // Update the filters and also fetch the first page
    updateFilter(filters) {
        let haveChange = false;
        for (const [key, value] of Object.entries(filters || {})) {
            if (!isDeepEqual(this.filters[key], value)) {
                this.filters[key] = value;
                haveChange = true;
            }
        }
        if (haveChange || !this.lastPageRequested) {
            this.fetchFirstPage(); // TODO throttle this and maybe debounce this like enqueueMicrotask
        }
    }

    all() {
        return this.store.filterBy(this.storeFilters);
    }
}

export class ArrayPaginator<T> extends BasePaginator<T> {
    entries: T[];
    pageEntries: T[] = [];

    constructor(entries: T[], pageSize: number = 10) {
        super();
        this.entries = entries;
        this.pageSize = pageSize;
        this.fetchFirstPage(); // Load first page entries
    }

    getTotalEntries() {
        return this.entries.length;
    }

    getCurrentPageEntries(): T[] {
        return this.pageEntries;
    }

    fetchPage(page: number): T[] {
        page = Math.max(1, Math.min(page, this.getNumPages()));
        const entries: T[] = [];
        for (let index = this.pageSize * (page - 1); index < this.pageSize * page; index++) {
            if (index >= 0 && index < this.entries.length) {
                entries.push(this.entries[index]);
            }
        }
        this.lastPageRequested = this.lastPageLoaded = page;
        this.pageEntries = entries;
        this.dispatch("pageLoaded", entries, {entries}, this);
        return entries;
    }
}
