import {fetch} from "./Fetch";

let Ajax = {
    fetch: fetch,
    request: fetch,
    // Feel free to modify the post and get methods for your needs
    get(url, options) {
        return Ajax.fetch(...arguments, {method: "GET"});
    },
    getJSON(url, data) {
        return Ajax.get(url, {dataType: "json", data: data});
    },
    post(url, options) {
        return Ajax.fetch(...arguments, {method: "POST"});
    },
    postJSON(url, data) {
        return Ajax.post(url, {dataType: "json", data: data});
    },
    addDefaultPreprocessor(preprocessor) {
        Ajax.fetch.defaultPreprocessors.push(preprocessor);
    },
};

export {Ajax};
