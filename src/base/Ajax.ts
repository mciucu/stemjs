import {fetch, XHRPromise, FetchPreprocessor, FetchPostprocessor, FetchErrorPostprocessor, FetchOptions} from "./Fetch";

export class AjaxHandler {
    static _baseAjax: AjaxHandler | null = null;
    parentHandler: AjaxHandler | null;
    preprocessors: FetchPreprocessor[];
    postprocessors: FetchPostprocessor[];
    errorPostprocessors: FetchErrorPostprocessor[];
    errorHandler: ((...args: any[]) => void) | null;

    constructor(ajaxHandler?: AjaxHandler | null, errorHandler: ((...args: any[]) => void) | null = null) {
        if ((this.constructor as typeof AjaxHandler)._baseAjax === null) {
            (this.constructor as typeof AjaxHandler)._baseAjax = this;
        } else if (arguments.length === 0) {
            ajaxHandler = (this.constructor as typeof AjaxHandler)._baseAjax;
        }
        this.parentHandler = ajaxHandler;
        this.preprocessors = (ajaxHandler) ? [] : Array.from(fetch.defaultPreprocessors);
        this.postprocessors = (ajaxHandler) ? [] : Array.from(fetch.defaultPostprocessors);
        this.errorPostprocessors = (ajaxHandler) ? [] : Array.from(fetch.defaultErrorPostprocessors);
        this.errorHandler = errorHandler;
    }

    fetch(request: RequestInfo, ...args: FetchOptions[]): XHRPromise | undefined {
        if (!request) {
            console.error("Missing request for fetch");
            return;
        }

        const baseOptions = {
            preprocessors: this.getPreprocessors(),
            postprocessors: this.getPostprocessors(),
            errorPostprocessors: this.getErrorPostprocessors(),
            errorHandler: this.getErrorHandler(),
        };

        // Request may be a plain object or a url, not going to duplicate code from fetch
        for (const key of Object.keys(baseOptions)) {
            if (typeof request === 'object' && request[key]) {
                delete baseOptions[key];
            }
        }

        return fetch(request, baseOptions, ...args);
    }

    request(request: RequestInfo, ...args: FetchOptions[]): XHRPromise | undefined {
        return this.fetch(request, ...args);
    }

    // Feel free to modify the post and get methods for your needs
    get(url: string, ...args: FetchOptions[]): XHRPromise | undefined {
        return this.fetch(url, ...args, {method: "GET"});
    }

    getJSON(url: string, data?: any, ...args: FetchOptions[]): XHRPromise | undefined {
        return this.get(url, {dataType: "json", data: data}, ...args);
    }

    post(url: string, ...args: FetchOptions[]): XHRPromise | undefined {
        return this.fetch(url, ...args, {method: "POST"});
    }

    postJSON(url: string, data?: any, ...args: FetchOptions[]): XHRPromise | undefined {
        return this.post(url, {dataType: "json", data: data}, ...args);
    }

    addPreprocessor(preprocessor: FetchPreprocessor): void {
        this.preprocessors.push(preprocessor);
    }

    getPreprocessors(): FetchPreprocessor[] {
        const inherited = this.parentHandler?.getPreprocessors() || [];
        return [...this.preprocessors, ...inherited];
    }

    addPostprocessor(postprocessor: FetchPostprocessor): void {
        this.postprocessors.push(postprocessor);
    }

    getPostprocessors(): FetchPostprocessor[] {
        const inherited = this.parentHandler?.getPostprocessors() || [];
        return [...inherited, ...this.postprocessors];
    }

    addErrorPostprocessor(postprocessor: FetchErrorPostprocessor): void {
        this.errorPostprocessors.push(postprocessor);
    }

    getErrorPostprocessors(): FetchErrorPostprocessor[] {
        const inherited = this.parentHandler?.getErrorPostprocessors() || [];
        return [...inherited, ...this.errorPostprocessors];
    }

    getErrorHandler(): ((...args: any[]) => void) | null | undefined {
        return this.errorHandler || this.parentHandler?.getErrorHandler();
    }
}

export class FixedURLAjaxHandler {
    url: string;
    ajax: AjaxHandler;

    constructor(url: string, ajaxHandler: AjaxHandler = Ajax, errorHandler: ((...args: any[]) => void) | null = null) {
        this.ajax = new AjaxHandler(ajaxHandler, errorHandler);
        this.url = url;
    }

    get(...args: FetchOptions[]): XHRPromise | undefined {
        return this.ajax.get(this.url, ...args);
    }

    getJSON(data?: any, ...args: FetchOptions[]): XHRPromise | undefined {
        return this.ajax.getJSON(this.url, data, ...args);
    }

    post(...args: FetchOptions[]): XHRPromise | undefined {
        return this.ajax.post(this.url, ...args);
    }

    postJSON(data?: any, ...args: FetchOptions[]): XHRPromise | undefined {
        return this.ajax.postJSON(this.url, data, ...args);
    }
}

export const Ajax = new AjaxHandler();