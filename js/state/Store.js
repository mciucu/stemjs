define(["exports", "../base/Dispatcher"], function (exports, _Dispatcher) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.SingletonStore = exports.GenericObjectStore = exports.BaseStore = exports.StoreObject = undefined;

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

    var StoreObject = function (_Dispatchable) {
        _inherits(StoreObject, _Dispatchable);

        function StoreObject(obj) {
            _classCallCheck(this, StoreObject);

            var _this = _possibleConstructorReturn(this, (StoreObject.__proto__ || Object.getPrototypeOf(StoreObject)).call(this));

            Object.assign(_this, obj);
            return _this;
        }

        _createClass(StoreObject, [{
            key: "update",
            value: function update(event) {
                Object.assign(this, event.data);
            }
        }, {
            key: "addUpdateListener",
            value: function addUpdateListener(callback) {
                return this.addListener("update", callback);
            }
        }, {
            key: "addDeleteListener",
            value: function addDeleteListener(callback) {
                return this.addListener("delete", callback);
            }
        }, {
            key: "addEventListener",
            value: function addEventListener(eventType, callback) {
                var _this2 = this;

                if (Array.isArray(eventType)) {
                    // return new CleanupJobs(eventType.map(x => this.addEventListener(x, callback)));

                    var cleanupJobs = new _Dispatcher.CleanupJobs();
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = eventType[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var type = _step.value;

                            cleanupJobs.add(this.addEventListener(type, callback));
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

                    return cleanupJobs;
                }
                // Ensure the private event dispatcher exists
                if (!this._eventDispatcher) {
                    this._eventDispatcher = new _Dispatcher.Dispatchable();
                    this.addUpdateListener(function (event) {
                        _this2._eventDispatcher.dispatch(event.type, event, _this2);
                    });
                }
                return this._eventDispatcher.addListener(eventType, callback);
            }
        }]);

        return StoreObject;
    }(_Dispatcher.Dispatchable);

    var BaseStore = function (_Dispatchable2) {
        _inherits(BaseStore, _Dispatchable2);

        function BaseStore(objectType) {
            var ObjectWrapper = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : StoreObject;
            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            _classCallCheck(this, BaseStore);

            var _this3 = _possibleConstructorReturn(this, (BaseStore.__proto__ || Object.getPrototypeOf(BaseStore)).call(this));

            _this3.options = options;
            _this3.objectType = objectType.toLowerCase();
            _this3.ObjectWrapper = ObjectWrapper;
            _this3.attachToState();
            return _this3;
        }

        _createClass(BaseStore, [{
            key: "attachToState",
            value: function attachToState() {
                if (this.getState()) {
                    this.getState().addStore(this);
                }
            }
        }, {
            key: "getState",
            value: function getState() {
                // Allow explicit no state
                if (this.options.hasOwnProperty("state")) {
                    return this.options.state;
                } else {
                    return GlobalState;
                }
            }
        }, {
            key: "getDependencies",
            value: function getDependencies() {
                return this.options.dependencies || [];
            }
        }]);

        return BaseStore;
    }(_Dispatcher.Dispatchable);

    var GenericObjectStore = function (_BaseStore) {
        _inherits(GenericObjectStore, _BaseStore);

        function GenericObjectStore(objectType) {
            var ObjectWrapper = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : StoreObject;
            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            _classCallCheck(this, GenericObjectStore);

            var _this4 = _possibleConstructorReturn(this, (GenericObjectStore.__proto__ || Object.getPrototypeOf(GenericObjectStore)).apply(this, arguments));

            _this4.objects = new Map();
            return _this4;
        }

        _createClass(GenericObjectStore, [{
            key: "has",
            value: function has(id) {
                return !!this.get(id);
            }
        }, {
            key: "get",
            value: function get(id) {
                if (!id) {
                    return null;
                }
                return this.objects.get(parseInt(id));
            }
        }, {
            key: "all",
            value: function all(asIterable) {
                var values = this.objects.values();
                if (!asIterable) {
                    values = Array.from(values);
                }
                return values;
            }
        }, {
            key: "createObject",
            value: function createObject(event) {
                return new this.ObjectWrapper(event.data, event);
            }
        }, {
            key: "applyCreateEvent",
            value: function applyCreateEvent(event) {
                var sendDispatch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

                var existingObject = this.get(event.objectId);

                if (existingObject) {
                    var refreshEvent = Object.assign({}, event);
                    refreshEvent.type = "refresh";
                    existingObject.update(refreshEvent);
                    existingObject.dispatch("update", event);
                    return existingObject;
                } else {
                    var newObject = this.createObject(event);
                    this.objects.set(event.objectId, newObject);

                    if (sendDispatch) {
                        this.dispatch("create", newObject, event);
                    }
                    return newObject;
                }
            }
        }, {
            key: "applyUpdateOrCreateEvent",
            value: function applyUpdateOrCreateEvent(event) {
                var obj = this.get(event.objectId);
                if (!obj) {
                    obj = this.applyCreateEvent(event, false);
                    this.dispatch("create", obj, event);
                } else {
                    this.applyEventToObject(obj, event);
                }
                this.dispatch("updateOrCreate", obj, event);
                return obj;
            }
        }, {
            key: "applyDeleteEvent",
            value: function applyDeleteEvent(event) {
                var objDeleted = this.objects.get(event.objectId);
                if (objDeleted) {
                    this.objects.delete(event.objectId);
                    objDeleted.dispatch("delete", event, objDeleted);
                    this.dispatch("delete", objDeleted, event);
                }
                return objDeleted;
            }
        }, {
            key: "applyEventToObject",
            value: function applyEventToObject(obj, event) {
                obj.update(event);
                obj.dispatch("update", event);
                this.dispatch("update", obj, event);
                return obj;
            }
        }, {
            key: "applyEvent",
            value: function applyEvent(event) {
                if (event.type === "create") {
                    return this.applyCreateEvent(event);
                } else if (event.type === "delete") {
                    return this.applyDeleteEvent(event);
                } else if (event.type === "updateOrCreate") {
                    return this.applyUpdateOrCreateEvent(event);
                } else {
                    var obj = this.get(event.objectId);
                    if (!obj) {
                        console.error("I don't have object of type ", this.objectType, " ", event.objectId);
                        return;
                    }
                    return this.applyEventToObject(obj, event);
                }
            }
        }, {
            key: "importState",
            value: function importState(objects) {
                objects = objects || [];
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = objects[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var obj = _step2.value;

                        this.fakeCreate(obj);
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }
            }
        }, {
            key: "fakeCreate",
            value: function fakeCreate(obj) {
                var eventType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "fakeCreate";

                if (!obj) {
                    return;
                }
                var event = {
                    objectType: this.objectType,
                    objectId: obj.id,
                    type: eventType,
                    data: obj
                };
                return this.applyCreateEvent(event);
            }
        }, {
            key: "addCreateListener",
            value: function addCreateListener(callback, fakeExisting) {
                if (fakeExisting) {
                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (var _iterator3 = this.objects.values()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var object = _step3.value;

                            var _event = {
                                objectType: this.objectType,
                                objectId: object.id,
                                type: "fakeCreate",
                                data: object
                            };
                            callback(object, _event);
                        }
                    } catch (err) {
                        _didIteratorError3 = true;
                        _iteratorError3 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                _iterator3.return();
                            }
                        } finally {
                            if (_didIteratorError3) {
                                throw _iteratorError3;
                            }
                        }
                    }
                }

                return this.addListener("create", callback);
            }
        }, {
            key: "addUpdateListener",
            value: function addUpdateListener(callback) {
                return this.addListener("update", callback);
            }
        }, {
            key: "addDeleteListener",
            value: function addDeleteListener(callback) {
                return this.addListener("delete", callback);
            }
        }]);

        return GenericObjectStore;
    }(BaseStore);

    var SingletonStore = function (_BaseStore2) {
        _inherits(SingletonStore, _BaseStore2);

        function SingletonStore(objectType) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            _classCallCheck(this, SingletonStore);

            return _possibleConstructorReturn(this, (SingletonStore.__proto__ || Object.getPrototypeOf(SingletonStore)).call(this, objectType, SingletonStore, options));
        }

        _createClass(SingletonStore, [{
            key: "get",
            value: function get() {
                return this;
            }
        }, {
            key: "all",
            value: function all() {
                return [this];
            }
        }, {
            key: "applyEvent",
            value: function applyEvent(event) {
                this.update(event);
                this.dispatch("update", event, this);
            }
        }, {
            key: "importState",
            value: function importState(obj) {
                Object.assign(this, obj);
                this.dispatch("update", event, this);
            }
        }, {
            key: "addUpdateListener",
            value: function addUpdateListener(callback) {
                return this.addListener("update", callback);
            }
        }]);

        return SingletonStore;
    }(BaseStore);

    // Use the same logic as StoreObject when listening to events
    SingletonStore.prototype.addEventListener = StoreObject.prototype.addEventListener;

    exports.StoreObject = StoreObject;
    exports.BaseStore = BaseStore;
    exports.GenericObjectStore = GenericObjectStore;
    exports.SingletonStore = SingletonStore;
});
