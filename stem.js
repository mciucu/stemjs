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

var _marked = [mapIterator, filterIterator].map(regeneratorRuntime.mark);

// TODO: should this be renamed to "toUnwrappedArray"?
function unwrapArray(elements) {
    if (!elements) {
        return [];
    }

    if (!Array.isArray(elements)) {
        // In case this is an iterable, convert to array
        if (elements[Symbol.iterator]) {
            return unwrapArray(Array.from(elements));
        } else {
            return [elements];
        }
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

    // TODO: might want to use valueof here
    if (isNumber(a) && isNumber(b)) {
        return a - b;
    }

    var aStr = a.toString();
    var bStr = b.toString();

    if (aStr === bStr) {
        return 0;
    }
    return aStr < bStr ? -1 : 1;
}

function slugify(string) {
    string = string.trim();

    string = string.replace(/[^a-zA-Z0-9-\s]/g, ""); // remove anything non-latin alphanumeric
    string = string.replace(/\s+/g, "-"); // replace whitespace with dashes
    string = string.replace(/-{2,}/g, "-"); // remove consecutive dashes
    string = string.toLowerCase();

    return string;
}

// If the first argument is a number, it's returned concatenated with the suffix, otherwise it's returned unchanged
function suffixNumber(value, suffix) {
    if (typeof value === "number" || value instanceof Number) {
        return value + suffix;
    }
    return value;
}

function setObjectPrototype(obj, Class) {
    obj.__proto__ = Class.prototype;
    return obj;
}

function isNumber(obj) {
    return typeof obj === "number" || obj instanceof Number;
}

function isString(obj) {
    return typeof obj === "string" || obj instanceof String;
}

function isPlainObject(obj) {
    if (!obj || (typeof obj === "undefined" ? "undefined" : _typeof(obj)) !== "object" || obj.nodeType) {
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
                if (value && isPlainObject(value) || Array.isArray(value)) {
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

// TODO: have a Cookie helper file
function getCookie(name) {
    var cookies = (document.cookie || "").split(";");
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = cookies[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var cookie = _step2.value;

            cookie = cookie.trim();
            if (cookie.startsWith(name + "=")) {
                return decodeURIComponent(cookie.substring(name.length + 1));
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

    return null;
}

function uniqueId(obj) {
    if (!uniqueId.objectWeakMap) {
        uniqueId.objectWeakMap = new WeakMap();
        uniqueId.constructorWeakMap = new WeakMap();
        uniqueId.totalObjectCount = 0;
    }
    var objectWeakMap = uniqueId.objectWeakMap;
    var constructorWeakMap = uniqueId.constructorWeakMap;
    if (!objectWeakMap.has(obj)) {
        var objConstructor = obj.constructor || obj.__proto__ || Object;
        // Increment the object count
        var objIndex = (constructorWeakMap.get(objConstructor) || 0) + 1;
        constructorWeakMap.set(objConstructor, objIndex);

        var objUniqueId = objIndex + "-" + ++uniqueId.totalObjectCount;
        objectWeakMap.set(obj, objUniqueId);
    }
    return objectWeakMap.get(obj);
}

// TODO: should be done with String.padLeft
function padNumber(num, minLength) {
    var strNum = String(num);
    while (strNum.length < minLength) {
        strNum = "0" + strNum;
    }
    return strNum;
}

// Returns the english ordinal suffix of a number
function getOrdinalSuffix(num) {
    var suffixes = ["th", "st", "nd", "rd"];
    var lastDigit = num % 10;
    var isTeen = Math.floor(num / 10) % 10 === 1;
    return !isTeen && suffixes[lastDigit] || suffixes[0];
}

function suffixWithOrdinal(num) {
    return num + getOrdinalSuffix(num);
}

function instantiateNative(BaseClass, NewClass) {
    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
    }

    var obj = new (Function.prototype.bind.apply(BaseClass, [null].concat(args)))();
    obj.__proto__ = NewClass.prototype;
    return obj;
}

// This function can be used as a decorator in case we're extending native classes (Map/Set/Date)
// and we want to fix the way babel breaks this scenario
// WARNING: it destroys the code in constructor
// If you want a custom constructor, you need to implement a static create method that generates new objects
// Check the default constructor this code, or an example where this is done.
function extendsNative(targetClass) {
    if (targetClass.toString().includes(" extends ")) {
        // Native extended classes are cool, leave them as they are
        return;
    }
    var BaseClass = targetClass.__proto__;
    var allKeys = Object.getOwnPropertySymbols(targetClass).concat(Object.getOwnPropertyNames(targetClass));

    // Fill in the default constructor
    var newClass = targetClass.create || function create() {
        return instantiateNative.apply(undefined, [BaseClass, newClass].concat(Array.prototype.slice.call(arguments)));
    };
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = allKeys[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var key = _step3.value;

            var property = Object.getOwnPropertyDescriptor(targetClass, key);
            Object.defineProperty(newClass, key, property);
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

    newClass.prototype = targetClass.prototype;
    newClass.__proto__ = targetClass.__proto__;

    newClass.prototype.constructor = newClass;

    return newClass;
}

var NOOP_FUNCTION = function NOOP_FUNCTION() {};

// Helpers to wrap iterators, to wrap all values in a function or to filter them
function mapIterator(iter, func) {
    var _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, value;

    return regeneratorRuntime.wrap(function mapIterator$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _iteratorNormalCompletion4 = true;
                    _didIteratorError4 = false;
                    _iteratorError4 = undefined;
                    _context.prev = 3;
                    _iterator4 = iter[Symbol.iterator]();

                case 5:
                    if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                        _context.next = 12;
                        break;
                    }

                    value = _step4.value;
                    _context.next = 9;
                    return func(value);

                case 9:
                    _iteratorNormalCompletion4 = true;
                    _context.next = 5;
                    break;

                case 12:
                    _context.next = 18;
                    break;

                case 14:
                    _context.prev = 14;
                    _context.t0 = _context["catch"](3);
                    _didIteratorError4 = true;
                    _iteratorError4 = _context.t0;

                case 18:
                    _context.prev = 18;
                    _context.prev = 19;

                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }

                case 21:
                    _context.prev = 21;

                    if (!_didIteratorError4) {
                        _context.next = 24;
                        break;
                    }

                    throw _iteratorError4;

                case 24:
                    return _context.finish(21);

                case 25:
                    return _context.finish(18);

                case 26:
                case "end":
                    return _context.stop();
            }
        }
    }, _marked[0], this, [[3, 14, 18, 26], [19,, 21, 25]]);
}

function filterIterator(iter, func) {
    var _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, value;

    return regeneratorRuntime.wrap(function filterIterator$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    _iteratorNormalCompletion5 = true;
                    _didIteratorError5 = false;
                    _iteratorError5 = undefined;
                    _context2.prev = 3;
                    _iterator5 = iter[Symbol.iterator]();

                case 5:
                    if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
                        _context2.next = 13;
                        break;
                    }

                    value = _step5.value;

                    if (!func(value)) {
                        _context2.next = 10;
                        break;
                    }

                    _context2.next = 10;
                    return value;

                case 10:
                    _iteratorNormalCompletion5 = true;
                    _context2.next = 5;
                    break;

                case 13:
                    _context2.next = 19;
                    break;

                case 15:
                    _context2.prev = 15;
                    _context2.t0 = _context2["catch"](3);
                    _didIteratorError5 = true;
                    _iteratorError5 = _context2.t0;

                case 19:
                    _context2.prev = 19;
                    _context2.prev = 20;

                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }

                case 22:
                    _context2.prev = 22;

                    if (!_didIteratorError5) {
                        _context2.next = 25;
                        break;
                    }

                    throw _iteratorError5;

                case 25:
                    return _context2.finish(22);

                case 26:
                    return _context2.finish(19);

                case 27:
                case "end":
                    return _context2.stop();
            }
        }
    }, _marked[1], this, [[3, 15, 19, 27], [20,, 22, 26]]);
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

var DispatchersSymbol = Symbol("Dispatchers");

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
            delete this[DispatchersSymbol];
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
        get: function get$$1() {
            return this[DispatchersSymbol] || (this[DispatchersSymbol] = new Map());
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
            return setObjectPrototype(value, this);
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
            if (!(typeof key === "string" || key instanceof String)) {
                // If the key is not a string, it should be a plain object
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = Object.keys(key)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var styleKey = _step3.value;

                        this.setStyle(styleKey, key[styleKey], node);
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

                return;
            }
            if (value === undefined) {
                this.removeStyle(key, node);
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
    }, {
        key: "removeStyle",
        value: function removeStyle(key, node) {
            if (this.style) {
                delete this.style[key];
            }
            if (node && node.style[key]) {
                delete node.style[key];
            }
        }
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

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = classes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var cls = _step4.value;

                    this.getClassNameSet().add(cls);
                    if (node) {
                        node.classList.add(cls);
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
        key: "removeClass",
        value: function removeClass(classes, node) {
            classes = this.constructor.getClassArray(classes);

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = classes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var cls = _step5.value;

                    this.getClassNameSet().delete(cls);
                    if (node) {
                        node.classList.remove(cls);
                    }
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
    }, {
        key: "hasClass",
        value: function hasClass(className) {
            return this.getClassNameSet().has(className);
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
                    obj[name] = undefined;
                }
            }
        }

        // Lifecycle methods, called when the element was first inserted in the DOM, and before it's removed

    }, {
        key: "onMount",
        value: function onMount() {}
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

// TODO: rename to Element

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
            this.addListenersFromOptions();
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

                    child.destroyNode();
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
        key: "getOptionsAsNodeAttributes",
        value: function getOptionsAsNodeAttributes() {
            return setObjectPrototype(this.options, NodeAttributes);
        }
    }, {
        key: "getNodeAttributes",
        value: function getNodeAttributes() {
            var returnCopy = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            if (returnCopy) {
                return new NodeAttributes(this.options);
            } else {
                return this.getOptionsAsNodeAttributes();
            }
        }
    }, {
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {}
    }, {
        key: "applyNodeAttributes",
        value: function applyNodeAttributes() {
            var attr = void 0;
            if (this.extraNodeAttributes != NOOP_FUNCTION) {
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
            this.getOptionsAsNodeAttributes().setAttribute(key, value, this.node, this.constructor.domAttributesMap);
        }
    }, {
        key: "setStyle",
        value: function setStyle(key, value) {
            this.getOptionsAsNodeAttributes().setStyle(key, value, this.node);
        }
    }, {
        key: "removeStyle",
        value: function removeStyle(key) {
            this.getOptionsAsNodeAttributes().removeStyle(key, this.node);
        }
    }, {
        key: "addClass",
        value: function addClass(className) {
            this.getOptionsAsNodeAttributes().addClass(className, this.node);
        }
    }, {
        key: "removeClass",
        value: function removeClass(className) {
            this.getOptionsAsNodeAttributes().removeClass(className, this.node);
        }
    }, {
        key: "hasClass",
        value: function hasClass(className) {
            return this.getOptionsAsNodeAttributes().hasClass(className);
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
        value: function addListenersFromOptions() {
            var _this4 = this;

            var _loop = function _loop(key) {
                if (typeof key === "string" && key.startsWith("on") && key.length > 2) {
                    var eventType = key.substring(2);

                    var addListenerMethodName = "add" + eventType + "Listener";
                    var handlerMethodName = "on" + eventType + "Handler";

                    // The handlerMethod might have been previously added
                    // by a previous call to this function or manually by the user
                    if (typeof _this4[addListenerMethodName] === "function" && !_this4.hasOwnProperty(handlerMethodName)) {
                        _this4[handlerMethodName] = function (event) {
                            UI.event = event;
                            if (_this4.options[key]) {
                                // TODO: arguments should be (event, this)!
                                _this4.options[key](_this4, event);
                            }
                        };

                        // Actually add the listener
                        _this4[addListenerMethodName](_this4[handlerMethodName]);
                    }
                }
            };

            for (var key in this.options) {
                _loop(key);
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
        key: "bindToNode",
        value: function bindToNode(node, doRedraw) {
            this.node = node;
            if (doRedraw) {
                this.clearNode();
                this.redraw();
            }
            return this;
        }
    }, {
        key: "mount",
        value: function mount(parent, nextSiblingNode) {
            if (!parent.node) {
                parent = new UI.Element().bindToNode(parent);
            }
            this.parent = parent;
            if (this.node) {
                parent.insertChildNodeBefore(this, nextSiblingNode);
                this.dispatch("changeParent", this.parent);
                return;
            }

            this.createNode();
            this.redraw();

            parent.insertChildNodeBefore(this, nextSiblingNode);

            this.addListenersFromOptions();

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

            var nextChildNode = position + 1 < this.options.children.length ? this.children[position + 1].node : null;

            child.mount(this, nextChildNode);

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
            this.setStyle("height", suffixNumber(value, "px"));
            this.dispatch("resize");
        }
    }, {
        key: "setWidth",
        value: function setWidth(value) {
            this.setStyle("width", suffixNumber(value, "px"));
            this.dispatch("resize");
        }
    }, {
        key: "addNodeListener",
        value: function addNodeListener(name, callback) {
            for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
                args[_key2 - 2] = arguments[_key2];
            }

            var _node;

            (_node = this.node).addEventListener.apply(_node, [name, callback].concat(args));
            return {
                remove: function remove() {
                    this.removeNodeListener.apply(this, [name, callback].concat(args));
                }
            };
        }
    }, {
        key: "removeNodeListener",
        value: function removeNodeListener(name, callback) {
            this.node.removeEventListener(name, callback);
        }

        // TODO: methods can be automatically generated by addNodeListener(UI.Element, "dblclick", "DoubleClick") for instance

    }, {
        key: "addClickListener",
        value: function addClickListener(callback) {
            return this.addNodeListener("click", callback);
        }
    }, {
        key: "removeClickListener",
        value: function removeClickListener(callback) {
            this.removeNodeListener("click", callback);
        }
    }, {
        key: "addDoubleClickListener",
        value: function addDoubleClickListener(callback) {
            return this.addNodeListener("dblclick", callback);
        }
    }, {
        key: "removeDoubleClickListener",
        value: function removeDoubleClickListener(callback) {
            this.removeNodeListener("dblclick", callback);
        }
    }, {
        key: "addChangeListener",
        value: function addChangeListener(callback) {
            return this.addNodeListener("change", callback);
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

    for (var _len3 = arguments.length, children = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
        children[_key3 - 2] = arguments[_key3];
    }

    options.children = unwrapArray(children);

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

// Explicitly know that extraNodeAttributes doesn't do anything, but have it to be callable when doing inheritance
UIElement.prototype.extraNodeAttributes = NOOP_FUNCTION;

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
            value: function getNodeType() {
                return nodeType;
            }
        }]);
        return Primitive;
    }(BaseClass);
    baseClassPrimitiveMap.set(nodeType, resultClass);
    return resultClass;
};

function getOffset(node) {
    if (node instanceof UI.Element) {
        node = node.node;
    }
    if (!node) {
        return { left: 0, top: 0 };
    }
    var nodePosition = node.style && node.style.position;
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

function getComputedStyle(node, attribute) {
    if (node instanceof UI.Element) {
        node = node.node;
    }
    var computedStyle = window.getComputedStyle(node, null);
    return attribute ? computedStyle.getPropertyValue(attribute) : computedStyle;
}

function changeParent(element, newParent) {
    var currentParent = element.parent;
    currentParent.eraseChild(element, false);
    newParent.appendChild(element);
}

// TODO: not sure is this needs to actually be *.jsx
// TODO: should this be actually better done throught the dynamic CSS API, without doing through the DOM?

var StyleInstance = function (_UI$TextElement) {
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

var StyleElement = function (_UI$Primitive) {
    inherits(StyleElement, _UI$Primitive);

    function StyleElement() {
        classCallCheck(this, StyleElement);
        return possibleConstructorReturn(this, (StyleElement.__proto__ || Object.getPrototypeOf(StyleElement)).apply(this, arguments));
    }

    createClass(StyleElement, [{
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
}(UI.Primitive("style"));

var ALLOWED_SELECTOR_STARTS = new Set([":", ">", " ", "+", "~", "[", "."]);

// TODO: figure out how to work with animation frames, this only creates a wrapper class

var DynamicStyleElement = function (_StyleElement) {
    inherits(DynamicStyleElement, _StyleElement);

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
                        console.error("First character of your selector is invalid.");
                        continue;
                    }
                    // TODO: maybe optimize for waste here?
                    var subStyle = this.getStyleInstances(selector + key, value);
                    result.push.apply(result, toConsumableArray(subStyle));
                }
            }

            if (haveOwnStyle) {
                result.unshift(new StyleInstance({ selector: selector, key: selector, attributes: ownStyle }));
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
}(StyleElement);

var KeyframeElement = function (_StyleElement2) {
    inherits(KeyframeElement, _StyleElement2);

    function KeyframeElement() {
        classCallCheck(this, KeyframeElement);
        return possibleConstructorReturn(this, (KeyframeElement.__proto__ || Object.getPrototypeOf(KeyframeElement)).apply(this, arguments));
    }

    createClass(KeyframeElement, [{
        key: "toString",
        value: function toString() {
            return this.getKeyframeName();
        }
    }, {
        key: "getKeyframeName",
        value: function getKeyframeName() {
            if (this.keyframeName) {
                return this.keyframeName;
            }
            this.constructor.instanceCounter = (this.constructor.instanceCounter || 0) + 1;
            this.keyframeName = "keyframes-" + this.constructor.instanceCounter;
            return this.keyframeName;
        }
    }, {
        key: "getValue",
        value: function getValue(style) {
            var str = "{";
            for (var key in style) {
                var value = style[key];
                if (typeof value === "function") {
                    value = value();
                }
                if (value == null) {
                    continue;
                }
                str += dashCase(key) + ":" + value + ";";
            }
            return str + "}";
        }
    }, {
        key: "getKeyframeInstance",
        value: function getKeyframeInstance(keyframe) {
            var result = "{";
            for (var key in keyframe) {
                var value = keyframe[key];
                result += key + " " + this.getValue(value);
            }
            return result + "}";
        }
    }, {
        key: "render",
        value: function render() {
            return "@keyframes " + this.getKeyframeName() + this.getKeyframeInstance(this.options.keyframe || {});
        }
    }]);
    return KeyframeElement;
}(StyleElement);

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
    return function set$$1(newValue) {
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

// TODO: add bind decorator

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

// TODO: this file existed to hold generic classes in a period of fast prototyping, has a lot of old code
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

// TODO: why is this here?
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

// A very simple class, all this does is implement the `getTitle()` method

var Panel = function (_UI$Element) {
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

var SlideBar = function (_Draggable) {
    inherits(SlideBar, _Draggable);

    function SlideBar() {
        classCallCheck(this, SlideBar);
        return possibleConstructorReturn(this, (SlideBar.__proto__ || Object.getPrototypeOf(SlideBar)).apply(this, arguments));
    }

    createClass(SlideBar, [{
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            attr.setStyle("display", "inline-block");
            attr.setStyle("position", "relative");
            attr.setStyle("cursor", "pointer");
        }
    }, {
        key: "getSliderValue",
        value: function getSliderValue() {
            return this.options.value * this.options.size - this.options.barSize / 2;
        }
    }, {
        key: "render",
        value: function render() {
            return [UI.createElement(UI.ProgressBar, { ref: "progressBar", active: "true", value: this.options.value, disableTransition: true,
                orientation: this.getOrientation(),
                style: Object.assign({
                    position: "relative"
                }, this.getProgressBarStyle())
            }), UI.createElement("div", { ref: "slider", style: Object.assign({
                    backgroundColor: "black",
                    position: "absolute"
                }, this.getSliderStyle()) })];
        }
    }, {
        key: "setValue",
        value: function setValue(value) {
            value = Math.max(value, 0);
            value = Math.min(value, 1);

            this.options.value = value;
            this.progressBar.set(this.options.value);
            this.slider.setStyle(this.getOrientationAttribute(), this.getSliderValue() + "px");

            this.dispatch("change", this.options.value);
        }
    }, {
        key: "getValue",
        value: function getValue() {
            return this.options.value;
        }
    }, {
        key: "onMount",
        value: function onMount() {
            this.addDragListener(this.getDragConfig());
        }
    }]);
    return SlideBar;
}(Draggable(UI.Element));

var HorizontalSlideBar = function (_SlideBar) {
    inherits(HorizontalSlideBar, _SlideBar);

    function HorizontalSlideBar() {
        classCallCheck(this, HorizontalSlideBar);
        return possibleConstructorReturn(this, (HorizontalSlideBar.__proto__ || Object.getPrototypeOf(HorizontalSlideBar)).apply(this, arguments));
    }

    createClass(HorizontalSlideBar, [{
        key: "setOptions",
        value: function setOptions(options) {
            options.size = options.size || options.width || 100;
            options.barSize = options.barSize || options.barWidth || 5;
            get(HorizontalSlideBar.prototype.__proto__ || Object.getPrototypeOf(HorizontalSlideBar.prototype), "setOptions", this).call(this, options);
        }
    }, {
        key: "getProgressBarStyle",
        value: function getProgressBarStyle() {
            return {
                height: "5px",
                width: this.options.size + "px",
                top: "15px"
            };
        }
    }, {
        key: "getSliderStyle",
        value: function getSliderStyle() {
            return {
                width: this.options.barSize + "px",
                height: "20px",
                left: this.getSliderValue() + "px",
                top: "7.5px"
            };
        }
    }, {
        key: "getOrientationAttribute",
        value: function getOrientationAttribute() {
            return "left";
        }
    }, {
        key: "getOrientation",
        value: function getOrientation() {
            return UI.Orientation.HORIZONTAL;
        }
    }, {
        key: "getDragConfig",
        value: function getDragConfig() {
            var _this4 = this;

            return {
                onStart: function onStart(event) {
                    _this4.setValue((Device.getEventX(event) - getOffset(_this4.progressBar)[_this4.getOrientationAttribute()]) / _this4.options.size);
                },
                onDrag: function onDrag(deltaX, deltaY) {
                    _this4.setValue(_this4.options.value + deltaX / _this4.options.size);
                }
            };
        }
    }]);
    return HorizontalSlideBar;
}(SlideBar);

var VerticalSlideBar = function (_SlideBar2) {
    inherits(VerticalSlideBar, _SlideBar2);

    function VerticalSlideBar() {
        classCallCheck(this, VerticalSlideBar);
        return possibleConstructorReturn(this, (VerticalSlideBar.__proto__ || Object.getPrototypeOf(VerticalSlideBar)).apply(this, arguments));
    }

    createClass(VerticalSlideBar, [{
        key: "setOptions",
        value: function setOptions(options) {
            options.size = options.size || options.height || 100;
            options.barSize = options.barSize || options.barHeight || 5;
            get(VerticalSlideBar.prototype.__proto__ || Object.getPrototypeOf(VerticalSlideBar.prototype), "setOptions", this).call(this, options);
        }
    }, {
        key: "getProgressBarStyle",
        value: function getProgressBarStyle() {
            return {
                height: this.options.size + "px",
                width: "5px",
                left: "15px"
            };
        }
    }, {
        key: "getSliderStyle",
        value: function getSliderStyle() {
            return {
                height: this.options.barSize + "px",
                width: "20px",
                top: this.getSliderValue() + "px",
                left: "7.5px"
            };
        }
    }, {
        key: "getOrientationAttribute",
        value: function getOrientationAttribute() {
            return "top";
        }
    }, {
        key: "getOrientation",
        value: function getOrientation() {
            return UI.Orientation.VERTICAL;
        }
    }, {
        key: "getDragConfig",
        value: function getDragConfig() {
            var _this6 = this;

            return {
                onStart: function onStart(event) {
                    _this6.setValue((Device.getEventY(event) - getOffset(_this6.progressBar)[_this6.getOrientationAttribute()]) / _this6.options.size);
                },
                onDrag: function onDrag(deltaX, deltaY) {
                    _this6.setValue(_this6.options.value + deltaY / _this6.options.size);
                }
            };
        }
    }]);
    return VerticalSlideBar;
}(SlideBar);

var Link = function (_UI$Primitive) {
    inherits(Link, _UI$Primitive);

    function Link() {
        classCallCheck(this, Link);
        return possibleConstructorReturn(this, (Link.__proto__ || Object.getPrototypeOf(Link)).apply(this, arguments));
    }

    createClass(Link, [{
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            attr.setStyle("cursor", "pointer");
        }
    }, {
        key: "getDefaultOptions",
        value: function getDefaultOptions() {
            return {
                newTab: true
            };
        }
    }, {
        key: "setOptions",
        value: function setOptions(options) {
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
}(UI.Primitive("a"));

var Image = function (_UI$Primitive2) {
    inherits(Image, _UI$Primitive2);

    function Image() {
        classCallCheck(this, Image);
        return possibleConstructorReturn(this, (Image.__proto__ || Object.getPrototypeOf(Image)).apply(this, arguments));
    }

    return Image;
}(UI.Primitive("img"));

// Beware coder: If you ever use this class, you should have a well documented reason


var RawHTML = function (_UI$Element2) {
    inherits(RawHTML, _UI$Element2);

    function RawHTML() {
        classCallCheck(this, RawHTML);
        return possibleConstructorReturn(this, (RawHTML.__proto__ || Object.getPrototypeOf(RawHTML)).apply(this, arguments));
    }

    createClass(RawHTML, [{
        key: "getInnerHTML",
        value: function getInnerHTML() {
            return this.options.innerHTML || this.options.__innerHTML;
        }
    }, {
        key: "redraw",
        value: function redraw() {
            this.node.innerHTML = this.getInnerHTML();
            this.applyNodeAttributes();
            this.applyRef();
        }
    }]);
    return RawHTML;
}(UI.Element);

var ViewportMeta = function (_UI$Primitive3) {
    inherits(ViewportMeta, _UI$Primitive3);

    function ViewportMeta() {
        classCallCheck(this, ViewportMeta);
        return possibleConstructorReturn(this, (ViewportMeta.__proto__ || Object.getPrototypeOf(ViewportMeta)).apply(this, arguments));
    }

    createClass(ViewportMeta, [{
        key: "getDefaultOptions",
        value: function getDefaultOptions() {
            return {
                scale: this.getDesiredScale(),
                initialScale: 1,
                maximumScale: 1
            };
        }
    }, {
        key: "getDesiredScale",
        value: function getDesiredScale() {
            var MIN_WIDTH = this.options.minDeviceWidth;
            return MIN_WIDTH ? Math.min(window.screen.availWidth, MIN_WIDTH) / MIN_WIDTH : 1;
        }
    }, {
        key: "getContent",
        value: function getContent() {
            var rez = "width=device-width";
            rez += ",initial-scale=" + this.options.scale;
            rez += ",maximum-scale=" + this.options.scale;
            rez += ",user-scalable=no";
            return rez;
        }
    }, {
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            attr.setAttribute("name", "viewport");
            attr.setAttribute("content", this.getContent());
        }
    }, {
        key: "maybeUpdate",
        value: function maybeUpdate() {
            var desiredScale = this.getDesiredScale();
            if (desiredScale != this.options.scale) {
                this.updateOptions({ scale: desiredScale });
            }
        }
    }, {
        key: "onMount",
        value: function onMount() {
            var _this11 = this;

            window.addEventListener("resize", function () {
                return _this11.maybeUpdate();
            });
        }
    }]);
    return ViewportMeta;
}(UI.Primitive("meta"));

var TemporaryMessageArea = function (_UI$Primitive4) {
    inherits(TemporaryMessageArea, _UI$Primitive4);

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
        }
    }, {
        key: "showMessage",
        value: function showMessage(message) {
            var _this13 = this;

            var color = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "black";
            var displayDuration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2000;

            this.setColor(color);
            this.clear();
            this.setValue(message);
            if (displayDuration) {
                this.clearValueTimeout = setTimeout(function () {
                    return _this13.clear();
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


var ScrollableMixin = function (_UI$Element3) {
    inherits(ScrollableMixin, _UI$Element3);

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

var InfiniteScrollable = function (_ScrollableMixin) {
    inherits(InfiniteScrollable, _ScrollableMixin);

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
}(ScrollableMixin);

var TimePassedSpan = function (_UI$Primitive5) {
    inherits(TimePassedSpan, _UI$Primitive5);

    function TimePassedSpan() {
        classCallCheck(this, TimePassedSpan);
        return possibleConstructorReturn(this, (TimePassedSpan.__proto__ || Object.getPrototypeOf(TimePassedSpan)).apply(this, arguments));
    }

    createClass(TimePassedSpan, [{
        key: "render",
        value: function render() {
            return this.getTimeDeltaDisplay(this.options.timeStamp);
        }
    }, {
        key: "getDefaultOptions",
        value: function getDefaultOptions() {
            return {
                style: {
                    color: "#aaa"
                }
            };
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
            var _this17 = this;

            this._updateListener = this.constructor.addIntervalListener(function () {
                _this17.redraw();
            });
        }
    }, {
        key: "onUnmount",
        value: function onUnmount() {
            this._updateListener && this._updateListener.remove();
        }
    }], [{
        key: "addIntervalListener",
        value: function addIntervalListener(callback) {
            var _this18 = this;

            if (!this.updateFunction) {
                this.TIME_DISPATCHER = new Dispatchable();
                this.updateFunction = setInterval(function () {
                    _this18.TIME_DISPATCHER.dispatch("updateTimeValue");
                }, 5000);
            }
            return this.TIME_DISPATCHER.addListener("updateTimeValue", callback);
        }
    }]);
    return TimePassedSpan;
}(UI.Primitive("span"));



// TODO: deprecate this, to use lazyInit decorators
function ConstructorInitMixin(BaseClass) {
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

function getKeyframesRuleKey(key) {
    return "__keyframes__" + key;
}

// TODO: this function can be made a lot more generic, to wrap plain object initializer with inheritance support
function styleRuleWithOptions() {
    var options = Object.assign.apply(Object, [{}].concat(Array.prototype.slice.call(arguments))); //Simpler notation?
    // TODO: Remove this if you don't think it's appropiate, I thought a warning would do no harm
    if (!options.targetMethodName) {
        console.error("WARNING: targetMethodName not specified in the options (default is \"css\")");
    }
    var targetMethodName = options.targetMethodName || "css";

    function styleRuleDecorator(target, key, descriptor) {
        var initializer = descriptor.initializer,
            value = descriptor.value;


        descriptor.objInitializer = function () {
            var style = evaluateStyleRuleObject(this, initializer, value, options);

            if (options.inherit) {
                // Get the value we set in the prototype of the parent class
                var parentDesc = Object.getPrototypeOf(target)[getStyleRuleKey(key)];
                var parentStyle = evaluateStyleRuleObject(this, parentDesc.objInitializer, parentDesc.value, options);
                style = deepCopy({}, parentStyle, style);
                return style;
            }

            return style;
        };

        // Change the prototype of this object to be able to access the old descriptor/value
        target[options.getKey(key)] = Object.assign({}, descriptor);

        descriptor.initializer = function () {
            var style = descriptor.objInitializer.call(this);
            return this[targetMethodName](style);
        };

        delete descriptor.value;

        return lazyInit(target, key, descriptor);
    }

    return styleRuleDecorator;
}

// TODO: Second argument is mostly useless (implied from targetMethodName)
var styleRule = styleRuleWithOptions({
    targetMethodName: "css",
    getKey: getStyleRuleKey,
    inherit: false
});

var styleRuleInherit = styleRuleWithOptions({
    targetMethodName: "css",
    getKey: getStyleRuleKey,
    inherit: true
});

var keyframesRule = styleRuleWithOptions({
    targetMethodName: "keyframes",
    getKey: getKeyframesRuleKey,
    inherit: false
});

// TODO: This is currently not working (I think)
var keyframesRuleInherit = styleRuleWithOptions({
    targetMethodName: "keyframes",
    getKey: getKeyframesRuleKey,
    inherit: true
});

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
        _this.styleElement = StyleElement.create(options.parent, styleElementOptions);
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
            var element = new DynamicStyleElement({ style: style });
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
        key: "keyframes",
        value: function keyframes(_keyframes) {
            this.ensureFirstUpdate();
            // This is not really necessarily as I don't believe it will ever be used
            if (arguments.length > 1) {
                _keyframes = Object.assign.apply(Object, [{}].concat(Array.prototype.slice.call(arguments)));
            }
            var element = new KeyframeElement({ keyframe: _keyframes });
            this.elements.add(element);
            this.styleElement.appendChild(element);
            return element;
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

                    if (value instanceof StyleElement) {
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
            if (!this.hasOwnProperty("singletonInstance")) {
                this.singletonInstance = new this();
            }
            return this.singletonInstance;
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
        value: function set$$1(element, classInstance) {
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

// TODO: deprecate this global css method, or at least rewrite it
function css(style) {
    if (arguments.length > 1) {
        style = Object.assign.apply(Object, [{}].concat(Array.prototype.slice.call(arguments)));
    }
    // If using the exact same object, return the same class
    var styleWrapper = styleMap.get(style);
    if (!styleWrapper) {
        styleWrapper = DynamicStyleElement.create(document.body, { style: style });
        styleMap.set(style, styleWrapper);
    }
    return styleWrapper;
}

var _class;
var _descriptor;
var _descriptor2;
var _descriptor3;
var _descriptor4;
var _descriptor5;
var _descriptor6;
var _class3;
var _descriptor7;
var _descriptor8;
var _descriptor9;
var _class5;
var _temp3;
var _class6;
var _temp4;
var _class7;
var _temp5;

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

// TODO: this file was started with a lot of old patterns, that need to be updated
// TODO: remove everything from UI namespace, export instead
// TODO: need a major clean-up
var FormStyle = (_class = function (_StyleSet) {
    inherits(FormStyle, _StyleSet);

    function FormStyle() {
        var _ref;

        var _temp, _this, _ret;

        classCallCheck(this, FormStyle);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = possibleConstructorReturn(this, (_ref = FormStyle.__proto__ || Object.getPrototypeOf(FormStyle)).call.apply(_ref, [this].concat(args))), _this), _initDefineProp$1(_this, "form", _descriptor, _this), _initDefineProp$1(_this, "formGroup", _descriptor2, _this), _initDefineProp$1(_this, "formField", _descriptor3, _this), _initDefineProp$1(_this, "sameLine", _descriptor4, _this), _this.separatedLineInputStyle = {
            marginRight: "0.5em",
            width: "100%",
            height: "2.4em"
        }, _initDefineProp$1(_this, "separatedLine", _descriptor5, _this), _initDefineProp$1(_this, "hasError", _descriptor6, _this), _temp), possibleConstructorReturn(_this, _ret);
    }

    return FormStyle;
}(StyleSet), (_descriptor = _applyDecoratedDescriptor$1(_class.prototype, "form", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            margin: "0 auto"
        };
    }
}), _descriptor2 = _applyDecoratedDescriptor$1(_class.prototype, "formGroup", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            marginBottom: "10px"
        };
    }
}), _descriptor3 = _applyDecoratedDescriptor$1(_class.prototype, "formField", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            ">label": {
                width: "100%"
            },
            display: "block",
            padding: "6px 0px",
            lineHeight: "1.42857143",
            color: "#555",
            maxWidth: "600px",
            margin: "0 auto",
            "[disabled]": {
                opacity: "1",
                cursor: "not-allowed"
            },
            "[readonly]": {
                opacity: "1"
            }
        };
    }
}), _descriptor4 = _applyDecoratedDescriptor$1(_class.prototype, "sameLine", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            ">label>*:nth-child(1)": {
                display: "inline-block",
                textAlign: "right",
                paddingRight: "1em",
                width: "30%",
                verticalAlign: "middle"
            },
            ">label>*:nth-child(2)": {
                display: "inline-block",
                width: "70%",
                verticalAlign: "middle"
            }
        };
    }
}), _descriptor5 = _applyDecoratedDescriptor$1(_class.prototype, "separatedLine", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            padding: "6px 10px",
            ">label>input": this.separatedLineInputStyle,
            ">label>select": this.separatedLineInputStyle,
            ">label>textarea": this.separatedLineInputStyle,
            ">label>input[type='checkbox']": {
                marginLeft: "10px",
                verticalAlign: "middle"
            }
        };
    }
}), _descriptor6 = _applyDecoratedDescriptor$1(_class.prototype, "hasError", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            color: "#a94442"
        };
    }
})), _class);
var InputStyle = (_class3 = function (_StyleSet2) {
    inherits(InputStyle, _StyleSet2);

    function InputStyle() {
        var _ref2;

        var _temp2, _this2, _ret2;

        classCallCheck(this, InputStyle);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return _ret2 = (_temp2 = (_this2 = possibleConstructorReturn(this, (_ref2 = InputStyle.__proto__ || Object.getPrototypeOf(InputStyle)).call.apply(_ref2, [this].concat(args))), _this2), _initDefineProp$1(_this2, "inputElement", _descriptor7, _this2), _initDefineProp$1(_this2, "checkboxInput", _descriptor8, _this2), _initDefineProp$1(_this2, "select", _descriptor9, _this2), _temp2), possibleConstructorReturn(_this2, _ret2);
    }

    return InputStyle;
}(StyleSet), (_descriptor7 = _applyDecoratedDescriptor$1(_class3.prototype, "inputElement", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            transition: "border-color ease-in-out .15s, box-shadow ease-in-out .15s",
            padding: "0.4em 0.54em",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "90%",
            ":focus": {
                outline: "0",
                borderColor: "#66afe9",
                boxShadow: "inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102,175,233,.6)"
            }
        };
    }
}), _descriptor8 = _applyDecoratedDescriptor$1(_class3.prototype, "checkboxInput", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            marginLeft: "0.2em",
            display: "inline-block",
            width: "initial !important",
            marginRight: "0.5em"
        };
    }
}), _descriptor9 = _applyDecoratedDescriptor$1(_class3.prototype, "select", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            height: "2.12em"
        };
    }
})), _class3);
var Form = (_temp3 = _class5 = function (_UI$Primitive) {
    inherits(Form, _UI$Primitive);

    function Form() {
        classCallCheck(this, Form);
        return possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
    }

    createClass(Form, [{
        key: "getStyleSet",
        value: function getStyleSet() {
            return this.options.styleSet || this.constructor.styleSet;
        }
    }, {
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            attr.addClass(this.getStyleSet().form);
        }
    }, {
        key: "onMount",
        value: function onMount() {
            // Insert here code to not refresh page
        }
    }]);
    return Form;
}(UI.Primitive("form")), _class5.styleSet = FormStyle.getInstance(), _temp3);
var InputableElement = (_temp4 = _class6 = function (_UI$Element) {
    inherits(InputableElement, _UI$Element);

    function InputableElement() {
        classCallCheck(this, InputableElement);
        return possibleConstructorReturn(this, (InputableElement.__proto__ || Object.getPrototypeOf(InputableElement)).apply(this, arguments));
    }

    createClass(InputableElement, [{
        key: "getStyleSet",
        value: function getStyleSet() {
            return this.options.styleSet || this.constructor.styleSet;
        }
    }, {
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            get(InputableElement.prototype.__proto__ || Object.getPrototypeOf(InputableElement.prototype), "extraNodeAttributes", this).call(this, attr);
            attr.addClass(this.getStyleSet().inputElement);
        }
    }]);
    return InputableElement;
}(UI.Element), _class6.styleSet = InputStyle.getInstance(), _temp4);

