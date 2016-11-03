define(["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    // Not going to use promises until they mature
    var Ajax = {};

    Ajax.rawRequest = function (options) {
        // TODO: see this through, this is the last external dependency in the library
        return $.ajax(options);
    };

    Ajax.request = function (options) {
        options = Object.assign({
            // TODO: this should be in request header, like django recommends
            csrfmiddlewaretoken: CSRF_TOKEN,
            dataType: "json"
        }, options);

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
        options = Object.assign({
            type: "POST"
        }, options);

        return Ajax.request(options);
    };

    Ajax.get = function (options) {
        options = Object.assign({
            type: "GET"
        }, options);

        return Ajax.request(options);
    };

    exports.Ajax = Ajax;
});
