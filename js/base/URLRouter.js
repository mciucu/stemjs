define(["exports", "Utils", "Dispatcher"], function (exports, _Utils, _Dispatcher) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.URLRouter = undefined;

    var Utils = _interopRequireWildcard(_Utils);

    function _interopRequireWildcard(obj) {
        if (obj && obj.__esModule) {
            return obj;
        } else {
            var newObj = {};

            if (obj != null) {
                for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
                }
            }

            newObj.default = obj;
            return newObj;
        }
    }

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

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    var URLRouterClass = function (_Dispatchable) {
        _inherits(URLRouterClass, _Dispatchable);

        function URLRouterClass() {
            _classCallCheck(this, URLRouterClass);

            var _this = _possibleConstructorReturn(this, (URLRouterClass.__proto__ || Object.getPrototypeOf(URLRouterClass)).call(this));

            window.onhashchange = function () {
                _this.routeCallback();
            };
            return _this;
        }

        _createClass(URLRouterClass, [{
            key: "routeCallback",
            value: function routeCallback() {
                var location = this.getLocation();
                if (location) {
                    this.dispatch("route", location);
                }
            }
        }, {
            key: "addRouteListener",
            value: function addRouteListener(callback) {
                return this.addListener("route", callback);
            }
        }, {
            key: "removeRouteListener",
            value: function removeRouteListener(callback) {
                this.removeListener("route", callback);
            }
        }, {
            key: "route",
            value: function route() {
                var args = Array.from(arguments);

                // we allow the function to be called with an array of arguments
                args = Utils.unwrapArray(args);

                var newPath = "#" + args.join("/");

                if (newPath === window.location.hash) {
                    return; // prevent stackoverflow when accidentally routing in callback
                }

                // Do we need to use state object?
                history.pushState({}, "", newPath);
                this.routeCallback();
            }
        }, {
            key: "routeNewTab",
            value: function routeNewTab() {
                var args = Array.from(arguments);

                // we allow the function to be called with an array of arguments
                args = Utils.unwrapArray(args);

                var newPath = window.location.origin + window.location.pathname + "#" + args.join("/");
                window.open(newPath, "_blank");
            }
        }, {
            key: "getLocation",
            value: function getLocation() {
                var hash = window.location.hash;
                if (hash.length === 0) {
                    return {
                        location: hash,
                        args: []
                    };
                } else if (/^#(?:[\w+-]\/?)+$/.test(hash)) {
                    // Check if hash is of type '#foo/bar'. Test guarantees non-empty array.
                    var args = hash.slice(1).split("/"); // slice to ignore hash
                    if (args[args.length - 1].length === 0) {
                        // In case of trailing '/'
                        args.pop();
                    }

                    return {
                        location: hash,
                        args: args
                    };
                } else {
                    console.log("Invalid hash route ", hash);
                    return null;
                }
            }
        }]);

        return URLRouterClass;
    }(_Dispatcher.Dispatchable);

    // Singleton
    var URLRouter = exports.URLRouter = new URLRouterClass();
});