var Input = function (_UI$Primitive2) {
    inherits(Input, _UI$Primitive2);

    function Input() {
        classCallCheck(this, Input);
        return possibleConstructorReturn(this, (Input.__proto__ || Object.getPrototypeOf(Input)).apply(this, arguments));
    }

    createClass(Input, [{
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            var type = this.getInputType();
            if (type) {
                attr.setAttribute("type", type);
            }
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
}(UI.Primitive(InputableElement, "input"));

Input.domAttributesMap = CreateNodeAttributesMap(UI.Element.domAttributesMap, [["autocomplete"], ["autofocus", { noValue: true }], ["formaction"], ["maxLength", { domName: "maxlength" }], ["minLength", { domName: "minlength" }], ["name"], ["placeholder"], ["readonly"], ["required"], ["value"]]);

var FormGroup = (_temp5 = _class7 = function (_UI$Element2) {
    inherits(FormGroup, _UI$Element2);

    function FormGroup() {
        classCallCheck(this, FormGroup);
        return possibleConstructorReturn(this, (FormGroup.__proto__ || Object.getPrototypeOf(FormGroup)).apply(this, arguments));
    }

    createClass(FormGroup, [{
        key: "getStyleSet",
        value: function getStyleSet() {
            return this.options.styleSet || this.constructor.styleSet;
        }
    }, {
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            attr.addClass(this.getStyleSet().formGroup);
        }
    }, {
        key: "setError",
        value: function setError(errorMessage) {
            this.errorField.node.textContent = errorMessage;
            this.addClass(this.getStyleSet().hasError);
        }
    }, {
        key: "removeError",
        value: function removeError() {
            this.errorField.node.textContent = "";
            this.removeClass(this.getStyleSet().hasError);
        }
    }, {
        key: "getErrorField",
        value: function getErrorField() {
            return UI.createElement("span", { ref: "errorField" });
        }
    }, {
        key: "render",
        value: function render() {
            return [this.getGivenChildren(), this.getErrorField()];
        }
    }]);
    return FormGroup;
}(UI.Element), _class7.styleSet = FormStyle.getInstance(), _temp5);

var FormField = function (_FormGroup) {
    inherits(FormField, _FormGroup);

    function FormField() {
        classCallCheck(this, FormField);
        return possibleConstructorReturn(this, (FormField.__proto__ || Object.getPrototypeOf(FormField)).apply(this, arguments));
    }

    createClass(FormField, [{
        key: "inline",
        value: function inline() {
            return !(this.options.inline === false || this.parent && this.parent.options && this.parent.options.inline === false);
        }
    }, {
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            attr.addClass(this.getStyleSet().formField);
            if (this.inline()) {
                attr.addClass(this.getStyleSet().sameLine);
            } else {
                attr.addClass(this.getStyleSet().separatedLine);
            }
        }
    }, {
        key: "getLabel",
        value: function getLabel() {
            if (this.options.label) {
                return UI.createElement(
                    "strong",
                    null,
                    this.options.label
                );
            }
            return null;
        }
    }, {
        key: "getGivenChildren",
        value: function getGivenChildren() {
            if (this.options.contentFirst) {
                return [UI.createElement(
                    "label",
                    null,
                    [get(FormField.prototype.__proto__ || Object.getPrototypeOf(FormField.prototype), "getGivenChildren", this).call(this), this.getLabel()]
                )];
            } else {
                return [UI.createElement(
                    "label",
                    null,
                    [this.getLabel(), get(FormField.prototype.__proto__ || Object.getPrototypeOf(FormField.prototype), "getGivenChildren", this).call(this)]
                )];
            }
        }
    }]);
    return FormField;
}(FormGroup);

var SubmitInput = function (_Input) {
    inherits(SubmitInput, _Input);

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
}(Input);

SubmitInput.domAttributesMap = CreateNodeAttributesMap(UI.Element.domAttributesMap, [["formenctype"], ["formmethod"], ["formnovalidate"], ["formtarget"]]);

var TextInput = function (_Input2) {
    inherits(TextInput, _Input2);

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
}(Input);



var NumberInput = function (_Input3) {
    inherits(NumberInput, _Input3);

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
}(Input);


NumberInput.domAttributesMap = CreateNodeAttributesMap(UI.Element.domAttributesMap, [["min"], ["max"], ["step"]]);

var EmailInput = function (_Input4) {
    inherits(EmailInput, _Input4);

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
}(Input);



var PasswordInput = function (_Input5) {
    inherits(PasswordInput, _Input5);

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
}(Input);



var FileInput = function (_Input6) {
    inherits(FileInput, _Input6);

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
}(Input);


FileInput.domAttributesMap = CreateNodeAttributesMap(UI.Element.domAttributesMap, [["multipleFiles", { domName: "multiple", noValue: true }], ["fileTypes", { domName: "accept" }]]);

var CheckboxInput = function (_Input7) {
    inherits(CheckboxInput, _Input7);

    function CheckboxInput() {
        classCallCheck(this, CheckboxInput);
        return possibleConstructorReturn(this, (CheckboxInput.__proto__ || Object.getPrototypeOf(CheckboxInput)).apply(this, arguments));
    }

    createClass(CheckboxInput, [{
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            get(CheckboxInput.prototype.__proto__ || Object.getPrototypeOf(CheckboxInput.prototype), "extraNodeAttributes", this).call(this, attr);
            attr.addClass(this.getStyleSet().checkboxInput);
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
}(Input);

CheckboxInput.domAttributesMap = CreateNodeAttributesMap(UI.Element.domAttributesMap, [["checked", { noValue: true }]]);

var TextArea = function (_UI$Primitive3) {
    inherits(TextArea, _UI$Primitive3);

    function TextArea() {
        classCallCheck(this, TextArea);
        return possibleConstructorReturn(this, (TextArea.__proto__ || Object.getPrototypeOf(TextArea)).apply(this, arguments));
    }

    createClass(TextArea, [{
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
}(UI.Primitive(InputableElement, "textarea"));

var Select = function (_UI$Primitive4) {
    inherits(Select, _UI$Primitive4);

    function Select() {
        classCallCheck(this, Select);
        return possibleConstructorReturn(this, (Select.__proto__ || Object.getPrototypeOf(Select)).apply(this, arguments));
    }

    createClass(Select, [{
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
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            get(Select.prototype.__proto__ || Object.getPrototypeOf(Select.prototype), "extraNodeAttributes", this).call(this, attr);
            attr.addClass(this.getStyleSet().select);
        }
    }, {
        key: "get",
        value: function get$$1() {
            var selectedIndex = this.getIndex();
            return this.givenOptions[selectedIndex];
        }
    }, {
        key: "set",
        value: function set$$1(value) {
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
}(UI.Primitive(InputableElement, "select"));

// Setting these attributes as styles in mozilla has no effect.
// To maintain compatibility between moz and webkit, whenever
// one of these attributes is set as a style, it is also set as a
// node attribute.
var MozStyleElements = new Set(["width", "height", "rx", "ry", "cx", "cy", "x", "y"]);

var SVGNodeAttributes = function (_NodeAttributes) {
    inherits(SVGNodeAttributes, _NodeAttributes);

    function SVGNodeAttributes(obj) {
        classCallCheck(this, SVGNodeAttributes);

        var _this = possibleConstructorReturn(this, (SVGNodeAttributes.__proto__ || Object.getPrototypeOf(SVGNodeAttributes)).call(this, obj));

        _this.className = null;
        return _this;
    }

    createClass(SVGNodeAttributes, [{
        key: "fixMozAttributes",
        value: function fixMozAttributes(node) {
            if (this.hasOwnProperty("style")) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = MozStyleElements.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var attributeName = _step.value;

                        if (this.style.hasOwnProperty(attributeName) && !this.hasOwnProperty(attributeName)) {
                            this.setAttribute(attributeName, this.style[attributeName], node);
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
        }
    }, {
        key: "setStyle",
        value: function setStyle(attributeName, value, node) {
            get(SVGNodeAttributes.prototype.__proto__ || Object.getPrototypeOf(SVGNodeAttributes.prototype), "setStyle", this).call(this, attributeName, value, node);
            if (MozStyleElements.has(attributeName)) {
                this.setAttribute(attributeName, value, node);
            }
        }
    }, {
        key: "apply",
        value: function apply(node, attributesMap) {
            this.transform = this.transform || this.translate;
            get(SVGNodeAttributes.prototype.__proto__ || Object.getPrototypeOf(SVGNodeAttributes.prototype), "apply", this).call(this, node, attributesMap);
            this.fixMozAttributes(node);
        }
    }]);
    return SVGNodeAttributes;
}(NodeAttributes);

var SVG = {};

SVG.Element = function (_UI$Element) {
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
        key: "getDefaultOptions",
        value: function getDefaultOptions() {
            return {};
        }
    }, {
        key: "setOptions",
        value: function setOptions(options) {
            if (typeof this.getDefaultOptions === "function") {
                var defaultOptions = this.getDefaultOptions();
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
        key: "setState",
        value: function setState(state) {
            this.setOptions(state.options);
        }
    }, {
        key: "getOptionsAsNodeAttributes",
        value: function getOptionsAsNodeAttributes() {
            var attr = this.options;
            attr.__proto__ = SVGNodeAttributes.prototype;
            return attr;
        }
    }, {
        key: "getNodeAttributes",
        value: function getNodeAttributes() {
            var returnCopy = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            if (returnCopy) {
                return new SVGNodeAttributes(this.options);
            } else {
                return this.getOptionsAsNodeAttributes();
            }
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
            return uniqueId(this);
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
        key: "remove",
        value: function remove() {}
    }, {
        key: "getSvg",
        value: function getSvg() {
            return this.parent.getSvg();
        }
    }]);
    return SVGElement;
}(UI.Element);

SVG.Element.domAttributesMap = CreateNodeAttributesMap(UI.Element.domAttributesMap, [["fill"], ["height"], ["opacity"], ["stroke"], ["strokeWidth", { domName: "stroke-width" }], ["clipPath", { domName: "clip-path" }], ["transform"], ["width"], ["cx"], ["cy"], ["rx"], ["ry"], ["x"], ["y"], ["x1"], ["y1"], ["x2"], ["y2"], ["offset"], ["stopColor", { domName: "stop-color" }], ["strokeDasharray", { domName: "stroke-dasharray" }], ["strokeLinecap", { domName: "stroke-linecap" }]]);

SVG.Text = function (_SVG$Element) {
    inherits(SVGText, _SVG$Element);

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
        key: "getDefaultOptions",
        value: function getDefaultOptions() {
            return {
                text: "",
                fontSize: "15px",
                color: "black",
                dy: "0.35em",
                textAnchor: "middle",
                selectable: false
            };
        }
    }, {
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            // TODO: For some reason, still selectable in mozilla...
            if (!this.options.selectable) {
                attr.setStyle("-webkit-user-select", "none");
                attr.setStyle("-khtml-user-select", "none");
                attr.setStyle("-moz-user-select", "none");
                attr.setStyle("-ms-user-select", "none");
                attr.setStyle("user-select", "none");
            }
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
            this.options.text = text;
            this.textElement.setValue(text + "");
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
    }]);
    return SVGText;
}(SVG.Element);

SVG.Text.domAttributesMap = CreateNodeAttributesMap(SVG.Element.domAttributesMap, [["dx"], ["dy"], ["fontFamily", { domName: "font-family" }], ["fontSize", { domName: "font-size" }], ["textAnchor", { domName: "text-anchor" }]]);

// TODO: this whole file is mosly here to not break compatibility with pre-Stem code, need refactoring
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

SVG.SVGRoot = function (_SVG$Element) {
    inherits(SVGRoot, _SVG$Element);

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
        key: "getSvg",
        value: function getSvg() {
            return this;
        }
    }]);
    return SVGRoot;
}(SVG.Element);

SVG.RawSVG = function (_SVG$SVGRoot) {
    inherits(RawSVG, _SVG$SVGRoot);

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
}(SVG.SVGRoot);

SVG.Group = function (_SVG$Element2) {
    inherits(SVGGroup, _SVG$Element2);

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
}(SVG.Element);

SVG.Defs = function (_SVG$Element3) {
    inherits(SVGDefs, _SVG$Element3);

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
}(SVG.Element);

SVG.ClipPath = function (_SVG$Element4) {
    inherits(ClipPath, _SVG$Element4);

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
}(SVG.Element);

SVG.Path = function (_SVG$Element5) {
    inherits(SVGPath, _SVG$Element5);

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
        key: "getDefaultOptions",
        value: function getDefaultOptions() {
            return {
                d: ""
            };
        }
    }, {
        key: "getNodeAttributes",
        value: function getNodeAttributes() {
            var attr = get(SVGPath.prototype.__proto__ || Object.getPrototypeOf(SVGPath.prototype), "getNodeAttributes", this).call(this);
            attr.setAttribute("d", this.getPath());
            return attr;
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
    }, {
        key: "getPointAtLengthWithAngle",
        value: function getPointAtLengthWithAngle(len) {
            var totalLength = this.getLength();
            var epsilon = void 0;
            if (totalLength <= 1) {
                epsilon = totalLength / 1000;
            } else {
                epsilon = Math.min(totalLength / 1000, Math.log(totalLength), 1);
            }
            var p1 = this.getPointAtLength(len);
            var p2 = this.getPointAtLength(Math.min(len + epsilon, totalLength));
            var p3 = this.getPointAtLength(Math.max(len - epsilon, 0));
            return {
                x: p1.x,
                y: p1.y,
                alpha: 180 * Math.atan2(p3.y - p2.y, p3.x - p2.x) / Math.PI
            };
        }
    }]);
    return SVGPath;
}(SVG.Element);

SVG.Circle = function (_SVG$Element6) {
    inherits(SVGCircle, _SVG$Element6);

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
        key: "getDefaultOptions",
        value: function getDefaultOptions() {
            return {
                radius: 0,
                center: { x: 0, y: 0 }
            };
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
            return new SVG.Path({ d: pathString });
        }
    }]);
    return SVGCircle;
}(SVG.Element);

//TODO Complete this class
SVG.Ellipse = function (_SVG$Element7) {
    inherits(SVGEllipse, _SVG$Element7);

    function SVGEllipse() {
        classCallCheck(this, SVGEllipse);
        return possibleConstructorReturn(this, (SVGEllipse.__proto__ || Object.getPrototypeOf(SVGEllipse)).apply(this, arguments));
    }

    createClass(SVGEllipse, [{
        key: "getNodeType",
        value: function getNodeType() {
            return "ellipse";
        }
    }]);
    return SVGEllipse;
}(SVG.Element);

SVG.CircleArc = function (_SVG$Path) {
    inherits(SVGCircleArc, _SVG$Path);

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
}(SVG.Path);

SVG.Rect = function (_SVG$Element8) {
    inherits(SVGRect, _SVG$Element8);

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
    }]);
    return SVGRect;
}(SVG.Element);

SVG.Line = function (_SVG$Element9) {
    inherits(SVGLine, _SVG$Element9);

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
        key: "getDefaultOptions",
        value: function getDefaultOptions() {
            return {
                fill: "black",
                stroke: "black"
            };
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
    }]);
    return SVGLine;
}(SVG.Element);

SVG.Polygon = function (_SVG$Path2) {
    inherits(Polygon, _SVG$Path2);

    function Polygon() {
        classCallCheck(this, Polygon);
        return possibleConstructorReturn(this, (Polygon.__proto__ || Object.getPrototypeOf(Polygon)).apply(this, arguments));
    }

    createClass(Polygon, [{
        key: "getDefaultOptions",
        value: function getDefaultOptions() {
            return {
                points: []
            };
        }
    }, {
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
    }]);
    return Polygon;
}(SVG.Path);

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

    // WTF, so basically JSON.stringify??


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
            return values;
        }

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
        darkenPercents = [0.05, 0, 0.05, 0.1, 0.15, 0.3, 0.8];
    } else {
        darkenPercents = [-0.3, 0, 0.1, 0.2, 0.23, 0.1, -1];
    }
    for (var i = 0; i < darkenPercents.length; i += 1) {
        colors.push(darken(color, darkenPercents[i]));
    }
    return colors;
}

SVG.AnimatedSVG = function (_SVG$SVGRoot) {
    inherits(AnimatedSVG, _SVG$SVGRoot);

    function AnimatedSVG() {
        classCallCheck(this, AnimatedSVG);
        return possibleConstructorReturn(this, (AnimatedSVG.__proto__ || Object.getPrototypeOf(AnimatedSVG)).apply(this, arguments));
    }

    createClass(AnimatedSVG, [{
        key: "onMount",
        value: function onMount() {
            var _this2 = this;

            if (this.options.transition) {
                this.options.transition.setStartTime(Date.now());
                var animationWrapper = function animationWrapper() {
                    if (_this2.options.transition.isStopped()) {
                        if (_this2.options.repeat) {
                            _this2.options.transition.setStartTime(Date.now());
                            _this2.options.transition.restart();
                            requestAnimationFrame(animationWrapper);
                        }
                        return;
                    }
                    if (!_this2.options.transition.pauseTime) {
                        _this2.options.transition.nextStep();
                    }
                    requestAnimationFrame(animationWrapper);
                };
                requestAnimationFrame(animationWrapper);
            }
        }
    }]);
    return AnimatedSVG;
}(SVG.SVGRoot);

SVG.Element.prototype.blinkTransition = function (options) {
    var _this3 = this;

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
                _this3.setColor(context.firstColor);
            } else {
                _this3.setColor(Math.floor((1 - t) / context.interval) % 2 === 1 ? context.firstColor : context.secondColor);
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
};
SVG.Element.prototype.changeOpacityTransition = function (opacity, duration) {
    var _this4 = this;

    var dependsOn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    var startTime = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    if (!this.options.hasOwnProperty("opacity")) {
        this.options.opacity = 1;
    }
    return new Transition({
        func: function func(t, context) {
            _this4.setOpacity((1 - t) * context.opacity + t * opacity);
        },
        context: {
            opacity: this.options.opacity
        },
        duration: duration,
        startTime: startTime,
        dependsOn: dependsOn
    });
};
SVG.Element.prototype.changeColorTransition = function (color, duration) {
    var _this5 = this;

    var dependsOn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    var startTime = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    return new Transition({
        func: function func(t, context) {
            _this5.setColor(Color.interpolate(context.color, color, t));
        },
        context: {
            color: this.getColor()
        },
        duration: duration,
        startTime: startTime,
        dependsOn: dependsOn
    });
};

SVG.Text.prototype.moveTransition = function (coords, duration) {
    var _this6 = this;

    var dependsOn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    var startTime = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    return new Transition({
        func: function func(t, context) {
            _this6.setPosition((1 - t) * context.x + t * coords.x, (1 - t) * context.y + t * coords.y);
        },
        context: {
            x: this.options.x,
            y: this.options.y
        },
        duration: duration,
        startTime: startTime,
        dependsOn: dependsOn
    });
};
SVG.Text.prototype.changeFillTransition = function (color, duration) {
    var _this7 = this;

    var dependsOn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    var startTime = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    return new Transition({
        func: function func(t, context) {
            _this7.setColor(Color.interpolate(context.color, color, t), true);
        },
        context: {
            color: this.getColor()
        },
        duration: duration,
        startTime: startTime,
        dependsOn: dependsOn
    });
};

var _class$2;
var _descriptor$2;
var _descriptor2$2;
var _class3$2;
var _descriptor3$2;
var _class7$1;
var _descriptor13;
var _descriptor14;
var _descriptor15;
var _descriptor16;
var _descriptor17;
var _descriptor18;
var _class9;
var _descriptor19;
var _descriptor20;
var _descriptor21;
var _descriptor22;
var _descriptor23;
var _descriptor24;
var _class11;
var _descriptor25;
var _descriptor26;
var _descriptor27;
var _descriptor28;
var _descriptor29;
var _descriptor30;
var _class20;
var _descriptor37;
var _descriptor38;
var _descriptor39;
var _descriptor40;
var _descriptor41;
var _descriptor42;
var _descriptor43;
var _descriptor44;
var _descriptor45;
var _class22;
var _descriptor46;
var _descriptor47;
var _class24;
var _descriptor48;
var _descriptor49;
var _descriptor50;
var _descriptor51;
var _descriptor52;

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

var GlobalStyle = {};

var COLOR = {
    PLAIN: "#ffffff",
    GRAY: "#777",
    PRIMARY: "#337ab7",
    SUCCESS: "#5cb85c",
    INFO: "#5bc0de",
    WARNING: "#f0ad4e",
    DANGER: "#d9534f",
    GOOGLE: "#de4b39",
    FACEBOOK: "#3b5998"
};

var ButtonGroupStyle = (_class$2 = function (_StyleSet) {
    inherits(ButtonGroupStyle, _StyleSet);

    function ButtonGroupStyle() {
        var _ref;

        var _temp, _this, _ret;

        classCallCheck(this, ButtonGroupStyle);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = possibleConstructorReturn(this, (_ref = ButtonGroupStyle.__proto__ || Object.getPrototypeOf(ButtonGroupStyle)).call.apply(_ref, [this].concat(args))), _this), _initDefineProp$3(_this, "HORIZONTAL", _descriptor$2, _this), _initDefineProp$3(_this, "VERTICAL", _descriptor2$2, _this), _temp), possibleConstructorReturn(_this, _ret);
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
}(StyleSet), (_descriptor$2 = _applyDecoratedDescriptor$3(_class$2.prototype, "HORIZONTAL", [styleRule], {
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
}), _descriptor2$2 = _applyDecoratedDescriptor$3(_class$2.prototype, "VERTICAL", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            ">*": {
                "margin-top": "5px",
                "display": "block"
            },
            ">:first-child": {
                "margin-top": "0px"
            }
        };
    }
})), _class$2);
var RadioButtonGroupStyle = (_class3$2 = function (_StyleSet2) {
    inherits(RadioButtonGroupStyle, _StyleSet2);

    function RadioButtonGroupStyle() {
        var _ref2;

        var _temp2, _this2, _ret2;

        classCallCheck(this, RadioButtonGroupStyle);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return _ret2 = (_temp2 = (_this2 = possibleConstructorReturn(this, (_ref2 = RadioButtonGroupStyle.__proto__ || Object.getPrototypeOf(RadioButtonGroupStyle)).call.apply(_ref2, [this].concat(args))), _this2), _initDefineProp$3(_this2, "DEFAULT", _descriptor3$2, _this2), _temp2), possibleConstructorReturn(_this2, _ret2);
    }

    return RadioButtonGroupStyle;
}(StyleSet), (_descriptor3$2 = _applyDecoratedDescriptor$3(_class3$2.prototype, "DEFAULT", [styleRule], {
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
})), _class3$2);


function BasicLevelStyleSet(colorClassFunction) {
    var _desc3, _value3, _class5, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12;

    var BasicLevelStyleClass = (_class5 = function (_StyleSet3) {
        inherits(BasicLevelStyleClass, _StyleSet3);

        function BasicLevelStyleClass() {
            var _ref3;

            var _temp3, _this3, _ret3;

            classCallCheck(this, BasicLevelStyleClass);

            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                args[_key3] = arguments[_key3];
            }

            return _ret3 = (_temp3 = (_this3 = possibleConstructorReturn(this, (_ref3 = BasicLevelStyleClass.__proto__ || Object.getPrototypeOf(BasicLevelStyleClass)).call.apply(_ref3, [this].concat(args))), _this3), _this3.colorClassBuilder = colorClassFunction, _initDefineProp$3(_this3, "PLAIN", _descriptor4, _this3), _initDefineProp$3(_this3, "GRAY", _descriptor5, _this3), _initDefineProp$3(_this3, "PRIMARY", _descriptor6, _this3), _initDefineProp$3(_this3, "SUCCESS", _descriptor7, _this3), _initDefineProp$3(_this3, "INFO", _descriptor8, _this3), _initDefineProp$3(_this3, "WARNING", _descriptor9, _this3), _initDefineProp$3(_this3, "DANGER", _descriptor10, _this3), _initDefineProp$3(_this3, "GOOGLE", _descriptor11, _this3), _initDefineProp$3(_this3, "FACEBOOK", _descriptor12, _this3), _temp3), possibleConstructorReturn(_this3, _ret3);
        }

        createClass(BasicLevelStyleClass, [{
            key: "Level",
            value: function Level(level) {
                if (this[level]) {
                    return this[level];
                }
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = Object.keys(UI.Level)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var type = _step2.value;

                        if (level == UI.Level[type]) {
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
        }]);
        return BasicLevelStyleClass;
    }(StyleSet), (_descriptor4 = _applyDecoratedDescriptor$3(_class5.prototype, "PLAIN", [styleRule], {
        enumerable: true,
        initializer: function initializer() {
            return {};
        }
    }), _descriptor5 = _applyDecoratedDescriptor$3(_class5.prototype, "GRAY", [styleRule], {
        enumerable: true,
        initializer: function initializer() {
            return {};
        }
    }), _descriptor6 = _applyDecoratedDescriptor$3(_class5.prototype, "PRIMARY", [styleRule], {
        enumerable: true,
        initializer: function initializer() {
            return this.colorClassBuilder(buildColors(COLOR.PRIMARY));
        }
    }), _descriptor7 = _applyDecoratedDescriptor$3(_class5.prototype, "SUCCESS", [styleRule], {
        enumerable: true,
        initializer: function initializer() {
            return this.colorClassBuilder(buildColors(COLOR.SUCCESS));
        }
    }), _descriptor8 = _applyDecoratedDescriptor$3(_class5.prototype, "INFO", [styleRule], {
        enumerable: true,
        initializer: function initializer() {
            return this.colorClassBuilder(buildColors(COLOR.INFO));
        }
    }), _descriptor9 = _applyDecoratedDescriptor$3(_class5.prototype, "WARNING", [styleRule], {
        enumerable: true,
        initializer: function initializer() {
            return this.colorClassBuilder(buildColors(COLOR.WARNING));
        }
    }), _descriptor10 = _applyDecoratedDescriptor$3(_class5.prototype, "DANGER", [styleRule], {
        enumerable: true,
        initializer: function initializer() {
            return this.colorClassBuilder(buildColors(COLOR.DANGER));
        }
    }), _descriptor11 = _applyDecoratedDescriptor$3(_class5.prototype, "GOOGLE", [styleRule], {
        enumerable: true,
        initializer: function initializer() {
            return this.colorClassBuilder(buildColors(COLOR.GOOGLE));
        }
    }), _descriptor12 = _applyDecoratedDescriptor$3(_class5.prototype, "FACEBOOK", [styleRule], {
        enumerable: true,
        initializer: function initializer() {
            return this.colorClassBuilder(buildColors(COLOR.FACEBOOK));
        }
    })), _class5);


    return BasicLevelStyleClass;
}

var buttonColorClassBuilder = function buttonColorClassBuilder(colors) {
    var darker1 = {
        backgroundColor: colors[2]
    };
    var darker2 = {
        backgroundColor: colors[3]
    };
    var darker3 = {
        backgroundColor: colors[4]
    };
    var regular = {
        backgroundColor: colors[1],
        borderColor: colors[5],
        color: colors[6]
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
};

var ButtonStyle = (_class7$1 = function (_BasicLevelStyleSet) {
    inherits(ButtonStyle, _BasicLevelStyleSet);

    function ButtonStyle() {
        var _ref4;

        var _temp4, _this4, _ret4;

        classCallCheck(this, ButtonStyle);

        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
        }

        return _ret4 = (_temp4 = (_this4 = possibleConstructorReturn(this, (_ref4 = ButtonStyle.__proto__ || Object.getPrototypeOf(ButtonStyle)).call.apply(_ref4, [this].concat(args))), _this4), _initDefineProp$3(_this4, "DEFAULT", _descriptor13, _this4), _initDefineProp$3(_this4, "EXTRA_SMALL", _descriptor14, _this4), _initDefineProp$3(_this4, "SMALL", _descriptor15, _this4), _initDefineProp$3(_this4, "MEDIUM", _descriptor16, _this4), _initDefineProp$3(_this4, "LARGE", _descriptor17, _this4), _initDefineProp$3(_this4, "EXTRA_LARGE", _descriptor18, _this4), _temp4), possibleConstructorReturn(_this4, _ret4);
    }

    createClass(ButtonStyle, [{
        key: "Size",
        value: function Size(size) {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = Object.keys(UI.Size)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var type = _step3.value;

                    if (size == UI.Size[type]) {
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
}(BasicLevelStyleSet(buttonColorClassBuilder)), (_descriptor13 = _applyDecoratedDescriptor$3(_class7$1.prototype, "DEFAULT", [styleRule], {
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
            fontSize: "14px"
        }, this.colorClassBuilder(buildColors(COLOR.PLAIN))];
    }
}), _descriptor14 = _applyDecoratedDescriptor$3(_class7$1.prototype, "EXTRA_SMALL", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            fontSize: "12px",
            padding: "0.2em 0.4em",
            borderWidth: "0.05em"
        };
    }
}), _descriptor15 = _applyDecoratedDescriptor$3(_class7$1.prototype, "SMALL", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            fontSize: "12px"
        };
    }
}), _descriptor16 = _applyDecoratedDescriptor$3(_class7$1.prototype, "MEDIUM", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {};
    }
}), _descriptor17 = _applyDecoratedDescriptor$3(_class7$1.prototype, "LARGE", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            fontSize: "17px"
        };
    }
}), _descriptor18 = _applyDecoratedDescriptor$3(_class7$1.prototype, "EXTRA_LARGE", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            fontSize: "21px",
            padding: "0.2em 0.4em"
        };
    }
})), _class7$1);


var labelColorClassBuilder = function labelColorClassBuilder(colors) {
    var darker = {
        backgroundColor: colors[2],
        color: colors[6],
        textDecoration: "none"
    };
    var regular = {
        backgroundColor: colors[1],
        borderColor: colors[5],
        color: colors[6]
    };
    return Object.assign({}, regular, {
        ":hover": darker,
        ":hover:disabled": regular,
        ":focus": darker,
        ":active": darker
    });
};

var LabelStyle = (_class9 = function (_BasicLevelStyleSet2) {
    inherits(LabelStyle, _BasicLevelStyleSet2);

    function LabelStyle() {
        var _ref5;

        var _temp5, _this5, _ret5;

        classCallCheck(this, LabelStyle);

        for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
            args[_key5] = arguments[_key5];
        }

        return _ret5 = (_temp5 = (_this5 = possibleConstructorReturn(this, (_ref5 = LabelStyle.__proto__ || Object.getPrototypeOf(LabelStyle)).call.apply(_ref5, [this].concat(args))), _this5), _initDefineProp$3(_this5, "DEFAULT", _descriptor19, _this5), _initDefineProp$3(_this5, "EXTRA_SMALL", _descriptor20, _this5), _initDefineProp$3(_this5, "SMALL", _descriptor21, _this5), _initDefineProp$3(_this5, "MEDIUM", _descriptor22, _this5), _initDefineProp$3(_this5, "LARGE", _descriptor23, _this5), _initDefineProp$3(_this5, "EXTRA_LARGE", _descriptor24, _this5), _temp5), possibleConstructorReturn(_this5, _ret5);
    }

    createClass(LabelStyle, [{
        key: "Size",
        value: function Size(size) {
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = Object.keys(UI.Size)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var type = _step4.value;

                    if (size == UI.Size[type]) {
                        return this[type];
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
    }]);
    return LabelStyle;
}(BasicLevelStyleSet(labelColorClassBuilder)), (_descriptor19 = _applyDecoratedDescriptor$3(_class9.prototype, "DEFAULT", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return [{
            fontWeight: "bold",
            border: "0.1em solid transparent",
            padding: "0.07em 0.4em",
            borderRadius: "0.3em",
            textAlign: "center",
            whiteSpace: "nowrap",
            verticalAlign: "bottom",
            lineHeight: 4 / 3 + "",
            display: "inline-block",
            touchAction: "manipulation",
            ":disabled": {
                opacity: "0.7",
                cursor: "not-allowed"
            }
        }, {
            "font-size": "12px"
        }, this.colorClassBuilder(buildColors(COLOR.GRAY))];
    }
}), _descriptor20 = _applyDecoratedDescriptor$3(_class9.prototype, "EXTRA_SMALL", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            fontSize: "10px",
            padding: "0.05em 0.2em",
            borderWidth: "0.05em"
        };
    }
}), _descriptor21 = _applyDecoratedDescriptor$3(_class9.prototype, "SMALL", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            fontSize: "10px"
        };
    }
}), _descriptor22 = _applyDecoratedDescriptor$3(_class9.prototype, "MEDIUM", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {};
    }
}), _descriptor23 = _applyDecoratedDescriptor$3(_class9.prototype, "LARGE", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            fontSize: "14px"
        };
    }
}), _descriptor24 = _applyDecoratedDescriptor$3(_class9.prototype, "EXTRA_LARGE", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            fontSize: "17px",
            padding: "0.05em 0.2em"
        };
    }
})), _class9);


var BadgeStyle = (_class11 = function (_BasicLevelStyleSet3) {
    inherits(BadgeStyle, _BasicLevelStyleSet3);

    function BadgeStyle() {
        var _ref6;

        var _temp6, _this6, _ret6;

        classCallCheck(this, BadgeStyle);

        for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
            args[_key6] = arguments[_key6];
        }

        return _ret6 = (_temp6 = (_this6 = possibleConstructorReturn(this, (_ref6 = BadgeStyle.__proto__ || Object.getPrototypeOf(BadgeStyle)).call.apply(_ref6, [this].concat(args))), _this6), _initDefineProp$3(_this6, "DEFAULT", _descriptor25, _this6), _initDefineProp$3(_this6, "EXTRA_SMALL", _descriptor26, _this6), _initDefineProp$3(_this6, "SMALL", _descriptor27, _this6), _initDefineProp$3(_this6, "MEDIUM", _descriptor28, _this6), _initDefineProp$3(_this6, "LARGE", _descriptor29, _this6), _initDefineProp$3(_this6, "EXTRA_LARGE", _descriptor30, _this6), _temp6), possibleConstructorReturn(_this6, _ret6);
    }

    createClass(BadgeStyle, [{
        key: "Size",
        value: function Size(size) {
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = Object.keys(UI.Size)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var type = _step5.value;

                    if (size == UI.Size[type]) {
                        return this[type];
                    }
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
    }]);
    return BadgeStyle;
}(BasicLevelStyleSet(labelColorClassBuilder)), (_descriptor25 = _applyDecoratedDescriptor$3(_class11.prototype, "DEFAULT", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return [{
            display: "inline-block",
            padding: "0.25em 0.55em",
            fontWeight: "700",
            lineHeight: "1",
            color: "#fff",
            textAlign: "center",
            whiteSpace: "nowrap",
            verticalAlign: "middle",
            backgroundColor: "#777",
            borderRadius: "0.8em"
        }, {
            "font-size": "12px"
        }, this.colorClassBuilder(buildColors(COLOR.GRAY))];
    }
}), _descriptor26 = _applyDecoratedDescriptor$3(_class11.prototype, "EXTRA_SMALL", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            fontSize: "10px",
            padding: "0.1em 0.2em"
        };
    }
}), _descriptor27 = _applyDecoratedDescriptor$3(_class11.prototype, "SMALL", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            fontSize: "10px"
        };
    }
}), _descriptor28 = _applyDecoratedDescriptor$3(_class11.prototype, "MEDIUM", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {};
    }
}), _descriptor29 = _applyDecoratedDescriptor$3(_class11.prototype, "LARGE", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            fontSize: "14px"
        };
    }
}), _descriptor30 = _applyDecoratedDescriptor$3(_class11.prototype, "EXTRA_LARGE", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            fontSize: "17px",
            padding: "0.1em 0.2em"
        };
    }
})), _class11);


function cardPanelColorClassBuilder(color) {
    var _desc7, _value7, _class13, _descriptor31, _descriptor32;

    var colors = buildColors(color);
    var CardPanelLevelStyle = (_class13 = function (_StyleSet4) {
        inherits(CardPanelLevelStyle, _StyleSet4);

        function CardPanelLevelStyle() {
            var _ref7;

            var _temp7, _this7, _ret7;

            classCallCheck(this, CardPanelLevelStyle);

            for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
                args[_key7] = arguments[_key7];
            }

            return _ret7 = (_temp7 = (_this7 = possibleConstructorReturn(this, (_ref7 = CardPanelLevelStyle.__proto__ || Object.getPrototypeOf(CardPanelLevelStyle)).call.apply(_ref7, [this].concat(args))), _this7), _initDefineProp$3(_this7, "heading", _descriptor31, _this7), _initDefineProp$3(_this7, "panel", _descriptor32, _this7), _temp7), possibleConstructorReturn(_this7, _ret7);
        }

        return CardPanelLevelStyle;
    }(StyleSet), (_descriptor31 = _applyDecoratedDescriptor$3(_class13.prototype, "heading", [styleRule], {
        enumerable: true,
        initializer: function initializer() {
            return {
                color: colors[6],
                backgroundColor: colors[0],
                borderBottomColor: colors[4]
            };
        }
    }), _descriptor32 = _applyDecoratedDescriptor$3(_class13.prototype, "panel", [styleRule], {
        enumerable: true,
        initializer: function initializer() {
            return {
                borderColor: colors[4]
            };
        }
    })), _class13);


    return CardPanelLevelStyle;
}

