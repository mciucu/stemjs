define(["exports", "Dispatcher"], function (exports, _Dispatcher) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.BaseStore = exports.GenericObjectStore = exports.StoreObject = exports.GlobalState = exports.GlobalStateClass = undefined;

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

    var GlobalStateClass = function (_Dispatchable) {
        _inherits(GlobalStateClass, _Dispatchable);

        function GlobalStateClass() {
            _classCallCheck(this, GlobalStateClass);

            var _this = _possibleConstructorReturn(this, (GlobalStateClass.__proto__ || Object.getPrototypeOf(GlobalStateClass)).call(this));

            _this.stores = new Map();
            // TODO: applyEvent should have a bind decorator instead of this
            _this.applyEventWrapper = function (event) {
                _this.applyEvent(event);
            };
            return _this;
        }

        _createClass(GlobalStateClass, [{
            key: "getStore",
            value: function getStore(objectType) {
                objectType = objectType.toLowerCase();
                return this.stores.get(objectType);
            }
        }, {
            key: "addStore",
            value: function addStore(store) {
                var objectType = store.objectType.toLowerCase();
                if (!this.stores.has(objectType)) {
                    this.stores.set(objectType, store);
                } else {
                    throw Error("GlobalState: Adding a store for an existing object type: " + store.objectType);
                }
            }
        }, {
            key: "applyEvent",
            value: function applyEvent(event) {
                if (Array.isArray(event)) {
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = event[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var individualEvent = _step.value;

                            this.applyEvent(individualEvent);
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

                    return;
                }
                if (!event.hasOwnProperty("objectType")) {
                    console.error("GlobalState: Event does not contain 'objectType' property: ", event);
                    return;
                }
                var store = this.getStore(event.objectType);
                if (store) {
                    return store.applyEvent(event);
                } else {
                    console.log("GlobalState: Missing store for event: ", event);
                }
            }
        }, {
            key: "get",
            value: function get(objectType, objectId) {
                var store = this.getStore(objectType);
                if (store) {
                    return store.get(objectId);
                } else {
                    console.error("GlobalState: Can't find store ", objectType);
                    return null;
                }
            }
        }, {
            key: "importStateAndRemove",
            value: function importStateAndRemove(objectType, stateMap) {
                var objects = stateMap.get(objectType);
                stateMap.delete(objectType);

                var store = this.getStore(objectType);

                if (!store) {
                    console.error("GlobalState: Can't find store ", objectType);
                    return;
                }
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = store.getDependencies()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var dependency = _step2.value;

                        this.importStateAndRemove(dependency.toLowerCase(), stateMap);
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

                objects = objects || [];
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = objects[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var object = _step3.value;

                        // TODO: this makes the assumption that a store should implement fakeCreate, not sure if it should
                        store.fakeCreate(object);
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
        }, {
            key: "importState",
            value: function importState(state) {
                var stateMap = new Map();
                for (var objectType in state) {
                    stateMap.set(objectType.toLowerCase(), state[objectType]);
                }
                while (stateMap.size > 0) {
                    var allKeys = stateMap.keys();
                    var _objectType = allKeys.next().value;
                    this.importStateAndRemove(_objectType, stateMap);
                }
            }
        }]);

        return GlobalStateClass;
    }(_Dispatcher.Dispatchable);

    var StoreObject = function (_Dispatchable2) {
        _inherits(StoreObject, _Dispatchable2);

        function StoreObject(obj) {
            _classCallCheck(this, StoreObject);

            var _this2 = _possibleConstructorReturn(this, (StoreObject.__proto__ || Object.getPrototypeOf(StoreObject)).call(this));

            Object.assign(_this2, obj);
            return _this2;
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
            key: "addEventListener",
            value: function addEventListener(eventType, callback) {
                var _this3 = this;

                if (Array.isArray(eventType)) {
                    // let jobs = eventType.map(type => this.addEventListener(type, callback));
                    // return new CleanupJobs(jobs);

                    var cleanupJobs = new _Dispatcher.CleanupJobs();
                    var _iteratorNormalCompletion4 = true;
                    var _didIteratorError4 = false;
                    var _iteratorError4 = undefined;

                    try {
                        for (var _iterator4 = eventType[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            var type = _step4.value;

                            cleanupJobs.add(this.addEventListener(type, callback));
                        }
                    } catch (err) {
                        _didIteratorError4 = true;
                        _iteratorError4 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                _iterator4.return();
                            }
                        } finally {
                            if (_didIteratorError4) {
                                throw _iteratorError4;
                            }
                        }
                    }

                    return cleanupJobs;
                }
                // Ensure the private event dispatcher exists
                if (!this._eventDispatcher) {
                    this._eventDispatcher = new _Dispatcher.Dispatchable();
                    this.addUpdateListener(function (event) {
                        _this3._eventDispatcher.dispatch(event.type, event, _this3);
                    });
                }
                return this._eventDispatcher.addListener(eventType, callback);
            }
        }]);

        return StoreObject;
    }(_Dispatcher.Dispatchable);

    var BaseStore = function (_Dispatchable3) {
        _inherits(BaseStore, _Dispatchable3);

        function BaseStore(objectType) {
            var ObjectWrapper = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : StoreObject;
            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            _classCallCheck(this, BaseStore);

            var _this4 = _possibleConstructorReturn(this, (BaseStore.__proto__ || Object.getPrototypeOf(BaseStore)).call(this));

            _this4.options = options;
            _this4.objectType = objectType.toLowerCase();
            _this4.ObjectWrapper = ObjectWrapper;
            _this4.attachToState();
            return _this4;
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
        }, {
            key: "fakeCreate",
            value: function fakeCreate(obj) {}
        }]);

        return BaseStore;
    }(_Dispatcher.Dispatchable);

    var GenericObjectStore = function (_BaseStore) {
        _inherits(GenericObjectStore, _BaseStore);

        function GenericObjectStore(objectType) {
            var ObjectWrapper = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : StoreObject;
            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            _classCallCheck(this, GenericObjectStore);

            var _this5 = _possibleConstructorReturn(this, (GenericObjectStore.__proto__ || Object.getPrototypeOf(GenericObjectStore)).apply(this, arguments));

            _this5.objects = new Map();
            return _this5;
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
                var objDeleted = this.objects.delete(event.objectId);
                objDeleted.dispatch("delete", event, objDeleted);
                this.dispatch("delete", objDeleted, event);
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
                    var _iteratorNormalCompletion5 = true;
                    var _didIteratorError5 = false;
                    var _iteratorError5 = undefined;

                    try {
                        for (var _iterator5 = this.objects.values()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                            var object = _step5.value;

                            var event = {
                                objectType: this.objectType,
                                objectId: object.id,
                                type: "fakeCreate",
                                data: object
                            };
                            callback(object, event);
                        }
                    } catch (err) {
                        _didIteratorError5 = true;
                        _iteratorError5 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                _iterator5.return();
                            }
                        } finally {
                            if (_didIteratorError5) {
                                throw _iteratorError5;
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

    var GlobalState = new GlobalStateClass();

    if (window) {
        window.GlobalState = GlobalState;
    }

    exports.GlobalStateClass = GlobalStateClass;
    exports.GlobalState = GlobalState;
    exports.StoreObject = StoreObject;
    exports.GenericObjectStore = GenericObjectStore;
    exports.BaseStore = BaseStore;
});
