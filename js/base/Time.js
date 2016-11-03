define(["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var ServerTime = function () {
        function ServerTime() {
            _classCallCheck(this, ServerTime);
        }

        _createClass(ServerTime, null, [{
            key: "getServerOffset",
            value: function getServerOffset() {}
        }, {
            key: "now",
            value: function now() {
                // TODO: user performance.timing to figure out when the server time was received
            }
        }, {
            key: "update",
            value: function update(serverTime, estimatedLatency) {}
        }]);

        return ServerTime;
    }();

    exports.ServerTime = ServerTime;
});
