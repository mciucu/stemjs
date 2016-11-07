define(["exports", "Dispatcher", "Store"], function (exports, _Dispatcher, _Store) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.BaseStore = exports.GenericObjectStore = exports.StoreObject = exports.GlobalState = exports.StateClass = undefined;

    function _toConsumableArray(arr) {
        if (Array.isArray(arr)) {
            for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
                arr2[i] = arr[i];
            }

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

    var StateClass = function (_Dispatchable) {
        _inherits(StateClass, _Dispatchable);

        function StateClass() {
            _classCallCheck(this, StateClass);

            var _this = _possibleConstructorReturn(this, (StateClass.__proto__ || Object.getPrototypeOf(StateClass)).call(this));

            _this.stores = new Map();
            // A version of applyEvent that's binded to this
            _this.applyEventWrapper = function (event) {
                _this.applyEvent(event);
            };
            return _this;
        }

        _createClass(StateClass, [{
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
                    var args = Array.prototype.slice.call(arguments, 1);
                    return store.get.apply(store, _toConsumableArray(args));
                } else {
                    console.error("GlobalState: Can't find store ", objectType);
                    return null;
                }
            }
        }, {
            key: "importStateFromTempMap",
            value: function importStateFromTempMap(objectType, stateMap) {
                var storeState = stateMap.get(objectType);
                stateMap.delete(objectType);

                var store = this.getStore(objectType);

                if (!store) {
                    console.error("Failed to import state, can't find store ", objectType);
                    return;
                }
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = store.getDependencies()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var dependency = _step2.value;

                        this.importStateFromTempMap(dependency.toLowerCase(), stateMap);
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

                store.importState(storeState);
            }
        }, {
            key: "importState",
            value: function importState(state) {
                // Import everything in a map and then do an implicit topological sort by dependencies
                var stateMap = new Map();
                for (var objectType in state) {
                    stateMap.set(objectType.toLowerCase(), state[objectType]);
                }
                while (stateMap.size > 0) {
                    var allKeys = stateMap.keys();
                    var _objectType = allKeys.next().value;
                    this.importStateFromTempMap(_objectType, stateMap);
                }
            }
        }]);

        return StateClass;
    }(_Dispatcher.Dispatchable);

    var GlobalState = new StateClass();

    if (window) {
        window.GlobalState = GlobalState;
    }

    exports.StateClass = StateClass;
    exports.GlobalState = GlobalState;
    exports.StoreObject = _Store.StoreObject;
    exports.GenericObjectStore = _Store.GenericObjectStore;
    exports.BaseStore = _Store.BaseStore;
});