function cardPanelSizeClassBuilder(fontSize) {
    var _desc8, _value8, _class15, _descriptor33;

    var panelStyle = {};
    if (fontSize) {
        panelStyle.fontSize = fontSize;
    }
    var CardPanelSizeStyle = (_class15 = function (_StyleSet5) {
        inherits(CardPanelSizeStyle, _StyleSet5);

        function CardPanelSizeStyle() {
            var _ref8;

            var _temp8, _this8, _ret8;

            classCallCheck(this, CardPanelSizeStyle);

            for (var _len8 = arguments.length, args = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
                args[_key8] = arguments[_key8];
            }

            return _ret8 = (_temp8 = (_this8 = possibleConstructorReturn(this, (_ref8 = CardPanelSizeStyle.__proto__ || Object.getPrototypeOf(CardPanelSizeStyle)).call.apply(_ref8, [this].concat(args))), _this8), _initDefineProp$3(_this8, "panel", _descriptor33, _this8), _temp8), possibleConstructorReturn(_this8, _ret8);
        }

        return CardPanelSizeStyle;
    }(StyleSet), (_descriptor33 = _applyDecoratedDescriptor$3(_class15.prototype, "panel", [styleRule], {
        enumerable: true,
        initializer: function initializer() {
            return panelStyle;
        }
    })), _class15);
    

    return CardPanelSizeStyle;
}

var CardPanelStyle$1 = function () {
    function CardPanelStyle() {
        classCallCheck(this, CardPanelStyle);

        this.defaultClassBuilder = function () {
            var _desc9, _value9, _class18, _descriptor34, _descriptor35, _descriptor36;

            var DefaultCardPanelStyle = (_class18 = function (_cardPanelColorClassB) {
                inherits(DefaultCardPanelStyle, _cardPanelColorClassB);

                function DefaultCardPanelStyle() {
                    var _ref9;

                    var _temp9, _this9, _ret9;

                    classCallCheck(this, DefaultCardPanelStyle);

                    for (var _len9 = arguments.length, args = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
                        args[_key9] = arguments[_key9];
                    }

                    return _ret9 = (_temp9 = (_this9 = possibleConstructorReturn(this, (_ref9 = DefaultCardPanelStyle.__proto__ || Object.getPrototypeOf(DefaultCardPanelStyle)).call.apply(_ref9, [this].concat(args))), _this9), _initDefineProp$3(_this9, "heading", _descriptor34, _this9), _initDefineProp$3(_this9, "body", _descriptor35, _this9), _initDefineProp$3(_this9, "panel", _descriptor36, _this9), _temp9), possibleConstructorReturn(_this9, _ret9);
                }

                return DefaultCardPanelStyle;
            }(cardPanelColorClassBuilder(COLOR.PLAIN)), (_descriptor34 = _applyDecoratedDescriptor$3(_class18.prototype, "heading", [styleRuleInherit], {
                enumerable: true,
                initializer: function initializer() {
                    return {
                        padding: "0.8em 1.2em",
                        borderBottomWidth: "0.08em",
                        borderBottomStyle: "solid"
                    };
                }
            }), _descriptor35 = _applyDecoratedDescriptor$3(_class18.prototype, "body", [styleRule], {
                enumerable: true,
                initializer: function initializer() {
                    return {
                        // padding: "0.35em",
                    };
                }
            }), _descriptor36 = _applyDecoratedDescriptor$3(_class18.prototype, "panel", [styleRuleInherit], {
                enumerable: true,
                initializer: function initializer() {
                    return {
                        borderWidth: "0.08em",
                        borderRadius: "0.3em",
                        borderStyle: "solid",
                        backgroundColor: "#ffffff"
                    };
                }
            })), _class18);


            return DefaultCardPanelStyle;
        };

        this.DEFAULT = new (this.defaultClassBuilder())();
        this.EXTRA_SMALL = new (cardPanelSizeClassBuilder("11px"))();
        this.SMALL = new (cardPanelSizeClassBuilder("12px"))();
        this.MEDIUM = new cardPanelSizeClassBuilder();
        this.LARGE = new (cardPanelSizeClassBuilder("17px"))();
        this.EXTRA_LARGE = new (cardPanelSizeClassBuilder("21px"))();
        this.PRIMARY = new (cardPanelColorClassBuilder(COLOR.PRIMARY))();
        this.SUCCESS = new (cardPanelColorClassBuilder(COLOR.SUCCESS))();
        this.INFO = new (cardPanelColorClassBuilder(COLOR.INFO))();
        this.WARNING = new (cardPanelColorClassBuilder(COLOR.WARNING))();
        this.DANGER = new (cardPanelColorClassBuilder(COLOR.DANGER))();
        this.GOOGLE = new (cardPanelColorClassBuilder(COLOR.GOOGLE))();
        this.FACEBOOK = new (cardPanelColorClassBuilder(COLOR.FACEBOOK))();
    }

    createClass(CardPanelStyle, [{
        key: "Size",
        value: function Size(size) {
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = Object.keys(UI.Size)[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var type = _step6.value;

                    if (size == UI.Size[type]) {
                        return this[type];
                    }
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                        _iterator6.return();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
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
            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = Object.keys(UI.Level)[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var type = _step7.value;

                    if (level == UI.Level[type]) {
                        return this[type];
                    }
                }
            } catch (err) {
                _didIteratorError7 = true;
                _iteratorError7 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion7 && _iterator7.return) {
                        _iterator7.return();
                    }
                } finally {
                    if (_didIteratorError7) {
                        throw _iteratorError7;
                    }
                }
            }
        }
    }]);
    return CardPanelStyle;
}();

var progressBarColorClassBuilder = function progressBarColorClassBuilder(colors) {
    return {
        backgroundColor: colors[1]
    };
};

var ProgressBarStyle = (_class20 = function (_BasicLevelStyleSet4) {
    inherits(ProgressBarStyle, _BasicLevelStyleSet4);

    function ProgressBarStyle() {
        var _ref10;

        var _temp10, _this10, _ret10;

        classCallCheck(this, ProgressBarStyle);

        for (var _len10 = arguments.length, args = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
            args[_key10] = arguments[_key10];
        }

        return _ret10 = (_temp10 = (_this10 = possibleConstructorReturn(this, (_ref10 = ProgressBarStyle.__proto__ || Object.getPrototypeOf(ProgressBarStyle)).call.apply(_ref10, [this].concat(args))), _this10), _initDefineProp$3(_this10, "CONTAINER", _descriptor37, _this10), _initDefineProp$3(_this10, "DEFAULT", _descriptor38, _this10), _initDefineProp$3(_this10, "STRIPED", _descriptor39, _this10), _initDefineProp$3(_this10, "ACTIVE", _descriptor40, _this10), _initDefineProp$3(_this10, "EXTRA_SMALL", _descriptor41, _this10), _initDefineProp$3(_this10, "SMALL", _descriptor42, _this10), _initDefineProp$3(_this10, "MEDIUM", _descriptor43, _this10), _initDefineProp$3(_this10, "LARGE", _descriptor44, _this10), _initDefineProp$3(_this10, "EXTRA_LARGE", _descriptor45, _this10), _temp10), possibleConstructorReturn(_this10, _ret10);
    }

    createClass(ProgressBarStyle, [{
        key: "Size",
        value: function Size(size) {
            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
                for (var _iterator8 = Object.keys(UI.Size)[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    var type = _step8.value;

                    if (size == UI.Size[type]) {
                        return this[type];
                    }
                }
            } catch (err) {
                _didIteratorError8 = true;
                _iteratorError8 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion8 && _iterator8.return) {
                        _iterator8.return();
                    }
                } finally {
                    if (_didIteratorError8) {
                        throw _iteratorError8;
                    }
                }
            }
        }
    }]);
    return ProgressBarStyle;
}(BasicLevelStyleSet(progressBarColorClassBuilder)), (_descriptor37 = _applyDecoratedDescriptor$3(_class20.prototype, "CONTAINER", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            height: "20px",
            marginBottom: "20px",
            overflow: "hidden",
            backgroundColor: "#f5f5f5",
            borderRadius: "4px",
            boxShadow: "inset 0 1px 2px rgba(0, 0, 0, .1)"
        };
    }
}), _descriptor38 = _applyDecoratedDescriptor$3(_class20.prototype, "DEFAULT", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return [{
            float: "left",
            width: "0",
            height: "100%",
            lineHeight: "20px",
            color: "#fff",
            textAlign: "center",
            backgroundColor: "#337ab7",
            boxShadow: "inset 0 -1px 0 rgba(0, 0, 0, .15)",
            transition: "width .6s ease",
            fontColor: "#ffffff"
        }, {
            fontSize: "12px"
        }, this.colorClassBuilder(buildColors(COLOR.PRIMARY))];
    }
}), _descriptor39 = _applyDecoratedDescriptor$3(_class20.prototype, "STRIPED", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            backgroundImage: "linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent)",
            backgroundSize: "40px 40px"
        };
    }
}), _descriptor40 = _applyDecoratedDescriptor$3(_class20.prototype, "ACTIVE", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            animation: "progress-bar-stripes 2s linear infinite"
        };
    }
}), _descriptor41 = _applyDecoratedDescriptor$3(_class20.prototype, "EXTRA_SMALL", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            fontSize: "8px"
        };
    }
}), _descriptor42 = _applyDecoratedDescriptor$3(_class20.prototype, "SMALL", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            fontSize: "10px"
        };
    }
}), _descriptor43 = _applyDecoratedDescriptor$3(_class20.prototype, "MEDIUM", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {};
    }
}), _descriptor44 = _applyDecoratedDescriptor$3(_class20.prototype, "LARGE", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            fontSize: "14px"
        };
    }
}), _descriptor45 = _applyDecoratedDescriptor$3(_class20.prototype, "EXTRA_LARGE", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            fontSize: "17px",
            padding: "0.1em 0.2em"
        };
    }
})), _class20);
var FlexContainerStyle = (_class22 = function (_StyleSet6) {
    inherits(FlexContainerStyle, _StyleSet6);

    function FlexContainerStyle() {
        var _ref11;

        var _temp11, _this11, _ret11;

        classCallCheck(this, FlexContainerStyle);

        for (var _len11 = arguments.length, args = Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
            args[_key11] = arguments[_key11];
        }

        return _ret11 = (_temp11 = (_this11 = possibleConstructorReturn(this, (_ref11 = FlexContainerStyle.__proto__ || Object.getPrototypeOf(FlexContainerStyle)).call.apply(_ref11, [this].concat(args))), _this11), _initDefineProp$3(_this11, "HORIZONTAL", _descriptor46, _this11), _initDefineProp$3(_this11, "VERTICAL", _descriptor47, _this11), _temp11), possibleConstructorReturn(_this11, _ret11);
    }

    createClass(FlexContainerStyle, [{
        key: "Orientation",
        value: function Orientation(orientation) {
            var _iteratorNormalCompletion9 = true;
            var _didIteratorError9 = false;
            var _iteratorError9 = undefined;

            try {
                for (var _iterator9 = Object.keys(UI.Orientation)[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                    var type = _step9.value;

                    if (orientation == UI.Orientation[type]) {
                        return this[type];
                    }
                }
            } catch (err) {
                _didIteratorError9 = true;
                _iteratorError9 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion9 && _iterator9.return) {
                        _iterator9.return();
                    }
                } finally {
                    if (_didIteratorError9) {
                        throw _iteratorError9;
                    }
                }
            }
        }
    }]);
    return FlexContainerStyle;
}(StyleSet), (_descriptor46 = _applyDecoratedDescriptor$3(_class22.prototype, "HORIZONTAL", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            display: "flex",
            ">*": {
                marginLeft: "20px",
                flex: "1"
            },
            ">:first-child": {
                marginLeft: "0px"
            }
        };
    }
}), _descriptor47 = _applyDecoratedDescriptor$3(_class22.prototype, "VERTICAL", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            display: "flex",
            flexDirection: "column",
            ">*": {
                marginTop: "20px",
                flex: "1"
            },
            ">:first-child": {
                marginTop: "0px"
            }
        };
    }
})), _class22);
var ContainerStyle = (_class24 = function (_StyleSet7) {
    inherits(ContainerStyle, _StyleSet7);

    function ContainerStyle() {
        var _ref12;

        var _temp12, _this12, _ret12;

        classCallCheck(this, ContainerStyle);

        for (var _len12 = arguments.length, args = Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {
            args[_key12] = arguments[_key12];
        }

        return _ret12 = (_temp12 = (_this12 = possibleConstructorReturn(this, (_ref12 = ContainerStyle.__proto__ || Object.getPrototypeOf(ContainerStyle)).call.apply(_ref12, [this].concat(args))), _this12), _initDefineProp$3(_this12, "EXTRA_SMALL", _descriptor48, _this12), _initDefineProp$3(_this12, "SMALL", _descriptor49, _this12), _initDefineProp$3(_this12, "MEDIUM", _descriptor50, _this12), _initDefineProp$3(_this12, "LARGE", _descriptor51, _this12), _initDefineProp$3(_this12, "EXTRA_LARGE", _descriptor52, _this12), _temp12), possibleConstructorReturn(_this12, _ret12);
    }

    createClass(ContainerStyle, [{
        key: "Size",
        value: function Size(size) {
            var _iteratorNormalCompletion10 = true;
            var _didIteratorError10 = false;
            var _iteratorError10 = undefined;

            try {
                for (var _iterator10 = Object.keys(UI.Size)[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                    var type = _step10.value;

                    if (size == UI.Size[type]) {
                        return this[type];
                    }
                }
            } catch (err) {
                _didIteratorError10 = true;
                _iteratorError10 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion10 && _iterator10.return) {
                        _iterator10.return();
                    }
                } finally {
                    if (_didIteratorError10) {
                        throw _iteratorError10;
                    }
                }
            }
        }
    }]);
    return ContainerStyle;
}(StyleSet), (_descriptor48 = _applyDecoratedDescriptor$3(_class24.prototype, "EXTRA_SMALL", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            margin: "0% 15%"
        };
    }
}), _descriptor49 = _applyDecoratedDescriptor$3(_class24.prototype, "SMALL", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            margin: "0% 10%"
        };
    }
}), _descriptor50 = _applyDecoratedDescriptor$3(_class24.prototype, "MEDIUM", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            margin: "0% 6%"
        };
    }
}), _descriptor51 = _applyDecoratedDescriptor$3(_class24.prototype, "LARGE", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            margin: "0% 3%"
        };
    }
}), _descriptor52 = _applyDecoratedDescriptor$3(_class24.prototype, "EXTRA_LARGE", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            margin: "0% 1%"
        };
    }
})), _class24);


GlobalStyle.Button = ButtonStyle.getInstance();
GlobalStyle.RadioButtonGroup = RadioButtonGroupStyle.getInstance();
GlobalStyle.ButtonGroup = ButtonGroupStyle.getInstance();
GlobalStyle.Label = LabelStyle.getInstance();
GlobalStyle.Badge = BadgeStyle.getInstance();
GlobalStyle.CardPanel = new CardPanelStyle$1();
GlobalStyle.ProgressBar = ProgressBarStyle.getInstance();
GlobalStyle.FlexContainer = FlexContainerStyle.getInstance();
GlobalStyle.Container = ContainerStyle.getInstance();

// A map that supports multiple values to the same key

var MultiMap = function () {
    function MultiMap() {
        classCallCheck(this, MultiMap);

        this.map = new Map();
    }

    createClass(MultiMap, [{
        key: "normalizeKey",


        // Methods that are called before every access inside
        // the internal map
        value: function normalizeKey(key) {
            return key;
        }
    }, {
        key: "normalizeValue",
        value: function normalizeValue(value) {
            return value;
        }
    }, {
        key: "append",
        value: function append(key, value) {
            var nKey = this.normalizeKey(key);
            var nValue = this.normalizeValue(value);
            if (this.map.has(nKey)) {
                this.map.get(nKey).push(nValue);
            } else {
                this.map.set(nKey, [nValue]);
            }
        }
    }, {
        key: "has",
        value: function has(key) {
            return this.map.has(this.normalizeKey(key));
        }
    }, {
        key: "delete",
        value: function _delete(key) {
            this.map.delete(this.normalizeKey(key));
        }
    }, {
        key: "set",
        value: function set$$1(key, value) {
            this.map.set(this.normalizeKey(key), [this.normalizeValue(value)]);
        }
    }, {
        key: "get",
        value: function get$$1(key) {
            var nKey = this.normalizeKey(key);
            if (this.map.has(nKey)) {
                return this.map.get(nKey)[0];
            }
            return null;
        }
    }, {
        key: "getAll",
        value: function getAll(key) {
            var nKey = this.normalizeKey(key);
            if (this.map.has(nKey)) {
                return this.map.get(nKey).slice();
            }
            return null;
        }
    }, {
        key: "forEach",
        value: function forEach(callback, context) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _step$value = slicedToArray(_step.value, 2),
                        key = _step$value[0],
                        value = _step$value[1];

                    callback.call(context, value, key, this);
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
        key: "keys",
        value: function keys() {
            return mapIterator(this.entries(), function (entry) {
                return entry[0];
            });
        }
    }, {
        key: "values",
        value: function values() {
            return mapIterator(this.entries(), function (entry) {
                return entry[1];
            });
        }
    }, {
        key: "entries",
        value: regeneratorRuntime.mark(function entries() {
            var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _step2$value, key, values, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, value;

            return regeneratorRuntime.wrap(function entries$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _iteratorNormalCompletion2 = true;
                            _didIteratorError2 = false;
                            _iteratorError2 = undefined;
                            _context.prev = 3;
                            _iterator2 = this.map.entries()[Symbol.iterator]();

                        case 5:
                            if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                                _context.next = 36;
                                break;
                            }

                            _step2$value = slicedToArray(_step2.value, 2), key = _step2$value[0], values = _step2$value[1];
                            _iteratorNormalCompletion3 = true;
                            _didIteratorError3 = false;
                            _iteratorError3 = undefined;
                            _context.prev = 10;
                            _iterator3 = values[Symbol.iterator]();

                        case 12:
                            if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                                _context.next = 19;
                                break;
                            }

                            value = _step3.value;
                            _context.next = 16;
                            return [key, value];

                        case 16:
                            _iteratorNormalCompletion3 = true;
                            _context.next = 12;
                            break;

                        case 19:
                            _context.next = 25;
                            break;

                        case 21:
                            _context.prev = 21;
                            _context.t0 = _context["catch"](10);
                            _didIteratorError3 = true;
                            _iteratorError3 = _context.t0;

                        case 25:
                            _context.prev = 25;
                            _context.prev = 26;

                            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                _iterator3.return();
                            }

                        case 28:
                            _context.prev = 28;

                            if (!_didIteratorError3) {
                                _context.next = 31;
                                break;
                            }

                            throw _iteratorError3;

                        case 31:
                            return _context.finish(28);

                        case 32:
                            return _context.finish(25);

                        case 33:
                            _iteratorNormalCompletion2 = true;
                            _context.next = 5;
                            break;

                        case 36:
                            _context.next = 42;
                            break;

                        case 38:
                            _context.prev = 38;
                            _context.t1 = _context["catch"](3);
                            _didIteratorError2 = true;
                            _iteratorError2 = _context.t1;

                        case 42:
                            _context.prev = 42;
                            _context.prev = 43;

                            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                _iterator2.return();
                            }

                        case 45:
                            _context.prev = 45;

                            if (!_didIteratorError2) {
                                _context.next = 48;
                                break;
                            }

                            throw _iteratorError2;

                        case 48:
                            return _context.finish(45);

                        case 49:
                            return _context.finish(42);

                        case 50:
                        case "end":
                            return _context.stop();
                    }
                }
            }, entries, this, [[3, 38, 42, 50], [10, 21, 25, 33], [26,, 28, 32], [43,, 45, 49]]);
        })
    }, {
        key: Symbol.iterator,
        value: function value() {
            return this.entries();
        }
    }], [{
        key: "iterator",
        value: function iterator(items) {
            return items[Symbol.iterator];
        }
    }]);
    return MultiMap;
}();

var _class$4;
var _temp$1;

// This class currently mirrors the functionality of Headers on Chrome at the time of implementation
// TODO: It is specified that the function get() should return the result of getAll() and getAll() deprecated
var Headers$1 = (_temp$1 = _class$4 = function (_MultiMap) {
    inherits(Headers, _MultiMap);

    function Headers(obj) {
        classCallCheck(this, Headers);

        var _this = possibleConstructorReturn(this, (Headers.__proto__ || Object.getPrototypeOf(Headers)).call(this));

        if (obj instanceof Headers) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = obj[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _step$value = slicedToArray(_step.value, 2),
                        key = _step$value[0],
                        value = _step$value[1];

                    _this.append(key, value);
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
        } else if (obj) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = Object.keys(obj)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var key = _step2.value;

                    _this.append(key, obj[key]);
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
        return _this;
    }

    createClass(Headers, [{
        key: 'normalizeKey',
        value: function normalizeKey(key) {
            if (typeof key !== 'string') {
                key = String(key);
            }
            if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(key)) {
                throw new TypeError('Invalid character in header field name');
            }
            return key.toLowerCase();
        }
    }, {
        key: 'normalizeValue',
        value: function normalizeValue(value) {
            if (typeof value !== "string") {
                value = String(value);
            }
            return value;
        }
    }]);
    return Headers;
}(MultiMap), _class$4.polyfill = true, _temp$1);


function polyfillHeaders(global) {
    global.Headers = global.Headers || Headers$1;
}

var _class$5;
var _temp$2;

var URLSearchParams$1 = (_temp$2 = _class$5 = function (_MultiMap) {
    inherits(URLSearchParams, _MultiMap);

    function URLSearchParams() {
        var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
        classCallCheck(this, URLSearchParams);

        var _this = possibleConstructorReturn(this, (URLSearchParams.__proto__ || Object.getPrototypeOf(URLSearchParams)).call(this, obj));

        var str = String(obj);
        if (str.indexOf("?") === 0) {
            str = str.slice(1);
        }
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = str.split("&")[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var parameter = _step.value;

                var index = parameter.indexOf("=");
                if (index !== -1) {
                    var key = _this.constructor.decode(parameter.slice(0, index));
                    var value = _this.constructor.decode(parameter.slice(index + 1));
                    _this.append(key, value);
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

        return _this;
    }

    createClass(URLSearchParams, [{
        key: "normalizeKey",
        value: function normalizeKey(key) {
            return key.toString();
        }
    }, {
        key: "normalizeValue",
        value: function normalizeValue(value) {
            return value.toString();
        }
    }, {
        key: "toString",
        value: function toString() {
            var query = [];
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.map.entries()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _step2$value = slicedToArray(_step2.value, 2),
                        key = _step2$value[0],
                        values = _step2$value[1];

                    var name = this.constructor.encode(key);
                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (var _iterator3 = values[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var value = _step3.value;

                            query.push(name + "=" + this.constructor.encode(value));
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

            return query.join("&");
        }
    }], [{
        key: "encode",
        value: function encode(str) {
            var replace = {
                '!': '%21',
                "'": '%27',
                '(': '%28',
                ')': '%29',
                '~': '%7E',
                '%20': '+',
                '%00': '\x00'
            };
            return encodeURIComponent(str).replace(/[!'\(\)~]|%20|%00/g, function (match) {
                return replace[match];
            });
        }
    }, {
        key: "decode",
        value: function decode(str) {
            return decodeURIComponent(str.replace(/\+/g, ' '));
        }
    }]);
    return URLSearchParams;
}(MultiMap), _class$5.polyfill = true, _temp$2);


function polyfillURLSearchParams(global) {
    global.URLSearchParams = global.URLSearchParams || URLSearchParams$1;
}

function fileReaderReady(reader) {
    return new Promise(function (resolve, reject) {
        reader.onload = function () {
            resolve(reader.result);
        };
        reader.onerror = function () {
            reject(reader.error);
        };
    });
}

function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise;
}

function readBlobAsText(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsText(blob);
    return promise;
}

var Body = function () {
    function Body() {
        classCallCheck(this, Body);

        this.bodyUsed = false;
    }

    createClass(Body, [{
        key: "setBodyUsed",
        value: function setBodyUsed() {
            if (this.bodyUsed) {
                return Promise.reject(new TypeError("Already read"));
            }
            this.bodyUsed = true;
        }
    }, {
        key: "initialize",
        value: function initialize(bodyInit) {
            this._bodyInit = bodyInit;
            if (!bodyInit) {
                this._bodyText = "";
            } else if (typeof bodyInit === "string" || bodyInit instanceof String) {
                this._bodyText = bodyInit;
            } else if (Blob.prototype.isPrototypeOf(bodyInit)) {
                this._bodyBlob = bodyInit;
            } else if (FormData.prototype.isPrototypeOf(bodyInit)) {
                this._bodyFormData = bodyInit;
            } else if (URLSearchParams.prototype.isPrototypeOf(bodyInit)) {
                this._bodyText = bodyInit.toString();
            } else if (DataView.prototype.isPrototypeOf(bodyInit)) {
                this._bodyArrayBuffer = this.constructor.cloneBuffer(bodyInit.buffer);
                this._bodyInit = new Blob([this._bodyArrayBuffer]);
            } else if (ArrayBuffer.prototype.isPrototypeOf(bodyInit) || ArrayBuffer.isView(bodyInit)) {
                this._bodyArrayBuffer = this.constructor.cloneBuffer(bodyInit);
            } else {
                throw new Error("unsupported BodyInit type");
            }

            if (!this.headers.get("content-type")) {
                if (typeof bodyInit === "string" || bodyInit instanceof String) {
                    this.headers.set("content-type", "text/plain;charset=UTF-8");
                } else if (this._bodyBlob && this._bodyBlob.type) {
                    this.headers.set("content-type", this._bodyBlob.type);
                } else if (URLSearchParams.prototype.isPrototypeOf(bodyInit)) {
                    this.headers.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8");
                }
            }
        }
    }, {
        key: "blob",
        value: function blob() {
            var rejected = this.setBodyUsed();
            if (rejected) {
                return rejected;
            }

            if (this._bodyBlob) {
                return Promise.resolve(this._bodyBlob);
            }
            if (this._bodyArrayBuffer) {
                return Promise.resolve(new Blob([this._bodyArrayBuffer]));
            }
            if (this._bodyFormData) {
                // I know this is technically wrong, but only we can create this scenario
                return Promise.resolve(this._bodyFormData);
            }
            return Promise.resolve(new Blob([this._bodyText]));
        }
    }, {
        key: "arrayBuffer",
        value: function arrayBuffer() {
            if (this._bodyArrayBuffer) {
                return this.setBodyUsed() || Promise.resolve(this._bodyArrayBuffer);
            } else {
                return this.blob().then(readBlobAsArrayBuffer);
            }
        }
    }, {
        key: "readArrayBufferAsText",
        value: function readArrayBufferAsText() {
            var view = new Uint8Array(this._bodyArrayBuffer);
            var chars = new Array(view.length);

            for (var i = 0; i < view.length; i++) {
                chars[i] = String.fromCharCode(view[i]);
            }
            return chars.join("");
        }
    }, {
        key: "text",
        value: function text() {
            var rejected = this.setBodyUsed();
            if (rejected) {
                return rejected;
            }

            if (this._bodyBlob) {
                return readBlobAsText(this._bodyBlob);
            }
            if (this._bodyArrayBuffer) {
                return Promise.resolve(this.readArrayBufferAsText());
            }
            if (this._bodyFormData) {
                throw new Error("could not read FormData body as text");
            }
            return Promise.resolve(this._bodyText);
        }
    }, {
        key: "formData",
        value: function formData() {
            return this.text().then(this.constructor.decode);
        }
    }, {
        key: "json",
        value: function json() {
            return this.text().then(JSON.parse);
        }
    }], [{
        key: "decode",
        value: function decode(body) {
            var form = new FormData();
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = body.trim().split('&')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var bytes = _step.value;

                    if (bytes) {
                        var split = bytes.split('=');
                        var name = split.shift().replace(/\+/g, ' ');
                        var value = split.join('=').replace(/\+/g, ' ');
                        form.append(decodeURIComponent(name), decodeURIComponent(value));
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

            return form;
        }
    }, {
        key: "cloneBuffer",
        value: function cloneBuffer(buffer) {
            if (buffer.slice) {
                return buffer.slice();
            } else {
                var view = new Uint8Array(buffer.byteLength);
                view.set(new Uint8Array(buffer));
                return view.buffer;
            }
        }
    }]);
    return Body;
}();

var _class$3;
var _temp;

var Request$1 = (_temp = _class$3 = function (_Body) {
    inherits(Request, _Body);

    function Request(input) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        classCallCheck(this, Request);

        var _this = possibleConstructorReturn(this, (Request.__proto__ || Object.getPrototypeOf(Request)).call(this));

        var body = options.body;

        if (typeof input === "string" || input instanceof String) {
            input = {
                url: input
            };
        }

        if (input.bodyUsed) {
            throw new TypeError("Already read");
        }
        if (!body && input.hasOwnProperty("_bodyInit") && input._bodyInit != null) {
            body = input._bodyInit;
            input.bodyUsed = true;
        }

        _this.method = _this.constructor.normalizeMethod(options.method || input.method || "GET");
        _this.url = input.url;

        var headerArgs = options.headers || input.headers || null;
        _this.headers = headerArgs ? new Headers(headerArgs) : new Headers();
        _this.context = options.context || input.context || "";
        _this.referrer = options.referrer || input.referrer || "about:client";
        _this.referrerPolicy = options.referrerPolicy || input.referrerPolicy || "";
        _this.mode = options.mode || input.mode || null;
        _this.credentials = options.credentials || input.credentials || "omit";
        _this.cache = options.cache || input.cache || "default";

        if ((_this.method === "GET" || _this.method === "HEAD") && body) {
            throw new TypeError("Body not allowed for GET or HEAD requests");
        }
        _this.initialize(body);
        return _this;
    }

    createClass(Request, [{
        key: "clone",
        value: function clone() {
            return new Request(this, { body: this._bodyInit });
        }
    }], [{
        key: "normalizeMethod",
        value: function normalizeMethod(method) {
            var upcased = method.toUpperCase();
            return this.methods.indexOf(upcased) > -1 ? upcased : method;
        }
    }]);
    return Request;
}(Body), _class$3.methods = ["DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT"], _temp);


function polyfillRequest(global) {
    global.Request = global.Request || Request$1;
}

var _class$6;
var _temp$3;

var Response$1 = (_temp$3 = _class$6 = function (_Body) {
    inherits(Response, _Body);

    function Response(bodyInit, options) {
        classCallCheck(this, Response);

        var _this = possibleConstructorReturn(this, (Response.__proto__ || Object.getPrototypeOf(Response)).call(this));

        options = options || {};

        _this.type = "default";
        if (options.hasOwnProperty("status")) {
            _this.status = options.status;
        } else {
            _this.status = 200;
        }
        _this.ok = _this.status >= 200 && _this.status < 300;
        if (options.hasOwnProperty("statusText")) {
            _this.statusText = options.statusText;
        } else {
            _this.statusText = "OK";
        }
        _this.headers = new Headers(options.headers);
        _this.url = options.url || "";
        _this.initialize(bodyInit);
        return _this;
    }

    createClass(Response, [{
        key: "clone",
        value: function clone() {
            return new Response(this._bodyInit, {
                status: this.status,
                statusText: this.statusText,
                headers: new Headers(this.headers),
                url: this.url
            });
        }
    }], [{
        key: "error",
        value: function error() {
            var response = new Response(null, { status: 0, statusText: "" });
            response.type = "error";
            return response;
        }
    }, {
        key: "redirect",
        value: function redirect(url, status) {
            if (this.redirectStatuses.indexOf(status) === -1) {
                throw new RangeError("Invalid status code");
            }
            return new Response(null, { status: status, headers: { location: url } });
        }
    }]);
    return Response;
}(Body), _class$6.redirectStatuses = [301, 302, 303, 307, 308], _temp$3);


function polyfillResponse(global) {
    global.Response = global.Response || Response$1;
}

// Tries to be a more flexible implementation of fetch()
// Still work in progress

// May need to polyfill Headers, Request, Response, Body, URLSearchParams classes, so import them
// TODO: should only call this in the first call to fetch, to not create unneeded dependencies?
if (window) {
    polyfillRequest(window);
    polyfillResponse(window);
    polyfillHeaders(window);
    polyfillURLSearchParams(window);
}

// Parse the headers from an xhr object, to return a native Headers object
function parseHeaders(xhr) {
    var rawHeader = xhr.getAllResponseHeaders() || "";
    var headers = new Headers();
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = rawHeader.split(/\r?\n/)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var line = _step.value;

            var parts = line.split(":");
            var key = parts.shift().trim();
            if (key) {
                var value = parts.join(":").trim();
                headers.append(key, value);
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

    return headers;
}

// Creates a new URLSearchParams object from a plain object
// Fields that are arrays are spread
function getURLSearchParams(data) {
    if (!isPlainObject(data)) {
        return data;
    }

    var urlSearchParams = new URLSearchParams();
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = Object.keys(data)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var key = _step2.value;

            var value = data[key];
            if (Array.isArray(value)) {
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = value[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var instance = _step3.value;

                        urlSearchParams.append(key + "[]", instance);
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
            } else {
                urlSearchParams.set(key, value);
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

    return urlSearchParams;
}

// Appends search parameters from an object to a given URL or Request, and returns the new URL
function composeURL(url, params) {
    if (url.url) {
        url = url.url;
    }
    // TODO: also extract the preexisting arguments in the url
    if (params) {
        url += "?" + getURLSearchParams(params);
    }
    return url;
}

var XHRPromise = function () {
    function XHRPromise(request) {
        var _this = this;

        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        classCallCheck(this, XHRPromise);

        request = new Request(request, options);
        var xhr = new XMLHttpRequest();
        this.options = options;
        this.request = request;
        this.xhr = xhr;

        this.promise = new Promise(function (resolve, reject) {
            _this.promiseResolve = resolve;
            _this.promiseReject = reject;

            xhr.onload = function () {
                var headers = parseHeaders(xhr);
                var body = xhr.response || xhr.responseText;
                var responseInit = {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    headers: headers,
                    url: xhr.responseURL || headers.get("X-Request-URL")
                };
                var response = new Response(body, responseInit);
                // In case dataType is "arrayBuffer", "blob", "formData", "json", "text"
                // Response has methods to return these as promises
                if (typeof response[options.dataType] === "function") {
                    // TODO: should whitelist dataType to json, blob
                    response[options.dataType]().then(function (data) {
                        _this.resolve(data);
                    });
                } else {
                    _this.resolve(response);
                }
            };

            // TODO: also dispatch all arguments here on errors
            xhr.onerror = function () {
                _this.reject(new TypeError("Network error"));
            };

            // TODO: need to have an options to pass setting to xhr (like timeout value)
            xhr.ontimeout = function () {
                _this.reject(new TypeError("Network timeout"));
            };

            xhr.open(request.method, request.url, true);

            if (request.credentials === "include") {
                xhr.withCredentials = true;
            }

            // TODO: come back to this
            xhr.responseType = "blob";

            request.headers.forEach(function (value, name) {
                xhr.setRequestHeader(name, value);
            });

            // TODO: there's no need to do this on a GET or HEAD
            request.blob().then(function (blob) {
                // The blob can be a FormData when we're polyfilling the Request class
                var body = blob instanceof FormData || blob.size ? blob : null;
                _this.send(body);
            });
        });

        this.request = request;
    }

    createClass(XHRPromise, [{
        key: "send",
        value: function send(body) {
            this.getXHR().send(body);
        }
    }, {
        key: "resolve",
        value: function resolve(payload) {
            if (this.options.onSuccess) {
                var _options;

                (_options = this.options).onSuccess.apply(_options, arguments);
            } else {
                this.promiseResolve.apply(this, arguments);
            }
            if (this.options.complete) {
                this.options.complete();
            }
        }
    }, {
        key: "reject",
        value: function reject(error) {
            if (this.options.onError) {
                var _options2;

                (_options2 = this.options).onError.apply(_options2, arguments);
            } else {
                this.promiseReject.apply(this, arguments);
            }
            if (this.options.complete) {
                this.options.complete();
            }
        }

        // TODO: next 2 functions should throw an exception if you have onSuccess/onError

    }, {
        key: "then",
        value: function then() {
            var _getPromise;

            return (_getPromise = this.getPromise()).then.apply(_getPromise, arguments);
        }
    }, {
        key: "catch",
        value: function _catch() {
            var _getPromise2;

            return (_getPromise2 = this.getPromise()).catch.apply(_getPromise2, arguments);
        }
    }, {
        key: "getXHR",
        value: function getXHR() {
            return this.xhr;
        }
    }, {
        key: "getPromise",
        value: function getPromise() {
            return this.promise;
        }
    }, {
        key: "getRequest",
        value: function getRequest() {
            return this.request;
        }
    }, {
        key: "abort",
        value: function abort() {
            this.getXHR().abort();
        }
    }, {
        key: "addXHRListener",
        value: function addXHRListener(name, callback) {
            var _getXHR;

            (_getXHR = this.getXHR()).addEventListener.apply(_getXHR, arguments);
        }
    }, {
        key: "addProgressListener",
        value: function addProgressListener(callback) {
            this.addXHRListener.apply(this, ["progress"].concat(Array.prototype.slice.call(arguments)));
        }
    }]);
    return XHRPromise;
}();

// TODO: this offers only partial compatibility with $.ajax


function jQueryCompatibilityPreprocessor(options) {
    if (options.type) {
        options.method = options.type.toUpperCase();
    }

    if (options.contentType) {
        options.headers.set("Content-Type", options.contentType);
    }

    options.headers.set("X-Requested-With", "XMLHttpRequest");

    if (isPlainObject(options.data)) {
        var method = options.method.toUpperCase();
        if (method === "GET" || method === "HEAD") {
            options.urlParams = options.urlParams || options.data;
            if (options.cache === false) {
                options.urlParams = getURLSearchParams(options.urlParams);
                options.urlParams.set("_", Date.now());
            }
        } else {
            var formData = new FormData();
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = Object.keys(options.data)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var key = _step4.value;

                    var value = options.data[key];
                    if (Array.isArray(value)) {
                        var _iteratorNormalCompletion5 = true;
                        var _didIteratorError5 = false;
                        var _iteratorError5 = undefined;

                        try {
                            for (var _iterator5 = value[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                var arrayValue = _step5.value;

                                formData.append(key + "[]", arrayValue);
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
                    } else {
                        formData.append(key, value);
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

            options.body = formData;
        }
    } else {
        options.body = options.body || options.data;
    }

    return options;
}

// Can either be called with
// - 1 argument: (Request)
// - 2 arguments: (url/Request, options)
function fetch(input) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
    }

    // In case we're being passed in a single plain object (not Request), assume it has a url field
    if (isPlainObject(input)) {
        return fetch.apply(undefined, [input.url].concat(Array.prototype.slice.call(arguments)));
    }

    var options = Object.assign.apply(Object, [{}].concat(args));

    // Ensure that there's a .headers field for preprocessors
    options.headers = new Headers(options.headers || {});

    var preprocessors = options.preprocessors || fetch.defaultPreprocessors || [];

    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
        for (var _iterator6 = preprocessors[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var preprocessor = _step6.value;

            options = preprocessor(options) || options;
        }
    } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion6 && _iterator6.return) {
                _iterator6.return();
            }
        } finally {
            if (_didIteratorError6) {
                throw _iteratorError6;
            }
        }
    }

    options.onSuccess = options.onSuccess || options.success;
    options.onError = options.onError || options.error;

    if (typeof options.cache === "boolean") {
        options.cache = options.cache ? "force-cache" : "reload";
        // TODO: cache still isn't fully done
    }

    options.method = options.method || "GET";

    // If there are any url search parameters, update the url from the urlParams or urlSearchParams fields
    // These fields can be plain objects (jQuery style) or can be URLSearchParams objects
    var urlParams = options.urlParams || options.urlSearchParams;
    if (urlParams) {
        // Change the URL of the request to add a query
        if (input instanceof Request) {
            input = new Request(composeURL(input.url, urlParams), input);
        } else {
            input = new Request(composeURL(input, urlParams), {});
        }
    }

    return new XHRPromise(input, options);
}

fetch.defaultPreprocessors = [jQueryCompatibilityPreprocessor];

fetch.polyfill = true;

window.dbgFetch = function () {
    debugger;
    fetch.apply(undefined, arguments);
};

var Ajax = {
    fetch: fetch,
    request: fetch,
    // Feel free to modify the post and get methods for your needs
    get: function get(url, options) {
        return Ajax.fetch.apply(Ajax, Array.prototype.slice.call(arguments).concat([{ method: "GET" }]));
    },
    getJSON: function getJSON(url, data) {
        return Ajax.get(url, { dataType: "json", data: data });
    },
    post: function post(url, options) {
        return Ajax.fetch.apply(Ajax, Array.prototype.slice.call(arguments).concat([{ method: "POST" }]));
    },
    postJSON: function postJSON(url, data) {
        return Ajax.post(url, { dataType: "json", data: data });
    },
    addDefaultPreprocessor: function addDefaultPreprocessor(preprocessor) {
        Ajax.fetch.defaultPreprocessors.push(preprocessor);
    }
};

var _class$1;
var _descriptor$1;
var _descriptor2$1;
var _descriptor3$1;
var _class3$1;
var _descriptor4$1;
var _descriptor5$1;
var _class5$1;
var _descriptor6$1;
var _descriptor7$1;
var _descriptor8$1;
var _class8;
var _temp4$1;

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
            return this.options.level || this.parent && this.parent.getLevel && this.parent.getLevel();
        }
    }, {
        key: "setLevel",
        value: function setLevel(level) {
            this.updateOptions({ level: level });
        }
    }, {
        key: "getSize",
        value: function getSize() {
            return this.options.size || this.parent && this.parent.getSize && this.parent.getSize();
        }
    }, {
        key: "setSize",
        value: function setSize(size) {
            this.updateOptions({ size: size });
        }
    }]);
    return SimpleStyledElement;
}(UI.Element);

