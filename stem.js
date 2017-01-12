(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.stem = global.stem || {})));
}(this, (function (exports) { 'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
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





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var get = function get(object, property, receiver) {
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

var inherits = function (subClass, superClass) {
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
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};





var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();













var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

// TODO: should this be renamed to "toUnwrappedArray"?
function unwrapArray(elements) {
    if (!elements) {
        return [];
    }

    if (!Array.isArray(elements)) {
        return [elements];
    }

    // Check if the passed in array is valid, and try to return it if possible to preserve references
    var allProperElements = true;
    for (var i = 0; i < elements.length; i++) {
        if (Array.isArray(elements[i]) || elements[i] == null) {
            allProperElements = false;
            break;
        }
    }

    if (allProperElements) {
        // Return the exact same array as was passed in
        return elements;
    }

    var result = [];
    for (var _i = 0; _i < elements.length; _i++) {
        if (Array.isArray(elements[_i])) {
            var unwrappedElement = unwrapArray(elements[_i]);
            for (var j = 0; j < unwrappedElement.length; j += 1) {
                result.push(unwrappedElement[j]);
            }
        } else {
            if (elements[_i] != null) {
                result.push(elements[_i]);
            }
        }
    }
    return result;
}

// Split the passed in array into arrays with at most maxChunkSize elements
function splitInChunks(array, maxChunkSize) {
    var chunks = [];
    while (array.length > 0) {
        chunks.push(array.splice(0, maxChunkSize));
    }
    return chunks;
}

function isIterable(obj) {
    if (obj == null) {
        return false;
    }
    return obj[Symbol.iterator] !== undefined;
}

function defaultComparator(a, b) {
    if (a == null && b == null) {
        return 0;
    }

    if (b == null) {
        return 1;
    }

    if (a == null) {
        return -1;
    }

    if (typeof a === "number" && typeof b === "number") {
        return a - b;
    }

    if (a.toString() === b.toString()) {
        return 0;
    }
    return a.toString() < b.toString() ? -1 : 1;
}

function slugify(string) {
    string = string.trim();

    string = string.replace(/[^a-zA-Z0-9-\s]/g, ""); // remove anything non-latin alphanumeric
    string = string.replace(/\s+/g, "-"); // replace whitespace with dashes
    string = string.replace(/-{2,}/g, "-"); // remove consecutive dashes
    string = string.toLowerCase();

    return string;
}

function suffixNumber(value, suffix) {
    if (typeof value === "number" || value instanceof Number) {
        return value + suffix;
    }
    return value;
}

function isPlainObject(obj) {
    if ((typeof obj === "undefined" ? "undefined" : _typeof(obj)) !== "object" || obj.nodeType) {
        return false;
    }
    if (obj.constructor && obj.constructor != Object) {
        return false;
    }
    return true;
}

function deepCopy() {
    var target = arguments[0] || {};
    // Handle case when target is a string or something (possible in deep copy)
    if ((typeof target === "undefined" ? "undefined" : _typeof(target)) !== "object" && typeof target !== "function") {
        target = {};
    }

    for (var i = 1; i < arguments.length; i += 1) {
        var obj = arguments[i];
        if (obj == null) {
            continue;
        }

        // Extend the base object
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = Object.entries(obj)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var _step$value = slicedToArray(_step.value, 2),
                    key = _step$value[0],
                    value = _step$value[1];

                // Recurse if we're merging plain objects or arrays
                if (isPlainObject(value) || Array.isArray(value)) {
                    var clone = void 0;
                    var src = target[key];

                    if (Array.isArray(value)) {
                        clone = src && Array.isArray(src) ? src : [];
                    } else {
                        clone = src && isPlainObject(src) ? src : {};
                    }

                    target[key] = deepCopy(clone, value);
                } else {
                    // TODO: if value has .clone() method, use that?
                    target[key] = value;
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
    }

    return target;
}

function objectFromKeyValue(key, value) {
    return defineProperty({}, key, value);
}

function dashCase(str) {
    var rez = "";
    for (var i = 0; i < str.length; i++) {
        if ("A" <= str[i] && str[i] <= "Z") {
            if (i > 0) {
                rez += "-";
            }
            rez += str[i].toLowerCase();
        } else {
            rez += str[i];
        }
    }
    return rez == str ? str : rez;
}

var DispatcherHandle = function () {
    function DispatcherHandle(dispatcher, callback) {
        classCallCheck(this, DispatcherHandle);

        this.dispatcher = dispatcher;
        this.callback = callback;
    }

    createClass(DispatcherHandle, [{
        key: "remove",
        value: function remove() {
            this.dispatcher.removeListener(this.callback);
            this.dispatcher = undefined;
            this.callback = undefined;
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
        classCallCheck(this, Dispatcher);

        this.options = options;
        this.listeners = [];
    }

    createClass(Dispatcher, [{
        key: "addListener",
        value: function addListener(callback) {
            if (!(typeof callback === "function")) {
                console.error("The listener needs to be a function: ", callback);
                return;
            }
            for (var i = 0; i < this.listeners.length; i += 1) {
                if (this.listeners[i] === callback) {
                    console.error("Can't re-register for the same callback: ", this, " ", callback);
                    return;
                }
            }

            this.listeners.push(callback);
            return new DispatcherHandle(this, callback);
        }
    }, {
        key: "addListenerOnce",
        value: function addListenerOnce(callback) {
            var handler = this.addListener(function () {
                callback.apply(undefined, arguments);
                handler.remove();
            });
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
        key: "removeAllListeners",
        value: function removeAllListeners() {
            this.listeners = [];
        }
    }, {
        key: "dispatch",
        value: function dispatch(payload) {
            for (var i = 0; i < this.listeners.length;) {
                var listener = this.listeners[i];
                // TODO: optimize common cases
                listener.apply(undefined, arguments);
                // In case the current listener deleted itself, keep the loop counter the same
                // If it deleted listeners that were executed before it, that's just wrong and there are no guaranteed about
                if (listener === this.listeners[i]) {
                    i++;
                }
            }
        }
    }]);
    return Dispatcher;
}();

var Dispatchable = function () {
    function Dispatchable() {
        classCallCheck(this, Dispatchable);
    }

    createClass(Dispatchable, [{
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
                    dispatcher.dispatch.apply(dispatcher, toConsumableArray(args));
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
            this.runCleanupJobs();
            delete this._dispatchers;
        }

        // These function don't really belong here, but they don't really hurt here and I don't want a long proto chain
        // Add anything that needs to be called on cleanup here (dispatchers, etc)

    }, {
        key: "addCleanupJob",
        value: function addCleanupJob(cleanupJob) {
            if (!this.hasOwnProperty("_cleanupJobs")) {
                this._cleanupJobs = new CleanupJobs();
            }
            this._cleanupJobs.add(cleanupJob);
            return cleanupJob;
        }
    }, {
        key: "runCleanupJobs",
        value: function runCleanupJobs() {
            if (this._cleanupJobs) {
                this._cleanupJobs.cleanup();
            }
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

// Creates a method that calls the method methodName on obj, and adds the result as a cleanup task


function getAttachCleanupJobMethod(methodName) {
    return function (obj) {
        var args = Array.prototype.slice.call(arguments, 1);
        var handler = obj[methodName].apply(obj, toConsumableArray(args));
        this.addCleanupJob(handler);
        return handler;
    };
}

// Not sure if these should be added here, but meh
Dispatchable.prototype.attachListener = getAttachCleanupJobMethod("addListener");
Dispatchable.prototype.attachEventListener = getAttachCleanupJobMethod("addEventListener");
Dispatchable.prototype.attachCreateListener = getAttachCleanupJobMethod("addCreateListener");
Dispatchable.prototype.attachUpdateListener = getAttachCleanupJobMethod("addUpdateListener");
Dispatchable.prototype.attachDeleteListener = getAttachCleanupJobMethod("addDeleteListener");

Dispatcher.Global = new Dispatchable();

var RunOnce = function () {
    function RunOnce() {
        classCallCheck(this, RunOnce);
    }

    createClass(RunOnce, [{
        key: "run",
        value: function run(callback) {
            var _this2 = this;

            var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            if (this.timeout) {
                return;
            }
            this.timeout = setTimeout(function () {
                callback();
                _this2.timeout = undefined;
            }, timeout);
        }
    }]);
    return RunOnce;
}();

var CleanupJobs = function () {
    function CleanupJobs() {
        var jobs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        classCallCheck(this, CleanupJobs);

        this.jobs = jobs;
    }

    createClass(CleanupJobs, [{
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

                    if (typeof job.cleanup === "function") {
                        job.cleanup();
                    } else if (typeof job.remove === "function") {
                        job.remove();
                    } else {
                        job();
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

// Class that can be used to pass around ownership of a resource.
// It informs the previous owner of the change (once) and dispatches the new element for all listeners
// TODO: a better name


var SingleActiveElementDispatcher = function (_Dispatcher) {
    inherits(SingleActiveElementDispatcher, _Dispatcher);

    function SingleActiveElementDispatcher() {
        classCallCheck(this, SingleActiveElementDispatcher);
        return possibleConstructorReturn(this, (SingleActiveElementDispatcher.__proto__ || Object.getPrototypeOf(SingleActiveElementDispatcher)).apply(this, arguments));
    }

    createClass(SingleActiveElementDispatcher, [{
        key: "setActive",
        value: function setActive(element, addChangeListener, forceDispatch) {
            if (!forceDispatch && element === this._active) {
                return;
            }
            this._active = element;
            this.dispatch(element);
            if (addChangeListener) {
                this.addListenerOnce(function (newElement) {
                    if (newElement != element) {
                        addChangeListener(newElement);
                    }
                });
            }
        }
    }, {
        key: "getActive",
        value: function getActive() {
            return this._active;
        }
    }]);
    return SingleActiveElementDispatcher;
}(Dispatcher);

// TODO: this method should be made static in NodeAttributes probably
function CreateNodeAttributesMap(oldAttributesMap, allowedAttributesArray) {
    var allowedAttributesMap = new Map(oldAttributesMap);

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = (allowedAttributesArray || [])[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var attribute = _step.value;

            if (!attribute) continue;
            if (!Array.isArray(attribute)) {
                attribute = [attribute];
            }
            allowedAttributesMap.set(attribute[0], attribute[1] || {});
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

    allowedAttributesMap.reverseNameMap = new Map();

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = allowedAttributesMap[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _step2$value = slicedToArray(_step2.value, 2),
                key = _step2$value[0],
                value = _step2$value[1];

            value = value || {};

            value.domName = value.domName || key;

            allowedAttributesMap.reverseNameMap.set(value.domName, key);

            allowedAttributesMap.set(key, value);
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

    return allowedAttributesMap;
}

// A class that can be used to work with a className field as with a Set, while having a toString() usable in the DOM

var ClassNameSet = function (_Set) {
    inherits(ClassNameSet, _Set);

    function ClassNameSet() {
        classCallCheck(this, ClassNameSet);
        return possibleConstructorReturn(this, (ClassNameSet.__proto__ || Object.getPrototypeOf(ClassNameSet)).apply(this, arguments));
    }

    createClass(ClassNameSet, [{
        key: "toString",
        value: function toString() {
            return Array.from(this).join(" ");
        }
    }], [{
        key: "create",

        // Can't use classic super in constructor since Set is build-in type and will throw an error
        // TODO: see if could still be made to have this as constructor
        value: function create(className) {
            var value = new Set(String(className || "").split(" "));
            value.__proto__ = this.prototype;
            return value;
        }
    }]);
    return ClassNameSet;
}(Set);

var NodeAttributes = function () {
    function NodeAttributes(obj) {
        classCallCheck(this, NodeAttributes);

        Object.assign(this, obj);
        // className and style should be deep copied to be modifiable, the others shallow copied
        if (this.className instanceof ClassNameSet) {
            this.className = ClassNameSet.create(String(this.className));
        }
        if (this.style) {
            this.style = Object.assign({}, this.style);
        }
    }

    // TODO: should this use the domName or the reverseName? Still needs work


    createClass(NodeAttributes, [{
        key: "setAttribute",
        value: function setAttribute(key, value, node) {
            var attributesMap = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : this.constructor.defaultAttributesMap;

            // TODO: might want to find a better way than whitelistAttributes field to do this
            if (!attributesMap.has(key)) {
                this.whitelistedAttributes = this.whitelistedAttributes || {};
                this.whitelistedAttributes[key] = true;
            }
            this[key] = value;
            if (node) {
                this.applyAttribute(key, node, attributesMap);
            }
        }
    }, {
        key: "setStyle",
        value: function setStyle(key, value, node) {
            if (value === undefined) {
                console.error("Style is being removed");
                // TODO: why return here and not remove the old value?
                return;
            }
            this.style = this.style || {};
            this.style[key] = value;
            if (typeof value === "function") {
                value = value();
            }
            if (node && node.style[key] !== value) {
                node.style[key] = value;
            }
        }

        // TODO: should just be a regular method?

    }, {
        key: "getClassNameSet",
        value: function getClassNameSet() {
            if (!(this.className instanceof ClassNameSet)) {
                this.className = ClassNameSet.create(this.className || "");
            }
            return this.className;
        }
    }, {
        key: "addClass",
        value: function addClass(classes, node) {
            classes = this.constructor.getClassArray(classes);

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = classes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var cls = _step3.value;

                    this.getClassNameSet().add(cls);
                    if (node) {
                        node.classList.add(cls);
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
    }, {
        key: "removeClass",
        value: function removeClass(classes, node) {
            classes = this.constructor.getClassArray(classes);

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = classes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var cls = _step4.value;

                    this.getClassNameSet().delete(cls);
                    if (node) {
                        node.classList.remove(cls);
                    }
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
        }
    }, {
        key: "applyAttribute",
        value: function applyAttribute(key, node, attributesMap) {
            var attributeOptions = attributesMap.get(key);
            if (!attributeOptions) {
                if (this.whitelistedAttributes && key in this.whitelistedAttributes) {
                    attributeOptions = {
                        domName: key
                    };
                } else {
                    return;
                }
            }
            var value = this[key];
            if (typeof value === "function") {
                value = value();
            }
            if (attributeOptions.noValue) {
                if (value) {
                    value = "";
                } else {
                    value = undefined;
                }
            }
            if (typeof value !== "undefined") {
                node.setAttribute(attributeOptions.domName, value);
            } else {
                node.removeAttribute(attributeOptions.domName);
            }
        }
    }, {
        key: "apply",
        value: function apply(node, attributesMap) {
            var addedAttributes = {};
            var whitelistedAttributes = this.whitelistedAttributes || {};

            // First update existing node attributes and delete old ones
            // TODO: optimize to not run this if the node was freshly created
            var nodeAttributes = node.attributes;
            for (var i = nodeAttributes.length - 1; i >= 0; i--) {
                var attr = nodeAttributes[i];
                var attributeName = attr.name;
                if (attributeName === "style" || attributeName === "class") {
                    // TODO: maybe should do work here?
                    continue;
                }

                var key = attributesMap.reverseNameMap.get(attributeName);

                // TODO: this is wrong since it doesn't do reverse mapping
                if (this.hasOwnProperty(key)) {
                    var value = this[key];
                    var attributeOptions = attributesMap.get(key);
                    if (attributeOptions && attributeOptions.noValue) {
                        if (value) {
                            value = "";
                        } else {
                            value = undefined;
                        }
                    }
                    if (value != null) {
                        node.setAttribute(attributeName, value);
                        addedAttributes[key] = true;
                    } else {
                        node.removeAttribute(attributeName);
                    }
                } else {
                    node.removeAttribute(attributeName);
                }
            }
            // Add new attributes
            for (var _key in this) {
                if (addedAttributes[_key]) {
                    continue;
                }
                this.applyAttribute(_key, node, attributesMap);
                // TODO: also whitelist data- and aria- keys here
            }

            if (this.className) {
                node.className = String(this.className);
                // TODO: find out which solution is best
                // This solution works for svg nodes as well
                // for (let cls of this.getClassNameSet()) {
                //    node.classList.add(cls);
                // }
            } else {
                node.removeAttribute("class");
            }

            node.removeAttribute("style");
            if (this.style) {
                for (var _key2 in this.style) {
                    var _value = this.style[_key2];
                    if (typeof _value === "function") {
                        _value = _value();
                    }
                    node.style[_key2] = _value;
                }
            }
        }
    }], [{
        key: "getClassArray",
        value: function getClassArray(classes) {
            if (!classes) {
                return [];
            }
            if (Array.isArray(classes)) {
                return classes.map(function (x) {
                    return String(x).trim();
                });
            } else {
                return String(classes).trim().split(" ");
            }
        }
    }]);
    return NodeAttributes;
}();

// Default node attributes, should be as few of these as possible


NodeAttributes.defaultAttributesMap = CreateNodeAttributesMap([["id"], ["action"], ["colspan"], ["default"], ["disabled", { noValue: true }], ["fixed"], ["forAttr", { domName: "for" }], // TODO: have a consistent nomenclature for there!
["hidden"], ["href"], ["rel"], ["minHeight"], ["minWidth"], ["role"], ["target"], ["HTMLtitle", { domName: "title" }], ["type"], ["placeholder"], ["src"], ["height"], ["width"]]);

var UI = {
    renderingStack: [] };

var BaseUIElement = function (_Dispatchable) {
    inherits(BaseUIElement, _Dispatchable);

    function BaseUIElement() {
        classCallCheck(this, BaseUIElement);
        return possibleConstructorReturn(this, (BaseUIElement.__proto__ || Object.getPrototypeOf(BaseUIElement)).apply(this, arguments));
    }

    createClass(BaseUIElement, [{
        key: "canOverwrite",
        value: function canOverwrite(existingChild) {
            return this.constructor === existingChild.constructor && this.getNodeType() === existingChild.getNodeType();
        }
    }, {
        key: "applyRef",
        value: function applyRef() {
            if (this.options && this.options.ref) {
                var obj = this.options.ref.parent;
                var name = this.options.ref.name;
                obj[name] = this;
            }
        }
    }, {
        key: "removeRef",
        value: function removeRef() {
            if (this.options && this.options.ref) {
                var obj = this.options.ref.parent;
                var name = this.options.ref.name;
                if (obj[name] === this) {
                    obj[name] = undefined; //TODO: better delete from obj?
                }
            }
        }
    }, {
        key: "onMount",
        value: function onMount() {
            // Nothing by default
        }
    }, {
        key: "onUnmount",
        value: function onUnmount() {}
    }, {
        key: "destroyNode",
        value: function destroyNode() {
            this.onUnmount();
            this.cleanup();
            this.removeRef();
            this.node.remove();
            this.node = undefined; // Clear for gc
        }
    }]);
    return BaseUIElement;
}(Dispatchable);

UI.TextElement = function (_BaseUIElement) {
    inherits(UITextElement, _BaseUIElement);

    function UITextElement() {
        var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
        classCallCheck(this, UITextElement);

        var _this2 = possibleConstructorReturn(this, (UITextElement.__proto__ || Object.getPrototypeOf(UITextElement)).call(this));

        if (value && value.hasOwnProperty("value")) {
            _this2.value = value.value;
            _this2.options = value;
        } else {
            _this2.value = value != null ? value : "";
        }
        return _this2;
    }

    createClass(UITextElement, [{
        key: "mount",
        value: function mount(parent, nextSibling) {
            this.parent = parent;
            if (!this.node) {
                this.createNode();
                this.applyRef();
            } else {
                this.redraw();
            }
            parent.node.insertBefore(this.node, nextSibling);
            this.onMount();
        }
    }, {
        key: "getNodeType",
        value: function getNodeType() {
            return Node.TEXT_NODE;
        }
    }, {
        key: "copyState",
        value: function copyState(element) {
            this.value = element.value;
            this.options = element.options;
        }
    }, {
        key: "createNode",
        value: function createNode() {
            return this.node = document.createTextNode(this.getValue());
        }
    }, {
        key: "setValue",
        value: function setValue(value) {
            this.value = value != null ? value : "";
            if (this.node) {
                this.redraw();
            }
        }
    }, {
        key: "getValue",
        value: function getValue() {
            return String(this.value);
        }
    }, {
        key: "redraw",
        value: function redraw() {
            if (this.node) {
                var newValue = this.getValue();
                // TODO: check if this is best for performance
                if (this.node.nodeValue !== newValue) {
                    this.node.nodeValue = newValue;
                }
            }
            this.applyRef();
        }
    }]);
    return UITextElement;
}(BaseUIElement);

var UIElement = function (_BaseUIElement2) {
    inherits(UIElement, _BaseUIElement2);

    function UIElement() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        classCallCheck(this, UIElement);

        var _this3 = possibleConstructorReturn(this, (UIElement.__proto__ || Object.getPrototypeOf(UIElement)).call(this));

        _this3.children = [];
        _this3.options = options; // TODO: this is a hack, to not break all the code that references this.options in setOptions
        _this3.setOptions(options);
        return _this3;
    }

    createClass(UIElement, [{
        key: "getDefaultOptions",
        value: function getDefaultOptions() {}
    }, {
        key: "getPreservedOptions",
        value: function getPreservedOptions() {}
    }, {
        key: "setOptions",
        value: function setOptions(options) {
            // TODO: should this be here or in createElement?
            var defaultOptions = this.getDefaultOptions();
            if (defaultOptions) {
                options = Object.assign(defaultOptions, options);
            }
            this.options = options;
        }
    }, {
        key: "updateOptions",
        value: function updateOptions(options) {
            this.setOptions(Object.assign(this.options, options));
            this.redraw();
        }
    }, {
        key: "setChildren",
        value: function setChildren() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            this.updateOptions({ children: unwrapArray(args) });
        }

        // Used when we want to reuse the current element, with the options from the passed in argument
        // Is only called when element.canOverwrite(this) is true

    }, {
        key: "copyState",
        value: function copyState(element) {
            var options = element.options;
            var preservedOptions = this.getPreservedOptions();
            if (preservedOptions) {
                options = Object.assign({}, options, preservedOptions);
            }
            this.setOptions(options);
            this.addListenersFromOptions(this.options);
        }
    }, {
        key: "getNodeType",
        value: function getNodeType() {
            return this.options.nodeType || "div";
        }
    }, {
        key: "getGivenChildren",


        // TODO: should be renamed to renderContent
        value: function getGivenChildren() {
            return this.options.children || [];
        }
    }, {
        key: "render",
        value: function render() {
            return this.options.children;
        }
    }, {
        key: "createNode",
        value: function createNode() {
            return this.node = document.createElement(this.getNodeType());
        }

        // Abstract, gets called when removing DOM node associated with the

    }, {
        key: "cleanup",
        value: function cleanup() {
            this.runCleanupJobs();
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var child = _step.value;

                    child.cleanup();
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

            this.clearNode();
            get(UIElement.prototype.__proto__ || Object.getPrototypeOf(UIElement.prototype), "cleanup", this).call(this);
        }
    }, {
        key: "overwriteChild",
        value: function overwriteChild(existingChild, newChild) {
            existingChild.copyState(newChild);
            return existingChild;
        }
    }, {
        key: "getElementKeyMap",
        value: function getElementKeyMap(elements) {
            if (!elements || !elements.length) {
                return;
            }
            var childrenKeyMap = new Map();

            for (var i = 0; i < elements.length; i += 1) {
                var childKey = elements[i].options && elements[i].options.key || "autokey" + i;

                childrenKeyMap.set(childKey, elements[i]);
            }

            return childrenKeyMap;
        }
    }, {
        key: "redraw",
        value: function redraw() {
            if (!this.node) {
                console.error("Element not yet mounted. Redraw aborted!", this);
                return false;
            }

            UI.renderingStack.push(this);
            var newChildren = unwrapArray(this.render());
            UI.renderingStack.pop();

            if (newChildren === this.children) {
                for (var i = 0; i < newChildren.length; i += 1) {
                    newChildren[i].redraw();
                }
                this.applyNodeAttributes();
                this.applyRef();
                return true;
            }

            var domNode = this.node;
            var childrenKeyMap = this.getElementKeyMap(this.children);

            for (var _i = 0; _i < newChildren.length; _i++) {
                var newChild = newChildren[_i];
                var prevChildNode = _i > 0 ? newChildren[_i - 1].node : null;
                var currentChildNode = prevChildNode ? prevChildNode.nextSibling : domNode.firstChild;

                // Not a UIElement, to be converted to a TextElement
                if (!newChild.getNodeType) {
                    newChild = newChildren[_i] = new UI.TextElement(newChild);
                }

                var newChildKey = newChild.options && newChild.options.key || "autokey" + _i;
                var existingChild = childrenKeyMap && childrenKeyMap.get(newChildKey);

                if (existingChild && newChildren[_i].canOverwrite(existingChild)) {
                    // We're replacing an existing child element, it might be the very same object
                    if (existingChild !== newChildren[_i]) {
                        newChildren[_i] = this.overwriteChild(existingChild, newChildren[_i]);
                    }
                    newChildren[_i].redraw();
                    if (newChildren[_i].node !== currentChildNode) {
                        domNode.insertBefore(newChildren[_i].node, currentChildNode);
                    }
                } else {
                    // Getting here means we are not replacing anything, should just render
                    newChild.mount(this, currentChildNode);
                }
            }

            if (this.children.length) {
                // Remove children that don't need to be here
                var newChildrenSet = new Set(newChildren);

                for (var _i2 = 0; _i2 < this.children.length; _i2 += 1) {
                    if (!newChildrenSet.has(this.children[_i2])) {
                        this.children[_i2].destroyNode();
                    }
                }
            }

            this.children = newChildren;

            this.applyNodeAttributes();

            this.applyRef();

            return true;
        }
    }, {
        key: "getNodeAttributes",
        value: function getNodeAttributes() {
            var returnCopy = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            if (returnCopy) {
                return new NodeAttributes(this.options);
            }
            var attr = this.options;
            attr.__proto__ = NodeAttributes.prototype;
            return attr;
        }
    }, {
        key: "applyNodeAttributes",
        value: function applyNodeAttributes() {
            var attr = void 0;
            if (this.extraNodeAttributes) {
                // Create a copy of options, that is modifiable
                attr = this.getNodeAttributes(true);
                this.extraNodeAttributes(attr);
            } else {
                attr = this.getNodeAttributes(false);
            }
            attr.apply(this.node, this.constructor.domAttributesMap);
        }
    }, {
        key: "setAttribute",
        value: function setAttribute(key, value) {
            this.getNodeAttributes(false).setAttribute(key, value, this.node, this.constructor.domAttributesMap);
        }
    }, {
        key: "setStyle",
        value: function setStyle(key, value) {
            this.getNodeAttributes(false).setStyle(key, value, this.node);
        }
    }, {
        key: "addClass",
        value: function addClass(className) {
            this.getNodeAttributes(false).addClass(className, this.node);
        }
    }, {
        key: "removeClass",
        value: function removeClass(className) {
            this.getNodeAttributes(false).removeClass(className, this.node);
        }
    }, {
        key: "hasClass",
        value: function hasClass(className) {
            // TODO: should use NodeAttributes
            return this.node && this.node.classList.contains(className);
        }
    }, {
        key: "toggleClass",
        value: function toggleClass(className) {
            if (!this.hasClass(className)) {
                this.addClass(className);
            } else {
                this.removeClass(className);
            }
        }
    }, {
        key: "addListenersFromOptions",
        value: function addListenersFromOptions(options) {
            var _this4 = this;

            var _loop = function _loop(opt) {
                if (typeof opt === "string" && opt.startsWith("on") && opt.length > 2) {
                    var eventType = opt.substring(2);

                    var addListenerMethodName = "add" + eventType + "Listener";
                    var handlerMethodName = "on" + eventType + "Handler";

                    // The handlerMethod might have been previously added 
                    // by a previous call to this function or manually by the user
                    if (typeof _this4[addListenerMethodName] === "function" && !_this4.hasOwnProperty(handlerMethodName)) {
                        _this4[handlerMethodName] = function (event) {
                            UI.event = event;
                            if (_this4.options[opt]) {
                                _this4.options[opt](_this4, event);
                            }
                        };

                        // Actually add the listener
                        _this4[addListenerMethodName](_this4[handlerMethodName]);
                    }
                }
            };

            for (var opt in options) {
                _loop(opt);
            }
        }
    }, {
        key: "refLink",
        value: function refLink(name) {
            return { parent: this, name: name };
        }
    }, {
        key: "refLinkArray",
        value: function refLinkArray(arrayName, index) {
            if (!this.hasOwnProperty(arrayName)) {
                this[arrayName] = [];
            }
            return { parent: this[arrayName], name: index };
        }
    }, {
        key: "mount",
        value: function mount(parent, nextSiblingNode) {
            if (!parent.node) {
                var parentWrapper = new UI.Element();
                parentWrapper.node = parent;
                parent = parentWrapper;
            }
            this.parent = parent;
            if (!this.node) {
                this.createNode();
            }
            this.redraw();

            parent.insertChildNodeBefore(this, nextSiblingNode);

            this.addListenersFromOptions(this.options);

            this.onMount();
        }

        // You need to overwrite the next child manipulation rutines if this.options.children !== this.children

    }, {
        key: "appendChild",
        value: function appendChild(child) {
            // TODO: the next check should be done with a decorator
            if (this.children !== this.options.children) {
                throw "Can't properly handle appendChild, you need to implement it for " + this.constructor;
            }
            this.options.children.push(child);
            child.mount(this, null);
            return child;
        }
    }, {
        key: "insertChild",
        value: function insertChild(child, position) {
            if (this.children !== this.options.children) {
                throw "Can't properly handle insertChild, you need to implement it for " + this.constructor;
            }
            position = position || 0;

            this.options.children.splice(position, 0, child);

            child.mount(this, position + 1 < this.options.children.length ? this.children[position + 1].node : null);

            return child;
        }
    }, {
        key: "eraseChild",
        value: function eraseChild(child) {
            var destroy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            var index = this.options.children.indexOf(child);

            if (index < 0) {
                // child not found
                return null;
            }
            return this.eraseChildAtIndex(index, destroy);
        }
    }, {
        key: "eraseChildAtIndex",
        value: function eraseChildAtIndex(index) {
            var destroy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            if (index < 0 || index >= this.options.children.length) {
                console.error("Erasing child at invalid index ", index, this.options.children.length);
                return;
            }
            if (this.children !== this.options.children) {
                throw "Can't properly handle eraseChild, you need to implement it for " + this.constructor;
            }
            var erasedChild = this.options.children.splice(index, 1)[0];
            if (destroy) {
                erasedChild.destroyNode();
            } else {
                this.node.removeChild(erasedChild.node);
            }
            return erasedChild;
        }
    }, {
        key: "eraseAllChildren",
        value: function eraseAllChildren() {
            while (this.children.length > 0) {
                this.eraseChildAtIndex(this.children.length - 1);
            }
        }
    }, {
        key: "show",
        value: function show() {
            this.removeClass("hidden");
        }
    }, {
        key: "hide",
        value: function hide() {
            this.addClass("hidden");
        }
    }, {
        key: "insertChildNodeBefore",
        value: function insertChildNodeBefore(childElement, nextSiblingNode) {
            this.node.insertBefore(childElement.node, nextSiblingNode);
        }

        // TODO: should be renamed emptyNode()

    }, {
        key: "clearNode",
        value: function clearNode() {
            while (this.node && this.node.lastChild) {
                this.node.removeChild(this.node.lastChild);
            }
        }

        // TODO: rethink this, should probably be in utils

    }, {
        key: "uniqueId",
        value: function uniqueId() {
            if (!this.hasOwnProperty("uniqueIdStr")) {
                // TODO: should this be global?
                this.constructor.objectCount = (this.constructor.objectCount || 0) + 1;
                this.uniqueIdStr = this.constructor.objectCount + "R" + Math.random().toString(36).substr(2);
            }
            return this.uniqueIdStr;
        }

        // TODO: this doesn't belong here

    }, {
        key: "getOffset",
        value: function getOffset() {
            var node = this.node;
            if (!node) {
                return { left: 0, top: 0 };
            }
            var nodePosition = node.style ? node.style.position : null;
            var left = 0;
            var top = 0;
            while (node) {
                var nodeStyle = node.style || {};
                if (nodePosition === "absolute" && nodeStyle.position === "relative") {
                    return { left: left, top: top };
                }
                left += node.offsetLeft;
                top += node.offsetTop;
                node = node.offsetParent;
            }
            return { left: left, top: top };
        }
    }, {
        key: "getStyle",
        value: function getStyle(attribute) {
            // return this.options.style[attribute];
            // TODO: WHY THIS? remove this!!!
            return window.getComputedStyle(this.node, null).getPropertyValue(attribute);
        }
    }, {
        key: "isInDocument",
        value: function isInDocument() {
            return document.body.contains(this.node);
        }

        // TODO: this method also doesn't belong here

    }, {
        key: "getWidthOrHeight",
        value: function getWidthOrHeight(parameter) {
            var node = this.node;
            if (!node) {
                return 0;
            }
            var value = parseFloat(parameter === "width" ? node.offsetWidth : node.offsetHeight);
            return value || 0;
        }
    }, {
        key: "getHeight",
        value: function getHeight() {
            return this.getWidthOrHeight("height");
        }
    }, {
        key: "getWidth",
        value: function getWidth() {
            return this.getWidthOrHeight("width");
        }
    }, {
        key: "setHeight",
        value: function setHeight(value) {
            if (typeof value === "number") {
                value += "px";
            }
            this.setStyle("height", value);
            this.dispatch("resize");
        }
    }, {
        key: "setWidth",
        value: function setWidth(value) {
            if (typeof value === "number") {
                value += "px";
            }
            this.setStyle("width", value);
            this.dispatch("resize");
        }
    }, {
        key: "addNodeListener",
        value: function addNodeListener(name, callback) {
            var _this5 = this;

            this.node.addEventListener(name, callback);
            return {
                remove: function remove() {
                    return _this5.removeNodeListener(name, callback);
                }
            };
        }
    }, {
        key: "removeNodeListener",
        value: function removeNodeListener(name, callback) {
            this.node.removeEventListener(name, callback);
        }
    }, {
        key: "addClickListener",
        value: function addClickListener(callback) {
            this.addNodeListener("click", callback);
        }
    }, {
        key: "removeClickListener",
        value: function removeClickListener(callback) {
            this.removeNodeListener("click", callback);
        }
    }, {
        key: "addDoubleClickListener",
        value: function addDoubleClickListener(callback) {
            this.addNodeListener("dblclick", callback);
        }
    }, {
        key: "removeDoubleClickListener",
        value: function removeDoubleClickListener(callback) {
            this.removeNodeListener("dblclick", callback);
        }
    }, {
        key: "addChangeListener",
        value: function addChangeListener(callback) {
            this.addNodeListener("change", callback);
        }
    }], [{
        key: "create",
        value: function create(parentNode, options) {
            var uiElement = new this(options);
            uiElement.mount(parentNode, null);
            return uiElement;
        }
    }]);
    return UIElement;
}(BaseUIElement);

UI.createElement = function (tag, options) {
    if (!tag) {
        console.error("Create element needs a valid object tag, did you mistype a class name?");
        return;
    }

    options = options || {};

    options.children = [];

    for (var i = 2; i < arguments.length; i += 1) {
        options.children.push(arguments[i]);
    }

    options.children = unwrapArray(options.children);

    if (options.ref) {
        if (typeof options.ref === "string") {
            if (UI.renderingStack.length > 0) {
                options.ref = {
                    parent: UI.renderingStack[UI.renderingStack.length - 1],
                    name: options.ref
                };
            } else {
                throw Error("Failed to automatically link ref, there needs to be an element in the rendering stack");
            }
        }

        if (options.key) {
            console.error("Warning! UI Element cannot have both a key and a ref fieldname. Key will be overriden.\n" + "Are you using the options from another object? Shame!", options);
        }

        options.key = "_ref" + options.ref.name;
    }

    if (options.hasOwnProperty("class")) {
        console.error("Invalid UI Element attribute: class. Did you mean className?");
    }

    if (typeof tag === "string") {
        options.nodeType = tag;
        tag = UIElement;
    }

    return new tag(options);
};

UIElement.domAttributesMap = NodeAttributes.defaultAttributesMap;

UI.Element = UIElement;

UI.str = function (value) {
    return new UI.TextElement(value);
};

// Keep a map for every base class, and for each base class keep a map for each nodeType, to cache classes
var primitiveMap = new WeakMap();

UI.Primitive = function (BaseClass, nodeType) {
    if (!nodeType) {
        nodeType = BaseClass;
        BaseClass = UI.Element;
    }
    var baseClassPrimitiveMap = primitiveMap.get(BaseClass);
    if (!baseClassPrimitiveMap) {
        baseClassPrimitiveMap = new Map();
        primitiveMap.set(BaseClass, baseClassPrimitiveMap);
    }
    var resultClass = baseClassPrimitiveMap.get(nodeType);
    if (resultClass) {
        return resultClass;
    }
    resultClass = function (_BaseClass) {
        inherits(Primitive, _BaseClass);

        function Primitive() {
            classCallCheck(this, Primitive);
            return possibleConstructorReturn(this, (Primitive.__proto__ || Object.getPrototypeOf(Primitive)).apply(this, arguments));
        }

        createClass(Primitive, [{
            key: "getNodeType",

            // TODO: This crashes in PhantomJS
            // static get name() {
            //     return "Primitive-" + nodeType;
            // }

            value: function getNodeType() {
                return nodeType;
            }
        }]);
        return Primitive;
    }(BaseClass);
    baseClassPrimitiveMap.set(nodeType, resultClass);
    return resultClass;
};

// TODO: not sure is this needs to actually be *.jsx
// TODO: should this be actually better done throught the dynamic CSS API, without doing through the DOM?
UI.StyleInstance = function (_UI$TextElement) {
    inherits(StyleInstance, _UI$TextElement);

    function StyleInstance(options) {
        classCallCheck(this, StyleInstance);

        var _this = possibleConstructorReturn(this, (StyleInstance.__proto__ || Object.getPrototypeOf(StyleInstance)).call(this, options));

        _this.setOptions(options);
        return _this;
    }

    createClass(StyleInstance, [{
        key: "setOptions",
        value: function setOptions(options) {
            this.options = options;
            this.options.attributes = this.options.attributes || {};
            this.attributes = new Map();
            for (var key in this.options.attributes) {
                this.attributes.set(key, this.options.attributes[key]);
            }
        }
    }, {
        key: "getValue",
        value: function getValue() {
            var str = this.options.selector + "{";
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.attributes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _step$value = slicedToArray(_step.value, 2),
                        key = _step$value[0],
                        value = _step$value[1];

                    if (typeof value === "function") {
                        value = value();
                    }
                    // Ignore keys with null or undefined value
                    if (value == null) {
                        continue;
                    }
                    // TODO: if key starts with vendor-, replace it with the browser specific one (and the plain one)
                    // TODO: on some attributes, do we want to automatically add a px suffix?
                    str += dashCase(key) + ":" + value + ";";
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

            return str + "}";
        }
    }, {
        key: "copyState",
        value: function copyState(element) {
            this.setOptions(element.options);
        }
    }, {
        key: "setAttribute",
        value: function setAttribute(name, value) {
            this.attributes.set(name, value);
            this.redraw();
        }
    }, {
        key: "deleteAttribute",
        value: function deleteAttribute(name) {
            this.attributes.delete(name);
            this.redraw();
        }
    }]);
    return StyleInstance;
}(UI.TextElement);

UI.StyleElement = function (_UI$Element) {
    inherits(StyleElement, _UI$Element);

    function StyleElement() {
        classCallCheck(this, StyleElement);
        return possibleConstructorReturn(this, (StyleElement.__proto__ || Object.getPrototypeOf(StyleElement)).apply(this, arguments));
    }

    createClass(StyleElement, [{
        key: "getNodeType",
        value: function getNodeType() {
            return "style";
        }
    }, {
        key: "getNodeAttributes",
        value: function getNodeAttributes() {
            // TODO: allow custom style attributes (media, scoped, etc)
            var attr = new NodeAttributes({});
            if (this.options.name) {
                attr.setAttribute("name", this.options.name);
            }
            return attr;
        }
    }]);
    return StyleElement;
}(UI.Element);

var ALLOWED_SELECTOR_STARTS = new Set([":", ">", " ", "+", "~", "[", "."]);

// TODO: figure out how to work with animation frames, this only creates a wrapper class
UI.DynamicStyleElement = function (_UI$StyleElement) {
    inherits(DynamicStyleElement, _UI$StyleElement);

    function DynamicStyleElement() {
        classCallCheck(this, DynamicStyleElement);
        return possibleConstructorReturn(this, (DynamicStyleElement.__proto__ || Object.getPrototypeOf(DynamicStyleElement)).apply(this, arguments));
    }

    createClass(DynamicStyleElement, [{
        key: "toString",
        value: function toString() {
            return this.getClassName();
        }

        // TODO: use a cached decorator here

    }, {
        key: "getClassName",
        value: function getClassName() {
            if (this.className) {
                return this.className;
            }
            this.constructor.instanceCounter = (this.constructor.instanceCounter || 0) + 1;
            this.className = "autocls-" + this.constructor.instanceCounter;
            return this.className;
        }

        // A cyclic dependency in the style object will cause an infinite loop here

    }, {
        key: "getStyleInstances",
        value: function getStyleInstances(selector, style) {
            var result = [];
            var ownStyle = {},
                haveOwnStyle = false;
            for (var key in style) {
                var value = style[key];
                var isProperValue = typeof value === "string" || value instanceof String || typeof value === "number" || value instanceof Number || typeof value === "function";
                if (isProperValue) {
                    ownStyle[key] = value;
                    haveOwnStyle = true;
                } else {
                    // Check that this actually is a valid subselector
                    var firstChar = String(key).charAt(0);
                    if (!ALLOWED_SELECTOR_STARTS.has(firstChar)) {
                        // TODO: Log here?
                        continue;
                    }
                    // TODO: maybe optimize for waste here?
                    var subStyle = this.getStyleInstances(selector + key, value);
                    result.push.apply(result, toConsumableArray(subStyle));
                }
            }

            if (haveOwnStyle) {
                result.unshift(new UI.StyleInstance({ selector: selector, key: selector, attributes: ownStyle }));
            }
            return result;
        }
    }, {
        key: "render",
        value: function render() {
            return this.getStyleInstances("." + this.getClassName(), this.options.style || {});
        }
    }, {
        key: "setStyle",
        value: function setStyle(key, value) {
            this.options.style[key] = value;
            this.children[0].setAttribute(key, value);
        }
    }, {
        key: "setSubStyle",
        value: function setSubStyle(selector, key, value) {
            throw Error("Implement me!");
        }
    }, {
        key: "getStyleObject",
        value: function getStyleObject() {
            return this.options.style;
        }
    }]);
    return DynamicStyleElement;
}(UI.StyleElement);

// This is the object that will be used to translate text
var translationMap = null;

// Keep a set of all UI Element that need to be updated when the language changes
// Can't use a weak set here unfortunately because we need iteration
// That's why we must make sure to remove all nodes from the set when destroying them
UI.TranslationElements = new Set();

UI.TranslationTextElement = function (_UI$TextElement) {
    inherits(TranslationTextElement, _UI$TextElement);

    function TranslationTextElement(value) {
        classCallCheck(this, TranslationTextElement);

        if (arguments.length === 1) {
            var _this = possibleConstructorReturn(this, (TranslationTextElement.__proto__ || Object.getPrototypeOf(TranslationTextElement)).call(this, value));
        } else {
            var _this = possibleConstructorReturn(this, (TranslationTextElement.__proto__ || Object.getPrototypeOf(TranslationTextElement)).call(this, ""));

            _this.setValue.apply(_this, arguments);
        }
        return possibleConstructorReturn(_this);
    }

    createClass(TranslationTextElement, [{
        key: "setValue",
        value: function setValue(value) {
            if (arguments.length > 1) {
                this.value = Array.from(arguments);
            } else {
                this.value = value;
            }
            if (this.node) {
                this.redraw();
            }
        }
    }, {
        key: "evaluateSprintf",
        value: function evaluateSprintf(str) {
            throw Error("Not yet implemented");
        }
    }, {
        key: "evaluate",
        value: function evaluate(strings) {
            for (var _len = arguments.length, values = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                values[_key - 1] = arguments[_key];
            }

            if (!Array.isArray(strings)) {
                return this.evaluateSprintf.apply(this, arguments);
                // This means strings is a string with the sprintf pattern
            } else {
                // Using template literals https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals
                if (arguments.length != strings.length) {
                    console.error("Invalid arguments to evaluate ", Array.from(arguments));
                }
                var result = strings[0];
                for (var i = 1; i < arguments.length; i++) {
                    result += arguments[i];
                    result += strings[i];
                }
                return result;
            }
        }
    }, {
        key: "getValue",
        value: function getValue() {
            var value = this.value;
            if (Array.isArray(this.value)) {
                var _translationMap2;

                value = translationMap && (_translationMap2 = translationMap).get.apply(_translationMap2, toConsumableArray(value)) || this.evaluate.apply(this, toConsumableArray(value));
            } else {
                // TODO: if translationMap.get() returns "", keep, skip only if returning null
                value = translationMap && translationMap.get(value) || value;
            }
            return value;
        }
    }, {
        key: "onMount",
        value: function onMount() {
            UI.TranslationElements.add(this);
        }
    }, {
        key: "onUnmount",
        value: function onUnmount() {
            UI.TranslationElements.delete(this);
        }
    }]);
    return TranslationTextElement;
}(UI.TextElement);

// This method is a shorthand notation to create a new translatable text element
// TODO: should also support being used as a string template
UI.T = function (str) {
    return new UI.TranslationTextElement(str);
};

// TODO @mciucu this should be wrapped in a way that previous requests that arrive later don't get processed
// TODO: should this be done with promises?
// Function to be called with a translation map
// The translationMap object needs to implement .get(value) to return the translation for value
function setTranslationMap(_translationMap) {
    if (translationMap === _translationMap) {
        return;
    }
    translationMap = _translationMap;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = UI.TranslationElements.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var textElement = _step.value;

            textElement.redraw();
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
}

var languageStore = null;

// This function should be called to set the language store to watch for changes
// The languageStore argumenent needs to implement .getLocale(), addListener("localChange", (language) =>{})
// The language objects need to implement .buildTranslation(callback), where callback should be called with a translationMap
function setLanguageStore(_languageStore) {
    languageStore = _languageStore;

    var currentLocale = languageStore.getLocale();
    // If there's a default language already set, build the translation table for it
    if (currentLocale) {
        currentLocale.buildTranslation(setTranslationMap);
    }

    // Add a listener for whenever the language changes
    languageStore.addListener("localeChange", function (language) {
        language.buildTranslation(setTranslationMap);
    });
}

function getTranslationMap() {
    return translationMap;
}

// Primitive utils for wrapping browser info
var Device = function () {
    function Device() {
        classCallCheck(this, Device);
    }

    createClass(Device, null, [{
        key: "isTouchDevice",
        value: function isTouchDevice() {
            if (!this.hasOwnProperty("_isTouchDevice")) {
                this._isTouchDevice = !!("createTouch" in window.document || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0 || "ontouchstart" in window);
            }
            return this._isTouchDevice;
        }
    }, {
        key: "getEventCoord",
        value: function getEventCoord(event, axis) {
            var pageName = "page" + axis;
            if (this.isTouchDevice()) {
                if (event.targetTouches) {
                    return event.targetTouches[0][pageName];
                }
                if (event.originalEvent && event.originalEvent.targetTouches) {
                    return event.originalEvent.targetTouches[0][pageName];
                }
            }
            return event[pageName];
        }
    }, {
        key: "getEventX",
        value: function getEventX(event) {
            return this.getEventCoord(event, "X");
        }
    }, {
        key: "getEventY",
        value: function getEventY(event) {
            return this.getEventCoord(event, "Y");
        }
    }, {
        key: "getBrowser",
        value: function getBrowser() {
            // TODO: should try to use navigator
            if (!!window.opr && !!opr.addons || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
                return "Opera";
            }
            if (typeof InstallTrigger !== 'undefined') {
                return "Firefox";
            }
            if (Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0) {
                return "Safari";
            }
            if (document.documentMode) {
                return "Internet Explorer";
            }
            if (window.StyleMedia) {
                return "Edge";
            }
            if (window.chrome && window.chrome.webstore) {
                return "Chrome";
            }
            return "Unknown";
        }
    }, {
        key: "supportsEvent",
        value: function supportsEvent(eventName) {
            if (!this.cachedSupportedValues.has(eventName)) {
                var element = document.createElement("div");
                var onEventName = "on" + eventName;
                var isSupported = onEventName in element;
                if (!isSupported) {
                    element.setAttribute(onEventName, "return;");
                    isSupported = typeof element[onEventName] === "function";
                }
                element = null;
                this.cachedSupportedValues.set(eventName, isSupported);
            }
            return this.cachedSupportedValues.get(eventName);
        }
    }]);
    return Device;
}();

Device.cachedSupportedValues = new Map();

function isDescriptor(desc) {
    if (!desc || !desc.hasOwnProperty) {
        return false;
    }

    var keys = ['value', 'initializer', 'get', 'set'];

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var key = _step.value;

            if (desc.hasOwnProperty(key)) {
                return true;
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

    return false;
}

function decorate(handleDescriptor, entryArgs) {
    if (isDescriptor(entryArgs[entryArgs.length - 1])) {
        return handleDescriptor.apply(undefined, toConsumableArray(entryArgs).concat([[]]));
    } else {
        return function () {
            return handleDescriptor.apply(undefined, Array.prototype.slice.call(arguments).concat([entryArgs]));
        };
    }
}

function createDefaultSetter(key) {
    return function set(newValue) {
        Object.defineProperty(this, key, {
            configurable: true,
            writable: true,
            // IS enumerable when reassigned by the outside word
            enumerable: true,
            value: newValue
        });

        return newValue;
    };
}

var DEFAULT_MSG = 'This function will be removed in future versions.';

function handleDescriptor(target, key, descriptor, _ref) {
    var _ref2 = slicedToArray(_ref, 2),
        _ref2$ = _ref2[0],
        msg = _ref2$ === undefined ? DEFAULT_MSG : _ref2$,
        _ref2$2 = _ref2[1],
        options = _ref2$2 === undefined ? {} : _ref2$2;

    if (typeof descriptor.value !== 'function') {
        throw new SyntaxError('Only functions can be marked as deprecated');
    }

    var methodSignature = target.constructor.name + '#' + key;

    if (options.url) {
        msg += '\n\n        See ' + options.url + ' for more details.\n\n';
    }

    // return {
    //     ...descriptor,
    //     value: function deprecationWrapper() {
    //         console.warn(`DEPRECATION ${methodSignature}: ${msg}`);
    //         return descriptor.value.apply(this, arguments);
    //     }
    // };
    return Object.assign({}, descriptor, {
        value: function deprecationWrapper() {
            console.warn('DEPRECATION ' + methodSignature + ': ' + msg);
            return descriptor.value.apply(this, arguments);
        }
    });
}

function deprecate() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    return decorate(handleDescriptor, args);
}

function handleDescriptor$2(target, key, descriptor) {
    var configurable = descriptor.configurable,
        enumerable = descriptor.enumerable,
        initializer = descriptor.initializer,
        value = descriptor.value;
    // The "key" property is constructed with accessor descriptor (getter / setter),
    // but the first time the getter is used, the property is reconstructed with data descriptor.

    return {
        configurable: configurable,
        enumerable: enumerable,

        get: function get() {
            // This happens if someone accesses the property directly on the prototype
            if (this === target) {
                return;
            }

            var ret = initializer ? initializer.call(this) : value;

            Object.defineProperty(this, key, {
                configurable: configurable,
                enumerable: enumerable,
                writable: true,
                value: ret
            });

            return ret;
        },


        set: createDefaultSetter(key)
    };
}

function lazyInitialize() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    return decorate(handleDescriptor$2, args);
}

var lazyInit = lazyInitialize;

// TODO: this file should be refactored
// consider lazyCSS -> styleRule/styleRule(styleRule.INHERIT)
function evaluateInitializer(target, initializer, value) {
    var result = initializer ? initializer.call(target) : value;
    if (typeof result === "function") {
        result = result();
    }
    return result;
}

function handleDescriptor$1(target, key, descriptor) {
    var initializer = descriptor.initializer,
        value = descriptor.value;

    // Change the prototype of this object to keep the old initializer

    target["__style__" + key] = { initializer: initializer, value: value };

    descriptor.initializer = function () {
        var style = evaluateInitializer(this, initializer, value);
        return this.css(style);
    };
    delete descriptor.value;

    return lazyInitialize(target, key, descriptor);
}

function lazyCSS() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    return decorate(handleDescriptor$1, args);
}

function handleInheritDescriptor(target, key, descriptor) {
    var initializer = descriptor.initializer,
        value = descriptor.value;

    descriptor.initializer = function () {
        // Get the value we set in the prototype of the parent object
        var parentDesc = Object.getPrototypeOf(this.__proto__)["__style__" + key];
        var parentStyle = evaluateInitializer(this, parentDesc.initializer, parentDesc.value);

        var style = evaluateInitializer(this, initializer, value);
        style = Object.assign(parentStyle, style);

        return style;
    };
    delete descriptor.value;

    return lazyCSS(target, key, descriptor);
}

function lazyInheritCSS() {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
    }

    return decorate(handleInheritDescriptor, args);
}

function handleDescriptor$3(target, key, descriptor) {
    descriptor.writable = false;
    return descriptor;
}

function readOnly() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    return decorate(handleDescriptor$3, args);
}

function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
        writable: descriptor.writable,
        value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
}

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
        desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
        desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
        return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
        desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
        desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
        Object['define' + 'Property'](target, property, desc);
        desc = null;
    }

    return desc;
}

var Draggable = function Draggable(BaseClass) {
    var _desc, _value, _class, _descriptor, _descriptor2;

    return _class = function (_BaseClass) {
        inherits(Draggable, _BaseClass);

        function Draggable() {
            var _ref;

            var _temp, _this, _ret;

            classCallCheck(this, Draggable);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = possibleConstructorReturn(this, (_ref = Draggable.__proto__ || Object.getPrototypeOf(Draggable)).call.apply(_ref, [this].concat(args))), _this), _initDefineProp(_this, "_clickCallbacks", _descriptor, _this), _initDefineProp(_this, "_clickDragListeners", _descriptor2, _this), _temp), possibleConstructorReturn(_this, _ret);
        }

        createClass(Draggable, [{
            key: "addClickListener",
            value: function addClickListener(callback) {
                var _this2 = this;

                if (this._clickCallbacks.has(callback)) {
                    return;
                }
                var callbackWrapper = function callbackWrapper() {
                    if (_this2._okForClick) {
                        callback();
                    }
                };
                this._clickCallbacks.set(callback, callbackWrapper);
                get(Draggable.prototype.__proto__ || Object.getPrototypeOf(Draggable.prototype), "addClickListener", this).call(this, callbackWrapper);

                if (this._clickDragListeners.has(callback)) {
                    return;
                }
                var clickDragListener = {
                    onStart: function onStart() {
                        _this2.dragForClickStarted();
                    },
                    onDrag: function onDrag() {
                        _this2.dragForClick();
                    }
                };
                this._clickDragListeners.set(callback, clickDragListener);
                this.addDragListener(clickDragListener);
            }
        }, {
            key: "dragForClickStarted",
            value: function dragForClickStarted() {
                this._okForClick = true;
            }
        }, {
            key: "dragForClick",
            value: function dragForClick() {
                this._okForClick = false;
            }
        }, {
            key: "removeClickListener",
            value: function removeClickListener(callback) {
                var callbackWrapper = this._clickCallbacks.get(callback);
                if (callbackWrapper) {
                    this._clickCallbacks.delete(callback);
                    get(Draggable.prototype.__proto__ || Object.getPrototypeOf(Draggable.prototype), "removeClickListener", this).call(this, callbackWrapper);
                }
                if (!this._clickDragListeners) {
                    return;
                }
                var clickDragListener = this._clickDragListeners.get(callback);
                if (clickDragListener) {
                    this._clickDragListeners.delete(callback);
                    this.removeDragListener(clickDragListener);
                }
            }
        }, {
            key: "createDragListenerWrapper",
            value: function createDragListenerWrapper(listeners) {
                var listenerWrapper = Object.assign({}, listeners);

                listenerWrapper.onWrapperDrag = function (event) {
                    var deltaX = event.clientX - listenerWrapper._lastX;
                    listenerWrapper._lastX = event.clientX;

                    var deltaY = event.clientY - listenerWrapper._lastY;
                    listenerWrapper._lastY = event.clientY;

                    listeners.onDrag(deltaX, deltaY);
                };

                listenerWrapper.onWrapperStart = function (event) {
                    listenerWrapper._lastX = event.clientX;
                    listenerWrapper._lastY = event.clientY;

                    if (listeners.onStart) {
                        listeners.onStart(event);
                    }

                    // TODO: Replace with our body
                    document.body.addEventListener("mousemove", listenerWrapper.onWrapperDrag);
                };

                listenerWrapper.onWrapperEnd = function (event) {
                    if (listeners.onEnd) {
                        listeners.onEnd(event);
                    }
                    // TODO: Replace with our body
                    document.body.removeEventListener("mousemove", listenerWrapper.onWrapperDrag);
                };
                return listenerWrapper;
            }
        }, {
            key: "createTouchDragListenerWrapper",
            value: function createTouchDragListenerWrapper(listeners) {
                var listenerWrapper = Object.assign({}, listeners);

                listenerWrapper.onWrapperDrag = function (event) {
                    var touch = event.targetTouches[0];
                    var deltaX = touch.pageX - listenerWrapper._lastX;
                    listenerWrapper._lastX = touch.pageX;

                    var deltaY = touch.pageY - listenerWrapper._lastY;
                    listenerWrapper._lastY = touch.pageY;

                    listeners.onDrag(deltaX, deltaY);
                };

                listenerWrapper.onWrapperStart = function (event) {
                    var touch = event.targetTouches[0];
                    listenerWrapper._lastX = touch.pageX;
                    listenerWrapper._lastY = touch.pageY;

                    if (listeners.onStart) {
                        listeners.onStart(event);
                    }
                    event.preventDefault();

                    // TODO: Replace with our body
                    document.body.addEventListener("touchmove", listenerWrapper.onWrapperDrag);
                };

                listenerWrapper.onWrapperEnd = function (event) {
                    if (listeners.onEnd) {
                        listeners.onEnd(event);
                    }
                    // TODO: Replace with our body
                    document.body.removeEventListener("touchmove", listenerWrapper.onWrapperDrag);
                };
                return listenerWrapper;
            }
        }, {
            key: "addDragListener",
            value: function addDragListener(listeners) {
                var listenerWrapper = this.createDragListenerWrapper(listeners);
                var touchListenerWrapper = this.createTouchDragListenerWrapper(listeners);
                this.addNodeListener("touchstart", touchListenerWrapper.onWrapperStart);
                this.addNodeListener("mousedown", listenerWrapper.onWrapperStart);
                // TODO: Replace with our body
                document.body.addEventListener("touchend", touchListenerWrapper.onWrapperEnd);
                document.body.addEventListener("mouseup", listenerWrapper.onWrapperEnd);

                if (!this.hasOwnProperty("_dragListeners")) {
                    this._dragListeners = [];
                }
                this._dragListeners.push(touchListenerWrapper);
                this._dragListeners.push(listenerWrapper);
            }
        }, {
            key: "removeDragListener",
            value: function removeDragListener(listeners) {
                if (this._dragListeners) {
                    for (var i = this._dragListeners.length - 1; i >= 0; i -= 1) {
                        if (this._dragListeners[i].onStart === listeners.onStart && this._dragListeners[i].onDrag === listeners.onDrag && this._dragListeners[i].onEnd === listeners.onEnd) {

                            this.removeNodeListener("touchstart", this._dragListeners[i].onWrapperStart);
                            document.body.removeEventListener("touchmove", this._dragListeners[i].onWrapperDrag);
                            document.body.removeEventListener("touchmove", this._dragListeners[i].onWrapperEnd);
                            this.removeNodeListener("mousedown", this._dragListeners[i].onWrapperStart);
                            document.body.removeEventListener("mousemove", this._dragListeners[i].onWrapperDrag);
                            document.body.removeEventListener("mousemove", this._dragListeners[i].onWrapperEnd);

                            this._dragListeners.splice(i, 1);
                        }
                    }
                }
            }
        }]);
        return Draggable;
    }(BaseClass), (_descriptor = _applyDecoratedDescriptor(_class.prototype, "_clickCallbacks", [lazyInit], {
        enumerable: true,
        initializer: function initializer() {
            return new Map();
        }
    }), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "_clickDragListeners", [lazyInit], {
        enumerable: true,
        initializer: function initializer() {
            return new Map();
        }
    })), _class;
};

// TODO: this file existed to hold generic classes in a period of fast prototyping, not really aplicable now
UI.Orientation = {
    HORIZONTAL: 1,
    VERTICAL: 2
};

UI.Direction = {
    UP: "up",
    LEFT: "left",
    DOWN: "down",
    RIGHT: "right"
};

// TODO: move to Bootstrap file
UI.Level = {
    NONE: null,
    DEFAULT: "default",
    INFO: "info",
    PRIMARY: "primary",
    SUCCESS: "success",
    WARNING: "warning",
    DANGER: "danger",
    ERROR: "danger"
};

UI.Size = {
    NONE: null,
    EXTRA_SMALL: "xs",
    SMALL: "sm",
    DEFAULT: "default",
    LARGE: "lg",
    EXTRA_LARGE: "xl"
};

UI.VoteStatus = {
    NONE: null,
    LIKE: 1,
    DISLIKE: -1
};

UI.ActionStatus = {
    DEFAULT: 1,
    RUNNING: 2,
    SUCCESS: 3,
    FAILED: 4
};

//TODO: should panel be a generic element that just encapsulates something while exposing a title?
UI.Panel = function (_UI$Element) {
    inherits(Panel, _UI$Element);

    function Panel() {
        classCallCheck(this, Panel);
        return possibleConstructorReturn(this, (Panel.__proto__ || Object.getPrototypeOf(Panel)).apply(this, arguments));
    }

    createClass(Panel, [{
        key: "getTitle",
        value: function getTitle() {
            return this.options.title;
        }
    }]);
    return Panel;
}(UI.Element);

UI.SlideBar = function (_Draggable) {
    inherits(SlideBar, _Draggable);

    function SlideBar(options) {
        classCallCheck(this, SlideBar);
        return possibleConstructorReturn(this, (SlideBar.__proto__ || Object.getPrototypeOf(SlideBar)).call(this, options));
    }

    createClass(SlideBar, [{
        key: "getNodeAttributes",
        value: function getNodeAttributes() {
            var attributes = get(SlideBar.prototype.__proto__ || Object.getPrototypeOf(SlideBar.prototype), "getNodeAttributes", this).call(this);
            attributes.setStyle("display", "inline-block");
            attributes.setStyle("position", "relative");
            attributes.setStyle("cursor", "pointer");
            return attributes;
        }
    }, {
        key: "getSliderLeft",
        value: function getSliderLeft() {
            return this.options.value * this.options.width - this.options.barWidth / 2;
        }
    }, {
        key: "render",
        value: function render() {
            return [UI.createElement(UI.ProgressBar, { ref: "progressBar", active: "true", value: this.options.value, disableTransition: true,
                style: {
                    height: "5px",
                    width: this.options.width + "px",
                    position: "relative",
                    top: "15px"
                }
            }), UI.createElement("div", { ref: "slider", style: {
                    width: this.options.barWidth + "px",
                    height: "20px",
                    "background-color": "black",
                    position: "absolute",
                    left: this.getSliderLeft() + "px",
                    top: "7.5px"
                } })];
        }
    }, {
        key: "setValue",
        value: function setValue(value) {
            value = Math.max(value, 0);
            value = Math.min(value, 1);

            this.options.value = value;
            this.progressBar.set(this.options.value);
            this.slider.setStyle("left", this.getSliderLeft() + "px");

            if (this.onSetValue) {
                this.onSetValue(this.options.value);
            }
        }
    }, {
        key: "getValue",
        value: function getValue() {
            return this.options.value;
        }
    }, {
        key: "onMount",
        value: function onMount() {
            var _this3 = this;

            this.addDragListener({
                onStart: function onStart(event) {
                    _this3.setValue((Device.getEventX(event) - _this3.progressBar.getOffset().left) / _this3.options.width);
                },
                onDrag: function onDrag(deltaX, deltaY) {
                    _this3.setValue(_this3.options.value + deltaX / _this3.options.width);
                }
            });
        }
    }]);
    return SlideBar;
}(Draggable(UI.Element));

UI.Link = function (_UI$Element2) {
    inherits(Link, _UI$Element2);

    function Link() {
        classCallCheck(this, Link);
        return possibleConstructorReturn(this, (Link.__proto__ || Object.getPrototypeOf(Link)).apply(this, arguments));
    }

    createClass(Link, [{
        key: "getNodeType",
        value: function getNodeType() {
            return "a";
        }
    }, {
        key: "getNodeAttributes",
        value: function getNodeAttributes() {
            var attr = get(Link.prototype.__proto__ || Object.getPrototypeOf(Link.prototype), "getNodeAttributes", this).call(this);
            attr.setStyle("cursor", "pointer");
            return attr;
        }
    }, {
        key: "setOptions",
        value: function setOptions(options) {
            options = Object.assign({
                newTab: true
            }, options);

            get(Link.prototype.__proto__ || Object.getPrototypeOf(Link.prototype), "setOptions", this).call(this, options);

            if (this.options.newTab) {
                this.options.target = "_blank";
            }

            return options;
        }
    }, {
        key: "render",
        value: function render() {
            return [this.options.value];
        }
    }]);
    return Link;
}(UI.Element);

UI.Image = function (_UI$Primitive) {
    inherits(Image, _UI$Primitive);

    function Image() {
        classCallCheck(this, Image);
        return possibleConstructorReturn(this, (Image.__proto__ || Object.getPrototypeOf(Image)).apply(this, arguments));
    }

    return Image;
}(UI.Primitive("img"));

// Beware coder: If you ever use this class, you need to have a good reason!
UI.RawHTML = function (_UI$Element3) {
    inherits(RawHTML, _UI$Element3);

    function RawHTML() {
        classCallCheck(this, RawHTML);
        return possibleConstructorReturn(this, (RawHTML.__proto__ || Object.getPrototypeOf(RawHTML)).apply(this, arguments));
    }

    createClass(RawHTML, [{
        key: "redraw",
        value: function redraw() {
            this.node.innerHTML = this.options.__innerHTML;
            this.applyNodeAttributes();
            this.applyRef();
        }
    }]);
    return RawHTML;
}(UI.Element);

UI.TemporaryMessageArea = function (_UI$Primitive2) {
    inherits(TemporaryMessageArea, _UI$Primitive2);

    function TemporaryMessageArea() {
        classCallCheck(this, TemporaryMessageArea);
        return possibleConstructorReturn(this, (TemporaryMessageArea.__proto__ || Object.getPrototypeOf(TemporaryMessageArea)).apply(this, arguments));
    }

    createClass(TemporaryMessageArea, [{
        key: "getDefaultOptions",
        value: function getDefaultOptions() {
            return {
                margin: 10
            };
        }
    }, {
        key: "render",
        value: function render() {
            return [UI.createElement(UI.TextElement, { ref: "textElement", value: this.options.value || "" })];
        }
    }, {
        key: "getNodeAttributes",
        value: function getNodeAttributes() {
            var attr = get(TemporaryMessageArea.prototype.__proto__ || Object.getPrototypeOf(TemporaryMessageArea.prototype), "getNodeAttributes", this).call(this);
            // TODO: nope, not like this
            attr.setStyle("marginLeft", this.options.margin + "px");
            attr.setStyle("marginRight", this.options.margin + "px");
            return attr;
        }
    }, {
        key: "setValue",
        value: function setValue(value) {
            this.options.value = value;
            this.textElement.setValue(value);
        }
    }, {
        key: "setColor",
        value: function setColor(color) {
            this.setStyle("color", color);
            this.applyNodeAttributes();
        }
    }, {
        key: "showMessage",
        value: function showMessage(message) {
            var _this8 = this;

            var color = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "black";
            var displayDuration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2000;

            this.setColor(color);
            this.clear();
            this.setValue(message);
            if (displayDuration) {
                this.clearValueTimeout = setTimeout(function () {
                    return _this8.clear();
                }, displayDuration);
            }
        }
    }, {
        key: "clear",
        value: function clear() {
            this.setValue("");
            if (this.clearValueTimeout) {
                clearTimeout(this.clearValueTimeout);
                this.clearValueTimeout = null;
            }
        }
    }]);
    return TemporaryMessageArea;
}(UI.Primitive("span"));

// Just putting in a lot of methods, to try to think of an interface
UI.ScrollableMixin = function (_UI$Element4) {
    inherits(ScrollableMixin, _UI$Element4);

    function ScrollableMixin() {
        classCallCheck(this, ScrollableMixin);
        return possibleConstructorReturn(this, (ScrollableMixin.__proto__ || Object.getPrototypeOf(ScrollableMixin)).apply(this, arguments));
    }

    createClass(ScrollableMixin, [{
        key: "getDesiredExcessHeightTop",
        value: function getDesiredExcessHeightTop() {
            return 600;
        }
    }, {
        key: "getDesiredExcessHeightBottom",
        value: function getDesiredExcessHeightBottom() {
            return 600;
        }
    }, {
        key: "getHeightScrollPercent",
        value: function getHeightScrollPercent() {
            var scrollHeight = this.node.scrollHeight;
            var height = this.node.clientHeight;
            if (scrollHeight === height) {
                return 0;
            }
            return this.node.scrollTop / (scrollHeight - height);
        }
    }, {
        key: "getExcessTop",
        value: function getExcessTop() {
            return this.node.scrollTop;
        }
    }, {
        key: "getExcessBottom",
        value: function getExcessBottom() {
            var scrollHeight = this.node.scrollHeight;
            var height = this.node.clientHeight;
            return scrollHeight - height - this.node.scrollTop;
        }
    }, {
        key: "haveExcessTop",
        value: function haveExcessTop() {
            return this.getExcessTop() > this.getDesiredExcessHeightTop();
        }
    }, {
        key: "haveExcessBottom",
        value: function haveExcessBottom() {
            return this.getExcessBottom() > this.getDesiredExcessHeightBottom();
        }
    }, {
        key: "popChildTop",
        value: function popChildTop() {
            this.eraseChildAtIndex(0);
        }
    }, {
        key: "popChildBottom",
        value: function popChildBottom() {
            this.eraseChildAtIndex(this.children.length - 1);
        }
    }, {
        key: "removeExcessTop",
        value: function removeExcessTop() {
            while (this.haveExcessTop()) {
                this.popChildTop();
            }
        }
    }, {
        key: "removeExcessBottom",
        value: function removeExcessBottom() {
            while (this.haveExcessBottom()) {
                this.popChildBottom();
            }
        }
    }, {
        key: "pushChildTop",
        value: function pushChildTop(element) {
            var removeExcessBottom = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            if (removeExcessBottom) {
                this.removeExcessBottom();
            }
            this.insertChild(element, 0);
        }
    }, {
        key: "pushChildBottom",
        value: function pushChildBottom(element) {
            var removeExcessTop = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            if (removeExcessTop) {
                this.removeExcessTop();
            }
            this.appendChild(element);
            this.appendChild(element);
        }
    }, {
        key: "saveScrollPosition",
        value: function saveScrollPosition() {
            // If at top or bottom, save that
            // If anywhere in the middle, save the offset of the first child with a positive offset, and keep that constant
            this.options.scrollTop = this.node.scrollTop;
            var maxScrollTop = this.node.scrollHeight - this.node.clientHeight;
            this.options.scrollInfo = {
                scrollAtTop: this.options.scrollTop === 0,
                scrollAtBottom: this.options.scrollTop === maxScrollTop
            };
        }
    }, {
        key: "applyScrollPosition",
        value: function applyScrollPosition() {
            this.node.scrollTop = this.options.scrollTop || this.node.scrollTop;
        }
    }, {
        key: "scrollToHeight",
        value: function scrollToHeight(height) {
            this.node.scrollTop = height;
        }
    }, {
        key: "scrollToTop",
        value: function scrollToTop() {
            this.scrollToHeight(0);
        }
    }, {
        key: "scrollToBottom",
        value: function scrollToBottom() {
            this.scrollToHeight(this.node.scrollHeight);
        }
    }]);
    return ScrollableMixin;
}(UI.Element);

//TODO: this class would need some binary searches
UI.InfiniteScrollable = function (_UI$ScrollableMixin) {
    inherits(InfiniteScrollable, _UI$ScrollableMixin);

    function InfiniteScrollable() {
        classCallCheck(this, InfiniteScrollable);
        return possibleConstructorReturn(this, (InfiniteScrollable.__proto__ || Object.getPrototypeOf(InfiniteScrollable)).apply(this, arguments));
    }

    createClass(InfiniteScrollable, [{
        key: "setOptions",
        value: function setOptions(options) {
            options = Object.assign({
                entries: [],
                entryComparator: function entryComparator(a, b) {
                    return a.id - b.id;
                },
                firstRenderedEntry: 0,
                lastRenderedEntry: -1
            }, options);
            get(InfiniteScrollable.prototype.__proto__ || Object.getPrototypeOf(InfiniteScrollable.prototype), "setOptions", this).call(this, options);
            // TODO: TEMP for testing
            this.options.children = [];
            if (this.options.staticTop) {
                this.options.children.push(this.options.staticTop);
            }
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.options.entries[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var entry = _step.value;

                    this.options.children.push(this.renderEntry(entry));
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
        }
    }, {
        key: "getFirstVisibleIndex",
        value: function getFirstVisibleIndex() {}
    }, {
        key: "getLastVisibleIndex",
        value: function getLastVisibleIndex() {}
    }, {
        key: "renderEntry",
        value: function renderEntry(entry) {
            if (this.options.entryRenderer) {
                return this.options.entryRenderer(entry);
            } else {
                console.error("You need to pass option entryRenderer or overwrite the renderEntry method");
            }
        }
    }, {
        key: "pushEntry",
        value: function pushEntry(entry) {
            this.insertEntry(entry, this.options.entries.length);
        }
    }, {
        key: "insertEntry",
        value: function insertEntry(entry, index) {
            var entries = this.options.entries;
            if (index == null) {
                index = 0;
                while (index < entries.length && this.options.entryComparator(entries[index], entry) <= 0) {
                    index++;
                }
            }
            entries.splice(index, 0, entry);

            // Adjust to the children
            if (this.options.staticTop) {
                index += 1;
            }

            // TODO: only if in the rendered range, insert in options.children;
            var uiElement = this.renderEntry(entry);
            this.insertChild(uiElement, index);
        }
    }]);
    return InfiniteScrollable;
}(UI.ScrollableMixin);

UI.TimePassedSpan = function (_UI$Element5) {
    inherits(TimePassedSpan, _UI$Element5);

    function TimePassedSpan() {
        classCallCheck(this, TimePassedSpan);
        return possibleConstructorReturn(this, (TimePassedSpan.__proto__ || Object.getPrototypeOf(TimePassedSpan)).apply(this, arguments));
    }

    createClass(TimePassedSpan, [{
        key: "getNodeType",
        value: function getNodeType() {
            return "span";
        }
    }, {
        key: "render",
        value: function render() {
            return this.getTimeDeltaDisplay(this.options.timeStamp);
        }
    }, {
        key: "getNodeAttributes",
        value: function getNodeAttributes() {
            var attr = get(TimePassedSpan.prototype.__proto__ || Object.getPrototypeOf(TimePassedSpan.prototype), "getNodeAttributes", this).call(this);
            attr.setStyle("color", "#AAA");
            return attr;
        }
    }, {
        key: "getTimeDeltaDisplay",
        value: function getTimeDeltaDisplay(timeStamp) {
            var timeNow = Date.now();
            var timeDelta = parseInt((timeNow - timeStamp * 1000) / 1000);
            var timeUnitsInSeconds = [31556926, 2629743, 604800, 86400, 3600, 60];
            var timeUnits = ["year", "month", "week", "day", "hour", "minute"];
            if (timeDelta < 0) {
                timeDelta = 0;
            }
            for (var i = 0; i < timeUnits.length; i += 1) {
                var value = parseInt(timeDelta / timeUnitsInSeconds[i]);
                if (timeUnitsInSeconds[i] <= timeDelta) {
                    return value + " " + timeUnits[i] + (value > 1 ? "s" : "") + " ago";
                }
            }
            return "Few seconds ago";
        }
    }, {
        key: "onMount",
        value: function onMount() {
            var _this12 = this;

            this.constructor.addIntervalListener(function () {
                _this12.redraw();
            });
        }
    }], [{
        key: "addIntervalListener",
        value: function addIntervalListener(callback) {
            var _this13 = this;

            if (!this.updateFunction) {
                this.TIME_DISPATCHER = new Dispatchable();
                this.updateFunction = setInterval(function () {
                    _this13.TIME_DISPATCHER.dispatch("updateTimeValue");
                }, 5000);
            }
            this.TIME_DISPATCHER.addListener("updateTimeValue", callback);
        }
    }]);
    return TimePassedSpan;
}(UI.Element);

UI.ConstructorInitMixin = function (BaseClass) {
    var ConstructorInitMixin = function (_BaseClass) {
        inherits(ConstructorInitMixin, _BaseClass);

        function ConstructorInitMixin() {
            classCallCheck(this, ConstructorInitMixin);
            return possibleConstructorReturn(this, (ConstructorInitMixin.__proto__ || Object.getPrototypeOf(ConstructorInitMixin)).apply(this, arguments));
        }

        createClass(ConstructorInitMixin, [{
            key: "createNode",
            value: function createNode() {
                this.constructor.ensureInit();
                return get(ConstructorInitMixin.prototype.__proto__ || Object.getPrototypeOf(ConstructorInitMixin.prototype), "createNode", this).call(this);
            }
        }], [{
            key: "ensureInit",
            value: function ensureInit() {
                if (!this._haveInit) {
                    this._haveInit = true;
                    if (typeof this.init === "function") {
                        this.init();
                    }
                }
            }
        }]);
        return ConstructorInitMixin;
    }(BaseClass);

    

    return ConstructorInitMixin;
};

// TODO: this file was started with a lot of old patterns, that need to be updated
UI.Form = function (_UI$Element) {
    inherits(Form, _UI$Element);

    function Form() {
        classCallCheck(this, Form);
        return possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
    }

    createClass(Form, [{
        key: "getNodeType",
        value: function getNodeType() {
            return "form";
        }
    }, {
        key: "getNodeAttributes",
        value: function getNodeAttributes() {
            var attr = get(Form.prototype.__proto__ || Object.getPrototypeOf(Form.prototype), "getNodeAttributes", this).call(this);
            attr.addClass("form form-horizontal");
            return attr;
        }
    }, {
        key: "onMount",
        value: function onMount() {
            // Insert here code to not refresh page
        }
    }]);
    return Form;
}(UI.Element);

UI.Input = function (_UI$Element2) {
    inherits(Input, _UI$Element2);

    function Input() {
        classCallCheck(this, Input);
        return possibleConstructorReturn(this, (Input.__proto__ || Object.getPrototypeOf(Input)).apply(this, arguments));
    }

    createClass(Input, [{
        key: "getNodeType",
        value: function getNodeType() {
            return "input";
        }
    }, {
        key: "getNodeAttributes",
        value: function getNodeAttributes() {
            var attr = get(Input.prototype.__proto__ || Object.getPrototypeOf(Input.prototype), "getNodeAttributes", this).call(this);

            var type = this.getInputType();
            if (type) {
                attr.setAttribute("type", type);
            }

            return attr;
        }
    }, {
        key: "redraw",
        value: function redraw() {
            get(Input.prototype.__proto__ || Object.getPrototypeOf(Input.prototype), "redraw", this).call(this);
            if (this.options.hasOwnProperty("value")) {
                this.setValue(this.options.value);
            }
        }
    }, {
        key: "getValue",
        value: function getValue() {
            return this.node.value;
        }
    }, {
        key: "setValue",
        value: function setValue(newValue) {
            this.node.value = newValue;
        }
    }, {
        key: "getInputType",
        value: function getInputType() {
            // Must be overloaded
            return null;
        }
    }, {
        key: "onInput",
        value: function onInput(callback) {
            this.addNodeListener("input change", callback);
        }
    }, {
        key: "onKeyUp",
        value: function onKeyUp(callback) {
            this.addNodeListener("keyup", callback);
        }
    }]);
    return Input;
}(UI.Element);

UI.FormControl = function (_UI$Input) {
    inherits(FormControl, _UI$Input);

    function FormControl() {
        classCallCheck(this, FormControl);
        return possibleConstructorReturn(this, (FormControl.__proto__ || Object.getPrototypeOf(FormControl)).apply(this, arguments));
    }

    createClass(FormControl, [{
        key: "getNodeAttributes",
        value: function getNodeAttributes() {
            var attr = get(FormControl.prototype.__proto__ || Object.getPrototypeOf(FormControl.prototype), "getNodeAttributes", this).call(this);
            attr.addClass("form-control");
            return attr;
        }
    }]);
    return FormControl;
}(UI.Input);

UI.FormSettingsGroup = function (_UI$Element3) {
    inherits(FormSettingsGroup, _UI$Element3);

    function FormSettingsGroup() {
        classCallCheck(this, FormSettingsGroup);
        return possibleConstructorReturn(this, (FormSettingsGroup.__proto__ || Object.getPrototypeOf(FormSettingsGroup)).apply(this, arguments));
    }

    createClass(FormSettingsGroup, [{
        key: "setOptions",
        value: function setOptions(options) {
            get(FormSettingsGroup.prototype.__proto__ || Object.getPrototypeOf(FormSettingsGroup.prototype), "setOptions", this).call(this, options);

            this.options.labelWidth = this.options.labelWidth || "41%";
            this.options.contentWidth = this.options.contentWidth || "59%";
        }
    }, {
        key: "getNodeAttributes",
        value: function getNodeAttributes() {
            var attr = get(FormSettingsGroup.prototype.__proto__ || Object.getPrototypeOf(FormSettingsGroup.prototype), "getNodeAttributes", this).call(this);
            attr.addClass("form-group");
            return attr;
        }
    }, {
        key: "getLabelStyle",
        value: function getLabelStyle() {
            return {
                float: "left",
                display: "inline-block",
                height: "32px",
                "line-height": "32px"
            };
        }
    }, {
        key: "getContentStyle",
        value: function getContentStyle() {
            return {
                float: "left",
                display: "inline-block",
                "margin-top": "1px",
                "margin-bottom": "1px",
                "min-height": "30px"
            };
        }
    }, {
        key: "render",
        value: function render() {
            var labelStyle = Object.assign(this.getLabelStyle(), { width: this.options.labelWidth });
            labelStyle = Object.assign(labelStyle, this.options.labelStyle);
            var contentStyle = Object.assign(this.getContentStyle(), { width: this.options.contentWidth });
            contentStyle = Object.assign(contentStyle, this.options.contentStyle);
            var label = this.options.label ? UI.createElement(
                "div",
                { style: labelStyle },
                this.options.label
            ) : null;
            var content = UI.createElement(
                "div",
                { style: contentStyle },
                this.options.children
            );
            if (this.options.contentFirst) {
                return [content, label];
            }
            return [label, content];
        }
    }]);
    return FormSettingsGroup;
}(UI.Element);

UI.FormGroup = function (_UI$Element4) {
    inherits(FormGroup, _UI$Element4);

    function FormGroup() {
        classCallCheck(this, FormGroup);
        return possibleConstructorReturn(this, (FormGroup.__proto__ || Object.getPrototypeOf(FormGroup)).apply(this, arguments));
    }

    createClass(FormGroup, [{
        key: "setOptions",
        value: function setOptions(options) {
            get(FormGroup.prototype.__proto__ || Object.getPrototypeOf(FormGroup.prototype), "setOptions", this).call(this, options);
            this.options.labelWidth = this.options.labelWidth || "16%";
            this.options.contentWidth = this.options.contentWidth || "32%";
            this.options.errorFieldWidth = this.options.errorFieldWidth || "48%";
        }
    }, {
        key: "getNodeAttributes",
        value: function getNodeAttributes() {
            var attr = get(FormGroup.prototype.__proto__ || Object.getPrototypeOf(FormGroup.prototype), "getNodeAttributes", this).call(this);
            attr.addClass("form-group");
            return attr;
        }
    }, {
        key: "getDefaultStyle",
        value: function getDefaultStyle() {
            return {
                float: "left",
                position: "relative",
                "min-height": "1px",
                "padding-right": "15px",
                "padding-left": "15px"
            };
        }
    }, {
        key: "render",
        value: function render() {
            var labelStyle = Object.assign(this.getDefaultStyle(), { width: this.options.labelWidth });
            labelStyle = Object.assign(labelStyle, this.options.style);
            var contentStyle = Object.assign(this.getDefaultStyle(), { width: this.options.contentWidth });
            contentStyle = Object.assign(contentStyle, this.options.style);
            var errorFieldStyle = Object.assign(this.getDefaultStyle(), { width: this.options.errorFieldWidth });
            return [this.options.label ? UI.createElement(
                "label",
                { className: "control-label", style: labelStyle },
                this.options.label
            ) : null, UI.createElement(
                "div",
                { style: contentStyle },
                this.options.children
            ), UI.createElement("span", { ref: "errorField", style: errorFieldStyle })];
        }
    }, {
        key: "setError",
        value: function setError(errorMessage) {
            this.errorField.node.textContent = errorMessage;
            this.addClass("has-error");
        }
    }, {
        key: "removeError",
        value: function removeError() {
            this.errorField.node.textContent = "";
            this.removeClass("has-error");
        }
    }]);
    return FormGroup;
}(UI.Element);

UI.Input.domAttributesMap = CreateNodeAttributesMap(UI.Element.domAttributesMap, [["autocomplete"], ["autofocus", { noValue: true }], ["formaction"], ["maxLength", { domName: "maxlength" }], ["minLength", { domName: "minlength" }], ["name"], ["placeholder"], ["readonly"], ["required"], ["value"]]);

UI.SubmitInput = function (_UI$Input2) {
    inherits(SubmitInput, _UI$Input2);

    function SubmitInput() {
        classCallCheck(this, SubmitInput);
        return possibleConstructorReturn(this, (SubmitInput.__proto__ || Object.getPrototypeOf(SubmitInput)).apply(this, arguments));
    }

    createClass(SubmitInput, [{
        key: "getInputType",
        value: function getInputType() {
            return "submit";
        }
    }]);
    return SubmitInput;
}(UI.Input);

UI.SubmitInput.domAttributesMap = CreateNodeAttributesMap(UI.Element.domAttributesMap, [["formenctype"], ["formmethod"], ["formnovalidate"], ["formtarget"]]);

UI.TextInputInterface = function (BaseInputClass) {
    return function (_BaseInputClass) {
        inherits(TextInput, _BaseInputClass);

        function TextInput() {
            classCallCheck(this, TextInput);
            return possibleConstructorReturn(this, (TextInput.__proto__ || Object.getPrototypeOf(TextInput)).apply(this, arguments));
        }

        createClass(TextInput, [{
            key: "getInputType",
            value: function getInputType() {
                return "text";
            }
        }]);
        return TextInput;
    }(BaseInputClass);
};

UI.TextInput = UI.TextInputInterface(UI.Input);
UI.FormTextInput = UI.TextInputInterface(UI.FormControl);

UI.NumberInputInterface = function (BaseInputClass) {
    var numberInput = function (_BaseInputClass2) {
        inherits(NumberInput, _BaseInputClass2);

        function NumberInput() {
            classCallCheck(this, NumberInput);
            return possibleConstructorReturn(this, (NumberInput.__proto__ || Object.getPrototypeOf(NumberInput)).apply(this, arguments));
        }

        createClass(NumberInput, [{
            key: "getInputType",
            value: function getInputType() {
                return "number";
            }
        }, {
            key: "getValue",
            value: function getValue() {
                var val = get(NumberInput.prototype.__proto__ || Object.getPrototypeOf(NumberInput.prototype), "getValue", this).call(this);
                return parseInt(val) || parseFloat(val);
            }
        }]);
        return NumberInput;
    }(BaseInputClass);

    numberInput.domAttributesMap = CreateNodeAttributesMap(UI.Element.domAttributesMap, [["min"], ["max"], ["step"]]);
    return numberInput;
};

UI.NumberInput = UI.NumberInputInterface(UI.Input);
UI.FormNumberInput = UI.NumberInputInterface(UI.FormControl);

UI.EmailInputInterface = function (BaseInputClass) {
    return function (_BaseInputClass3) {
        inherits(EmailInput, _BaseInputClass3);

        function EmailInput() {
            classCallCheck(this, EmailInput);
            return possibleConstructorReturn(this, (EmailInput.__proto__ || Object.getPrototypeOf(EmailInput)).apply(this, arguments));
        }

        createClass(EmailInput, [{
            key: "getInputType",
            value: function getInputType() {
                return "email";
            }
        }]);
        return EmailInput;
    }(BaseInputClass);
};

UI.EmailInput = UI.EmailInputInterface(UI.Input);
UI.FormEmailInput = UI.EmailInputInterface(UI.FormControl);

UI.PasswordInputInterface = function (BaseInputClass) {
    return function (_BaseInputClass4) {
        inherits(PasswordInput, _BaseInputClass4);

        function PasswordInput() {
            classCallCheck(this, PasswordInput);
            return possibleConstructorReturn(this, (PasswordInput.__proto__ || Object.getPrototypeOf(PasswordInput)).apply(this, arguments));
        }

        createClass(PasswordInput, [{
            key: "getInputType",
            value: function getInputType() {
                return "password";
            }
        }]);
        return PasswordInput;
    }(BaseInputClass);
};

UI.PasswordInput = UI.PasswordInputInterface(UI.Input);
UI.FormPasswordInput = UI.PasswordInputInterface(UI.FormControl);

UI.FileInputInterface = function (BaseInputClass) {
    var fileInput = function (_BaseInputClass5) {
        inherits(FileInput, _BaseInputClass5);

        function FileInput() {
            classCallCheck(this, FileInput);
            return possibleConstructorReturn(this, (FileInput.__proto__ || Object.getPrototypeOf(FileInput)).apply(this, arguments));
        }

        createClass(FileInput, [{
            key: "getInputType",
            value: function getInputType() {
                return "file";
            }
        }, {
            key: "getFiles",
            value: function getFiles() {
                return this.node.files;
            }
        }, {
            key: "getFile",
            value: function getFile() {
                // TODO: this is valid only if multipleFiles is false
                return this.getFiles()[0];
            }
        }]);
        return FileInput;
    }(BaseInputClass);

    fileInput.domAttributesMap = CreateNodeAttributesMap(UI.Element.domAttributesMap, [["multipleFiles", { domName: "multiple", noValue: true }], ["fileTypes", { domName: "accept" }]]);
    return fileInput;
};

UI.FileInput = UI.FileInputInterface(UI.Input);
UI.FormFileInput = UI.FileInputInterface(UI.FormControl);

UI.CheckboxInput = function (_UI$Input3) {
    inherits(CheckboxInput, _UI$Input3);

    function CheckboxInput() {
        classCallCheck(this, CheckboxInput);
        return possibleConstructorReturn(this, (CheckboxInput.__proto__ || Object.getPrototypeOf(CheckboxInput)).apply(this, arguments));
    }

    createClass(CheckboxInput, [{
        key: "setOptions",
        value: function setOptions(options) {
            options.style = options.style || {};
            options.style = Object.assign({}, options.style);
            get(CheckboxInput.prototype.__proto__ || Object.getPrototypeOf(CheckboxInput.prototype), "setOptions", this).call(this, options);
        }
    }, {
        key: "getInputType",
        value: function getInputType() {
            return "checkbox";
        }
    }, {
        key: "getValue",
        value: function getValue() {
            return this.node.checked;
        }
    }, {
        key: "setValue",
        value: function setValue(newValue) {
            this.node.checked = newValue;
        }
    }]);
    return CheckboxInput;
}(UI.Input);

UI.CheckboxInput.domAttributesMap = CreateNodeAttributesMap(UI.Element.domAttributesMap, [["checked", { noValue: true }]]);

UI.TextArea = function (_UI$Element5) {
    inherits(TextArea, _UI$Element5);

    function TextArea() {
        classCallCheck(this, TextArea);
        return possibleConstructorReturn(this, (TextArea.__proto__ || Object.getPrototypeOf(TextArea)).apply(this, arguments));
    }

    createClass(TextArea, [{
        key: "getNodeType",
        value: function getNodeType() {
            return "textarea";
        }
    }, {
        key: "applyNodeAttributes",
        value: function applyNodeAttributes() {
            get(TextArea.prototype.__proto__ || Object.getPrototypeOf(TextArea.prototype), "applyNodeAttributes", this).call(this);
            this.node.readOnly = this.options.readOnly || false;
        }
    }, {
        key: "setReadOnly",
        value: function setReadOnly(value) {
            this.options.readOnly = value;
            this.node.readOnly = value;
        }
    }, {
        key: "getValue",
        value: function getValue() {
            return this.node.value;
        }
    }, {
        key: "redraw",
        value: function redraw() {
            get(TextArea.prototype.__proto__ || Object.getPrototypeOf(TextArea.prototype), "redraw", this).call(this);
            if (this.options.value) {
                this.node.value = this.options.value + "";
            }
        }
    }, {
        key: "setValue",
        value: function setValue(value) {
            this.options.value = value;
            this.node.value = value;
        }
    }, {
        key: "onInput",
        value: function onInput(callback) {
            this.addNodeListener("input change", callback);
        }
    }, {
        key: "onKeyUp",
        value: function onKeyUp(callback) {
            this.addNodeListener("keyup", callback);
        }
    }]);
    return TextArea;
}(UI.Element);

UI.InputField = function (_UI$Element6) {
    inherits(InputField, _UI$Element6);

    function InputField() {
        classCallCheck(this, InputField);
        return possibleConstructorReturn(this, (InputField.__proto__ || Object.getPrototypeOf(InputField)).apply(this, arguments));
    }

    createClass(InputField, [{
        key: "render",
        value: function render() {}
    }]);
    return InputField;
}(UI.Element);

UI.Slider = function (_UI$Element7) {
    inherits(Slider, _UI$Element7);

    function Slider() {
        classCallCheck(this, Slider);
        return possibleConstructorReturn(this, (Slider.__proto__ || Object.getPrototypeOf(Slider)).apply(this, arguments));
    }

    return Slider;
}(UI.Element);

UI.Select = function (_UI$Element8) {
    inherits(Select, _UI$Element8);

    function Select() {
        classCallCheck(this, Select);
        return possibleConstructorReturn(this, (Select.__proto__ || Object.getPrototypeOf(Select)).apply(this, arguments));
    }

    createClass(Select, [{
        key: "getNodeType",
        value: function getNodeType() {
            return "select";
        }
    }, {
        key: "render",
        value: function render() {
            this.givenOptions = this.options.options || [];
            var selectOptions = [];

            for (var i = 0; i < this.givenOptions.length; i += 1) {
                var options = {
                    key: i
                };
                if (this.givenOptions[i] == this.options.selected) {
                    options.selected = true;
                }
                selectOptions.push(UI.createElement(
                    "option",
                    options,
                    this.givenOptions[i].toString()
                ));
            }

            return selectOptions;
        }
    }, {
        key: "get",
        value: function get() {
            var selectedIndex = this.getIndex();
            return this.givenOptions[selectedIndex];
        }
    }, {
        key: "set",
        value: function set(value) {
            for (var i = 0; i < this.givenOptions.length; i++) {
                if (this.givenOptions[i] === value) {
                    this.setIndex(i);
                    return;
                }
            }
            console.error("Can't set the select option ", value, "\nAvailable options: ", this.givenOptions);
        }
    }, {
        key: "getIndex",
        value: function getIndex() {
            return this.node.selectedIndex;
        }
    }, {
        key: "setIndex",
        value: function setIndex(index) {
            this.node.selectedIndex = index;
            this.options.selected = this.givenOptions[index];
        }
    }, {
        key: "redraw",
        value: function redraw() {
            get(Select.prototype.__proto__ || Object.getPrototypeOf(Select.prototype), "redraw", this).call(this);
            if (this.options.selected) {
                this.set(this.options.selected);
            }
        }
    }]);
    return Select;
}(UI.Element);

// TODO: the whole table architecture probably needs a rethinking
UI.TableRow = function (_UI$Primitive) {
    inherits(TableRow, _UI$Primitive);

    function TableRow() {
        classCallCheck(this, TableRow);
        return possibleConstructorReturn(this, (TableRow.__proto__ || Object.getPrototypeOf(TableRow)).apply(this, arguments));
    }

    createClass(TableRow, [{
        key: "render",
        value: function render() {
            var rowCells = [];

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.options.columns[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var column = _step.value;

                    rowCells.push(this.renderEntryCell(column));
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

            return rowCells;
        }
    }, {
        key: "renderEntryCell",
        value: function renderEntryCell(column) {
            return UI.createElement(
                "td",
                { style: column.cellStyle, key: column.id },
                column.value(this.options.entry, this.options.index)
            );
        }
    }]);
    return TableRow;
}(UI.Primitive("tr"));

var Table = function (_UI$Element) {
    inherits(Table, _UI$Element);

    function Table() {
        classCallCheck(this, Table);
        return possibleConstructorReturn(this, (Table.__proto__ || Object.getPrototypeOf(Table)).apply(this, arguments));
    }

    createClass(Table, [{
        key: "setOptions",
        value: function setOptions(options) {
            get(Table.prototype.__proto__ || Object.getPrototypeOf(Table.prototype), "setOptions", this).call(this, options);

            this.setColumns(options.columns || []);
            this.entries = options.entries || [];
        }
    }, {
        key: "getNodeAttributes",
        value: function getNodeAttributes() {
            var attr = get(Table.prototype.__proto__ || Object.getPrototypeOf(Table.prototype), "getNodeAttributes", this).call(this);

            attr.addClass("ui-table table table-stripped");

            return attr;
        }
    }, {
        key: "getNodeType",
        value: function getNodeType() {
            return "table";
        }
    }, {
        key: "getRowClass",
        value: function getRowClass() {
            return UI.TableRow;
        }
    }, {
        key: "getRowOptions",
        value: function getRowOptions(entry) {
            return {
                entry: entry,
                columns: this.columns
            };
        }
    }, {
        key: "render",
        value: function render() {
            return [UI.createElement(
                "thead",
                null,
                this.renderTableHead()
            ), UI.createElement(
                "tbody",
                null,
                this.renderTableBody()
            )];
        }
    }, {
        key: "renderTableHead",
        value: function renderTableHead() {
            return UI.createElement(
                "tr",
                null,
                this.columns.map(this.renderHeaderCell, this)
            );
        }
    }, {
        key: "getEntryKey",
        value: function getEntryKey(entry, index) {
            return entry.id || index;
        }
    }, {
        key: "renderTableBody",
        value: function renderTableBody() {
            this.rows = [];

            var entries = this.getEntries();
            for (var i = 0; i < entries.length; i += 1) {
                var entry = entries[i];
                var RowClass = this.getRowClass(entry);
                this.rows.push(UI.createElement(RowClass, _extends({ key: this.getEntryKey(entry, i), index: i }, this.getRowOptions(entry), { parent: this })));
            }
            return this.rows;
        }

        // Renders the whole header cell based on a column

    }, {
        key: "renderHeaderCell",
        value: function renderHeaderCell(column) {
            return UI.createElement(
                "th",
                { style: column.headerStyle, ref: "columnHeader" + column.id },
                this.renderColumnHeader(column)
            );
        }

        // Only renders the content of the header cell

    }, {
        key: "renderColumnHeader",
        value: function renderColumnHeader(column) {
            if (typeof column.headerName === "function") {
                return column.headerName();
            }
            return column.headerName;
        }

        // Original entries should not be modified. Overwrite this function to appy any modification in a new array.

    }, {
        key: "getEntries",
        value: function getEntries() {
            return this.entries || [];
        }
    }, {
        key: "columnDefaults",
        value: function columnDefaults(column, index) {
            column.id = index;
        }
    }, {
        key: "setColumns",
        value: function setColumns(columns) {
            this.columns = columns;
            for (var i = 0; i < this.columns.length; i += 1) {
                this.columnDefaults(this.columns[i], i);
            }
        }
    }]);
    return Table;
}(UI.Element);



UI.Table = Table;

UI.TableRowInCollapsibleTable = function (_UI$TableRow) {
    inherits(TableRowInCollapsibleTable, _UI$TableRow);

    function TableRowInCollapsibleTable() {
        classCallCheck(this, TableRowInCollapsibleTable);
        return possibleConstructorReturn(this, (TableRowInCollapsibleTable.__proto__ || Object.getPrototypeOf(TableRowInCollapsibleTable)).apply(this, arguments));
    }

    createClass(TableRowInCollapsibleTable, [{
        key: "getNodeType",
        value: function getNodeType() {
            return "tbody";
        }
    }, {
        key: "render",
        value: function render() {
            return UI.createElement(
                "tr",
                null,
                get(TableRowInCollapsibleTable.prototype.__proto__ || Object.getPrototypeOf(TableRowInCollapsibleTable.prototype), "render", this).call(this)
            );
        }
    }]);
    return TableRowInCollapsibleTable;
}(UI.TableRow);

UI.CollapsibleTableRow = function (_UI$TableRow2) {
    inherits(CollapsibleTableRow, _UI$TableRow2);

    function CollapsibleTableRow() {
        classCallCheck(this, CollapsibleTableRow);
        return possibleConstructorReturn(this, (CollapsibleTableRow.__proto__ || Object.getPrototypeOf(CollapsibleTableRow)).apply(this, arguments));
    }

    createClass(CollapsibleTableRow, [{
        key: "getDefaultOptions",
        value: function getDefaultOptions() {
            return {
                collapsed: true
            };
        }
    }, {
        key: "getNodeType",
        value: function getNodeType() {
            return "tbody";
        }
    }, {
        key: "onMount",
        value: function onMount() {
            var _this3 = this;

            this.collapseButton.addClickListener(function (event) {
                _this3.collapsed = _this3.collapsed != true;
                _this3.collapseButton.toggleClass("collapsed");
                // TODO (@kira): Find out how to do this properly
                $(_this3.collapsible.node).collapse("toggle");
            });
        }
    }, {
        key: "redraw",
        value: function redraw() {
            if (!get(CollapsibleTableRow.prototype.__proto__ || Object.getPrototypeOf(CollapsibleTableRow.prototype), "redraw", this).call(this)) {
                return false;
            }

            if (this.collapsed) {
                this.collapseButton.addClass("collapsed");
                this.collapsible.removeClass("in");
            } else {
                this.collapseButton.removeClass("collapsed");
                this.collapsible.addClass("in");
            }
            return true;
        }
    }, {
        key: "render",
        value: function render() {
            var noPaddingHiddenRowStyle = {
                padding: 0
            };

            var rowCells = get(CollapsibleTableRow.prototype.__proto__ || Object.getPrototypeOf(CollapsibleTableRow.prototype), "render", this).call(this);

            return [UI.createElement(
                "tr",
                { className: "panel-heading" },
                rowCells
            ), UI.createElement(
                "tr",
                null,
                UI.createElement(
                    "td",
                    { style: noPaddingHiddenRowStyle, colspan: this.options.columns.length },
                    UI.createElement(
                        "div",
                        { ref: "collapsible", className: "collapse" },
                        this.renderCollapsible(this.options.entry)
                    )
                )
            )];
        }
    }]);
    return CollapsibleTableRow;
}(UI.TableRow);

UI.CollapsibleTableInterface = function (BaseTableClass) {
    return function (_BaseTableClass) {
        inherits(CollapsibleTable, _BaseTableClass);

        function CollapsibleTable() {
            classCallCheck(this, CollapsibleTable);
            return possibleConstructorReturn(this, (CollapsibleTable.__proto__ || Object.getPrototypeOf(CollapsibleTable)).apply(this, arguments));
        }

        createClass(CollapsibleTable, [{
            key: "setOptions",
            value: function setOptions(options) {
                get(CollapsibleTable.prototype.__proto__ || Object.getPrototypeOf(CollapsibleTable.prototype), "setOptions", this).call(this, options);

                if (options.renderCollapsible) {
                    this.renderCollapsible = options.renderCollapsible;
                }
            }
        }, {
            key: "render",
            value: function render() {
                return [UI.createElement(
                    "thead",
                    null,
                    this.renderTableHead()
                ), this.renderTableBody()];
            }
        }, {
            key: "getRowClass",
            value: function getRowClass() {
                return UI.CollapsibleTableRow;
            }
        }, {
            key: "getNodeAttributes",
            value: function getNodeAttributes() {
                var attr = get(CollapsibleTable.prototype.__proto__ || Object.getPrototypeOf(CollapsibleTable.prototype), "getNodeAttributes", this).call(this);
                attr.addClass("ui-collapsible-table");
                return attr;
            }
        }, {
            key: "setColumns",
            value: function setColumns(columns) {
                var _this5 = this;

                var collapseColumn = {
                    value: function value(entry) {
                        var rowClass = _this5.getRowClass(entry);
                        // TODO: Fix it lad!
                        if (rowClass === UI.CollapsibleTableRow || rowClass.prototype instanceof UI.CollapsibleTableRow) {
                            return UI.createElement("a", { ref: "collapseButton", className: "rowCollapseButton collapsed" });
                        }
                        return UI.createElement("a", { ref: "collapseButton" });
                    },
                    cellStyle: {
                        width: "1%",
                        "whiteSpace": "nowrap"
                    }
                };

                get(CollapsibleTable.prototype.__proto__ || Object.getPrototypeOf(CollapsibleTable.prototype), "setColumns", this).call(this, [collapseColumn].concat(columns));
            }
        }]);
        return CollapsibleTable;
    }(BaseTableClass);
};

UI.CollapsibleTable = UI.CollapsibleTableInterface(Table);

UI.SortableTableInterface = function (BaseTableClass) {
    return function (_BaseTableClass) {
        inherits(SortableTable, _BaseTableClass);

        function SortableTable() {
            classCallCheck(this, SortableTable);
            return possibleConstructorReturn(this, (SortableTable.__proto__ || Object.getPrototypeOf(SortableTable)).apply(this, arguments));
        }

        createClass(SortableTable, [{
            key: "setOptions",
            value: function setOptions(options) {
                get(SortableTable.prototype.__proto__ || Object.getPrototypeOf(SortableTable.prototype), "setOptions", this).call(this, options);

                this.columnSortingOrder = options.columnSortingOrder || [];
            }
        }, {
            key: "extraNodeAttributes",
            value: function extraNodeAttributes(attr) {
                // TODO: use StyleSheet
                attr.addClass("ui-sortable-table");
            }
        }, {
            key: "onMount",
            value: function onMount() {
                var _this2 = this;

                get(SortableTable.prototype.__proto__ || Object.getPrototypeOf(SortableTable.prototype), "onMount", this).call(this);

                // TODO: fix multiple clicks registered here
                // Sort table by clicked column
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    var _loop = function _loop() {
                        var column = _step.value;

                        _this2["columnHeader" + column.id].addClickListener(function () {
                            _this2.sortByColumn(column);
                        });
                    };

                    for (var _iterator = this.columns[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        _loop();
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
            }
        }, {
            key: "renderColumnHeader",
            value: function renderColumnHeader(column) {
                var iconStyle = { position: "absolute", right: "0px", bottom: "0px" };
                var sortIcon = UI.createElement("i", { className: "sort-icon fa fa-sort", style: iconStyle });
                if (this.sortBy === column) {
                    if (this.sortDescending) {
                        sortIcon = UI.createElement("i", { className: "sort-icon fa fa-sort-desc", style: iconStyle });
                    } else {
                        sortIcon = UI.createElement("i", { className: "sort-icon fa fa-sort-asc", style: iconStyle });
                    }
                }

                return UI.createElement(
                    "div",
                    { style: { position: "relative" } },
                    get(SortableTable.prototype.__proto__ || Object.getPrototypeOf(SortableTable.prototype), "renderColumnHeader", this).call(this, column),
                    " ",
                    sortIcon
                );
            }
        }, {
            key: "sortByColumn",
            value: function sortByColumn(column) {
                if (column === this.sortBy) {
                    this.sortDescending = this.sortDescending != true;
                } else {
                    this.sortDescending = true;
                }

                this.sortBy = column;

                this.redraw();
            }
        }, {
            key: "sortEntries",
            value: function sortEntries(entries) {
                var _this3 = this;

                if (!this.sortBy && this.columnSortingOrder.length === 0) {
                    return entries;
                }

                var colCmp = function colCmp(a, b, col) {
                    if (!col) return 0;

                    var keyA = col.rawValue ? col.rawValue(a) : col.value(a);
                    var keyB = col.rawValue ? col.rawValue(b) : col.value(b);
                    return col.cmp(keyA, keyB);
                };

                var sortedEntries = entries.slice();

                sortedEntries.sort(function (a, b) {
                    var cmpRes = void 0;

                    if (_this3.sortBy) {
                        cmpRes = colCmp(a, b, _this3.sortBy);
                        if (cmpRes !== 0) {
                            return _this3.sortDescending ? -cmpRes : cmpRes;
                        }
                    }

                    for (var i = 0; i < _this3.columnSortingOrder.length; i += 1) {
                        cmpRes = colCmp(a, b, _this3.columnSortingOrder[i]);
                        if (_this3.columnSortingOrder[i].sortDescending) {
                            cmpRes = -cmpRes;
                        }

                        if (cmpRes !== 0) {
                            return cmpRes;
                        }
                    }
                    return 0;
                });
                return sortedEntries;
            }
        }, {
            key: "getEntries",
            value: function getEntries() {
                return this.sortEntries(get(SortableTable.prototype.__proto__ || Object.getPrototypeOf(SortableTable.prototype), "getEntries", this).call(this));
            }
        }, {
            key: "columnDefaults",
            value: function columnDefaults(column, index) {
                get(SortableTable.prototype.__proto__ || Object.getPrototypeOf(SortableTable.prototype), "columnDefaults", this).call(this, column, index);

                if (!column.hasOwnProperty("cmp")) {
                    column.cmp = defaultComparator;
                }
            }
        }]);
        return SortableTable;
    }(BaseTableClass);
};

UI.SortableTable = UI.SortableTableInterface(Table);

var EPS = 1e-6;

// Check if a value is equal to zero. Use epsilon check.
var isZero = function isZero(val) {
    var epsilon = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : EPS;

    return Math.abs(val) < epsilon;
};

// Simulate C/C++ rand() function
var rand = function rand(mod) {
    return Math.floor(Math.random() * mod);
};

var equal = function equal(val1, val2) {
    var epsilon = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : EPS;

    return isZero(val1 - val2, epsilon);
};

var equalPoints = function equalPoints(p1, p2) {
    var epsilon = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : EPS;

    return isZero(p1.x - p2.x, epsilon) && isZero(p1.y - p2.y, epsilon);
};

// Compute square of a number
var sqr = function sqr(x) {
    return x * x;
};

// Compute the distance between 2 points
var distance = function distance(p1, p2) {
    return Math.sqrt(sqr(p1.x - p2.x) + sqr(p1.y - p2.y));
};

var signedDistancePointLine = function signedDistancePointLine(point, line) {
    return (line.a * point.x + line.b * point.y + line.c) / Math.sqrt(sqr(line.a) + sqr(line.b));
};

var distancePointLine = function distancePointLine(point, line) {
    return Math.abs(signedDistancePointLine(point, line));
};

var pointOnSegment = function pointOnSegment(point, segmentStart, segmentEnd, epsilon) {
    epsilon = epsilon || EPS;
    return Math.abs(distance(point, segmentStart) + distance(point, segmentEnd) - distance(segmentStart, segmentEnd)) <= epsilon;
};

var perpendicularFoot = function perpendicularFoot(point, line) {
    var distance = (line.a * point.x + line.b * point.y + line.c) / (sqr(line.a) + sqr(line.b));
    return {
        x: point.x - line.a * distance,
        y: point.y - line.b * distance
    };
};

var lineEquation = function lineEquation(A, B) {
    return {
        a: B.y - A.y,
        b: A.x - B.x,
        c: A.y * B.x - A.x * B.y
    };
};

// Compute angle between 2 points in grad
var angleGrad = function angleGrad(p1, p2) {
    return gradian(angleRad(p1, p2));
};

// Transform gradian in radian
var radian = function radian(angle) {
    return angle * Math.PI / 180;
};

// Transform radian in gradian
var gradian = function gradian(angle) {
    return angle * 180 / Math.PI;
};

// Compute angle between 2 points in rad
var angleRad = function angleRad(p1, p2) {
    p2 = p2 || { 'x': 0, 'y': 0 };
    return Math.atan2(p1.y - p2.y, p1.x - p2.x);
};

// TODO: lots of these should be methods of the point class, not global functions
var crossProduct = function crossProduct(p1, p2, p0) {
    p0 = p0 || { x: 0, y: 0 };
    return (p1.x - p0.x) * (p2.y - p0.y) - (p1.y - p0.y) * (p2.x - p0.x);
};

var rotatePoint = function rotatePoint(point, orig, angle) {
    // TODO: WTF, default argument value in the middle of argument list?
    orig = orig || { x: 0, y: 0 };
    return {
        x: Math.cos(angle) * (point.x - orig.x) - Math.sin(angle) * (point.y - orig.y) + orig.x,
        y: Math.sin(angle) * (point.x - orig.x) + Math.cos(angle) * (point.y - orig.y) + orig.y
    };
};

var translatePoint = function translatePoint(point, dx, dy) {
    return {
        x: point.x + dx,
        y: point.y + dy
    };
};

var scalePoint = function scalePoint(point, orig, sx, sy) {
    sy = sy || sx;
    return {
        x: (point.x - orig.x) * sx + orig.x,
        y: (point.y - orig.y) * sy + orig.y
    };
};

var polarToCartesian = function polarToCartesian(angle, radius, orig) {
    orig = orig || { x: 0, y: 0 };
    return {
        x: radius * Math.cos(angle) + orig.x,
        y: radius * Math.sin(angle) + orig.y
    };
};

var circlesIntersection = function circlesIntersection(circle1, circle2) {
    var points;
    var centerDistance;
    // TODO(@all) These vars are magic. Find out what they do and add comments
    var l;
    var h;

    centerDistance = distance(circle1, circle2);
    if (centerDistance > circle1.r + circle2.r) {
        return [];
    }

    l = (sqr(circle1.r) - sqr(circle2.r) + sqr(centerDistance)) / (2 * centerDistance);
    if (sqr(circle1.r) - sqr(l) < 0) {
        return [];
    }

    h = Math.sqrt(sqr(circle1.r) - sqr(l));

    points = [];
    points.push({
        x: l / centerDistance * (circle2.x - circle1.x) + h / centerDistance * (circle2.y - circle1.y) + circle1.x,
        y: l / centerDistance * (circle2.y - circle1.y) - h / centerDistance * (circle2.x - circle1.x) + circle1.y
    });
    points.push({
        x: l / centerDistance * (circle2.x - circle1.x) - h / centerDistance * (circle2.y - circle1.y) + circle1.x,
        y: l / centerDistance * (circle2.y - circle1.y) + h / centerDistance * (circle2.x - circle1.x) + circle1.y
    });

    return points;
};

var bound = function bound(value, minValue, maxValue) {
    if (value < minValue) {
        return minValue;
    }
    if (value > maxValue) {
        return maxValue;
    }
    return value;
};

var getVector = function getVector(startPoint, endPoint) {
    return {
        x: endPoint.x - startPoint.x,
        y: endPoint.y - startPoint.y
    };
};

var vectorLength = function vectorLength(vector) {
    return distance({ x: 0, y: 0 }, vector);
};

var normalizeVector = function normalizeVector(vector) {
    var len = vectorLength(vector);
    if (Math.abs(len) < EPS) {
        return {
            x: 0,
            y: 0
        };
    }
    return {
        x: vector.x / len,
        y: vector.y / len
    };
};

var scaleVector = function scaleVector(vector, scalar) {
    return {
        x: vector.x * scalar,
        y: vector.y * scalar
    };
};

var addVectors = function addVectors(vector1, vector2) {
    return {
        x: vector1.x + vector2.x,
        y: vector1.y + vector2.y
    };
};

var subtractVectors = function subtractVectors(vector1, vector2) {
    return {
        x: vector1.x - vector2.x,
        y: vector1.y - vector2.y
    };
};

var triangleArea = function triangleArea(point1, point2, point3) {
    return 0.5 * Math.abs(crossProduct(point1, point2, point3));
};

var inRange = function inRange(value, minValue, maxValue) {
    if (isNaN(value)) {
        return false;
    }
    return minValue <= value && value <= maxValue;
};

var interpolationValue = function interpolationValue(interpolationArray, X) {
    var Y = 0;
    var aux;
    var i;
    var j;

    for (i = 0; i < interpolationArray.length; i += 1) {
        if (interpolationArray.x === X) {
            return interpolationArray.y;
        }
    }
    for (i = 0; i < interpolationArray.length; i += 1) {
        aux = interpolationArray[i].y;
        for (j = 0; j < interpolationArray.length; j += 1) {
            if (i !== j) {
                aux = aux * (X - interpolationArray[j].x) / (interpolationArray[i].x - interpolationArray[j].x);
            }
        }
        Y += aux;
    }

    return Y;
};

var COLORS_BY_NAME = {
    aliceblue: "#f0f8ff",
    antiquewhite: "#faebd7",
    aqua: "#00ffff",
    aquamarine: "#7fffd4",
    azure: "#f0ffff",
    beige: "#f5f5dc",
    bisque: "#ffe4c4",
    black: "#000000",
    blanchedalmond: "#ffebcd",
    blue: "#0000ff",
    blueviolet: "#8a2be2",
    brown: "#a52a2a",
    burlywood: "#deb887",
    cadetblue: "#5f9ea0",
    chartreuse: "#7fff00",
    chocolate: "#d2691e",
    coral: "#ff7f50",
    cornflowerblue: "#6495ed",
    cornsilk: "#fff8dc",
    crimson: "#dc143c",
    cyan: "#00ffff",
    darkblue: "#00008b",
    darkcyan: "#008b8b",
    darkgoldenrod: "#b8860b",
    darkgray: "#a9a9a9",
    darkgreen: "#006400",
    darkkhaki: "#bdb76b",
    darkmagenta: "#8b008b",
    darkolivegreen: "#556b2f",
    darkorange: "#ff8c00",
    darkorchid: "#9932cc",
    darkred: "#8b0000",
    darksalmon: "#e9967a",
    darkseagreen: "#8fbc8f",
    darkslateblue: "#483d8b",
    darkslategray: "#2f4f4f",
    darkturquoise: "#00ced1",
    darkviolet: "#9400d3",
    deeppink: "#ff1493",
    deepskyblue: "#00bfff",
    dimgray: "#696969",
    dodgerblue: "#1e90ff",
    firebrick: "#b22222",
    floralwhite: "#fffaf0",
    forestgreen: "#228b22",
    fuchsia: "#ff00ff",
    gainsboro: "#dcdcdc",
    ghostwhite: "#f8f8ff",
    gold: "#ffd700",
    goldenrod: "#daa520",
    gray: "#808080",
    green: "#008000",
    greenyellow: "#adff2f",
    honeydew: "#f0fff0",
    hotpink: "#ff69b4",
    indianred: "#cd5c5c",
    indigo: "#4b0082",
    ivory: "#fffff0",
    khaki: "#f0e68c",
    lavender: "#e6e6fa",
    lavenderblush: "#fff0f5",
    lawngreen: "#7cfc00",
    lemonchiffon: "#fffacd",
    lightblue: "#add8e6",
    lightcoral: "#f08080",
    lightcyan: "#e0ffff",
    lightgoldenrodyellow: "#fafad2",
    lightgray: "#d3d3d3",
    lightgreen: "#90ee90",
    lightpink: "#ffb6c1",
    lightsalmon: "#ffa07a",
    lightseagreen: "#20b2aa",
    lightskyblue: "#87cefa",
    lightslategray: "#778899",
    lightsteelblue: "#b0c4de",
    lightyellow: "#ffffe0",
    lime: "#00ff00",
    limegreen: "#32cd32",
    linen: "#faf0e6",
    magenta: "#ff00ff",
    maroon: "#800000",
    mediumaquamarine: "#66cdaa",
    mediumblue: "#0000cd",
    mediumorchid: "#ba55d3",
    mediumpurple: "#9370db",
    mediumseagreen: "#3cb371",
    mediumslateblue: "#7b68ee",
    mediumspringgreen: "#00fa9a",
    mediumturquoise: "#48d1cc",
    mediumvioletred: "#c71585",
    midnightblue: "#191970",
    mintcream: "#f5fffa",
    mistyrose: "#ffe4e1",
    moccasin: "#ffe4b5",
    navajowhite: "#ffdead",
    navy: "#000080",
    oldlace: "#fdf5e6",
    olive: "#808000",
    olivedrab: "#6b8e23",
    orange: "#ffa500",
    orangered: "#ff4500",
    orchid: "#da70d6",
    palegoldenrod: "#eee8aa",
    palegreen: "#98fb98",
    paleturquoise: "#afeeee",
    palevioletred: "#db7093",
    papayawhip: "#ffefd5",
    peachpuff: "#ffdab9",
    peru: "#cd853f",
    pink: "#ffc0cb",
    plum: "#dda0dd",
    powderblue: "#b0e0e6",
    purple: "#800080",
    red: "#ff0000",
    rosybrown: "#bc8f8f",
    royalblue: "#4169e1",
    saddlebrown: "#8b4513",
    salmon: "#fa8072",
    sandybrown: "#f4a460",
    seagreen: "#2e8b57",
    seashell: "#fff5ee",
    sienna: "#a0522d",
    silver: "#c0c0c0",
    skyblue: "#87ceeb",
    slateblue: "#6a5acd",
    slategray: "#708090",
    snow: "#fffafa",
    springgreen: "#00ff7f",
    steelblue: "#4682b4",
    tan: "#d2b48c",
    teal: "#008080",
    thistle: "#d8bfd8",
    tomato: "#ff6347",
    turquoise: "#40e0d0",
    violet: "#ee82ee",
    wheat: "#f5deb3",
    white: "#ffffff",
    whitesmoke: "#f5f5f5",
    yellow: "#ffff00",
    yellowgreen: "#9acd32"
};

/*
 * This class contains methods for operating with colors. Its objects are kept in hsva format with normalized
 * attributes (each attribute has value between 0 and 1 inclusive), and can be converted from/to rgba.
 */

var Color = function () {
    function Color(color) {
        classCallCheck(this, Color);

        if (color) {
            this.setColor(color);
        }
    }

    createClass(Color, [{
        key: "setColor",
        value: function setColor(color) {
            this.color = this.constructor.parseColor(color);
        }
    }, {
        key: "getColor",
        value: function getColor() {
            var rgba = this.getRgba();
            return "rgba(" + rgba[0] + ", " + rgba[1] + ", " + rgba[2] + ", " + rgba[3] + ")";
        }

        /*
         * @param color A color string of the types: native name, hex3, hex6, rgb, rgba, hsl, hsla
         *              or a Color object, or a hsla color array
         */

    }], [{
        key: "parseColor",
        value: function parseColor(color) {
            if (color instanceof Color) {
                return color.color;
            } else if (color instanceof Array) {
                // Add the alpha parameter at the end
                if (color.length === 3) {
                    color.push(1);
                }
                return color;
            }

            color = color.trim().toLowerCase();

            // Check if color is given by name
            if (COLORS_BY_NAME.hasOwnProperty(color)) {
                color = COLORS_BY_NAME[color];
            }

            var values = [];

            // Check for hex3 (e.g. "#f00")
            var hex3 = color.match(/^#([0-9a-f]{3})$/i);
            if (hex3) {
                values = [parseInt(hex3[1].charAt(0), 16) * 0x11, parseInt(hex3[1].charAt(1), 16) * 0x11, parseInt(hex3[1].charAt(2), 16) * 0x11, 1];
            }

            // Check for hex6 (e.g. "#ff0000")
            var hex6 = color.match(/^#([0-9a-f]{6})$/i);
            if (hex6) {
                values = [parseInt(hex6[1].substr(0, 2), 16), parseInt(hex6[1].substr(2, 2), 16), parseInt(hex6[1].substr(4, 2), 16), 1];
            }

            // Check for rgba (e.g. "rgba(255, 0, 0, 0.5)")
            var rgba = color.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+.*\d*)\s*\)$/i);
            if (rgba) {
                values = [parseInt(rgba[1]), parseInt(rgba[2]), parseInt(rgba[3]), parseFloat(rgba[4])];
            }

            // Check for rgb (e.g. "rgb(255, 0, 0)")
            var rgb = color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
            if (rgb) {
                values = [parseInt(rgb[1]), parseInt(rgb[2]), parseInt(rgb[3]), 1];
            }
            /*
                    // Check for hsl (e.g. "hsl(360, 100%, 50%)"
                    let hsl = color.match(/^hsl\s*\(\s*(\d+)\s*,\s*(\d+)\s*%\s*,\s*(\d+)\s*%\s*\)$/i);
                    if (hsl) {
                        values = this.constructor.hslaToRgba(...hsl.slice(1));
                    }
            
                    // Check for hsla (e.g. "hsla(360, 100%, 50%, 0.5)"
                    let hsla = color.match(/^hsla\s*\(\s*(\d+)\s*,\s*(\d+)\s*%\s*,\s*(\d+)\s*%\s*,\s*(\d+.*\d*)\s*\)$/i);
                    if (hsla) {
                        values = this.constructor.hslaToRgba(...hsla.slice(1));
                    }
            */
            return values;
        }
        /*
            static hsvaToRgba(h, s, v, a = 1) {
                let r, g, b, i, f, p, q, t;
                i = Math.floor(h * 6);
                f = h * 6 - i;
                p = v * (1 - s);
                q = v * (1 - f * s);
                t = v * (1 - (1 - f) * s);
                switch (i % 6) {
                    case 0: r = v, g = t, b = p; break;
                    case 1: r = q, g = v, b = p; break;
                    case 2: r = p, g = v, b = t; break;
                    case 3: r = p, g = q, b = v; break;
                    case 4: r = t, g = p, b = v; break;
                    case 5: r = v, g = p, b = q; break;
                }
                return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a];
            }
        
            static rgbaToHsva(r, g, b, a = 1) {
                let max = Math.max(r, g, b);
                let min = Math.min(r, g, b);
                let diff = max - min;
                let s = (max === 0 ? 0 : diff / max);
                let v = max / 255;
                let h;
        
                switch (max) {
                    case min: h = 0; break;
                    case r: h = (g - b) + diff * (g < b ? 6: 0); h /= 6 * diff; break;
                    case g: h = (b - r) + diff * 2; h /= 6 * diff; break;
                    case b: h = (r - g) + diff * 4; h /= 6 * diff; break;
                }
        
                return [h, s, v, a];
            }
        
            static hslaToRgba(h, s, l, a = 1) {
                h /= 360; s /= 100; l /= 100;
        
                let r, g, b;
        
                if(s == 0){
                    r = g = b = l; // achromatic
                }else{
                    let hueToRgb = (p, q, t) => {
                        if(t < 0) {
                            t += 1;
                        } else if(t > 1) {
                            t -= 1;
                        }
        
                        if (t < 1/6) {
                            return p + (q - p) * 6 * t;
                        } else if (t < 1/2) {
                            return q;
                        } else if (t < 2/3) {
                            return p + (q - p) * (2/3 - t) * 6;
                        } else {
                            return p;
                        }
                    };
        
                    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                    let p = 2 * l - q;
                    r = hueToRgb(p, q, h + 1/3);
                    g = hueToRgb(p, q, h);
                    b = hueToRgb(p, q, h - 1/3);
                }
        
                return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a];
            }
        
            static rgbaToHsla(r, g, b, a = 1) {
                r /= 255, g /= 255, b /= 255;
        
                let max = Math.max(r, g, b);
                let min = Math.min(r, g, b);
                let h, s, l = (max + min) / 2;
        
                if (max == min) {
                    h = s = 0; // achromatic
                } else {
                    let d = max - min;
                    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                    switch (max) {
                        case r:
                            h = (g - b) / d + (g < b ? 6 : 0); break;
                        case g:
                            h = (b - r) / d + 2; break;
                        case b:
                            h = (r - g) / d + 4; break;
                    }
                    h /= 6;
                }
        
                return [h, s, l, a];
            }
        */

        // TODO: this should be implemented as a factory that generates an interpolator object, that just takes in a t

    }, {
        key: "interpolate",
        value: function interpolate(firstColor, secondColor) {
            var t = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.5;

            var firstColorArray = Color.parseColor(firstColor);
            var secondColorArray = Color.parseColor(secondColor);

            return Color.convertToRgba([parseInt(firstColorArray[0] * (1 - t) + secondColorArray[0] * t), parseInt(firstColorArray[1] * (1 - t) + secondColorArray[1] * t), parseInt(firstColorArray[2] * (1 - t) + secondColorArray[2] * t), parseInt(firstColorArray[3] * (1 - t) + secondColorArray[3] * t)]);
        }
    }, {
        key: "convertToRgba",
        value: function convertToRgba(rgba) {
            return "rgba(" + rgba[0] + ", " + rgba[1] + ", " + rgba[2] + ", " + rgba[3] + ")";
        }
    }, {
        key: "isLight",
        value: function isLight(color) {
            var values = Color.parseColor(color);
            return values[0] * 0.3 + values[1] * 0.59 + values[2] * 0.11 > 188;
        }

        /*
            setRgba(value, index = -1) {
                if (index !== -1) {
                    let rgba = this.getRgba();
                    rgba[index] = value;
                    this.color = rgba;
                } else {
                    this.color = Color.rgbaToHsva(...value);
                }
            }
        
            getRgba() {
                return Color.hsvaToRgba(this.color);
            }
        
            addRgba(amount, index = -1) {
                let rgba = Color.hsvaToRgba(this.color);
                let setInRange = (rgba) => {
                    for (let i = 0; i < 3; i += 1) {
                        if (rgba[i] > 255) {
                            rgba[i] = 255;
                        } else if (rgba[i] < 0) {
                            rgba[i] = 0;
                        }
                    }
                    if (rgba[3] > 1) {
                        rgba[3] = 1;
                    } else if (rgba[3] < 0){
                        rgba[3] = 0;
                    }
                };
                if (index !== -1) {
                    rgba[index] += amount;
                } else {
                    if (amount.length === 3) {
                        amount.push(0);
                    }
                    for (let i  = 0; i < 4; i += 1) {
                        rgba[i] += amount[i];
                    }
                }
                setInRange(rgba);
                this.setRgba(rgba);
            }
        
            setHsva(value, index = -1) {
                if (index !== -1) {
                    this.color[index] = value;
                } else {
                    this.color = value;
                }
            }
        
            getHsva() {
                return this.color;
            }
        
            addHsva(amount, index = -1) {
                let hsva = this.color;
                let setInrange = (hsva) => {
                    if (hsva[0] > 1) {
                        hsva[0] -= 1;
                    } else if (hsva[0] < 0) {
                        hsva[0] += 1;
                    }
                    for (let i = 1; i < 4; i += 1) {
                        if (hsva[i] > 1) {
                            hsva[i] = 1;
                        } else if (hsva[i] < 0) {
                            hsva[i] = 0;
                        }
                    }
                };
                if (index !== -1) {
                    hsva[index] += amount
                }
                if (hsva.length === 3) {
                    hsva.push(1);
                }
                if (amount.length === 3) {
                    amount.push(0);
                }
                hsva[0] += amount[0];
                if (hsva[0] > 1) {
                    hsva[0] -= 1;
                } else if (hsva[0] < 0) {
                    hsva[0] += 1;
                }
                for (let i = 1; i < 4; i += 1) {
                    hsva[i] += amount[i];
                    if (hsva[i] < 0) {
                        hsva[i] = 0;
                    } else if (hsva[i] > 1) {
                        hsva[i] = 1;
                    }
                }
                this.color = hsva;
            }
        */

    }]);
    return Color;
}();

function lighten(color, amount) {
    if (amount >= 0) {
        return Color.interpolate(color, "#fff", amount);
    } else {
        return darken(color, -amount);
    }
}

function darken(color, amount) {
    if (amount >= 0) {
        var rgba = Color.parseColor(Color.interpolate(color, "#000", amount));
        for (var i = 0; i < 3; i += 1) {
            var root = Math.pow(255 - rgba[i], 0.7);
            rgba[i] = parseInt(rgba[i] - root * amount);
            if (rgba[i] < 0) {
                rgba[i] = 0;
            }
        }
        return Color.convertToRgba(rgba);
    } else {
        return lighten(color, -amount);
    }
}

function buildColors(color) {
    var colors = [];
    var darkenPercents = void 0;
    if (Color.isLight(color)) {
        darkenPercents = [0, 0.05, 0.1, 0.15, 0.3, 0.8];
    } else {
        darkenPercents = [0, 0.1, 0.2, 0.23, 0.1, -1];
    }
    for (var i = 0; i < darkenPercents.length; i += 1) {
        colors.push(darken(color, darkenPercents[i]));
    }
    return colors;
}

var Transition = function () {
    function Transition(options) {
        classCallCheck(this, Transition);

        this.func = options.func;
        this.context = options.context;
        this.duration = options.duration || 0;
        this.startTime = options.startTime || 0;
        this.dependsOn = options.dependsOn || [];
        this.speedFactor = 1;
    }

    createClass(Transition, [{
        key: "toString",
        value: function toString() {
            return "{\n" + "   context: " + this.context + "\n" + "   duration: " + this.duration + "\n" + "   startTime: " + this.startTime + "\n" + "   dependsOn: " + this.dependsOn + "\n" + "   func: " + this.func.toString() + "\n" + "}\n";
        }
    }, {
        key: "hasDependencyOn",
        value: function hasDependencyOn(t) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.dependsOn[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var transition = _step.value;

                    if (transition === t) {
                        return true;
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

            return false;
        }
    }, {
        key: "canAdvance",
        value: function canAdvance() {
            for (var i = 0; i < this.dependsOn.length; i += 1) {
                if (!this.dependsOn[i].isStopped()) {
                    return false;
                }
            }
            return true;
        }
    }, {
        key: "getFraction",
        value: function getFraction() {
            var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();

            return Math.min((now - this.startTime) / this.getLength(), 1);
        }
    }, {
        key: "start",
        value: function start() {
            var _this = this;

            var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();

            if (this.stopped) {
                delete this.stopped;
            }
            this.setStartTime(now);

            var functionWrapper = function functionWrapper() {
                if (_this.stopped) {
                    return;
                }
                if (!_this.pauseTime) {
                    _this.nextStep();
                }
                requestAnimationFrame(functionWrapper);
            };
            requestAnimationFrame(functionWrapper);
            return this;
        }
    }, {
        key: "getLength",
        value: function getLength() {
            return this.getEndTime() - this.startTime;
        }
    }, {
        key: "setStartTime",
        value: function setStartTime(time) {
            this.startTime = time;
            return this;
        }
    }, {
        key: "setSpeedFactor",
        value: function setSpeedFactor(speedFactor) {
            var now = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Date.now();

            var ratio = speedFactor / this.speedFactor;
            this.startTime = (this.startTime - now) / ratio + now;
            if (this.pauseTime) {
                this.pauseTime = (this.pauseTime - now) / ratio + now;
            }
            this.speedFactor = speedFactor;
            return this;
        }
    }, {
        key: "pause",
        value: function pause() {
            var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();

            if (!this.pauseTime) {
                this.pauseTime = now;
            }
            return this;
        }
    }, {
        key: "resume",
        value: function resume() {
            var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();

            if (this.pauseTime) {
                this.startTime += now - this.pauseTime;
                this.pauseTime = 0;
            }
            return this;
        }
    }, {
        key: "forceStart",
        value: function forceStart() {
            this.restart();
            this.func(0.0, this.context);
            return this;
        }
    }, {
        key: "forceFinish",
        value: function forceFinish() {
            this.func(1.0, this.context);
            this.stop();
            return this;
        }
    }, {
        key: "stop",
        value: function stop() {
            this.stopped = true;
        }
    }, {
        key: "restart",
        value: function restart() {
            delete this.stopped;
            return this;
        }
    }, {
        key: "isStopped",
        value: function isStopped() {
            return this.stopped === true;
        }
    }, {
        key: "nextStep",
        value: function nextStep() {
            var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();

            // Return if transition is stopped
            if (this.isStopped()) {
                return this;
            }
            this.lastT = this.getFraction(now);
            // Return if transitions not started yet
            if (this.lastT < 0) {
                return this;
            }
            // Call the animation function
            this.func(this.lastT, this.context);
            // Stop the animation if it's the last step
            if (this.lastT === 1) {
                this.stop();
            }
            return this;
        }
    }, {
        key: "getEndTime",
        value: function getEndTime() {
            return this.startTime + this.duration / this.speedFactor;
        }
    }]);
    return Transition;
}();

var Modifier = function (_Transition) {
    inherits(Modifier, _Transition);

    function Modifier(options) {
        classCallCheck(this, Modifier);

        var _this2 = possibleConstructorReturn(this, (Modifier.__proto__ || Object.getPrototypeOf(Modifier)).call(this, options));

        _this2.reverseFunc = options.reverseFunc;
        _this2.context = options.context;
        return _this2;
    }

    createClass(Modifier, [{
        key: "toString",
        value: function toString() {
            return "{\n" + "   context: " + this.context + "\n" + "   duration: " + this.duration + "\n" + "   startTime: " + this.startTime + "\n" + "   dependsOn: " + this.dependsOn + "\n" + "   func: " + this.func.toString() + "\n" + "   reverseFunc: " + this.reverseFunc.toString() + "\n" + "}\n";
        }
    }, {
        key: "forceStart",
        value: function forceStart() {
            this.restart();
            this.reverseFunc(this.context);
            return this;
        }
    }, {
        key: "forceFinish",
        value: function forceFinish() {
            this.func(this.context);
            this.stop();
            return this;
        }
    }, {
        key: "nextStep",
        value: function nextStep() {
            var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();

            if (this.isStopped()) {
                return this;
            }
            if (now >= this.startTime) {
                this.func(this.context);
                this.stop();
            }
            return this;
        }
    }, {
        key: "getEndTime",
        value: function getEndTime() {
            return this.startTime;
        }
    }]);
    return Modifier;
}(Transition);

var TransitionList = function () {
    function TransitionList() {
        var startTime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        classCallCheck(this, TransitionList);

        this.startTime = startTime;
        this.speedFactor = 1;
        this.transitions = [];
        this.dependsOn = [];
    }

    createClass(TransitionList, [{
        key: "toString",
        value: function toString() {
            return "{\n" + "   context: " + this.context + "\n" + "   duration: " + this.duration + "\n" + "   startTime: " + this.startTime + "\n" + "   dependsOn: " + this.dependsOn + "\n" + "   transitions: [" + (this.transitions.length ? this.transitions[0].toString() : "") + " ...]\n" + "}\n";
        }
    }, {
        key: "add",
        value: function add(transition) {
            var forceFinish = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            for (var i = 0; i < transition.dependsOn.length; i += 1) {
                if (transition.dependsOn[i].getEndTime() > transition.startTime) {
                    console.error(transition.toString() + "\ndepends on\n" + transition.dependsOn[i].toString() + "\n" + "which ends after its start!");
                }
            }
            if (forceFinish) {
                transition.forceFinish();
            }
            this.transitions.push(transition);
            return this;
        }
    }, {
        key: "push",
        value: function push(transition) {
            var forceFinish = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            transition.setStartTime(this.getLength());
            for (var i = 0; i < transition.dependsOn.length; i += 1) {
                if (transition.dependsOn[i].getEndTime() > transition.startTime) {
                    console.error(transition.toString() + "\ndepends on\n" + transition.dependsOn[i].toString() + "\n" + "which ends after its start!");
                }
            }
            if (forceFinish) {
                transition.forceFinish();
            }
            this.transitions.push(transition);
            return this;
        }
    }, {
        key: "getFraction",
        value: function getFraction() {
            var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();

            return Math.min((now - this.startTime) / this.getLength(), 1);
        }
    }, {
        key: "setStartTime",
        value: function setStartTime(startTime) {
            var timeDelta = startTime - this.startTime;
            this.startTime = startTime;
            for (var i = 0; i < this.transitions.length; i += 1) {
                var transition = this.transitions[i];
                transition.setStartTime(transition.startTime + timeDelta);
            }
        }
    }, {
        key: "start",
        value: function start() {
            var _this3 = this;

            var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();

            if (this.stopped) {
                delete this.stopped;
            }
            this.setStartTime(now);
            var functionWrapper = function functionWrapper() {
                if (_this3.stopped) {
                    return;
                }
                if (!_this3.pauseTime) {
                    _this3.nextStep();
                }
                requestAnimationFrame(functionWrapper);
            };
            requestAnimationFrame(functionWrapper);
            return this;
        }
    }, {
        key: "stop",
        value: function stop() {
            this.stopped = true;
            for (var i = 0; i < this.transitions.length; i += 1) {
                var transition = this.transitions[i];
                transition.stop();
            }
        }
    }, {
        key: "isStopped",
        value: function isStopped() {
            return this.stopped === true;
        }
    }, {
        key: "pause",
        value: function pause() {
            var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();

            if (!this.pauseTime) {
                this.pauseTime = now;
                for (var i = 0; i < this.transitions.length; i += 1) {
                    this.transitions[i].pause(now);
                }
            }
            return this;
        }
    }, {
        key: "resume",
        value: function resume() {
            var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();

            if (this.pauseTime) {
                this.startTime += now - this.pauseTime;
                for (var i = 0; i < this.transitions.length; i += 1) {
                    this.transitions[i].resume(now);
                }
                this.pauseTime = 0;
            }
            return this;
        }
    }, {
        key: "nextStep",
        value: function nextStep() {
            // Return if transition list is stopped
            if (this.isStopped()) {
                return;
            }

            if (this.onNewFrame) {
                this.onNewFrame(this.getFraction());
            }

            var finished = true;
            var stk = [];
            for (var i = 0; i < this.transitions.length; i += 1) {
                var transition = this.transitions[i];
                if (!transition.isStopped()) {
                    if (transition.canAdvance()) {
                        transition.nextStep();
                        while (stk.length !== 0 && this.transitions[stk[stk.length - 1]].canAdvance()) {
                            this.transitions[stk[stk.length - 1]].nextStep();
                            stk.pop();
                        }
                    } else {
                        stk.push(i);
                    }
                    finished = false;
                }
            }
            if (finished) {
                this.stop();
            }
            return this;
        }
    }, {
        key: "setSpeedFactor",
        value: function setSpeedFactor(speedFactor) {
            var now = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Date.now();

            var ratio = speedFactor / this.speedFactor;
            this.startTime = (this.startTime - now) / ratio + now;
            if (this.pauseTime) {
                this.pauseTime = (this.pauseTime - now) / ratio + now;
            }
            this.speedFactor = speedFactor;
            for (var i = 0; i < this.transitions.length; i += 1) {
                this.transitions[i].setSpeedFactor(speedFactor, now);
            }
            return this;
        }
    }, {
        key: "restart",
        value: function restart() {
            delete this.stopped;
            for (var i = 0; i < this.transitions.length; i += 1) {
                var transition = this.transitions[i];
                transition.restart();
            }
            this.sortByEndTime();
            return this;
        }
    }, {
        key: "getLength",
        value: function getLength() {
            return this.getEndTime() - this.startTime;
        }
    }, {
        key: "getEndTime",
        value: function getEndTime() {
            var endTime = 0;
            for (var i = 0; i < this.transitions.length; i += 1) {
                var transitionEndTime = this.transitions[i].getEndTime();
                if (transitionEndTime > endTime) {
                    endTime = transitionEndTime;
                }
            }
            return endTime;
        }
    }, {
        key: "hasDependencyOn",
        value: function hasDependencyOn(t) {
            for (var transition in this.dependsOn) {
                if (transition === t) {
                    return true;
                }
            }
            return false;
        }
    }, {
        key: "canAdvance",
        value: function canAdvance() {
            for (var i = 0; i < this.dependsOn.length; i += 1) {
                if (!this.dependsOn[i].isStopped()) {
                    return false;
                }
            }
            return true;
        }
    }, {
        key: "sortByStartTime",
        value: function sortByStartTime() {
            // TODO: this comparator should be global
            this.transitions.sort(function (a, b) {
                if (!equal(a.startTime, b.startTime, 0.001)) {
                    return b.startTime - a.startTime;
                }
                //not a hack, works in all conflict cases
                if (!equal(a.getEndTime(), b.getEndTime(), 0.001)) {
                    return b.getEndTime() - a.getEndTime();
                }
                if (a.hasDependencyOn(b)) {
                    return 1;
                }
                if (b.hasDependencyOn(a)) {
                    return -1;
                }
                return 0;
            });
        }
    }, {
        key: "sortByEndTime",
        value: function sortByEndTime() {
            this.transitions.sort(function (a, b) {
                if (!equal(a.getEndTime(), b.getEndTime(), 0.001)) {
                    return a.getEndTime() - b.getEndTime();
                }
                //not a hack, works in all conflict cases
                if (!equal(a.startTime, b.startTime, 0.001)) {
                    return a.startTime - b.startTime;
                }
                if (a.hasDependencyOn(b)) {
                    return -1;
                }
                if (b.hasDependencyOn(a)) {
                    return 1;
                }
                return 0;
            });
        }
    }, {
        key: "forceStart",
        value: function forceStart() {
            var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();

            this.sortByStartTime();
            for (var i = 0; i < this.transitions.length; i += 1) {
                var transition = this.transitions[i];
                if (transition.startTime <= now) {
                    transition.forceStart(now);
                }
            }
            return this;
        }
    }, {
        key: "forceFinish",
        value: function forceFinish() {
            var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();
            var startTime = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;

            this.sortByEndTime();
            for (var i = 0; i < this.transitions.length; i += 1) {
                var transition = this.transitions[i];
                if (transition.getEndTime() >= startTime) {
                    if (transition instanceof TransitionList) {
                        transition.forceFinish(now, startTime);
                    } else {
                        if (typeof now === "undefined" || transition.getEndTime() < now) {
                            transition.forceFinish();
                        }
                    }
                }
            }
            return this;
        }
    }, {
        key: "startAtPercent",
        value: function startAtPercent(startPercent) {
            var _this4 = this;

            var now = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Date.now();

            cancelAnimationFrame(this.animationFrameId);
            this.restart();
            // TODO(@wefgef): Buggy
            var paused = this.pauseTime;
            if (paused) {
                this.resume();
            }
            this.forceStart(now);
            this.setStartTime(now - startPercent * this.getLength());
            this.forceFinish(now);
            // TODO(@wefgef): Huge hack to deal with force transition
            this.nextStep();
            this.nextStep();
            if (paused) {
                this.pause();
            }

            var functionWrapper = function functionWrapper() {
                if (_this4.isStopped()) {
                    return;
                }
                if (!_this4.pauseTime) {
                    _this4.nextStep();
                }
                _this4.animationFrameId = requestAnimationFrame(functionWrapper);
            };
            this.animationFrameId = requestAnimationFrame(functionWrapper);
        }
    }]);
    return TransitionList;
}();

UI.SVG = {};

var FIREFOX_SVG_STYLE_ELEMENTS = ["width", "height", "rx", "ry", "cx", "cy", "x", "y"];

UI.SVG.Element = function (_UI$Element) {
    inherits(SVGElement, _UI$Element);

    function SVGElement() {
        classCallCheck(this, SVGElement);
        return possibleConstructorReturn(this, (SVGElement.__proto__ || Object.getPrototypeOf(SVGElement)).apply(this, arguments));
    }

    createClass(SVGElement, [{
        key: "createNode",
        value: function createNode() {
            this.node = document.createElementNS("http://www.w3.org/2000/svg", this.getNodeType());
            return this.node;
        }
    }, {
        key: "setOptions",
        value: function setOptions(options) {
            if (options.hasOwnProperty("style")) {
                // TODO: this should be in getNodeAttributes
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = FIREFOX_SVG_STYLE_ELEMENTS[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var attributeName = _step.value;

                        if (options.style.hasOwnProperty(attributeName) && !options.hasOwnProperty(attributeName)) {
                            options[attributeName] = options.style[attributeName];
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
            }
            if (this.constructor.getDefaultOptions) {
                var defaultOptions = this.constructor.getDefaultOptions();
                options = deepCopy({}, defaultOptions, options);
            }

            get(SVGElement.prototype.__proto__ || Object.getPrototypeOf(SVGElement.prototype), "setOptions", this).call(this, options);
        }
    }, {
        key: "saveState",
        value: function saveState() {
            var state = {};
            state.options = Object.assign({}, this.options);
            return state;
        }
    }, {
        key: "setStyle",
        value: function setStyle(attributeName, value) {
            get(SVGElement.prototype.__proto__ || Object.getPrototypeOf(SVGElement.prototype), "setStyle", this).call(this, attributeName, value);
            // TODO: WTF, in operator? use a Map!
            if (attributeName in FIREFOX_SVG_STYLE_ELEMENTS) {
                this.options[attributeName] = value;
                this.setAttribute(attributeName, value);
                this.redraw();
            }
        }
    }, {
        key: "setState",
        value: function setState(state) {
            this.setOptions(state.options);
        }
    }, {
        key: "getNodeAttributes",
        value: function getNodeAttributes() {
            var attr = get(SVGElement.prototype.__proto__ || Object.getPrototypeOf(SVGElement.prototype), "getNodeAttributes", this).call(this);
            attr.className = null;

            var transform = this.getTransform();
            if (transform) {
                attr.setAttribute("transform", transform);
            }

            return attr;
        }
    }, {
        key: "getTransform",
        value: function getTransform() {
            if (this.options.transform) {
                return this.options.transform;
            }
            if (this.options.translate) {
                return this.options.translate;
            }
            return null;
        }
    }, {
        key: "translate",
        value: function translate() {
            var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            this.options.translate = "translate(" + x + "," + y + ")";
        }
    }, {
        key: "getHashCode",
        value: function getHashCode() {
            return this.uniqueId();
        }

        //TODO(@all) : getBoundingClientRect is unreliable, reimplement it.

    }, {
        key: "getBoundingClientRect",
        value: function getBoundingClientRect() {
            var element = this.node;
            var x = 0;
            var y = 0;
            while (element && element !== document.body) {
                x -= element.scrollLeft;
                y -= element.scrollTop;
                element = element.offsetParent || element.parentNode;
            }
            if (element) {
                x -= element.scrollLeft;
                y -= element.scrollTop;
            }
            var pos = this.node.getBoundingClientRect();
            return {
                top: pos.top - y,
                left: pos.left - x,
                width: pos.width,
                bottom: pos.bottom - y,
                height: pos.height,
                right: pos.right - x
            };
        }
    }, {
        key: "getBBox",
        value: function getBBox() {
            return this.node.getBBox();
        }
    }, {
        key: "getHeight",
        value: function getHeight() {
            return this.getBoundingClientRect().height;
        }
    }, {
        key: "getWidth",
        value: function getWidth() {
            return this.getBoundingClientRect().width;
        }
    }, {
        key: "toFront",
        value: function toFront() {}
    }, {
        key: "toBack",
        value: function toBack() {}
    }, {
        key: "setOpacity",
        value: function setOpacity(newOpacity) {
            this.options.opacity = newOpacity;
            if (this.node) {
                this.node.setAttribute("opacity", newOpacity);
            }
        }
    }, {
        key: "setColor",
        value: function setColor(color) {
            this.options.color = color;
            if (this.node) {
                this.node.setAttribute("stroke", color);
                this.node.setAttribute("fill", color);
            }
        }
    }, {
        key: "blinkTransition",
        value: function blinkTransition(options) {
            var _this2 = this;

            var config = {
                duration: 2000,
                times: 2,
                firstColor: "grey",
                secondColor: "black",
                executeLastStep: true,
                startTime: 0,
                dependsOn: []
            };
            Object.assign(config, options);
            return new Transition({
                func: function func(t, context) {
                    if (t > 1 - context.interval && !context.executeLastStep) {
                        _this2.setColor(context.firstColor);
                    } else {
                        _this2.setColor(Math.floor((1 - t) / context.interval) % 2 === 1 ? context.firstColor : context.secondColor);
                    }
                },
                context: {
                    firstColor: config.firstColor,
                    secondColor: config.secondColor,
                    interval: 1 / (2 * config.times),
                    executeLastStep: config.executeLastStep
                },
                duration: config.duration,
                startTime: config.startTime,
                dependsOn: config.dependsOn
            });
        }
    }, {
        key: "changeOpacityTransition",
        value: function changeOpacityTransition(opacity, duration) {
            var _this3 = this;

            var dependsOn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
            var startTime = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

            if (!this.options.hasOwnProperty("opacity")) {
                this.options.opacity = 1;
            }
            return new Transition({
                func: function func(t, context) {
                    _this3.setOpacity((1 - t) * context.opacity + t * opacity);
                },
                context: {
                    opacity: this.options.opacity
                },
                duration: duration,
                startTime: startTime,
                dependsOn: dependsOn
            });
        }
    }, {
        key: "changeColorTransition",
        value: function changeColorTransition(color, duration) {
            var _this4 = this;

            var dependsOn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
            var startTime = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

            return new Transition({
                func: function func(t, context) {
                    _this4.setColor(Color.interpolate(context.color, color, t));
                },
                context: {
                    color: this.getColor()
                },
                duration: duration,
                startTime: startTime,
                dependsOn: dependsOn
            });
        }
    }, {
        key: "remove",
        value: function remove() {}
    }, {
        key: "getSvg",
        value: function getSvg() {
            return this.parent.getSvg();
        }
    }, {
        key: "getRaphael",
        value: function getRaphael() {
            if (!this.hasOwnProperty("_raphael")) {
                this._raphael = this.createRaphael();
                this._raphael.node.remove();
                this._raphael.node = this.node;
            }
            return this._raphael;
        }
    }, {
        key: "getSnap",
        value: function getSnap() {
            if (!this.hasOwnProperty("_snap")) {
                this._snap = this.createSnap();
                this._snap.node.remove();
                this._snap.node = this.node;
            }
            return this._snap;
        }
    }]);
    return SVGElement;
}(UI.Element);

UI.SVG.Element.domAttributesMap = CreateNodeAttributesMap(UI.Element.domAttributesMap, [["fill"], ["height"], ["opacity"], ["stroke"], ["strokeWidth", { domName: "stroke-width" }], ["clipPath", { domName: "clip-path" }], ["transform"], ["width"], ["cx"], ["cy"], ["rx"], ["ry"], ["x"], ["y"], ["offset"], ["stopColor", { domName: "stop-color" }], ["strokeDasharray", { domName: "stroke-dasharray" }], ["strokeLinecap", { domName: "stroke-linecap" }]]);

UI.SVG.SVGRoot = function (_UI$SVG$Element) {
    inherits(SVGRoot, _UI$SVG$Element);

    function SVGRoot() {
        classCallCheck(this, SVGRoot);
        return possibleConstructorReturn(this, (SVGRoot.__proto__ || Object.getPrototypeOf(SVGRoot)).apply(this, arguments));
    }

    createClass(SVGRoot, [{
        key: "getNodeType",
        value: function getNodeType() {
            return "svg";
        }
    }, {
        key: "getSnap",
        value: function getSnap() {
            return Snap(this.node);
        }
    }, {
        key: "getSvg",
        value: function getSvg() {
            return this;
        }
    }]);
    return SVGRoot;
}(UI.SVG.Element);

UI.SVG.RawSVG = function (_UI$SVG$SVGRoot) {
    inherits(RawSVG, _UI$SVG$SVGRoot);

    function RawSVG() {
        classCallCheck(this, RawSVG);
        return possibleConstructorReturn(this, (RawSVG.__proto__ || Object.getPrototypeOf(RawSVG)).apply(this, arguments));
    }

    createClass(RawSVG, [{
        key: "redraw",
        value: function redraw() {
            get(RawSVG.prototype.__proto__ || Object.getPrototypeOf(RawSVG.prototype), "redraw", this).call(this);
            this.node.innerHTML = this.options.innerHTML;
        }
    }]);
    return RawSVG;
}(UI.SVG.SVGRoot);

UI.SVG.AnimatedSVG = function (_UI$SVG$SVGRoot2) {
    inherits(AnimatedSVG, _UI$SVG$SVGRoot2);

    function AnimatedSVG() {
        classCallCheck(this, AnimatedSVG);
        return possibleConstructorReturn(this, (AnimatedSVG.__proto__ || Object.getPrototypeOf(AnimatedSVG)).apply(this, arguments));
    }

    createClass(AnimatedSVG, [{
        key: "onMount",
        value: function onMount() {
            var _this8 = this;

            if (this.options.transition) {
                (function () {
                    _this8.options.transition.setStartTime(Date.now());
                    var animationWrapper = function animationWrapper() {
                        if (_this8.options.transition.isStopped()) {
                            if (_this8.options.repeat) {
                                _this8.options.transition.setStartTime(Date.now());
                                _this8.options.transition.restart();
                                requestAnimationFrame(animationWrapper);
                            }
                            return;
                        }
                        if (!_this8.options.transition.pauseTime) {
                            _this8.options.transition.nextStep();
                        }
                        requestAnimationFrame(animationWrapper);
                    };
                    requestAnimationFrame(animationWrapper);
                })();
            }
        }
    }]);
    return AnimatedSVG;
}(UI.SVG.SVGRoot);

UI.SVG.Group = function (_UI$SVG$Element2) {
    inherits(SVGGroup, _UI$SVG$Element2);

    function SVGGroup() {
        classCallCheck(this, SVGGroup);
        return possibleConstructorReturn(this, (SVGGroup.__proto__ || Object.getPrototypeOf(SVGGroup)).apply(this, arguments));
    }

    createClass(SVGGroup, [{
        key: "getNodeType",
        value: function getNodeType() {
            return "g";
        }
    }, {
        key: "setColor",
        value: function setColor(color) {
            for (var i = 0; i < this.children.length; i += 1) {
                this.children[i].setColor(color);
            }
        }
    }]);
    return SVGGroup;
}(UI.SVG.Element);

UI.SVG.Defs = function (_UI$SVG$Element3) {
    inherits(SVGDefs, _UI$SVG$Element3);

    function SVGDefs() {
        classCallCheck(this, SVGDefs);
        return possibleConstructorReturn(this, (SVGDefs.__proto__ || Object.getPrototypeOf(SVGDefs)).apply(this, arguments));
    }

    createClass(SVGDefs, [{
        key: "getNodeType",
        value: function getNodeType() {
            return "defs";
        }
    }]);
    return SVGDefs;
}(UI.SVG.Element);

UI.SVG.ClipPath = function (_UI$SVG$Element4) {
    inherits(ClipPath, _UI$SVG$Element4);

    function ClipPath() {
        classCallCheck(this, ClipPath);
        return possibleConstructorReturn(this, (ClipPath.__proto__ || Object.getPrototypeOf(ClipPath)).apply(this, arguments));
    }

    createClass(ClipPath, [{
        key: "getNodeType",
        value: function getNodeType() {
            return "clipPath";
        }
    }]);
    return ClipPath;
}(UI.SVG.Element);

UI.SVG.Path = function (_UI$SVG$Element5) {
    inherits(SVGPath, _UI$SVG$Element5);

    function SVGPath() {
        classCallCheck(this, SVGPath);
        return possibleConstructorReturn(this, (SVGPath.__proto__ || Object.getPrototypeOf(SVGPath)).apply(this, arguments));
    }

    createClass(SVGPath, [{
        key: "getNodeType",
        value: function getNodeType() {
            return "path";
        }
    }, {
        key: "getNodeAttributes",
        value: function getNodeAttributes() {
            var attr = get(SVGPath.prototype.__proto__ || Object.getPrototypeOf(SVGPath.prototype), "getNodeAttributes", this).call(this);
            attr.setAttribute("d", this.getPath());
            return attr;
        }
    }, {
        key: "createSnap",
        value: function createSnap() {
            return this.getSvg().getSnap().path();
        }
    }, {
        key: "getPath",
        value: function getPath() {
            return this.options.d;
        }
    }, {
        key: "setPath",
        value: function setPath(newPath) {
            this.options.d = newPath;
            this.node.setAttribute("d", this.options.d);
        }
    }, {
        key: "getLength",
        value: function getLength() {
            return this.node.getTotalLength();
        }
    }, {
        key: "getPointAtLength",
        value: function getPointAtLength(len) {
            return this.node.getPointAtLength(len);
        }
    }], [{
        key: "getDefaultOptions",
        value: function getDefaultOptions() {
            return {
                d: ""
            };
        }
    }]);
    return SVGPath;
}(UI.SVG.Element);

UI.SVG.Circle = function (_UI$SVG$Element6) {
    inherits(SVGCircle, _UI$SVG$Element6);

    function SVGCircle() {
        classCallCheck(this, SVGCircle);
        return possibleConstructorReturn(this, (SVGCircle.__proto__ || Object.getPrototypeOf(SVGCircle)).apply(this, arguments));
    }

    createClass(SVGCircle, [{
        key: "getNodeType",
        value: function getNodeType() {
            return "circle";
        }
    }, {
        key: "getNodeAttributes",
        value: function getNodeAttributes() {
            var attr = get(SVGCircle.prototype.__proto__ || Object.getPrototypeOf(SVGCircle.prototype), "getNodeAttributes", this).call(this);
            attr.setAttribute("r", this.options.radius);
            attr.setAttribute("cx", this.options.center.x);
            attr.setAttribute("cy", this.options.center.y);
            return attr;
        }
    }, {
        key: "getRadius",
        value: function getRadius() {
            return this.options.radius;
        }
    }, {
        key: "setRadius",
        value: function setRadius(radius) {
            this.options.radius = radius;

            this.setAttribute("r", radius);
        }
    }, {
        key: "setCenter",
        value: function setCenter(x, y) {
            this.options.center.x = x;
            this.options.center.y = y;

            this.setAttribute("cx", x);
            this.setAttribute("cy", y);
        }
    }, {
        key: "getCenter",
        value: function getCenter() {
            return this.options.center;
        }
    }, {
        key: "toPath",
        value: function toPath() {
            var r = this.options.radius;
            var cx = this.options.center.x;
            var cy = this.options.center.y;
            var pathString = "M" + (cx - r) + " " + cy + // Starting point is W
            "a" + r + " " + r + " 0 0 1 " + r + " " + -r + // Move to N
            "a" + r + " " + r + " 0 0 1 " + r + " " + r + // Move to E
            "a" + r + " " + r + " 0 0 1 " + -r + " " + r + // Move to S
            "a" + r + " " + r + " 0 0 1 " + -r + " " + -r; // Finally, move back to W
            return new UI.SVG.Path({ d: pathString });
        }
    }], [{
        key: "getDefaultOptions",
        value: function getDefaultOptions() {
            return {
                radius: 0,
                center: { x: 0, y: 0 }
            };
        }
    }]);
    return SVGCircle;
}(UI.SVG.Element);

//TODO Complete this class
UI.SVG.Ellipse = function (_UI$SVG$Element7) {
    inherits(SVGEllipse, _UI$SVG$Element7);

    function SVGEllipse() {
        classCallCheck(this, SVGEllipse);
        return possibleConstructorReturn(this, (SVGEllipse.__proto__ || Object.getPrototypeOf(SVGEllipse)).apply(this, arguments));
    }

    createClass(SVGEllipse, [{
        key: "getNodeType",
        value: function getNodeType() {
            return "ellipse";
        }
    }, {
        key: "getNodeAttributes",
        value: function getNodeAttributes() {
            var attr = get(SVGEllipse.prototype.__proto__ || Object.getPrototypeOf(SVGEllipse.prototype), "getNodeAttributes", this).call(this);
            attr.setAttribute("rx", this.options.rx);
            attr.setAttribute("ry", this.options.ry);
            return attr;
        }
    }]);
    return SVGEllipse;
}(UI.SVG.Element);

UI.SVG.CircleArc = function (_UI$SVG$Path) {
    inherits(SVGCircleArc, _UI$SVG$Path);

    function SVGCircleArc() {
        classCallCheck(this, SVGCircleArc);
        return possibleConstructorReturn(this, (SVGCircleArc.__proto__ || Object.getPrototypeOf(SVGCircleArc)).apply(this, arguments));
    }

    createClass(SVGCircleArc, [{
        key: "getPath",
        value: function getPath() {
            var startAngle = this.options.startAngle;
            var endAngle = this.options.endAngle;
            var radius = this.options.radius;
            var center = this.options.center;

            var angleDiff = endAngle - startAngle + (endAngle < startAngle ? 2 * Math.PI : 0);
            var startPoint = polarToCartesian(startAngle, radius, center);
            var endPoint = polarToCartesian(endAngle, radius, center);
            var sweepFlag;
            var largeArcFlag;

            // Set largeArcFlag and sweepFlag
            if (angleDiff <= Math.PI) {
                largeArcFlag = 0;
                if (crossProduct(startPoint, endPoint, center) <= 0) {
                    sweepFlag = 0;
                } else {
                    sweepFlag = 1;
                }
            } else {
                largeArcFlag = 1;
                if (crossProduct(startPoint, endPoint, center) <= 0) {
                    sweepFlag = 1;
                } else {
                    sweepFlag = 0;
                }
            }

            return "M " + startPoint.x + " " + startPoint.y + " A " + radius + " " + radius + " 0 " + largeArcFlag + " " + sweepFlag + " " + endPoint.x + " " + endPoint.y;
        }
    }]);
    return SVGCircleArc;
}(UI.SVG.Path);

UI.SVG.Rect = function (_UI$SVG$Element8) {
    inherits(SVGRect, _UI$SVG$Element8);

    function SVGRect() {
        classCallCheck(this, SVGRect);
        return possibleConstructorReturn(this, (SVGRect.__proto__ || Object.getPrototypeOf(SVGRect)).apply(this, arguments));
    }

    createClass(SVGRect, [{
        key: "getNodeType",
        value: function getNodeType() {
            return "rect";
        }
    }, {
        key: "getNodeAttributes",
        value: function getNodeAttributes() {
            var attr = get(SVGRect.prototype.__proto__ || Object.getPrototypeOf(SVGRect.prototype), "getNodeAttributes", this).call(this);

            attr.setAttribute("x", this.options.x);
            attr.setAttribute("y", this.options.y);
            attr.setAttribute("rx", this.options.rx);
            attr.setAttribute("ry", this.options.ry);
            attr.setAttribute("width", this.options.width);
            attr.setAttribute("height", this.options.height);

            return attr;
        }
    }, {
        key: "getX",
        value: function getX() {
            return this.options.x;
        }
    }, {
        key: "setX",
        value: function setX(x) {
            this.options.x = x;
            this.node.setAttribute("x", this.options.x);
        }
    }, {
        key: "getY",
        value: function getY() {
            return this.options.y;
        }
    }, {
        key: "setY",
        value: function setY(y) {
            this.options.y = y;
            this.node.setAttribute("y", this.options.y);
        }
    }, {
        key: "getWidth",
        value: function getWidth() {
            return this.options.width;
        }
    }, {
        key: "setWidth",
        value: function setWidth(width) {
            this.options.width = width;
            this.node.setAttribute("width", this.options.width);
        }
    }, {
        key: "getHeight",
        value: function getHeight() {
            return this.options.height;
        }
    }, {
        key: "setHeight",
        value: function setHeight(height) {
            this.options.height = height;
            this.node.setAttribute("height", this.options.height);
        }
    }], [{
        key: "getDefaultOptions",
        value: function getDefaultOptions() {
            return {
                x: 0,
                y: 0,
                rx: 0,
                ry: 0,
                width: 0,
                height: 0
            };
        }
    }]);
    return SVGRect;
}(UI.SVG.Element);

UI.SVG.Line = function (_UI$SVG$Element9) {
    inherits(SVGLine, _UI$SVG$Element9);

    function SVGLine() {
        classCallCheck(this, SVGLine);
        return possibleConstructorReturn(this, (SVGLine.__proto__ || Object.getPrototypeOf(SVGLine)).apply(this, arguments));
    }

    createClass(SVGLine, [{
        key: "getNodeType",
        value: function getNodeType() {
            return "line";
        }
    }, {
        key: "getNodeAttributes",
        value: function getNodeAttributes() {
            var attr = get(SVGLine.prototype.__proto__ || Object.getPrototypeOf(SVGLine.prototype), "getNodeAttributes", this).call(this);

            attr.setAttribute("x1", this.options.x1);
            attr.setAttribute("y1", this.options.y1);
            attr.setAttribute("x2", this.options.x2);
            attr.setAttribute("y2", this.options.y2);

            return attr;
        }

        //TODO(@all): Make the getters for x1, y1, x2, y2

    }, {
        key: "setLine",
        value: function setLine(x1, y1, x2, y2) {
            this.options.x1 = x1;
            this.options.y1 = y1;
            this.options.x2 = x2;
            this.options.y2 = y2;

            this.setAttribute("x1", x1);
            this.setAttribute("y1", y1);
            this.setAttribute("x2", x2);
            this.setAttribute("y2", y2);
        }
    }], [{
        key: "getDefaultOptions",
        value: function getDefaultOptions() {
            return {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 0,
                fill: "black",
                stroke: "black"
            };
        }
    }]);
    return SVGLine;
}(UI.SVG.Element);

UI.SVG.Text = function (_UI$SVG$Element10) {
    inherits(SVGText, _UI$SVG$Element10);

    function SVGText() {
        classCallCheck(this, SVGText);
        return possibleConstructorReturn(this, (SVGText.__proto__ || Object.getPrototypeOf(SVGText)).apply(this, arguments));
    }

    createClass(SVGText, [{
        key: "getNodeType",
        value: function getNodeType() {
            return "text";
        }
    }, {
        key: "setOptions",
        value: function setOptions(options) {
            get(SVGText.prototype.__proto__ || Object.getPrototypeOf(SVGText.prototype), "setOptions", this).call(this, options);
            if (!this.options.selectable) {
                if (!this.options.style) {
                    this.options.style = {};
                }
                this.options.style["-webkit-user-select"] = "none";
                this.options.style["-moz-user-select"] = "none";
                this.options.style["-ms-user-select"] = "none";
                this.options.style["user-select"] = "none";
            }
        }
    }, {
        key: "getNodeAttributes",
        value: function getNodeAttributes() {
            var attr = get(SVGText.prototype.__proto__ || Object.getPrototypeOf(SVGText.prototype), "getNodeAttributes", this).call(this);

            var allowedAttrNames = new Map([["dx", "dx"], ["dy", "dy"], ["fontSize", "font-size"], ["textAnchor", "text-anchor"], ["style", "style"]]);
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = allowedAttrNames[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _step2$value = slicedToArray(_step2.value, 2),
                        key = _step2$value[0],
                        value = _step2$value[1];

                    if (this.options.hasOwnProperty(key)) {
                        attr.setAttribute(value, this.options[key]);
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

            attr.setAttribute("x", this.options.x);
            attr.setAttribute("y", this.options.y);

            return attr;
        }
    }, {
        key: "render",
        value: function render() {
            return [UI.createElement(UI.TextElement, { ref: "textElement", value: this.options.text + "" })];
        }
    }, {
        key: "getX",
        value: function getX() {
            return this.options.x;
        }
    }, {
        key: "setX",
        value: function setX(x) {
            this.options.x = x;
            this.node.setAttribute("x", this.options.x);
        }
    }, {
        key: "getY",
        value: function getY() {
            return this.options.y;
        }
    }, {
        key: "setY",
        value: function setY(y) {
            this.options.y = y;
            this.node.setAttribute("y", this.options.y);
        }
    }, {
        key: "setText",
        value: function setText(text) {
            this.textElement.setValue(text + "");
            this.options.text = text;
            //this.redraw();
            // TODO: set the nodeValue of the child
            //this.children[0].node.nodeValue = value;
        }
    }, {
        key: "getText",
        value: function getText() {
            return this.options.text;
        }
    }, {
        key: "setPosition",
        value: function setPosition(x, y) {
            this.setX(x);
            this.setY(y);
        }
    }, {
        key: "getColor",
        value: function getColor() {
            return this.options.color;
        }
    }, {
        key: "setColor",
        value: function setColor(color) {
            var fillOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            this.options.color = color;
            if (this.node) {
                this.node.setAttribute("fill", color);
                if (!fillOnly) {
                    this.node.setAttribute("stroke", color);
                }
            }
        }
    }, {
        key: "moveTransition",
        value: function moveTransition(coords, duration) {
            var _this19 = this;

            var dependsOn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
            var startTime = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

            return new Transition({
                func: function func(t, context) {
                    _this19.setPosition((1 - t) * context.x + t * coords.x, (1 - t) * context.y + t * coords.y);
                },
                context: {
                    x: this.options.x,
                    y: this.options.y
                },
                duration: duration,
                startTime: startTime,
                dependsOn: dependsOn
            });
        }
    }, {
        key: "changeFillTransition",
        value: function changeFillTransition(color, duration) {
            var _this20 = this;

            var dependsOn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
            var startTime = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

            return new Transition({
                func: function func(t, context) {
                    _this20.setColor(Color.interpolate(context.color, color, t), true);
                },
                context: {
                    color: this.getColor()
                },
                duration: duration,
                startTime: startTime,
                dependsOn: dependsOn
            });
        }
    }], [{
        key: "getDefaultOptions",
        value: function getDefaultOptions() {
            return {
                x: 0,
                y: 0,
                text: "",
                fontSize: "15px",
                color: "black",
                dy: "0.35em",
                textAnchor: "middle",
                selectable: false
            };
        }
    }]);
    return SVGText;
}(UI.SVG.Element);

UI.SVG.Text.domAttributesMap = CreateNodeAttributesMap(UI.SVG.Element.domAttributesMap, [["fontFamily", { domName: "font-family" }]]);

UI.SVG.TextArea = function (_UI$SVG$Element11) {
    inherits(SVGTextArea, _UI$SVG$Element11);

    function SVGTextArea() {
        classCallCheck(this, SVGTextArea);
        return possibleConstructorReturn(this, (SVGTextArea.__proto__ || Object.getPrototypeOf(SVGTextArea)).apply(this, arguments));
    }

    createClass(SVGTextArea, [{
        key: "setOptions",
        value: function setOptions(options) {
            get(SVGTextArea.prototype.__proto__ || Object.getPrototypeOf(SVGTextArea.prototype), "setOptions", this).call(this, options);
            this.rect = UI.createElement(UI.SVG.Rect, null);
            this.text = UI.createElement(UI.SVG.Text, null);
        }
    }, {
        key: "getX",
        value: function getX() {
            return this.rect.getX();
        }
    }, {
        key: "setX",
        value: function setX(x) {
            this.rect.setX(x);
            this.text.setX(x + this.options.padding);
        }
    }, {
        key: "getY",
        value: function getY() {
            return this.rect.getY();
        }
    }, {
        key: "setY",
        value: function setY(y) {
            this.rect.setY(y);
            this.text.setY(y + this.options.padding);
        }
    }, {
        key: "getWidth",
        value: function getWidth() {
            return this.rect.getWidth();
        }
    }, {
        key: "setWidth",
        value: function setWidth(width) {
            this.rect.setWidth(width);
            this.redraw();
        }
    }, {
        key: "getHeight",
        value: function getHeight() {
            return this.rect.getHeight();
        }
    }, {
        key: "setHeight",
        value: function setHeight(height) {
            this.rect.setHeight(height);
            this.redraw();
        }
    }, {
        key: "render",
        value: function render() {}
    }], [{
        key: "getDefaultOptions",
        value: function getDefaultOptions() {
            return {
                padding: 0
            };
        }
    }]);
    return SVGTextArea;
}(UI.SVG.Element);

UI.SVG.Polygon = function (_UI$SVG$Path2) {
    inherits(Polygon, _UI$SVG$Path2);

    function Polygon() {
        classCallCheck(this, Polygon);
        return possibleConstructorReturn(this, (Polygon.__proto__ || Object.getPrototypeOf(Polygon)).apply(this, arguments));
    }

    createClass(Polygon, [{
        key: "getNodeAttributes",
        value: function getNodeAttributes() {
            var attr = get(Polygon.prototype.__proto__ || Object.getPrototypeOf(Polygon.prototype), "getNodeAttributes", this).call(this);
            attr.setAttribute("d", this.getPolygonPath());
            return attr;
        }
    }, {
        key: "getPolygonPath",
        value: function getPolygonPath() {
            var pathString = "";
            for (var i = 0; i < this.options.points.length; ++i) {
                if (i == 0) {
                    pathString += "M ";
                } else {
                    pathString += "L ";
                }
                pathString += this.options.points[i].x + " " + this.options.points[i].y + " ";
            }
            pathString += "Z";
            return pathString;
        }
    }, {
        key: "setPoints",
        value: function setPoints(points) {
            this.options.points = points;
            this.setPath(this.getPolygonPath());
        }
    }], [{
        key: "getDefaultOptions",
        value: function getDefaultOptions() {
            return {
                points: []
            };
        }
    }]);
    return Polygon;
}(UI.SVG.Path);

// TODO: need to have Switcher properly work with a redraw
// TODO: also move out of UI namespace

var Switcher = function (_UI$Element) {
    inherits(Switcher, _UI$Element);

    function Switcher(options) {
        classCallCheck(this, Switcher);

        var _this = possibleConstructorReturn(this, (Switcher.__proto__ || Object.getPrototypeOf(Switcher)).call(this, options));

        _this.childMap = new WeakMap();
        return _this;
    }

    createClass(Switcher, [{
        key: "copyState",
        value: function copyState(element) {
            var options = Object.assign({}, element.options, {
                children: this.overwriteElements(this.options.children || [], element.options.children || [])
            });

            this.setOptions(options);

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.options.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var child = _step.value;

                    if (child.options.active) {
                        this.activeChild = child;
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
        }
    }, {
        key: "render",
        value: function render() {
            return this.activeChild || this.options.children[0];
        }
    }, {
        key: "overwriteElements",
        value: function overwriteElements(existingElements, newElements) {
            var keyMap = this.getElementKeyMap(existingElements);
            for (var i = 0; i < newElements.length; i += 1) {
                var newChild = newElements[i];
                var newChildKey = newChild.options && newChild.options.key || "autokey" + i;
                var existingChild = keyMap.get(newChildKey);
                if (existingChild === newChild) {
                    continue;
                }
                if (existingChild && newChild.canOverwrite(existingChild)) {
                    newElements[i] = newChild = this.overwriteChild(existingChild, newChild);
                }
            }
            return newElements;
        }
    }, {
        key: "redraw",
        value: function redraw() {
            //basic things for our current node
            this.applyNodeAttributes();
            this.applyRef();

            // This render may be required to update this.options.children
            UI.renderingStack.push(this);
            this.render();
            UI.renderingStack.pop();

            if (this.options.children.length == 0) {
                return;
            }

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.options.children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var child = _step2.value;

                    if (this.options.lazyRender) {
                        this.getChildProperties(child).isUpToDate = false;
                        child.applyRef();
                    } else {
                        this.updateChild(child);
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

            this.updateActiveChild(this.activeChild || this.options.children[0]);
        }
    }, {
        key: "getChildProperties",
        value: function getChildProperties(child) {
            if (!this.childMap.has(child)) {
                this.childMap.set(child, {
                    isUpToDate: false,
                    isMounted: !!child.node
                });
            }
            return this.childMap.get(child);
        }
    }, {
        key: "updateChild",
        value: function updateChild(child) {
            if (!this.getChildProperties(child).isUpToDate) {
                if (!child.node) {
                    child.mount(this);
                } else {
                    child.redraw();
                }
                this.getChildProperties(child).isUpToDate = true;
            }
        }
    }, {
        key: "appendChild",
        value: function appendChild(child) {
            var doMount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            this.options.children.push(child);
            if (doMount) {
                child.mount(this);
            }
            if (this.options.children.length == 1) {
                this.setActive(child);
            }
            return child;
        }
    }, {
        key: "getActive",
        value: function getActive() {
            return this.activeChild;
        }
    }, {
        key: "insertChildNodeBefore",
        value: function insertChildNodeBefore(child, nextSibling) {
            var childProperties = this.getChildProperties(child);
            childProperties.isMounted = true;
            childProperties.isUpToDate = true;
        }
    }, {
        key: "updateActiveChild",
        value: function updateActiveChild(element) {
            if (this.activeChild) {
                this.activeChild.dispatch("setActive", false);
            }

            while (this.node.firstChild) {
                //TODO: would be useful here to be able to access the matching UI Element
                this.node.removeChild(this.node.firstChild);
            }

            this.updateChild(element);

            this.node.appendChild(element.node);
            this.children[0] = this.activeChild = element;

            element.dispatch("setActive", true);
        }
    }, {
        key: "setActive",
        value: function setActive(element) {
            if (this.activeChild === element) {
                return;
            }
            if (this.activeChild) {
                this.activeChild.dispatch("hide");
            }
            this.updateActiveChild(element);
            this.activeChild.dispatch("show");
        }
    }, {
        key: "hasChild",
        value: function hasChild(element) {
            return this.childMap.has(element);
        }
    }, {
        key: "onMount",
        value: function onMount() {
            var _this2 = this;

            this.addListener("shouldRedrawChild", function (event) {
                if (event.child.isInDocument()) {
                    event.child.redraw();
                } else {
                    _this2.getChildProperties(event.child).isUpToDate = false;
                }
            });
        }
    }]);
    return Switcher;
}(UI.Element);



UI.Switcher = Switcher;

UI.FloatingWindow = function (_UI$Element) {
    inherits(FloatingWindow, _UI$Element);

    function FloatingWindow() {
        classCallCheck(this, FloatingWindow);
        return possibleConstructorReturn(this, (FloatingWindow.__proto__ || Object.getPrototypeOf(FloatingWindow)).apply(this, arguments));
    }

    createClass(FloatingWindow, [{
        key: "getDefaultOptions",
        value: function getDefaultOptions() {
            return {
                transitionTime: 0
            };
        }
    }, {
        key: "setOptions",
        value: function setOptions(options) {
            options = Object.assign(this.getDefaultOptions(), options);
            get(FloatingWindow.prototype.__proto__ || Object.getPrototypeOf(FloatingWindow.prototype), "setOptions", this).call(this, options);
        }
    }, {
        key: "render",
        value: function render() {
            return [this.options.children, this.getStyleElement()];
        }
    }, {
        key: "getStyleElement",
        value: function getStyleElement() {
            var hiddenStyleAttributes = {
                "visibility": "hidden",
                "opacity": "0",
                "transition": "visibility 0s " + this.options.transitionTime / 1000 + "s,opacity " + this.options.transitionTime / 1000 + "s linear"
            };

            var visibleStyleAttributes = {
                "visibility": "visible",
                "opacity": "1",
                "transition": "opacity " + this.options.transitionTime / 1000 + "s linear"
            };

            return UI.createElement(
                UI.StyleElement,
                null,
                UI.createElement(UI.StyleInstance, { selector: ".hidden-animated", attributes: hiddenStyleAttributes }),
                UI.createElement(UI.StyleInstance, { selector: ".visible-animated", attributes: visibleStyleAttributes })
            );
        }
    }, {
        key: "getNodeAttributes",
        value: function getNodeAttributes() {
            var attr = get(FloatingWindow.prototype.__proto__ || Object.getPrototypeOf(FloatingWindow.prototype), "getNodeAttributes", this).call(this);
            attr.setStyle("z-index", "2016");
            return attr;
        }
    }, {
        key: "fadeOut",
        value: function fadeOut() {
            this.removeClass("visible-animated");
            this.addClass("hidden-animated");
        }
    }, {
        key: "fadeIn",
        value: function fadeIn() {
            this.removeClass("hidden-animated");
            this.addClass("visible-animated");
        }
    }, {
        key: "show",
        value: function show() {
            var _this2 = this;

            // TODO: refactor this to use this.parent and UI.Element appendChild
            if (!this.isInDocument()) {
                this.parentNode.appendChild(this.node);
                this.redraw();
                setTimeout(function () {
                    _this2.fadeIn();
                }, 0);
            }
        }
    }, {
        key: "setParentNode",
        value: function setParentNode(parentNode) {
            this.options.parentNode = parentNode;
        }
    }, {
        key: "hide",
        value: function hide() {
            var _this3 = this;

            // TODO: refactor this to use this.parent and UI.Element removeChild
            if (this.isInDocument()) {
                this.fadeOut();
                setTimeout(function () {
                    if (_this3.isInDocument()) {
                        _this3.parentNode.removeChild(_this3.node);
                    }
                }, this.options.transitionTime);
            }
        }
    }, {
        key: "parentNode",
        get: function get() {
            if (!this.options.parentNode) {
                if (this.parent) {
                    if (this.parent instanceof HTMLElement) {
                        this.options.parentNode = this.parent;
                    } else {
                        this.options.parentNode = this.parent.node;
                    }
                } else {
                    this.options.parentNode = document.body;
                }
            }
            return this.options.parentNode;
        }
    }]);
    return FloatingWindow;
}(UI.Element);

UI.VolatileFloatingWindow = function (_UI$FloatingWindow) {
    inherits(VolatileFloatingWindow, _UI$FloatingWindow);

    function VolatileFloatingWindow() {
        classCallCheck(this, VolatileFloatingWindow);
        return possibleConstructorReturn(this, (VolatileFloatingWindow.__proto__ || Object.getPrototypeOf(VolatileFloatingWindow)).apply(this, arguments));
    }

    createClass(VolatileFloatingWindow, [{
        key: "bindWindowListeners",
        value: function bindWindowListeners() {
            var _this5 = this;

            this.hideListener = this.hideListener || function () {
                _this5.hide();
            };

            window.addEventListener("click", this.hideListener);
        }
    }, {
        key: "unbindWindowListeners",
        value: function unbindWindowListeners() {
            window.removeEventListener("click", this.hideListener);
        }
    }, {
        key: "show",
        value: function show() {
            if (!this.isInDocument()) {
                this.bindWindowListeners();
                get(VolatileFloatingWindow.prototype.__proto__ || Object.getPrototypeOf(VolatileFloatingWindow.prototype), "show", this).call(this);
            }
        }
    }, {
        key: "hide",
        value: function hide() {
            if (this.isInDocument()) {
                this.unbindWindowListeners();
                get(VolatileFloatingWindow.prototype.__proto__ || Object.getPrototypeOf(VolatileFloatingWindow.prototype), "hide", this).call(this);
            }
        }
    }, {
        key: "onMount",
        value: function onMount() {
            if (!this.notVisible) {
                this.bindWindowListeners();
            }
            this.addClickListener(function (event) {
                event.stopPropagation();
            });
        }
    }]);
    return VolatileFloatingWindow;
}(UI.FloatingWindow);

UI.Modal = function (_UI$Element2) {
    inherits(Modal, _UI$Element2);

    function Modal() {
        classCallCheck(this, Modal);
        return possibleConstructorReturn(this, (Modal.__proto__ || Object.getPrototypeOf(Modal)).apply(this, arguments));
    }

    createClass(Modal, [{
        key: "setOptions",
        value: function setOptions(options) {
            options = Object.assign(this.constructor.getDefaultOptions(), options);
            get(Modal.prototype.__proto__ || Object.getPrototypeOf(Modal.prototype), "setOptions", this).call(this, options);
        }
    }, {
        key: "render",
        value: function render() {
            return [UI.createElement(
                UI.Panel,
                { ref: "modalContainer", className: "hidden", style: this.getContainerStyle() },
                this.getBehindPanel(),
                this.getModalWindow()
            )];
        }
    }, {
        key: "getContainerStyle",
        value: function getContainerStyle() {
            return {
                position: "fixed",
                top: "0px",
                left: "0px",
                right: "0px",
                bottom: "0px",
                width: "100%",
                height: "100%",
                zIndex: "9999"
            };
        }
    }, {
        key: "getBehindPanel",
        value: function getBehindPanel() {
            return UI.createElement(UI.Panel, { ref: "behindPanel", className: "hidden-animated", style: this.getBehindPanelStyle() });
        }
    }, {
        key: "getBehindPanelStyle",
        value: function getBehindPanelStyle() {
            return {
                position: "fixed",
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.5)"
            };
        }
    }, {
        key: "getModalWindow",
        value: function getModalWindow() {
            var _this7 = this;

            var closeButton = null;
            if (this.options.closeButton) {
                // TODO: this should be in a method
                closeButton = UI.createElement(
                    "div",
                    { style: { position: "absolute", right: "10px", zIndex: "10" } },
                    UI.createElement(UI.Button, { className: "close", size: UI.Size.EXTRA_LARGE,
                        label: "\xD7", onClick: function onClick() {
                            return _this7.hide();
                        } })
                );
            }

            return UI.createElement(
                UI.FloatingWindow,
                { ref: "modalWindow", style: this.getModalWindowStyle() },
                closeButton,
                UI.createElement(
                    "div",
                    { className: "modal-dialog", style: { margin: "0px", height: "100%", width: "100%" } },
                    this.getGivenChildren()
                )
            );
        }
    }, {
        key: "getModalWindowStyle",
        value: function getModalWindowStyle() {
            if (this.options.fillScreen) {
                this.options.width = "85%";
            }
            // TODO(@Rocky): I don't like this very much, honestly...
            return {
                position: "relative",
                padding: "1%",
                boxShadow: "0 5px 15px rgba(0,0,0,0.5)",
                borderRadius: "10px",
                margin: "60px auto",
                display: this.options.display || "block",
                maxHeight: this.options.maxHeight || "85%",
                left: "0",
                right: "0",
                width: this.options.width || "50%",
                height: this.options.height || "auto",
                background: "white",
                overflow: this.options.overflow || "auto"
            };
        }
    }, {
        key: "hide",
        value: function hide() {
            var _this8 = this;

            this.modalWindow.fadeOut();

            setTimeout(function () {
                _this8.behindPanel.removeClass("visible-animated");
                _this8.behindPanel.addClass("hidden-animated");

                setTimeout(function () {
                    _this8.modalContainer.addClass("hidden");
                }, _this8.modalWindow.options.transitionTime);
            }, this.modalWindow.options.transitionTime);
        }
    }, {
        key: "show",
        value: function show() {
            var _this9 = this;

            if (!this.node) {
                this.mount(document.body);
            }
            this.modalContainer.removeClass("hidden");
            setTimeout(function () {
                _this9.behindPanel.addClass("visible-animated");
                _this9.behindPanel.removeClass("hidden-animated");

                setTimeout(function () {
                    _this9.modalWindow.fadeIn();
                }, _this9.modalWindow.options.transitionTime);
            }, 0);
        }
    }, {
        key: "onMount",
        value: function onMount() {
            var _this10 = this;

            get(Modal.prototype.__proto__ || Object.getPrototypeOf(Modal.prototype), "onMount", this).call(this);
            this.behindPanel.addClickListener(function () {
                _this10.hide();
            });
        }
    }], [{
        key: "getDefaultOptions",
        value: function getDefaultOptions() {
            return {
                closeButton: true
            };
        }
    }]);
    return Modal;
}(UI.Element);

UI.ErrorModal = function (_UI$Modal) {
    inherits(ErrorModal, _UI$Modal);

    function ErrorModal() {
        classCallCheck(this, ErrorModal);
        return possibleConstructorReturn(this, (ErrorModal.__proto__ || Object.getPrototypeOf(ErrorModal)).apply(this, arguments));
    }

    createClass(ErrorModal, [{
        key: "getGivenChildren",
        value: function getGivenChildren() {
            return [this.getHeader(), this.getBody(), this.getFooter()];
        }
    }, {
        key: "getHeader",
        value: function getHeader() {
            return [UI.createElement(
                "div",
                { className: "modal-header" },
                UI.createElement(
                    "h4",
                    { className: "modal-title" },
                    "An Error occurred"
                )
            )];
        }
    }, {
        key: "getBody",
        value: function getBody() {
            return UI.createElement(
                "div",
                { className: "modal-body" },
                this.options.error.message || this.options.error
            );
        }
    }, {
        key: "getFooter",
        value: function getFooter() {
            var _this12 = this;

            return UI.createElement(
                "div",
                { className: "modal-footer" },
                UI.createElement(UI.Button, { level: UI.Level.DANGER, label: "Dismiss", onClick: function onClick() {
                        return _this12.hide();
                    } })
            );
        }
    }]);
    return ErrorModal;
}(UI.Modal);

UI.ActionModal = function (_UI$Modal2) {
    inherits(ActionModal, _UI$Modal2);

    function ActionModal() {
        classCallCheck(this, ActionModal);
        return possibleConstructorReturn(this, (ActionModal.__proto__ || Object.getPrototypeOf(ActionModal)).apply(this, arguments));
    }

    createClass(ActionModal, [{
        key: "getActionName",
        value: function getActionName() {
            return this.options.actionName;
        }
    }, {
        key: "getActionLevel",
        value: function getActionLevel() {
            return this.options.level || UI.Level.DEFAULT;
        }
    }, {
        key: "getCloseName",
        value: function getCloseName() {
            return "Close";
        }
    }, {
        key: "getGivenChildren",
        value: function getGivenChildren() {
            return [this.getHeader(), this.getBody(), this.getFooter()];
        }
    }, {
        key: "getHeader",
        value: function getHeader() {
            return [UI.createElement(
                "div",
                { className: "modal-header" },
                UI.createElement(
                    "h4",
                    { className: "modal-title" },
                    this.getTitle()
                )
            )];
        }
    }, {
        key: "getTitle",
        value: function getTitle() {
            return this.options.title || this.getActionName();
        }
    }, {
        key: "getBody",
        value: function getBody() {
            var content = this.getBodyContent();
            return content ? UI.createElement(
                "div",
                { className: "modal-body" },
                content
            ) : null;
        }
    }, {
        key: "getBodyContent",
        value: function getBodyContent() {}
    }, {
        key: "getFooter",
        value: function getFooter() {
            var content = this.getFooterContent();
            return content ? UI.createElement(
                "div",
                { className: "modal-footer" },
                content
            ) : null;
        }
    }, {
        key: "getActionButton",
        value: function getActionButton() {
            var _this14 = this;

            return UI.createElement(UI.Button, { level: this.getActionLevel(), label: this.getActionName(), onClick: function onClick() {
                    return _this14.action();
                } });
        }
    }, {
        key: "getFooterContent",
        value: function getFooterContent() {
            var _this15 = this;

            return [UI.createElement(UI.TemporaryMessageArea, { ref: "messageArea" }), UI.createElement(UI.Button, { label: this.getCloseName(), onClick: function onClick() {
                    return _this15.hide();
                } }), this.getActionButton()];
        }
    }, {
        key: "action",
        value: function action() {}
    }]);
    return ActionModal;
}(UI.Modal);

UI.ActionModalButton = function (ActionModal) {
    return function (_UI$Button) {
        inherits(ActionModalButton, _UI$Button);

        function ActionModalButton() {
            classCallCheck(this, ActionModalButton);
            return possibleConstructorReturn(this, (ActionModalButton.__proto__ || Object.getPrototypeOf(ActionModalButton)).apply(this, arguments));
        }

        createClass(ActionModalButton, [{
            key: "getModalOptions",
            value: function getModalOptions() {
                var modalOptions = {
                    actionName: this.options.label,
                    level: this.options.level
                };

                Object.assign(modalOptions, this.options.modalOptions);
                return modalOptions;
            }
        }, {
            key: "onMount",
            value: function onMount() {
                var _this17 = this;

                this.modal = UI.createElement(ActionModal, this.getModalOptions());
                this.addClickListener(function () {
                    return _this17.modal.show();
                });
            }
        }]);
        return ActionModalButton;
    }(UI.Button);
};

// This file will probably be deprecated in time by StyleSheet, but the API will be backwards compatible, so use it
// Class meant to group multiple classes inside a single <style> element, for convenience
// TODO: should probably be implemented with document.styleSheet
// TODO: pattern should be more robust, to be able to only update classes
// TODO: should probably be renamed to StyleSheet?

var StyleSet = function (_Dispatchable) {
    inherits(StyleSet, _Dispatchable);

    function StyleSet() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        classCallCheck(this, StyleSet);

        var _this = possibleConstructorReturn(this, (StyleSet.__proto__ || Object.getPrototypeOf(StyleSet)).call(this));

        options = Object.assign({
            updateOnResize: false,
            parent: document.head,
            name: options.name || _this.constructor.getElementName() }, options);
        _this.options = options;
        _this.elements = new Set();
        if (_this.options.updateOnResize) {
            _this.attachEventListener(window, "resize", function () {
                _this.update();
            });
        }
        var styleElementOptions = {
            children: [],
            name: _this.options.name
        };
        _this.styleElement = UI.StyleElement.create(options.parent, styleElementOptions);
        return _this;
    }

    createClass(StyleSet, [{
        key: "ensureFirstUpdate",
        value: function ensureFirstUpdate() {
            if (!this._firstUpdate) {
                this._firstUpdate = true;
                // Call all listeners before update for the very first time, to update any possible variables
                this.dispatch("beforeUpdate", this);
            }
        }
    }, {
        key: "css",
        value: function css(style) {
            this.ensureFirstUpdate();
            if (arguments.length > 1) {
                style = Object.assign.apply(Object, [{}].concat(Array.prototype.slice.call(arguments)));
            }
            var element = new UI.DynamicStyleElement({ style: style });
            this.elements.add(element);
            var styleInstances = element.render();
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = styleInstances[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var styleInstance = _step.value;

                    this.styleElement.appendChild(styleInstance);
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

            return element;
        }
    }, {
        key: "keyframe",
        value: function keyframe(styles) {
            this.ensureFirstUpdate();
            throw Error("Not implemented yet!");
        }
    }, {
        key: "addBeforeUpdateListener",
        value: function addBeforeUpdateListener(callback) {
            return this.addListener("beforeUpdate", callback);
        }
    }, {
        key: "update",
        value: function update() {
            this.dispatch("beforeUpdate", this);
            var children = [];
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.elements[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var value = _step2.value;

                    if (value instanceof UI.StyleElement) {
                        var styleElements = value.render();
                        children.push.apply(children, toConsumableArray(styleElements));
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

            this.styleElement.options.children = children;
            this.styleElement.redraw();
        }
    }], [{
        key: "getInstance",
        value: function getInstance() {
            return this.singletonInstance = this.singletonInstance || new this();
        }
    }, {
        key: "getElementName",
        value: function getElementName() {
            this.elementNameCounter = (this.elementNameCounter || 0) + 1;
            var name = this.constructor.name;
            if (this.elementNameCounter > 1) {
                name += "-" + this.elementNameCounter;
            }
            return name;
        }
    }]);
    return StyleSet;
}(Dispatchable);

// Helper class, meant to only keep one class active for an element from a set of classes
// TODO: move to another file


var ExclusiveClassSet = function () {
    function ExclusiveClassSet(classList, element) {
        classCallCheck(this, ExclusiveClassSet);

        // TODO: check that classList is an array (or at least iterable)
        this.classList = classList;
        this.element = element;
    }

    createClass(ExclusiveClassSet, [{
        key: "set",
        value: function set(element, classInstance) {
            if (!classInstance) {
                classInstance = element;
                element = this.element;
            }
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this.classList[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var cls = _step3.value;

                    if (cls === classInstance) {
                        element.addClass(cls);
                    } else {
                        element.removeClass(cls);
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
    }], [{
        key: "fromObject",
        value: function fromObject(obj, element) {
            var classList = [];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    classList.push(obj[key]);
                }
            }
            return Object.assign(new ExclusiveClassSet(classList, element), obj);
        }
    }]);
    return ExclusiveClassSet;
}();

function wrapCSS(context, style) {
    var result = {};
    result[context] = style;
    return result;
}

function hover(style) {
    return wrapCSS(":hover", style);
}

function active(style) {
    return wrapCSS(":active", style);
}

function focus(style) {
    return wrapCSS(":focus", style);
}

var styleMap = new WeakMap();

// TODO: deprecate this global css method?
function css(style) {
    if (arguments.length > 1) {
        style = Object.assign.apply(Object, [{}].concat(Array.prototype.slice.call(arguments)));
    }
    // If using the exact same object, return the same class
    var styleWrapper = styleMap.get(style);
    if (!styleWrapper) {
        styleWrapper = UI.DynamicStyleElement.create(document.body, { style: style });
        styleMap.set(style, styleWrapper);
    }
    return styleWrapper;
}

function evaluateStyleRuleObject(target, initializer, value, options) {
    var result = initializer ? initializer.call(target) : value;
    if (typeof result === "function") {
        result = result();
    }
    if (Array.isArray(result)) {
        result = Object.assign.apply(Object, [{}].concat(toConsumableArray(result)));
    }
    return result;
}

function getStyleRuleKey(key) {
    return "__style__" + key;
}

// TODO: this function can be made a lot more generic, to wrap plain object initializer with inheritance support
function styleRuleWithOptions() {
    var options = Object.assign.apply(Object, [{}].concat(Array.prototype.slice.call(arguments))); //Simpler notation?
    var targetMethodName = options.targetMethodName || "css";

    function styleRuleDecorator(target, key, descriptor) {
        var initializer = descriptor.initializer,
            value = descriptor.value;


        descriptor.objInitializer = function () {
            var style = evaluateStyleRuleObject(this, initializer, value, options);

            if (options.inherit) {
                // Get the value we set in the prototype of the parent class
                var parentDesc = Object.getPrototypeOf(this.__proto__)[getStyleRuleKey(key)];
                var parentStyle = evaluateStyleRuleObject(this, parentDesc.objInitializer, parentDesc.value, options);
                style = deepCopy({}, parentStyle, style);
                return style;
            }

            return style;
        };

        // Change the prototype of this object to be able to access the old descriptor/value
        target[getStyleRuleKey(key)] = Object.assign({}, descriptor);

        descriptor.initializer = function () {
            var style = descriptor.objInitializer.call(this);
            return this[targetMethodName](style);
        };

        delete descriptor.value;

        return lazyInit(target, key, descriptor);
    }

    return styleRuleDecorator;
}

var styleRule = styleRuleWithOptions();
var styleRuleInherit = styleRuleWithOptions({ inherit: true });

var _class;
var _descriptor;
var _descriptor2;
var _class3;
var _descriptor3;
var _class5;
var _descriptor4;
var _descriptor5;
var _descriptor6;
var _descriptor7;
var _descriptor8;
var _descriptor9;
var _descriptor10;
var _descriptor11;
var _descriptor12;
var _descriptor13;
var _descriptor14;
var _descriptor15;
var _descriptor16;
var _descriptor17;

function _initDefineProp$1(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
        writable: descriptor.writable,
        value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
}

function _applyDecoratedDescriptor$1(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
        desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
        desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
        return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
        desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
        desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
        Object['define' + 'Property'](target, property, desc);
        desc = null;
    }

    return desc;
}

var GlobalStyle = {};

var COLOR = {
    PLAIN: "#ffffff",
    PRIMARY: "#337ab7",
    SUCCESS: "#5cb85c",
    INFO: "#5bc0de",
    WARNING: "#f0ad4e",
    DANGER: "#d9534f",
    GOOGLE: "#de4b39",
    FACEBOOK: "#3b5998"
};

var ButtonGroupStyle = (_class = function (_StyleSet) {
    inherits(ButtonGroupStyle, _StyleSet);

    function ButtonGroupStyle() {
        var _ref;

        var _temp, _this, _ret;

        classCallCheck(this, ButtonGroupStyle);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = possibleConstructorReturn(this, (_ref = ButtonGroupStyle.__proto__ || Object.getPrototypeOf(ButtonGroupStyle)).call.apply(_ref, [this].concat(args))), _this), _initDefineProp$1(_this, "HORIZONTAL", _descriptor, _this), _initDefineProp$1(_this, "VERTICAL", _descriptor2, _this), _temp), possibleConstructorReturn(_this, _ret);
    }

    createClass(ButtonGroupStyle, [{
        key: "Orientation",
        value: function Orientation(orientation) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = Object.keys(UI.Orientation)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var type = _step.value;

                    if (orientation == UI.Orientation[type]) {
                        return this[type];
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
        }
    }]);
    return ButtonGroupStyle;
}(StyleSet), (_descriptor = _applyDecoratedDescriptor$1(_class.prototype, "HORIZONTAL", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            ">*": {
                "margin-left": "5px",
                "display": "inline-block"
            },
            ">:first-child": {
                "margin-left": "0px"
            }
        };
    }
}), _descriptor2 = _applyDecoratedDescriptor$1(_class.prototype, "VERTICAL", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            ">*": {
                "margin-bottom": "5px",
                "display": "block"
            },
            ">:first-child": {
                "margin-top": "0px"
            }
        };
    }
})), _class);


var RadioButtonGroupStyle = (_class3 = function (_StyleSet2) {
    inherits(RadioButtonGroupStyle, _StyleSet2);

    function RadioButtonGroupStyle() {
        var _ref2;

        var _temp2, _this2, _ret2;

        classCallCheck(this, RadioButtonGroupStyle);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return _ret2 = (_temp2 = (_this2 = possibleConstructorReturn(this, (_ref2 = RadioButtonGroupStyle.__proto__ || Object.getPrototypeOf(RadioButtonGroupStyle)).call.apply(_ref2, [this].concat(args))), _this2), _initDefineProp$1(_this2, "DEFAULT", _descriptor3, _this2), _temp2), possibleConstructorReturn(_this2, _ret2);
    }

    return RadioButtonGroupStyle;
}(StyleSet), (_descriptor3 = _applyDecoratedDescriptor$1(_class3.prototype, "DEFAULT", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            ">*": {
                borderRadius: "0"
            },
            ">:last-child": {
                borderTopRightRadius: "0.3em",
                borderBottomRightRadius: "0.3em"
            },
            ">:first-child": {
                borderTopLeftRadius: "0.3em",
                borderBottomLeftRadius: "0.3em"
            }
        };
    }
})), _class3);


var ButtonStyle = (_class5 = function (_StyleSet3) {
    inherits(ButtonStyle, _StyleSet3);

    function ButtonStyle() {
        var _ref3;

        var _temp3, _this3, _ret3;

        classCallCheck(this, ButtonStyle);

        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        return _ret3 = (_temp3 = (_this3 = possibleConstructorReturn(this, (_ref3 = ButtonStyle.__proto__ || Object.getPrototypeOf(ButtonStyle)).call.apply(_ref3, [this].concat(args))), _this3), _initDefineProp$1(_this3, "DEFAULT", _descriptor4, _this3), _initDefineProp$1(_this3, "EXTRA_SMALL", _descriptor5, _this3), _initDefineProp$1(_this3, "SMALL", _descriptor6, _this3), _initDefineProp$1(_this3, "MEDIUM", _descriptor7, _this3), _initDefineProp$1(_this3, "LARGE", _descriptor8, _this3), _initDefineProp$1(_this3, "EXTRA_LARGE", _descriptor9, _this3), _initDefineProp$1(_this3, "PLAIN", _descriptor10, _this3), _initDefineProp$1(_this3, "PRIMARY", _descriptor11, _this3), _initDefineProp$1(_this3, "SUCCESS", _descriptor12, _this3), _initDefineProp$1(_this3, "INFO", _descriptor13, _this3), _initDefineProp$1(_this3, "WARNING", _descriptor14, _this3), _initDefineProp$1(_this3, "DANGER", _descriptor15, _this3), _initDefineProp$1(_this3, "GOOGLE", _descriptor16, _this3), _initDefineProp$1(_this3, "FACEBOOK", _descriptor17, _this3), _temp3), possibleConstructorReturn(_this3, _ret3);
    }

    createClass(ButtonStyle, [{
        key: "computeButtonColorClass",
        value: function computeButtonColorClass(colors) {
            var darker1 = {
                backgroundColor: colors[1]
            };
            var darker2 = {
                backgroundColor: colors[2]
            };
            var darker3 = {
                backgroundColor: colors[3]
            };
            var regular = {
                backgroundColor: colors[0],
                borderColor: colors[4],
                color: colors[5]
            };
            return Object.assign({}, regular, {
                ":hover": darker1,
                ":hover:disabled": regular,
                ":focus": darker1,
                ":active": darker2,
                ":hover:active": darker3,
                ":focus:active": darker3,
                ".active": darker3
            });
        }
    }, {
        key: "Size",
        value: function Size(size) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = Object.keys(UI.Size)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var type = _step2.value;

                    if (size == UI.Size[type]) {
                        return this[type];
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
        }
    }, {
        key: "Level",
        value: function Level(level) {
            if (this[level]) {
                return this[level];
            }
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = Object.keys(UI.Level)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var type = _step3.value;

                    if (level == UI.Level[type]) {
                        return this[type];
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
    }]);
    return ButtonStyle;
}(StyleSet), (_descriptor4 = _applyDecoratedDescriptor$1(_class5.prototype, "DEFAULT", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return [{
            outline: "0",
            border: "0.1em solid transparent",
            padding: "0.4em 0.8em",
            borderRadius: "0.3em",
            textAlign: "center",
            whiteSpace: "nowrap",
            verticalAlign: "middle",
            lineHeight: 4 / 3 + "",
            marginBottom: "0",
            display: "inline-block",
            touchAction: "manipulation",
            userSelect: "none",
            ":disabled": {
                opacity: "0.7",
                cursor: "not-allowed"
            }
        }, {
            "font-size": "14px"
        }, this.computeButtonColorClass(buildColors(COLOR.PLAIN))];
    }
}), _descriptor5 = _applyDecoratedDescriptor$1(_class5.prototype, "EXTRA_SMALL", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            fontSize: "12px",
            padding: "0.2em 0.4em",
            borderWidth: "0.05em"
        };
    }
}), _descriptor6 = _applyDecoratedDescriptor$1(_class5.prototype, "SMALL", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            fontSize: "12px"
        };
    }
}), _descriptor7 = _applyDecoratedDescriptor$1(_class5.prototype, "MEDIUM", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {};
    }
}), _descriptor8 = _applyDecoratedDescriptor$1(_class5.prototype, "LARGE", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            fontSize: "17px"
        };
    }
}), _descriptor9 = _applyDecoratedDescriptor$1(_class5.prototype, "EXTRA_LARGE", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            fontSize: "21px",
            padding: "0.2em 0.4em"
        };
    }
}), _descriptor10 = _applyDecoratedDescriptor$1(_class5.prototype, "PLAIN", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {};
    }
}), _descriptor11 = _applyDecoratedDescriptor$1(_class5.prototype, "PRIMARY", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return this.computeButtonColorClass(buildColors(COLOR.PRIMARY));
    }
}), _descriptor12 = _applyDecoratedDescriptor$1(_class5.prototype, "SUCCESS", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return this.computeButtonColorClass(buildColors(COLOR.SUCCESS));
    }
}), _descriptor13 = _applyDecoratedDescriptor$1(_class5.prototype, "INFO", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return this.computeButtonColorClass(buildColors(COLOR.INFO));
    }
}), _descriptor14 = _applyDecoratedDescriptor$1(_class5.prototype, "WARNING", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return this.computeButtonColorClass(buildColors(COLOR.WARNING));
    }
}), _descriptor15 = _applyDecoratedDescriptor$1(_class5.prototype, "DANGER", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return this.computeButtonColorClass(buildColors(COLOR.DANGER));
    }
}), _descriptor16 = _applyDecoratedDescriptor$1(_class5.prototype, "GOOGLE", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return this.computeButtonColorClass(buildColors(COLOR.GOOGLE));
    }
}), _descriptor17 = _applyDecoratedDescriptor$1(_class5.prototype, "FACEBOOK", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return this.computeButtonColorClass(buildColors(COLOR.FACEBOOK));
    }
})), _class5);


GlobalStyle.Button = new ButtonStyle();
GlobalStyle.RadioButtonGroup = new RadioButtonGroupStyle();
GlobalStyle.ButtonGroup = new ButtonGroupStyle();

function BootstrapMixin(BaseClass, bootstrapClassName) {
    var BootstrapClass = function (_BaseClass) {
        inherits(BootstrapClass, _BaseClass);

        function BootstrapClass() {
            classCallCheck(this, BootstrapClass);
            return possibleConstructorReturn(this, (BootstrapClass.__proto__ || Object.getPrototypeOf(BootstrapClass)).apply(this, arguments));
        }

        createClass(BootstrapClass, [{
            key: "getNodeAttributes",
            value: function getNodeAttributes() {
                var attr = get(BootstrapClass.prototype.__proto__ || Object.getPrototypeOf(BootstrapClass.prototype), "getNodeAttributes", this).call(this);

                attr.addClass(this.constructor.bootstrapClass());
                if (this.getLevel()) {
                    attr.addClass(this.constructor.bootstrapClass() + "-" + this.getLevel());
                }
                return attr;
            }
        }, {
            key: "getLevel",
            value: function getLevel() {
                return this.options.level || "";
            }
        }, {
            key: "setLevel",
            value: function setLevel(level) {
                this.options.level = level;
                this.applyNodeAttributes();
            }
        }], [{
            key: "bootstrapClass",
            value: function bootstrapClass() {
                return bootstrapClassName;
            }
        }]);
        return BootstrapClass;
    }(BaseClass);

    return BootstrapClass;
}

var SimpleStyledElement = function (_UI$Element) {
    inherits(SimpleStyledElement, _UI$Element);

    function SimpleStyledElement() {
        classCallCheck(this, SimpleStyledElement);
        return possibleConstructorReturn(this, (SimpleStyledElement.__proto__ || Object.getPrototypeOf(SimpleStyledElement)).apply(this, arguments));
    }

    createClass(SimpleStyledElement, [{
        key: "getLevel",
        value: function getLevel() {
            return this.options.level || this.parent && this.parent.options && this.parent.options.level;
        }
    }, {
        key: "setLevel",
        value: function setLevel(level) {
            this.updateOptions({ level: level });
        }
    }, {
        key: "getSize",
        value: function getSize() {
            return this.options.size || this.parent && this.parent.options && this.parent.options.size;
        }
    }, {
        key: "setSize",
        value: function setSize(size) {
            this.updateOptions({ size: size });
        }
    }]);
    return SimpleStyledElement;
}(UI.Element);



UI.Button = function (_SimpleStyledElement) {
    inherits(Button, _SimpleStyledElement);

    function Button() {
        classCallCheck(this, Button);
        return possibleConstructorReturn(this, (Button.__proto__ || Object.getPrototypeOf(Button)).apply(this, arguments));
    }

    createClass(Button, [{
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            attr.addClass(GlobalStyle.Button.DEFAULT);

            if (this.getSize()) {
                attr.addClass(GlobalStyle.Button.Size(this.getSize()));
            }

            if (this.getLevel()) {
                attr.addClass(GlobalStyle.Button.Level(this.getLevel()));
            }
        }
    }, {
        key: "setOptions",
        value: function setOptions(options) {
            get(Button.prototype.__proto__ || Object.getPrototypeOf(Button.prototype), "setOptions", this).call(this, options);
            this.options.label = options.label || "";
        }
    }, {
        key: "getNodeType",
        value: function getNodeType() {
            return "button";
        }
    }, {
        key: "render",
        value: function render() {
            return [this.beforeChildren(), this.options.label, this.options.children];
        }
    }, {
        key: "getLabel",
        value: function getLabel() {
            return this.options.label;
        }
    }, {
        key: "setLabel",
        value: function setLabel(label) {
            this.options.label = label;
            this.redraw();
        }

        //TODO: this should live in a base iconable class, of which you'd only use this.beforeChildren

    }, {
        key: "getFaIcon",
        value: function getFaIcon() {
            return this.options.faIcon;
        }
    }, {
        key: "setFaIcon",
        value: function setFaIcon(value) {
            this.options.faIcon = value;
            this.redraw();
        }
    }, {
        key: "disable",
        value: function disable() {
            this.node.disabled = true;
        }
    }, {
        key: "enable",
        value: function enable() {
            this.node.disabled = false;
        }
    }, {
        key: "setEnabled",
        value: function setEnabled(enabled) {
            this.node.disabled = !enabled;
        }
    }, {
        key: "beforeChildren",
        value: function beforeChildren() {
            if (!this.options.faIcon) {
                return null;
            }
            var iconOptions = {
                className: "fa fa-" + this.options.faIcon
            };
            if (this.options.label) {
                iconOptions.style = {
                    paddingRight: "5px"
                };
            }

            return UI.createElement("span", iconOptions);
        }
    }]);
    return Button;
}(SimpleStyledElement);

UI.StateButton = function (_UI$Button) {
    inherits(StateButton, _UI$Button);

    function StateButton() {
        classCallCheck(this, StateButton);
        return possibleConstructorReturn(this, (StateButton.__proto__ || Object.getPrototypeOf(StateButton)).apply(this, arguments));
    }

    createClass(StateButton, [{
        key: "setOptions",
        value: function setOptions(options) {
            options.state = this.options && this.options.state || options.state || UI.ActionStatus.DEFAULT;

            get(StateButton.prototype.__proto__ || Object.getPrototypeOf(StateButton.prototype), "setOptions", this).call(this, options);

            this.options.statusOptions = this.options.statusOptions || [];
            for (var i = 0; i < 4; i += 1) {
                if (typeof this.options.statusOptions[i] === "string") {
                    var statusLabel = this.options.statusOptions[i];
                    this.options.statusOptions[i] = {
                        label: statusLabel,
                        faIcon: ""
                    };
                }
            }
        }
    }, {
        key: "setState",
        value: function setState(status) {
            this.options.state = status;
            if (status === UI.ActionStatus.DEFAULT) {
                this.enable();
            } else if (status === UI.ActionStatus.RUNNING) {
                this.disable();
            } else if (status === UI.ActionStatus.SUCCESS) {} else if (status === UI.ActionStatus.FAILED) {}

            this.redraw();
        }
    }, {
        key: "render",
        value: function render() {
            var stateOptions = this.options.statusOptions[this.options.state - 1];

            this.options.label = stateOptions.label;
            this.options.faIcon = stateOptions.faIcon;

            return get(StateButton.prototype.__proto__ || Object.getPrototypeOf(StateButton.prototype), "render", this).call(this);
        }
    }]);
    return StateButton;
}(UI.Button);

UI.AjaxButton = function (_UI$StateButton) {
    inherits(AjaxButton, _UI$StateButton);

    function AjaxButton() {
        classCallCheck(this, AjaxButton);
        return possibleConstructorReturn(this, (AjaxButton.__proto__ || Object.getPrototypeOf(AjaxButton)).apply(this, arguments));
    }

    createClass(AjaxButton, [{
        key: "ajaxCall",
        value: function ajaxCall(data) {
            var _this6 = this;

            this.setState(UI.ActionStatus.RUNNING);
            $.ajax({
                url: data.url,
                type: data.type,
                dataType: data.dataType,
                data: data.data,
                success: function success(successData) {
                    data.success(successData);
                    if (successData.error) {
                        _this6.setState(UI.ActionStatus.FAILED);
                    } else {
                        _this6.setState(UI.ActionStatus.SUCCESS);
                    }
                },
                error: function error(xhr, errmsg, err) {
                    data.error(xhr, errmsg, err);
                    _this6.setState(UI.ActionStatus.FAILED);
                },
                complete: function complete() {
                    setTimeout(function () {
                        _this6.setState(UI.ActionStatus.DEFAULT);
                    }, _this6.options.onCompete || 1000);
                }
            });
        }
    }]);
    return AjaxButton;
}(UI.StateButton);

UI.ButtonGroup = function (_SimpleStyledElement2) {
    inherits(ButtonGroup, _SimpleStyledElement2);

    function ButtonGroup() {
        classCallCheck(this, ButtonGroup);
        return possibleConstructorReturn(this, (ButtonGroup.__proto__ || Object.getPrototypeOf(ButtonGroup)).apply(this, arguments));
    }

    createClass(ButtonGroup, [{
        key: "getDefaultOptions",
        value: function getDefaultOptions() {
            return {
                orientation: UI.Orientation.HORIZONTAL
            };
        }
    }, {
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            attr.addClass(GlobalStyle.ButtonGroup.Orientation(this.options.orientation));
        }
    }]);
    return ButtonGroup;
}(SimpleStyledElement);

UI.RadioButtonGroup = function (_SimpleStyledElement3) {
    inherits(RadioButtonGroup, _SimpleStyledElement3);

    function RadioButtonGroup() {
        classCallCheck(this, RadioButtonGroup);
        return possibleConstructorReturn(this, (RadioButtonGroup.__proto__ || Object.getPrototypeOf(RadioButtonGroup)).apply(this, arguments));
    }

    createClass(RadioButtonGroup, [{
        key: "setOptions",
        value: function setOptions(options) {
            get(RadioButtonGroup.prototype.__proto__ || Object.getPrototypeOf(RadioButtonGroup.prototype), "setOptions", this).call(this, options);
            this.index = this.options.index || 0;
        }
    }, {
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            attr.addClass(GlobalStyle.RadioButtonGroup.DEFAULT);
        }
    }, {
        key: "render",
        value: function render() {
            var _this9 = this;

            this.buttons = [];

            var _loop = function _loop(i) {
                _this9.buttons.push(UI.createElement(UI.Button, { key: i, onClick: function onClick() {
                        _this9.setIndex(i);
                    }, size: _this9.getSize(),
                    label: _this9.options.givenOptions[i].toString(), level: _this9.getLevel(),
                    className: _this9.index === i ? "active" : "" }));
            };

            for (var i = 0; i < this.options.givenOptions.length; i += 1) {
                _loop(i);
            }
            return this.buttons;
        }
    }, {
        key: "getIndex",
        value: function getIndex() {
            return this.index;
        }
    }, {
        key: "getValue",
        value: function getValue() {
            return this.options.givenOptions[this.index];
        }
    }, {
        key: "setIndex",
        value: function setIndex(index) {
            this.dispatch("setIndex", {
                index: index,
                oldIndex: this.index,
                value: this.options.givenOptions[index],
                oldValue: this.options.givenOptions[this.index]
            });
            this.buttons[this.index].removeClass("active");
            this.index = index;
            this.buttons[this.index].addClass("active");
        }
    }]);
    return RadioButtonGroup;
}(SimpleStyledElement);

UI.BootstrapLabel = function (_BootstrapMixin) {
    inherits(BootstrapLabel, _BootstrapMixin);

    function BootstrapLabel() {
        classCallCheck(this, BootstrapLabel);
        return possibleConstructorReturn(this, (BootstrapLabel.__proto__ || Object.getPrototypeOf(BootstrapLabel)).apply(this, arguments));
    }

    createClass(BootstrapLabel, [{
        key: "getNodeType",
        value: function getNodeType() {
            return "span";
        }
    }, {
        key: "getNodeAttributes",
        value: function getNodeAttributes() {
            var attr = get(BootstrapLabel.prototype.__proto__ || Object.getPrototypeOf(BootstrapLabel.prototype), "getNodeAttributes", this).call(this);
            if (this.options.faIcon) {
                attr.addClass("fa fa-" + this.options.faIcon);
            }
            return attr;
        }
    }, {
        key: "setLabel",
        value: function setLabel(label) {
            this.options.label = label;
            this.redraw();
        }
    }, {
        key: "render",
        value: function render() {
            return [this.options.label];
        }
    }]);
    return BootstrapLabel;
}(BootstrapMixin(UI.Element, "label"));

UI.CardPanel = function (_BootstrapMixin2) {
    inherits(CardPanel, _BootstrapMixin2);

    function CardPanel() {
        classCallCheck(this, CardPanel);
        return possibleConstructorReturn(this, (CardPanel.__proto__ || Object.getPrototypeOf(CardPanel)).apply(this, arguments));
    }

    createClass(CardPanel, [{
        key: "setOptions",
        value: function setOptions(options) {
            get(CardPanel.prototype.__proto__ || Object.getPrototypeOf(CardPanel.prototype), "setOptions", this).call(this, options);
            this.options.level = this.options.level || UI.Level.DEFAULT;
        }
    }, {
        key: "render",
        value: function render() {
            return [UI.createElement(
                "div",
                { className: "panel-heading" },
                this.getTitle()
            ), UI.createElement(
                "div",
                { className: "panel-body", style: this.options.bodyStyle },
                this.getGivenChildren()
            )];
        }
    }]);
    return CardPanel;
}(BootstrapMixin(UI.Panel, "panel"));

var CollapsibleStyle = function (_StyleSet) {
    inherits(CollapsibleStyle, _StyleSet);

    function CollapsibleStyle() {
        classCallCheck(this, CollapsibleStyle);

        var _this12 = possibleConstructorReturn(this, (CollapsibleStyle.__proto__ || Object.getPrototypeOf(CollapsibleStyle)).call(this));

        _this12.collapsed = _this12.css({
            "display": "none"
        });

        _this12.collapsing = _this12.css({
            "height": "0",
            "transition-timing-function": "ease",
            "transition-duration": ".3s",
            "transition-property": "height, padding-top, padding-bottom",
            "position": "relative",
            "overflow": "hidden",
            "display": "block"
        });

        _this12.noPadding = _this12.css({
            "padding-top": "0 !important",
            "padding-bottom": "0 !important"
        });
        return _this12;
    }

    return CollapsibleStyle;
}(StyleSet);

var CollapsiblePanelStyle = function (_StyleSet2) {
    inherits(CollapsiblePanelStyle, _StyleSet2);

    function CollapsiblePanelStyle() {
        classCallCheck(this, CollapsiblePanelStyle);

        var _this13 = possibleConstructorReturn(this, (CollapsiblePanelStyle.__proto__ || Object.getPrototypeOf(CollapsiblePanelStyle)).call(this));

        _this13.heading = _this13.css({
            "padding": "10px 15px",
            "border-bottom": "1px solid transparent",
            "border-top-left-radius": "3px",
            "border-top-right-radius": "3px",
            "background-color": "#f5f5f5"
        });

        _this13.button = _this13.css({
            "margin-top": "0",
            "margin-bottom": "0",
            "font-size": "16px",
            "color": "inherit",
            "cursor": "pointer",
            ":hover": {
                "color": "inherit"
            },
            ":before": {
                "font-family": "'Glyphicons Halflings'",
                "content": "\"\\e114\"",
                "color": "grey",
                "float": "left"
            }
        });

        _this13.collapsedButton = _this13.css({
            ":before": {
                "content": "\"\\e080\""
            }
        });

        _this13.content = _this13.css({
            "padding": "5px"
        });
        return _this13;
    }

    return CollapsiblePanelStyle;
}(StyleSet);

var collapsibleStyle = new CollapsibleStyle();
var collapsiblePanelStyle = new CollapsiblePanelStyle();

UI.CollapsiblePanel = function (_UI$CardPanel) {
    inherits(CollapsiblePanel, _UI$CardPanel);

    function CollapsiblePanel(options) {
        classCallCheck(this, CollapsiblePanel);

        // If options.collapsed is set, use that value. otherwise it is collapsed
        var _this14 = possibleConstructorReturn(this, (CollapsiblePanel.__proto__ || Object.getPrototypeOf(CollapsiblePanel)).call(this, options));

        options.collapsed = options.collapsed || true;
        return _this14;
    }

    createClass(CollapsiblePanel, [{
        key: "onMount",
        value: function onMount() {
            var _this15 = this;

            this.expandLink.addClickListener(function () {
                _this15.togglePanel();
            });
        }
    }, {
        key: "togglePanel",
        value: function togglePanel() {
            if (!this.collapsing) {
                if (this.options.collapsed) {
                    this.expand();
                } else {
                    this.collapse();
                }
            }
        }
    }, {
        key: "expand",
        value: function expand() {
            var _this16 = this;

            this.options.collapsed = false;
            this.expandLink.removeClass(collapsiblePanelStyle.collapsedButton);
            this.contentArea.removeClass(collapsibleStyle.collapsed);
            var contentStyleHeight = this.contentArea.node.style.height;
            var contentHeight = this.contentArea.getHeight();
            this.contentArea.addClass(collapsibleStyle.collapsing);
            setTimeout(function () {
                _this16.contentArea.removeClass(collapsibleStyle.noPadding);
                _this16.contentArea.setHeight(contentHeight);
                var transitionEndFunction = function transitionEndFunction() {
                    _this16.contentArea.setHeight(contentStyleHeight);
                    _this16.contentArea.removeClass(collapsibleStyle.collapsing);
                    _this16.contentArea.removeNodeListener("transitionend", transitionEndFunction);
                    _this16.collapsing = false;
                };
                _this16.contentArea.addNodeListener("transitionend", transitionEndFunction);
                _this16.collapsing = true;
            });
        }
    }, {
        key: "collapse",
        value: function collapse() {
            var _this17 = this;

            this.options.collapsed = true;
            var contentStyleHeight = this.contentArea.node.style.height;
            this.contentArea.setHeight(this.contentArea.getHeight());
            this.contentArea.addClass(collapsibleStyle.collapsing);
            setTimeout(function () {
                _this17.contentArea.addClass(collapsibleStyle.noPadding);
                _this17.contentArea.setHeight(0);
                var transitionEndFunction = function transitionEndFunction() {
                    _this17.expandLink.addClass(collapsiblePanelStyle.collapsedButton);
                    _this17.contentArea.addClass(collapsibleStyle.collapsed);
                    _this17.contentArea.removeClass(collapsibleStyle.collapsing);
                    _this17.contentArea.setHeight(contentStyleHeight);
                    _this17.contentArea.removeNodeListener("transitionend", transitionEndFunction);
                    _this17.collapsing = false;
                };
                _this17.contentArea.addNodeListener("transitionend", transitionEndFunction);
                _this17.collapsing = true;
            });
        }
    }, {
        key: "render",
        value: function render() {
            var autoHeightClass = "";
            var collapsedPanelClass = "";
            var collapsedHeadingClass = "";
            var expandLinkClass = "";

            if (this.options.autoHeight) {
                autoHeightClass = "auto-height ";
            }
            if (this.options.collapsed) {
                collapsedHeadingClass = collapsiblePanelStyle.collapsedButton;
                collapsedPanelClass = collapsibleStyle.collapsed;
            }

            return [UI.createElement(
                "div",
                { className: collapsiblePanelStyle.heading },
                UI.createElement(
                    "a",
                    { ref: "expandLink", className: collapsiblePanelStyle.button + " " + collapsedHeadingClass },
                    this.getTitle()
                )
            ), UI.createElement(
                "div",
                { ref: "contentArea", className: collapsiblePanelStyle.content + " " + autoHeightClass + " " + collapsedPanelClass },
                this.getGivenChildren()
            )];
        }
    }]);
    return CollapsiblePanel;
}(UI.CardPanel);

UI.DelayedCollapsiblePanel = function (_UI$CollapsiblePanel) {
    inherits(DelayedCollapsiblePanel, _UI$CollapsiblePanel);

    function DelayedCollapsiblePanel() {
        classCallCheck(this, DelayedCollapsiblePanel);
        return possibleConstructorReturn(this, (DelayedCollapsiblePanel.__proto__ || Object.getPrototypeOf(DelayedCollapsiblePanel)).apply(this, arguments));
    }

    createClass(DelayedCollapsiblePanel, [{
        key: "onMount",
        value: function onMount() {
            var _this19 = this;

            this.expandLink.addClickListener(function () {
                if (!_this19._haveExpanded) {
                    _this19._haveExpanded = true;
                    UI.renderingStack.push(_this19);
                    _this19.contentArea.options.children = _this19.getGivenChildren();
                    UI.renderingStack.pop();
                    _this19.contentArea.redraw();
                    _this19.delayedMount();
                }
                _this19.togglePanel();
            });
        }
    }, {
        key: "getGivenChildren",
        value: function getGivenChildren() {
            if (!this._haveExpanded) {
                return [];
            }
            return this.getDelayedChildren();
        }
    }]);
    return DelayedCollapsiblePanel;
}(UI.CollapsiblePanel);

UI.ProgressBar = function (_BootstrapMixin3) {
    inherits(ProgressBar, _BootstrapMixin3);

    function ProgressBar() {
        classCallCheck(this, ProgressBar);
        return possibleConstructorReturn(this, (ProgressBar.__proto__ || Object.getPrototypeOf(ProgressBar)).apply(this, arguments));
    }

    createClass(ProgressBar, [{
        key: "render",
        value: function render() {
            var valueInPercent = (this.options.value || 0) * 100;

            var barOptions = {
                className: "progress-bar",
                role: "progressbar",
                "aria-valuenow": valueInPercent,
                "aria-valuemin": 0,
                "aria-valuemax": 100,
                style: {
                    addingBottom: 5,
                    width: valueInPercent + "%",
                    height: this.options.height + "px"
                }
            };

            if (this.options.disableTransition) {
                Object.assign(barOptions.style, {
                    transition: "none",
                    "-webkit-transition": "none"
                });
            }

            if (this.options.level) {
                barOptions.className += " progress-bar-" + this.options.level;
            }
            if (this.options.striped) {
                barOptions.className += " progress-bar-striped";
            }
            if (this.options.active) {
                barOptions.className += " active";
            }
            if (this.options.color) {
                barOptions.style.backgroundColor = this.options.color;
            }

            return UI.createElement(
                "div",
                barOptions,
                UI.createElement(
                    "span",
                    { className: "progress-span" },
                    this.options.label
                )
            );
        }
    }, {
        key: "set",
        value: function set(value) {
            if (value < 0) value = 0;else if (value > 1) value = 1;
            this.options.value = value;
            this.redraw();
        }
    }]);
    return ProgressBar;
}(BootstrapMixin(UI.Element, "progress"));

UI.BootstrapMixin = BootstrapMixin;

// Wrapper over the ace code editor, needs ace to be globally loaded
// TODO: should not be in the UI namespace
// TODO: should be renamed to AceCodeEditor?
UI.CodeEditor = function (_UI$Element) {
    inherits(CodeEditor, _UI$Element);

    function CodeEditor() {
        classCallCheck(this, CodeEditor);
        return possibleConstructorReturn(this, (CodeEditor.__proto__ || Object.getPrototypeOf(CodeEditor)).apply(this, arguments));
    }

    createClass(CodeEditor, [{
        key: "setOptions",
        value: function setOptions(options) {
            var defaultOptions = {
                aceMode: "text",
                readOnly: false,
                aceTheme: "dawn",
                fontSize: 14,
                tabSize: 4,
                showLineNumber: true,
                showPrintMargin: false,
                printMarginSize: 80
            };
            options = Object.assign(defaultOptions, options);

            get(CodeEditor.prototype.__proto__ || Object.getPrototypeOf(CodeEditor.prototype), "setOptions", this).call(this, options);

            if (this.options.aceMode) {
                this.options.aceMode = this.options.aceMode.toLowerCase();
            }

            if (this.options.aceMode === "cpp" || this.options.aceMode === "c") {
                this.options.aceMode = "c_cpp";
            }

            if (this.ace) {
                this.applyAceOptions();
            }
        }
    }, {
        key: "applyAceOptions",
        value: function applyAceOptions() {
            var _this2 = this;

            //set the language mode
            this.ace.getSession().setMode("ace/mode/" + this.options.aceMode);

            this.setAceTheme(this.options.aceTheme);
            this.setAceFontSize(this.options.fontSize);
            this.setAceTabSize(this.options.tabSize);
            this.setAceLineNumberVisible(this.options.showLineNumber);
            this.setAcePrintMarginVisible(this.options.showPrintMargin);
            this.setAcePrintMarginSize(this.options.printMarginSize);
            this.setReadOnly(this.options.readOnly);

            //this.ace.setOptions({
            //    useSoftTabs: false
            //});

            if (this.options.numLines) {
                this.options.maxLines = this.options.minLines = this.options.numLines;
            }

            if (this.options.maxLines) {
                this.ace.setOptions({
                    maxLines: this.options.maxLines
                });
            }

            if (this.options.minLines) {
                this.ace.setOptions({
                    minLines: this.options.minLines
                });
            }

            this.ace.getSession().setUseWrapMode(this.options.lineWrapping || false);

            if (this.options.value) {
                this.setValue(this.options.value, -1);
            }
            if (this.options.hasOwnProperty("enableBasicAutocompletion") || this.options.hasOwnProperty("enableLiveAutocompletion")) {
                var langTools = "/static/js/ext/ace/ext-language_tools.js";
                require([langTools], function () {
                    _this2.setBasicAutocompletion(_this2.options.enableBasicAutocompletion);
                    _this2.setLiveAutocompletion(_this2.options.enableLiveAutocompletion);
                    _this2.setSnippets(_this2.options.enableSnippets);
                });
            }
        }
    }, {
        key: "redraw",
        value: function redraw() {
            if (this.ace) {
                this.ace.resize();
                this.applyRef();
                return;
            }
            get(CodeEditor.prototype.__proto__ || Object.getPrototypeOf(CodeEditor.prototype), "redraw", this).call(this);
        }
    }, {
        key: "onMount",
        value: function onMount() {
            var _this3 = this;

            if (!window.ace) {
                this.constructor.requireAce(function () {
                    _this3.onMount();
                });
                return;
            }
            this.ace = ace.edit(this.node);

            // Removes some warnings
            this.ace.$blockScrolling = Infinity;
            this.applyAceOptions();

            //#voodoo was here to automatically redraw when unhiding
            //This Ace event listener might be useful in the future
            this.ace.renderer.$textLayer.addEventListener("changeCharacterSize", function (event) {
                _this3.ace.resize();
            });

            // Sometimes when the parent div resizes the ace editor doesn't fully update.
            this.addListener("resize", function () {
                _this3.ace.resize();
            });

            this.addListener("change", function () {
                _this3.ace.resize();
            });
        }
    }, {
        key: "setValue",
        value: function setValue(sourceCode, fakeUserChange) {
            // We need to wrap the ace call in these flags so any event listeners can know if this change
            // was done by us or by the user
            this.apiChange = !fakeUserChange;
            this.ace.setValue(sourceCode, -1);
            this.apiChange = false;
        }
    }, {
        key: "getValue",
        value: function getValue() {
            return this.ace.getValue();
        }
    }, {
        key: "getAce",
        value: function getAce() {
            return this.ace;
        }

        // TODO: should this be setEditable?

    }, {
        key: "setReadOnly",
        value: function setReadOnly(value) {
            this.ace.setReadOnly(value);
        }
    }, {
        key: "setAceMode",
        value: function setAceMode(aceMode) {
            if (aceMode.hasOwnProperty("aceMode")) {
                aceMode = aceMode.aceMode;
            }
            this.ace.getSession().setMode("ace/mode/" + aceMode);
        }
    }, {
        key: "getAceMode",
        value: function getAceMode() {
            return this.ace.getSession().getMode();
        }
    }, {
        key: "setAceTheme",
        value: function setAceTheme(theme) {
            if (theme.hasOwnProperty("aceName")) {
                theme = theme.aceName;
            }
            this.ace.setTheme("ace/theme/" + theme);
        }
    }, {
        key: "getAceTheme",
        value: function getAceTheme() {
            return this.ace.getTheme();
        }
    }, {
        key: "setAceFontSize",
        value: function setAceFontSize(fontSize) {
            this.ace.setOptions({
                fontSize: fontSize + "px"
            });
        }
    }, {
        key: "getAceFontSize",
        value: function getAceFontSize() {
            return this.ace.getFontSize();
        }
    }, {
        key: "setAceTabSize",
        value: function setAceTabSize(tabSize) {
            this.ace.setOptions({
                tabSize: tabSize
            });
        }
    }, {
        key: "getAceTabSize",
        value: function getAceTabSize() {
            return this.ace.getOption("tabSize");
        }
    }, {
        key: "setAceLineNumberVisible",
        value: function setAceLineNumberVisible(value) {
            this.ace.renderer.setShowGutter(value);
        }
    }, {
        key: "getAceLineNumberVisible",
        value: function getAceLineNumberVisible() {
            return this.ace.renderer.getShowGutter();
        }
    }, {
        key: "setAcePrintMarginVisible",
        value: function setAcePrintMarginVisible(value) {
            this.ace.setShowPrintMargin(value);
        }
    }, {
        key: "getAcePrintMarginVisible",
        value: function getAcePrintMarginVisible() {
            return this.ace.getShowPrintMargin();
        }
    }, {
        key: "setAcePrintMarginSize",
        value: function setAcePrintMarginSize(printMarginSize) {
            this.ace.setPrintMarginColumn(printMarginSize);
        }
    }, {
        key: "getAcePrintMarginSize",
        value: function getAcePrintMarginSize() {
            return this.ace.getPrintMarginColumn();
        }
    }, {
        key: "setBasicAutocompletion",
        value: function setBasicAutocompletion(value) {
            this.ace.setOptions({
                enableBasicAutocompletion: value
            });
        }
    }, {
        key: "setLiveAutocompletion",
        value: function setLiveAutocompletion(value) {
            this.ace.setOptions({
                enableLiveAutocompletion: value
            });
        }
    }, {
        key: "setSnippets",
        value: function setSnippets(value) {
            this.ace.setOptions({
                enableSnippets: value
            });
        }

        // Inserts the text at the current cursor position

    }, {
        key: "insert",
        value: function insert(text) {
            this.ace.insert(text);
        }
    }, {
        key: "append",


        // Appends the text at the end of the document
        value: function append(text) {
            var lastRow = this.ace.getSession().getLength() - 1;
            if (lastRow < 0) {
                lastRow = 0;
            }
            var lastRowLength = this.ace.getSession().getLine(lastRow).length;
            var scrolledToBottom = this.ace.isRowFullyVisible(lastRow);
            // console.log("Scroll to bottom ", scrolledToBottom);
            this.ace.getSession().insert({
                row: lastRow,
                column: lastRowLength
            }, text);

            this.ace.resize();

            if (scrolledToBottom) {
                // TODO: Include scroll lock option!
                // TODO: See if scrolling to bottom can be done better
                // !!!!!TODO: for some reason the scroll bar height is not being updated, this needs to be fixed!!!!
                this.ace.scrollToLine(this.ace.getSession().getLength() - 1, true, true, function () {});
            }
        }
    }], [{
        key: "requireAce",
        value: function requireAce(callback) {
            throw Error("You need to implement requireAce");
        }
    }]);
    return CodeEditor;
}(UI.Element);

UI.StaticCodeHighlighter = function (_UI$CodeEditor) {
    inherits(StaticCodeHighlighter, _UI$CodeEditor);

    function StaticCodeHighlighter() {
        classCallCheck(this, StaticCodeHighlighter);
        return possibleConstructorReturn(this, (StaticCodeHighlighter.__proto__ || Object.getPrototypeOf(StaticCodeHighlighter)).apply(this, arguments));
    }

    createClass(StaticCodeHighlighter, [{
        key: "setOptions",
        value: function setOptions(options) {
            options = Object.assign({
                fontSize: 13,
                readOnly: true,
                lineWrapping: true
            }, options);
            get(StaticCodeHighlighter.prototype.__proto__ || Object.getPrototypeOf(StaticCodeHighlighter.prototype), "setOptions", this).call(this, options);
        }
    }]);
    return StaticCodeHighlighter;
}(UI.CodeEditor);

// Generic UI widget classes

var StyleRuleInstance = function () {
    function StyleRuleInstance(styleSheet, index, selector, style) {
        classCallCheck(this, StyleRuleInstance);

        // super();
        if (index == -1) {
            index = styleSheet.cssRules.length;
        }
        this.selector = selector;
        this.styleSheet = styleSheet;
        this.style = style;
        var ruleText = this.getCSSText();
        var insertedIndex = styleSheet.insertRule(ruleText, index);
        this.cssRule = styleSheet.cssRules[insertedIndex];
    }

    createClass(StyleRuleInstance, [{
        key: "getCSSText",
        value: function getCSSText() {
            var style = this.style;
            var text = this.selector + "{";
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = Object.keys(style)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var key = _step.value;

                    var value = style[key];
                    if (typeof value === "function") {
                        value = value();
                    }
                    // Ignore keys with null or undefined value
                    if (value == null) {
                        continue;
                    }
                    // TODO: if key starts with vendor-, replace it with the browser specific one (and the plain one)
                    // TODO: on some attributes, do we want to automatically add a px suffix?
                    text += dashCase(key) + ":" + value + ";";
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

            return text + "}";
        }
    }, {
        key: "setAttribute",
        value: function setAttribute(key, value) {
            this.style[key] = value;
            this.update();
        }
    }, {
        key: "apply",
        value: function apply(style) {
            this.style = style;
            this.cssRule.cssText = this.getCSSText();
        }
    }, {
        key: "update",
        value: function update() {
            this.apply(this.style);
        }
    }]);
    return StyleRuleInstance;
}();

var ALLOWED_SELECTOR_STARTS$1 = new Set([":", ">", " ", "+", "~", "[", "."]);

var StyleRuleGroup = function () {
    function StyleRuleGroup(styleSheet, style) {
        classCallCheck(this, StyleRuleGroup);

        // super();
        this.styleSheet = styleSheet; // this is the native CSSStyleSheet
        this.className = this.constructor.getClassName();
        this.selectorMap = new Map();
        this.apply(style);
    }

    createClass(StyleRuleGroup, [{
        key: "toString",
        value: function toString() {
            return this.className;
        }
    }, {
        key: "getSelector",
        value: function getSelector() {
            return "." + this.toString();
        }
    }, {
        key: "getStyleObject",
        value: function getStyleObject() {
            return this.style;
        }
    }, {
        key: "addRuleInstance",
        value: function addRuleInstance(selector) {
            var style = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            selector = String(selector);
            var existingRuleInstance = this.selectorMap.get(selector);
            if (existingRuleInstance) {
                existingRuleInstance.apply(style);
                return existingRuleInstance;
            }
            var ruleInstance = new StyleRuleInstance(this.styleSheet, -1, selector, style);
            this.selectorMap.set(selector, ruleInstance);
            return ruleInstance;
        }

        // A cyclic dependency in the style object will cause an infinite loop here

    }, {
        key: "apply",
        value: function apply(style) {
            this.style = style;
            var desiredStyleInstances = this.constructor.getStyleInstances(this.getSelector(), style);
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = desiredStyleInstances[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var styleInstance = _step2.value;

                    this.addRuleInstance(styleInstance.selector, styleInstance.style);
                }
                // TODO: remove rules for selector that aren't present anymore
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
        key: "update",
        value: function update() {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this.selectorMap.values()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var ruleInstance = _step3.value;

                    ruleInstance.update();
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
    }], [{
        key: "getClassName",
        value: function getClassName() {
            this.instanceCounter = (this.instanceCounter || 0) + 1;
            return "acls-" + this.instanceCounter;
        }
    }, {
        key: "getStyleInstances",
        value: function getStyleInstances(selector, style) {
            var result = [];
            var ownStyle = {},
                haveOwnStyle = false;

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = Object.keys(style)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var key = _step4.value;

                    var value = style[key];
                    var isProperValue = typeof value === "string" || value instanceof String || typeof value === "number" || value instanceof Number || typeof value === "function";
                    if (isProperValue) {
                        ownStyle[key] = value;
                        haveOwnStyle = true;
                    } else {
                        // Check that this actually is a valid subselector
                        var firstChar = String(key).charAt(0);
                        if (!ALLOWED_SELECTOR_STARTS$1.has(firstChar)) {
                            // TODO: Log here?
                            console.error("Unprocessable style key ", key);
                            continue;
                        }
                        var subStyle = this.getStyleInstances(selector + key, value);
                        result.push.apply(result, toConsumableArray(subStyle));
                    }
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

            if (haveOwnStyle) {
                result.unshift({ selector: selector, style: ownStyle });
            }
            return result;
        }
    }]);
    return StyleRuleGroup;
}();

var StyleSheet = function (_Dispatchable) {
    inherits(StyleSheet, _Dispatchable);

    function StyleSheet() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        classCallCheck(this, StyleSheet);

        var _this = possibleConstructorReturn(this, (StyleSheet.__proto__ || Object.getPrototypeOf(StyleSheet)).call(this));

        options = Object.assign({
            updateOnResize: false,
            parent: document.head,
            name: options.name || _this.constructor.getElementName() }, options);

        _this.options = options;
        _this.elements = new Set();
        if (_this.options.updateOnResize) {
            // TODO: add cleanup job here
            window.addEventListener("resize", function () {
                _this.update();
            });
        }
        if (options.styleElement) {
            _this.styleElement = options.styleElement;
        } else {
            _this.styleElement = document.createElement("style");
            // Webkit hack, as seen on the internets
            _this.styleElement.appendChild(document.createTextNode(""));
            // Insert the style element
            options.parent.appendChild(_this.styleElement);
        }
        return _this;
    }

    createClass(StyleSheet, [{
        key: "getNativeStyleSheet",
        value: function getNativeStyleSheet() {
            return this.styleElement.sheet;
        }
    }, {
        key: "ensureFirstUpdate",
        value: function ensureFirstUpdate() {
            if (!this._firstUpdate) {
                this._firstUpdate = true;
                // Call all listeners before update for the very first time, to update any possible variables
                this.dispatch("beforeUpdate", this);
            }
        }
    }, {
        key: "css",
        value: function css() {
            return this.styleRule.apply(this, arguments);
        }
    }, {
        key: "setDisabled",
        value: function setDisabled(disabled) {
            this.getNativeStyleSheet().disabled = disabled;
        }
    }, {
        key: "styleRule",
        value: function styleRule(style) {
            this.ensureFirstUpdate();
            if (arguments.length > 1) {
                style = Object.assign.apply(Object, [{}].concat(Array.prototype.slice.call(arguments)));
            }
            var element = new StyleRuleGroup(this.getNativeStyleSheet(), style);
            this.elements.add(element);
            return element;
        }
    }, {
        key: "keyframe",
        value: function keyframe(_keyframe) {
            this.ensureFirstUpdate();
            throw Error("Not implemented yet!");
        }
    }, {
        key: "keyframes",
        value: function keyframes(_keyframes) {
            this.ensureFirstUpdate();
            throw Error("Not implemented yet!");
        }
    }, {
        key: "addBeforeUpdateListener",
        value: function addBeforeUpdateListener(callback) {
            return this.addListener("beforeUpdate", callback);
        }
    }, {
        key: "update",
        value: function update() {
            this.dispatch("beforeUpdate", this);
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = this.elements[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var value = _step5.value;

                    value.update();
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
    }], [{
        key: "getInstance",
        value: function getInstance() {
            return this.singletonInstance = this.singletonInstance || new this();
        }
    }, {
        key: "getElementName",
        value: function getElementName() {
            this.elementNameCounter = (this.elementNameCounter || 0) + 1;
            var name = this.constructor.name;
            if (this.elementNameCounter > 1) {
                name += "-" + this.elementNameCounter;
            }
            return name;
        }
    }]);
    return StyleSheet;
}(Dispatchable);

var _class$2;
var _descriptor$1;
var _descriptor2$1;
var _descriptor3$1;
var _class3$1;
var _descriptor4$1;
var _descriptor5$1;
var _descriptor6$1;
var _class5$1;
var _descriptor7$1;
var _descriptor8$1;
var _descriptor9$1;

function _initDefineProp$2(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
        writable: descriptor.writable,
        value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
}

function _applyDecoratedDescriptor$2(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
        desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
        desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
        return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
        desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
        desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
        Object['define' + 'Property'](target, property, desc);
        desc = null;
    }

    return desc;
}

var BaseTabAreaStyle = (_class$2 = function (_StyleSet) {
    inherits(BaseTabAreaStyle, _StyleSet);

    function BaseTabAreaStyle() {
        var _ref;

        var _temp, _this, _ret;

        classCallCheck(this, BaseTabAreaStyle);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = possibleConstructorReturn(this, (_ref = BaseTabAreaStyle.__proto__ || Object.getPrototypeOf(BaseTabAreaStyle)).call.apply(_ref, [this].concat(args))), _this), _initDefineProp$2(_this, "tab", _descriptor$1, _this), _initDefineProp$2(_this, "activeTab", _descriptor2$1, _this), _initDefineProp$2(_this, "nav", _descriptor3$1, _this), _temp), possibleConstructorReturn(_this, _ret);
    }

    return BaseTabAreaStyle;
}(StyleSet), (_descriptor$1 = _applyDecoratedDescriptor$2(_class$2.prototype, "tab", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            userSelect: "none",
            display: "inline-block",
            position: "relative"
        };
    }
}), _descriptor2$1 = _applyDecoratedDescriptor$2(_class$2.prototype, "activeTab", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {};
    }
}), _descriptor3$1 = _applyDecoratedDescriptor$2(_class$2.prototype, "nav", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            listStyle: "none"
        };
    }
})), _class$2);
var DefaultTabAreaStyle = (_class3$1 = function (_BaseTabAreaStyle) {
    inherits(DefaultTabAreaStyle, _BaseTabAreaStyle);

    function DefaultTabAreaStyle() {
        var _ref2;

        var _temp2, _this2, _ret2;

        classCallCheck(this, DefaultTabAreaStyle);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return _ret2 = (_temp2 = (_this2 = possibleConstructorReturn(this, (_ref2 = DefaultTabAreaStyle.__proto__ || Object.getPrototypeOf(DefaultTabAreaStyle)).call.apply(_ref2, [this].concat(args))), _this2), _initDefineProp$2(_this2, "tab", _descriptor4$1, _this2), _initDefineProp$2(_this2, "activeTab", _descriptor5$1, _this2), _initDefineProp$2(_this2, "nav", _descriptor6$1, _this2), _temp2), possibleConstructorReturn(_this2, _ret2);
    }

    return DefaultTabAreaStyle;
}(BaseTabAreaStyle), (_descriptor4$1 = _applyDecoratedDescriptor$2(_class3$1.prototype, "tab", [styleRuleInherit], {
    enumerable: true,
    initializer: function initializer() {
        return {
            marginBottom: "-1px",
            textDecoration: "none !important",
            marginRight: "2px",
            lineHeight: "1.42857143",
            border: "1px solid transparent",
            borderRadius: "4px 4px 0 0",
            padding: "8px",
            paddingLeft: "10px",
            paddingRight: "10px",
            ":hover": {
                cursor: "pointer",
                backgroundColor: "#eee",
                color: "#555",
                border: "1px solid #ddd",
                borderBottomColor: "transparent"
            }
        };
    }
}), _descriptor5$1 = _applyDecoratedDescriptor$2(_class3$1.prototype, "activeTab", [styleRuleInherit], {
    enumerable: true,
    initializer: function initializer() {
        return {
            color: "#555 !important",
            cursor: "default !important",
            backgroundColor: "#fff !important",
            border: "1px solid #ddd !important",
            borderBottomColor: "transparent !important"
        };
    }
}), _descriptor6$1 = _applyDecoratedDescriptor$2(_class3$1.prototype, "nav", [styleRuleInherit], {
    enumerable: true,
    initializer: function initializer() {
        return {
            borderBottom: "1px solid #ddd",
            paddingLeft: "0",
            marginBottom: "0"
        };
    }
})), _class3$1);
var MinimalistTabAreaStyle = (_class5$1 = function (_BaseTabAreaStyle2) {
    inherits(MinimalistTabAreaStyle, _BaseTabAreaStyle2);

    function MinimalistTabAreaStyle() {
        var _ref3;

        var _temp3, _this3, _ret3;

        classCallCheck(this, MinimalistTabAreaStyle);

        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        return _ret3 = (_temp3 = (_this3 = possibleConstructorReturn(this, (_ref3 = MinimalistTabAreaStyle.__proto__ || Object.getPrototypeOf(MinimalistTabAreaStyle)).call.apply(_ref3, [this].concat(args))), _this3), _initDefineProp$2(_this3, "tab", _descriptor7$1, _this3), _initDefineProp$2(_this3, "activeTab", _descriptor8$1, _this3), _initDefineProp$2(_this3, "nav", _descriptor9$1, _this3), _temp3), possibleConstructorReturn(_this3, _ret3);
    }

    return MinimalistTabAreaStyle;
}(BaseTabAreaStyle), (_descriptor7$1 = _applyDecoratedDescriptor$2(_class5$1.prototype, "tab", [styleRuleInherit], {
    enumerable: true,
    initializer: function initializer() {
        return {
            textDecoration: "none !important",
            lineHeight: "1.42857143",
            paddingTop: "6px",
            paddingLeft: "8px",
            paddingRight: "8px",
            paddingBottom: "4px",
            color: "#666",
            borderBottom: "2px solid transparent",
            ":hover": {
                cursor: "pointer",
                color: "rgba(51,122,183,1)"
            }
        };
    }
}), _descriptor8$1 = _applyDecoratedDescriptor$2(_class5$1.prototype, "activeTab", [styleRuleInherit], {
    enumerable: true,
    initializer: function initializer() {
        return {
            fontWeight: "bold",
            color: "rgba(51,122,183,1)",
            cursor: "default !important",
            borderBottom: "2px solid rgba(51,122,183,1) !important"
        };
    }
}), _descriptor9$1 = _applyDecoratedDescriptor$2(_class5$1.prototype, "nav", [styleRuleInherit], {
    enumerable: true,
    initializer: function initializer() {
        return {
            position: "relative",
            borderBottom: "1px solid #aaa"
        };
    }
})), _class5$1);

var _class$1;
var _temp2;

var BasicTabTitle = function (_UI$Primitive) {
    inherits(BasicTabTitle, _UI$Primitive);

    function BasicTabTitle() {
        classCallCheck(this, BasicTabTitle);
        return possibleConstructorReturn(this, (BasicTabTitle.__proto__ || Object.getPrototypeOf(BasicTabTitle)).apply(this, arguments));
    }

    createClass(BasicTabTitle, [{
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            attr.addClass(this.getStyleSet().tab);
            if (this.options.active) {
                attr.addClass(this.getStyleSet().activeTab);
            }
        }
    }, {
        key: "canOverwrite",
        value: function canOverwrite(existingElement) {
            // Disable reusing with different panels, since we want to attach listeners to the panel
            // TODO: might want to just return the key as this.options.panel
            return get(BasicTabTitle.prototype.__proto__ || Object.getPrototypeOf(BasicTabTitle.prototype), "canOverwrite", this).call(this, existingElement) && this.options.panel === existingElement.options.panel;
        }
    }, {
        key: "setActive",
        value: function setActive(active) {
            var _this2 = this;

            this.options.active = active;
            this.redraw();
            if (active) {
                this.options.activeTabDispatcher.setActive(this.getPanel(), function () {
                    _this2.setActive(false);
                });
            }
        }
    }, {
        key: "getStyleSet",
        value: function getStyleSet() {
            return this.options.styleSet || this.constructor.styleSet;
        }
    }, {
        key: "getPanel",
        value: function getPanel() {
            return this.options.panel;
        }
    }, {
        key: "getTitle",
        value: function getTitle() {
            if (this.options.title) {
                return this.options.title;
            }
            var panel = this.getPanel();
            if (typeof panel.getTitle === "function") {
                return panel.getTitle();
            }
            return panel.options.title;
        }
    }, {
        key: "render",
        value: function render() {
            return this.getTitle();
        }
    }, {
        key: "onMount",
        value: function onMount() {
            var _this3 = this;

            if (this.options.active) {
                this.setActive(true);
            }

            this.addClickListener(function () {
                _this3.setActive(true);
            });

            // TODO: less assumptions here
            if (this.options.panel && this.options.panel.addListener) {
                this.attachListener(this.options.panel, "show", function () {
                    _this3.setActive(true);
                });
            }
        }
    }]);
    return BasicTabTitle;
}(UI.Primitive("a"));



var TabTitleArea = function (_UI$Element) {
    inherits(TabTitleArea, _UI$Element);

    function TabTitleArea() {
        classCallCheck(this, TabTitleArea);
        return possibleConstructorReturn(this, (TabTitleArea.__proto__ || Object.getPrototypeOf(TabTitleArea)).apply(this, arguments));
    }

    return TabTitleArea;
}(UI.Element);



var TabArea = (_temp2 = _class$1 = function (_UI$Element2) {
    inherits(TabArea, _UI$Element2);

    function TabArea() {
        var _ref;

        var _temp, _this5, _ret;

        classCallCheck(this, TabArea);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this5 = possibleConstructorReturn(this, (_ref = TabArea.__proto__ || Object.getPrototypeOf(TabArea)).call.apply(_ref, [this].concat(args))), _this5), _this5.activeTabDispatcher = new SingleActiveElementDispatcher(), _temp), possibleConstructorReturn(_this5, _ret);
    }
    // TODO: should be a lazy property, must fix decorator first


    createClass(TabArea, [{
        key: "getDefaultOptions",
        value: function getDefaultOptions() {
            return {
                autoActive: true };
        }
    }, {
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            // TODO: these shoudl not be in here!
            attr.setStyle("display", "flex");
            attr.setStyle("flex-direction", "column");
            // attr.setStyle("display", "none");
            if (!this.options.variableHeightPanels) {
                // attr.addClass("auto-height-parent");
            }
        }
    }, {
        key: "getStyleSet",
        value: function getStyleSet() {
            return this.options.styleSet || this.constructor.styleSet;
        }
    }, {
        key: "createTabPanel",
        value: function createTabPanel(panel) {
            var tab = UI.createElement(BasicTabTitle, { panel: panel, activeTabDispatcher: this.activeTabDispatcher,
                active: panel.options.active, href: panel.options.tabHref,
                styleSet: this.getStyleSet() });

            return [tab, panel];
        }
    }, {
        key: "appendChild",
        value: function appendChild(panel, doMount) {
            var _createTabPanel = this.createTabPanel(panel),
                _createTabPanel2 = slicedToArray(_createTabPanel, 2),
                tabTitle = _createTabPanel2[0],
                tabPanel = _createTabPanel2[1];

            this.options.children.push(panel);

            this.titleArea.appendChild(tabTitle);
            this.switcherArea.appendChild(tabPanel, doMount || true);
        }
    }, {
        key: "getTitleArea",
        value: function getTitleArea(tabTitles) {
            return UI.createElement(
                TabTitleArea,
                { ref: "titleArea", className: this.getStyleSet().nav },
                tabTitles
            );
        }
    }, {
        key: "getSwitcher",
        value: function getSwitcher(tabPanels) {
            // TODO: This should have the ex "auto-height" if not variable height children
            // className="auto-height"
            return UI.createElement(
                UI.Switcher,
                { style: { flex: "1", overflow: "auto" }, ref: "switcherArea", lazyRender: this.options.lazyRender },
                tabPanels
            );
        }
    }, {
        key: "render",
        value: function render() {
            var tabTitles = [];
            var tabPanels = [];
            var activeTab = void 0;

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.options.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var panel = _step.value;

                    var _createTabPanel3 = this.createTabPanel(panel),
                        _createTabPanel4 = slicedToArray(_createTabPanel3, 2),
                        tabTitle = _createTabPanel4[0],
                        tabPanel = _createTabPanel4[1];

                    if (tabTitle.options.active) {
                        activeTab = tabTitle;
                    }

                    tabTitles.push(tabTitle);
                    tabPanels.push(tabPanel);
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

            if (this.options.autoActive && !activeTab && tabTitles.length > 0) {
                tabTitles[0].options.active = true;
            }

            return [this.getTitleArea(tabTitles), this.getSwitcher(tabPanels)];
        }
    }, {
        key: "setActive",
        value: function setActive(panel) {
            this.activeTabDispatcher.setActive(panel);
        }
    }, {
        key: "getActive",
        value: function getActive() {
            return this.activeTabDispatcher.getActive();
        }
    }, {
        key: "onSetActive",
        value: function onSetActive(panel) {
            this.switcherArea.setActive(panel);
        }
    }, {
        key: "onMount",
        value: function onMount() {
            var _this6 = this;

            this.attachListener(this.activeTabDispatcher, function (panel) {
                _this6.onSetActive(panel);
            });

            this.addListener("resize", function () {
                _this6.switcherArea.dispatch("resize");
            });
        }
    }]);
    return TabArea;
}(UI.Element), _class$1.styleSet = DefaultTabAreaStyle.getInstance(), _temp2);

// Contains classes to abstract some generic Font Awesome usecases.
var FAIcon = function (_UI$Primitive) {
    inherits(FAIcon, _UI$Primitive);

    function FAIcon() {
        classCallCheck(this, FAIcon);
        return possibleConstructorReturn(this, (FAIcon.__proto__ || Object.getPrototypeOf(FAIcon)).apply(this, arguments));
    }

    createClass(FAIcon, [{
        key: "getIcon",
        value: function getIcon() {
            return this.options.icon;
        }
    }, {
        key: "getNodeAttributes",
        value: function getNodeAttributes() {
            var attr = get(FAIcon.prototype.__proto__ || Object.getPrototypeOf(FAIcon.prototype), "getNodeAttributes", this).call(this);

            attr.addClass("fa");
            attr.addClass("fa-" + this.getIcon());

            return attr;
        }
    }, {
        key: "setIcon",
        value: function setIcon(icon) {
            this.options.icon = icon;
            this.redraw();
        }
    }]);
    return FAIcon;
}(UI.Primitive("i"));

var FACollapseIcon = function (_FAIcon) {
    inherits(FACollapseIcon, _FAIcon);

    function FACollapseIcon() {
        classCallCheck(this, FACollapseIcon);
        return possibleConstructorReturn(this, (FACollapseIcon.__proto__ || Object.getPrototypeOf(FACollapseIcon)).apply(this, arguments));
    }

    createClass(FACollapseIcon, [{
        key: "getIcon",
        value: function getIcon() {
            if (this.options.collapsed) {
                return "angle-right";
            } else {
                return "angle-down";
            }
        }
    }, {
        key: "setCollapsed",
        value: function setCollapsed(collapsed) {
            this.options.collapsed = collapsed;
            this.redraw();
        }
    }]);
    return FACollapseIcon;
}(FAIcon);

var DoubleClickable = function DoubleClickable(BaseClass) {
    return function (_BaseClass) {
        inherits(DoubleClickable, _BaseClass);

        function DoubleClickable() {
            var _ref;

            var _temp, _this, _ret;

            classCallCheck(this, DoubleClickable);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = possibleConstructorReturn(this, (_ref = DoubleClickable.__proto__ || Object.getPrototypeOf(DoubleClickable)).call.apply(_ref, [this].concat(args))), _this), _this.singleClickCallbacks = new Map(), _this.doubleClickCallbacks = new Map(), _temp), possibleConstructorReturn(_this, _ret);
        }
        // @lazyInit


        // @lazyInit


        createClass(DoubleClickable, [{
            key: "addClickListener",
            value: function addClickListener(callback) {
                var _this2 = this;

                if (this.singleClickCallbacks.has(callback)) {
                    return;
                }

                var callbackWrapper = function callbackWrapper() {
                    var now = Date.now();

                    if (!_this2.hasOwnProperty("_singleClickTime") || now - _this2._singleClickTime >= _this2.getSingleClickTimeout()) {
                        // It's a single click
                        // TODO: why is this wrapped in a setTimeout?
                        setTimeout(function () {
                            _this2._singleClickTime = now;
                        });
                        setTimeout(function () {
                            if (_this2.hasOwnProperty("_singleClickTime") && _this2._singleClickTime === now) {
                                callback();
                            }
                        }, _this2.getSingleClickTimeout());
                    } else {
                        // It's a double click
                        setTimeout(function () {
                            delete _this2._singleClickTime;
                        });
                    }
                };
                this.singleClickCallbacks.set(callback, callbackWrapper);
                get(DoubleClickable.prototype.__proto__ || Object.getPrototypeOf(DoubleClickable.prototype), "addClickListener", this).call(this, callbackWrapper);
            }
        }, {
            key: "getSingleClickTimeout",
            value: function getSingleClickTimeout() {
                return 250;
            }
        }, {
            key: "removeClickListener",
            value: function removeClickListener(callback) {
                var callbackWrapper = this.singleClickCallbacks.get(callback);
                if (callbackWrapper) {
                    this.singleClickCallbacks.delete(callback);
                    get(DoubleClickable.prototype.__proto__ || Object.getPrototypeOf(DoubleClickable.prototype), "removeClickListener", this).call(this, callbackWrapper);
                }
            }
        }, {
            key: "addDoubleClickListener",
            value: function addDoubleClickListener(callback) {
                var _this3 = this;

                if (this.doubleClickCallbacks.has(callback)) {
                    return;
                }

                var callbackWrapper = function callbackWrapper() {

                    var now = new Date().getTime();
                    console.log(now);

                    if (!_this3.hasOwnProperty("_singleClickTime") || now - _this3._singleClickTime >= _this3.getSingleClickTimeout()) {
                        // It's a single click
                        setTimeout(function () {
                            _this3._singleClickTime = now;
                        });
                    } else {
                        // It's a double click
                        setTimeout(function () {
                            delete _this3._singleClickTime;
                        });
                        callback();
                    }
                };
                this.doubleClickCallbacks.set(callback, callbackWrapper);
                get(DoubleClickable.prototype.__proto__ || Object.getPrototypeOf(DoubleClickable.prototype), "addClickListener", this).call(this, callbackWrapper);
            }
        }, {
            key: "removeDoubleClickListener",
            value: function removeDoubleClickListener(callback) {
                var callbackWrapper = this.doubleClickCallbacks.get(callback);
                if (callbackWrapper) {
                    this.doubleClickCallbacks.delete(callback);
                    get(DoubleClickable.prototype.__proto__ || Object.getPrototypeOf(DoubleClickable.prototype), "removeClickListener", this).call(this, callbackWrapper);
                }
            }
        }]);
        return DoubleClickable;
    }(BaseClass);
};

/*
* Implements a Class Factory, to be able to create element that can be easily set to full screen
*/

// TODO: is this a good pattern, and should this method live somewhere else?
function callFirstMethodAvailable(obj, methodNames) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = methodNames[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var methodName = _step.value;

            if (typeof obj[methodName] === "function") {
                obj[methodName]();
                return methodName;
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

    return null;
}

// TODO: might need a clean-up
// Don't automate this, these names differ slightly (eg. moz has uppercase Screen)
var ENTER_FULL_SCREEN_METHODS = ["requestFullscreen", "webkitRequestFullscreen", "msRequestFullscreen", "mozRequestFullScreen"];

var EXIT_FULL_SCREEN_METHODS = ["exitFullscreen", "webkitExitFullscreen", "msExitFullscreen", "mozCancelFullScreen"];

var FULL_SCREEN_CHANGE_EVENTS = ["webkitfullscreenchange", "mozfullscreenchange", "fullscreenchange", "MSFullscreenChange"];

// TODO: lowercase the s in screen?
// TODO: this should not be directly in UI namespace
var FullScreenable = function FullScreenable(BaseClass) {
    return function (_BaseClass) {
        inherits(FullScreenable, _BaseClass);

        function FullScreenable() {
            classCallCheck(this, FullScreenable);
            return possibleConstructorReturn(this, (FullScreenable.__proto__ || Object.getPrototypeOf(FullScreenable)).apply(this, arguments));
        }

        createClass(FullScreenable, [{
            key: "enterFullScreen",
            value: function enterFullScreen() {
                this.attachEnterFullscreenHandler();
                if (!callFirstMethodAvailable(this.node, ENTER_FULL_SCREEN_METHODS)) {
                    console.error("No valid full screen function available");
                    return;
                }
                this._expectingFullScreen = true;
            }
        }, {
            key: "isFullScreen",
            value: function isFullScreen() {
                return this._isFullScreen;
            }
        }, {
            key: "exitFullScreen",
            value: function exitFullScreen() {
                if (!callFirstMethodAvailable(document, EXIT_FULL_SCREEN_METHODS)) {
                    console.error("No valid available function to exit fullscreen");
                    return;
                }
            }
        }, {
            key: "toggleFullScreen",
            value: function toggleFullScreen() {
                if (this.isFullScreen()) {
                    this.exitFullScreen();
                } else {
                    this.enterFullScreen();
                }
            }
        }, {
            key: "attachEnterFullscreenHandler",
            value: function attachEnterFullscreenHandler() {
                var _this2 = this;

                if (this._attachedFullscreenHandler) {
                    return;
                }
                this._attachedFullscreenHandler = true;
                var fullScreenFunction = function fullScreenFunction() {
                    if (_this2._expectingFullScreen) {
                        _this2._expectingFullScreen = false;
                        _this2._isFullScreen = true;
                        _this2.dispatch("enterFullScreen");
                    } else {
                        if (_this2._isFullScreen) {
                            _this2._isFullScreen = false;
                            _this2.dispatch("exitFullScreen");
                        }
                    }
                    _this2.dispatch("resize");
                };
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = FULL_SCREEN_CHANGE_EVENTS[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var eventName = _step2.value;

                        document.addEventListener(eventName, fullScreenFunction);
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
        }]);
        return FullScreenable;
    }(BaseClass);
};

var _class$3;
var _descriptor$2;
var _descriptor2$2;

function _initDefineProp$3(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
        writable: descriptor.writable,
        value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
}

function _applyDecoratedDescriptor$3(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
        desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
        desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
        return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
        desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
        desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
        Object['define' + 'Property'](target, property, desc);
        desc = null;
    }

    return desc;
}

// This whole file needs a refactoring, it's awfully written
// Move SectionDivider out of the UI namespace
var SectionDividerStyleSet = (_class$3 = function (_StyleSet) {
    inherits(SectionDividerStyleSet, _StyleSet);

    function SectionDividerStyleSet() {
        var _ref;

        var _temp, _this, _ret;

        classCallCheck(this, SectionDividerStyleSet);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = possibleConstructorReturn(this, (_ref = SectionDividerStyleSet.__proto__ || Object.getPrototypeOf(SectionDividerStyleSet)).call.apply(_ref, [this].concat(args))), _this), _initDefineProp$3(_this, "horizontalDivider", _descriptor$2, _this), _initDefineProp$3(_this, "verticalDivider", _descriptor2$2, _this), _temp), possibleConstructorReturn(_this, _ret);
    }

    return SectionDividerStyleSet;
}(StyleSet), (_descriptor$2 = _applyDecoratedDescriptor$3(_class$3.prototype, "horizontalDivider", [lazyCSS], {
    enumerable: true,
    initializer: function initializer() {
        return {
            cursor: "row-resize"
        };
    }
}), _descriptor2$2 = _applyDecoratedDescriptor$3(_class$3.prototype, "verticalDivider", [lazyCSS], {
    enumerable: true,
    initializer: function initializer() {
        return {
            cursor: "col-resize"
        };
    }
})), _class$3);

// options.orientation is the orientation of the divided elements

var DividerBar = function (_UI$Element) {
    inherits(DividerBar, _UI$Element);

    function DividerBar(options) {
        classCallCheck(this, DividerBar);

        var _this2 = possibleConstructorReturn(this, (DividerBar.__proto__ || Object.getPrototypeOf(DividerBar)).call(this, options));

        _this2.orientation = _this2.options.orientation || UI.Orientation.HORIZONTAL;
        return _this2;
    }

    createClass(DividerBar, [{
        key: "getNodeAttributes",
        value: function getNodeAttributes() {
            var attr = get(DividerBar.prototype.__proto__ || Object.getPrototypeOf(DividerBar.prototype), "getNodeAttributes", this).call(this);
            if (this.orientation === UI.Orientation.VERTICAL) {
                attr.addClass("sectionDividerHorizontal");
                attr.setStyle("width", "100%");
            } else if (this.orientation === UI.Orientation.HORIZONTAL) {
                attr.addClass("sectionDividerVertical");
                attr.setStyle("height", "100%");
                attr.setStyle("display", "inline-block");
            }
            return attr;
        }
    }, {
        key: "render",
        value: function render() {
            if (this.orientation === UI.Orientation.VERTICAL) {
                return [UI.createElement("div", { style: { height: "3px", width: "100%" } }), UI.createElement("div", { style: { height: "2px", width: "100%", background: "#DDD" } }), UI.createElement("div", { style: { height: "3px", width: "100%" } })];
            } else {
                return [UI.createElement("div", { style: { width: "3px", display: "inline-block" } }), UI.createElement("div", { style: { width: "2px", height: "100%", background: "#DDD", display: "inline-block" } }), UI.createElement("div", { style: { width: "3px", display: "inline-block" } })];
            }
        }
    }]);
    return DividerBar;
}(UI.Element);



/* Divider class should take in:
    - Vertical or horizontal separation
    - All the children it's dividing
    - An option on how to redivide the sizes of the children
 */

var SectionDivider = function (_UI$Element2) {
    inherits(SectionDivider, _UI$Element2);

    function SectionDivider(options) {
        classCallCheck(this, SectionDivider);

        var _this3 = possibleConstructorReturn(this, (SectionDivider.__proto__ || Object.getPrototypeOf(SectionDivider)).call(this, options));

        _this3.uncollapsedSizes = new WeakMap();
        return _this3;
    }

    createClass(SectionDivider, [{
        key: "getOrientation",
        value: function getOrientation() {
            return this.options.orientation || UI.Orientation.VERTICAL;
        }
    }, {
        key: "hideBars",
        value: function hideBars() {
            for (var i = 0; i < this.dividers; i += 1) {
                this["divider" + i].addClass("hidden");
            }
        }
    }, {
        key: "showBars",
        value: function showBars() {
            for (var i = 0; i < this.dividers; i += 1) {
                this["divider" + i].removeClass("hidden");
            }
        }
    }, {
        key: "reverse",
        value: function reverse() {
            this.options.children.reverse();
            for (var i = 0; i < this.children.length - 1; i += 1) {
                this.node.insertBefore(this.children[i].node, this.node.firstChild);
            }
            this.children.reverse();
        }
    }, {
        key: "getDimension",
        value: function getDimension(element) {
            if (this.getOrientation() === UI.Orientation.HORIZONTAL) {
                return element.getWidth();
            } else {
                return element.getHeight();
            }
        }
    }, {
        key: "setDimension",
        value: function setDimension(element, size) {
            if (this.getOrientation() === UI.Orientation.HORIZONTAL) {
                element.setWidth(size);
            } else {
                element.setHeight(size);
            }
        }
    }, {
        key: "getMinDimension",
        value: function getMinDimension(element) {
            if (this.getOrientation() === UI.Orientation.HORIZONTAL && element.options.hasOwnProperty("minWidth")) {
                return element.options.minWidth;
            } else if (this.getOrientation() === UI.Orientation.VERTICAL && element.options.hasOwnProperty("minHeight")) {
                return element.options.minHeight;
            } else {
                return 100.0 / (this.children.length - 1) / 4;
            }
        }
    }, {
        key: "collapseChild",
        value: function collapseChild(index) {
            var parentSize = this.getDimension(this);
            var child = this.children[index * 2];
            var childSize = this.getDimension(child);
            this.uncollapsedSizes.set(child, childSize);
            var unCollapsedCount = 0;
            if (childSize === 0) {
                return;
            }
            for (var i = 0; i < this.children.length - 1; i += 2) {
                if (this.getDimension(this.children[i]) !== 0 && !this.children[i].hasOwnProperty("fixed")) {
                    unCollapsedCount += 1;
                }
            }
            unCollapsedCount -= 1;
            this.setDimension(child, "0%");
            child.options.collapsed = true;
            child.hide();
            for (var _i = 0; _i < this.children.length - 1; _i += 2) {
                if (this.getDimension(this.children[_i]) !== 0 && !this.children[_i].hasOwnProperty("fixed")) {
                    this.setDimension(this.children[_i], (this.getDimension(this.children[_i]) + childSize / unCollapsedCount) * 100 / parentSize + "%");
                    this.children[_i].dispatch("resize");
                }
            }
        }
    }, {
        key: "expandChild",
        value: function expandChild(index) {
            var parentSize = this.getDimension(this);
            var child = this.children[index * 2];
            var childSize = this.getDimension(child);
            var unCollapsedCount = 0;
            var totalSize = parentSize;
            if (childSize !== 0) {
                return;
            }
            for (var i = 0; i < this.children.length - 1; i += 2) {
                if (this.getDimension(this.children[i]) !== 0 && !this.children[i].hasOwnProperty("fixed")) {
                    unCollapsedCount += 1;
                }
            }
            unCollapsedCount += 1;
            childSize = this.uncollapsedSizes.get(child);
            child.options.collapsed = false;
            child.show();
            for (var _i2 = 0; _i2 < this.children.length - 1; _i2 += 2) {
                if (this.getDimension(this.children[_i2]) !== 0 && !this.children[_i2].hasOwnProperty("fixed")) {
                    this.setDimension(this.children[_i2], (this.getDimension(this.children[_i2]) - childSize / (unCollapsedCount - 1)) * 100 / parentSize + "%");
                    this.children[_i2].dispatch("resize");
                }
            }
            this.setDimension(child, childSize * 100 / parentSize + "%");
        }
    }, {
        key: "toggleChild",
        value: function toggleChild(index) {
            var size = this.getDimension(this.children[index * 2]);
            if (!size) {
                this.expandChild(index);
            } else {
                this.collapseChild(index);
            }
        }
    }, {
        key: "recalculateDimensions",
        value: function recalculateDimensions() {
            var parentSize = this.getDimension(this);
            var dividersTotalSize = 0;
            var sectionsTotalSize = 0;
            var ratio = void 0;
            for (var i = 0; i < this.children.length - 1; i += 2) {
                if (i + 1 < this.children.length - 1) {
                    dividersTotalSize += this.getDimension(this.children[i + 1]);
                }
                sectionsTotalSize += this.getDimension(this.children[i]);
            }
            // The children occupied space must be slightly less than the available because of ceils and overflow
            sectionsTotalSize += 1;
            ratio = (parentSize - dividersTotalSize) / parentSize;
            for (var _i3 = 0; _i3 < this.children.length - 1; _i3 += 2) {
                var newDimension = this.getDimension(this.children[_i3]) * 100 * ratio / sectionsTotalSize + "%";
                this.setDimension(this.children[_i3], newDimension);
            }
        }
    }, {
        key: "onMount",
        value: function onMount() {
            var _this4 = this;

            if (!this.options.noDividers) {
                var _loop = function _loop(i) {
                    var mousedownFunc = function mousedownFunc(event) {
                        //TODO: right now section divider only works on UIElements
                        var p = 2 * i;
                        var previous = _this4.children[p];
                        while (p && (previous.options.fixed || previous.options.collapsed)) {
                            p -= 2;
                            previous = _this4.children[p];
                        }
                        var n = 2 * i + 2;
                        var next = _this4.children[n];
                        while (n + 2 < _this4.children.length - 1 && (next.options.fixed || next.options.collapsed)) {
                            n += 2;
                            next = _this4.children[n];
                        }
                        //TODO @kira This is not perfect yet.
                        previous.show();
                        next.show();

                        previous.dispatch("resize");
                        next.dispatch("resize");

                        var parentSize = _this4.getDimension(_this4);
                        var previousSize = _this4.getDimension(previous) * 100 / _this4.getDimension(_this4);
                        var nextSize = _this4.getDimension(next) * 100 / _this4.getDimension(_this4);
                        var minPreviousSize = _this4.getMinDimension(previous);
                        var minNextSize = _this4.getMinDimension(next);
                        var currentX = Device.getEventX(event);
                        var currentY = Device.getEventY(event);

                        //TODO: we should restore whatever the text selection was before
                        var textSelection = function textSelection(value) {
                            document.body.style["-webkit-user-select"] = value;
                            document.body.style["-moz-user-select"] = value;
                            document.body.style["-ms-user-select"] = value;
                            document.body.style["-o-user-select"] = value;
                            document.body.style["user-select"] = value;
                        };

                        var updateDimension = function updateDimension(event) {
                            var delta = void 0;

                            if (_this4.getOrientation() === UI.Orientation.HORIZONTAL) {
                                delta = Device.getEventX(event) - currentX;
                            } else if (_this4.getOrientation() === UI.Orientation.VERTICAL) {
                                delta = Device.getEventY(event) - currentY;
                            }

                            if (nextSize - delta * 100 / parentSize < minNextSize || previousSize + delta * 100 / parentSize < minPreviousSize) {
                                return;
                            }

                            nextSize -= delta * 100 / parentSize;
                            previousSize += delta * 100 / parentSize;
                            _this4.setDimension(next, nextSize + "%");
                            _this4.setDimension(previous, previousSize + "%");

                            next.dispatch("resize", { width: next.getWidth(), height: next.getHeight() });
                            previous.dispatch("resize", { width: previous.getWidth(), height: previous.getWidth() });

                            currentX = Device.getEventX(event);
                            currentY = Device.getEventY(event);
                        };

                        textSelection("none");
                        var dragMousemove = function dragMousemove(event) {
                            updateDimension(event);
                        };
                        var dragMousemoveTouch = function dragMousemoveTouch(event) {
                            event.preventDefault();
                            dragMousemove(event);
                        };
                        var dragMouseup = function dragMouseup() {
                            textSelection("text");
                            document.body.removeEventListener("touchmove", dragMousemoveTouch);
                            document.body.removeEventListener("touchend", dragMouseup);
                            document.body.removeEventListener("mousemove", dragMousemove);
                            document.body.removeEventListener("mouseup", dragMouseup);
                        };
                        document.body.addEventListener("touchmove", dragMousemoveTouch);
                        document.body.addEventListener("touchend", dragMouseup);
                        document.body.addEventListener("mousemove", dragMousemove);
                        document.body.addEventListener("mouseup", dragMouseup);
                    };
                    _this4["divider" + i].addNodeListener("touchstart", mousedownFunc);
                    _this4["divider" + i].addNodeListener("mousedown", mousedownFunc);
                };

                for (var i = 0; i < this.dividers; i += 1) {
                    _loop(i);
                }
            } else {
                for (var i = 0; i < this.dividers; i += 1) {
                    this.setDimension(this["divider" + i], 0);
                }
            }
            setTimeout(function () {
                _this4.recalculateDimensions();
            });
            window.addEventListener("resize", function () {
                _this4.recalculateDimensions();
            });
        }
    }, {
        key: "render",
        value: function render() {
            // TODO: use a Style for the Divider bars
            return [this.dividedChildren(), UI.createElement(
                UI.StyleElement,
                null,
                UI.createElement(UI.StyleInstance, { selector: ".sectionDividerHorizontal:hover", attributes: { "cursor": "row-resize" } }),
                UI.createElement(UI.StyleInstance, { selector: ".sectionDividerVertical:hover", attributes: { "cursor": "col-resize" } })
            )];
        }
    }, {
        key: "redraw",
        value: function redraw() {
            get(SectionDivider.prototype.__proto__ || Object.getPrototypeOf(SectionDivider.prototype), "redraw", this).call(this);
            // Safari bug fix
            // TODO: this isn't a proper solution, children elements should not be modified
            if (this.getOrientation() === UI.Orientation.HORIZONTAL) {
                // TODO: this should be done through CSS classes
                for (var i = 0; i < this.children.length - 1; i += 2) {
                    this.children[i].setStyle("vertical-align", "top");
                }
            }
        }
    }, {
        key: "dividedChildren",
        value: function dividedChildren() {
            var children = [];
            this.dividers = 0;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.options.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var child = _step.value;

                    if (children.length > 0) {
                        children.push(UI.createElement(DividerBar, { ref: "divider" + this.dividers, orientation: this.getOrientation() }));
                        this.dividers += 1;
                    }
                    children.push(child);
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

            return children;
        }
    }]);
    return SectionDivider;
}(UI.Element);

// Very primitive version of a DateTimePicker, still work in progress, not production ready
function getTwoDigitsNumber(value) {
    return value < 10 ? "0" + value : String(value);
}

var DateTimePicker = function (_UI$Element) {
    inherits(DateTimePicker, _UI$Element);

    function DateTimePicker() {
        classCallCheck(this, DateTimePicker);
        return possibleConstructorReturn(this, (DateTimePicker.__proto__ || Object.getPrototypeOf(DateTimePicker)).apply(this, arguments));
    }

    createClass(DateTimePicker, [{
        key: "getDefaultOptions",
        value: function getDefaultOptions() {
            return {
                format: "D/M/Y H:m",
                defaultDate: new Date(2017, 0, 6, 16, 30)
            };
        }
    }, {
        key: "render",
        value: function render() {
            return [UI.createElement(
                "div",
                { className: "form-group" },
                UI.createElement(
                    "div",
                    { className: "input-group date", ref: "picker" },
                    UI.createElement(UI.FormTextInput, { ref: "textArea", placeholder: this.options.format,
                        value: this.getStringFromDate(this.options.format, this.options.defaultDate) }),
                    UI.createElement(
                        "span",
                        { className: "input-group-addon" },
                        UI.createElement("span", { className: "glyphicon glyphicon-calendar" })
                    )
                )
            )];
        }
    }, {
        key: "onMount",
        value: function onMount() {
            get(DateTimePicker.prototype.__proto__ || Object.getPrototypeOf(DateTimePicker.prototype), "onMount", this).call(this);
        }
    }, {
        key: "getStringFromDate",
        value: function getStringFromDate(format, date) {
            var str = "";
            for (var i = 0; i < format.length; i += 1) {
                if (format[i] == "Y") {
                    str += date.getFullYear();
                } else if (format[i] == "M") {
                    str += getTwoDigitsNumber(date.getMonth() + 1);
                } else if (format[i] == "D") {
                    str += getTwoDigitsNumber(date.getDate());
                } else if (format[i] == "H") {
                    str += getTwoDigitsNumber(date.getHours());
                } else if (format[i] == "m") {
                    str += getTwoDigitsNumber(date.getMinutes());
                } else {
                    str += format[i];
                }
            }
            return str;
        }
    }, {
        key: "getDateFromString",
        value: function getDateFromString(format, str) {
            var year = void 0,
                month = void 0,
                day = void 0,
                hour = void 0,
                minute = void 0;
            var i = 0,
                j = 0;
            while (i < format.length && j < str.length) {
                if (format[i] >= "a" && format[i] <= "z" || format[i] >= "A" && format[i] <= "Z") {
                    var value = 0;
                    if (str[j] < "0" || str[j] > "9") {
                        return;
                    }
                    while (j < str.length && str[j] >= "0" && str[j] <= "9") {
                        value = value * 10 + parseInt(str[j]);
                        j += 1;
                    }
                    if (format[i] == "Y") {
                        year = value;
                    } else if (format[i] == "M") {
                        month = value - 1;
                    } else if (format[i] == "D") {
                        day = value;
                    } else if (format[i] == "H") {
                        hour = value;
                    } else if (format[i] == "m") {
                        minute = value;
                    } else {
                        return;
                    }
                    i += 1;
                } else {
                    if (format[i] != str[j]) {
                        return;
                    }
                    i += 1;
                    j += 1;
                }
            }
            return new Date(year, month, day, hour, minute);
        }
    }, {
        key: "getDate",
        value: function getDate() {
            return this.getDateFromString(this.options.format, this.textArea.getValue());
        }
    }, {
        key: "getUnixTime",
        value: function getUnixTime() {
            return this.getDate().getTime() / 1000;
        }
    }, {
        key: "getMoment",
        value: function getMoment() {
            return moment(this.getDate());
        }
    }, {
        key: "addChangeListener",
        value: function addChangeListener(action) {
            this.addListener("changeDate", function (date) {
                action(date);
            });
        }
    }]);
    return DateTimePicker;
}(UI.Element);

var StateClass = function (_Dispatchable) {
    inherits(StateClass, _Dispatchable);

    function StateClass() {
        classCallCheck(this, StateClass);

        var _this = possibleConstructorReturn(this, (StateClass.__proto__ || Object.getPrototypeOf(StateClass)).call(this));

        _this.stores = new Map();
        // A version of applyEvent that's binded to this
        _this.applyEventWrapper = function (event) {
            _this.applyEvent(event);
        };
        return _this;
    }

    createClass(StateClass, [{
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
                return store.get.apply(store, toConsumableArray(args));
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

var GlobalState$1 = new StateClass();

if (window) {
    window.GlobalState = GlobalState$1;
}

var StoreObject = function (_Dispatchable) {
    inherits(StoreObject, _Dispatchable);

    function StoreObject(obj) {
        classCallCheck(this, StoreObject);

        var _this = possibleConstructorReturn(this, (StoreObject.__proto__ || Object.getPrototypeOf(StoreObject)).call(this));

        Object.assign(_this, obj);
        return _this;
    }

    createClass(StoreObject, [{
        key: "applyEvent",


        // By default, applying an event just shallow copies the fields from event.data
        value: function applyEvent(event) {
            Object.assign(this, event.data);
        }
    }, {
        key: "addUpdateListener",


        // Add a listener for all updates, callback will receive the events after they were applied
        value: function addUpdateListener(callback) {
            return this.addListener("update", callback);
        }
    }, {
        key: "addDeleteListener",
        value: function addDeleteListener(callback) {
            return this.addListener("delete", callback);
        }

        // Add a listener on updates from events with this specific type.
        // Can accept an array as eventType
        // Returns an object that implements the Cleanup interface.

    }, {
        key: "addEventListener",
        value: function addEventListener(eventType, callback) {
            var _this2 = this;

            if (Array.isArray(eventType)) {
                // return new CleanupJobs(eventType.map(x => this.addEventListener(x, callback)));

                var cleanupJobs = new CleanupJobs();
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
                this._eventDispatcher = new Dispatchable();
                this.addUpdateListener(function (event) {
                    _this2._eventDispatcher.dispatch(event.type, event, _this2);
                });
            }
            return this._eventDispatcher.addListener(eventType, callback);
        }
    }]);
    return StoreObject;
}(Dispatchable);

var BaseStore = function (_Dispatchable2) {
    inherits(BaseStore, _Dispatchable2);

    function BaseStore(objectType) {
        var ObjectWrapper = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : StoreObject;
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        classCallCheck(this, BaseStore);

        var _this3 = possibleConstructorReturn(this, (BaseStore.__proto__ || Object.getPrototypeOf(BaseStore)).call(this));

        _this3.options = options;
        _this3.objectType = objectType.toLowerCase();
        _this3.ObjectWrapper = ObjectWrapper;
        _this3.attachToState();
        return _this3;
    }

    createClass(BaseStore, [{
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

        // Is used by the state object to see which stores need to be loaded first

    }, {
        key: "getDependencies",
        value: function getDependencies() {
            return this.options.dependencies || [];
        }
    }]);
    return BaseStore;
}(Dispatchable);

var GenericObjectStore = function (_BaseStore) {
    inherits(GenericObjectStore, _BaseStore);

    function GenericObjectStore(objectType) {
        var ObjectWrapper = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : StoreObject;
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        classCallCheck(this, GenericObjectStore);

        var _this4 = possibleConstructorReturn(this, (GenericObjectStore.__proto__ || Object.getPrototypeOf(GenericObjectStore)).apply(this, arguments));

        _this4.objects = new Map();
        return _this4;
    }

    createClass(GenericObjectStore, [{
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
                existingObject.applyEvent(refreshEvent);
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
            obj.applyEvent(event);
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

        // Create a fake creation event, to insert the raw object

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

        // Add a listener on all object creation events
        // If fakeExisting, will also pass existing objects to your callback

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

        // Add a listener for any updates to objects in store
        // The callback will receive the object and the event

    }, {
        key: "addUpdateListener",
        value: function addUpdateListener(callback) {
            return this.addListener("update", callback);
        }

        // Add a listener for any object deletions

    }, {
        key: "addDeleteListener",
        value: function addDeleteListener(callback) {
            return this.addListener("delete", callback);
        }
    }]);
    return GenericObjectStore;
}(BaseStore);

var SingletonStore = function (_BaseStore2) {
    inherits(SingletonStore, _BaseStore2);

    function SingletonStore(objectType) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        classCallCheck(this, SingletonStore);
        return possibleConstructorReturn(this, (SingletonStore.__proto__ || Object.getPrototypeOf(SingletonStore)).call(this, objectType, SingletonStore, options));
    }

    createClass(SingletonStore, [{
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
            Object.assign(this, event.data);
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

// Not going to use promises until they mature
var Ajax = {};

Ajax.DEFAULT_OPTIONS = {};

Ajax.DEFAULT_GET_OPTIONS = {
    type: "GET"
};

Ajax.DEFAULT_POST_OPTIONS = {
    type: "POST"
};

Ajax.rawRequest = function (options) {
    // TODO: see this through, this is the last external dependency in the library
    return $.ajax(options);
};

Ajax.request = function (options) {
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
    options = Object.assign({}, Ajax.DEFAULT_GET_OPTIONS, options);

    return Ajax.request(options);
};

function AjaxFetchMixin(BaseStoreClass) {
    return function (_BaseStoreClass) {
        inherits(AjaxFetchMixin, _BaseStoreClass);

        function AjaxFetchMixin() {
            classCallCheck(this, AjaxFetchMixin);
            return possibleConstructorReturn(this, (AjaxFetchMixin.__proto__ || Object.getPrototypeOf(AjaxFetchMixin)).apply(this, arguments));
        }

        createClass(AjaxFetchMixin, [{
            key: "fetch",
            value: function fetch(id, successCallback, errorCallback) {
                var _this2 = this;

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
                        _this2.executeAjaxFetch();
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
                var _this3 = this;

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
                            console.error("Failed to fetch objects of type ", _this3.objectType, ":\n", data.error);
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

                                var obj = _this3.get(_fetchJob.id);
                                if (obj) {
                                    _fetchJob.success(obj);
                                } else {
                                    console.error("Failed to fetch object ", _fetchJob.id, " of type ", _this3.objectType);
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

            //returns an array of ajax requests that have to be executed

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

                var idChunks = splitInChunks(Array.from(idFetchJobs.keys()), maxChunkSize);
                var fetchJobsChunks = splitInChunks(Array.from(idFetchJobs.values()), maxChunkSize);

                var requests = [];
                for (var i = 0; i < idChunks.length; i += 1) {
                    requests.push(this.getFetchRequestObject(idChunks[i], unwrapArray(fetchJobsChunks[i])));
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

                        Ajax.request(requestObject);
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
        inherits(VirtualStoreObjectMixin, _BaseStoreObjectClass);

        function VirtualStoreObjectMixin() {
            classCallCheck(this, VirtualStoreObjectMixin);
            return possibleConstructorReturn(this, (VirtualStoreObjectMixin.__proto__ || Object.getPrototypeOf(VirtualStoreObjectMixin)).apply(this, arguments));
        }

        createClass(VirtualStoreObjectMixin, [{
            key: "hasTemporaryId",

            // TOOD: both of these methods should probaly be implemented in a mixin class (in StoreMixins.js)
            value: function hasTemporaryId() {
                return (typeof this.id === "string" || this.id instanceof String) && this.id.startsWith("temp-");
            }

            // Meant for updating temporary objects that need to exist before being properly created

        }, {
            key: "updateId",
            value: function updateId(newId) {
                if (this.id == newId) {
                    return;
                }
                var oldId = this.id;
                if (!this.hasTemporaryId()) {
                    console.error("This is only meant to replace temporary ids!");
                }
                this.id = newId;
                this.dispatch("updateId", { oldId: oldId });
            }
        }]);
        return VirtualStoreObjectMixin;
    }(BaseStoreObjectClass);
}

// TODO: there's still a bug in this class when not properly matching virtual obj sometimes I think
function VirtualStoreMixin(BaseStoreClass) {
    return function (_BaseStoreClass2) {
        inherits(VirtualStoreMixin, _BaseStoreClass2);

        function VirtualStoreMixin() {
            classCallCheck(this, VirtualStoreMixin);
            return possibleConstructorReturn(this, (VirtualStoreMixin.__proto__ || Object.getPrototypeOf(VirtualStoreMixin)).apply(this, arguments));
        }

        createClass(VirtualStoreMixin, [{
            key: "generateVirtualId",
            value: function generateVirtualId() {
                return this.constructor.generateVirtualId();
            }

            // TODO: we probably shouldn't have getVirtualObject take in an event

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
            value: function applyUpdateObjectId(object, id) {
                if (object.id === id) {
                    return;
                }
                var oldId = object.id;
                object.updateId(id);
                this.objects.delete(oldId);
                this.objects.set(object.id, object);
                this.dispatch("updateObjectId", object, oldId);
            }
        }, {
            key: "applyCreateEvent",
            value: function applyCreateEvent(event) {
                var sendDispatch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

                if (event.virtualId) {
                    var existingVirtualObject = this.getVirtualObject(event);
                    if (existingVirtualObject) {
                        this.applyUpdateObjectId(existingVirtualObject, event.objectId);
                    }
                }

                return get(VirtualStoreMixin.prototype.__proto__ || Object.getPrototypeOf(VirtualStoreMixin.prototype), "applyCreateEvent", this).apply(this, arguments);
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

// TODO: this file is in dire need of a rewrite
var StringStream = function () {
    function StringStream(string, options) {
        classCallCheck(this, StringStream);

        this.string = string;
        this.pointer = 0;
    }

    createClass(StringStream, [{
        key: "done",
        value: function done() {
            return this.pointer >= this.string.length;
        }
    }, {
        key: "advance",
        value: function advance() {
            var steps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

            this.pointer += steps;
        }
    }, {
        key: "char",
        value: function char() {
            var ch = this.string.charAt(this.pointer);
            this.pointer += 1;
            return ch;
        }
    }, {
        key: "whitespace",
        value: function whitespace() {
            var whitespaceChar = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : /\s/;

            var whitespaceStart = this.pointer;

            while (!this.done() && whitespaceChar.test(this.at(0))) {
                this.pointer += 1;
            }

            // Return the actual whitespace in case it is needed
            return this.string.substring(whitespaceStart, this.pointer);
        }

        // Gets first encountered non-whitespace substring

    }, {
        key: "word",
        value: function word() {
            var validChars = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : /\S/;
            var skipWhitespace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            if (skipWhitespace) {
                this.whitespace();
            }

            var wordStart = this.pointer;
            while (!this.done() && validChars.test(this.at(0))) {
                this.pointer += 1;
            }
            return this.string.substring(wordStart, this.pointer);
        }
    }, {
        key: "number",
        value: function number() {
            var skipWhitespace = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            if (skipWhitespace) {
                this.whitespace();
            }

            var nanString = "NaN";
            if (this.startsWith(nanString)) {
                this.advance(nanString.length);
                return NaN;
            }

            var sign = "+";
            if (this.at(0) === "-" || this.at(0) === "+") {
                sign = this.char();
            }

            var infinityString = "Infinity";
            if (this.startsWith(infinityString)) {
                this.advance(infinityString.length);
                return sign === "+" ? Infinity : -Infinity;
            }

            var isDigit = function isDigit(char) {
                return char >= "0" || char <= "9";
            };

            if (this.at(0) === "0" && (this.at(1) === "X" || this.at(1) === "x")) {
                // hexadecimal number
                this.advance(2);

                var isHexDigit = function isHexDigit(char) {
                    return isDigit(char) || char >= "A" && char <= "F" || char >= "a" && char <= "f";
                };

                var _numberStart = this.pointer;
                while (!this.done() && isHexDigit(this.at(0))) {
                    this.pointer += 1;
                }

                return parseInt(sign + this.string.substring(_numberStart), 16);
            }

            var numberStart = this.pointer;
            while (!this.done() && isDigit(this.at(1))) {
                this.pointer += 1;
                if (this.peek === ".") {
                    this.advance(1);
                    while (!this.done() && isDigit(this.at(1))) {
                        this.pointer += 1;
                    }
                    break;
                }
            }
            return parseFloat(sign + this.string.substring(numberStart, this.pointer));
        }

        // Gets everything up to delimiter, usually end of line, limited to maxLength

    }, {
        key: "line",
        value: function line() {
            var delimiter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : /\r*\n/;
            var maxLength = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Infinity;

            if (delimiter instanceof RegExp) {
                // Treat regex differently. It will probably be slower.
                var str = this.string.substring(this.pointer);
                var delimiterMatch = str.match(delimiter);

                var _delimiterIndex = void 0,
                    delimiterLength = void 0;
                if (delimiterMatch === null) {
                    // End of string encountered
                    _delimiterIndex = str.length;
                    delimiterLength = 0;
                } else {
                    _delimiterIndex = delimiterMatch.index;
                    delimiterLength = delimiterMatch[0].length;
                }

                if (_delimiterIndex >= maxLength) {
                    this.pointer += maxLength;
                    return str.substring(0, maxLength);
                }

                this.advance(_delimiterIndex + delimiterLength);
                return str.substring(0, _delimiterIndex);
            }

            var delimiterIndex = this.string.indexOf(delimiter, this.pointer);

            if (delimiterIndex === -1) {
                delimiterIndex = this.string.length;
            }

            if (delimiterIndex - this.pointer > maxLength) {
                var _result = this.string.substring(this.pointer, this.pointer + maxLength);
                this.advance(maxLength);
                return _result;
            }

            var result = this.string.substring(this.pointer, delimiterIndex);
            this.pointer = delimiterIndex + delimiter.length;
            return result;
        }

        // The following methods have no side effects

        // Access char at offset position, relative to current pointer

    }, {
        key: "at",
        value: function at(index) {
            return this.string.charAt(this.pointer + index);
        }
    }, {
        key: "peek",
        value: function peek() {
            var length = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

            return this.string.substring(this.pointer, this.pointer + length);
        }
    }, {
        key: "startsWith",
        value: function startsWith(prefix) {
            if (prefix instanceof RegExp) {
                // we modify the regex to only check for the beginning of the string
                prefix = new RegExp("^" + prefix.toString().slice(1, -1));
                return prefix.test(this.string.substring(this.pointer));
            }
            return this.peek(prefix.length) === prefix;
        }

        // Returns first position of match

    }, {
        key: "search",
        value: function search(pattern) {
            var position = void 0;
            if (pattern instanceof RegExp) {
                position = this.string.substring(this.pointer).search(pattern);
            } else {
                position = this.string.indexOf(pattern, this.pointer) - this.pointer;
            }
            return position < 0 ? -1 : position;
        }
    }, {
        key: "clone",
        value: function clone() {
            var newStream = new this.constructor(this.string);
            newStream.pointer = this.pointer;
            return newStream;
        }
    }]);
    return StringStream;
}();

function kmp(input) {
    if (input.length === 0) {
        return [];
    }

    var prefix = [0];
    var prefixLength = 0;

    for (var i = 1; i < input.length; i += 1) {
        while (prefixLength > 0 && input[i] !== input[prefixLength]) {
            prefixLength = prefix[prefixLength];
        }

        if (input[i] === input[prefixLength]) {
            prefixLength += 1;
        }

        prefix.push(prefixLength);
    }
    return prefix;
}

var ModifierAutomation = function () {
    // build automaton from string
    function ModifierAutomation(options) {
        var _this = this;

        classCallCheck(this, ModifierAutomation);

        this.options = options;
        this.steps = 0;
        this.startNode = {
            value: null,
            startNode: true
        };
        this.node = this.startNode;

        var lastNode = this.startNode;

        var char = options.pattern.charAt(0);
        var startPatternNode = {
            value: char,
            startNode: true
        };

        var patternPrefix = kmp(options.pattern);
        var patternNode = [startPatternNode];

        if (options.leftWhitespace) {
            (function () {
                // We don't want to match if the first char is not preceeded by whitespace
                var whitespaceNode = {
                    value: " ",
                    whitespaceNode: true
                };
                whitespaceNode.next = function (input) {
                    if (input === char) return startPatternNode;
                    return (/\s/.test(input) ? whitespaceNode : _this.startNode
                    );
                };
                lastNode.next = function (input) {
                    return (/\s/.test(input) ? whitespaceNode : _this.startNode
                    );
                };
                _this.node = whitespaceNode;
            })();
        } else {
            lastNode.next = function (input) {
                return input === char ? startPatternNode : _this.startNode;
            };
        }
        lastNode = startPatternNode;

        var _loop = function _loop(i) {
            var char = options.pattern[i];
            var newNode = {
                value: char
            };
            patternNode.push(newNode);

            var backNode = patternPrefix[i - 1] === 0 ? _this.startNode : patternNode[patternPrefix[i - 1] - 1];

            lastNode.next = function (input) {
                if (input === char) {
                    return newNode;
                }

                return backNode.next(input);
            };
            lastNode = newNode;
        };

        for (var i = 1; i < options.pattern.length; i += 1) {
            _loop(i);
        }
        lastNode.patternLastNode = true;

        if (options.captureContent) {
            (function () {
                _this.capture = [];
                var captureNode = {
                    value: "",
                    captureNode: true
                };

                // We treat the first character separately in order to support empty capture
                var char = options.endPattern.charAt(0);
                var endCaptureNode = {
                    value: char
                };

                var endPatternPrefix = kmp(options.endPattern);
                var endPatternNodes = [endCaptureNode];

                lastNode.next = captureNode.next = function (input) {
                    return input === char ? endCaptureNode : captureNode;
                };

                lastNode = endCaptureNode;

                var _loop2 = function _loop2(i) {
                    var char = options.endPattern[i];
                    var newNode = {
                        value: char
                    };
                    endPatternNodes.push(newNode);

                    var backNode = endPatternPrefix[i - 1] === 0 ? captureNode : endPatternNodes[endPatternPrefix[i - 1] - 1];

                    lastNode.next = function (input) {
                        if (input === char) {
                            return newNode;
                        }
                        return backNode.next(input);
                    };
                    lastNode = newNode;
                };

                for (var i = 1; i < options.endPattern.length; i += 1) {
                    _loop2(i);
                }

                lastNode.endPatternLastNode = true;
            })();
        }

        lastNode.endNode = true;
        lastNode.next = function (input) {
            return _this.startNode.next(input);
        };
    }

    createClass(ModifierAutomation, [{
        key: "nextState",
        value: function nextState(input) {
            this.steps += 1;

            this.node = this.node.next(input);

            if (this.node.startNode) {
                this.steps = 0;
                delete this.patternStep;
                delete this.endPatternStep;
            }

            if (this.node.patternLastNode) {
                this.patternStep = this.steps - this.options.pattern.length + 1;
            }
            if (this.node.endPatternLastNode) {
                // TODO(@all): Shouldn't it be this.options.endPattern.length instead of this.options.pattern.length?
                this.endPatternStep = this.steps - this.options.pattern.length + 1;
            }

            return this.node;
        }
    }, {
        key: "done",
        value: function done() {
            return this.node.endNode;
        }
    }]);
    return ModifierAutomation;
}();

var Modifier$1 = function () {
    function Modifier(options) {
        classCallCheck(this, Modifier);
    }

    createClass(Modifier, [{
        key: "modify",
        value: function modify(currentArray, originalString) {
            var matcher = new ModifierAutomation({
                pattern: this.pattern,
                captureContent: this.captureContent, // TODO: some elements should not wrap
                endPattern: this.endPattern,
                leftWhitespace: this.leftWhitespace
            });

            var arrayLocation = 0;
            var currentElement = currentArray[arrayLocation];
            var newArray = [];

            for (var i = 0; i < originalString.length; i += 1) {
                var char = originalString[i];

                if (i >= currentElement.end) {
                    newArray.push(currentElement);

                    arrayLocation += 1;
                    currentElement = currentArray[arrayLocation];
                }

                if (currentElement.isJSX) {
                    matcher.nextState("\\" + char); // prevent char from advancing automata
                    continue;
                }

                matcher.nextState(char);

                if (matcher.done()) {
                    var modifierStart = i - (matcher.steps - matcher.patternStep);
                    var modifierEnd = i - (matcher.steps - matcher.endPatternStep) + this.endPattern.length;

                    var modifierCapture = [];

                    while (newArray.length > 0 && modifierStart <= newArray[newArray.length - 1].start) {
                        var element = newArray.pop();

                        modifierCapture.push(element);
                    }

                    if (newArray.length > 0 && modifierStart < newArray[newArray.length - 1].end) {
                        var _element = newArray.pop();
                        newArray.push({
                            isString: true,
                            start: _element.start,
                            end: modifierStart
                        });
                        modifierCapture.push({
                            isString: true,
                            start: modifierStart,
                            end: _element.end
                        });
                    }

                    if (currentElement.start < modifierStart) {
                        newArray.push({
                            isString: true,
                            start: currentElement.start,
                            end: modifierStart
                        });
                    }
                    modifierCapture.reverse();

                    // this is the end of the capture
                    modifierCapture.push({
                        isString: true,
                        start: Math.max(currentElement.start, modifierStart),
                        end: modifierEnd
                    });

                    newArray.push({
                        content: this.wrap(this.processChildren(modifierCapture, originalString)),
                        start: modifierStart,
                        end: modifierEnd
                    });

                    // We split the current element to in two(one will be captured, one replaces the current element
                    currentElement = {
                        isString: true,
                        start: modifierEnd,
                        end: currentElement.end
                    };
                }
            }

            if (currentElement.start < originalString.length) {
                newArray.push(currentElement);
            }

            return newArray;
        }
    }, {
        key: "processChildren",
        value: function processChildren(capture, originalString) {
            var _this2 = this;

            return capture.map(function (element) {
                return _this2.processChild(element, originalString);
            });
        }
    }, {
        key: "processChild",
        value: function processChild(element, originalString) {
            if (element.isDummy) {
                return "";
            }if (element.isString) {
                return originalString.substring(element.start, element.end);
            } else {
                return element.content;
            }
        }
    }]);
    return Modifier;
}();

function InlineModifierMixin(BaseModifierClass) {
    return function (_BaseModifierClass) {
        inherits(InlineModifier, _BaseModifierClass);

        function InlineModifier(options) {
            classCallCheck(this, InlineModifier);

            var _this3 = possibleConstructorReturn(this, (InlineModifier.__proto__ || Object.getPrototypeOf(InlineModifier)).call(this, options));

            _this3.captureContent = true;
            return _this3;
        }

        createClass(InlineModifier, [{
            key: "wrap",
            value: function wrap(content) {
                if (content.length > 0) {
                    content[0] = content[0].substring(content[0].indexOf(this.pattern) + this.pattern.length);

                    var lastElement = content.pop();
                    lastElement = lastElement.substring(0, lastElement.lastIndexOf(this.endPattern));
                    content.push(lastElement);

                    return {
                        tag: this.tag,
                        children: content
                    };
                }
            }
        }]);
        return InlineModifier;
    }(BaseModifierClass);
}

function LineStartModifierMixin(BaseModifierClass) {
    return function (_BaseModifierClass2) {
        inherits(LineStartModifier, _BaseModifierClass2);

        function LineStartModifier(options) {
            classCallCheck(this, LineStartModifier);

            var _this4 = possibleConstructorReturn(this, (LineStartModifier.__proto__ || Object.getPrototypeOf(LineStartModifier)).call(this, options));

            _this4.groupConsecutive = false;
            return _this4;
        }

        createClass(LineStartModifier, [{
            key: "isValidElement",
            value: function isValidElement(element) {
                return element.content && element.content.tag === "p" && element.content.children.length > 0 && !element.content.children[0].tag && // child is text string
                element.content.children[0].startsWith(this.pattern);
            }
        }, {
            key: "modify",
            value: function modify(currentArray, originalString) {
                var newArray = [];

                for (var i = 0; i < currentArray.length; i += 1) {
                    var element = currentArray[i];
                    if (this.isValidElement(element)) {
                        if (this.groupConsecutive) {
                            var elements = [];

                            var start = void 0,
                                end = void 0;
                            start = currentArray[i].start;
                            while (i < currentArray.length && this.isValidElement(currentArray[i])) {
                                elements.push(this.wrapItem(currentArray[i].content.children));

                                i += 1;
                            }
                            // we make sure no elements are skipped
                            i -= 1;

                            end = currentArray[i].end;

                            newArray.push({
                                start: start,
                                end: end,
                                content: this.wrap(elements)
                            });
                        } else {
                            // We use object assign here to keep the start and end properties. (Maybe along with others)
                            var newElement = Object.assign({}, element, {
                                content: this.wrap(element.content.children)
                            });
                            newArray.push(newElement);
                        }
                    } else {
                        newArray.push(element);
                    }
                }
                return newArray;
            }
        }, {
            key: "wrapItem",
            value: function wrapItem(content) {
                var firstChild = content[0];

                var patternIndex = firstChild.indexOf(this.pattern);
                var patternEnd = patternIndex + this.pattern.length;

                content[0] = firstChild.substring(patternEnd);

                return {
                    tag: this.itemTag,
                    children: content
                };
            }
        }, {
            key: "wrap",
            value: function wrap(content) {
                return {
                    tag: this.tag,
                    children: content
                };
            }
        }]);
        return LineStartModifier;
    }(BaseModifierClass);
}

function RawContentModifierMixin(BaseModifierClass) {
    return function (_BaseModifierClass3) {
        inherits(RawContentModifier, _BaseModifierClass3);

        function RawContentModifier() {
            classCallCheck(this, RawContentModifier);
            return possibleConstructorReturn(this, (RawContentModifier.__proto__ || Object.getPrototypeOf(RawContentModifier)).apply(this, arguments));
        }

        createClass(RawContentModifier, [{
            key: "processChildren",
            value: function processChildren(children, originalString) {
                if (children.length === 0) {
                    return [];
                }

                return [originalString.substring(children[0].start, children[children.length - 1].end)];
            }
        }]);
        return RawContentModifier;
    }(BaseModifierClass);
}

var CodeModifier = function (_Modifier) {
    inherits(CodeModifier, _Modifier);

    function CodeModifier(options) {
        classCallCheck(this, CodeModifier);

        var _this6 = possibleConstructorReturn(this, (CodeModifier.__proto__ || Object.getPrototypeOf(CodeModifier)).call(this, options));

        _this6.pattern = "```";
        _this6.endPattern = "\n```";
        _this6.leftWhitespace = true;
        _this6.captureContent = true;
        return _this6;
    }

    createClass(CodeModifier, [{
        key: "processChildren",
        value: function processChildren(capture, originalString) {
            this.codeOptions = null;
            if (capture.length > 0) {
                var codeBlock = originalString.substring(capture[0].start, capture[capture.length - 1].end);

                codeBlock = codeBlock.substring(codeBlock.indexOf(this.pattern) + this.pattern.length);
                codeBlock = codeBlock.substring(0, codeBlock.lastIndexOf(this.endPattern));

                var firstLineEnd = codeBlock.indexOf("\n") + 1;
                var firstLine = codeBlock.substring(0, firstLineEnd).trim();
                codeBlock = codeBlock.substring(firstLineEnd);

                if (firstLine.length > 0) {
                    this.codeOptions = {};
                    var lineStream = new StringStream(firstLine);
                    this.codeOptions.aceMode = lineStream.word();

                    Object.assign(this.codeOptions, MarkupParser.parseOptions(lineStream));
                }

                return codeBlock;
            }
            return "";
        }
    }, {
        key: "wrap",
        value: function wrap(content, options) {
            var codeHighlighter = {
                tag: "CodeSnippet",
                value: content
            };

            var codeOptions = {
                aceMode: "c_cpp",
                maxLines: 32
            };

            if (this.codeOptions) {
                Object.assign(codeOptions, this.codeOptions);
                delete this.codeOptions;
            }

            Object.assign(codeOptions, codeHighlighter);
            return codeOptions;
        }
    }]);
    return CodeModifier;
}(Modifier$1);

var HeaderModifier = function (_LineStartModifierMix) {
    inherits(HeaderModifier, _LineStartModifierMix);

    function HeaderModifier(options) {
        classCallCheck(this, HeaderModifier);

        var _this7 = possibleConstructorReturn(this, (HeaderModifier.__proto__ || Object.getPrototypeOf(HeaderModifier)).call(this, options));

        _this7.pattern = "#";
        return _this7;
    }

    createClass(HeaderModifier, [{
        key: "wrap",
        value: function wrap(content) {
            var firstChild = content[0];

            var hashtagIndex = firstChild.indexOf("#");
            var hashtagEnd = hashtagIndex + 1;
            var headerLevel = 1;

            var nextChar = firstChild.charAt(hashtagEnd);
            if (nextChar >= "1" && nextChar <= "6") {
                headerLevel = parseInt(nextChar);
                hashtagEnd += 1;
            } else if (nextChar === "#") {
                while (headerLevel < 6 && firstChild.charAt(hashtagEnd) === "#") {
                    headerLevel += 1;
                    hashtagEnd += 1;
                }
            }

            content[0] = firstChild.substring(hashtagEnd);
            return {
                tag: "h" + headerLevel,
                children: content
            };
        }
    }]);
    return HeaderModifier;
}(LineStartModifierMixin(Modifier$1));

var HorizontalRuleModifier = function (_LineStartModifierMix2) {
    inherits(HorizontalRuleModifier, _LineStartModifierMix2);

    function HorizontalRuleModifier(options) {
        classCallCheck(this, HorizontalRuleModifier);

        var _this8 = possibleConstructorReturn(this, (HorizontalRuleModifier.__proto__ || Object.getPrototypeOf(HorizontalRuleModifier)).call(this, options));

        _this8.pattern = "---";
        return _this8;
    }

    createClass(HorizontalRuleModifier, [{
        key: "wrap",
        value: function wrap(content) {
            return {
                tag: "hr"
            };
        }
    }]);
    return HorizontalRuleModifier;
}(LineStartModifierMixin(Modifier$1));

var UnorderedListModifier = function (_LineStartModifierMix3) {
    inherits(UnorderedListModifier, _LineStartModifierMix3);

    function UnorderedListModifier(options) {
        classCallCheck(this, UnorderedListModifier);

        var _this9 = possibleConstructorReturn(this, (UnorderedListModifier.__proto__ || Object.getPrototypeOf(UnorderedListModifier)).call(this, options));

        _this9.tag = "ul";
        _this9.itemTag = "li";
        _this9.pattern = "- ";
        _this9.groupConsecutive = true;
        return _this9;
    }

    return UnorderedListModifier;
}(LineStartModifierMixin(Modifier$1));

var OrderedListModifier = function (_LineStartModifierMix4) {
    inherits(OrderedListModifier, _LineStartModifierMix4);

    function OrderedListModifier(options) {
        classCallCheck(this, OrderedListModifier);

        var _this10 = possibleConstructorReturn(this, (OrderedListModifier.__proto__ || Object.getPrototypeOf(OrderedListModifier)).call(this, options));

        _this10.tag = "ol";
        _this10.itemTag = "li";
        _this10.pattern = "1. ";
        _this10.groupConsecutive = true;
        return _this10;
    }

    return OrderedListModifier;
}(LineStartModifierMixin(Modifier$1));

var ParagraphModifier = function (_Modifier2) {
    inherits(ParagraphModifier, _Modifier2);

    function ParagraphModifier() {
        classCallCheck(this, ParagraphModifier);
        return possibleConstructorReturn(this, (ParagraphModifier.__proto__ || Object.getPrototypeOf(ParagraphModifier)).apply(this, arguments));
    }

    createClass(ParagraphModifier, [{
        key: "modify",
        value: function modify(currentArray, originalString) {
            var newArray = [];
            var capturedContent = [];
            var arrayLocation = 0;
            var currentElement = currentArray[arrayLocation];
            var lineStart = 0;

            for (var i = 0; i < originalString.length; i += 1) {
                if (i >= currentElement.end) {
                    capturedContent.push(currentElement);
                    arrayLocation += 1;
                    currentElement = currentArray[arrayLocation];
                }

                if (currentElement.isJSX) {
                    continue;
                }

                if (originalString[i] === "\n") {
                    if (currentElement.start < i) {
                        capturedContent.push({
                            isString: true,
                            start: currentElement.start,
                            end: i
                        });
                    }

                    newArray.push({
                        content: this.wrap(this.processChildren(capturedContent, originalString)),
                        start: lineStart,
                        end: i + 1
                    });
                    capturedContent = [];
                    lineStart = i + 1;

                    if (originalString[i + 1] === "\n") {
                        var start = void 0,
                            end = void 0;
                        start = i;

                        while (i + 1 < originalString.length && originalString[i + 1] === "\n") {
                            i += 1;
                        }
                        end = i + 1;

                        newArray.push({
                            content: {
                                tag: "br"
                            },
                            start: start,
                            end: end
                        });

                        lineStart = i + 1;
                    } else {
                        // TODO: these dummies break code. Refactor!
                        // newArray.push({
                        //     isDummy: true,
                        //     start: i,
                        //     end: i + 1,
                        // });
                    }

                    currentElement = {
                        isString: true,
                        start: lineStart,
                        end: currentElement.end
                    };
                }
            }

            if (currentElement.start < originalString.length) {
                capturedContent.push(currentElement);
            }
            if (capturedContent.length > 0) {
                newArray.push({
                    content: this.wrap(this.processChildren(capturedContent, originalString)),
                    start: lineStart,
                    end: originalString.length
                });
            }
            return newArray;
        }
    }, {
        key: "wrap",
        value: function wrap(capture) {
            return {
                tag: "p",
                children: capture
            };
        }
    }]);
    return ParagraphModifier;
}(Modifier$1);

var StrongModifier = function (_InlineModifierMixin) {
    inherits(StrongModifier, _InlineModifierMixin);

    function StrongModifier(options) {
        classCallCheck(this, StrongModifier);

        var _this12 = possibleConstructorReturn(this, (StrongModifier.__proto__ || Object.getPrototypeOf(StrongModifier)).call(this, options));

        _this12.leftWhitespace = true;
        _this12.pattern = "*";
        _this12.endPattern = "*";
        _this12.tag = "strong";
        return _this12;
    }

    return StrongModifier;
}(InlineModifierMixin(Modifier$1));

var ItalicModifier = function (_InlineModifierMixin2) {
    inherits(ItalicModifier, _InlineModifierMixin2);

    function ItalicModifier(options) {
        classCallCheck(this, ItalicModifier);

        var _this13 = possibleConstructorReturn(this, (ItalicModifier.__proto__ || Object.getPrototypeOf(ItalicModifier)).call(this, options));

        _this13.leftWhitespace = true;
        _this13.pattern = "/";
        _this13.endPattern = "/";
        _this13.tag = "em";
        return _this13;
    }

    return ItalicModifier;
}(InlineModifierMixin(Modifier$1));

var InlineCodeModifier = function (_RawContentModifierMi) {
    inherits(InlineCodeModifier, _RawContentModifierMi);

    function InlineCodeModifier(options) {
        classCallCheck(this, InlineCodeModifier);

        var _this14 = possibleConstructorReturn(this, (InlineCodeModifier.__proto__ || Object.getPrototypeOf(InlineCodeModifier)).call(this, options));

        _this14.pattern = "`";
        _this14.endPattern = "`";
        _this14.tag = "code";
        return _this14;
    }

    createClass(InlineCodeModifier, [{
        key: "processChildren",
        value: function processChildren(children, originalString) {
            if (children.length === 0) {
                return [];
            }

            return [originalString.substring(children[0].start, children[children.length - 1].end)];
        }
    }]);
    return InlineCodeModifier;
}(RawContentModifierMixin(InlineModifierMixin(Modifier$1)));

var InlineVarModifier = function (_RawContentModifierMi2) {
    inherits(InlineVarModifier, _RawContentModifierMi2);

    function InlineVarModifier(options) {
        classCallCheck(this, InlineVarModifier);

        var _this15 = possibleConstructorReturn(this, (InlineVarModifier.__proto__ || Object.getPrototypeOf(InlineVarModifier)).call(this, options));

        _this15.pattern = "$";
        _this15.endPattern = "$";
        _this15.tag = "var";
        return _this15;
    }

    return InlineVarModifier;
}(RawContentModifierMixin(InlineModifierMixin(Modifier$1)));

var InlineLatexModifier = function (_RawContentModifierMi3) {
    inherits(InlineLatexModifier, _RawContentModifierMi3);

    function InlineLatexModifier(options) {
        classCallCheck(this, InlineLatexModifier);

        var _this16 = possibleConstructorReturn(this, (InlineLatexModifier.__proto__ || Object.getPrototypeOf(InlineLatexModifier)).call(this, options));

        _this16.pattern = "$$";
        _this16.endPattern = "$$";
        _this16.tag = "Latex";
        return _this16;
    }

    return InlineLatexModifier;
}(RawContentModifierMixin(InlineModifierMixin(Modifier$1)));

var LinkModifier = function (_Modifier3) {
    inherits(LinkModifier, _Modifier3);

    function LinkModifier() {
        classCallCheck(this, LinkModifier);
        return possibleConstructorReturn(this, (LinkModifier.__proto__ || Object.getPrototypeOf(LinkModifier)).apply(this, arguments));
    }

    createClass(LinkModifier, [{
        key: "modify",
        value: function modify(currentArray, originalString) {
            var _this18 = this;

            var newArray = [];
            var arrayLocation = 0;
            var currentElement = currentArray[arrayLocation];
            var lineStart = 0;

            var checkAndAddUrl = function checkAndAddUrl(start, end) {
                var substr = originalString.substring(start, end);
                if (_this18.constructor.isCorrectUrl(substr)) {
                    if (currentElement.start < start) {
                        newArray.push({
                            isString: true,
                            start: currentElement.start,
                            end: start
                        });
                    }

                    newArray.push({
                        isJSX: true,
                        content: {
                            tag: "a",
                            href: substr,
                            children: [_this18.constructor.trimProtocol(substr)],
                            target: "_blank"
                        },
                        start: start,
                        end: end
                    });

                    currentElement = {
                        isString: true,
                        start: end,
                        end: currentElement.end
                    };
                }
            };

            for (var i = 0; i < originalString.length; i += 1) {
                if (i >= currentElement.end) {
                    newArray.push(currentElement);
                    arrayLocation += 1;
                    currentElement = currentArray[arrayLocation];
                }

                if (currentElement.isJSX) {
                    continue;
                }

                if (/\s/.test(originalString[i])) {
                    checkAndAddUrl(lineStart, i);
                    lineStart = i + 1;
                }
            }
            if (lineStart < originalString.length) {
                checkAndAddUrl(lineStart, originalString.length);
            }
            if (currentElement.start < originalString.length) {
                newArray.push(currentElement);
            }
            return newArray;
        }
    }], [{
        key: "isCorrectUrl",
        value: function isCorrectUrl(str) {
            if (str.startsWith("http://") || str.startsWith("https://")) {
                return true;
            }
        }
    }, {
        key: "trimProtocol",
        value: function trimProtocol(str) {
            if (str[4] === 's') {
                return str.substring(8, str.length);
            }
            return str.substring(7, str.length);
        }
    }]);
    return LinkModifier;
}(Modifier$1);

var MarkupModifier = Modifier$1;

var MarkupParser = function () {
    function MarkupParser(options) {
        classCallCheck(this, MarkupParser);

        options = options || {};

        this.modifiers = options.modifiers || this.constructor.modifiers;
        this.uiElements = options.uiElements || new Map();
    }

    createClass(MarkupParser, [{
        key: "parse",
        value: function parse(content) {
            if (!content) return [];

            var result = [];

            var arr = this.parseUIElements(content);

            for (var i = this.modifiers.length - 1; i >= 0; i -= 1) {
                var modifier = this.modifiers[i];

                arr = modifier.modify(arr, content);
            }

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = arr[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var el = _step.value;

                    if (el.isDummy) {
                        // just skip it
                    } else if (el.isString) {
                        result.push(content.substring(el.start, el.end));
                    } else {
                        result.push(el.content);
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

            return result;
        }
    }, {
        key: "parseUIElements",
        value: function parseUIElements(content) {
            var stream = new StringStream(content);

            var result = [];
            var textStart = 0;

            while (!stream.done()) {
                var char = stream.char();

                if (char === "<" && /[a-zA-Z]/.test(stream.at(0))) {
                    stream.pointer -= 1; //step back to beginning of ui element
                    var elementStart = stream.pointer;
                    var uiElement = void 0;
                    try {
                        uiElement = this.parseUIElement(stream);
                    } catch (e) {
                        // failed to parse jsx element
                        continue;
                    }

                    if (this.uiElements.has(uiElement.tag)) {
                        result.push({
                            isString: true,
                            start: textStart,
                            end: elementStart
                        });

                        result.push({
                            content: uiElement,
                            isJSX: true,
                            start: elementStart,
                            end: stream.pointer
                        });
                        textStart = stream.pointer;
                    }
                }
            }

            if (textStart < content.length) {
                result.push({
                    isString: true,
                    start: textStart,
                    end: content.length
                });
            }

            return result;
        }
    }, {
        key: "parseUIElement",
        value: function parseUIElement(stream) {
            var delimiter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : /\/?>/;

            // content should be of type <ClassName option1="string" option2={{jsonObject: true}} />
            // TODO: support nested elements like <ClassName><NestedClass /></ClassName>

            stream.whitespace();
            if (stream.done()) {
                return null;
            }

            if (stream.at(0) !== "<") {
                throw Error("Invalid UIElement declaration.");
            }

            var result = {};

            stream.char(); // skip the '<'

            result.tag = stream.word();
            stream.whitespace();

            Object.assign(result, this.parseOptions(stream, delimiter));
            stream.line(delimiter);

            return result;
        }
    }, {
        key: "parseOptions",
        value: function parseOptions(stream, optionsEnd) {
            return this.constructor.parseOptions(stream, optionsEnd);
        }

        // optionsEnd cannot include whitespace or start with '='

    }, {
        key: "parseTextLine",
        value: function parseTextLine(stream) {
            var lastModifier = new Map();

            var capturedContent = [];

            // This will always be set to the last closed modifier
            var capturedEnd = -1;

            var textStart = stream.pointer;
            var contentStart = stream.pointer;

            while (!stream.done()) {
                if (stream.startsWith(/\s+\r*\n/)) {
                    // end of line, stop here
                    break;
                }

                if (stream.at(0) === "<") {
                    capturedContent.push({
                        content: stream.string.substring(contentStart, stream.pointer),
                        start: contentStart,
                        end: stream.pointer
                    });
                    var uiElementStart = stream.pointer;
                    var uiElement = this.parseUIElement(stream, /\/*>/);
                    capturedContent.push({
                        content: uiElement,
                        start: uiElementStart,
                        end: stream.pointer
                    });
                    contentStart = stream.pointer;
                    continue;
                }

                var char = stream.char();

                if (char === "\\") {
                    // escape next character
                    char += stream.char();
                }
            }

            var remainingContent = stream.string.substring(textStart, stream.pointer);
            if (remainingContent.length > 0) {
                capturedContent.push(remainingContent);
            }
            stream.line(); // delete line endings

            return capturedContent;
        }
    }], [{
        key: "parseOptions",
        value: function parseOptions(stream, optionsEnd) {
            var options = {};

            stream.whitespace();

            while (!stream.done()) {
                // argument name is anything that comes before whitespace or '='
                stream.whitespace();

                var validOptionName = /[\w$]/;
                var optionName = void 0;
                if (validOptionName.test(stream.at(0))) {
                    optionName = stream.word(validOptionName);
                }

                stream.whitespace();

                if (optionsEnd && stream.search(optionsEnd) === 0) {
                    options[optionName] = true;
                    break;
                }
                if (!optionName) {
                    throw Error("Invalid option name");
                }

                if (stream.peek() === "=") {
                    stream.char();
                    stream.whitespace();

                    if (stream.done()) {
                        throw Error("No argument given for option: " + optionName);
                    }

                    if (stream.peek() === '"') {
                        // We have a string here
                        var optionString = "";
                        var foundStringEnd = false;

                        stream.char();
                        while (!stream.done()) {
                            var char = stream.char();
                            if (char === '"') {
                                foundStringEnd = true;
                                break;
                            }
                            optionString += char;
                        }

                        if (!foundStringEnd) {
                            // You did not close that string
                            throw Error("Argument string not closed: " + optionString);
                        }
                        options[optionName] = optionString;
                    } else if (stream.peek() === '{') {
                        // Once you pop, the fun don't stop
                        var bracketCount = 0;

                        var validJSON = false;
                        var jsonString = "";
                        stream.char();

                        while (!stream.done()) {
                            var _char = stream.char();
                            if (_char === '{') {
                                bracketCount += 1;
                            } else if (_char === '}') {
                                if (bracketCount > 0) {
                                    bracketCount -= 1;
                                } else {
                                    // JSON ends here
                                    options[optionName] = jsonString.length > 0 ? this.parseJSON5(jsonString) : undefined;
                                    validJSON = true;
                                    break;
                                }
                            }
                            jsonString += _char;
                        }
                        if (!validJSON) {
                            throw Error("Invalid JSON argument for option: " + optionName + ". Input: " + jsonString);
                        }
                    } else {
                        throw Error("Invalid argument for option: " + optionName + ". Need string or JSON.");
                    }
                } else {
                    options[optionName] = true;
                }
                stream.whitespace();
            }

            return options;
        }
    }]);
    return MarkupParser;
}();

MarkupParser.modifiers = [new CodeModifier(), new HeaderModifier(), new HorizontalRuleModifier(), new UnorderedListModifier(), new OrderedListModifier(), new ParagraphModifier(), new InlineCodeModifier(), new InlineLatexModifier(), new InlineVarModifier(), new StrongModifier(), new ItalicModifier(), new LinkModifier()];

// json5.js
// This file is based directly off of Douglas Crockford's json_parse.js:
// https://github.com/douglascrockford/JSON-js/blob/master/json_parse.js
MarkupParser.parseJSON5 = function () {
    // This is a function that can parse a JSON5 text, producing a JavaScript
    // data structure. It is a simple, recursive descent parser. It does not use
    // eval or regular expressions, so it can be used as a model for implementing
    // a JSON5 parser in other languages.

    // We are defining the function inside of another function to avoid creating
    // global variables.

    var at = void 0,
        // The index of the current character
    lineNumber = void 0,
        // The current line number
    columnNumber = void 0,
        // The current column number
    ch = void 0; // The current character
    var escapee = {
        "'": "'",
        '"': '"',
        '\\': '\\',
        '/': '/',
        '\n': '', // Replace escaped newlines in strings w/ empty string
        b: '\b',
        f: '\f',
        n: '\n',
        r: '\r',
        t: '\t'
    };
    var text = void 0;

    var renderChar = function renderChar(chr) {
        return chr === '' ? 'EOF' : "'" + chr + "'";
    };

    var error = function error(m) {
        // Call error when something is wrong.

        var error = new SyntaxError();
        // beginning of message suffix to agree with that provided by Gecko - see https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
        error.message = m + " at line " + lineNumber + " column " + columnNumber + " of the JSON5 data. Still to read: " + JSON.stringify(text.substring(at - 1, at + 19));
        error.at = at;
        // These two property names have been chosen to agree with the ones in Gecko, the only popular
        // environment which seems to supply this info on JSON.parse
        error.lineNumber = lineNumber;
        error.columnNumber = columnNumber;
        throw error;
    };

    var next = function next(c) {
        // If a c parameter is provided, verify that it matches the current character.

        if (c && c !== ch) {
            error("Expected " + renderChar(c) + " instead of " + renderChar(ch));
        }

        // Get the next character. When there are no more characters,
        // return the empty string.

        ch = text.charAt(at);
        at++;
        columnNumber++;
        if (ch === '\n' || ch === '\r' && peek() !== '\n') {
            lineNumber++;
            columnNumber = 0;
        }
        return ch;
    };

    var peek = function peek() {
        // Get the next character without consuming it or
        // assigning it to the ch varaible.

        return text.charAt(at);
    };

    var identifier = function identifier() {
        // Parse an identifier. Normally, reserved words are disallowed here, but we
        // only use this for unquoted object keys, where reserved words are allowed,
        // so we don't check for those here. References:
        // - http://es5.github.com/#x7.6
        // - https://developer.mozilla.org/en/Core_JavaScript_1.5_Guide/Core_Language_Features#Variables
        // - http://docstore.mik.ua/orelly/webprog/jscript/ch02_07.htm
        // TODO Identifiers can have Unicode "letters" in them; add support for those.
        var key = ch;

        // Identifiers must start with a letter, _ or $.
        if (ch !== '_' && ch !== '$' && (ch < 'a' || ch > 'z') && (ch < 'A' || ch > 'Z')) {
            error("Bad identifier as unquoted key");
        }

        // Subsequent characters can contain digits.
        while (next() && (ch === '_' || ch === '$' || ch >= 'a' && ch <= 'z' || ch >= 'A' && ch <= 'Z' || ch >= '0' && ch <= '9')) {
            key += ch;
        }

        return key;
    };

    var number = function number() {
        // Parse a number value.
        var number,
            sign = '',
            string = '',
            base = 10;

        if (ch === '-' || ch === '+') {
            sign = ch;
            next(ch);
        }

        // support for Infinity (could tweak to allow other words):
        if (ch === 'I') {
            number = word();
            if (typeof number !== 'number' || isNaN(number)) {
                error('Unexpected word for number');
            }
            return sign === '-' ? -number : number;
        }

        // support for NaN
        if (ch === 'N') {
            number = word();
            if (!isNaN(number)) {
                error('expected word to be NaN');
            }
            // ignore sign as -NaN also is NaN
            return number;
        }

        if (ch === '0') {
            string += ch;
            next();
            if (ch === 'x' || ch === 'X') {
                string += ch;
                next();
                base = 16;
            } else if (ch >= '0' && ch <= '9') {
                error('Octal literal');
            }
        }

        switch (base) {
            case 10:
                while (ch >= '0' && ch <= '9') {
                    string += ch;
                    next();
                }
                if (ch === '.') {
                    string += '.';
                    while (next() && ch >= '0' && ch <= '9') {
                        string += ch;
                    }
                }
                if (ch === 'e' || ch === 'E') {
                    string += ch;
                    next();
                    if (ch === '-' || ch === '+') {
                        string += ch;
                        next();
                    }
                    while (ch >= '0' && ch <= '9') {
                        string += ch;
                        next();
                    }
                }
                break;
            case 16:
                while (ch >= '0' && ch <= '9' || ch >= 'A' && ch <= 'F' || ch >= 'a' && ch <= 'f') {
                    string += ch;
                    next();
                }
                break;
        }

        if (sign === '-') {
            number = -string;
        } else {
            number = +string;
        }

        if (!isFinite(number)) {
            error("Bad number");
        } else {
            return number;
        }
    };

    var string = function string() {
        // Parse a string value.
        var hex = void 0,
            i = void 0,
            string = '',
            uffff = void 0;
        var delim = void 0; // double quote or single quote

        // When parsing for string values, we must look for ' or " and \ characters.

        if (ch === '"' || ch === "'") {
            delim = ch;
            while (next()) {
                if (ch === delim) {
                    next();
                    return string;
                } else if (ch === '\\') {
                    next();
                    if (ch === 'u') {
                        uffff = 0;
                        for (i = 0; i < 4; i += 1) {
                            hex = parseInt(next(), 16);
                            if (!isFinite(hex)) {
                                break;
                            }
                            uffff = uffff * 16 + hex;
                        }
                        string += String.fromCharCode(uffff);
                    } else if (ch === '\r') {
                        if (peek() === '\n') {
                            next();
                        }
                    } else if (typeof escapee[ch] === 'string') {
                        string += escapee[ch];
                    } else {
                        break;
                    }
                } else if (ch === '\n') {
                    // unescaped newlines are invalid; see:
                    // https://github.com/aseemk/json5/issues/24
                    // TODO this feels special-cased; are there other
                    // invalid unescaped chars?
                    break;
                } else {
                    string += ch;
                }
            }
        }
        error("Bad string");
    };

    var inlineComment = function inlineComment() {
        // Skip an inline comment, assuming this is one. The current character should
        // be the second / character in the // pair that begins this inline comment.
        // To finish the inline comment, we look for a newline or the end of the text.

        if (ch !== '/') {
            error("Not an inline comment");
        }

        do {
            next();
            if (ch === '\n' || ch === '\r') {
                next();
                return;
            }
        } while (ch);
    };

    var blockComment = function blockComment() {
        // Skip a block comment, assuming this is one. The current character should be
        // the * character in the /* pair that begins this block comment.
        // To finish the block comment, we look for an ending */ pair of characters,
        // but we also watch for the end of text before the comment is terminated.

        if (ch !== '*') {
            error("Not a block comment");
        }

        do {
            next();
            while (ch === '*') {
                next('*');
                if (ch === '/') {
                    next('/');
                    return;
                }
            }
        } while (ch);

        error("Unterminated block comment");
    };

    var comment = function comment() {
        // Skip a comment, whether inline or block-level, assuming this is one.
        // Comments always begin with a / character.

        if (ch !== '/') {
            error("Not a comment");
        }

        next('/');

        if (ch === '/') {
            inlineComment();
        } else if (ch === '*') {
            blockComment();
        } else {
            error("Unrecognized comment");
        }
    };

    var white = function white() {
        // Skip whitespace and comments.
        // Note that we're detecting comments by only a single / character.
        // This works since regular expressions are not valid JSON(5), but this will
        // break if there are other valid values that begin with a / character!

        while (ch) {
            if (ch === '/') {
                comment();
            } else if (/\s/.test(ch)) {
                next();
            } else {
                return;
            }
        }
    };

    var word = function word() {
        // true, false, or null.

        switch (ch) {
            case 't':
                next('t');
                next('r');
                next('u');
                next('e');
                return true;
            case 'f':
                next('f');
                next('a');
                next('l');
                next('s');
                next('e');
                return false;
            case 'n':
                next('n');
                next('u');
                next('l');
                next('l');
                return null;
            case 'I':
                next('I');
                next('n');
                next('f');
                next('i');
                next('n');
                next('i');
                next('t');
                next('y');
                return Infinity;
            case 'N':
                next('N');
                next('a');
                next('N');
                return NaN;
        }
        error("Unexpected " + renderChar(ch));
    };

    var value = void 0;

    var array = function array() {
        // Parse an array value.
        var array = [];

        if (ch === '[') {
            next('[');
            white();
            while (ch) {
                if (ch === ']') {
                    next(']');
                    return array; // Potentially empty array
                }
                // ES5 allows omitting elements in arrays, e.g. [,] and
                // [,null]. We don't allow this in JSON5.
                if (ch === ',') {
                    error("Missing array element");
                } else {
                    array.push(value());
                }
                white();
                // If there's no comma after this value, this needs to
                // be the end of the array.
                if (ch !== ',') {
                    next(']');
                    return array;
                }
                next(',');
                white();
            }
        }
        error("Bad array");
    };

    var object = function object() {
        // Parse an object value.

        var key,
            object = {};

        if (ch === '{') {
            next('{');
            white();
            while (ch) {
                if (ch === '}') {
                    next('}');
                    return object; // Potentially empty object
                }

                // Keys can be unquoted. If they are, they need to be
                // valid JS identifiers.
                if (ch === '"' || ch === "'") {
                    key = string();
                } else {
                    key = identifier();
                }

                white();
                next(':');
                object[key] = value();
                white();
                // If there's no comma after this pair, this needs to be
                // the end of the object.
                if (ch !== ',') {
                    next('}');
                    return object;
                }
                next(',');
                white();
            }
        }
        error("Bad object");
    };

    value = function value() {
        // Parse a JSON value. It could be an object, an array, a string, a number,
        // or a word.

        white();
        switch (ch) {
            case '{':
                return object();
            case '[':
                return array();
            case '"':
            case "'":
                return string();
            case '-':
            case '+':
            case '.':
                return number();
            default:
                return ch >= '0' && ch <= '9' ? number() : word();
        }
    };

    // Return the json_parse function. It will have access to all of the above
    // functions and variables.

    return function (source, reviver) {
        var result;

        text = String(source);
        at = 0;
        lineNumber = 1;
        columnNumber = 1;
        ch = ' ';
        result = value();
        white();
        if (ch) {
            error("Syntax error");
        }

        // If there is a reviver function, we recursively walk the new structure,
        // passing each name/value pair to the reviver function for possible
        // transformation, starting with a temporary root object that holds the result
        // in an empty key. If there is not a reviver function, we simply return the
        // result.

        return typeof reviver === 'function' ? function walk(holder, key) {
            var k,
                v,
                value = holder[key];
            if (value && (typeof value === "undefined" ? "undefined" : _typeof(value)) === 'object') {
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = walk(value, k);
                        if (v !== undefined) {
                            value[k] = v;
                        } else {
                            delete value[k];
                        }
                    }
                }
            }
            return reviver.call(holder, key, value);
        }({ '': result }, '') : result;
    };
}();

function TestStringStream() {
    var tests = [];

    tests.push(function () {
        var ss = new StringStream("Ala bala    portocala");

        var temp = void 0;

        temp = ss.char();
        if (temp !== "A") {
            throw Error("char seems to fail. Expected: 'A' , got '" + temp + "'");
        }

        temp = ss.word();
        if (temp !== "la") {
            throw Error("word seems to fail. Expected: 'la' , got '" + temp + "'");
        }

        temp = ss.word();
        if (temp !== "bala") {
            throw Error("word seems to fail. Expected: 'bala' , got '" + temp + "'");
        }

        temp = ss.word();
        if (temp !== "portocala") {
            throw Error("word seems to fail. Expected: 'portocala' , got '" + temp + "'");
        }
    });

    tests.push(function () {
        var ss = new StringStream("Ala bala    portocala");

        var temp = void 0;

        temp = ss.word();
        if (temp !== "Ala") {
            throw Error("word seems to fail. Expected: 'Ala' , got '" + temp + "'");
        }

        temp = ss.char();
        if (temp !== " ") {
            throw Error("word seems to fail. Expected: ' ' , got '" + temp + "'");
        }

        temp = ss.line();
        if (temp !== "bala    portocala") {
            throw Error("line seems to fail. Expected: 'bala    portocala' , got '" + temp + "'");
        }
    });

    tests.push(function () {
        var ss = new StringStream("Buna bate toba\n Bunica bate tare\nBunica bate tobaaa \nCu maciuca-n casa mare!");

        var temp = void 0;

        temp = ss.line();
        if (temp !== "Buna bate toba") {
            throw Error("line seems to fail. Expected: 'Buna bate toba' , got '" + temp + "'");
        }

        temp = ss.word();
        if (temp !== "Bunica") {
            throw Error("word seems to fail. Expected: 'Bunica' , got '" + temp + "'");
        }

        temp = ss.line("\n");
        if (temp !== " bate tare") {
            throw Error("line seems to fail. Expected: ' bate tare' , got '" + temp + "'");
        }

        temp = ss.line("\n", 11);
        if (temp !== "Bunica bate") {
            throw Error("line seems to fail. Expected: 'Bunica bate' , got '" + temp + "'");
        }

        temp = ss.word();
        if (temp !== "tobaaa") {
            throw Error("line seems to fail. Expected: 'tobaaa' , got '" + temp + "'");
        }

        ss.char();
        temp = ss.line();
        if (temp !== "") {
            throw Error("line seems to fail. Expected: '' , got '" + temp + "'");
        }

        temp = ss.line('\n', 100);
        if (temp !== "Cu maciuca-n casa mare!") {
            throw Error("line seems to fail. Expected: 'Cu maciuca-n casa mare!' , got '" + temp + "'");
        }
    });

    var numFailed = 0;
    for (var i = 0; i < tests.length; i += 1) {
        try {
            tests[i]();
            console.log("Test ", i, " ran successfully.");
        } catch (e) {
            numFailed += 1;
            console.log("Failed StringStream test ", i, "! Reason: ", e);
        }
    }

    console.log("Finished running all tests. Failed: ", numFailed);
}

// Class that for every markup tag returns the UI class to instanciate for that element
UI.MarkupClassMap = function () {
    function MarkupClassMap(fallback) {
        classCallCheck(this, MarkupClassMap);

        this.classMap = new Map();
        this.fallback = fallback;
    }

    createClass(MarkupClassMap, [{
        key: "addClass",
        value: function addClass(className, classObject) {
            this.classMap.set(className, classObject);
        }
    }, {
        key: "registerDependencies",
        value: function registerDependencies(dependencies) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = dependencies[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var dependency = _step.value;

                    if (dependency && dependency.registerMarkup) {
                        dependency.registerMarkup(this);
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
        }
    }, {
        key: "getClass",
        value: function getClass(className) {
            var classObject = this.classMap.get(className);
            if (!classObject && this.fallback) {
                classObject = this.fallback.getClass(className);
            }
            return classObject;
        }
    }, {
        key: "get",
        value: function get(className) {
            return this.getClass(className);
        }
    }, {
        key: "has",
        value: function has(className) {
            return this.getClass(className);
        }
    }], [{
        key: "addClass",
        value: function addClass(className, classObject) {
            this.GLOBAL.addClass(className, classObject);
        }
    }]);
    return MarkupClassMap;
}();

UI.MarkupClassMap.GLOBAL = new UI.MarkupClassMap();

UI.MarkupRenderer = function (_UI$Panel) {
    inherits(MarkupRenderer, _UI$Panel);

    function MarkupRenderer() {
        classCallCheck(this, MarkupRenderer);
        return possibleConstructorReturn(this, (MarkupRenderer.__proto__ || Object.getPrototypeOf(MarkupRenderer)).apply(this, arguments));
    }

    createClass(MarkupRenderer, [{
        key: "setOptions",
        value: function setOptions(options) {
            if (!options.classMap) {
                options.classMap = new UI.MarkupClassMap(UI.MarkupClassMap.GLOBAL);
            }
            if (!options.parser) {
                options.parser = new MarkupParser({
                    uiElements: options.classMap
                });
            }
            get(MarkupRenderer.prototype.__proto__ || Object.getPrototypeOf(MarkupRenderer.prototype), "setOptions", this).call(this, options);

            this.setValue(this.options.value || "");
            if (this.options.classMap) {
                this.classMap = this.options.classMap;
            }
        }
    }, {
        key: "setValue",
        value: function setValue(value) {
            if (typeof value === "string") {
                this.options.rawValue = value;
                try {
                    value = this.options.parser.parse(value);
                } catch (e) {
                    console.error("Can't parse ", value, e);
                    value = {
                        tag: "span",
                        children: [value]
                    };
                }
            }
            this.options.value = value;
        }
    }, {
        key: "reparse",
        value: function reparse() {
            if (this.options.rawValue) {
                this.setValue(this.options.rawValue);
            }
        }
    }, {
        key: "registerDependencies",
        value: function registerDependencies(dependencies) {
            if (dependencies.length > 0) {
                this.classMap.registerDependencies(dependencies);
                this.reparse();
            }
        }
    }, {
        key: "addClass",
        value: function addClass(className, classObject) {
            this.classMap.addClass(className, classObject);
        }
    }, {
        key: "getClass",
        value: function getClass(className) {
            return this.classMap.getClass(className);
        }
    }, {
        key: "convertToUI",
        value: function convertToUI(value) {
            if (value instanceof UI.TextElement || value instanceof UI.Element) {
                // TODO: investigate this!
                return value;
            }

            if (typeof value === "string") {
                return new UI.TextElement(value);
            }
            if (Array.isArray(value)) {
                var result = new Array(value.length);
                for (var i = 0; i < value.length; i += 1) {
                    result[i] = this.convertToUI(value[i]);
                }
                return result;
            }
            if (value.children) {
                value.children = this.convertToUI(value.children);
            }

            var classObject = this.getClass(value.tag) || value.tag;

            // TODO: maybe just copy to another object, not delete?
            //delete value.tag;
            return UI.createElement.apply(UI, [classObject, value].concat(toConsumableArray(value.children || [])));
        }
    }, {
        key: "render",
        value: function render() {
            return this.convertToUI(this.options.value);
        }
    }]);
    return MarkupRenderer;
}(UI.Panel);

UI.MarkupClassMap.addClass("CodeSnippet", UI.StaticCodeHighlighter);
UI.MarkupClassMap.addClass("Link", UI.Link);
UI.MarkupClassMap.addClass("Image", UI.Image);

// Plugins should be used to extends on runtime the functionality of a class
var Plugin = function (_Dispatchable) {
    inherits(Plugin, _Dispatchable);

    function Plugin(parent) {
        classCallCheck(this, Plugin);

        var _this = possibleConstructorReturn(this, (Plugin.__proto__ || Object.getPrototypeOf(Plugin)).call(this));

        _this.linkToParent(parent);
        return _this;
    }

    createClass(Plugin, [{
        key: "linkToParent",
        value: function linkToParent(parent) {
            this.parent = parent;
        }
    }, {
        key: "name",
        value: function name() {
            return this.constructor.pluginName();
        }
    }], [{
        key: "pluginName",
        value: function pluginName() {
            return this.name;
        }
    }]);
    return Plugin;
}(Dispatchable);

// TODO: rename this to use Mixin in title


var Pluginable = function Pluginable(BaseClass) {
    return function (_BaseClass) {
        inherits(Pluginable, _BaseClass);

        function Pluginable() {
            classCallCheck(this, Pluginable);
            return possibleConstructorReturn(this, (Pluginable.__proto__ || Object.getPrototypeOf(Pluginable)).apply(this, arguments));
        }

        createClass(Pluginable, [{
            key: "registerPlugin",

            // TODO: this should probably take in a plugin instance also
            value: function registerPlugin(PluginClass) {
                if (!this.hasOwnProperty("plugins")) {
                    this.plugins = new Map();
                }
                // TODO: figure out plugin dependencies
                var plugin = new PluginClass(this);
                var pluginName = plugin.name();

                if (this.plugins.has(pluginName)) {
                    console.error("You are overwriting an existing plugin: ", pluginName, " for object ", this);
                }

                this.plugins.set(pluginName, plugin);
            }
        }, {
            key: "removePlugin",
            value: function removePlugin(pluginName) {
                var plugin = this.getPlugin(pluginName);
                if (plugin) {
                    plugin.remove(this);
                    this.plugins.delete(plugin.name());
                } else {
                    console.error("Can't remove plugin ", pluginName);
                }
            }
        }, {
            key: "getPlugin",
            value: function getPlugin(pluginName) {
                if (!(typeof pluginName === "string")) {
                    pluginName = pluginName.pluginName();
                }
                if (this.plugins) {
                    return this.plugins.get(pluginName);
                } else {
                    return null;
                }
            }
        }]);
        return Pluginable;
    }(BaseClass);
};

// File meant to handle server time/client time differences

var ServerTime = function () {
    function ServerTime() {
        classCallCheck(this, ServerTime);
    }

    createClass(ServerTime, null, [{
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

var DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

// times should be in unix seconds
// TODO: should be in the time file
function isDifferentDay(timaA, timeB) {
    if (Math.max(timaA, timeB) - Math.min(timaA, timeB) > DAY_IN_MILLISECONDS / 1000) {
        return true;
    }
    // Check if different day of the week, when difference is less than a day
    if (moment.unix(timaA).day() !== moment.unix(timeB).day()) {
        return true;
    }
    return false;
}

// TODO: might need a redesign, to handle full urls

var URLRouterClass = function (_Dispatchable) {
    inherits(URLRouterClass, _Dispatchable);

    function URLRouterClass() {
        classCallCheck(this, URLRouterClass);

        var _this = possibleConstructorReturn(this, (URLRouterClass.__proto__ || Object.getPrototypeOf(URLRouterClass)).call(this));

        window.onhashchange = function () {
            _this.routeCallback();
        };
        return _this;
    }

    createClass(URLRouterClass, [{
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
            args = unwrapArray(args);

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
            args = unwrapArray(args);

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
}(Dispatchable);

// Singleton


var URLRouter = new URLRouterClass();

var Deque = function () {
    function Deque() {
        classCallCheck(this, Deque);

        this._values = new Array(8);
        this._length = 0;
        this._offset = this._values.length / 2 | 0;
    }

    createClass(Deque, [{
        key: "shouldShrink",
        value: function shouldShrink() {
            return this._values.length > 4 * this._length + 8;
        }
    }, {
        key: "maybeShrink",
        value: function maybeShrink() {
            if (this.shouldShrink()) {
                this.rebalance(true);
            }
        }
    }, {
        key: "rebalance",
        value: function rebalance(forceResize) {
            var capacity = this._values.length;
            var length = this._length;
            var optimalCapacity = length * 1.618 + 8 | 0;
            var shouldResize = forceResize || capacity < optimalCapacity;

            if (shouldResize) {
                // Allocate a new array and balance objects around the middle
                var values = new Array(optimalCapacity);
                var optimalOffset = optimalCapacity / 2 - length / 2 | 0;
                for (var i = 0; i < length; i += 1) {
                    values[optimalOffset + i] = this._values[this._offset + i];
                }
                this._values = values;
                this._offset = optimalOffset;
            } else {
                //Just balance the elements in the middle of the array
                var _optimalOffset = capacity / 2 - length / 2 | 0;
                this._values.copyWithin(_optimalOffset, this._offset, this._offset + this._length);
                // Remove references, to not mess up gc
                if (_optimalOffset < this._offset) {
                    this._values.fill(undefined, _optimalOffset + this._length, this._offset + this._length);
                } else {
                    this._values.fill(undefined, this._offset + this._length, _optimalOffset + this._length);
                }
                this._offset = _optimalOffset;
            }
        }
    }, {
        key: "pushBack",
        value: function pushBack(value) {
            if (this._offset == 0) {
                this.rebalance();
            }
            this._values[--this._offset] = value;
            this._length += 1;
        }
    }, {
        key: "popBack",
        value: function popBack() {
            var value = this.peekBack();

            this._values[this._offset++] = undefined;
            this._length -= 1;
            this.maybeShrink();

            return value;
        }
    }, {
        key: "peekBack",
        value: function peekBack() {
            if (this._length == 0) {
                throw Error("Invalid operation, empty deque");
            }
            return this._values[this._offset];
        }
    }, {
        key: "pushFront",
        value: function pushFront(value) {
            if (this._offset + this._length === this._values.length) {
                this.rebalance();
            }
            this._values[this._offset + this._length] = value;
            this._length += 1;
        }
    }, {
        key: "popFront",
        value: function popFront() {
            var value = this.peekFront();

            this._length -= 1;
            this._values[this._offset + this._length] = undefined;
            this.maybeShrink();

            return value;
        }
    }, {
        key: "peekFront",
        value: function peekFront() {
            if (this._length == 0) {
                throw Error("Invalid operation, empty deque");
            }
            return this._values[this._offset + this._length - 1];
        }
    }, {
        key: "get",
        value: function get(index) {
            if (index < 0 || index >= this._length) {
                throw Error("Invalid index", index);
            }
            return this._values[this._offset + index];
        }
    }, {
        key: "toArray",
        value: function toArray() {
            return this._values.slice(this._offset, this._offset + this._length);
        }
    }, {
        key: "toString",
        value: function toString() {
            return this.toArray().toString();
        }
    }, {
        key: "length",
        get: function get() {
            return this._values.length;
        },
        set: function set(value) {
            throw Error("Can't resize a deque");
        }
    }]);
    return Deque;
}();

// Also support the standard javascript method names


Deque.prototype.pop = Deque.prototype.popBack;
Deque.prototype.push = Deque.prototype.pushBack;
Deque.prototype.shift = Deque.prototype.popFront;
Deque.prototype.unshift = Deque.prototype.pushFront;

exports.UIElement = UIElement;
exports.UI = UI;
exports.css = css;
exports.StyleSet = StyleSet;
exports.ExclusiveClassSet = ExclusiveClassSet;
exports.styleMap = styleMap;
exports.wrapCSS = wrapCSS;
exports.hover = hover;
exports.focus = focus;
exports.active = active;
exports.StyleSheet = StyleSheet;
exports.setLanguageStore = setLanguageStore;
exports.setTranslationMap = setTranslationMap;
exports.getTranslationMap = getTranslationMap;
exports.Transition = Transition;
exports.Modifier = Modifier;
exports.TransitionList = TransitionList;
exports.Color = Color;
exports.lighten = lighten;
exports.darken = darken;
exports.buildColors = buildColors;
exports.GlobalStyle = GlobalStyle;
exports.TabTitleArea = TabTitleArea;
exports.BasicTabTitle = BasicTabTitle;
exports.TabArea = TabArea;
exports.BaseTabAreaStyle = BaseTabAreaStyle;
exports.DefaultTabAreaStyle = DefaultTabAreaStyle;
exports.MinimalistTabAreaStyle = MinimalistTabAreaStyle;
exports.FAIcon = FAIcon;
exports.FACollapseIcon = FACollapseIcon;
exports.DoubleClickable = DoubleClickable;
exports.Draggable = Draggable;
exports.FullScreenable = FullScreenable;
exports.SectionDivider = SectionDivider;
exports.DateTimePicker = DateTimePicker;
exports.StateClass = StateClass;
exports.GlobalState = GlobalState$1;
exports.StoreObject = StoreObject;
exports.BaseStore = BaseStore;
exports.GenericObjectStore = GenericObjectStore;
exports.SingletonStore = SingletonStore;
exports.AjaxFetchMixin = AjaxFetchMixin;
exports.VirtualStoreMixin = VirtualStoreMixin;
exports.VirtualStoreObjectMixin = VirtualStoreObjectMixin;
exports.StringStream = StringStream;
exports.MarkupModifier = MarkupModifier;
exports.CodeModifier = CodeModifier;
exports.HeaderModifier = HeaderModifier;
exports.ParagraphModifier = ParagraphModifier;
exports.InlineCodeModifier = InlineCodeModifier;
exports.InlineLatexModifier = InlineLatexModifier;
exports.StrongModifier = StrongModifier;
exports.LinkModifier = LinkModifier;
exports.MarkupParser = MarkupParser;
exports.TestStringStream = TestStringStream;
exports.EPS = EPS;
exports.isZero = isZero;
exports.rand = rand;
exports.equal = equal;
exports.equalPoints = equalPoints;
exports.sqr = sqr;
exports.distance = distance;
exports.signedDistancePointLine = signedDistancePointLine;
exports.distancePointLine = distancePointLine;
exports.pointOnSegment = pointOnSegment;
exports.perpendicularFoot = perpendicularFoot;
exports.lineEquation = lineEquation;
exports.angleGrad = angleGrad;
exports.radian = radian;
exports.gradian = gradian;
exports.angleRad = angleRad;
exports.crossProduct = crossProduct;
exports.rotatePoint = rotatePoint;
exports.translatePoint = translatePoint;
exports.scalePoint = scalePoint;
exports.polarToCartesian = polarToCartesian;
exports.circlesIntersection = circlesIntersection;
exports.bound = bound;
exports.getVector = getVector;
exports.vectorLength = vectorLength;
exports.normalizeVector = normalizeVector;
exports.scaleVector = scaleVector;
exports.addVectors = addVectors;
exports.subtractVectors = subtractVectors;
exports.triangleArea = triangleArea;
exports.inRange = inRange;
exports.interpolationValue = interpolationValue;
exports.Dispatcher = Dispatcher;
exports.Dispatchable = Dispatchable;
exports.RunOnce = RunOnce;
exports.CleanupJobs = CleanupJobs;
exports.SingleActiveElementDispatcher = SingleActiveElementDispatcher;
exports.getAttachCleanupJobMethod = getAttachCleanupJobMethod;
exports.Ajax = Ajax;
exports.Plugin = Plugin;
exports.Pluginable = Pluginable;
exports.unwrapArray = unwrapArray;
exports.splitInChunks = splitInChunks;
exports.isIterable = isIterable;
exports.defaultComparator = defaultComparator;
exports.slugify = slugify;
exports.suffixNumber = suffixNumber;
exports.isPlainObject = isPlainObject;
exports.deepCopy = deepCopy;
exports.objectFromKeyValue = objectFromKeyValue;
exports.dashCase = dashCase;
exports.DAY_IN_MILLISECONDS = DAY_IN_MILLISECONDS;
exports.isDifferentDay = isDifferentDay;
exports.ServerTime = ServerTime;
exports.URLRouter = URLRouter;
exports.Deque = Deque;
exports.deprecate = deprecate;
exports.lazyCSS = lazyCSS;
exports.lazyInheritCSS = lazyInheritCSS;
exports.lazyInitialize = lazyInitialize;
exports.lazyInit = lazyInit;
exports.readOnly = readOnly;

Object.defineProperty(exports, '__esModule', { value: true });

})));
