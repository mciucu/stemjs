// Tries to be a more flexible implementation of fetch()
// Still work in progress

import {isPlainObject} from "./Utils";

// Parse the headers from an xhr object, to return a native Headers object
export function parseHeaders(xhr: XMLHttpRequest): Headers {
    const rawHeader = xhr.getAllResponseHeaders() || "";
    const rawHeaderLines = rawHeader.split(/\r?\n/);
    let headers = new Headers();

    for (let line of rawHeaderLines) {
        let parts = line.split(":");
        let key = parts.shift().trim();
        if (key) {
            let value = parts.join(":").trim();
            headers.append(key, value);
        }
    }
    return headers;
}

// Creates a new URLSearchParams object from a plain object
// Fields that are arrays are spread
export function getURLSearchParams(data: any, arrayKeySuffix: string = "[]"): URLSearchParams | any {
    if (!isPlainObject(data)) {
        return data;
    }

    let urlSearchParams = new URLSearchParams();
    for (const key of Object.keys(data)) {
        let value = data[key];
        if (Array.isArray(value)) {
            for (let instance of value) {
                urlSearchParams.append(key + arrayKeySuffix, instance);
            }
        } else {
            urlSearchParams.set(key, value);
        }
    }
    return urlSearchParams;
}

// Appends search parameters from an object to a given URL or Request, and returns the new URL
export function composeURL(url: string | Request, urlSearchParams?: URLSearchParams): string {
    let urlString: string;
    if (typeof url === 'object' && 'url' in url) {
        urlString = url.url;
    } else {
        urlString = url as string;
    }
    // TODO: also extract the preexisting arguments in the url
    if (urlSearchParams) {
        urlString += "?" + urlSearchParams;
    }
    return urlString;
}

type DataType = "arrayBuffer" | "blob" | "formData" | "json" | "text";

export type FetchPostprocessor = (payload: any, xhrPromise?: XHRPromise) => any;
export type FetchErrorPostprocessor = (error: any) => any;
export type FetchPreprocessor = (options: FetchOptions, input?: RequestInfo) => FetchOptions;

export interface FetchOptions extends RequestInit {
    url?: string;
    dataType?: DataType;
    onUploadProgress?: (event: ProgressEvent) => void;
    onDownloadProgress?: (event: ProgressEvent) => void;
    onSuccess?: (...args: any[]) => void;
    onError?: (...args: any[]) => void;
    onComplete?: () => void;
    success?: (...args: any[]) => void;
    error?: (...args: any[]) => void;
    complete?: () => void;
    errorHandler?: (...args: any[]) => void;
    postprocessors?: FetchPostprocessor[];
    errorPostprocessors?: FetchErrorPostprocessor[];
    preprocessors?: FetchPreprocessor[];
    urlParams?: any;
    urlSearchParams?: URLSearchParams;
    arraySearchParamSuffix?: string;
    
    // jQuery compatibility
    type?: string;
    contentType?: string;
    data?: any;
}

export interface URLFetchOptions extends FetchOptions {
    url: string;
}

export class XHRPromise {
    options: FetchOptions;
    request: Request;
    xhr: XMLHttpRequest;
    promise: Promise<any>;
    promiseResolve: (value?: any) => void;
    promiseReject: (reason?: any) => void;
    _chained?: boolean;

    constructor(request: RequestInfo, options: FetchOptions = {}) {
        request = new Request(request, options);
        let xhr = new XMLHttpRequest();
        this.options = options;
        this.request = request;
        this.xhr = xhr;

        this.promise = new Promise((resolve, reject) => {
            this.promiseResolve = resolve;
            this.promiseReject = reject;

            xhr.onload = () => {
                let headers = this.getResponseHeaders();

                let body = xhr.response || xhr.responseText;
                let responseInit = {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    headers: headers,
                    url: xhr.responseURL || headers.get("X-Request-URL"),
                };
                let response = new Response(body, responseInit);
                // In case dataType is "arrayBuffer", "blob", "formData", "json", "text"
                // Response has methods to return these as promises
                if (typeof response[options.dataType] === "function") {
                    const responsePromise = response[options.dataType]() as Promise<any>;
                    // TODO: should whitelist dataType to json, blob
                    responsePromise.then((data) => {
                        this.resolve(data);
                    }, (err) => {
                        this.reject(err);
                    });
                } else {
                    this.resolve(response);
                }
            };

            // TODO: also dispatch all arguments here on errors
            xhr.onerror = () => {
                this.reject(new TypeError("Network error"));
            };

            // TODO: need to have an options to pass setting to xhr (like timeout value)
            xhr.ontimeout = () => {
                this.reject(new TypeError("Network timeout"));
            };

            xhr.open(request.method, request.url, true);

            const {onUploadProgress, onDownloadProgress} = this.options;

            if (onUploadProgress) {
               xhr.upload.onprogress = onUploadProgress;
            }

            if (onDownloadProgress) {
                xhr.onprogress = onDownloadProgress;
            }

            if (request.credentials === "include") {
                xhr.withCredentials = true;
            }

            // TODO: come back to this
            xhr.responseType = "blob";

            let isApplicationTypeJson = false;
            request.headers.forEach((value, name) => {
                if (options.body instanceof FormData && name.toLowerCase() === "content-type") {
                    return;
                }
                // check if the request in JSON object based on headers
                if (value === "application/json" && name.toLowerCase() === "content-type") {
                    isApplicationTypeJson = true;
                }
                xhr.setRequestHeader(name, value);
            });
            // TODO: there's no need to send anything on a GET or HEAD
            if (options.body instanceof FormData) {
                this.send(options.body);
            } else if (isApplicationTypeJson) {
                // if the request has a JSON body, convert object body to JSON and sent it.
                this.send(JSON.stringify(options.body));
            } else {
                request.blob().then((blob) => {
                    // The blob can be a FormData when we're polyfilling the Request class
                    const body = ((blob instanceof FormData) || blob.size) ? blob : null;
                    this.send(body);
                });
            }
        });
    }