var IconableInterface = function (_SimpleStyledElement) {
    inherits(IconableInterface, _SimpleStyledElement);

    function IconableInterface() {
        classCallCheck(this, IconableInterface);
        return possibleConstructorReturn(this, (IconableInterface.__proto__ || Object.getPrototypeOf(IconableInterface)).apply(this, arguments));
    }

    createClass(IconableInterface, [{
        key: "render",
        value: function render() {
            return [this.beforeChildren(), this.getLabel(), get(IconableInterface.prototype.__proto__ || Object.getPrototypeOf(IconableInterface.prototype), "render", this).call(this)];
        }
    }, {
        key: "getLabel",
        value: function getLabel() {
            return this.options.label != null ? this.options.label : "";
        }
    }, {
        key: "setLabel",
        value: function setLabel(label) {
            this.updateOptions({ label: label });
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
        key: "beforeChildren",
        value: function beforeChildren() {
            if (!this.getFaIcon()) {
                return null;
            }
            var iconOptions = {
                className: "fa fa-" + this.getFaIcon()
            };
            if (this.getLabel()) {
                iconOptions.style = {
                    marginRight: "5px"
                };
            }

            return UI.createElement("span", iconOptions);
        }
    }]);
    return IconableInterface;
}(SimpleStyledElement);

var Button = function (_UI$Primitive) {
    inherits(Button, _UI$Primitive);

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
        key: "disable",
        value: function disable() {
            this.options.disabled = true;
            this.node.disabled = true;
        }
    }, {
        key: "enable",
        value: function enable() {
            this.options.disabled = false;
            this.node.disabled = false;
        }
    }, {
        key: "setEnabled",
        value: function setEnabled(enabled) {
            this.options.disabled = !enabled;
            this.node.disabled = !enabled;
        }
    }]);
    return Button;
}(UI.Primitive(IconableInterface, "button"));

var Label = function (_UI$Primitive2) {
    inherits(Label, _UI$Primitive2);

    function Label() {
        classCallCheck(this, Label);
        return possibleConstructorReturn(this, (Label.__proto__ || Object.getPrototypeOf(Label)).apply(this, arguments));
    }

    createClass(Label, [{
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            attr.addClass(GlobalStyle.Label.DEFAULT);

            if (this.getSize()) {
                attr.addClass(GlobalStyle.Label.Size(this.getSize()));
            }

            if (this.getLevel()) {
                attr.addClass(GlobalStyle.Label.Level(this.getLevel()));
            }
        }
    }]);
    return Label;
}(UI.Primitive(IconableInterface, "span"));

var Badge = function (_UI$Primitive3) {
    inherits(Badge, _UI$Primitive3);

    function Badge() {
        classCallCheck(this, Badge);
        return possibleConstructorReturn(this, (Badge.__proto__ || Object.getPrototypeOf(Badge)).apply(this, arguments));
    }

    createClass(Badge, [{
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            attr.addClass(GlobalStyle.Badge.DEFAULT);

            if (this.getSize()) {
                attr.addClass(GlobalStyle.Badge.Size(this.getSize()));
            }

            if (this.getLevel()) {
                attr.addClass(GlobalStyle.Badge.Level(this.getLevel()));
            }
        }
    }]);
    return Badge;
}(UI.Primitive(IconableInterface, "span"));

var StateButton = function (_Button) {
    inherits(StateButton, _Button);

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
}(Button);

var AjaxButton = function (_StateButton) {
    inherits(AjaxButton, _StateButton);

    function AjaxButton() {
        classCallCheck(this, AjaxButton);
        return possibleConstructorReturn(this, (AjaxButton.__proto__ || Object.getPrototypeOf(AjaxButton)).apply(this, arguments));
    }

    createClass(AjaxButton, [{
        key: "ajaxCall",
        value: function ajaxCall(data) {
            var _this9 = this;

            this.setState(UI.ActionStatus.RUNNING);
            Ajax.fetch(Object.assign({}, data, {
                success: function success(successData) {
                    data.success(successData);
                    if (successData.error) {
                        _this9.setState(UI.ActionStatus.FAILED);
                    } else {
                        _this9.setState(UI.ActionStatus.SUCCESS);
                    }
                },
                error: function error(xhr, errmsg, err) {
                    data.error(xhr, errmsg, err);
                    _this9.setState(UI.ActionStatus.FAILED);
                },
                complete: function complete() {
                    setTimeout(function () {
                        _this9.setState(UI.ActionStatus.DEFAULT);
                    }, _this9.options.onCompete || 1000);
                }
            }));
        }
    }]);
    return AjaxButton;
}(StateButton);

var ButtonGroup = function (_SimpleStyledElement2) {
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

var RadioButtonGroup = function (_SimpleStyledElement3) {
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
            var _this12 = this;

            this.buttons = [];

            var _loop = function _loop(i) {
                _this12.buttons.push(UI.createElement(Button, { key: i, onClick: function onClick() {
                        _this12.setIndex(i);
                    }, size: _this12.getSize(),
                    label: _this12.options.givenOptions[i].toString(), level: _this12.getLevel(),
                    className: _this12.index === i ? "active" : "" }));
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

var CardPanelStyle = (_class$1 = function (_StyleSet) {
    inherits(CardPanelStyle, _StyleSet);

    function CardPanelStyle() {
        var _ref;

        var _temp, _this13, _ret2;

        classCallCheck(this, CardPanelStyle);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret2 = (_temp = (_this13 = possibleConstructorReturn(this, (_ref = CardPanelStyle.__proto__ || Object.getPrototypeOf(CardPanelStyle)).call.apply(_ref, [this].concat(args))), _this13), _initDefineProp$2(_this13, "heading", _descriptor$1, _this13), _initDefineProp$2(_this13, "body", _descriptor2$1, _this13), _initDefineProp$2(_this13, "panel", _descriptor3$1, _this13), _temp), possibleConstructorReturn(_this13, _ret2);
    }

    return CardPanelStyle;
}(StyleSet), (_descriptor$1 = _applyDecoratedDescriptor$2(_class$1.prototype, "heading", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            color: "#333",
            backgroundColor: "#f5f5f5",
            padding: "10px 15px",
            borderBottom: "1px solid #ddd"
        };
    }
}), _descriptor2$1 = _applyDecoratedDescriptor$2(_class$1.prototype, "body", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            padding: "5px"
        };
    }
}), _descriptor3$1 = _applyDecoratedDescriptor$2(_class$1.prototype, "panel", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            backgroundColor: "#ffffff",
            border: "1px solid #ddd",
            borderRadius: "4px"
        };
    }
})), _class$1);

var CardPanel = function (_SimpleStyledElement4) {
    inherits(CardPanel, _SimpleStyledElement4);

    function CardPanel() {
        classCallCheck(this, CardPanel);
        return possibleConstructorReturn(this, (CardPanel.__proto__ || Object.getPrototypeOf(CardPanel)).apply(this, arguments));
    }

    createClass(CardPanel, [{
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            attr.addClass(GlobalStyle.CardPanel.DEFAULT.panel);
            if (this.getLevel()) {
                attr.addClass(GlobalStyle.CardPanel.Level(this.getLevel()).panel);
            }
            if (this.getSize()) {
                attr.addClass(GlobalStyle.CardPanel.Size(this.getSize()).panel);
            }
        }
    }, {
        key: "getTitle",
        value: function getTitle() {
            return this.options.title;
        }
    }, {
        key: "render",
        value: function render() {
            var headingLevel = this.getLevel() ? GlobalStyle.CardPanel.Level(this.getLevel()).heading : "";

            return [UI.createElement(
                "div",
                { className: GlobalStyle.CardPanel.DEFAULT.heading + " " + headingLevel },
                this.getTitle()
            ), UI.createElement(
                "div",
                { className: GlobalStyle.CardPanel.DEFAULT.body, style: this.options.bodyStyle },
                this.getGivenChildren()
            )];
        }
    }]);
    return CardPanel;
}(SimpleStyledElement);

var CollapsibleStyle = (_class3$1 = function (_StyleSet2) {
    inherits(CollapsibleStyle, _StyleSet2);

    function CollapsibleStyle() {
        classCallCheck(this, CollapsibleStyle);

        var _this15 = possibleConstructorReturn(this, (CollapsibleStyle.__proto__ || Object.getPrototypeOf(CollapsibleStyle)).call(this));

        _initDefineProp$2(_this15, "collapsing", _descriptor4$1, _this15);

        _initDefineProp$2(_this15, "collapsed", _descriptor5$1, _this15);

        _this15.transitionDuration = 0.4;
        return _this15;
    }

    return CollapsibleStyle;
}(StyleSet), (_descriptor4$1 = _applyDecoratedDescriptor$2(_class3$1.prototype, "collapsing", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            marginTop: "0",
            transitionTimingFunction: "ease",
            transitionDuration: this.transitionDuration + "s",
            transitionProperty: "margin-top",
            transitionDelay: "-0.15s"
        };
    }
}), _descriptor5$1 = _applyDecoratedDescriptor$2(_class3$1.prototype, "collapsed", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            marginTop: "-100% !important",
            transitionDelay: "0s !important"
        };
    }
})), _class3$1);
var CollapsiblePanelStyle = (_class5$1 = function (_StyleSet3) {
    inherits(CollapsiblePanelStyle, _StyleSet3);

    function CollapsiblePanelStyle() {
        var _ref2;

        var _temp2, _this16, _ret3;

        classCallCheck(this, CollapsiblePanelStyle);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return _ret3 = (_temp2 = (_this16 = possibleConstructorReturn(this, (_ref2 = CollapsiblePanelStyle.__proto__ || Object.getPrototypeOf(CollapsiblePanelStyle)).call.apply(_ref2, [this].concat(args))), _this16), _initDefineProp$2(_this16, "heading", _descriptor6$1, _this16), _initDefineProp$2(_this16, "button", _descriptor7$1, _this16), _initDefineProp$2(_this16, "collapsedButton", _descriptor8$1, _this16), _temp2), possibleConstructorReturn(_this16, _ret3);
    }

    return CollapsiblePanelStyle;
}(StyleSet), (_descriptor6$1 = _applyDecoratedDescriptor$2(_class5$1.prototype, "heading", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            padding: "10px 15px",
            borderBottom: "1px solid transparent",
            borderTopLeftRadius: "3px",
            borderTopRightRadius: "3px",
            backgroundColor: "#f5f5f5"
        };
    }
}), _descriptor7$1 = _applyDecoratedDescriptor$2(_class5$1.prototype, "button", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            marginTop: "0",
            marginBottom: "0",
            fontSize: "16px",
            color: "inherit",
            cursor: "pointer",
            ":hover": {
                color: "inherit"
            },
            ":before": {
                fontFamily: "'Glyphicons Halflings'",
                content: "\"\\e114\"",
                color: "grey",
                float: "left"
            }
        };
    }
}), _descriptor8$1 = _applyDecoratedDescriptor$2(_class5$1.prototype, "collapsedButton", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            ":before": {
                content: "\"\\e080\" !important"
            }
        };
    }
})), _class5$1);


function CollapsibleMixin(BaseClass) {
    var _class7, _temp3;

    var CollapsibleClass = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : CollapsibleStyle;
    var CollapsibleElement = (_temp3 = _class7 = function (_BaseClass2) {
        inherits(CollapsibleElement, _BaseClass2);

        function CollapsibleElement() {
            classCallCheck(this, CollapsibleElement);
            return possibleConstructorReturn(this, (CollapsibleElement.__proto__ || Object.getPrototypeOf(CollapsibleElement)).apply(this, arguments));
        }

        createClass(CollapsibleElement, [{
            key: "getDefaultOptions",
            value: function getDefaultOptions() {
                return {
                    collapsed: true
                };
            }
        }, {
            key: "getCollapsibleStyleSet",
            value: function getCollapsibleStyleSet() {
                return this.options.collapsibleStyleSet || this.constructor.collapsibleStyleSet;
            }
        }, {
            key: "expand",
            value: function expand(panel) {
                this.options.collapsed = false;
                var collapsibleStyle = this.getCollapsibleStyleSet();
                panel.addClass(collapsibleStyle.collapsing);
                panel.removeClass("hidden");
                setTimeout(function () {
                    panel.removeClass(collapsibleStyle.collapsed);
                });
            }
        }, {
            key: "collapse",
            value: function collapse(panel) {
                var _this18 = this;

                this.options.collapsed = true;
                var collapsibleStyle = this.getCollapsibleStyleSet();
                panel.addClass(collapsibleStyle.collapsing);
                panel.addClass(collapsibleStyle.collapsed);
                var transitionEndFunction = function transitionEndFunction() {
                    if (_this18.options.collapsed) {
                        panel.addClass("hidden");
                    }
                };
                panel.addNodeListener("transitionend", transitionEndFunction);
            }
        }]);
        return CollapsibleElement;
    }(BaseClass), _class7.collapsibleStyleSet = new CollapsibleStyle(), _temp3);


    return CollapsibleElement;
}

var CollapsiblePanel = (_temp4$1 = _class8 = function (_CollapsibleMixin) {
    inherits(CollapsiblePanel, _CollapsibleMixin);

    function CollapsiblePanel() {
        classCallCheck(this, CollapsiblePanel);
        return possibleConstructorReturn(this, (CollapsiblePanel.__proto__ || Object.getPrototypeOf(CollapsiblePanel)).apply(this, arguments));
    }

    createClass(CollapsiblePanel, [{
        key: "getStyleSet",
        value: function getStyleSet() {
            return this.options.styleSet || this.constructor.styleSet;
        }
    }, {
        key: "toggle",
        value: function toggle() {
            if (this.options.collapsed) {
                this.expand();
            } else {
                this.collapse();
            }
        }
    }, {
        key: "expand",
        value: function expand() {
            get(CollapsiblePanel.prototype.__proto__ || Object.getPrototypeOf(CollapsiblePanel.prototype), "expand", this).call(this, this.contentArea);
            this.toggleButton.removeClass(this.getStyleSet().collapsedButton);
        }
    }, {
        key: "collapse",
        value: function collapse() {
            var _this20 = this;

            get(CollapsiblePanel.prototype.__proto__ || Object.getPrototypeOf(CollapsiblePanel.prototype), "collapse", this).call(this, this.contentArea);
            setTimeout(function () {
                _this20.toggleButton.addClass(_this20.getStyleSet().collapsedButton);
            }, this.getCollapsibleStyleSet().transitionDuration * 700);
        }
    }, {
        key: "render",
        value: function render() {
            var _this21 = this;

            var autoHeightClass = "";
            var collapsedPanelClass = "";
            var collapsedHeadingClass = "";
            var hiddenClass = "";
            var contentStyle = {};

            if (this.options.autoHeight) {
                autoHeightClass = "auto-height ";
            }
            if (this.options.collapsed) {
                collapsedHeadingClass = this.getStyleSet().collapsedButton;
                collapsedPanelClass = this.getCollapsibleStyleSet().collapsed;
                hiddenClass = "hidden";
            }
            if (!this.options.noPadding) {
                contentStyle = {
                    padding: "8px 8px"
                };
            }

            return [UI.createElement(
                "div",
                { className: this.getStyleSet().heading },
                UI.createElement(
                    "a",
                    { ref: "toggleButton", className: this.getStyleSet().button + " " + collapsedHeadingClass,
                        onClick: function onClick() {
                            return _this21.toggle();
                        } },
                    this.getTitle()
                )
            ), UI.createElement(
                "div",
                { style: { overflow: "hidden" } },
                UI.createElement(
                    "div",
                    { ref: "contentArea", className: autoHeightClass + " " + collapsedPanelClass + " " + hiddenClass,
                        style: contentStyle },
                    this.getGivenChildren()
                )
            )];
        }
    }]);
    return CollapsiblePanel;
}(CollapsibleMixin(CardPanel)), _class8.styleSet = new CollapsiblePanelStyle(), _temp4$1);

var DelayedCollapsiblePanel = function (_CollapsiblePanel) {
    inherits(DelayedCollapsiblePanel, _CollapsiblePanel);

    function DelayedCollapsiblePanel() {
        classCallCheck(this, DelayedCollapsiblePanel);
        return possibleConstructorReturn(this, (DelayedCollapsiblePanel.__proto__ || Object.getPrototypeOf(DelayedCollapsiblePanel)).apply(this, arguments));
    }

    createClass(DelayedCollapsiblePanel, [{
        key: "toggle",
        value: function toggle() {
            if (!this._haveExpanded) {
                this._haveExpanded = true;
                UI.renderingStack.push(this);
                this.contentArea.options.children = this.getGivenChildren();
                UI.renderingStack.pop();
                this.contentArea.redraw();
                this.delayedMount();
            }
            get(DelayedCollapsiblePanel.prototype.__proto__ || Object.getPrototypeOf(DelayedCollapsiblePanel.prototype), "toggle", this).call(this);
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
}(CollapsiblePanel);

var ProgressBar = function (_SimpleStyledElement5) {
    inherits(ProgressBar, _SimpleStyledElement5);

    function ProgressBar() {
        classCallCheck(this, ProgressBar);
        return possibleConstructorReturn(this, (ProgressBar.__proto__ || Object.getPrototypeOf(ProgressBar)).apply(this, arguments));
    }

    createClass(ProgressBar, [{
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            attr.addClass(GlobalStyle.ProgressBar.CONTAINER);
        }
    }, {
        key: "render",
        value: function render() {
            var valueInPercent = (this.options.value || 0) * 100;
            var orientation = UI.Orientation.HORIZONTAL;
            if (this.options.hasOwnProperty("orientation")) {
                orientation = this.options.orientation;
            }
            var barStyle = void 0;
            if (orientation === UI.Orientation.HORIZONTAL) {
                barStyle = {
                    width: valueInPercent + "%",
                    height: this.options.height + "px"
                };
            } else {
                barStyle = {
                    height: valueInPercent + "%",
                    width: "5px"
                };
            }
            var barOptions = {
                className: GlobalStyle.ProgressBar.DEFAULT,
                style: barStyle
            };

            if (this.options.disableTransition) {
                Object.assign(barOptions.style, {
                    transition: "none"
                });
            }

            if (this.options.level) {
                barOptions.className += " " + GlobalStyle.ProgressBar.Level(this.getLevel());
            }
            if (this.options.striped) {
                barOptions.className += " " + GlobalStyle.ProgressBar.STRIPED;
            }
            if (this.options.active) {
                barOptions.className += " " + GlobalStyle.ProgressBar.ACTIVE;
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
        value: function set$$1(value) {
            if (value < 0) value = 0;else if (value > 1) value = 1;
            this.options.value = value;
            this.redraw();
        }
    }]);
    return ProgressBar;
}(SimpleStyledElement);

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

// TODO: need to have Switcher properly work with a redraw
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

            if (element == null) {
                return;
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
            if (this.activeChild) {
                this.activeChild.dispatch("show");
            }
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

function getInstance(styleSheet) {
    if (typeof styleSheet === "function") {
        if (typeof styleSheet.getInstance === "function") {
            styleSheet = styleSheet.getInstance();
        } else {
            styleSheet = styleSheet();
        }
    }
    return styleSheet;
}

function getInstanceForObject(obj) {
    if (!obj) {
        return null;
    }
    var styleSheet = obj.theme && obj.theme.get(obj) || obj.styleSheet || obj.styleSet;
    return getInstance(styleSheet);
}

// TODO: the Theme class still need considering

var Theme = function (_Dispatchable) {
    inherits(Theme, _Dispatchable);

    function Theme() {
        var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
        classCallCheck(this, Theme);

        var _this = possibleConstructorReturn(this, (Theme.__proto__ || Object.getPrototypeOf(Theme)).call(this));

        _this.styleSheetSymbol = Symbol("Theme" + name);
        _this.classSet = new Set();
        return _this;
    }

    createClass(Theme, [{
        key: "register",
        value: function register(cls, styleSheet) {
            cls.theme = this;
            if (!cls.styleSheet) {
                cls.styleSheet = styleSheet;
            }
            this.set(cls, styleSheet);
        }
    }, {
        key: "set",
        value: function set$$1(cls, styleSheet) {
            cls[this.styleSheetSymbol] = styleSheet;
            this.classSet.add(cls, styleSheet);
        }
    }, {
        key: "get",
        value: function get$$1(cls) {
            if (!(typeof cls === "function")) {
                cls = cls.constructor;
            }
            return cls[this.styleSheetSymbol];
        }
    }], [{
        key: "register",
        value: function register(cls, styleSheet) {
            var _Global;

            return (_Global = this.Global).register.apply(_Global, arguments);
        }
    }, {
        key: "get",
        value: function get$$1(cls) {
            var _Global2;

            return (_Global2 = this.Global).get.apply(_Global2, arguments);
        }
    }]);
    return Theme;
}(Dispatchable);

Theme.Global = new Theme("Global");

// We're going to add some methods to UI.Element, to be able to access their style sheets
function styleSheetGetter() {
    return getInstanceForObject(this.options) || getInstanceForObject(this.constructor);
    // TODO: also add a listener here when the styleSheet changes?
}

// TODO: should fixate on a single nomenclature, just use StyleSheet everywhere
UI.Element.prototype.getStyleSheet = UI.Element.prototype.getStyleSet = styleSheetGetter;

// TODO: not sure if I like the getter pattern
Object.defineProperty(UI.Element.prototype, "styleSheet", {
    get: styleSheetGetter,
    set: function set$$1(value) {
        throw Error("Don't change the styleSheet of a UI Element, change this attribute in this.options");
    }
});

var _class$7;
var _descriptor$3;
var _descriptor2$3;
var _descriptor3$3;
var _class3$3;
var _descriptor4$2;
var _descriptor5$2;
var _descriptor6$2;
var _class5$2;
var _descriptor7$2;
var _descriptor8$2;
var _descriptor9$1;

function _initDefineProp$4(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
        writable: descriptor.writable,
        value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
}

function _applyDecoratedDescriptor$4(target, property, decorators, descriptor, context) {
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

var BaseTabAreaStyle = (_class$7 = function (_StyleSet) {
    inherits(BaseTabAreaStyle, _StyleSet);

    function BaseTabAreaStyle() {
        var _ref;

        var _temp, _this, _ret;

        classCallCheck(this, BaseTabAreaStyle);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = possibleConstructorReturn(this, (_ref = BaseTabAreaStyle.__proto__ || Object.getPrototypeOf(BaseTabAreaStyle)).call.apply(_ref, [this].concat(args))), _this), _initDefineProp$4(_this, "tab", _descriptor$3, _this), _initDefineProp$4(_this, "activeTab", _descriptor2$3, _this), _initDefineProp$4(_this, "nav", _descriptor3$3, _this), _temp), possibleConstructorReturn(_this, _ret);
    }

    return BaseTabAreaStyle;
}(StyleSet), (_descriptor$3 = _applyDecoratedDescriptor$4(_class$7.prototype, "tab", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            userSelect: "none",
            display: "inline-block",
            position: "relative"
        };
    }
}), _descriptor2$3 = _applyDecoratedDescriptor$4(_class$7.prototype, "activeTab", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {};
    }
}), _descriptor3$3 = _applyDecoratedDescriptor$4(_class$7.prototype, "nav", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            listStyle: "none"
        };
    }
})), _class$7);
var DefaultTabAreaStyle = (_class3$3 = function (_BaseTabAreaStyle) {
    inherits(DefaultTabAreaStyle, _BaseTabAreaStyle);

    function DefaultTabAreaStyle() {
        var _ref2;

        var _temp2, _this2, _ret2;

        classCallCheck(this, DefaultTabAreaStyle);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return _ret2 = (_temp2 = (_this2 = possibleConstructorReturn(this, (_ref2 = DefaultTabAreaStyle.__proto__ || Object.getPrototypeOf(DefaultTabAreaStyle)).call.apply(_ref2, [this].concat(args))), _this2), _initDefineProp$4(_this2, "tab", _descriptor4$2, _this2), _initDefineProp$4(_this2, "activeTab", _descriptor5$2, _this2), _initDefineProp$4(_this2, "nav", _descriptor6$2, _this2), _temp2), possibleConstructorReturn(_this2, _ret2);
    }

    return DefaultTabAreaStyle;
}(BaseTabAreaStyle), (_descriptor4$2 = _applyDecoratedDescriptor$4(_class3$3.prototype, "tab", [styleRuleInherit], {
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
}), _descriptor5$2 = _applyDecoratedDescriptor$4(_class3$3.prototype, "activeTab", [styleRuleInherit], {
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
}), _descriptor6$2 = _applyDecoratedDescriptor$4(_class3$3.prototype, "nav", [styleRuleInherit], {
    enumerable: true,
    initializer: function initializer() {
        return {
            borderBottom: "1px solid #ddd",
            paddingLeft: "0",
            marginBottom: "0"
        };
    }
})), _class3$3);
var MinimalistTabAreaStyle = (_class5$2 = function (_BaseTabAreaStyle2) {
    inherits(MinimalistTabAreaStyle, _BaseTabAreaStyle2);

    function MinimalistTabAreaStyle() {
        var _ref3;

        var _temp3, _this3, _ret3;

        classCallCheck(this, MinimalistTabAreaStyle);

        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        return _ret3 = (_temp3 = (_this3 = possibleConstructorReturn(this, (_ref3 = MinimalistTabAreaStyle.__proto__ || Object.getPrototypeOf(MinimalistTabAreaStyle)).call.apply(_ref3, [this].concat(args))), _this3), _initDefineProp$4(_this3, "tab", _descriptor7$2, _this3), _initDefineProp$4(_this3, "activeTab", _descriptor8$2, _this3), _initDefineProp$4(_this3, "nav", _descriptor9$1, _this3), _temp3), possibleConstructorReturn(_this3, _ret3);
    }

    return MinimalistTabAreaStyle;
}(BaseTabAreaStyle), (_descriptor7$2 = _applyDecoratedDescriptor$4(_class5$2.prototype, "tab", [styleRuleInherit], {
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
}), _descriptor8$2 = _applyDecoratedDescriptor$4(_class5$2.prototype, "activeTab", [styleRuleInherit], {
    enumerable: true,
    initializer: function initializer() {
        return {
            fontWeight: "bold",
            color: "rgba(51,122,183,1)",
            cursor: "default !important",
            borderBottom: "2px solid rgba(51,122,183,1) !important"
        };
    }
}), _descriptor9$1 = _applyDecoratedDescriptor$4(_class5$2.prototype, "nav", [styleRuleInherit], {
    enumerable: true,
    initializer: function initializer() {
        return {
            position: "relative",
            borderBottom: "1px solid #aaa"
        };
    }
})), _class5$2);

var BasicTabTitle = function (_UI$Primitive) {
    inherits(BasicTabTitle, _UI$Primitive);

    function BasicTabTitle() {
        classCallCheck(this, BasicTabTitle);
        return possibleConstructorReturn(this, (BasicTabTitle.__proto__ || Object.getPrototypeOf(BasicTabTitle)).apply(this, arguments));
    }

    createClass(BasicTabTitle, [{
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            attr.addClass(this.styleSheet.tab);
            if (this.options.active) {
                attr.addClass(this.styleSheet.activeTab);
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



var TabArea = function (_UI$Element2) {
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
        key: "createTabPanel",
        value: function createTabPanel(panel) {
            var tab = UI.createElement(BasicTabTitle, { panel: panel, activeTabDispatcher: this.activeTabDispatcher,
                active: panel.options.active, href: panel.options.tabHref,
                styleSet: this.getStyleSheet() });

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
                { ref: "titleArea", className: this.styleSheet.nav },
                tabTitles
            );
        }
    }, {
        key: "getSwitcher",
        value: function getSwitcher(tabPanels) {
            // TODO: This should have the ex "auto-height" if not variable height children
            // className="auto-height"
            return UI.createElement(
                Switcher,
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
                for (var _iterator = this.getGivenChildren()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
}(UI.Element);



Theme.register(TabArea, DefaultTabAreaStyle);

var _class$8;
var _descriptor$4;
var _descriptor2$4;
var _descriptor3$4;
var _descriptor4$3;

function _initDefineProp$5(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
        writable: descriptor.writable,
        value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
}

function _applyDecoratedDescriptor$5(target, property, decorators, descriptor, context) {
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
var SectionDividerStyleSet = (_class$8 = function (_StyleSet) {
    inherits(SectionDividerStyleSet, _StyleSet);

    function SectionDividerStyleSet() {
        var _ref;

        var _temp, _this, _ret;

        classCallCheck(this, SectionDividerStyleSet);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = possibleConstructorReturn(this, (_ref = SectionDividerStyleSet.__proto__ || Object.getPrototypeOf(SectionDividerStyleSet)).call.apply(_ref, [this].concat(args))), _this), _this.barThickness = 2, _this.barPadding = 3, _initDefineProp$5(_this, "horizontalDivider", _descriptor$4, _this), _initDefineProp$5(_this, "verticalDivider", _descriptor2$4, _this), _initDefineProp$5(_this, "horizontalSection", _descriptor3$4, _this), _initDefineProp$5(_this, "verticalSection", _descriptor4$3, _this), _temp), possibleConstructorReturn(_this, _ret);
    }

    return SectionDividerStyleSet;
}(StyleSet), (_descriptor$4 = _applyDecoratedDescriptor$5(_class$8.prototype, "horizontalDivider", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            position: "absolute",
            height: "100%",
            cursor: "col-resize",
            paddingLeft: this.barThickness + "px !important",
            background: "#DDD",
            backgroundClip: "padding-box",
            borderLeft: this.barPadding + "px solid transparent",
            borderRight: this.barPadding + "px solid transparent",
            marginLeft: -this.barPadding + "px"
        };
    }
}), _descriptor2$4 = _applyDecoratedDescriptor$5(_class$8.prototype, "verticalDivider", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            position: "absolute",
            cursor: "row-resize",
            width: "100%",
            paddingTop: this.barThickness + "px !important",
            background: "#DDD",
            backgroundClip: "padding-box",
            borderBottom: this.barPadding + "px solid transparent",
            borderTop: this.barPadding + "px solid transparent",
            marginTop: -this.barPadding + "px"
        };
    }
}), _descriptor3$4 = _applyDecoratedDescriptor$5(_class$8.prototype, "horizontalSection", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            position: "relative",
            whiteSpace: "nowrap",
            ">*": {
                whiteSpace: "initial",
                display: "inline-block",
                verticalAlign: "top",
                paddingLeft: "2px",
                paddingRight: "2px",
                boxSizing: "border-box"
            },
            ">:first-child": {
                paddingLeft: "0"
            },
            ">:last-child": {
                paddingRight: "0"
            },
            ">:nth-of-type(even)": {
                padding: "0"
            }
        };
    }
}), _descriptor4$3 = _applyDecoratedDescriptor$5(_class$8.prototype, "verticalSection", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            position: "relative",
            ">*": {
                paddingTop: "2px",
                paddingBottom: "2px",
                boxSizing: "border-box"
            },
            ">:first-child": {
                paddingTop: "0"
            },
            ">:last-child": {
                paddingBottom: "0"
            },
            ">:nth-of-type(even)": {
                padding: "0"
            }
        };
    }
})), _class$8);


