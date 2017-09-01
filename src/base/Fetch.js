// Tries to be a more flexible implementation of fetch()
// Still work in progress

import {isPlainObject} from "./Utils";

// May need to polyfill Headers, Request, Response, Body, URLSearchParams classes, so import them
import {polyfillRequest} from "../polyfill/Request";
import {polyfillResponse} from "../polyfill/Response";
import {polyfillHeaders} from "../polyfill/Headers";
import {polyfillURLSearchParams} from "../polyfill/URLSearchParams";

// TODO: should only call this in the first call to fetch, to not create unneeded dependencies?
if (window) {
    polyfillRequest(window);
    polyfillResponse(window);
    polyfillHeaders(window);
    polyfillURLSearchParams(window);
}

// Parse the headers from an xhr object, to return a native Headers object
function parseHeaders(xhr) {
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
function getURLSearchParams(data) {
    if (!isPlainObject(data)) {
        return data;
    }

    let urlSearchParams = new URLSearchParams();
    for (const key of Object.keys(data)) {
        let value = data[key];
        if (Array.isArray(value)) {
            for (let instance of value) {
                urlSearchParams.append(key + "[]", instance);
            }
        } else {
            urlSearchParams.set(key, value);
        }
    }
    return urlSearchParams;
}

// Appends search parameters from an object to a given URL or Request, and returns the new URL
function composeURL(url, params) {
    if (url.url) {
        url = url.url;
    }
    // TODO: also extract the preexisting arguments in the url
    if (params) {
        url += "?" + getURLSearchParams(params);
    }
    return url;
}

export function toFormData(data) {
    let formData = new FormData();
    for (const key of Object.keys(data)) {
        formData.append(key, data[key]);
    }
    return formData;
}

class XHRPromise {
    constructor(request, options = {}) {
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
                    // TODO: should whitelist dataType to json, blob
                    response[options.dataType]().then((data) => {
                        this.resolve(data);
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

            if (request.credentials === "include") {
                xhr.withCredentials = true;
            }

            // TODO: come back to this
            xhr.responseType = "blob";

            request.headers.forEach((value, name) => {
                if (options.body instanceof FormData && name.toLowerCase() === "content-type") {
                    return;
                }
                xhr.setRequestHeader(name, value);
            });

            // TODO: there's no need to send anything on a GET or HEAD
            if (options.body instanceof FormData) {
                this.send(options.body);
            } else {
                request.blob().then((blob) => {
                    // The blob can be a FormData when we're polyfilling the Request class
                    let body = ((blob instanceof FormData) || blob.size) ? blob : null;
                    this.send(body);
                });
            }
        });
    }

    getResponseHeaders() {
        return parseHeaders(this.xhr);
    }

    send(body) {
        this.getXHR().send(body);
    }

    getPostprocessors() {
        return this.options.postprocessors || fetch.defaultPostprocessors;
    }

    getErrorPostprocessors() {
        return this.options.errorPostprocessors || fetch.defaultErrorPostprocessors;
    }

    resolve(payload) {
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

    reject(error) {
        for (const postprocessor of this.getErrorPostprocessors()) {
            error = postprocessor(error) || error;
        }

        if (this.options.onError) {
            this.options.onError(...arguments);
        } else {
            if (this._chained) {
                this.promiseReject(...arguments);
            } else {
                if (this.options.errorHandler) {
                    this.options.errorHandler(...arguments);
                } else {
                    console.error("Unhandled fetch error", ...arguments);
                }
            }
        }
        if (this.options.onComplete) {
            this.options.onComplete();
        }
    }

    // TODO: next 2 functions should throw an exception if you have onSuccess/onError
    then(onResolve, onReject) {
        this._chained = true;
        onReject = onReject || this.options.errorHandler;
        return this.getPromise().then(onResolve, onReject);
    }

    catch() {
        this._chained = true;
        return this.getPromise().catch(...arguments);
    }

    getXHR() {
        return this.xhr;
    }

    getPromise() {
        return this.promise;
    }

    getRequest() {
        return this.request;
    }

    abort() {
        this.getXHR().abort();
    }

    addXHRListener(name, callback) {
        this.getXHR().addEventListener(...arguments);
    }

    addProgressListener(callback) {
        this.addXHRListener("progress", ...arguments);
    }
}

// TODO: this offers only partial compatibility with $.ajax
function jQueryCompatibilityPreprocessor(options) {
    if (options.type) {
        options.method = options.type.toUpperCase();
    }

    if (options.contentType) {
        options.headers.set("Content-Type", options.contentType);
    }

    options.headers.set("X-Requested-With", "XMLHttpRequest");

    if (isPlainObject(options.data)) {
        let method = options.method.toUpperCase();
        if (method === "GET" || method === "HEAD") {
            options.urlParams = options.urlParams || options.data;
            if (options.cache === false) {
                options.urlParams = getURLSearchParams(options.urlParams);
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
function fetch(input, ...args) {
    // In case we're being passed in a single plain object (not Request), assume it has a url field
    if (isPlainObject(input)) {
        return fetch(input.url, ...arguments);
    }

    let options = Object.assign({}, ...args);

    // Ensure that there's a .headers field for preprocessors
    options.headers = new Headers(options.headers || {});

    const preprocessors = options.preprocessors || fetch.defaultPreprocessors || [];

    for (const preprocessor of preprocessors) {
        options = preprocessor(options) || options;
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
        if (input instanceof Request) {
            input = new Request(composeURL(input.url, urlParams), input);
        } else {
            input = new Request(composeURL(input, urlParams), {});
        }
    }

    return new XHRPromise(input, options);
}

fetch.defaultPreprocessors = [jQueryCompatibilityPreprocessor];
fetch.defaultPostprocessors = [];
fetch.defaultErrorPostprocessors = [];

fetch.polyfill = true;

export {XHRPromise, fetch, composeURL, parseHeaders, getURLSearchParams, jQueryCompatibilityPreprocessor};
