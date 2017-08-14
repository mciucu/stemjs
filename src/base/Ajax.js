import {fetch} from "./Fetch";

class AjaxHandler {
    preprocessors = Array.from(fetch.defaultPreprocessors);
    postprocessors = Array.from(fetch.defaultPostprocessors);
    errorPostprocessors = Array.from(fetch.defaultErrorPostprocessors);
    errorHandler = null;

    fetch(request, ...args) {
        let baseOptions = {
            preprocessors: this.preprocessors,
            postprocessors: this.postprocessors,
            errorPostprocessors: this.errorPostprocessors,
            errorHandler: this.errorHandler,
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

    getJSON(url, data) {
        return this.get(url, {dataType: "json", data: data});
    }

    post(url, options) {
        return this.fetch(...arguments, {method: "POST"});
    }

    postJSON(url, data) {
        return this.post(url, {dataType: "json", data: data});
    }

    addDefaultPreprocessor(preprocessor) {
        this.preprocessors.push(preprocessor);
    }

    addDefaultPostprocessor(postprocessor) {
        this.postprocessors.push(postprocessor);
    }

    addDefaultErrorPostprocessor(postprocessor) {
        this.errorPostprocessors.push(postprocessor);
    }
}

export let Ajax = new AjaxHandler();