var sectionDividerStyle = new SectionDividerStyleSet();

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
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            if (this.orientation === UI.Orientation.VERTICAL) {
                attr.addClass(sectionDividerStyle.verticalDivider);
            } else if (this.orientation === UI.Orientation.HORIZONTAL) {
                attr.addClass(sectionDividerStyle.horizontalDivider);
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

var SectionDivider$$1 = function (_UI$Element2) {
    inherits(SectionDivider$$1, _UI$Element2);

    function SectionDivider$$1(options) {
        classCallCheck(this, SectionDivider$$1);

        var _this3 = possibleConstructorReturn(this, (SectionDivider$$1.__proto__ || Object.getPrototypeOf(SectionDivider$$1)).call(this, options));

        _this3.uncollapsedSizes = new WeakMap();
        return _this3;
    }

    createClass(SectionDivider$$1, [{
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            if (this.getOrientation() === UI.Orientation.VERTICAL) {
                attr.addClass(sectionDividerStyle.verticalSection);
            } else {
                attr.addClass(sectionDividerStyle.horizontalSection);
            }
        }
    }, {
        key: "getOrientation",
        value: function getOrientation() {
            return this.options.orientation || UI.Orientation.VERTICAL;
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
                return 100 / this.children.length / 4;
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
            for (var i = 0; i < this.children.length; i += 2) {
                if (this.getDimension(this.children[i]) !== 0 && !this.children[i].options.fixed) {
                    unCollapsedCount += 1;
                }
            }
            unCollapsedCount -= 1;
            this.setDimension(child, "0%");
            child.hide();
            var correspondingDivider = void 0;
            for (var _i = index * 2 - 1; _i >= 0; _i -= 2) {
                if (!this.children[_i].hasClass("hidden")) {
                    correspondingDivider = this.children[_i];
                    break;
                }
            }
            for (var _i2 = index * 2 + 1; _i2 < this.children.length; _i2 += 2) {
                if (!this.children[_i2].hasClass("hidden")) {
                    correspondingDivider = this.children[_i2];
                    break;
                }
            }
            if (correspondingDivider) {
                correspondingDivider.hide();
            }
            for (var _i3 = 0; _i3 < this.children.length; _i3 += 2) {
                if (this.getDimension(this.children[_i3]) !== 0 && !this.children[_i3].options.fixed) {
                    this.setDimension(this.children[_i3], (this.getDimension(this.children[_i3]) + childSize / unCollapsedCount) * 100 / parentSize - 0.5 / this.children.length + "%");
                }
            }
            this.recalculateDimensions();
        }
    }, {
        key: "expandChild",
        value: function expandChild(index) {
            var parentSize = this.getDimension(this);
            var child = this.children[index * 2];
            var childSize = this.getDimension(child);
            var unCollapsedCount = 0;
            if (childSize !== 0) {
                return;
            }
            for (var i = 0; i < this.children.length; i += 2) {
                if (this.getDimension(this.children[i]) !== 0 && !this.children[i].options.fixed) {
                    unCollapsedCount += 1;
                }
            }
            unCollapsedCount += 1;
            childSize = this.uncollapsedSizes.get(child);
            child.show();
            var divider = void 0;
            var neighborChild = void 0;
            for (var _i4 = index * 2 - 1; _i4 >= 0; _i4 -= 1) {
                if (_i4 % 2) {
                    if (this.children[_i4].hasClass("hidden")) {
                        divider = this.children[_i4];
                    } else if (!this.children[_i4].hasClass("hidden")) {
                        break;
                    }
                } else {
                    if (divider && !this.children[_i4].hasClass("hidden")) {
                        neighborChild = this.children[_i4];
                        break;
                    }
                }
            }
            if (divider && neighborChild) {
                divider.show();
            }
            divider = neighborChild = null;
            for (var _i5 = index * 2 + 1; _i5 < this.children.length; _i5 += 1) {
                if (_i5 % 2) {
                    if (this.children[_i5].hasClass("hidden")) {
                        divider = this.children[_i5];
                    } else if (!this.children[_i5].hasClass("hidden")) {
                        break;
                    }
                } else {
                    if (divider && !this.children[_i5].hasClass("hidden")) {
                        neighborChild = this.children[_i5];
                        break;
                    }
                }
            }
            if (divider && neighborChild) {
                divider.show();
            }
            for (var _i6 = 0; _i6 < this.children.length; _i6 += 2) {
                if (this.getDimension(this.children[_i6]) !== 0 && !this.children[_i6].options.fixed) {
                    this.setDimension(this.children[_i6], (this.getDimension(this.children[_i6]) - childSize / (unCollapsedCount - 1)) * 100 / parentSize - 0.5 / this.children.length + "%");
                }
            }
            this.setDimension(child, childSize * 100 / parentSize + "%");
            this.recalculateDimensions();
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
            var fixedTotalSize = 0;
            var unfixedTotalSize = 0;
            for (var i = 0; i < this.children.length; i += 2) {
                if (this.children[i].options.fixed) {
                    fixedTotalSize += this.getDimension(this.children[i]);
                } else {
                    unfixedTotalSize += this.getDimension(this.children[i]);
                }
            }
            var ratio = (parentSize - fixedTotalSize) / parentSize;
            for (var _i7 = 0; _i7 < this.children.length; _i7 += 2) {
                if (!this.children[_i7].options.fixed && !this.children[_i7].hasClass("hidden")) {
                    var newDimension = this.getDimension(this.children[_i7]) * 100 * ratio / unfixedTotalSize - 0.5 / this.children.length + "%";
                    this.setDimension(this.children[_i7], newDimension);
                }
            }
        }
    }, {
        key: "onMount",
        value: function onMount() {
            var _this4 = this;

            var _loop = function _loop(i) {
                var mousedownFunc = function mousedownFunc(event) {
                    //TODO: right now section divider only works on UIElements
                    var p = 2 * i;
                    var previous = _this4.children[p];
                    while (p && (previous.options.fixed || previous.hasClass("hidden"))) {
                        p -= 2;
                        previous = _this4.children[p];
                    }
                    var n = 2 * i + 2;
                    var next = _this4.children[n];
                    while (n + 2 < _this4.children.length && (next.options.fixed || next.hasClass("hidden"))) {
                        n += 2;
                        next = _this4.children[n];
                    }

                    previous.dispatch("resize");
                    next.dispatch("resize");

                    var parentSize = _this4.getDimension(_this4);
                    var previousSize = _this4.getDimension(previous) * 100 / _this4.getDimension(_this4);
                    var nextSize = _this4.getDimension(next) * 100 / _this4.getDimension(_this4);
                    var minPreviousSize = _this4.getMinDimension(previous);
                    var minNextSize = _this4.getMinDimension(next);
                    var currentX = Device.getEventX(event);
                    var currentY = Device.getEventY(event);
                    var unfixedSize = parentSize;
                    for (var j = 0; j < _this4.children.length; j += 1) {
                        if (_this4.children[j].options.fixed) {
                            unfixedSize -= _this4.getDimension(_this4.children[j]);
                        }
                    }

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

                        if (nextSize - delta * 100 / unfixedSize < minNextSize || previousSize + delta * 100 / unfixedSize < minPreviousSize) {
                            return;
                        }

                        nextSize -= delta * 100 / unfixedSize;
                        previousSize += delta * 100 / unfixedSize;
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
            setTimeout(function () {
                return _this4.recalculateDimensions();
            });
        }
    }, {
        key: "render",
        value: function render() {
            var children = [];
            this.dividers = 0;
            var leftChildVisible = false;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.getGivenChildren()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var child = _step.value;

                    if (children.length > 0) {
                        var hiddenClass = void 0;
                        if (leftChildVisible) {
                            if (!child.hasClass("hidden")) {
                                hiddenClass = "";
                            } else {
                                hiddenClass = "hidden";
                            }
                        } else {
                            if (!child.hasClass("hidden")) {
                                leftChildVisible = true;
                            }
                            hiddenClass = "hidden";
                        }
                        children.push(UI.createElement(DividerBar, { className: hiddenClass, ref: "divider" + this.dividers, orientation: this.getOrientation() }));
                        this.dividers += 1;
                    }
                    children.push(child);
                    if (!child.hasClass("hidden")) {
                        leftChildVisible = true;
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

            return children;
        }
    }]);
    return SectionDivider$$1;
}(UI.Element);

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
    }, {
        key: "toggleCollapsed",
        value: function toggleCollapsed() {
            this.setCollapsed(!this.options.collapsed);
        }
    }]);
    return FACollapseIcon;
}(FAIcon);

var FASortIcon = function (_FAIcon2) {
    inherits(FASortIcon, _FAIcon2);

    function FASortIcon() {
        classCallCheck(this, FASortIcon);
        return possibleConstructorReturn(this, (FASortIcon.__proto__ || Object.getPrototypeOf(FASortIcon)).apply(this, arguments));
    }

    createClass(FASortIcon, [{
        key: "getIcon",
        value: function getIcon() {
            if (this.options.direction === UI.Direction.UP) {
                return "sort-asc";
            } else if (this.options.direction === UI.Direction.DOWN) {
                return "sort-desc";
            } else {
                return "sort";
            }
        }
    }, {
        key: "setDirection",
        value: function setDirection(direction) {
            this.options.direction = direction;
            this.redraw();
        }
    }]);
    return FASortIcon;
}(FAIcon);

var _class$9;
var _descriptor$5;
var _descriptor2$5;
var _descriptor3$5;
var _descriptor4$4;
var _descriptor5$3;
var _class3$4;
var _temp2;
var _class4;
var _temp3$1;

function _initDefineProp$6(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
        writable: descriptor.writable,
        value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
}

function _applyDecoratedDescriptor$6(target, property, decorators, descriptor, context) {
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

var AccordionStyleSet = (_class$9 = function (_StyleSet) {
    inherits(AccordionStyleSet, _StyleSet);

    function AccordionStyleSet() {
        var _ref;

        var _temp, _this, _ret;

        classCallCheck(this, AccordionStyleSet);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = possibleConstructorReturn(this, (_ref = AccordionStyleSet.__proto__ || Object.getPrototypeOf(AccordionStyleSet)).call.apply(_ref, [this].concat(args))), _this), _this.mainColor = "black", _this.hoverColor = "#364251", _initDefineProp$6(_this, "accordion", _descriptor$5, _this), _initDefineProp$6(_this, "noTextSelection", _descriptor2$5, _this), _initDefineProp$6(_this, "grab", _descriptor3$5, _this), _initDefineProp$6(_this, "grabbing", _descriptor4$4, _this), _initDefineProp$6(_this, "collapseIcon", _descriptor5$3, _this), _temp), possibleConstructorReturn(_this, _ret);
    }

    return AccordionStyleSet;
}(StyleSet), (_descriptor$5 = _applyDecoratedDescriptor$6(_class$9.prototype, "accordion", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            backgroundColor: this.mainColor,
            display: "flex",
            flexDirection: "column",
            ">:nth-of-type(even)": {
                flexGrow: "1",
                flexShrink: "1",
                flexBasis: "auto",
                overflow: "auto"
            },
            ">:nth-of-type(odd)": {
                color: "#eee",
                fontSize: "1em",
                textTransform: "uppercase",
                padding: "8px 8px",
                ":hover": {
                    backgroundColor: this.hoverColor
                }
            }
        };
    }
}), _descriptor2$5 = _applyDecoratedDescriptor$6(_class$9.prototype, "noTextSelection", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            "-webkit-user-select": "none",
            "-moz-user-select": "none",
            "-ms-user-select": "none",
            "-o-user-select": "none",
            userSelect: "none"
        };
    }
}), _descriptor3$5 = _applyDecoratedDescriptor$6(_class$9.prototype, "grab", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        var _ref2;

        return _ref2 = {
            cursor: "grab"
        }, defineProperty(_ref2, "cursor", "-moz-grab"), defineProperty(_ref2, "cursor", "-webkit-grab"), _ref2;
    }
}), _descriptor4$4 = _applyDecoratedDescriptor$6(_class$9.prototype, "grabbing", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        var _ref3;

        return _ref3 = {
            cursor: "grabbing"
        }, defineProperty(_ref3, "cursor", "-moz-grabbing"), defineProperty(_ref3, "cursor", "-webkit-grabbing"), _ref3;
    }
}), _descriptor5$3 = _applyDecoratedDescriptor$6(_class$9.prototype, "collapseIcon", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            width: "0.7em",
            fontSize: "120% !important",
            fontWeight: "900 !important",
            textAlign: "center",
            marginRight: "0.2em"
        };
    }
})), _class$9);
var AccordionDivider = (_temp2 = _class3$4 = function (_UI$Element) {
    inherits(AccordionDivider, _UI$Element);

    function AccordionDivider() {
        classCallCheck(this, AccordionDivider);
        return possibleConstructorReturn(this, (AccordionDivider.__proto__ || Object.getPrototypeOf(AccordionDivider)).apply(this, arguments));
    }

    createClass(AccordionDivider, [{
        key: "getStyleSet",
        value: function getStyleSet() {
            return this.options.styleSet || this.constructor.styleSet;
        }
    }, {
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            attr.addClass(this.getStyleSet().grab);
        }
    }, {
        key: "dividerMousedownFunction",
        value: function dividerMousedownFunction(event) {
            var _this3 = this;

            this.parent.dispatch("dividerMousedown", { divider: this, domEvent: event });
            this.addClass(this.getStyleSet().grabbing);
            document.body.classList.add(this.getStyleSet().noTextSelection);

            var dragMousemoveFunction = function dragMousemoveFunction(event) {
                event.preventDefault(); // for touch devices
                _this3.parent.dispatch("dividerMousemove", event);
            };

            this.parent.addNodeListener("touchmove", dragMousemoveFunction);
            this.parent.addNodeListener("mousemove", dragMousemoveFunction);

            var dragMouseupFunction = function dragMouseupFunction(event) {
                _this3.parent.dispatch("dividerMouseup", event);
                _this3.removeClass(_this3.getStyleSet().grabbing);
                document.body.classList.remove(_this3.getStyleSet().noTextSelection);
                _this3.parent.removeNodeListener("touchmove", dragMousemoveFunction);
                window.removeEventListener("touchend", dragMouseupFunction);
                _this3.parent.removeNodeListener("mousemove", dragMousemoveFunction);
                window.removeEventListener("mouseup", dragMouseupFunction);
            };
            window.addEventListener("touchend", dragMouseupFunction);
            window.addEventListener("mouseup", dragMouseupFunction);
        }
    }, {
        key: "render",
        value: function render() {
            return [UI.createElement(FACollapseIcon, { ref: "collapseIcon", collapsed: false, className: this.getStyleSet().collapseIcon }), this.options.children];
        }
    }, {
        key: "setCollapsed",
        value: function setCollapsed(value) {
            this.collapseIcon.setCollapsed(value);
        }
    }, {
        key: "onMount",
        value: function onMount() {
            var _this4 = this;

            // TODO: fix this hack when Device.isTouchDevice works
            this.addNodeListener("touchstart", function (event) {
                _this4.touchDeviceTriggered = true;_this4.dividerMousedownFunction(event);
            });
            this.addNodeListener("mousedown", function (event) {
                if (!_this4.touchDeviceTriggered) {
                    _this4.dividerMousedownFunction(event);
                }
            });
            this.addListener("togglePanel", function () {
                _this4.collapseIcon.toggleCollapsed();
            });
        }
    }]);
    return AccordionDivider;
}(UI.Element), _class3$4.styleSet = AccordionStyleSet.getInstance(), _temp2);
var Accordion$$1 = (_temp3$1 = _class4 = function (_UI$Element2) {
    inherits(Accordion$$1, _UI$Element2);

    function Accordion$$1() {
        classCallCheck(this, Accordion$$1);
        return possibleConstructorReturn(this, (Accordion$$1.__proto__ || Object.getPrototypeOf(Accordion$$1)).apply(this, arguments));
    }

    createClass(Accordion$$1, [{
        key: "getStyleSet",
        value: function getStyleSet() {
            return this.options.styleSet || this.constructor.styleSet;
        }
    }, {
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            attr.addClass(this.getStyleSet().accordion);
        }
    }, {
        key: "render",
        value: function render() {
            var children = [];
            this.dividers = [];
            this.panels = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.getGivenChildren()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var child = _step.value;

                    var title = child.getTitle ? child.getTitle() : child.options.title ? child.options.title : "";
                    var divider = UI.createElement(
                        AccordionDivider,
                        null,
                        title
                    );
                    this.dividers.push(divider);
                    this.panels.push(child);
                    children.push(divider);
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
    }, {
        key: "getNextVisibleChild",
        value: function getNextVisibleChild(index) {
            for (var i = index; i < this.panels.length; i += 1) {
                if (!this.panels[i].hasClass("hidden")) {
                    return this.panels[i];
                }
            }
            return null;
        }
    }, {
        key: "getPreviousVisibleChild",
        value: function getPreviousVisibleChild(index) {
            for (var i = index - 1; i >= 0; i -= 1) {
                if (!this.panels[i].hasClass("hidden")) {
                    return this.panels[i];
                }
            }
            return null;
        }
    }, {
        key: "dividerMousedownFunction",
        value: function dividerMousedownFunction(dividerEvent) {
            var _this6 = this;

            var dragTriggered = void 0,
                panelsHeight = void 0,
                totalFlex = void 0;

            var previousEvent = dividerEvent.domEvent;
            var index = this.dividers.indexOf(dividerEvent.divider);

            var previousPanel = this.getPreviousVisibleChild(index);
            var nextPanel = this.getNextVisibleChild(index);

            panelsHeight = this.getHeight();
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.dividers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var divider = _step2.value;

                    panelsHeight -= divider.getHeight();
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

            totalFlex = 0;
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this.panels[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var panel = _step3.value;

                    if (!panel.hasClass("hidden")) {
                        totalFlex += parseFloat(getComputedStyle(panel.node, "flex"));
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

            var mouseMoveListener = this.addListener("dividerMousemove", function (event) {
                dragTriggered = true;
                if (index != -1 && nextPanel && previousPanel) {
                    // Calculate the height to transfer from one panel to another
                    var delta = (Device.getEventY(event) - Device.getEventY(previousEvent)) * totalFlex / panelsHeight;

                    var nextSize = parseFloat(getComputedStyle(nextPanel.node, "flex"));
                    var previousSize = parseFloat(getComputedStyle(previousPanel.node, "flex"));

                    // Cap the delta value, to at most zero our panels
                    delta = Math.sign(delta) * Math.min(Math.abs(delta), delta > 0 ? nextSize : previousSize);

                    nextPanel.setStyle("flex", nextSize - delta);
                    previousPanel.setStyle("flex", previousSize + delta);

                    previousEvent = event;

                    _this6.dispatch("dragging");
                }
            });

            var mouseUpListener = this.addListener("dividerMouseup", function () {
                if (!dragTriggered) {
                    dividerEvent.divider.dispatch("togglePanel");
                    _this6.toggleChild(_this6.panels[index]);
                }
                mouseMoveListener.remove();
                mouseUpListener.remove();
                _this6.dispatch("childrenStatusChange");
            });
        }
    }, {
        key: "toggleChild",
        value: function toggleChild(child) {
            var totalFlex = 0;
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this.panels[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var _panel = _step4.value;

                    if (!_panel.hasClass("hidden")) {
                        totalFlex += parseFloat(getComputedStyle(_panel.node, "flex"));
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

            var sign = child.hasClass("hidden") ? 1 : -1;
            totalFlex += sign * parseFloat(getComputedStyle(child, "flex"));
            child.toggleClass("hidden");
            if (totalFlex < 1) {
                var _iteratorNormalCompletion5 = true;
                var _didIteratorError5 = false;
                var _iteratorError5 = undefined;

                try {
                    for (var _iterator5 = this.panels[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                        var panel = _step5.value;

                        if (!panel.hasClass("hidden") && parseFloat(getComputedStyle(panel.node, "flex")) < 1) {
                            panel.setStyle("flex", 1);
                        }
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
        }
    }, {
        key: "getChildrenStatus",
        value: function getChildrenStatus() {
            var childrenStatus = [];
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = this.panels[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var panel = _step6.value;

                    childrenStatus.push({
                        flex: getComputedStyle(panel.node, "flex"),
                        collapsed: panel.hasClass("hidden")
                    });
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                        _iterator6.return();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }

            return childrenStatus;
        }
    }, {
        key: "getDefaultChildrenStatus",
        value: function getDefaultChildrenStatus() {
            var childrenStatus = [];
            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = this.panels[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var panel = _step7.value;

                    childrenStatus.push({
                        flex: 1,
                        collapsed: false
                    });
                }
            } catch (err) {
                _didIteratorError7 = true;
                _iteratorError7 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion7 && _iterator7.return) {
                        _iterator7.return();
                    }
                } finally {
                    if (_didIteratorError7) {
                        throw _iteratorError7;
                    }
                }
            }

            return childrenStatus;
        }
    }, {
        key: "setChildrenStatus",
        value: function setChildrenStatus(childrenStatus) {
            for (var i = 0; i < childrenStatus.length; i += 1) {
                this.panels[i].setStyle("flex", childrenStatus[i].flex);
                var collapsed = childrenStatus[i].collapsed;
                if (collapsed) {
                    this.panels[i].addClass("hidden");
                } else {
                    this.panels[i].removeClass("hidden");
                }
                this.dividers[i].setCollapsed(collapsed);
            }
        }
    }, {
        key: "onMount",
        value: function onMount() {
            var _this7 = this;

            this.addListener("dividerMousedown", function (dividerEvent) {
                return _this7.dividerMousedownFunction(dividerEvent);
            });
        }
    }]);
    return Accordion$$1;
}(UI.Element), _class4.styleSet = AccordionStyleSet.getInstance(), _temp3$1);

var _class$10;
var _descriptor$6;
var _descriptor2$6;
var _descriptor3$6;
var _descriptor4$5;
var _class3$5;
var _temp2$1;
var _class4$1;
var _temp3$2;

function _initDefineProp$7(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
        writable: descriptor.writable,
        value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
}

function _applyDecoratedDescriptor$7(target, property, decorators, descriptor, context) {
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

var CarouselStyleSet = (_class$10 = function (_StyleSet) {
    inherits(CarouselStyleSet, _StyleSet);

    function CarouselStyleSet() {
        var _ref;

        var _temp, _this, _ret;

        classCallCheck(this, CarouselStyleSet);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = possibleConstructorReturn(this, (_ref = CarouselStyleSet.__proto__ || Object.getPrototypeOf(CarouselStyleSet)).call.apply(_ref, [this].concat(args))), _this), _this.navigatorHeight = "35px", _this.hoverColor = "#364251", _this.transitionTime = "0.3", _initDefineProp$7(_this, "carousel", _descriptor$6, _this), _initDefineProp$7(_this, "container", _descriptor2$6, _this), _initDefineProp$7(_this, "navigator", _descriptor3$6, _this), _initDefineProp$7(_this, "navigatorIcon", _descriptor4$5, _this), _temp), possibleConstructorReturn(_this, _ret);
    }

    return CarouselStyleSet;
}(StyleSet), (_descriptor$6 = _applyDecoratedDescriptor$7(_class$10.prototype, "carousel", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            overflow: "hidden"
        };
    }
}), _descriptor2$6 = _applyDecoratedDescriptor$7(_class$10.prototype, "container", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            whiteSpace: "nowrap",
            height: "100%",
            ">*": {
                width: "100%",
                height: "100%",
                display: "inline-block",
                verticalAlign: "top"
            },
            ">:first-child": {
                width: "0",
                transition: "margin-left ease " + this.transitionTime + "s"
            }
        };
    }
}), _descriptor3$6 = _applyDecoratedDescriptor$7(_class$10.prototype, "navigator", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            width: "100%",
            height: this.navigatorHeight,
            display: "flex"
        };
    }
}), _descriptor4$5 = _applyDecoratedDescriptor$7(_class$10.prototype, "navigatorIcon", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            color: "#fff",
            fontSize: "180% !important",
            textAlign: "center",
            cursor: "pointer",
            flex: "1",
            fontWeight: "900 !important",
            lineHeight: this.navigatorHeight + " !important",
            ":hover": {
                backgroundColor: this.hoverColor
            }
        };
    }
})), _class$10);
var CarouselNavigator = (_temp2$1 = _class3$5 = function (_UI$Element) {
    inherits(CarouselNavigator, _UI$Element);

    function CarouselNavigator() {
        classCallCheck(this, CarouselNavigator);
        return possibleConstructorReturn(this, (CarouselNavigator.__proto__ || Object.getPrototypeOf(CarouselNavigator)).apply(this, arguments));
    }

    createClass(CarouselNavigator, [{
        key: "getStyleSet",
        value: function getStyleSet() {
            return this.options.styleSet || this.constructor.styleSet;
        }
    }, {
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            attr.addClass(this.getStyleSet().navigator);
        }
    }, {
        key: "render",
        value: function render() {
            var _this3 = this;

            return [UI.createElement(FAIcon, { icon: "angle-left", className: this.getStyleSet().navigatorIcon, onClick: function onClick() {
                    _this3.parent.dispatch("previousPage");
                } }), UI.createElement(FAIcon, { icon: "angle-right", className: this.getStyleSet().navigatorIcon, onClick: function onClick() {
                    _this3.parent.dispatch("nextPage");
                } })];
        }
    }]);
    return CarouselNavigator;
}(UI.Element), _class3$5.styleSet = CarouselStyleSet.getInstance(), _temp2$1);
var Carousel$$1 = (_temp3$2 = _class4$1 = function (_UI$Element2) {
    inherits(Carousel$$1, _UI$Element2);

    function Carousel$$1() {
        classCallCheck(this, Carousel$$1);
        return possibleConstructorReturn(this, (Carousel$$1.__proto__ || Object.getPrototypeOf(Carousel$$1)).apply(this, arguments));
    }

    createClass(Carousel$$1, [{
        key: "getStyleSet",
        value: function getStyleSet() {
            return this.options.styleSet || this.constructor.styleSet;
        }
    }, {
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            attr.addClass(this.getStyleSet().carousel);
        }
    }, {
        key: "appendChild",
        value: function appendChild(child, doMount) {
            this.options.children.push(child);
            if (doMount) {
                this.setActive(child);
            }
            child.mount(this, null);
            this.redraw();
        }
    }, {
        key: "eraseChild",
        value: function eraseChild(child) {
            if (this.options.children.indexOf(child) === this.options.children.length - 1) {
                this.setActiveIndex(Math.max(this.options.children.length - 2, 0));
            }
            this.options.children.splice(this.options.children.indexOf(child), 1);
            this.redraw();
        }
    }, {
        key: "render",
        value: function render() {
            if (this.activeIndex == null) {
                this.activeIndex = 0;
                for (var i = 0; i < this.options.children.length; i += 1) {
                    if (this.options.children[i].options.active) {
                        this.activeIndex = i;
                        break;
                    }
                }
            }

            return [UI.createElement(CarouselNavigator, { className: this.options.children.length > 1 ? "" : "hidden", styleSet: this.options.navigatorStyleSet }), UI.createElement(
                "div",
                { className: this.getStyleSet().container },
                UI.createElement("div", { ref: "pusher", style: { marginLeft: -this.activeIndex * 100 + "%" } }),
                this.options.children
            )];
        }
    }, {
        key: "setActive",
        value: function setActive(panel) {
            this.setActiveIndex(this.options.children.indexOf(panel));
        }
    }, {
        key: "setActiveIndex",
        value: function setActiveIndex(index) {
            this.activeIndex = index;
            this.pusher.setStyle("margin-left", -index * this.getWidth() + "px");
        }
    }, {
        key: "getActive",
        value: function getActive() {
            return this.options.children[this.activeIndex];
        }
    }, {
        key: "onMount",
        value: function onMount() {
            var _this5 = this;

            this.addListener("nextPage", function () {
                return _this5.setActiveIndex((_this5.activeIndex + 1) % _this5.options.children.length);
            });
            this.addListener("previousPage", function () {
                return _this5.setActiveIndex((_this5.activeIndex + _this5.options.children.length - 1) % _this5.options.children.length);
            });
        }
    }, {
        key: "getOrientation",
        value: function getOrientation() {
            return this.options.orientation || UI.Orientation.VERTICAL;
        }
    }]);
    return Carousel$$1;
}(UI.Element), _class4$1.styleSet = CarouselStyleSet.getInstance(), _temp3$2);

var _class$12;
var _descriptor$7;
var _descriptor2$7;
var _class3$6;
var _descriptor3$7;
var _descriptor4$6;

function _initDefineProp$8(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
        writable: descriptor.writable,
        value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
}

function _applyDecoratedDescriptor$8(target, property, decorators, descriptor, context) {
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

var TableStyle = (_class$12 = function (_StyleSet) {
    inherits(TableStyle, _StyleSet);

    function TableStyle() {
        var _ref;

        var _temp, _this, _ret;

        classCallCheck(this, TableStyle);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = possibleConstructorReturn(this, (_ref = TableStyle.__proto__ || Object.getPrototypeOf(TableStyle)).call.apply(_ref, [this].concat(args))), _this), _this.cellStyle = {
            padding: "8px",
            lineHeight: "1.42857143",
            verticalAlign: "top",
            borderTop: "1px solid #ddd"
        }, _this.theadCellStyle = {
            borderBottom: "2px solid #ddd",
            borderTop: "0"
        }, _initDefineProp$8(_this, "table", _descriptor$7, _this), _initDefineProp$8(_this, "tableStripped", _descriptor2$7, _this), _temp), possibleConstructorReturn(_this, _ret);
    }

    return TableStyle;
}(StyleSet), (_descriptor$7 = _applyDecoratedDescriptor$8(_class$12.prototype, "table", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            width: "100%",
            maxWidth: "100%",
            marginBottom: "20px",
            borderSpacing: "0",
            borderCollapse: "collapse",
            ">*>*>td": this.cellStyle,
            ">*>*>th": this.cellStyle,
            ">*>thead>*>*": this.theadCellStyle
        };
    }
}), _descriptor2$7 = _applyDecoratedDescriptor$8(_class$12.prototype, "tableStripped", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            ">tbody>tr:nth-of-type(odd)": {
                backgroundColor: "#f5f5f5"
            }
        };
    }
})), _class$12);
var SortableTableStyle = (_class3$6 = function (_TableStyle) {
    inherits(SortableTableStyle, _TableStyle);

    function SortableTableStyle() {
        var _ref2;

        var _temp2, _this2, _ret2;

        classCallCheck(this, SortableTableStyle);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return _ret2 = (_temp2 = (_this2 = possibleConstructorReturn(this, (_ref2 = SortableTableStyle.__proto__ || Object.getPrototypeOf(SortableTableStyle)).call.apply(_ref2, [this].concat(args))), _this2), _initDefineProp$8(_this2, "sortIcon", _descriptor3$7, _this2), _initDefineProp$8(_this2, "table", _descriptor4$6, _this2), _temp2), possibleConstructorReturn(_this2, _ret2);
    }

    return SortableTableStyle;
}(TableStyle), (_descriptor3$7 = _applyDecoratedDescriptor$8(_class3$6.prototype, "sortIcon", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            position: "absolute",
            right: "0px",
            bottom: "0px",
            visibility: "hidden",
            float: "right"
        };
    }
}), _descriptor4$6 = _applyDecoratedDescriptor$8(_class3$6.prototype, "table", [styleRuleInherit], {
    enumerable: true,
    initializer: function initializer() {
        return defineProperty({}, " th:hover ." + this.sortIcon, {
            visibility: "inherit"
        });
    }
})), _class3$6);

var _class$11;
var _temp$4;

// TODO: the whole table architecture probably needs a rethinking

var TableRow = function (_UI$Primitive) {
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



var Table = (_temp$4 = _class$11 = function (_UI$Primitive2) {
    inherits(Table, _UI$Primitive2);

    function Table() {
        classCallCheck(this, Table);
        return possibleConstructorReturn(this, (Table.__proto__ || Object.getPrototypeOf(Table)).apply(this, arguments));
    }

    createClass(Table, [{
        key: "getStyleSet",
        value: function getStyleSet() {
            return this.options.styleSet || this.constructor.styleSet;
        }
    }, {
        key: "setOptions",
        value: function setOptions(options) {
            get(Table.prototype.__proto__ || Object.getPrototypeOf(Table.prototype), "setOptions", this).call(this, options);

            this.setColumns(options.columns || []);
            this.entries = options.entries || [];
        }
    }, {
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            attr.addClass(this.getStyleSet().table);
        }
    }, {
        key: "getRowClass",
        value: function getRowClass() {
            return TableRow;
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
}(UI.Primitive("table")), _class$11.styleSet = TableStyle.getInstance(), _temp$4);

var _class$13;
var _descriptor$8;
var _descriptor2$8;
var _descriptor3$8;

function _initDefineProp$9(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
        writable: descriptor.writable,
        value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
}

function _applyDecoratedDescriptor$9(target, property, decorators, descriptor, context) {
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

var TableRowInCollapsibleTable = function (_TableRow) {
    inherits(TableRowInCollapsibleTable, _TableRow);

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
}(TableRow);

var CollapsibleTableStyle = (_class$13 = function (_StyleSet) {
    inherits(CollapsibleTableStyle, _StyleSet);

    function CollapsibleTableStyle() {
        var _ref;

        var _temp, _this2, _ret;

        classCallCheck(this, CollapsibleTableStyle);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this2 = possibleConstructorReturn(this, (_ref = CollapsibleTableStyle.__proto__ || Object.getPrototypeOf(CollapsibleTableStyle)).call.apply(_ref, [this].concat(args))), _this2), _initDefineProp$9(_this2, "button", _descriptor$8, _this2), _initDefineProp$9(_this2, "collapsedButton", _descriptor2$8, _this2), _initDefineProp$9(_this2, "heading", _descriptor3$8, _this2), _temp), possibleConstructorReturn(_this2, _ret);
    }

    return CollapsibleTableStyle;
}(StyleSet), (_descriptor$8 = _applyDecoratedDescriptor$9(_class$13.prototype, "button", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            marginTop: "0",
            marginBottom: "0",
            fontSize: "16px",
            color: "inherit",
            cursor: "pointer",
            ":hover": {
                color: "inherit"
            },
            ":after": {
                fontFamily: "'Glyphicons Halflings'",
                content: "\"\\e114\"",
                color: "grey",
                float: "left"
            }
        };
    }
}), _descriptor2$8 = _applyDecoratedDescriptor$9(_class$13.prototype, "collapsedButton", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            ":after": {
                content: "\"\\e080\" !important"
            }
        };
    }
}), _descriptor3$8 = _applyDecoratedDescriptor$9(_class$13.prototype, "heading", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            padding: "10px 15px",
            backgroundColor: "initial !important"
        };
    }
})), _class$13);


var collapsibleTableStyle = new CollapsibleTableStyle();

// TODO: refactor this to support redraw and render override

var CollapsibleTableRow = function (_CollapsibleMixin) {
    inherits(CollapsibleTableRow, _CollapsibleMixin);

    function CollapsibleTableRow() {
        classCallCheck(this, CollapsibleTableRow);
        return possibleConstructorReturn(this, (CollapsibleTableRow.__proto__ || Object.getPrototypeOf(CollapsibleTableRow)).apply(this, arguments));
    }

    createClass(CollapsibleTableRow, [{
        key: "getNodeType",
        value: function getNodeType() {
            return "tbody";
        }
    }, {
        key: "getDefaultOptions",
        value: function getDefaultOptions() {
            return {
                collapsed: true
            };
        }
    }, {
        key: "onMount",
        value: function onMount() {
            var _this4 = this;

            this.toggleButton.addClickListener(function () {
                return _this4.toggle();
            });
        }
    }, {
        key: "toggle",
        value: function toggle() {
            if (!this.options.collapsed) {
                this.collapse();
            } else {
                this.expand();
            }
        }
    }, {
        key: "expand",
        value: function expand() {
            get(CollapsibleTableRow.prototype.__proto__ || Object.getPrototypeOf(CollapsibleTableRow.prototype), "expand", this).call(this, this.contentArea);
            this.toggleButton.removeClass(collapsibleTableStyle.collapsedButton);
        }
    }, {
        key: "collapse",
        value: function collapse() {
            var _this5 = this;

            get(CollapsibleTableRow.prototype.__proto__ || Object.getPrototypeOf(CollapsibleTableRow.prototype), "collapse", this).call(this, this.contentArea);
            setTimeout(function () {
                _this5.toggleButton.addClass(collapsibleTableStyle.collapsedButton);
            }, this.getCollapsibleStyleSet().transitionDuration * 500);
        }

        // TODO: Very bad redraw practice here

    }, {
        key: "redraw",
        value: function redraw() {
            if (!get(CollapsibleTableRow.prototype.__proto__ || Object.getPrototypeOf(CollapsibleTableRow.prototype), "redraw", this).call(this)) {
                return false;
            }

            if (this.options.collapsed) {
                this.toggleButton.addClass(collapsibleTableStyle.collapsedButton);
                this.contentArea.addClass(this.getCollapsibleStyleSet().collapsed);
                this.contentArea.addClass("hidden");
            } else {
                this.toggleButton.removeClass(collapsibleTableStyle.collapsedButton);
                this.contentArea.removeClass(this.getCollapsibleStyleSet().collapsed);
                this.contentArea.removeClass("hidden");
            }
            return true;
        }
    }, {
        key: "render",
        value: function render() {
            return [UI.createElement(
                "tr",
                { className: collapsibleTableStyle.heading },
                get(CollapsibleTableRow.prototype.__proto__ || Object.getPrototypeOf(CollapsibleTableRow.prototype), "render", this).call(this)
            ), UI.createElement(
                "tr",
                null,
                UI.createElement(
                    "td",
                    { style: { overflow: "hidden", padding: "0px" },
                        colspan: this.options.columns.length },
                    UI.createElement(
                        "div",
                        { ref: "contentArea",
                            className: this.getCollapsibleStyleSet().collapsed + " hidden" },
                        this.renderCollapsible(this.options.entry)
                    )
                )
            )];
        }
    }]);
    return CollapsibleTableRow;
}(CollapsibleMixin(TableRow));

function CollapsibleTableInterface(BaseTableClass) {
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
            key: "setColumns",
            value: function setColumns(columns) {
                var _this7 = this;

                var toggleColumn = {
                    value: function value(entry) {
                        var rowClass = _this7.getRowClass(entry);
                        // TODO: Fix it lad!
                        if (rowClass === CollapsibleTableRow || rowClass.prototype instanceof CollapsibleTableRow) {
                            return UI.createElement("a", { ref: "toggleButton",
                                className: collapsibleTableStyle.button + " " + collapsibleTableStyle.collapsedButton });
                        }
                        return UI.createElement("a", { ref: "toggleButton" });
                    },
                    cellStyle: {
                        width: "1%",
                        "whiteSpace": "nowrap"
                    }
                };

                get(CollapsibleTable.prototype.__proto__ || Object.getPrototypeOf(CollapsibleTable.prototype), "setColumns", this).call(this, [toggleColumn].concat(columns));
            }
        }]);
        return CollapsibleTable;
    }(BaseTableClass);
}

var CollapsibleTable = CollapsibleTableInterface(Table);

