import {fetch} from "./Fetch";

let Ajax = {
    fetch: fetch,
    request: fetch,
    // Feel free to modify the post and get methods for your needs
    get(url, options) {
        return Ajax.fetch(...arguments, {method: "GET"});
    },
    post(url, options) {
        return Ajax.fetch(...arguments, {method: "POST"});
    },
    addDefaultPreprocessor(preprocessor) {
        Ajax.fetch.defaultPreprocessors.push(preprocessor);
    },
};

export {Ajax};