    getResponseHeaders() {
        return parseHeaders(this.xhr);
    }

    send(body: any): void {
        this.getXHR().send(body);
    }

    getPostprocessors(): FetchPostprocessor[] {
        return this.options.postprocessors || fetch.defaultPostprocessors;
    }

    getErrorPostprocessors(): FetchErrorPostprocessor[] {
        return this.options.errorPostprocessors || fetch.defaultErrorPostprocessors;
    }

    resolve(payload: any): void {
        for (const postprocessor of this.getPostprocessors()) {
            try {
                payload = postprocessor(payload, this) || payload;
            } catch (exception) {
                this.reject(exception);
                return;
            }
        }

        if (this.options.onSuccess) {
            this.options.onSuccess(...arguments);
        } else {
            this.promiseResolve(...arguments);
        }
        if (this.options.onComplete) {
            this.options.onComplete();
        }
    }

    reject(error: any): void {
        for (const postprocessor of this.getErrorPostprocessors()) {
            error = postprocessor(error) || error;
        }

        if (this.options.onError) {
            this.options.onError(error);
        } else {
            if (this._chained) {
                this.promiseReject(error);
            } else {
                if (this.options.errorHandler) {
                    this.options.errorHandler(error);
                } else {
                    console.error("Unhandled fetch error", error);
                }
            }
        }
        if (this.options.onComplete) {
            this.options.onComplete();
        }
    }

    // TODO: next 2 functions should throw an exception if you have onSuccess/onError
    then(onResolve?: (value: any) => any, onReject?: (reason: any) => any): Promise<any> {
        this._chained = true;
        onReject = onReject || this.options.errorHandler;
        return this.getPromise().then(onResolve, onReject);
    }

    catch(onReject?: (reason: any) => any): Promise<any> {
        this._chained = true;
        return this.getPromise().catch(onReject);
    }

    getXHR(): XMLHttpRequest {
        return this.xhr;
    }

    getPromise(): Promise<any> {
        return this.promise;
    }

    getRequest(): Request {
        return this.request;
    }

    abort(): void {
        this.getXHR().abort();
    }

    addXHRListener(name: string, callback: EventListener, ...args: any[]): void {
        this.getXHR().addEventListener(name, callback, ...args);
    }

    addProgressListener(callback: EventListener, ...args: any[]): void {
        this.addXHRListener("progress", callback, ...args);
    }
}

// TODO: this offers only partial compatibility with $.ajax, remove
export function jQueryCompatibilityPreprocessor(options: FetchOptions): FetchOptions {
    if (options.type) {
        options.method = options.type.toUpperCase();
    }

    const headers = options.headers as Headers;
    headers.set("X-Requested-With", "XMLHttpRequest");

    if (options.contentType) {
        headers.set("Content-Type", options.contentType);
    }

    if (isPlainObject(options.data)) {
        let method = options.method.toUpperCase();
        if (method === "GET" || method === "HEAD") {
            options.urlParams = options.urlParams || options.data;
            // TODO @types at the end we shouldn't need this anymore
            if ((options.cache as unknown as boolean) === false) {
                options.urlParams = getURLSearchParams(options.urlParams, options.arraySearchParamSuffix);
                options.urlParams.set("_", Date.now());
            }
        } else {
            let formData = new FormData();
            for (const key of Object.keys(options.data)) {
                const value = options.data[key];
                if (Array.isArray(value)) {
                    for (const arrayValue of value) {
                        formData.append(key + "[]", arrayValue);
                    }
                } else {
                    formData.append(key, value);
                }

            }
            options.body = formData;
        }
    } else {
        options.body = options.body || options.data;
    }
    return options;
}

// Can either be called with
// - 1 argument: (Request)
// - 2 arguments: (url/Request, options)
export function fetch(input: RequestInfo | URLFetchOptions, ...args: FetchOptions[]): XHRPromise {
    // In case we're being passed in a single plain object (not Request), assume it has a url field
    if (isPlainObject(input)) {
        return fetch(input.url, input, ...args);
    }

    let options = Object.assign({}, ...args);

    // Ensure that there's a .headers field for preprocessors
    options.headers = new Headers(options.headers || {});

    const preprocessors = options.preprocessors || fetch.defaultPreprocessors || [];

    for (const preprocessor of preprocessors) {
        options = preprocessor(options, input) || options;
    }

    options.onSuccess = options.onSuccess || options.success;
    options.onError = options.onError || options.error;
    options.onComplete = options.onComplete || options.complete;

    if (typeof options.cache === "boolean") {
        options.cache = options.cache ? "force-cache" : "reload";
        // TODO: cache still isn't fully done
    }

    options.method = options.method || "GET";
    // If there are any url search parameters, update the url from the urlParams or urlSearchParams fields
    // These fields can be plain objects (jQuery style) or can be URLSearchParams objects
    const urlParams = options.urlParams || options.urlSearchParams;
    if (urlParams) {
        // Change the URL of the request to add a query
        const urlSearchParams = getURLSearchParams(urlParams, options.arraySearchParamSuffix);
        if (input instanceof Request) {
            input = new Request(composeURL(input.url, urlSearchParams), input);
        } else {
            input = new Request(composeURL(input, urlSearchParams), {});
        }
    }

    return new XHRPromise(input, options);
}

fetch.defaultPreprocessors = [] as FetchPreprocessor[];
fetch.defaultPostprocessors = [] as FetchPostprocessor[];
fetch.defaultErrorPostprocessors = [] as FetchErrorPostprocessor[];

fetch.polyfill = true;