function SortableTableInterface(BaseTableClass) {
    var _class, _temp;

    var SortIconClass = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : FASortIcon;

    return _temp = _class = function (_BaseTableClass) {
        inherits(SortableTable, _BaseTableClass);

        function SortableTable() {
            classCallCheck(this, SortableTable);
            return possibleConstructorReturn(this, (SortableTable.__proto__ || Object.getPrototypeOf(SortableTable)).apply(this, arguments));
        }

        createClass(SortableTable, [{
            key: "getStyleSet",
            value: function getStyleSet() {
                return this.options.styleSet || this.constructor.styleSet;
            }
        }, {
            key: "setOptions",
            value: function setOptions(options) {
                get(SortableTable.prototype.__proto__ || Object.getPrototypeOf(SortableTable.prototype), "setOptions", this).call(this, options);

                this.columnSortingOrder = options.columnSortingOrder || [];
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
                var sortIcon = UI.createElement(SortIconClass, { className: this.getStyleSet().sortIcon });
                if (this.sortBy === column) {
                    if (this.sortDescending) {
                        sortIcon = UI.createElement(SortIconClass, { className: this.getStyleSet().sortIcon, direction: UI.Direction.DOWN });
                    } else {
                        sortIcon = UI.createElement(SortIconClass, { className: this.getStyleSet().sortIcon, direction: UI.Direction.UP });
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
    }(BaseTableClass), _class.styleSet = SortableTableStyle.getInstance(), _temp;
}

var SortableTable = SortableTableInterface(Table);

var _class$14;
var _descriptor$9;
var _descriptor2$9;
var _class3$7;
var _temp2$2;
var _class4$2;
var _descriptor3$9;
var _descriptor4$7;
var _descriptor5$4;
var _descriptor6$3;
var _descriptor7$3;
var _class6$1;
var _temp4$2;

function _initDefineProp$10(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
        writable: descriptor.writable,
        value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
}

function _applyDecoratedDescriptor$10(target, property, decorators, descriptor, context) {
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

// TODO: need to redo with a StyleSheet
var FloatingWindowStyle = (_class$14 = function (_StyleSet) {
    inherits(FloatingWindowStyle, _StyleSet);

    function FloatingWindowStyle() {
        var _ref;

        var _temp, _this, _ret;

        classCallCheck(this, FloatingWindowStyle);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = possibleConstructorReturn(this, (_ref = FloatingWindowStyle.__proto__ || Object.getPrototypeOf(FloatingWindowStyle)).call.apply(_ref, [this].concat(args))), _this), _initDefineProp$10(_this, "hiddenAnimated", _descriptor$9, _this), _initDefineProp$10(_this, "visibleAnimated", _descriptor2$9, _this), _temp), possibleConstructorReturn(_this, _ret);
    }

    return FloatingWindowStyle;
}(StyleSet), (_descriptor$9 = _applyDecoratedDescriptor$10(_class$14.prototype, "hiddenAnimated", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            visibility: "hidden",
            opacity: "0",
            transition: "opacity 0.1s linear"
        };
    }
}), _descriptor2$9 = _applyDecoratedDescriptor$10(_class$14.prototype, "visibleAnimated", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            visibility: "visible",
            opacity: "1",
            transition: "opacity 0.1s linear"
        };
    }
})), _class$14);
var FloatingWindow = (_temp2$2 = _class3$7 = function (_UI$Element) {
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
        key: "getStyleSet",
        value: function getStyleSet() {
            return this.options.styleSet || this.constructor.styleSet;
        }
    }, {
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            get(FloatingWindow.prototype.__proto__ || Object.getPrototypeOf(FloatingWindow.prototype), "extraNodeAttributes", this).call(this, attr);
            attr.setStyle("z-index", "2016");
        }
    }, {
        key: "fadeOut",
        value: function fadeOut() {
            this.removeClass(this.getStyleSet().visibleAnimated);
            this.addClass(this.getStyleSet().hiddenAnimated);
        }
    }, {
        key: "fadeIn",
        value: function fadeIn() {
            this.removeClass(this.getStyleSet().hiddenAnimated);
            this.addClass(this.getStyleSet().visibleAnimated);
        }
    }, {
        key: "show",
        value: function show() {
            var _this3 = this;

            // TODO: refactor this to use this.parent and UI.Element appendChild
            if (!this.isInDocument()) {
                this.parentNode.appendChild(this.node);
                this.redraw();
                setTimeout(function () {
                    _this3.fadeIn();
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
            var _this4 = this;

            // TODO: refactor this to use this.parent and UI.Element removeChild
            if (this.isInDocument()) {
                this.fadeOut();
                setTimeout(function () {
                    if (_this4.isInDocument()) {
                        _this4.parentNode.removeChild(_this4.node);
                    }
                }, this.options.transitionTime);
            }
        }
    }, {
        key: "parentNode",
        get: function get$$1() {
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
}(UI.Element), _class3$7.styleSet = FloatingWindowStyle.getInstance(), _temp2$2);

var VolatileFloatingWindow = function (_FloatingWindow) {
    inherits(VolatileFloatingWindow, _FloatingWindow);

    function VolatileFloatingWindow() {
        classCallCheck(this, VolatileFloatingWindow);
        return possibleConstructorReturn(this, (VolatileFloatingWindow.__proto__ || Object.getPrototypeOf(VolatileFloatingWindow)).apply(this, arguments));
    }

    createClass(VolatileFloatingWindow, [{
        key: "bindWindowListeners",
        value: function bindWindowListeners() {
            var _this6 = this;

            this.hideListener = this.hideListener || function () {
                _this6.hide();
            };
            window.addEventListener("click", this.hideListener);
        }
    }, {
        key: "unbindWindowListeners",
        value: function unbindWindowListeners() {
            window.removeEventListener("click", this.hideListener);
        }
    }, {
        key: "toggle",
        value: function toggle() {
            if (!this.isInDocument()) {
                this.show();
            } else {
                this.hide();
            }
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
            var _this7 = this;

            if (!this.options.notVisible) {
                this.bindWindowListeners();
            } else {
                setTimeout(function () {
                    _this7.hide();
                });
            }

            this.addClickListener(function (event) {
                event.stopPropagation();
            });
        }
    }]);
    return VolatileFloatingWindow;
}(FloatingWindow);

var ModalStyle = (_class4$2 = function (_FloatingWindowStyle) {
    inherits(ModalStyle, _FloatingWindowStyle);

    function ModalStyle() {
        var _ref2;

        var _temp3, _this8, _ret2;

        classCallCheck(this, ModalStyle);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return _ret2 = (_temp3 = (_this8 = possibleConstructorReturn(this, (_ref2 = ModalStyle.__proto__ || Object.getPrototypeOf(ModalStyle)).call.apply(_ref2, [this].concat(args))), _this8), _initDefineProp$10(_this8, "container", _descriptor3$9, _this8), _initDefineProp$10(_this8, "background", _descriptor4$7, _this8), _initDefineProp$10(_this8, "header", _descriptor5$4, _this8), _initDefineProp$10(_this8, "body", _descriptor6$3, _this8), _initDefineProp$10(_this8, "footer", _descriptor7$3, _this8), _temp3), possibleConstructorReturn(_this8, _ret2);
    }

    return ModalStyle;
}(FloatingWindowStyle), (_descriptor3$9 = _applyDecoratedDescriptor$10(_class4$2.prototype, "container", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
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
}), _descriptor4$7 = _applyDecoratedDescriptor$10(_class4$2.prototype, "background", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            position: "fixed",
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)"
        };
    }
}), _descriptor5$4 = _applyDecoratedDescriptor$10(_class4$2.prototype, "header", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            padding: "15px",
            borderBottom: "1px solid #e5e5e5"
        };
    }
}), _descriptor6$3 = _applyDecoratedDescriptor$10(_class4$2.prototype, "body", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            position: "relative",
            padding: "15px"
        };
    }
}), _descriptor7$3 = _applyDecoratedDescriptor$10(_class4$2.prototype, "footer", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            padding: "15px",
            textAlign: "right",
            borderTop: "1px solid #e5e5e5"
        };
    }
})), _class4$2);
var Modal = (_temp4$2 = _class6$1 = function (_UI$Element2) {
    inherits(Modal, _UI$Element2);

    function Modal() {
        classCallCheck(this, Modal);
        return possibleConstructorReturn(this, (Modal.__proto__ || Object.getPrototypeOf(Modal)).apply(this, arguments));
    }

    createClass(Modal, [{
        key: "getDefaultOptions",
        value: function getDefaultOptions() {
            return {
                closeButton: true
            };
        }
    }, {
        key: "getStyleSet",
        value: function getStyleSet() {
            return this.options.styleSet || this.constructor.styleSet;
        }
    }, {
        key: "render",
        value: function render() {
            var _this10 = this;

            return [UI.createElement(
                Panel,
                { ref: "modalContainer", className: "hidden " + this.getStyleSet().container },
                UI.createElement(Panel, { ref: "behindPanel", className: this.getStyleSet().hiddenAnimated + " " + this.getStyleSet().background, onClick: function onClick() {
                        return _this10.hide();
                    } }),
                this.getModalWindow()
            )];
        }
    }, {
        key: "getModalWindow",
        value: function getModalWindow() {
            var _this11 = this;

            var closeButton = null;
            if (this.options.closeButton) {
                // TODO: this should be in a method
                closeButton = UI.createElement(
                    "div",
                    { style: { right: "10px", zIndex: "10", position: "absolute" } },
                    UI.createElement(Button, { className: "close", size: UI.Size.EXTRA_LARGE, style: { border: "none" }, label: "\xD7", onClick: function onClick() {
                            return _this11.hide();
                        } })
                );
            }

            return UI.createElement(
                FloatingWindow,
                { ref: "modalWindow", style: this.getModalWindowStyle() },
                closeButton,
                UI.createElement(
                    "div",
                    { style: { margin: "0px", height: "100%", width: "100%" } },
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
            var _this12 = this;

            this.modalWindow.fadeOut();

            setTimeout(function () {
                _this12.behindPanel.removeClass(_this12.getStyleSet().visibleAnimated);
                _this12.behindPanel.addClass(_this12.getStyleSet().hiddenAnimated);

                setTimeout(function () {
                    _this12.modalContainer.addClass("hidden");
                }, _this12.modalWindow.options.transitionTime);
            }, this.modalWindow.options.transitionTime);
            document.body.classList.remove("unscrollable");
        }
    }, {
        key: "show",
        value: function show() {
            var _this13 = this;

            if (!this.node) {
                this.mount(document.body);
            }
            this.modalContainer.removeClass("hidden");
            setTimeout(function () {
                _this13.behindPanel.addClass(_this13.getStyleSet().visibleAnimated);
                _this13.behindPanel.removeClass(_this13.getStyleSet().hiddenAnimated);

                setTimeout(function () {
                    _this13.modalWindow.fadeIn();
                }, _this13.modalWindow.options.transitionTime);
            }, 0);
            document.body.classList.add("unscrollable");
        }
    }]);
    return Modal;
}(UI.Element), _class6$1.styleSet = new ModalStyle(), _temp4$2);

var ErrorModal = function (_Modal) {
    inherits(ErrorModal, _Modal);

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
                { className: ModalStyle.header },
                UI.createElement(
                    "h4",
                    null,
                    "An Error occurred"
                )
            )];
        }
    }, {
        key: "getBody",
        value: function getBody() {
            return UI.createElement(
                "div",
                { className: ModalStyle.body },
                this.options.error.message || this.options.error
            );
        }
    }, {
        key: "getFooter",
        value: function getFooter() {
            var _this15 = this;

            return UI.createElement(
                "div",
                { className: ModalStyle.footer },
                UI.createElement(Button, { level: UI.Level.DANGER, label: "Dismiss", onClick: function onClick() {
                        return _this15.hide();
                    } })
            );
        }
    }]);
    return ErrorModal;
}(Modal);

var ActionModal = function (_Modal2) {
    inherits(ActionModal, _Modal2);

    function ActionModal() {
        classCallCheck(this, ActionModal);
        return possibleConstructorReturn(this, (ActionModal.__proto__ || Object.getPrototypeOf(ActionModal)).apply(this, arguments));
    }

    createClass(ActionModal, [{
        key: "getDefaultOptions",
        value: function getDefaultOptions() {
            return {
                closeButton: false
            };
        }
    }, {
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
                { className: this.getStyleSet().header },
                UI.createElement(
                    "h4",
                    null,
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
                { className: this.getStyleSet().body },
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
                { className: this.getStyleSet().footer },
                content
            ) : null;
        }
    }, {
        key: "getActionButton",
        value: function getActionButton() {
            var _this17 = this;

            return UI.createElement(Button, { level: this.getActionLevel(), label: this.getActionName(), onClick: function onClick() {
                    return _this17.action();
                } });
        }
    }, {
        key: "getFooterContent",
        value: function getFooterContent() {
            var _this18 = this;

            return [UI.createElement(TemporaryMessageArea, { ref: "messageArea" }), UI.createElement(
                UI.ButtonGroup,
                null,
                UI.createElement(Button, { label: this.getCloseName(), onClick: function onClick() {
                        return _this18.hide();
                    } }),
                this.getActionButton()
            )];
        }
    }, {
        key: "action",
        value: function action() {}
    }]);
    return ActionModal;
}(Modal);

function ActionModalButton(ActionModal) {
    return function (_Button) {
        inherits(ActionModalButton, _Button);

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
                var _this20 = this;

                this.modal = UI.createElement(ActionModal, this.getModalOptions());
                this.addClickListener(function () {
                    return _this20.modal.show();
                });
            }
        }]);
        return ActionModalButton;
    }(Button);
}

var _class$16;
var _temp$5;

var TimeUnit = (_temp$5 = _class$16 = function () {
    function TimeUnit(name, baseUnit, multiplier) {
        var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
        classCallCheck(this, TimeUnit);

        this.name = name;
        this.pluralName = name + "s";
        this.baseUnit = baseUnit;
        this.multiplier = multiplier;
        this.milliseconds = (baseUnit && baseUnit.getMilliseconds() || 1) * multiplier;
        this.variableMultiplier = options.variableMultiplier || false;
        this.variableDuration = this.variableMultiplier || baseUnit && baseUnit.isVariable();
    }

    createClass(TimeUnit, [{
        key: "valueOf",
        value: function valueOf() {
            return this.milliseconds;
        }
    }, {
        key: "getName",
        value: function getName() {
            return this.name;
        }
    }, {
        key: "getPluralName",
        value: function getPluralName() {
            return this.pluralName;
        }
    }, {
        key: "getMilliseconds",
        value: function getMilliseconds() {
            return this.milliseconds;
        }
    }, {
        key: "isVariable",
        value: function isVariable() {
            return this.variableDuration;
        }
    }, {
        key: "hasVariableMultiplier",
        value: function hasVariableMultiplier() {
            return this.variableMultiplier;
        }
    }, {
        key: "getDateValue",
        value: function getDateValue(date) {}
    }, {
        key: "setDateValue",
        value: function setDateValue(date, value) {}
    }], [{
        key: "toTimeUnit",
        value: function toTimeUnit(timeUnit) {
            if (timeUnit instanceof TimeUnit) {
                return timeUnit;
            }
            return this.CANONICAL[timeUnit];
        }
    }]);
    return TimeUnit;
}(), _class$16.CANONICAL = {}, _class$16.ALL = [], _class$16.FIXED_DURATION = [], _class$16.VARIABLE_DURATION = [], _temp$5);

TimeUnit.MILLISECOND = new TimeUnit("millisecond", null, 1);
TimeUnit.SECOND = new TimeUnit("second", TimeUnit.MILLISECOND, 1000);
TimeUnit.MINUTE = new TimeUnit("minute", TimeUnit.SECOND, 60);
TimeUnit.HOUR = new TimeUnit("hour", TimeUnit.MINUTE, 60);
TimeUnit.DAY = new TimeUnit("day", TimeUnit.HOUR, 24, { variableMultiplier: true });
TimeUnit.WEEK = new TimeUnit("week", TimeUnit.DAY, 7);
TimeUnit.MONTH = new TimeUnit("month", TimeUnit.DAY, 30, { variableMultiplier: true });
TimeUnit.QUARTER = new TimeUnit("quarter", TimeUnit.MONTH, 3);
TimeUnit.TRIMESTER = new TimeUnit("trimester", TimeUnit.MONTH, 4);
TimeUnit.SEMESTER = new TimeUnit("semester", TimeUnit.MONTH, 6);
TimeUnit.YEAR = new TimeUnit("year", TimeUnit.DAY, 365, { variableMultiplier: true });

TimeUnit.DAY.dateMethodSuffix = "Date";
TimeUnit.MONTH.dateMethodSuffix = "Month";
TimeUnit.YEAR.dateMethodSuffix = "FullYear";

