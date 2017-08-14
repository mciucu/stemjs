import {fetch} from "./Fetch";

let Ajax = {
    fetch() {
        const xhrPromise = fetch(...arguments);
        if (this.defaultErrorHandler) {
            xhrPromise.promiseReject = this.defaulErrorHandler;
        }
        return xhrPromise;
    },
    request() {
        return this.fetch(...arguments)
    },
    // Feel free to modify the post and get methods for your needs
    get(url, options) {
        return this.fetch(...arguments, {method: "GET"});
    },
    getJSON(url, data) {
        return this.get(url, {dataType: "json", data: data});
    },
    post(url, options) {
        return this.fetch(...arguments, {method: "POST"});
    },
    postJSON(url, data) {
        return this.post(url, {dataType: "json", data: data});
    },
    addDefaultPreprocessor(preprocessor) {
        fetch.defaultPreprocessors.push(preprocessor);
    },
    addDefaultPostprocessor(postProcessor) {
        fetch.defaultPostprocessors.push(postProcessor);
    }
};

export {Ajax};
