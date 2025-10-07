import {Dispatchable} from "../../base/Dispatcher";
import {apiFetchStorePage} from "../StoreUtils";
import {isDeepEqual} from "../../base/Utils";
import {StoreClass, StoreObject} from "../Store";

export abstract class BasePaginator<Type> extends Dispatchable {
    abstract getTotalEntries(): number;
    abstract getNumPages(): number;
    abstract getPageSize(): number;
    abstract setPageSize(pageSize: number): void;
    abstract getRange(page?: number | null): number[];
    abstract getCurrentPageEntries(): Type[] | undefined;
    abstract fetchPage(page: number): Promise<Type[]> | Type[];
    abstract haveInitiatedFetch(): boolean;

    async fetchFirstPage(): Promise<Type[]> {
        return this.fetchPage(1);
    }
}

export class EndpointPaginator<Type extends StoreObject> extends BasePaginator<Type> {
    totalEntriesCount: number = 0; // The number of total objects we're paginating
    lastPageRequested: number | null = null; // The last page we requested
    lastPageLoaded: number | null = null; // The last page we successfully received
    fetchingNow: boolean = false;
    lastResponse: any = null;
    store: StoreClass<Type>;
    endpoint: string;
    filters: any;
    storeFilters: any;
    error: any = null;
    loadedLastPage: boolean = false;

    constructor(store: StoreClass<Type>, endpoint: string, apiFilters: any = {}, storeFilters: any = {}) {
        super();
        this.store = store;
        this.endpoint = endpoint;
        this.filters = apiFilters;
        this.storeFilters = storeFilters;
        this.filters.pageSize = this.filters.pageSize || 10;
    }

    isLoading(): boolean {
        return this.fetchingNow;
    }

    getError(): any {
        return this.error;
    }

    getPageSize() {
        return this.filters.pageSize;
    }

    getTotalEntries() {
        return this.totalEntriesCount;
    }

    getCurrentPageEntries() {
        return this.lastResponse?.results;
    }

    // TODO deprecate this / move
    getRange(page: number | null = this.lastPageLoaded): number[] {
        const pageSize = this.getPageSize();
        return [
            Math.max(0, Math.min(this.getTotalEntries(), (page - 1) * pageSize + 1)),
            Math.min(this.getTotalEntries(), page * pageSize),
        ]
    }

    // Fetches the page and returns the new objects
    // Catching errors is left to the upper layers
    async fetchPage(page: number | null = this.lastPageRequested, passErrors: boolean = true): Promise<Type[]> {
        page = Math.min(page, this.getNumPages());

        const request = {
            page,
            ...this.filters, // Also includes the page size
        };

        let response = null;

        this.error = null;
        this.fetchingNow = true;
        this.lastPageRequested = page;
        this.dispatch("pageRequested", page, this);
        try {
            response = this.lastResponse = await apiFetchStorePage(this.store, this.endpoint, request);
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

        const lastFetchedObjects = response.results as Type[];
        this.loadedLastPage = (lastFetchedObjects.length < this.filters.pageSize) || (response.count === this.getPageSize() * page);

        this.dispatch("pageLoaded", lastFetchedObjects, response, this);

        return lastFetchedObjects;
    }

    // Return true if we've ever started a fetch
    haveInitiatedFetch() {
        return this.lastPageRequested != null;
    }

    async fetchNextPage(): Promise<any> {
        return this.fetchPage(this.lastPageRequested! + 1);
    }

    async fetchFirstPage() {
        return this.fetchPage(1);
    }

    async fetchLastPage() {
        if (this.lastPageRequested == this.getNumPages()) {
            return;
        }
        return this.fetchPage(this.getNumPages());
    }

    getNumPages() {
        return Math.max(1, Math.ceil(this.totalEntriesCount / this.getPageSize()));
    }

    getLastResponse() {
        return this.lastResponse;
    }

    setPageSize(pageSize: number) {
        this.updateFilter({pageSize});
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

    haveLoadedLastRequestedPage() {
        return this.lastPageRequested && this.lastPageRequested === this.lastPageLoaded;
    }

    // TODO: pattern for naming bool getters/fields with the logic behind them?
    isFetching() {
        return this.fetchingNow;
    }

    all() {
        return this.store.filterBy(this.storeFilters);
    }
}

export class ArrayPaginator<Type> extends BasePaginator<Type> {
    entries: Type[];
    pageSize: number;
    lastPageLoaded: number | null = null;
    lastPageRequested: number | null = null;
    pageEntries: Type[] = [];

    constructor(entries: Type[], pageSize: number = 10) {
        super();
        this.entries = entries;
        this.pageSize = pageSize;
        this.fetchFirstPage(); // Load first page entries
    }

    getTotalEntries() {
        return this.entries.length;
    }

    getNumPages() {
        return Math.ceil(this.getTotalEntries() / this.pageSize);
    }

    getPageSize() {
        return this.pageSize;
    }

    setPageSize(pageSize: number) {
        const activePageIndex = this.lastPageLoaded ? this.getRange()[0] : 1;
        this.pageSize = pageSize;
        this.fetchPage(Math.floor((activePageIndex + pageSize - 1) / pageSize));
    }

    getRange(page = this.lastPageLoaded) {
        const pageSize = this.getPageSize();
        return [
            Math.max(0, Math.min(this.getTotalEntries(), (page - 1) * pageSize + 1)),
            Math.min(this.getTotalEntries(), page * pageSize),
        ]
    }

    getCurrentPageEntries() {
        return this.pageEntries;
    }

    // page is an integer between 1 and numPages
    fetchPage(page: number): Type[] {
        page = Math.max(1, Math.min(page, this.getNumPages()));
        const entries: Type[] = [];
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

    async fetchFirstPage(): Promise<Type[]> {
        return this.fetchPage(1);
    }

    haveInitiatedFetch(): boolean {
        return this.lastPageLoaded != null;
    }
}