var Duration = function () {
    function Duration(duration) {
        classCallCheck(this, Duration);

        if (duration instanceof self.Date) {
            throw new Error("Can't automatically transform Date to Duration, use date.getTime() if you really want to");
        }
        if (isNumber(duration)) {
            this.milliseconds = duration;
            return;
        }
        if (duration instanceof Duration) {
            Object.assign(this, duration);
            return;
        }
        if (isPlainObject(duration)) {
            this.milliseconds = 0;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = Object.keys(duration)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var key = _step.value;

                    var timeUnit = TimeUnit.CANONICAL[key];
                    if (!timeUnit) {
                        throw Error("Unknown time unit:", key);
                    }
                    // TODO: throw an error if can't parse these values
                    if (timeUnit.isVariable()) {
                        this[key] = parseInt(duration[key]);
                        this.relativeDuration = true;
                    } else {
                        this.milliseconds += parseFloat(duration[key]) * timeUnit.milliseconds;
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
        if (arguments.length > 0) {
            throw Error.apply(undefined, ["Invalid Duration arguments: "].concat(Array.prototype.slice.call(arguments)));
        }
        this.milliseconds = 0;
    }

    createClass(Duration, [{
        key: "increment",
        value: function increment(duration) {
            duration = this.constructor.toDuration(duration);
            for (var key in duration) {
                if (!(key in TimeUnit.CANONICAL)) {
                    continue;
                }
                if (this.hasOwnProperty(key)) {
                    this[key] += duration[key];
                } else {
                    this[key] = duration[key];
                }
            }
            return this;
        }
    }, {
        key: "add",
        value: function add(duration) {
            return this.clone().increm(duration);
        }
    }, {
        key: "subtract",
        value: function subtract(duration) {
            duration = this.constructor.toDuration(duration).negate();
            return this.add(duration);
        }

        // Returns true if was defined terms of absolute primitives (anything less than a day)

    }, {
        key: "isAbsolute",
        value: function isAbsolute() {
            return !this.isVariable();
        }
    }, {
        key: "isVariable",
        value: function isVariable() {
            return this.relativeDuration;
        }
    }, {
        key: "negate",
        value: function negate() {
            var duration = new Duration(this);
            for (var key in duration) {
                if (key in TimeUnit.CANONICAL) {
                    duration[key] = -duration[key];
                }
            }
            return duration;
        }

        // Returns a new Duration with a positive length

    }, {
        key: "abs",
        value: function abs() {
            return new Duration(Math.abs(+this));
        }
    }, {
        key: "clone",
        value: function clone() {
            return new Duration(this);
        }

        // The primitive value

    }, {
        key: "valueOf",
        value: function valueOf() {
            return this.milliseconds;
        }
    }, {
        key: "toNanoseconds",
        value: function toNanoseconds() {
            return Math.floor(+this * 1e6);
        }

        // TODO: for all these units, should have a way to get the float and int value

    }, {
        key: "toMilliseconds",
        value: function toMilliseconds() {
            return Math.floor(+this);
        }
    }, {
        key: "getMilliseconds",
        value: function getMilliseconds() {
            return this.toMilliseconds() % 1000;
        }
    }, {
        key: "toSeconds",
        value: function toSeconds() {
            return Math.floor(+this / 1000);
        }
    }, {
        key: "getSeconds",
        value: function getSeconds() {
            return this.toSeconds() % 60;
        }
    }, {
        key: "toMinutes",
        value: function toMinutes() {
            return Math.floor(+this / (1000 * 60));
        }
    }, {
        key: "getMinutes",
        value: function getMinutes() {
            return this.toMinutes() % 60;
        }
    }, {
        key: "toHours",
        value: function toHours() {
            return Math.floor(+this / (1000 * 60 * 60));
        }
    }, {
        key: "getHours",
        value: function getHours() {
            return this.toHours() % 24;
        }
    }, {
        key: "toDays",
        value: function toDays() {
            return Math.floor(+this / (1000 * 60 * 60 * 24));
        }
    }, {
        key: "toMonths",
        value: function toMonths() {
            return Math.floor(+this / (1000 * 60 * 60 * 24 * 30));
        }
    }, {
        key: "toYears",
        value: function toYears() {
            return Math.floor(+this / (1000 * 60 * 60 * 24 * 365));
        }
    }, {
        key: "toString",
        value: function toString(locale) {
            // Humanize the duration (should work with localization)
        }
    }], [{
        key: "toDuration",
        value: function toDuration(duration) {
            if (duration instanceof Duration) {
                return duration;
            }
            return new this(duration);
        }
    }]);
    return Duration;
}();

function addCanonicalTimeUnit(key, timeUnit) {
    TimeUnit.ALL.push(timeUnit);
    if (timeUnit.isVariable()) {
        TimeUnit.VARIABLE_DURATION.push(timeUnit);
    } else {
        TimeUnit.FIXED_DURATION.push(timeUnit);
    }

    TimeUnit.CANONICAL[timeUnit.name] = timeUnit;
    if (timeUnit.pluralName) {
        TimeUnit.CANONICAL[timeUnit.pluralName] = timeUnit;
    }

    var timeUnitsName = timeUnit.pluralName;

    // TODO: not sure about this anymore
    Duration[key] = new Duration(defineProperty({}, timeUnitsName, 1));
}

function addCanonicalTimeUnits() {
    for (var key in TimeUnit) {
        var timeUnit = TimeUnit[key];
        if (timeUnit instanceof TimeUnit) {
            addCanonicalTimeUnit(key, timeUnit);
        }
    }
}

addCanonicalTimeUnits();

var _class$15;

// MAX_UNIX_TIME is either ~Feb 2106 in unix seconds or ~Feb 1970 in unix milliseconds
// Any value less than this is interpreted as a unix time in seconds
// If you want to go around this behavious, you can use the static method .fromUnixMilliseconds()
// Of set this value to 0
var MAX_AUTO_UNIX_TIME = Math.pow(2, 32);

var BaseDate = self.Date;

var StemDate = extendsNative(_class$15 = function (_BaseDate) {
    inherits(StemDate, _BaseDate);

    function StemDate() {
        classCallCheck(this, StemDate);
        return possibleConstructorReturn(this, (StemDate.__proto__ || Object.getPrototypeOf(StemDate)).apply(this, arguments));
    }

    createClass(StemDate, [{
        key: "toDate",
        value: function toDate() {
            return this;
        }
    }, {
        key: "set",
        value: function set$$1(date) {
            date = this.constructor.toDate(date);
            this.setTime(date.setTime());
        }
    }, {
        key: "clone",
        value: function clone() {
            return new this.constructor(this.getTime());
        }
    }, {
        key: "toUnix",
        value: function toUnix() {
            return this.getTime() / 1000;
        }
    }, {
        key: "unix",
        value: function unix() {
            return Math.floor(this.toUnix());
        }
    }, {
        key: "isBefore",
        value: function isBefore(date) {
            return this.getTime() < StemDate.toDate(date).getTime();
        }
    }, {
        key: "equals",
        value: function equals(date) {
            return this.getTime() === StemDate.toDate(date).getTime();
        }
    }, {
        key: "get",
        value: function get$$1(timeUnit) {
            timeUnit = TimeUnit.toTimeUnit(timeUnit);
            return timeUnit.getDateValue(this);
        }
    }, {
        key: "isSame",
        value: function isSame(date, timeUnit) {
            if (!timeUnit) {
                return this.equals(date);
            }

            timeUnit = TimeUnit.toTimeUnit(timeUnit);
            date = this.constructor.toDate(date);
            var diff = this.diff(date);
            if (timeUnit.isAbsolute() && diff > +timeUnit) {
                return false;
            }
            return this.get(timeUnit) == date.get(timeUnit);
        }
    }, {
        key: "isAfter",
        value: function isAfter(date) {
            return this.getTime() > StemDate.toDate(date).getTime();
        }
    }, {
        key: "isSameOrBefore",
        value: function isSameOrBefore(date) {
            return this.isBefore(date) || this.equals(date);
        }
    }, {
        key: "isSameOrAfter",
        value: function isSameOrAfter(date) {
            return this.isAfter(date) || this.equals(date);
        }
    }, {
        key: "isBetween",
        value: function isBetween(a, b) {
            return this.isSameOrAfter(a) && this.isSameOrBefore(b);
        }
    }, {
        key: "getWeekDay",
        value: function getWeekDay() {
            return this.getDay();
        }
    }, {
        key: "addUnit",
        value: function addUnit(timeUnit) {
            var count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            timeUnit = TimeUnit.toTimeUnit(timeUnit);
            count = parseInt(count);

            if (!timeUnit.isVariable()) {
                this.setTime(this.getTime() + timeUnit.getMilliseconds() * count);
                return this;
            }

            while (!timeUnit.dateMethodSuffix) {
                count *= timeUnit.multiplier;
                timeUnit = timeUnit.baseUnit;
            }

            var dateMethodSuffix = timeUnit.dateMethodSuffix;
            var currentValue = this["get" + dateMethodSuffix]();
            this["set" + dateMethodSuffix](currentValue + count);

            return this;
        }
    }, {
        key: "capUp",


        // Assign the given date if current value if greater than it
        value: function capUp(date) {
            date = this.constructor.toDate(date);
            if (this.isAfter(date)) {
                this.set(date);
            }
        }

        // Assign the given date if current value if less than it

    }, {
        key: "capDown",
        value: function capDown(date) {
            date = this.constructor.toDate(date);
            if (this.isBefore(date)) {
                this.set(date);
            }
        }
    }, {
        key: "roundDown",
        value: function roundDown(timeUnit) {
            timeUnit = TimeUnit.toTimeUnit(timeUnit);
            // TODO: this is wrong for semester, etc, should be different then
            while (timeUnit = timeUnit.baseUnit) {
                this["set" + timeUnit.dateMethodSuffix](0);
            }
            return this;
        }
    }, {
        key: "roundUp",
        value: function roundUp(timeUnit) {
            var roundDown = this.clone().roundDown(timeUnit);
            if (this.equals(roundDown)) {
                this.set(roundDown);
                return this;
            }
            this.addUnit(timeUnit);
            return this.roundDown(timeUnit);
        }
    }, {
        key: "round",
        value: function round(timeUnit) {
            var roundUp = this.clone().roundUp(timeUnit);
            var roundDown = this.clone().roundDown(timeUnit);
            // At a tie, preffer to round up, that's where time's going
            if (this.diff(roundUp) <= this.diff(roundDown)) {
                this.setTime(roundUp.getTime());
            } else {
                this.setTime(roundDown.getTime());
            }
            return this;
        }
    }, {
        key: "add",
        value: function add(duration) {
            duration = Duration.toDuration(duration);
            if (duration.isAbsolute()) {
                this.setTime(this.getTime() + duration.toMilliseconds());
                return this;
            }
            for (var key in duration) {
                var timeUnit = TimeUnit.CANONICAL[key];
                if (timeUnit) {
                    this.addUnit(timeUnit, duration[key]);
                }
            }
            return this;
        }
    }, {
        key: "subtract",
        value: function subtract(duration) {
            duration = Duration.toDuration(duration).negate();
            return this.add(duration);
        }
    }, {
        key: "diffDuration",
        value: function diffDuration(date) {
            return new Duration(this.diff(date));
        }
    }, {
        key: "diff",
        value: function diff(date) {
            date = this.constructor.toDate(date);
            return Math.abs(+this - date);
        }

        // Just to keep moment compatibility, until we actually implement locales

    }, {
        key: "locale",
        value: function locale(loc) {
            return this;
        }
    }, {
        key: "evalToken",
        value: function evalToken(token) {
            var func = this.constructor.tokenFormattersMap.get(token);
            if (!func) {
                return token;
            }
            return func(this);
        }
    }, {
        key: "format",
        value: function format() {
            var _this2 = this;

            var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "ISO";

            var tokens = this.constructor.splitToTokens(str);
            tokens = tokens.map(function (token) {
                return _this2.evalToken(token);
            });
            return tokens.join("");
        }
    }, {
        key: "isValid",
        value: function isValid() {
            return this.toString() !== "Invalid Date";
        }
    }, {
        key: "utc",
        value: function utc() {
            // Temp hack
            return this.constructor.fromUnixMilliseconds(+this + this.getTimezoneOffset() * 60 * 1000);
        }
    }, {
        key: "isLeapYear",
        value: function isLeapYear() {
            var year = this.getFullYear();
            return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
        }
    }, {
        key: "daysInMonth",
        value: function daysInMonth() {
            // The 0th day of the next months is actually the last day in the current month
            var lastDayInMonth = new BaseDate(this.getFullYear(), this.getMonth() + 1, 0);
            return lastDayInMonth.getDate();
        }
    }], [{
        key: "create",

        // Still need to do this mess because of Babel, should be removed when moving to native ES6
        value: function create(value) {
            // Try to do an educated guess if this date is in unix seconds or milliseconds
            if (arguments.length === 1 && isNumber(value) && value < MAX_AUTO_UNIX_TIME) {
                return instantiateNative(BaseDate, StemDate, value * 1000.0);
            } else {
                return instantiateNative.apply(undefined, [BaseDate, StemDate].concat(Array.prototype.slice.call(arguments)));
            }
        }
    }, {
        key: "toDate",
        value: function toDate(date) {
            if (date instanceof StemDate) {
                return date;
            } else {
                return new this(date);
            }
        }
    }, {
        key: "fromUnixMilliseconds",
        value: function fromUnixMilliseconds(unixMilliseconds) {
            return this.create(new BaseDate(unixMilliseconds));
        }
    }, {
        key: "fromUnixSeconds",
        value: function fromUnixSeconds(unixSecons) {
            return this.fromUnixMilliseconds(unixSecons * 1000);
        }

        // You don't usually need to call this in most cases, constructor uses MAX_AUX_UNIX_TIME

    }, {
        key: "unix",
        value: function unix(unixTime) {
            return this.fromUnixSeconds(unixTime);
        }
    }, {
        key: "min",
        value: function min() {
            // TODO: simplify and remove code duplication
            var result = this.constructor.toDate(arguments[0]);
            for (var index = 1; index < arguments.length; index++) {
                var candidate = this.constructor.toDate(arguments[index]);
                if (candidate.isBefore(result)) {
                    result = candidate;
                }
            }
            return result;
        }
    }, {
        key: "max",
        value: function max() {
            var result = this.constructor.toDate(arguments[0]);
            for (var index = 1; index < arguments.length; index++) {
                var candidate = this.constructor.toDate(arguments[index]);
                if (candidate.isAfter(result)) {
                    result = candidate;
                }
            }
            return result;
        }
    }, {
        key: "splitToTokens",
        value: function splitToTokens(str) {
            // TODO: "[HH]HH" will be split to ["HH", "HH"], so the escape does not solve the problem
            var tokens = [];
            var lastIsLetter = null;
            var escapeByCurlyBracket = false;
            var escapeBySquareBracket = false;
            for (var i = 0; i < str.length; i++) {
                var charCode = str.charCodeAt(i);
                if (charCode === 125 && escapeByCurlyBracket) {
                    // '}' ending the escape
                    escapeByCurlyBracket = false;
                    lastIsLetter = null;
                } else if (charCode === 93 && escapeBySquareBracket) {
                    // ']' ending the escape
                    escapeBySquareBracket = false;
                    lastIsLetter = null;
                } else if (escapeByCurlyBracket || escapeBySquareBracket) {
                    // The character is escaped no matter what it is
                    tokens[tokens.length - 1] += str[i];
                } else if (charCode === 123) {
                    // '{' starts a new escape
                    escapeByCurlyBracket = true;
                    tokens.push("");
                } else if (charCode === 91) {
                    // '[' starts a new escape
                    escapeBySquareBracket = true;
                    tokens.push("");
                } else {
                    var isLetter = 65 <= charCode && charCode <= 90 || 97 <= charCode && charCode <= 122;
                    if (isLetter === lastIsLetter) {
                        tokens[tokens.length - 1] += str[i];
                    } else {
                        tokens.push(str[i]);
                    }
                    lastIsLetter = isLetter;
                }
            }
            if (escapeByCurlyBracket || escapeBySquareBracket) {
                console.warn("Unfinished escaped sequence!");
            }
            return tokens;
        }
    }]);
    return StemDate;
}(BaseDate)) || _class$15;

Duration.prototype.format = function (pattern) {
    return StemDate.fromUnixMilliseconds(this.toMilliseconds()).utc().format(pattern);
};

var miniWeekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
var shortWeekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var longWeekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var longMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var DateLocale = function () {
    function DateLocale() {
        var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        classCallCheck(this, DateLocale);

        Object.assign(this, obj);
        this.formats = this.formats || {};
    }

    createClass(DateLocale, [{
        key: "getFormat",
        value: function getFormat(longDate) {
            return this.formats[longDate];
        }
    }, {
        key: "setFormat",
        value: function setFormat(pattern, func) {
            this.formats[pattern] = func;
        }
    }, {
        key: "format",
        value: function format(date, pattern) {
            return date.format(pattern);
        }
    }, {
        key: "getRelativeTime",
        value: function getRelativeTime() {
            throw Error("Not implemented");
        }
    }]);
    return DateLocale;
}();

StemDate.tokenFormattersMap = new Map([["ISO", function (date) {
    return date.toISOString();
}], ["Y", function (date) {
    return date.getFullYear();
}], ["YY", function (date) {
    return padNumber(date.getFullYear() % 100, 2);
}], ["YYYY", function (date) {
    return date.getFullYear();
}], ["M", function (date) {
    return date.getMonth() + 1;
}], ["MM", function (date) {
    return padNumber(date.getMonth() + 1, 2);
}], ["MMM", function (date) {
    return shortMonths[date.getMonth()];
}], ["MMMM", function (date) {
    return longMonths[date.getMonth()];
}], ["D", function (date) {
    return date.getDate();
}], ["Do", function (date) {
    return suffixWithOrdinal(date.getDate());
}], ["DD", function (date) {
    return padNumber(date.getDate(), 2);
}], ["d", function (date) {
    return date.getWeekDay();
}], ["do", function (date) {
    return suffixWithOrdinal(date.getWeekDay());
}], ["dd", function (date) {
    return miniWeekDays[date.getWeekDay()];
}], ["ddd", function (date) {
    return shortWeekDays[date.getWeekDay()];
}], ["dddd", function (date) {
    return longWeekdays[date.getWeekDay()];
}], ["H", function (date) {
    return date.getHours();
}], ["HH", function (date) {
    return padNumber(date.getHours(), 2);
}], ["h", function (date) {
    return date.getHours() % 12;
}], ["hh", function (date) {
    return padNumber(date.getHours() % 12, 2);
}], ["m", function (date) {
    return date.getMinutes();
}], ["mm", function (date) {
    return padNumber(date.getMinutes(), 2);
}], ["s", function (date) {
    return date.getSeconds();
}], ["ss", function (date) {
    return padNumber(date.getSeconds(), 2);
}], ["S", function (date) {
    return Math.floor(date.getMilliseconds() / 100);
}], ["SS", function (date) {
    return padNumber(Math.floor(date.getMilliseconds() / 10), 2);
}], ["SSS", function (date) {
    return padNumber(date.getMilliseconds(), 3);
}], ["ms", function (date) {
    return padNumber(date.getMilliseconds(), 3);
}], ["LL", function (date) {
    return date.format("MMMM Do, YYYY");
}]]);

var Date$1 = StemDate;

// File meant to handle server time/client time differences
var ServerTime = {
    now: function now() {
        return StemDate().subtract(this.getOffset());
    },
    getOffset: function getOffset() {
        return this.offset;
    },
    setPageLoadTime: function setPageLoadTime(unixTime) {
        var estimatedLatency = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

        this.serverPageLoad = unixTime;
        this.offset = performance.timing.responseStart - unixTime * 1000;
    }
};

// TODO: should use +TimeUnit.DAY
var DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

// TODO: should have a generic method time1.isSame("x", time);
function isDifferentDay(timeA, timeB) {
    // return !StemDate(timeA).same(TimeUnit.DAY, timeB);
    timeA = StemDate(timeA);
    timeB = StemDate(timeB);

    // First check if difference is gre
    if (timeA.diff(timeB) > +TimeUnit.DAY) {
        return true;
    }
    // Check if different day of the month, when difference is less than a day
    return timeA.getDate() !== timeB.getDate();
}

var DatePickerTable = function (_UI$Element) {
    inherits(DatePickerTable, _UI$Element);

    function DatePickerTable() {
        classCallCheck(this, DatePickerTable);
        return possibleConstructorReturn(this, (DatePickerTable.__proto__ || Object.getPrototypeOf(DatePickerTable)).apply(this, arguments));
    }

    return DatePickerTable;
}(UI.Element);

var TimePickerWidget = function (_UI$Element2) {
    inherits(TimePickerWidget, _UI$Element2);

    function TimePickerWidget() {
        classCallCheck(this, TimePickerWidget);
        return possibleConstructorReturn(this, (TimePickerWidget.__proto__ || Object.getPrototypeOf(TimePickerWidget)).apply(this, arguments));
    }

    createClass(TimePickerWidget, [{
        key: "render",
        value: function render() {
            var hours = parseInt(this.options.time / (60 * 60 * 1000));
            var minutes = parseInt((this.options.time - 60 * 60 * 1000 * hours) / (60 * 1000));
            var seconds = parseInt((this.options.time - 60 * 60 * 1000 * hours - 60 * 1000 * minutes) / 1000);
            var textSpanStyle = {
                display: "inline-block",
                flex: 1,
                textAlign: "center",
                fontSize: "1.5em",
                fontWeight: "bold",
                padding: "0 5px"
            };
            return [UI.createElement(
                "div",
                { style: { width: "130px", display: "flex" } },
                UI.createElement("div", { style: textSpanStyle, ref: "hours" }),
                UI.createElement(
                    "div",
                    { style: textSpanStyle },
                    ":"
                ),
                UI.createElement("div", { style: textSpanStyle, ref: "minutes" }),
                UI.createElement(
                    "div",
                    { style: textSpanStyle },
                    ":"
                ),
                UI.createElement("div", { style: textSpanStyle, ref: "seconds" })
            ), UI.createElement(
                "div",
                { style: { width: "130px", display: "flex" } },
                UI.createElement(VerticalSlideBar, { value: hours / 23, ref: "hourSlider", height: 200, barHeight: 5, style: { flex: 1 } }),
                UI.createElement("div", { style: { flex: 1 } }),
                UI.createElement(VerticalSlideBar, { value: minutes / 59, ref: "minuteSlider", height: 200, barHeight: 5, style: { flex: 1 } }),
                UI.createElement("div", { style: { flex: 1 } }),
                UI.createElement(VerticalSlideBar, { value: seconds / 59, ref: "secondSlider", height: 200, barHeight: 5, style: { flex: 1, marginRight: "5px" } })
            )];
        }
    }, {
        key: "onMount",
        value: function onMount() {
            var _this3 = this;

            var changeCallback = function changeCallback() {
                var hours = parseInt(_this3.hourSlider.getValue() * 23);
                var minutes = parseInt(_this3.minuteSlider.getValue() * 59);
                var seconds = parseInt(_this3.secondSlider.getValue() * 59);
                _this3.hours.node.innerHTML = (hours < 10 ? "0" : "") + hours;
                _this3.minutes.node.innerHTML = (minutes < 10 ? "0" : "") + minutes;
                _this3.seconds.node.innerHTML = (seconds < 10 ? "0" : "") + seconds;
                var time = (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
                _this3.dispatch("changeTime", time);
            };
            this.hourSlider.addListener("change", changeCallback);
            this.minuteSlider.addListener("change", changeCallback);
            this.secondSlider.addListener("change", changeCallback);
            changeCallback();
        }
    }]);
    return TimePickerWidget;
}(UI.Element);

var DateTimeWindow = function (_VolatileFloatingWind) {
    inherits(DateTimeWindow, _VolatileFloatingWind);

    function DateTimeWindow() {
        classCallCheck(this, DateTimeWindow);
        return possibleConstructorReturn(this, (DateTimeWindow.__proto__ || Object.getPrototypeOf(DateTimeWindow)).apply(this, arguments));
    }

    createClass(DateTimeWindow, [{
        key: "setOptions",
        value: function setOptions(options) {
            options.style = Object.assign({
                marginBottom: "5px",
                border: "1px solid #bbb",
                borderRadius: "2px",
                position: "absolute",
                overflow: "auto",
                boxShadow: "0 6px 12px rgba(0,0,0,.175)",
                backgroundColor: "white",
                padding: "10px",
                zIndex: 10000
            }, options.style || {});
            get(DateTimeWindow.prototype.__proto__ || Object.getPrototypeOf(DateTimeWindow.prototype), "setOptions", this).call(this, options);
            this.computeInitial();
        }
    }, {
        key: "render",
        value: function render() {
            return [UI.createElement(DatePickerTable, { ref: "datePicker", date: this.date }), UI.createElement(TimePickerWidget, { ref: "timePicker", time: this.time })];
        }
    }, {
        key: "computeInitial",
        value: function computeInitial() {
            var initialDateTime = StemDate.parse(this.formatISO(this.options.initialDateTime)) || StemDate.now();
            this.time = initialDateTime % DAY_IN_MILLISECONDS;
            this.date = parseInt(initialDateTime / DAY_IN_MILLISECONDS);
        }
    }, {
        key: "formatISO",
        value: function formatISO(str) {
            if (!str) {
                return "";
            }
            while (str.indexOf("/") !== -1) {
                str = str.replace("/", " ");
            }
            while (str.indexOf(":") !== -1) {
                str = str.replace(":", " ");
            }
            var tokens = str.split(" ");
            return tokens[2] + "-" + tokens[1] + "-" + tokens[0] + "T" + tokens[3] + ":" + tokens[4] + ":" + tokens[5] + ".000Z";
        }
    }, {
        key: "getValue",
        value: function getValue() {
            var currentDate = this.time + DAY_IN_MILLISECONDS * this.date;
            currentDate = StemDate.create(currentDate);
            var date = currentDate.toISOString();
            date = date.slice(8, 10) + "/" + date.slice(5, 7) + "/" + date.slice(0, 4);
            return date + " " + currentDate.toTimeString().slice(0, 8);
        }
    }, {
        key: "onMount",
        value: function onMount() {
            var _this5 = this;

            this.options.output.setValue(this.getValue());
            this.datePicker.addListener("changeDate", function (date) {
                _this5.date = date;
                _this5.options.output.setValue(_this5.getValue());
            });
            this.timePicker.addListener("changeTime", function (time) {
                _this5.time = time;
                _this5.options.output.setValue(_this5.getValue());
            });
        }
    }]);
    return DateTimeWindow;
}(VolatileFloatingWindow);

var DateTimePicker$$1 = function (_UI$Element3) {
    inherits(DateTimePicker$$1, _UI$Element3);

    function DateTimePicker$$1() {
        classCallCheck(this, DateTimePicker$$1);
        return possibleConstructorReturn(this, (DateTimePicker$$1.__proto__ || Object.getPrototypeOf(DateTimePicker$$1)).apply(this, arguments));
    }

    createClass(DateTimePicker$$1, [{
        key: "setOptions",
        value: function setOptions(options) {
            options.format = options.format || "DD/MM/YYYY HH:mm:ss";
            get(DateTimePicker$$1.prototype.__proto__ || Object.getPrototypeOf(DateTimePicker$$1.prototype), "setOptions", this).call(this, options);
            if (this.options.date) {
                this.setDate(this.options.date);
            }
        }
    }, {
        key: "parseDateFromString",
        value: function parseDateFromString(str, format) {
            if (format !== "DD/MM/YYYY HH:mm:ss") {
                throw Error("Format not supported!");
            }
            // Just parsing DD/MM/YYYY HH:mm:ss for now
            while (str.indexOf('/') !== -1) {
                str = str.replace('/', ' ');
            }
            while (str.indexOf(':') !== -1) {
                str = str.replace(':', ' ');
            }
            var tokens = str.split(' ');
            var integerTokens = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = tokens[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var token = _step.value;

                    var number = parseFloat(token);
                    if (!isNaN(number)) {
                        integerTokens.push(number);
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

            var years = integerTokens.length >= 3 ? integerTokens[2] : 0;
            var months = integerTokens.length >= 2 ? integerTokens[1] - 1 : 0;
            var days = integerTokens.length >= 1 ? integerTokens[0] : 0;
            var hours = integerTokens.length >= 4 ? integerTokens[3] : 0;
            var minutes = integerTokens.length >= 5 ? integerTokens[4] : 0;
            var seconds = integerTokens.length >= 6 ? integerTokens[5] : 0;
            var date = new StemDate(years, months, days, hours, minutes, seconds);
            if (!date.getTime()) {
                return null;
            }
            return date;
        }
    }, {
        key: "getDate",
        value: function getDate() {
            var str = this.textInput.getValue();
            if (!str) {
                return null;
            }
            var format = this.options.format;
            return this.parseDateFromString(str, format);
        }
    }, {
        key: "setDate",
        value: function setDate(date) {
            this.options.date = date;
            this.options.dateString = date.format(this.options.format);
            if (this.textInput) {
                this.textInput.setValue(this.options.dateString);
            }
        }
    }, {
        key: "render",
        value: function render() {
            return [UI.createElement(TextInput, { ref: "textInput", placeholder: this.options.format, value: this.options.dateString || "" })];
        }

        // onMount() {
        //     this.calendarSpan.addClickListener((event) => {
        //         if (!this.dateTimeWindow) {
        //             let textInputOffset = getOffset(this.textInput);
        //             this.dateTimeWindow = DateTimeWindow.create(document.body, {
        //                 style: {
        //                     top: textInputOffset.top + 5 + this.textInput.getHeight() + "px",
        //                     left: textInputOffset.left + 5 + "px"
        //                 },
        //                 initialDateTime: this.textInput.getValue(),
        //                 output: this.textInput
        //             });
        //         } else {
        //             this.dateTimeWindow.hide();
        //             delete this.dateTimeWindow;
        //         }
        //         event.stopPropagation();
        //     });
        // }

    }]);
    return DateTimePicker$$1;
}(UI.Element);

// Wrapper over the ace code editor, needs ace to be globally loaded
// TODO: should be renamed to AceCodeEditor?
var CodeEditor = function (_UI$Element) {
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
                // TODO: for some reason the scroll bar height is not being updated, this needs to be fixed
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

var StaticCodeHighlighter = function (_CodeEditor) {
    inherits(StaticCodeHighlighter, _CodeEditor);

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
}(CodeEditor);

var _class$17;
var _temp$6;

// Class for working with the Window.localStorage and Window.sessionStorage objects
// All keys are prefixed with our custom name, so we don't have to worry about polluting the global storage namespace
// Keys must be strings, and values are modified by the serialize/deserialize methods,
// which by default involve JSON conversion
var StorageMap = (_temp$6 = _class$17 = function (_Dispatchable) {
    inherits(StorageMap, _Dispatchable);

    function StorageMap(storage) {
        var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
        classCallCheck(this, StorageMap);

        var _this = possibleConstructorReturn(this, (StorageMap.__proto__ || Object.getPrototypeOf(StorageMap)).call(this));

        _this.storage = storage;
        _this.name = name;
        _this.prefix = name + _this.constructor.SEPARATOR;
        return _this;
    }

    createClass(StorageMap, [{
        key: "getPrefix",
        value: function getPrefix() {
            return this.prefix;
        }
    }, {
        key: "getRawKey",
        value: function getRawKey(key) {
            return this.getPrefix() + key;
        }

        // Method to serialize the values

    }, {
        key: "serialize",
        value: function serialize(value) {
            return JSON.stringify(value);
        }

        // Method to deserialize the value (which can be null if there is no value)

    }, {
        key: "deserialize",
        value: function deserialize(value) {
            return value && JSON.parse(value);
        }
    }, {
        key: "set",
        value: function set$$1(key, value) {
            try {
                this.storage.setItem(this.getRawKey(key), this.serialize(value));
            } catch (e) {
                return false;
            }
            return true;
        }
    }, {
        key: "delete",
        value: function _delete(key) {
            this.storage.removeItem(this.getRawKey(key));
        }
    }, {
        key: "getRaw",
        value: function getRaw(key) {
            return this.storage.getItem(this.getRawKey(key));
        }
    }, {
        key: "get",
        value: function get$$1(key) {
            var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            var value = this.getRaw(key);
            if (value == null) {
                return defaultValue;
            }
            return this.deserialize(value);
        }
    }, {
        key: "has",
        value: function has(key) {
            return this.getRaw(key) != null;
        }
    }, {
        key: "keys",
        value: function keys() {
            var result = [];
            var totalStorageKeys = this.storage.length;
            var prefixLenth = this.getPrefix().length;
            for (var i = 0; i < totalStorageKeys; i++) {
                var key = this.storage.key(i);
                if (key.startsWith(this.getPrefix())) {
                    result.push(key.substr(prefixLenth));
                }
            }
            return result;
        }
    }, {
        key: "values",
        value: function values() {
            var _this2 = this;

            return this.keys().map(function (key) {
                return _this2.get(key);
            });
        }
    }, {
        key: "entries",
        value: function entries() {
            var _this3 = this;

            return this.keys().map(function (key) {
                return [key, _this3.get(key)];
            });
        }
    }, {
        key: Symbol.iterator,
        value: function value() {
            return this.entries();
        }

        // Remove all of the keys that start with out prefix

    }, {
        key: "clear",
        value: function clear() {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var key = _step.value;

                    this.delete(key);
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
    return StorageMap;
}(Dispatchable), _class$17.SEPARATOR = "-@#%-", _temp$6);

// SessionStorageMap can be used to preserve data on tab refreshes

var SessionStorageMap = function (_StorageMap) {
    inherits(SessionStorageMap, _StorageMap);

    function SessionStorageMap() {
        var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
        classCallCheck(this, SessionStorageMap);
        return possibleConstructorReturn(this, (SessionStorageMap.__proto__ || Object.getPrototypeOf(SessionStorageMap)).call(this, window.sessionStorage, name));
    }

    return SessionStorageMap;
}(StorageMap);

// LocalStorageMap can be used to store data across all our tabs
var LocalStorageMap = function (_StorageMap2) {
    inherits(LocalStorageMap, _StorageMap2);

    function LocalStorageMap() {
        var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
        classCallCheck(this, LocalStorageMap);
        return possibleConstructorReturn(this, (LocalStorageMap.__proto__ || Object.getPrototypeOf(LocalStorageMap)).call(this, window.localStorage, name));
    }

    // Since we don't want a listener attached to window storage event for each map, we create a global one
    // Any raw key that contains our separator has its original map identified and gets dispatched only for that map


    createClass(LocalStorageMap, [{
        key: "addChangeListener",


        // Add a listener for all change event on the current map
        // Only works if we're being backed by Window.localStorage and only received events from other tabs (not the current tab)
        // The event has the following fields: key, oldValue, newValue, url, storageArea, originalEvent
        // The key is modified to be the same the one you used in the map
        value: function addChangeListener(callback) {
            var _this6 = this;

            var doDeserialization = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            var realCallback = callback;
            if (doDeserialization) {
                realCallback = function realCallback(event) {
                    event.oldValue = _this6.deserialize(event.oldValue);
                    event.newValue = _this6.deserialize(event.newValue);
                    callback(event);
                };
            }

            return this.constructor.getChangeDispatchable().addListener(this.name, realCallback);
        }
    }], [{
        key: "getChangeDispatchable",
        value: function getChangeDispatchable() {
            var _this7 = this;

            if (!this.CHANGE_DISPATCHABLE) {
                this.CHANGE_DISPATCHABLE = new Dispatchable();
                window.addEventListener("storage", function (event) {
                    var separatorIndex = event.key.indexOf(_this7.SEPARATOR);
                    if (separatorIndex === -1) {
                        // This is not an event associated with a storage map
                        return;
                    }
                    var name = event.key.substr(0, separatorIndex);
                    var actualKey = event.key.substr(separatorIndex + _this7.SEPARATOR.length);
                    var newEvent = {
                        originalEvent: event,
                        key: actualKey,
                        oldValue: event.oldValue,
                        newValue: event.newValue
                    };
                    _this7.CHANGE_DISPATCHABLE.dispatch(name, newEvent);
                });
            }
            return this.CHANGE_DISPATCHABLE;
        }
    }]);
    return LocalStorageMap;
}(StorageMap);

var _class$18;
var _descriptor$10;
var _descriptor2$10;
var _descriptor3$10;
var _descriptor4$8;
var _descriptor5$5;
var _descriptor6$4;
var _descriptor7$4;
var _descriptor8$3;
var _descriptor9$2;
var _descriptor10;
var _descriptor11;
var _descriptor12;
var _descriptor13$1;
var _descriptor14$1;
var _descriptor15$1;
var _descriptor16$1;
var _descriptor17$1;
var _class3$8;
var _descriptor18$1;
var _descriptor19$1;
var _descriptor20$1;
var _descriptor21$1;

function _initDefineProp$11(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
        writable: descriptor.writable,
        value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
}

function _applyDecoratedDescriptor$11(target, property, decorators, descriptor, context) {
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

var padding = "10px";
var navbarHeight = "50px";
var sidebarHeight = "30px";
var sidebarWidthLeft = "250px";
var sidebarWidth = "330px";
var sidebarHideWidth = "335px"; // boxShadowWidth + sidebarWidth
var sidebarTransition = ".3s";
var boxShadowColor = "#353535";

var colors = {
    // BLUE: "#20232d",
    BLUE: "#202e3e",
    HOVER_BLUE: "#364251",
    // BLACK: "#181a22",
    BLACK: "#1c2937",
    // HOVER_BLACK: "#323539",
    HOVER_BLACK: "#364251",
    WHITE: "#eee"
};

var NavbarStyle = (_class$18 = function (_StyleSet) {
    inherits(NavbarStyle, _StyleSet);

    function NavbarStyle() {
        var _ref;

        var _temp, _this, _ret;

        classCallCheck(this, NavbarStyle);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = possibleConstructorReturn(this, (_ref = NavbarStyle.__proto__ || Object.getPrototypeOf(NavbarStyle)).call.apply(_ref, [this].concat(args))), _this), _this.fontFamily = "lato, open sans", _this.icon = {
            lineHeight: navbarHeight,
            height: navbarHeight,
            width: "50px",
            display: "inline-block",
            cursor: "pointer",
            textAlign: "center"
        }, _this.leftSideIcon = Object.assign({}, _this.icon, {
            fontSize: "120%",
            float: "left"
        }), _this.rightSideIcon = Object.assign({}, _this.icon, {
            fontSize: "120%",
            float: "right"
        }), _this.envelope = Object.assign({}, _this.icon, {
            fontSize: "100%",
            float: "right"
        }), _initDefineProp$11(_this, "wrappedIcon", _descriptor$10, _this), _initDefineProp$11(_this, "navCollapseElement", _descriptor2$10, _this), _initDefineProp$11(_this, "navElementHorizontal", _descriptor3$10, _this), _initDefineProp$11(_this, "navElementVerticalArrow", _descriptor4$8, _this), _initDefineProp$11(_this, "navElementHorizontalArrow", _descriptor5$5, _this), _initDefineProp$11(_this, "navElementVertical", _descriptor6$4, _this), _initDefineProp$11(_this, "navElementValueVertical", _descriptor7$4, _this), _initDefineProp$11(_this, "navElementVerticalHover", _descriptor8$3, _this), _initDefineProp$11(_this, "navElementValueHorizontal", _descriptor9$2, _this), _initDefineProp$11(_this, "navLinkElement", _descriptor10, _this), _this.navElementSubElementsHorizontal = {
            position: "absolute",
            paddingRight: padding,
            fontFamily: _this.fontFamily
        }, _this.navElementSubElementsVertical = {
            transitionDuration: ".2s",
            transitionProperty: "opacity",
            display: "none",
            opacity: "0",
            fontFamily: _this.fontFamily
        }, _initDefineProp$11(_this, "navElementSectionHorizontal", _descriptor11, _this), _initDefineProp$11(_this, "navElementSectionVertical", _descriptor12, _this), _initDefineProp$11(_this, "sidePanelGroup", _descriptor13$1, _this), _initDefineProp$11(_this, "leftSidePanel", _descriptor14$1, _this), _initDefineProp$11(_this, "rightSidePanel", _descriptor15$1, _this), _initDefineProp$11(_this, "navManager", _descriptor16$1, _this), _this.hideNavElement = {
            display: "none",
            opacity: "0"
        }, _this.showNavElement = {
            display: "block",
            opacity: "1"
        }, _initDefineProp$11(_this, "hrStyle", _descriptor17$1, _this), _temp), possibleConstructorReturn(_this, _ret);
    }

    return NavbarStyle;
}(StyleSet), (_descriptor$10 = _applyDecoratedDescriptor$11(_class$18.prototype, "wrappedIcon", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return [this.icon, {
            fontSize: "100%",
            float: "left",
            ":hover": {
                backgroundColor: colors.HOVER_BLUE
            }
        }];
    }
}), _descriptor2$10 = _applyDecoratedDescriptor$11(_class$18.prototype, "navCollapseElement", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            backgroundColor: colors.BLACK,
            marginLeft: "-" + padding,
            textAlign: "initial",
            minWidth: "100%",
            paddingRight: "20px",
            fontFamily: this.fontFamily,
            // lineHeight: "20px",
            maxHeight: sidebarHeight,
            height: sidebarHeight,
            lineHeight: sidebarHeight,
            ":hover": {
                backgroundColor: colors.HOVER_BLUE
            }
        };
    }
}), _descriptor3$10 = _applyDecoratedDescriptor$11(_class$18.prototype, "navElementHorizontal", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            height: navbarHeight,
            // minHeight: navbarHeight,
            // textAlign: "center",
            color: "#eee",
            listStyleType: "none",
            cursor: "pointer",
            padding: "0 10px",
            fontFamily: this.fontFamily,
            ":hover": {
                backgroundColor: colors.HOVER_BLUE
            }
        };
    }
}), _descriptor4$8 = _applyDecoratedDescriptor$11(_class$18.prototype, "navElementVerticalArrow", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            width: "20px",
            textAlign: "center"
        };
    }
}), _descriptor5$5 = _applyDecoratedDescriptor$11(_class$18.prototype, "navElementHorizontalArrow", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            paddingLeft: "5px",
            fontFamily: this.fontFamily
        };
    }
}), _descriptor6$4 = _applyDecoratedDescriptor$11(_class$18.prototype, "navElementVertical", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            cursor: "pointer",
            listStyleType: "none",
            minHeight: sidebarHeight,
            color: "#eee",
            backgroundColor: colors.BLUE,
            overflow: "hidden",
            position: "relative",
            fontFamily: this.fontFamily,
            ">*": {
                paddingLeft: "20px"
            }
        };
    }
}), _descriptor7$4 = _applyDecoratedDescriptor$11(_class$18.prototype, "navElementValueVertical", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            zIndex: "1",
            position: "relative",
            width: "100%",
            height: sidebarHeight,
            lineHeight: sidebarHeight,
            fontFamily: this.fontFamily,
            ":hover": {
                backgroundColor: colors.HOVER_BLUE
            }
        };
    }
}), _descriptor8$3 = _applyDecoratedDescriptor$11(_class$18.prototype, "navElementVerticalHover", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            ":hover": {
                backgroundColor: colors.HOVER_BLUE
            }
        };
    }
}), _descriptor9$2 = _applyDecoratedDescriptor$11(_class$18.prototype, "navElementValueHorizontal", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            width: "100%",
            // height: sidebarHeight,
            // lineHeight: sidebarHeight,
            fontFamily: this.fontFamily
        };
    }
}), _descriptor10 = _applyDecoratedDescriptor$11(_class$18.prototype, "navLinkElement", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            display: "block",
            color: "#eee",
            textDecoration: "none",
            listStyleType: "none",
            fontFamily: this.fontFamily,
            ":hover": {
                backgroundColor: colors.HOVER_BLUE,
                color: "#eee",
                textDecoration: "none"
            },
            ":focus": {
                color: "#eee",
                textDecoration: "none"
            },
            ":active": {
                color: "#eee",
                textDecoration: "none"
            },
            ":visited": {
                color: "#eee",
                textDecoration: "none"
            }
        };
    }
}), _descriptor11 = _applyDecoratedDescriptor$11(_class$18.prototype, "navElementSectionHorizontal", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            display: "inline-block",
            paddingLeft: "0",
            height: navbarHeight,
            marginBottom: "0",
            fontFamily: this.fontFamily
        };
    }
}), _descriptor12 = _applyDecoratedDescriptor$11(_class$18.prototype, "navElementSectionVertical", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            paddingLeft: "0",
            marginBottom: "0",
            width: "100%",
            fontFamily: this.fontFamily
        };
    }
}), _descriptor13$1 = _applyDecoratedDescriptor$11(_class$18.prototype, "sidePanelGroup", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            paddingTop: navbarHeight,
            height: "inherit",
            width: sidebarWidth,
            position: "absolute",
            zIndex: "3",
            transition: ".2s",
            fontFamily: this.fontFamily
        };
    }
}), _descriptor14$1 = _applyDecoratedDescriptor$11(_class$18.prototype, "leftSidePanel", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        var _ref2;

        return _ref2 = {
            top: "0",
            bottom: "0",
            height: "100%",
            backgroundColor: colors.BLUE,
            overflow: "hidden",
            overflowY: "scroll",
            width: sidebarWidthLeft,
            position: "fixed",
            zIndex: "3000",
            "-ms-overflow-style": "none"
        }, defineProperty(_ref2, "overflow", "-moz-scrollbars-none"), defineProperty(_ref2, "::-webkit-scrollbar", {
            display: "none"
        }), defineProperty(_ref2, "boxShadow", "0px 0px 10px " + boxShadowColor), defineProperty(_ref2, "fontFamily", this.fontFamily), _ref2;
    }
}), _descriptor15$1 = _applyDecoratedDescriptor$11(_class$18.prototype, "rightSidePanel", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            top: "0",
            bottom: "0",
            backgroundColor: colors.BLUE,
            height: "100%",
            overflow: "hidden",
            width: sidebarWidth,
            position: "fixed",
            zIndex: "3000",
            boxShadow: "0px 0px 10px " + boxShadowColor,
            fontFamily: this.fontFamily
        };
    }
}), _descriptor16$1 = _applyDecoratedDescriptor$11(_class$18.prototype, "navManager", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            height: navbarHeight,
            lineHeight: navbarHeight,
            width: "100%",
            backgroundColor: colors.BLACK,
            boxShadow: "0px 0px 10px #000",
            color: "#f2f2f2",
            zIndex: "9999",
            position: "fixed",
            fontFamily: this.fontFamily
        };
    }
}), _descriptor17$1 = _applyDecoratedDescriptor$11(_class$18.prototype, "hrStyle", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            margin: "10px 5%",
            borderTop: "2px solid " + colors.HOVER_BLUE
        };
    }
})), _class$18);
var NavEffectsStyle = (_class3$8 = function (_StyleSet2) {
    inherits(NavEffectsStyle, _StyleSet2);

    function NavEffectsStyle() {
        var _ref3;

        var _temp2, _this2, _ret2;

        classCallCheck(this, NavEffectsStyle);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return _ret2 = (_temp2 = (_this2 = possibleConstructorReturn(this, (_ref3 = NavEffectsStyle.__proto__ || Object.getPrototypeOf(NavEffectsStyle)).call.apply(_ref3, [this].concat(args))), _this2), _initDefineProp$11(_this2, "navVerticalLeftHide", _descriptor18$1, _this2), _initDefineProp$11(_this2, "navVerticalRightHide", _descriptor19$1, _this2), _initDefineProp$11(_this2, "navVerticalLeftShow", _descriptor20$1, _this2), _initDefineProp$11(_this2, "navVerticalRightShow", _descriptor21$1, _this2), _temp2), possibleConstructorReturn(_this2, _ret2);
    }

    return NavEffectsStyle;
}(StyleSet), (_descriptor18$1 = _applyDecoratedDescriptor$11(_class3$8.prototype, "navVerticalLeftHide", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            marginLeft: "-" + sidebarHideWidth,
            transition: sidebarTransition,
            display: "block",
            overflow: "hidden"
        };
    }
}), _descriptor19$1 = _applyDecoratedDescriptor$11(_class3$8.prototype, "navVerticalRightHide", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            marginRight: "-" + sidebarHideWidth,
            transition: sidebarTransition,
            display: "block",
            overflow: "hidden"
        };
    }
}), _descriptor20$1 = _applyDecoratedDescriptor$11(_class3$8.prototype, "navVerticalLeftShow", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            marginLeft: "0",
            transition: sidebarTransition,
            display: "block"
        };
    }
}), _descriptor21$1 = _applyDecoratedDescriptor$11(_class3$8.prototype, "navVerticalRightShow", [styleRule], {
    enumerable: true,
    initializer: function initializer() {
        return {
            marginRight: "0",
            transition: sidebarTransition,
            display: "block"
        };
    }
})), _class3$8);

var navStyle = NavbarStyle.getInstance();
var navEffects = NavEffectsStyle.getInstance();
var navSessionManager = new SessionStorageMap("navManager");
var BasicOrientedElement = function (_UI$Element) {
    inherits(BasicOrientedElement, _UI$Element);

    function BasicOrientedElement() {
        classCallCheck(this, BasicOrientedElement);
        return possibleConstructorReturn(this, (BasicOrientedElement.__proto__ || Object.getPrototypeOf(BasicOrientedElement)).apply(this, arguments));
    }

    createClass(BasicOrientedElement, [{
        key: "getOrientation",
        value: function getOrientation() {
            if (this.options.orientation) {
                return this.options.orientation;
            }
            if (this.parent && typeof this.parent.getOrientation === "function") {
                return this.parent.getOrientation();
            }
            return UI.Orientation.HORIZONTAL;
        }
    }]);
    return BasicOrientedElement;
}(UI.Element);

// NavElements should know if they are in vertical or horizontal mode, so they can behave differently


var NavElement = function (_UI$Primitive) {
    inherits(NavElement, _UI$Primitive);

    function NavElement() {
        classCallCheck(this, NavElement);

        var _this2 = possibleConstructorReturn(this, (NavElement.__proto__ || Object.getPrototypeOf(NavElement)).apply(this, arguments));

        _this2.isToggled = _this2.getToggledState();
        return _this2;
    }

    createClass(NavElement, [{
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            if (this.getOrientation() === UI.Orientation.HORIZONTAL) {
                // it is in the navbar
                attr.addClass(navStyle.navElementHorizontal);

                if (this.parent instanceof NavElementSection) {
                    attr.setStyle("float", "left");
                } else if (this instanceof NavElement) {
                    // navbar element collapse
                    attr.addClass(navStyle.navCollapseElement);
                }
            } else {
                // it is in the sidebar
                attr.addClass(navStyle.navElementVertical);
            }
        }
    }, {
        key: "getSelf",
        value: function getSelf() {
            var style = this.getOrientation() === UI.Orientation.HORIZONTAL ? navStyle.navElementValueHorizontal : navStyle.navElementValueVertical;

            return UI.createElement(
                BasicOrientedElement,
                { className: style },
                this.getValue()
            );
        }
    }, {
        key: "getSubElements",
        value: function getSubElements() {
            var childrenToRender = this.getGivenChildren();
            if (childrenToRender.length) {
                var subElementsStyle = navStyle.navElementSubElementsVertical;
                if (this.getOrientation() == UI.Orientation.HORIZONTAL) {
                    subElementsStyle = navStyle.navElementSubElementsHorizontal;
                }
                if (this.isToggled) {
                    Object.assign(subElementsStyle, navStyle.showNavElement);
                }

                var subElementsClass = "";
                if (!this.isToggled) {
                    subElementsClass = "hidden";
                }
                return UI.createElement(
                    BasicOrientedElement,
                    { ref: "contentArea", style: subElementsStyle, className: subElementsClass },
                    childrenToRender
                );
            }
        }
    }, {
        key: "getValue",
        value: function getValue() {
            var result = void 0;
            if (this.options.children.length) {
                if (this.getOrientation() === UI.Orientation.VERTICAL) {
                    // is in the sidebar
                    result = [UI.createElement(
                        BasicOrientedElement,
                        { style: { marginLeft: "-15px" }, className: navStyle.navElementVerticalHover },
                        UI.createElement(FACollapseIcon, { ref: "collapseIcon", collapsed: !this.isToggled, className: navStyle.navElementVerticalArrow }),
                        this.options.value
                    )];
                } else if (this.getOrientation() === UI.Orientation.HORIZONTAL) {
                    // is in the navbar
                    result = [this.options.value, UI.createElement(FAIcon, { icon: "angle-down", className: navStyle.navElementHorizontalArrow })];
                }
            } else {
                result = this.options.value;
            }
            return result;
        }
    }, {
        key: "render",
        value: function render() {
            return [this.getSelf(), this.getSubElements()];
        }
    }, {
        key: "showChildren",
        value: function showChildren() {
            this.contentArea.removeClass("hidden");
        }
    }, {
        key: "hideChildren",
        value: function hideChildren() {
            this.contentArea.addClass("hidden");
        }
    }, {
        key: "toggleChildren",
        value: function toggleChildren() {
            if (!this.getGivenChildren().length) {
                return;
            }

            if (!this.isToggled) {
                this.showChildren();
            } else {
                this.hideChildren();
            }

            this.collapseIcon.setCollapsed(this.isToggled);
            this.isToggled = !this.isToggled;

            this.saveToggledState();
        }
    }, {
        key: "getSessionKeyName",
        value: function getSessionKeyName() {
            var sessionKeyName = this.options.sessionKey || this.options.href;
            if (!sessionKeyName) {
                throw Error("Persistent nav element needs a unique session key!");
            }
            return sessionKeyName;
        }
    }, {
        key: "getLocalToggledState",
        value: function getLocalToggledState() {
            if (this.hasOwnProperty("isToggled")) {
                return !!this.isToggled;
            }
            return !!this.options.defaultToggled;
        }
    }, {
        key: "getToggledState",
        value: function getToggledState() {
            if (!this.options.persistent) {
                return this.getLocalToggledState();
            }
            var sessionKeyName = this.getSessionKeyName();
            return navSessionManager.get(sessionKeyName, this.getLocalToggledState());
        }
    }, {
        key: "saveToggledState",
        value: function saveToggledState() {
            if (!this.options.persistent) {
                return;
            }
            var sessionKeyName = this.getSessionKeyName();
            navSessionManager.set(sessionKeyName, this.getLocalToggledState());
        }
    }, {
        key: "onMount",
        value: function onMount() {
            var _this3 = this;

            this.addNodeListener("mouseenter", function () {
                if (_this3.getOrientation() === UI.Orientation.HORIZONTAL && _this3.getGivenChildren().length) {
                    _this3.showChildren();
                }
            });
            this.addNodeListener("mouseleave", function () {
                if (_this3.getOrientation() === UI.Orientation.HORIZONTAL && _this3.getGivenChildren().length) {
                    _this3.hideChildren();
                }
            });
            this.addClickListener(function (event) {
                if (_this3.getOrientation() === UI.Orientation.VERTICAL) {
                    event.stopPropagation();
                    _this3.toggleChildren();
                }
            });
        }
    }]);
    return NavElement;
}(UI.Primitive(BasicOrientedElement, "li"));

var NavLinkElement = function (_UI$Primitive2) {
    inherits(NavLinkElement, _UI$Primitive2);

    function NavLinkElement() {
        classCallCheck(this, NavLinkElement);
        return possibleConstructorReturn(this, (NavLinkElement.__proto__ || Object.getPrototypeOf(NavLinkElement)).apply(this, arguments));
    }

    createClass(NavLinkElement, [{
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            get(NavLinkElement.prototype.__proto__ || Object.getPrototypeOf(NavLinkElement.prototype), "extraNodeAttributes", this).call(this, attr);
            attr.addClass(navStyle.navLinkElement);
        }
    }, {
        key: "getValue",
        value: function getValue() {
            return this.options.value;
        }
    }]);
    return NavLinkElement;
}(UI.Primitive(NavElement, "a"));

var NavElementSection = function (_UI$Primitive3) {
    inherits(NavElementSection, _UI$Primitive3);

    function NavElementSection() {
        classCallCheck(this, NavElementSection);
        return possibleConstructorReturn(this, (NavElementSection.__proto__ || Object.getPrototypeOf(NavElementSection)).apply(this, arguments));
    }

    createClass(NavElementSection, [{
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            if (this.getOrientation() === UI.Orientation.HORIZONTAL) {
                // it is in the navbar
                attr.addClass(navStyle.navElementSectionHorizontal);
                // this is functionality, I really want this to be isolated from the actual design
                // TODO: anchor might not be defined
                attr.setStyle("float", this.options.anchor);
            } else {
                // it is in the sidebar
                attr.addClass(navStyle.navElementSectionVertical);
            }
        }
    }, {
        key: "getAnchor",
        value: function getAnchor() {
            return this.options.anchor || UI.Direction.LEFT;
        }
    }, {
        key: "getOrientation",
        value: function getOrientation() {
            return this.parent.getOrientation();
        }

        // appendChild(child) {
        //     this.options.children.push(child);
        //     this.redraw();
        //     return child;
        // }

    }]);
    return NavElementSection;
}(UI.Primitive("ul"));

var SidePanelGroup = function (_UI$Element2) {
    inherits(SidePanelGroup, _UI$Element2);

    function SidePanelGroup() {
        classCallCheck(this, SidePanelGroup);
        return possibleConstructorReturn(this, (SidePanelGroup.__proto__ || Object.getPrototypeOf(SidePanelGroup)).apply(this, arguments));
    }

    createClass(SidePanelGroup, [{
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            attr.addClass(navStyle.sidePanelGroup);
            if (this.options.anchor === UI.Direction.RIGHT) {
                attr.setStyle("right", 0);
            } else {
                attr.setStyle("width", "250px");
            }
        }
    }, {
        key: "getOrientation",
        value: function getOrientation() {
            return UI.Orientation.VERTICAL;
        }
    }]);
    return SidePanelGroup;
}(UI.Element);

var SidePanel = function (_UI$Element3) {
    inherits(SidePanel, _UI$Element3);

    function SidePanel() {
        classCallCheck(this, SidePanel);

        var _this7 = possibleConstructorReturn(this, (SidePanel.__proto__ || Object.getPrototypeOf(SidePanel)).apply(this, arguments));

        if (!_this7.node) {
            _this7.mount(document.body);
        }

        if (_this7.options.name) {
            _this7.storageSerializer = new SessionStorageMap("sidePanel" + _this7.options.name);
            _this7.visible = _this7.storageSerializer.get("visible");
        }

        if (_this7.visible) {
            _this7.show();
        } else {
            _this7.hide();
        }
        return _this7;
    }

    createClass(SidePanel, [{
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            if (this.options.anchor === UI.Direction.RIGHT) {
                attr.addClass(navStyle.rightSidePanel);
                attr.setStyle("right", "0");
            } else {
                attr.addClass(navStyle.leftSidePanel);
            }
        }
    }, {
        key: "setVisible",
        value: function setVisible(value) {
            this.visible = value;
            if (this.storageSerializer) {
                this.storageSerializer.set("visible", value);
            }
        }
    }, {
        key: "show",
        value: function show() {
            if (this.options.anchor === UI.Direction.RIGHT) {
                this.removeClass(navEffects.navVerticalRightHide);
                this.addClass(navEffects.navVerticalRightShow);
            } else {
                this.removeClass(navEffects.navVerticalLeftHide);
                this.addClass(navEffects.navVerticalLeftShow);
            }

            this.setVisible(true);
        }
    }, {
        key: "hide",
        value: function hide() {
            if (this.options.anchor === UI.Direction.RIGHT) {
                this.removeClass(navEffects.navVerticalRightShow);
                this.addClass(navEffects.navVerticalRightHide);
            } else {
                this.removeClass(navEffects.navVerticalLeftShow);
                this.addClass(navEffects.navVerticalLeftHide);
            }

            this.setVisible(false);
        }
    }, {
        key: "toggle",
        value: function toggle() {
            if (this.visible) {
                this.hide();
            } else {
                this.show();
            }
        }
    }, {
        key: "getOrientation",
        value: function getOrientation() {
            return UI.Orientation.VERTICAL;
        }
    }, {
        key: "render",
        value: function render() {
            return UI.createElement(
                SidePanelGroup,
                { ref: "this.wrappedPanel", anchor: this.options.anchor },
                this.getGivenChildren()
            );
        }
    }]);
    return SidePanel;
}(UI.Element);

