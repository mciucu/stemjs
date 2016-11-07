import { Dispatchable, CleanupJobs } from "../base/Dispatcher";

var StateClass = function (_Dispatchable) {
    babelHelpers.inherits(StateClass, _Dispatchable);

    function StateClass() {
        babelHelpers.classCallCheck(this, StateClass);

        var _this = babelHelpers.possibleConstructorReturn(this, (StateClass.__proto__ || Object.getPrototypeOf(StateClass)).call(this));

        _this.stores = new Map();
        // A version of applyEvent that's binded to this
        _this.applyEventWrapper = function (event) {
            _this.applyEvent(event);
        };
        return _this;
    }

    babelHelpers.createClass(StateClass, [{
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
                return store.get.apply(store, babelHelpers.toConsumableArray(args));
            } else {
                console.error("GlobalState: Can't find store ", objectType);
                return null;
            }
        }

        // Import the store for objectType and remove it from stateMap

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

        // Imports the state information from a plain object

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
}(Dispatchable);

var GlobalState = new StateClass();

if (window) {
    window.GlobalState = GlobalState;
}

export { StateClass, GlobalState };
