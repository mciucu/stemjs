import {fetch} from "./Fetch";

var Ajax = {};

Ajax.fetch = fetch;

// TODO: should also take in the complete options
Ajax.getDefaultHeaders = (headers) => {
    return headers;
};

Ajax.DEFAULT_OPTIONS = {
    credentials: "include",
};

Ajax.DEFAULT_GET_OPTIONS = {
    method: "GET",
};

Ajax.DEFAULT_POST_OPTIONS = {
    method: "POST",
};

Ajax.rawRequest = function (options) {
    return Ajax.fetch(options.url, options);
};

Ajax.request = function(options) {
    options = Object.assign({}, Ajax.DEFAULT_OPTIONS, options);

    let headers = Ajax.getDefaultHeaders(options.headers);
    if (headers) {
        options.headers = headers
    } else {
        delete options.headers;
    }

    // TODO: Should refactor Ajax to support addition of functions from external sources, ie error handling
    return Ajax.rawRequest(options);
};

Ajax.post = function (options) {
    options = Object.assign({}, Ajax.DEFAULT_POST_OPTIONS, options);

    return Ajax.request(options);
};

Ajax.get = function (options) {
    options = Object.assign({}, Ajax.DEFAULT_GET_OPTIONS , options);

    return Ajax.request(options);
};

export {Ajax};
