define(["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

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

    function _toConsumableArray(arr) {
        if (Array.isArray(arr)) {
            for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

            return arr2;
        } else {
            return Array.from(arr);
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

    var DispatcherHandle = function () {
        function DispatcherHandle(dispatcher, callback) {
            _classCallCheck(this, DispatcherHandle);

            this.dispatcher = dispatcher;
            this.callback = callback;
        }

        _createClass(DispatcherHandle, [{
            key: "remove",
            value: function remove() {
                this.dispatcher.removeListener(this.callback);
            }
        }, {
            key: "cleanup",
            value: function cleanup() {
                this.remove();
            }
        }]);

        return DispatcherHandle;
    }();

    var Dispatcher = function () {
        function Dispatcher() {
            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            _classCallCheck(this, Dispatcher);

            this.options = options;
            this.listeners = [];
        }

        _createClass(Dispatcher, [{
            key: "addListener",
            value: function addListener(callback) {
                if (!(typeof callback === "function")) {
                    console.error("The listener needs to be a function: ", callback);
                    return;
                }
                for (var i = 0; i < this.listeners.length; i += 1) {
                    if (this.listeners[i] === callback) {
                        console.error("Can't re-register for the same callback: ", this, " ", callback);
                        return new DispatcherHandle(this, this.listeners[i]);
                    }
                }

                this.listeners.push(callback);
                return new DispatcherHandle(this, callback);
            }
        }, {
            key: "removeListener",
            value: function removeListener(callback) {
                for (var i = 0; i < this.listeners.length; i += 1) {
                    if (this.listeners[i] === callback) {
                        // Erase and return
                        return this.listeners.splice(i, 1)[0];
                    }
                }
            }
        }, {
            key: "dispatch",
            value: function dispatch(payload) {
                for (var i = 0; i < this.listeners.length; i += 1) {
                    var listener = this.listeners[i];
                    listener.apply(undefined, arguments);
                }
            }
        }]);

        return Dispatcher;
    }();

    var Dispatchable = function () {
        function Dispatchable() {
            _classCallCheck(this, Dispatchable);
        }

        _createClass(Dispatchable, [{
            key: "getDispatcher",
            value: function getDispatcher(name) {
                return this.dispatchers.get(name);
            }
        }, {
            key: "dispatch",
            value: function dispatch(name, payload) {
                var dispatcher = this.getDispatcher(name);
                if (dispatcher) {
                    // Optimize the average case
                    if (arguments.length <= 2) {
                        dispatcher.dispatch(payload);
                    } else {
                        var args = Array.prototype.slice.call(arguments, 1);
                        dispatcher.dispatch.apply(dispatcher, _toConsumableArray(args));
                    }
                }
            }
        }, {
            key: "addListener",
            value: function addListener(name, callback) {
                var _this = this;

                if (Array.isArray(name)) {
                    return new CleanupJobs(name.map(function (x) {
                        return _this.addListener(x, callback);
                    }));
                }
                var dispatcher = this.getDispatcher(name);
                if (!dispatcher) {
                    dispatcher = new Dispatcher();
                    this.dispatchers.set(name, dispatcher);
                }
                return dispatcher.addListener(callback);
            }
        }, {
            key: "removeListener",
            value: function removeListener(name, callback) {
                var dispatcher = this.getDispatcher(name);
                if (dispatcher) {
                    dispatcher.removeListener(callback);
                }
            }
        }, {
            key: "cleanup",
            value: function cleanup() {
                delete this._dispatchers;
            }
        }, {
            key: "dispatchers",
            get: function get() {
                if (!this.hasOwnProperty("_dispatchers")) {
                    this._dispatchers = new Map();
                }
                return this._dispatchers;
            }
        }]);

        return Dispatchable;
    }();

    Dispatcher.Global = new Dispatchable();

    var RunOnce = function () {
        function RunOnce() {
            _classCallCheck(this, RunOnce);
        }

        _createClass(RunOnce, [{
            key: "run",
            value: function run(callback) {
                var _this2 = this;

                var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

                if (this.timeout) {
                    return;
                }
                this.timeout = setTimeout(function () {
                    callback();
                    _this2.timeout = null;
                }, timeout);
            }
        }]);

        return RunOnce;
    }();

    var CleanupJobs = function () {
        function CleanupJobs() {
            var jobs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            _classCallCheck(this, CleanupJobs);

            this.jobs = jobs;
        }

        _createClass(CleanupJobs, [{
            key: "add",
            value: function add(job) {
                this.jobs.push(job);
            }
        }, {
            key: "cleanup",
            value: function cleanup() {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.jobs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var job = _step.value;

                        job.cleanup();
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                this.jobs = [];
            }
        }, {
            key: "remove",
            value: function remove() {
                this.cleanup();
            }
        }]);

        return CleanupJobs;
    }();

    var CleanupMixin = function CleanupMixin(BaseClass) {
        return function (_BaseClass) {
            _inherits(Cleanup, _BaseClass);

            function Cleanup() {
                _classCallCheck(this, Cleanup);

                return _possibleConstructorReturn(this, (Cleanup.__proto__ || Object.getPrototypeOf(Cleanup)).apply(this, arguments));
            }

            _createClass(Cleanup, [{
                key: "addCleanupTask",
                value: function addCleanupTask(cleanupJob) {
                    if (!this.hasOwnProperty("_cleanupJobs")) {
                        this._cleanupJobs = new CleanupJobs();
                    }
                    this._cleanupJobs.add(cleanupJob);
                }
            }, {
                key: "cleanup",
                value: function cleanup() {
                    if (this._cleanupJobs) {
                        this._cleanupJobs.cleanup();
                    }
                }
            }]);

            return Cleanup;
        }(BaseClass);
    };

    exports.Dispatcher = Dispatcher;
    exports.Dispatchable = Dispatchable;
    exports.RunOnce = RunOnce;
    exports.CleanupJobs = CleanupJobs;
    exports.CleanupMixin = CleanupMixin;
});
