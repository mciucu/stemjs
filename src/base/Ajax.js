import {fetch} from "./Fetch";

export class AjaxHandler {
    constructor(ajaxHandler=Ajax, errorHandler=null) {
        this.parentHandler = ajaxHandler;
        this.preprocessors = (ajaxHandler) ? [] : Array.from(fetch.defaultPreprocessors);
        this.postprocessors = (ajaxHandler) ? [] : Array.from(fetch.defaultPostprocessors);
        this.errorPostprocessors = (ajaxHandler) ? [] : Array.from(fetch.defaultErrorPostprocessors);
        this.errorHandler = errorHandler;
    }

    fetch(request, ...args) {
        let baseOptions = {
            preprocessors: this.getPreprocessors(),
            postprocessors: this.getPostprocessors(),
            errorPostprocessors: this.getErrorPostprocessors(),
            errorHandler: this.getErrorHandler(),
        };

        // Request may be a plain object or a url, not going to duplicate code from fetch
        for (const key of Object.keys(baseOptions)) {
            if (request[key]) {
                delete baseOptions[key];
            }
        }

        return fetch(request, baseOptions, ...args);
    }

    request() {
        return this.fetch(...arguments)
    }

    // Feel free to modify the post and get methods for your needs
    get(url, options) {
        return this.fetch(...arguments, {method: "GET"});
    }

    getJSON(url, data, ...args) {
        return this.get(url, {dataType: "json", data: data}, ...args);
    }

    post(url, options) {
        return this.fetch(...arguments, {method: "POST"});
    }

    postJSON(url, data, ...args) {
        return this.post(url, {dataType: "json", data: data}, ...args);
    }

    addPreprocessor(preprocessor) {
        this.preprocessors.push(preprocessor);
    }

    getPreprocessors() {
        const inherited = (this.parentHandler && this.parentHandler.getPreprocessors()) || [];
        return [...this.preprocessors, ...inherited];
    }

    addPostprocessor(postprocessor) {
        this.postprocessors.push(postprocessor);
    }

    getPostprocessors() {
        const inherited = (this.parentHandler && this.parentHandler.getPostprocessors()) || [];
        return [...inherited, ...this.postprocessors];
    }

    addErrorPostprocessor(postprocessor) {
        this.errorPostprocessors.push(postprocessor);
    }

    getErrorPostprocessors() {
        const inherited = (this.parentHandler && this.parentHandler.getErrorPostprocessors()) || [];
        return [...inherited, ...this.errorPostprocessors];
    }

    getErrorHandler() {
        return this.errorHandler || (this.parentHandler && this.parentHandler.getErrorHandler());
    }
}

export class FixedURLAjaxHandler extends AjaxHandler {
    constructor(url, ajaxHandler=Ajax, errorHandler=null) {
        super(ajaxHandler, errorHandler);
        this.url = url;
    }

    get(options) {
        return super.get(this.url, ...arguments);
    }

    getJSON(data) {
        return super.getJSON(this.url, data);
    }

    post(options) {
        return super.post(this.url, ...arguments);
    }

    postJSON(data) {
        return super.postJSON(this.url, data);
    }
}

export let Ajax = new AjaxHandler();