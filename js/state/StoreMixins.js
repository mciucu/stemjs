define(["exports", "Utils", "Ajax", "Dispatcher", "GlobalState"], function (exports, _Utils, _Ajax, _Dispatcher, _GlobalState) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.SingletonStore = exports.StoreObjectSubscribable = exports.VirtualStoreObjectMixin = exports.VirtualStoreMixin = exports.AjaxFetchMixin = undefined;

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

    var _get = function get(object, property, receiver) {
        if (object === null) object = Function.prototype;
        var desc = Object.getOwnPropertyDescriptor(object, property);

        if (desc === undefined) {
            var parent = Object.getPrototypeOf(object);

            if (parent === null) {
                return undefined;
            } else {
                return get(parent, property, receiver);
            }
        } else if ("value" in desc) {
            return desc.value;
        } else {
            var getter = desc.get;

            if (getter === undefined) {
                return undefined;
            }

            return getter.call(receiver);
        }
    };

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

    var SingletonStore = function (_StoreObject) {
        _inherits(SingletonStore, _StoreObject);

        function SingletonStore(objectType) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            _classCallCheck(this, SingletonStore);

            var _this = _possibleConstructorReturn(this, (SingletonStore.__proto__ || Object.getPrototypeOf(SingletonStore)).call(this));

            _this.objectType = objectType;
            _this.options = options;
            if (_this.getState()) {
                _this.getState().addStore(_this);
            }
            return _this;
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
            key: "applyEvent",
            value: function applyEvent(event) {
                this.update(event);
            }
        }, {
            key: "fakeCreate",
            value: function fakeCreate(obj) {
                Object.assign(this, obj);
            }
        }]);

        return SingletonStore;
    }(_GlobalState.StoreObject);

    function AjaxFetchMixin(BaseStoreClass) {
        return function (_BaseStoreClass) {
            _inherits(AjaxFetchMixin, _BaseStoreClass);

            function AjaxFetchMixin() {
                _classCallCheck(this, AjaxFetchMixin);

                return _possibleConstructorReturn(this, (AjaxFetchMixin.__proto__ || Object.getPrototypeOf(AjaxFetchMixin)).apply(this, arguments));
            }

            _createClass(AjaxFetchMixin, [{
                key: "fetch",
                value: function fetch(id, successCallback, errorCallback) {
                    var _this3 = this;

                    var forceFetch = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

                    if (!forceFetch) {
                        var obj = this.get(id);
                        if (obj) {
                            successCallback(obj);
                            return;
                        }
                    }
                    if (!this.fetchJobs) {
                        this.fetchJobs = [];
                    }
                    this.fetchJobs.push({ id: id, success: successCallback, error: errorCallback });
                    if (!this.fetchTimeout) {
                        this.fetchTimeout = setTimeout(function () {
                            _this3.executeAjaxFetch();
                        }, this.options.fetchTimeoutDuration || 0);
                    }
                }
            }, {
                key: "getFetchRequestData",
                value: function getFetchRequestData(ids, fetchJobs) {
                    return {
                        ids: ids
                    };
                }
            }, {
                key: "getFetchRequestObject",
                value: function getFetchRequestObject(ids, fetchJobs) {
                    var _this4 = this;

                    var requestData = this.getFetchRequestData(ids, fetchJobs);

                    // TODO: options.fetchURL should also support a function(ids, fetchJobs), do it when needed
                    return {
                        url: this.options.fetchURL,
                        type: this.options.fetchType || "GET",
                        dataType: "json",
                        data: requestData,
                        cache: false,
                        success: function success(data) {
                            if (data.error) {
                                console.error("Failed to fetch objects of type ", _this4.objectType, ":\n", data.error);
                                var _iteratorNormalCompletion = true;
                                var _didIteratorError = false;
                                var _iteratorError = undefined;

                                try {
                                    for (var _iterator = fetchJobs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                        var fetchJob = _step.value;

                                        if (fetchJob.error) {
                                            fetchJob.error(data.error);
                                        }
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
                            GlobalState.importState(data.state || {});
                            var _iteratorNormalCompletion2 = true;
                            var _didIteratorError2 = false;
                            var _iteratorError2 = undefined;

                            try {
                                for (var _iterator2 = fetchJobs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                    var _fetchJob = _step2.value;

                                    var obj = _this4.get(_fetchJob.id);
                                    if (obj) {
                                        _fetchJob.success(obj);
                                    } else {
                                        console.error("Failed to fetch object ", _fetchJob.id, " of type ", _this4.objectType);
                                        if (_fetchJob.error) {
                                            _fetchJob.error();
                                        }
                                    }
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
                        },
                        error: function error(xhr, errmsg, err) {
                            console.error("Error in fetching objects:\n" + xhr.status + ":\n" + xhr.responseText);
                            var _iteratorNormalCompletion3 = true;
                            var _didIteratorError3 = false;
                            var _iteratorError3 = undefined;

                            try {
                                for (var _iterator3 = fetchJobs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                    var fetchJob = _step3.value;

                                    if (fetchJob.error) {
                                        fetchJob.error("Network error");
                                    }
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
                    };
                }
            }, {
                key: "getFetchRequests",
                value: function getFetchRequests(fetchJobs) {
                    var idFetchJobs = new Map();

                    var _iteratorNormalCompletion4 = true;
                    var _didIteratorError4 = false;
                    var _iteratorError4 = undefined;

                    try {
                        for (var _iterator4 = fetchJobs[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            var fetchJob = _step4.value;

                            var objectId = fetchJob.id;
                            if (!idFetchJobs.has(objectId)) {
                                idFetchJobs.set(objectId, new Array());
                            }
                            idFetchJobs.get(objectId).push(fetchJob);
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

                    var maxChunkSize = this.options.maxFetchObjectCount || 256;

                    var idChunks = Utils.splitInChunks(Array.from(idFetchJobs.keys()), maxChunkSize);
                    var fetchJobsChunks = Utils.splitInChunks(Array.from(idFetchJobs.values()), maxChunkSize);

                    var requests = [];
                    for (var i = 0; i < idChunks.length; i += 1) {
                        requests.push(this.getFetchRequestObject(idChunks[i], Utils.unwrapArray(fetchJobsChunks[i])));
                    }

                    return requests;
                }
            }, {
                key: "executeAjaxFetch",
                value: function executeAjaxFetch() {
                    var fetchJobs = this.fetchJobs;
                    this.fetchJobs = null;

                    var requests = this.getFetchRequests(fetchJobs);

                    var _iteratorNormalCompletion5 = true;
                    var _didIteratorError5 = false;
                    var _iteratorError5 = undefined;

                    try {
                        for (var _iterator5 = requests[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                            var requestObject = _step5.value;

                            _Ajax.Ajax.request(requestObject);
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

                    clearTimeout(this.fetchTimeout);
                    this.fetchTimeout = null;
                }
            }]);

            return AjaxFetchMixin;
        }(BaseStoreClass);
    }

    function VirtualStoreObjectMixin(BaseStoreObjectClass) {
        return function (_BaseStoreObjectClass) {
            _inherits(VirtualStoreObjectMixin, _BaseStoreObjectClass);

            function VirtualStoreObjectMixin() {
                _classCallCheck(this, VirtualStoreObjectMixin);

                return _possibleConstructorReturn(this, (VirtualStoreObjectMixin.__proto__ || Object.getPrototypeOf(VirtualStoreObjectMixin)).apply(this, arguments));
            }

            _createClass(VirtualStoreObjectMixin, [{
                key: "hasTemporaryId",
                value: function hasTemporaryId() {
                    return (typeof this.id === "string" || this.id instanceof String) && this.id.startsWith("temp-");
                }
            }, {
                key: "updateId",
                value: function updateId(newId) {
                    if (this.id == newId) {
                        return;
                    }
                    var oldId = this.id;
                    if (!this.id.startsWith("temp-")) {
                        console.error("This is only meant to replace temporary ids!");
                    }
                    var store = this.constructor.store;
                    //TODO: should not access members of store direcly, use a method
                    store.objects.delete(this.id);
                    this.id = newId;
                    store.objects.set(this.id, this);
                    store.dispatch("updateObjectId", this, oldId);
                    this.dispatch("updateId", { oldId: oldId });
                }
            }]);

            return VirtualStoreObjectMixin;
        }(BaseStoreObjectClass);
    }

    function VirtualStoreMixin(BaseStoreClass) {
        return function (_BaseStoreClass2) {
            _inherits(VirtualStoreMixin, _BaseStoreClass2);

            function VirtualStoreMixin() {
                _classCallCheck(this, VirtualStoreMixin);

                return _possibleConstructorReturn(this, (VirtualStoreMixin.__proto__ || Object.getPrototypeOf(VirtualStoreMixin)).apply(this, arguments));
            }

            _createClass(VirtualStoreMixin, [{
                key: "generateVirtualId",
                value: function generateVirtualId() {
                    return this.constructor.generateVirtualId();
                }
            }, {
                key: "getVirtualObject",
                value: function getVirtualObject(event) {
                    return this.objects.get("temp-" + event.virtualId);
                }
            }, {
                key: "get",
                value: function get(id) {
                    return this.objects.get(id);
                }
            }, {
                key: "applyUpdateObjectId",
                value: function applyUpdateObjectId(object, event) {
                    object.updateId(event.objectId);
                }
            }, {
                key: "applyCreateEvent",
                value: function applyCreateEvent(event) {
                    var sendDispatch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

                    if (event.virtualId) {
                        var existingVirtualObject = this.getVirtualObject(event);
                        if (existingVirtualObject) {
                            this.applyUpdateObjectId(existingVirtualObject, event);
                        }
                    }

                    return _get(VirtualStoreMixin.prototype.__proto__ || Object.getPrototypeOf(VirtualStoreMixin.prototype), "applyCreateEvent", this).apply(this, arguments);
                }
            }], [{
                key: "generateVirtualId",
                value: function generateVirtualId() {
                    if (!this.virtualIdCounter) {
                        this.virtualIdCounter = 0;
                    }
                    this.virtualIdCounter += 1;
                    return this.virtualIdCounter;
                }
            }]);

            return VirtualStoreMixin;
        }(BaseStoreClass);
    }

    // TODO: not sure if the pattern used by the next class is good
    // Mixin class meant for easier adding listeners to store objects, while also adding those listeners to cleanup jobs
    // Should probably be used by UI elements that want to add listeners to store objects
    function StoreObjectSubscribable(BaseClass) {
        // TODO: is this the best way to ensure Cleanable inheritance?
        if (!(BaseClass instanceof _Dispatcher.Cleanable)) {
            BaseClass = (0, _Dispatcher.Cleanable)(BaseClass);
        }

        var StoreObjectSubscribable = function (_BaseClass) {
            _inherits(StoreObjectSubscribable, _BaseClass);

            function StoreObjectSubscribable() {
                _classCallCheck(this, StoreObjectSubscribable);

                return _possibleConstructorReturn(this, (StoreObjectSubscribable.__proto__ || Object.getPrototypeOf(StoreObjectSubscribable)).apply(this, arguments));
            }

            _createClass(StoreObjectSubscribable, [{
                key: "setStoreObject",
                value: function setStoreObject(obj) {
                    if (this.storeObject) {
                        console.error("You already have a store object: ", this.storeObject, " and want to set it to ", obj);
                    }
                    this.storeObject = obj;
                }
            }, {
                key: "getStoreObject",
                value: function getStoreObject() {
                    if (!this.storeObject) {
                        console.error("You need to specify either a callback or call setStoreObject before");
                    }
                    return this.storeObject;
                }
            }, {
                key: "addListener",
                value: function addListener(obj, eventName, callback) {
                    if (!callback) {
                        callback = eventName;
                        eventName = obj;
                        obj = this.getStoreObject();
                    }
                    this.addCleanupTask(obj.addListener(eventName, callback));
                }
            }, {
                key: "addUpdateListener",
                value: function addUpdateListener(obj, callback) {
                    if (!callback) {
                        callback = obj;
                        obj = this.getStoreObject();
                    }
                    this.addCleanupTask(obj.addUpdateListener(callback));
                }
            }, {
                key: "addEventListener",
                value: function addEventListener(obj, eventType, callback) {
                    if (!callback) {
                        callback = eventType;
                        eventType = obj;
                        obj = this.getStoreObject();
                    }
                    this.addCleanupTask(obj.addEventListener(eventType, callback));
                }
            }]);

            return StoreObjectSubscribable;
        }(BaseClass);

        return StoreObjectSubscribable;
    }

    exports.AjaxFetchMixin = AjaxFetchMixin;
    exports.VirtualStoreMixin = VirtualStoreMixin;
    exports.VirtualStoreObjectMixin = VirtualStoreObjectMixin;
    exports.StoreObjectSubscribable = StoreObjectSubscribable;
    exports.SingletonStore = SingletonStore;
});