var SocialNavbarItems = function (_NavElementSection) {
    inherits(SocialNavbarItems, _NavElementSection);

    function SocialNavbarItems() {
        classCallCheck(this, SocialNavbarItems);
        return possibleConstructorReturn(this, (SocialNavbarItems.__proto__ || Object.getPrototypeOf(SocialNavbarItems)).apply(this, arguments));
    }

    createClass(SocialNavbarItems, [{
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            get(SocialNavbarItems.prototype.__proto__ || Object.getPrototypeOf(SocialNavbarItems.prototype), "extraNodeAttributes", this).call(this, attr);
            attr.setStyle({
                position: "relative"
            });
        }
    }, {
        key: "render",
        value: function render() {
            return [this.options.children, UI.createElement(UI.Switcher, { ref: "switcher", style: {
                    position: "absolute",
                    maxWidth: "calc(100vw - 76px)",
                    top: "50px",
                    right: "0",
                    height: "300px",
                    width: "400px",
                    boxShadow: "0px 0px 10px #666"
                }, className: "hidden" })];
        }
    }, {
        key: "show",
        value: function show(content, child) {
            var _this9 = this;

            this.activeChild = child;
            this.switcher.removeClass("hidden");
            this.switcher.setActive(content, child);
            this.bodyListener = document.body.addEventListener("click", function () {
                return _this9.hide();
            });
        }
    }, {
        key: "hide",
        value: function hide() {
            this.switcher.addClass("hidden");
            this.activeChild = null;
            document.body.removeEventListener("click", this.bodyListener);
        }
    }, {
        key: "onMount",
        value: function onMount() {
            var _this10 = this;

            this.addListener("changeSwitcher", function (content, child) {
                if (_this10.activeChild == child) {
                    _this10.hide();
                } else {
                    _this10.show(content, child);
                }
            });

            this.switcher.addClickListener(function (event) {
                event.stopPropagation();
            });
        }
    }]);
    return SocialNavbarItems;
}(NavElementSection);

var NavManager = function (_UI$Primitive4) {
    inherits(NavManager, _UI$Primitive4);

    function NavManager() {
        var persistentLeftSidePanel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        var persistentRightSidePanel = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        classCallCheck(this, NavManager);

        var _this11 = possibleConstructorReturn(this, (NavManager.__proto__ || Object.getPrototypeOf(NavManager)).call(this));

        var icon = [UI.createElement(UI.SVG.CSAIconSVG, { size: 25, style: {} }), "Home"];

        _this11.leftSidePanel = UI.createElement(
            SidePanel,
            { anchor: UI.Direction.LEFT, name: "left", persistent: persistentLeftSidePanel },
            UI.createElement(
                BasicOrientedElement,
                { orientation: UI.Orientation.VERTICAL, ref: _this11.refLink("navigationPanel") },
                _this11.getLeftSidePanelFixedChildren()
            ),
            UI.createElement(
                UI.Carousel,
                { ref: _this11.refLink("carousel") },
                UI.createElement(
                    BasicOrientedElement,
                    { orientation: UI.Orientation.VERTICAL, ref: _this11.refLink("navigationPanel") },
                    _this11.getLeftSidePanelChildren()
                )
            )
        );

        _this11.rightSidePanel = UI.createElement(
            SidePanel,
            { anchor: UI.Direction.RIGHT, name: "right", persistent: persistentRightSidePanel },
            _this11.getRightSidePanelChildren()
        );

        _this11.leftConditionedChildren = _this11.getLeftConditionedChildren();
        _this11.rightConditionedChildren = _this11.getRightConditionedChildren();
        return _this11;
    }

    createClass(NavManager, [{
        key: "getLeftSidePanelFixedChildren",
        value: function getLeftSidePanelFixedChildren() {
            return [];
        }
    }, {
        key: "getLeftSidePanelChildren",
        value: function getLeftSidePanelChildren() {
            return [];
        }
    }, {
        key: "getRightSidePanelChildren",
        value: function getRightSidePanelChildren() {
            return [];
        }
    }, {
        key: "getLeftConditionedChildren",
        value: function getLeftConditionedChildren() {
            return [];
        }
    }, {
        key: "getRightConditionedChildren",
        value: function getRightConditionedChildren() {
            return [];
        }
    }, {
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            attr.addClass(navStyle.navManager);
        }
    }, {
        key: "getOrientation",
        value: function getOrientation() {
            return UI.Orientation.HORIZONTAL;
        }

        // TODO: lots of duplicate code here, with left/right stuff

    }, {
        key: "getLeftSideIcon",
        value: function getLeftSideIcon() {
            var _this12 = this;

            if (!this.hasLeftSidePanel()) {
                return null;
            }
            if (!this.leftPanelToggler) {
                this.leftPanelToggler = UI.createElement(FAIcon, { icon: "bars", onClick: function onClick() {
                        if (_this12.wrapped) {
                            if (_this12.carousel.getActive() === _this12.navigationPanel) {
                                _this12.toggleLeftSidePanel();
                            } else {
                                _this12.carousel.setActive(_this12.navigationPanel);
                                if (!_this12.getLeftSidePanel().visible) {
                                    _this12.toggleLeftSidePanel();
                                }
                            }
                        } else {
                            _this12.toggleLeftSidePanel();
                        }
                    }, style: navStyle.leftSideIcon });
            }
            return this.leftPanelToggler;
        }
    }, {
        key: "getRightSideIcon",
        value: function getRightSideIcon() {
            var _this13 = this;

            if (!this.hasRightSidePanel()) {
                return null;
            }
            if (!this.rightPanelToggler) {
                this.rightPanelToggler = UI.createElement(FAIcon, { icon: "ellipsis-v", onClick: function onClick() {
                        return _this13.toggleRightSidePanel();
                    }, style: navStyle.rightSideIcon });
            }
            return this.rightPanelToggler;
        }
    }, {
        key: "getFixedWidth",
        value: function getFixedWidth() {
            var width = 10;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var child = _step.value;

                    width += child.getWidth();
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

            width -= this.getLeftConditioned().getWidth();
            width -= this.getRightConditioned().getWidth();
            return width;
        }
    }, {
        key: "getWrappedIcon",
        value: function getWrappedIcon() {
            var _this14 = this;

            if (!this.wrappedToggler) {
                this.wrappedToggler = UI.createElement(FAIcon, { icon: "ellipsis-h", onClick: function onClick() {
                        if (_this14.wrapped) {
                            if (_this14.carousel.getActive() === _this14.wrappedPanel) {
                                _this14.toggleLeftSidePanel();
                            } else {
                                _this14.carousel.setActive(_this14.wrappedPanel);
                                if (!_this14.getLeftSidePanel().visible) {
                                    _this14.toggleLeftSidePanel();
                                }
                            }
                        } else {
                            _this14.toggleLeftSidePanel();
                        }
                    }, style: { lineHeight: "50px" },
                    className: navStyle.wrappedIcon.toString() + " " + (this.wrapped ? "" : "hidden") });
            }
            return this.wrappedToggler;
        }
    }, {
        key: "getLeftFixed",
        value: function getLeftFixed() {
            return [];
        }
    }, {
        key: "getRightFixed",
        value: function getRightFixed() {
            return [];
        }
    }, {
        key: "getLeftConditionedWrapper",
        value: function getLeftConditionedWrapper() {
            if (!this.leftConditionedWrapper) {
                this.leftConditionedWrapper = UI.createElement(
                    NavElementSection,
                    { anchor: UI.Direction.LEFT },
                    this.getLeftConditioned()
                );
            }
            return this.leftConditionedWrapper;
        }
    }, {
        key: "getRightConditionedWrapper",
        value: function getRightConditionedWrapper() {
            if (!this.rightConditionedWrapper) {
                this.rightConditionedWrapper = UI.createElement(
                    NavElementSection,
                    { anchor: UI.Direction.RIGHT },
                    this.getRightConditioned()
                );
            }
            return this.rightConditionedWrapper;
        }
    }, {
        key: "getLeftConditioned",
        value: function getLeftConditioned() {
            if (!this.leftConditioned) {
                this.leftConditioned = UI.createElement(
                    NavElementSection,
                    null,
                    this.getLeftConditionedChildren()
                );
            }
            return this.leftConditioned;
        }
    }, {
        key: "getRightConditioned",
        value: function getRightConditioned() {
            if (!this.rightConditioned) {
                this.rightConditioned = UI.createElement(
                    NavElementSection,
                    null,
                    this.getRightConditionedChildren()
                );
            }
            return this.rightConditioned;
        }
    }, {
        key: "addLeftConditioned",
        value: function addLeftConditioned(element) {
            this.getLeftConditioned().appendChild(element);
        }
    }, {
        key: "addRightConditioned",
        value: function addRightConditioned(element) {
            this.rightConditioned().appendChild(element);
        }
    }, {
        key: "hasLeftSidePanel",
        value: function hasLeftSidePanel() {
            return this.getLeftSidePanel() != null;
        }
    }, {
        key: "hasRightSidePanel",
        value: function hasRightSidePanel() {
            return this.getRightSidePanel() != null;
        }
    }, {
        key: "getLeftSidePanel",
        value: function getLeftSidePanel() {
            return this.leftSidePanel;
        }
    }, {
        key: "getRightSidePanel",
        value: function getRightSidePanel() {
            return this.rightSidePanel;
        }
    }, {
        key: "toggleLeftSidePanel",
        value: function toggleLeftSidePanel() {
            this.getLeftSidePanel().toggle();
            this.dispatch("toggledLeftSide", this.getLeftSidePanel().visible);
            if (this.hasRightSidePanel() && this.getLeftSidePanel().visible && this.getRightSidePanel().visible) {
                this.getLeftSidePanel().setStyle("z-index", 3001);
                this.getRightSidePanel().setStyle("z-index", 3000);
            }
        }
    }, {
        key: "toggleRightSidePanel",
        value: function toggleRightSidePanel() {
            this.getRightSidePanel().toggle();
            this.dispatch("toggledRightSide", this.getRightSidePanel().visible);
            if (this.hasLeftSidePanel() && this.getLeftSidePanel().visible && this.getRightSidePanel().visible) {
                this.getRightSidePanel().setStyle("z-index", 3001);
                this.getLeftSidePanel().setStyle("z-index", 3000);
            }
        }
    }, {
        key: "render",
        value: function render() {
            return [this.getLeftSideIcon(), this.getLeftFixed(), this.getLeftConditionedWrapper(), this.getWrappedIcon(), this.getRightSideIcon(), this.getRightFixed(), this.getRightConditionedWrapper()];
        }
    }, {
        key: "bindToNode",
        value: function bindToNode() {
            // TODO: Don't forget to add href to this
            // this.addLeftConditioned(<NavLinkElement value={UI.T("Dynamic left")} href="/link3"/>);

            // TODO: add listener on window resize
            /*
            this.addRightConditioned(<NavElement value={UI.T("Dynamic right")}>
                <NavElement value="hello"/>
                <NavElement value="world"/>
            </NavElement>);
            */

            get(NavManager.prototype.__proto__ || Object.getPrototypeOf(NavManager.prototype), "bindToNode", this).apply(this, arguments);
            this.onMount();
        }
    }, {
        key: "checkForWrap",
        value: function checkForWrap() {
            if (this.getLeftConditioned().children.length || this.getRightConditioned().children.length) {
                if (!this.wrapped) {
                    this.unwrappedTotalWidth = 10;
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = this.children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var child = _step2.value;

                            this.unwrappedTotalWidth += child.getWidth();
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
                if (window.innerWidth < this.unwrappedTotalWidth && !this.wrapped) {
                    this.wrapped = true;
                    this.wrappedPanel = UI.createElement(BasicOrientedElement, { orientation: UI.Orientation.VERTICAL });
                    this.carousel.appendChild(this.wrappedPanel);

                    this.getWrappedIcon().setStyle("width", "calc(100% - " + this.getFixedWidth() + "px)");
                    changeParent(this.getRightConditioned(), this.wrappedPanel);
                    changeParent(this.getLeftConditioned(), this.wrappedPanel);
                    this.getRightConditioned().redraw();
                    this.getLeftConditioned().redraw();
                    this.getWrappedIcon().removeClass("hidden");
                    this.dispatch("wrapped", true);
                } else if (window.innerWidth >= this.unwrappedTotalWidth && this.wrapped) {
                    this.wrapped = false;
                    this.getWrappedIcon().addClass("hidden");
                    changeParent(this.getLeftConditioned(), this.getLeftConditionedWrapper());
                    changeParent(this.getRightConditioned(), this.getRightConditionedWrapper());
                    this.carousel.eraseChild(this.wrappedPanel);
                    this.getLeftConditioned().redraw();
                    this.getRightConditioned().redraw();
                    this.dispatch("wrapped", false);
                }
            }
        }
    }, {
        key: "onMount",
        value: function onMount() {
            var _this15 = this;

            setTimeout(function () {
                return _this15.checkForWrap();
            });
            window.addEventListener("resize", function () {
                return _this15.checkForWrap();
            });
            this.addListener("maybeWrap", function () {
                return _this15.checkForWrap();
            });
        }
    }]);
    return NavManager;
}(UI.Primitive("nav"));

var initializeNavbar = function initializeNavbar() {
    NavManager.Global = NavManager.Global || new NavManager();
    return NavManager.Global;
};

var navStyle$1 = NavbarStyle.getInstance();

var NavIcon = function (_NavElement) {
    inherits(NavIcon, _NavElement);

    function NavIcon() {
        classCallCheck(this, NavIcon);
        return possibleConstructorReturn(this, (NavIcon.__proto__ || Object.getPrototypeOf(NavIcon)).apply(this, arguments));
    }

    createClass(NavIcon, [{
        key: "extraNodeAttributes",
        value: function extraNodeAttributes(attr) {
            get(NavIcon.prototype.__proto__ || Object.getPrototypeOf(NavIcon.prototype), "extraNodeAttributes", this).call(this, attr);
            attr.setStyle(navStyle$1.icon);
        }
    }, {
        key: "getValue",
        value: function getValue() {
            return [this.getIcon(), this.getContent()];
        }
    }, {
        key: "onMount",
        value: function onMount() {
            this.addClickListener(function (event) {
                event.stopPropagation();
            });
        }
    }]);
    return NavIcon;
}(NavElement);

var maxDistanceFromSide = 25; // Pixels
var minSwipeDistance = 60; // Pixels
var minSwipeSpeed = 0.5; // Pixels per millisecond

function touchEventHandler(ignoreCondition, successCondition, onSuccess) {
    var xType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "client";

    return function (event) {
        if (ignoreCondition(event.targetTouches[0][xType + "X"])) {
            return;
        }
        var startX = event.targetTouches[0][xType + "X"];
        var panelToggler = new Dispatcher();
        var startTime = StemDate.now();

        var touchCallback = function touchCallback(event) {
            if (successCondition(event.targetTouches[0][xType + "X"], startX, StemDate.now() - startTime)) {
                panelToggler.dispatch(true);
            }
        };
        var touchendCallback = function touchendCallback() {
            panelToggler.dispatch(false);
        };
        document.addEventListener("touchmove", touchCallback);
        document.addEventListener("touchend", touchendCallback);

        panelToggler.addListener(function (success) {
            if (success) {
                onSuccess();
            }
            document.removeEventListener("touchmove", touchCallback);
            document.removeEventListener("touchend", touchendCallback);
        });
    };
}

function initializeSwipeRight(navManager) {
    var maxDistance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : maxDistanceFromSide;
    var minDistance = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : minSwipeDistance;
    var minSpeed = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : minSwipeSpeed;

    document.addEventListener("touchstart", touchEventHandler(function (touchX) {
        return navManager.getLeftSidePanel().visible || window.pageXOffset !== 0 || touchX > maxDistance;
    }, function (touchX, startX, duration) {
        return touchX - startX >= minDistance && (touchX - startX) / duration >= minSpeed;
    }, function () {
        return navManager.toggleLeftSidePanel();
    }));
    navManager.getLeftSidePanel().addNodeListener("touchstart", touchEventHandler(function () {
        return !navManager.getLeftSidePanel().visible;
    }, function (touchX, startX) {
        return startX - touchX >= minDistance && startX - touchX >= minSpeed;
    }, function () {
        return navManager.toggleLeftSidePanel();
    }));
}

function initializeSwipeLeft(navManager) {
    var maxDistance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : maxDistanceFromSide;
    var minDistance = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : minSwipeDistance;
    var minSpeed = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : minSwipeSpeed;

    document.addEventListener("touchstart", touchEventHandler(function (touchX) {
        return navManager.getRightSidePanel().visible || window.innerWidth - touchX > maxDistance;
    }, function (touchX, startX, duration) {
        return startX - touchX >= minDistance && (startX - touchX) / duration >= minSpeed;
    }, function () {
        return navManager.toggleRightSidePanel();
    }));
    navManager.getRightSidePanel().addNodeListener("touchstart", touchEventHandler(function () {
        return !navManager.getRightSidePanel().visible;
    }, function (touchX, startX, duration) {
        return touchX - startX >= minDistance && (touchX - startX) / duration >= minSpeed;
    }, function () {
        return navManager.toggleRightSidePanel();
    }));
}

function initializeSwipeEvents(navManager) {
    var maxDistanceFromSide = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : maxDistanceFromSide;
    var minDistance = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : minSwipeDistance;
    var minSpeed = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : minSwipeSpeed;

    if (!Device.isTouchDevice()) {
        return;
    }
    if (navManager.hasLeftSidePanel()) {
        initializeSwipeRight(navManager, maxDistanceFromSide, minDistance, minSpeed);
    }
    if (navManager.hasRightSidePanel()) {
        initializeSwipeLeft(navManager, maxDistanceFromSide, minDistance, minSpeed);
    }
}

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

var State = function (_Dispatchable) {
    inherits(State, _Dispatchable);

    function State() {
        classCallCheck(this, State);

        var _this = possibleConstructorReturn(this, (State.__proto__ || Object.getPrototypeOf(State)).call(this));

        _this.stores = new Map();
        // A version of applyEvent that's binded to this
        // TODO: applyEvent should use the @bind decorator
        _this.applyEventWrapper = function (event) {
            _this.applyEvent(event);
        };
        return _this;
    }

    createClass(State, [{
        key: "getStore",
        value: function getStore(objectType) {
            objectType = objectType.toLowerCase();
            return this.stores.get(objectType);
        }
    }, {
        key: "getStoreForEvent",
        value: function getStoreForEvent(event) {
            var objectType = event.objectType || event.store;
            return this.getStore(objectType);
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
            var store = this.getStoreForEvent(event);
            if (store) {
                return store.applyEvent(event);
            } else {
                console.log("GlobalState: Missing store for event: ", event);
            }
        }
    }, {
        key: "get",
        value: function get$$1(objectType, objectId) {
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
    return State;
}(Dispatchable);

var GlobalState$1 = new State();

// When creating a store without an explicit state, this value should be assumes
// Change it to null for instance of you don't want stores to be added to any state by default
var DefaultState = GlobalState$1;

self.GlobalState = GlobalState$1;

// The store information is kept in a symbol, to not interfere with serialization/deserialization
var StoreSymbol = Symbol("Store");

var StoreObject = function (_Dispatchable) {
    inherits(StoreObject, _Dispatchable);

    function StoreObject(obj, event, store) {
        classCallCheck(this, StoreObject);

        var _this = possibleConstructorReturn(this, (StoreObject.__proto__ || Object.getPrototypeOf(StoreObject)).call(this));

        Object.assign(_this, obj);
        return _this;
    }

    createClass(StoreObject, [{
        key: "setStore",
        value: function setStore(store) {
            this[StoreSymbol] = store;
        }
    }, {
        key: "getStore",
        value: function getStore() {
            return this[StoreSymbol];
        }

        // By default, applying an event just shallow copies the fields from event.data

    }, {
        key: "applyEvent",
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
                var handlers = eventType.map(function (e) {
                    return _this2.addEventListener(e, callback);
                });
                return new CleanupJobs(handlers);
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
                return DefaultState;
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

// Store type primarily intended to store objects that come from a server DB, and have a unique numeric .id field


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
        value: function get$$1(id) {
            if (id == null) {
                return null;
            }
            return this.objects.get(parseInt(id));
        }
    }, {
        key: "getObjectIdForEvent",
        value: function getObjectIdForEvent(event) {
            return event.objectId || event.id;
        }
    }, {
        key: "getObjectForEvent",
        value: function getObjectForEvent(event) {
            var objectId = this.getObjectIdForEvent(event);
            return this.get(objectId);
        }

        // TODO: should this default to iterable?

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
            var obj = new this.ObjectWrapper(event.data, event, this);
            obj.setStore(this);
            return obj;
        }
    }, {
        key: "applyCreateEvent",
        value: function applyCreateEvent(event) {
            var sendDispatch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            var existingObject = this.getObjectForEvent(event);

            if (existingObject) {
                var refreshEvent = Object.assign({}, event);
                refreshEvent.type = "refresh";
                existingObject.applyEvent(refreshEvent);
                existingObject.dispatch("update", event);
                return existingObject;
            } else {
                var newObject = this.createObject(event);
                this.objects.set(this.getObjectIdForEvent(event), newObject);

                if (sendDispatch) {
                    this.dispatch("create", newObject, event);
                }
                return newObject;
            }
        }
    }, {
        key: "applyUpdateOrCreateEvent",
        value: function applyUpdateOrCreateEvent(event) {
            var obj = this.getObjectForEvent(event);
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
            var objDeleted = this.getObjectForEvent(event);
            if (objDeleted) {
                this.objects.delete(this.getObjectIdForEvent(event));
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
                var obj = this.getObjectForEvent(event);
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
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = objects[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var obj = _step.value;

                    this.fakeCreate(obj);
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
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = this.objects.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var object = _step2.value;

                        var _event = {
                            objectType: this.objectType,
                            objectId: object.id,
                            type: "fakeCreate",
                            data: object
                        };
                        callback(object, _event);
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
        value: function get$$1() {
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

// TODO: this file should be called StoreExtenders
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

                        Ajax.fetch(requestObject);
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
            value: function get$$1(id) {
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
            this.node = whitespaceNode;
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
            this.capture = [];
            var captureNode = {
                value: "",
                captureNode: true
            };

            // We treat the first character separately in order to support empty capture
            var _char = options.endPattern.charAt(0);
            var endCaptureNode = {
                value: _char
            };

            var endPatternPrefix = kmp(options.endPattern);
            var endPatternNodes = [endCaptureNode];

            lastNode.next = captureNode.next = function (input) {
                return input === _char ? endCaptureNode : captureNode;
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
                            var _char2 = stream.char();
                            if (_char2 === '{') {
                                bracketCount += 1;
                            } else if (_char2 === '}') {
                                if (bracketCount > 0) {
                                    bracketCount -= 1;
                                } else {
                                    // JSON ends here
                                    options[optionName] = jsonString.length > 0 ? this.parseJSON5(jsonString) : undefined;
                                    validJSON = true;
                                    break;
                                }
                            }
                            jsonString += _char2;
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

// Class that for every markup tag returns the UI class to instantiate for that element

var MarkupClassMap = function () {
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
        value: function get$$1(className) {
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



MarkupClassMap.GLOBAL = new MarkupClassMap();

var MarkupRenderer = function (_Panel) {
    inherits(MarkupRenderer, _Panel);

    function MarkupRenderer() {
        classCallCheck(this, MarkupRenderer);
        return possibleConstructorReturn(this, (MarkupRenderer.__proto__ || Object.getPrototypeOf(MarkupRenderer)).apply(this, arguments));
    }

    createClass(MarkupRenderer, [{
        key: "setOptions",
        value: function setOptions(options) {
            if (!options.classMap) {
                options.classMap = new MarkupClassMap(MarkupClassMap.GLOBAL);
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
            var _this2 = this;

            if (value instanceof UI.TextElement || value instanceof UI.Element) {
                // TODO: investigate this!
                return value;
            }

            if (typeof value === "string") {
                return new UI.TextElement(value);
            }
            if (Array.isArray(value)) {
                return value.map(function (x) {
                    return _this2.convertToUI(x);
                });
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
}(Panel);

MarkupClassMap.addClass("CodeSnippet", StaticCodeHighlighter);
MarkupClassMap.addClass("Link", Link);
MarkupClassMap.addClass("Image", Image);

// The FileSaver class is mean to be able to create a Save as... file dialog from text/bytes
// TODO: this file is work in progress
var autoBom = function autoBom(blob) {
    // Add the unicode boom if not present
    if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
        return new Blob([String.fromCharCode(0xFEFF), blob], { type: blob.type });
    }
    return blob;
};

var FileSaver = function (_Dispatchable) {
    inherits(FileSaver, _Dispatchable);

    function FileSaver(blob, fileName) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        classCallCheck(this, FileSaver);

        var _this = possibleConstructorReturn(this, (FileSaver.__proto__ || Object.getPrototypeOf(FileSaver)).call(this));

        _this.blob = blob;
        _this.fileName = fileName;
        _this.options = options;

        if (_this.options.autoBom) {
            _this.blob = autoBom(_this.blob);
        }

        // TODO: these should be static
        _this.saveLink = document.createElement("a");
        var canUseSaveLink = "download" in _this.saveLink;
        var is_safari = /constructor/i.test(window.HTMLElement) || window.safari;
        var is_chrome_ios = /CriOS\/[\d]+/.test(navigator.userAgent);

        var force = blob.type === "application/octet-stream";
        var objectUrl = void 0;

        _this.readyState = FileSaver.INIT;
        if (canUseSaveLink) {
            objectUrl = window.URL.createObjectURL(blob);
            setTimeout(function () {
                _this.saveLink.href = objectUrl;
                _this.saveLink.download = _this.fileName;
                _this.click();
                _this.revoke(objectUrl);
                _this.readyState = FileSaver.DONE;
            }, 0);
            return possibleConstructorReturn(_this);
        }

        if ((is_chrome_ios || force && is_safari) && window.FileReader) {
            // Safari doesn't allow downloading of blob urls
            var reader = new FileReader();
            reader.onloadend = function () {
                var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
                var popup = window.open(url, '_blank');
                if (!popup) {
                    window.location.href = url;
                }
                url = void 0; // release reference before dispatching
                _this.readyState = FileSaver.DONE;
            };
            reader.readAsDataURL(blob);
            _this.readyState = FileSaver.INIT;
            return possibleConstructorReturn(_this);
        }

        if (!objectUrl) {
            objectUrl = window.URL.createObjectURL(blob);
        }
        if (force) {
            window.location.href = objectUrl;
        } else {
            var opened = window.open(objectUrl, "_blank");
            if (!opened) {
                // Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
                window.location.href = objectUrl;
            }
        }
        _this.readyState = FileSaver.DONE;
        _this.revoke(objectUrl);
        return _this;
    }

    createClass(FileSaver, [{
        key: "click",
        value: function click() {
            var clickEvent = new MouseEvent("click");
            this.saveLink.dispatchEvent(clickEvent);
        }
    }, {
        key: "revoke",
        value: function revoke(file) {
            setTimeout(function () {
                if (typeof file === "string") {
                    window.URL.revokeObjectURL(file);
                } else {
                    file.remove();
                }
            }, 1000 * 40);
        }
    }], [{
        key: "saveAs",
        value: function saveAs(blob, fileName) {
            var blobOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : { type: "text/plain;charset=utf-8" };

            if (!(blob instanceof Blob)) {
                var value = blob;
                if (!Array.isArray(value)) {
                    value = [value];
                }
                blob = new Blob(value, blobOptions);
            }
            var fileSaver = new FileSaver(blob, fileName);

            return fileSaver;
        }
    }]);
    return FileSaver;
}(Dispatchable);

FileSaver.readyState = FileSaver.INIT = 0;
FileSaver.WRITING = 1;
FileSaver.DONE = 2;

if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
    FileSaver.saveAs = function (blob, name, no_auto_bom) {
        name = name || blob.name || "download";

        if (!no_auto_bom) {
            blob = autoBom(blob);
        }
        return navigator.msSaveOrOpenBlob(blob, name);
    };
}

// Plugins should be used to extends on runtime the functionality of a class, to easily split functionality
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
        value: function get$$1(index) {
            if (index < 0 || index >= this._length) {
                throw Error("Invalid index", index);
            }
            return this._values[this._offset + index];
        }
    }, {
        key: "toArray",
        value: function toArray$$1() {
            return this._values.slice(this._offset, this._offset + this._length);
        }
    }, {
        key: "toString",
        value: function toString() {
            return this.toArray().toString();
        }
    }, {
        key: "length",
        get: function get$$1() {
            return this._values.length;
        },
        set: function set$$1(value) {
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

exports.NavManager = NavManager;
exports.initializeNavbar = initializeNavbar;
exports.NavElement = NavElement;
exports.NavElementSection = NavElementSection;
exports.NavLinkElement = NavLinkElement;
exports.SocialNavbarItems = SocialNavbarItems;
exports.navSessionManager = navSessionManager;
exports.NavIcon = NavIcon;
exports.maxDistanceFromSide = maxDistanceFromSide;
exports.initializeSwipeRight = initializeSwipeRight;
exports.initializeSwipeLeft = initializeSwipeLeft;
exports.initializeSwipeEvents = initializeSwipeEvents;
exports.NavbarStyle = NavbarStyle;
exports.NavEffectsStyle = NavEffectsStyle;
exports.UIElement = UIElement;
exports.UI = UI;
exports.getOffset = getOffset;
exports.getComputedStyle = getComputedStyle;
exports.changeParent = changeParent;
exports.StyleInstance = StyleInstance;
exports.StyleElement = StyleElement;
exports.KeyframeElement = KeyframeElement;
exports.DynamicStyleElement = DynamicStyleElement;
exports.ConstructorInitMixin = ConstructorInitMixin;
exports.Link = Link;
exports.Panel = Panel;
exports.Image = Image;
exports.RawHTML = RawHTML;
exports.TimePassedSpan = TimePassedSpan;
exports.TemporaryMessageArea = TemporaryMessageArea;
exports.SlideBar = SlideBar;
exports.VerticalSlideBar = VerticalSlideBar;
exports.HorizontalSlideBar = HorizontalSlideBar;
exports.ScrollableMixin = ScrollableMixin;
exports.InfiniteScrollable = InfiniteScrollable;
exports.ViewportMeta = ViewportMeta;
exports.InputStyle = InputStyle;
exports.Form = Form;
exports.Input = Input;
exports.FormGroup = FormGroup;
exports.FormField = FormField;
exports.SubmitInput = SubmitInput;
exports.TextInput = TextInput;
exports.NumberInput = NumberInput;
exports.EmailInput = EmailInput;
exports.PasswordInput = PasswordInput;
exports.FileInput = FileInput;
exports.CheckboxInput = CheckboxInput;
exports.TextArea = TextArea;
exports.Select = Select;
exports.SVG = SVG;
exports.SVGNodeAttributes = SVGNodeAttributes;
exports.BootstrapMixin = BootstrapMixin;
exports.SimpleStyledElement = SimpleStyledElement;
exports.Label = Label;
exports.Button = Button;
exports.StateButton = StateButton;
exports.AjaxButton = AjaxButton;
exports.ButtonGroup = ButtonGroup;
exports.RadioButtonGroup = RadioButtonGroup;
exports.Badge = Badge;
exports.CardPanel = CardPanel;
exports.CollapsiblePanelStyle = CollapsiblePanelStyle;
exports.CollapsiblePanel = CollapsiblePanel;
exports.CollapsibleMixin = CollapsibleMixin;
exports.DelayedCollapsiblePanel = DelayedCollapsiblePanel;
exports.ProgressBar = ProgressBar;
exports.setLanguageStore = setLanguageStore;
exports.setTranslationMap = setTranslationMap;
exports.getTranslationMap = getTranslationMap;
exports.Switcher = Switcher;
exports.TabTitleArea = TabTitleArea;
exports.BasicTabTitle = BasicTabTitle;
exports.TabArea = TabArea;
exports.BaseTabAreaStyle = BaseTabAreaStyle;
exports.DefaultTabAreaStyle = DefaultTabAreaStyle;
exports.MinimalistTabAreaStyle = MinimalistTabAreaStyle;
exports.SectionDivider = SectionDivider$$1;
exports.Accordion = Accordion$$1;
exports.Carousel = Carousel$$1;
exports.Table = Table;
exports.TableRow = TableRow;
exports.TableStyle = TableStyle;
exports.SortableTableStyle = SortableTableStyle;
exports.CollapsibleTable = CollapsibleTable;
exports.CollapsibleTableInterface = CollapsibleTableInterface;
exports.CollapsibleTableRow = CollapsibleTableRow;
exports.TableRowInCollapsibleTable = TableRowInCollapsibleTable;
exports.collapsibleTableStyle = collapsibleTableStyle;
exports.SortableTable = SortableTable;
exports.SortableTableInterface = SortableTableInterface;
exports.FloatingWindowStyle = FloatingWindowStyle;
exports.FloatingWindow = FloatingWindow;
exports.VolatileFloatingWindow = VolatileFloatingWindow;
exports.ModalStyle = ModalStyle;
exports.Modal = Modal;
exports.ErrorModal = ErrorModal;
exports.ActionModal = ActionModal;
exports.ActionModalButton = ActionModalButton;
exports.DateTimePicker = DateTimePicker$$1;
exports.CodeEditor = CodeEditor;
exports.StaticCodeHighlighter = StaticCodeHighlighter;
exports.Theme = Theme;
exports.css = css;
exports.StyleSet = StyleSet;
exports.ExclusiveClassSet = ExclusiveClassSet;
exports.styleMap = styleMap;
exports.wrapCSS = wrapCSS;
exports.hover = hover;
exports.focus = focus;
exports.active = active;
exports.styleRule = styleRule;
exports.styleRuleInherit = styleRuleInherit;
exports.keyframesRule = keyframesRule;
exports.keyframesRuleInherit = keyframesRuleInherit;
exports.styleRuleWithOptions = styleRuleWithOptions;
exports.StyleSheet = StyleSheet;
exports.Transition = Transition;
exports.Modifier = Modifier;
exports.TransitionList = TransitionList;
exports.Color = Color;
exports.lighten = lighten;
exports.darken = darken;
exports.buildColors = buildColors;
exports.GlobalStyle = GlobalStyle;
exports.FAIcon = FAIcon;
exports.FACollapseIcon = FACollapseIcon;
exports.FASortIcon = FASortIcon;
exports.DoubleClickable = DoubleClickable;
exports.Draggable = Draggable;
exports.FullScreenable = FullScreenable;
exports.State = State;
exports.GlobalState = GlobalState$1;
exports.DefaultState = DefaultState;
exports.StoreSymbol = StoreSymbol;
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
exports.MarkupClassMap = MarkupClassMap;
exports.MarkupRenderer = MarkupRenderer;
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
exports.DispatchersSymbol = DispatchersSymbol;
exports.Dispatcher = Dispatcher;
exports.Dispatchable = Dispatchable;
exports.RunOnce = RunOnce;
exports.CleanupJobs = CleanupJobs;
exports.SingleActiveElementDispatcher = SingleActiveElementDispatcher;
exports.getAttachCleanupJobMethod = getAttachCleanupJobMethod;
exports.Ajax = Ajax;
exports.FileSaver = FileSaver;
exports.Plugin = Plugin;
exports.Pluginable = Pluginable;
exports.unwrapArray = unwrapArray;
exports.splitInChunks = splitInChunks;
exports.isIterable = isIterable;
exports.defaultComparator = defaultComparator;
exports.slugify = slugify;
exports.suffixNumber = suffixNumber;
exports.setObjectPrototype = setObjectPrototype;
exports.isNumber = isNumber;
exports.isString = isString;
exports.isPlainObject = isPlainObject;
exports.deepCopy = deepCopy;
exports.objectFromKeyValue = objectFromKeyValue;
exports.dashCase = dashCase;
exports.getCookie = getCookie;
exports.uniqueId = uniqueId;
exports.padNumber = padNumber;
exports.getOrdinalSuffix = getOrdinalSuffix;
exports.suffixWithOrdinal = suffixWithOrdinal;
exports.instantiateNative = instantiateNative;
exports.extendsNative = extendsNative;
exports.NOOP_FUNCTION = NOOP_FUNCTION;
exports.mapIterator = mapIterator;
exports.filterIterator = filterIterator;
exports.URLRouter = URLRouter;
exports.SessionStorageMap = SessionStorageMap;
exports.LocalStorageMap = LocalStorageMap;
exports.DAY_IN_MILLISECONDS = DAY_IN_MILLISECONDS;
exports.isDifferentDay = isDifferentDay;
exports.ServerTime = ServerTime;
exports.MAX_AUTO_UNIX_TIME = MAX_AUTO_UNIX_TIME;
exports.Date = Date$1;
exports.StemDate = StemDate;
exports.TimeUnit = TimeUnit;
exports.Duration = Duration;
exports.addCanonicalTimeUnit = addCanonicalTimeUnit;
exports.addCanonicalTimeUnits = addCanonicalTimeUnits;
exports.Deque = Deque;
exports.MultiMap = MultiMap;
exports.deprecate = deprecate;
exports.lazyCSS = lazyCSS;
exports.lazyInheritCSS = lazyInheritCSS;
exports.lazyInitialize = lazyInitialize;
exports.lazyInit = lazyInit;
exports.readOnly = readOnly;

Object.defineProperty(exports, '__esModule', { value: true });

})));
