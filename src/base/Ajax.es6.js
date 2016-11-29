// Not going to use promises until they mature
var Ajax = {};

Ajax.DEFAULT_OPTIONS = {
};

Ajax.DEFAULT_GET_OPTIONS = {
    type: "GET",
};

Ajax.DEFAULT_POST_OPTIONS = {
    type: "POST",
};

Ajax.rawRequest = function (options) {
    // TODO: see this through, this is the last external dependency in the library
    return $.ajax(options);
};

Ajax.request = function(options) {
    options = Object.assign({}, Ajax.DEFAULT_OPTIONS, options);

    // TODO: Should refactor Ajax to support addition of functions from external sources, ie error handling
    // options.success = (data) => {
    //     if (data.error && options.onError) {
    //         options.onError(data.error);
    //     } else {
    //         options.success(data);
    //     }
    // };

    // TODO: see this through, this is the last external dependency in the library
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
