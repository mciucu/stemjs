(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.stem = global.stem || {})));
}(this, (function (exports) { 'use strict';

// TODO: should this be renamed to "toUnwrappedArray"?
function unwrapArray(elements) {
    if (!elements) {
        return [];
    }

    if (!Array.isArray(elements)) {
        return [elements];
    }

    var allProperElements = true;
    for (var i = 0; i < elements.length; i++) {
        if (Array.isArray(elements[i]) || !elements[i]) {
            allProperElements = false;
            break;
        }
    }

    if (allProperElements) {
        // return the exact same array as was passed in
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

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





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

var get$1 = function get$1(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get$1(parent, property, receiver);
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



var set$1 = function set$1(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set$1(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
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
                _this2.timeout = null;
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
        inherits(Cleanup, _BaseClass);

        function Cleanup() {
            classCallCheck(this, Cleanup);
            return possibleConstructorReturn(this, (Cleanup.__proto__ || Object.getPrototypeOf(Cleanup)).apply(this, arguments));
        }

        createClass(Cleanup, [{
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

// Generic class through which we interact with HTML nodes

var NodeWrapper = function (_Dispatchable) {
    inherits(NodeWrapper, _Dispatchable);

    function NodeWrapper(domNode, options) {
        classCallCheck(this, NodeWrapper);

        var _this = possibleConstructorReturn(this, (NodeWrapper.__proto__ || Object.getPrototypeOf(NodeWrapper)).call(this));

        _this.node = domNode;
        _this.options = options || {};
        return _this;
    }

    createClass(NodeWrapper, [{
        key: "insertChildNodeBefore",
        value: function insertChildNodeBefore(childElement, nextSiblingNode) {
            this.node.insertBefore(childElement.node, nextSiblingNode);
        }

        // TODO: should this be merged with the cleanup method?

    }, {
        key: "clearNode",
        value: function clearNode() {
            while (this.node && this.node.lastChild) {
                this.node.removeChild(this.node.lastChild);
            }
        }

        // TODO: element method should be removed, there's no need to jquery dependencies

    }, {
        key: "uniqueId",
        value: function uniqueId() {
            if (!this.hasOwnProperty("uniqueIdStr")) {
                // TODO: should this be global?
                if (!this.constructor.hasOwnProperty("objectCount")) {
                    this.constructor.objectCount = 0;
                }
                this.constructor.objectCount += 1;
                this.uniqueIdStr = this.constructor.objectCount + "-" + Math.random().toString(36).substr(2);
            }
            return this.uniqueIdStr;
        }
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
            return window.getComputedStyle(this.node, null).getPropertyValue(attribute);
        }
    }, {
        key: "isInDOM",
        value: function isInDOM() {
            return document.body.contains(this.node);
        }
    }, {
        key: "getWidthOrHeight",
        value: function getWidthOrHeight(parameter) {
            var node = this.node;
            if (!node) {
                return 0;
            }
            var value = parseFloat(parameter === "width" ? node.offsetWidth : node.offsetHeight);
            // If for unknown reasons this happens, maybe this will work
            if (value == null) {
                value = parseFloat(this.getStyle(parameter));
            }
            if (isNaN(value)) {
                value = 0;
            }
            if (this.getStyle("box-sizing") === "border-box") {
                var attributes = ["padding-", "border-"];
                var directions = {
                    width: ["left", "right"],
                    height: ["top", "bottom"]
                };
                for (var i = 0; i < 2; i += 1) {
                    for (var j = 0; j < 2; j += 1) {
                        value -= parseFloat(this.getStyle(attributes[i] + directions[parameter][j]));
                    }
                }
            }
            return value;
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
        key: "addDOMListener",
        value: function addDOMListener(name, callback) {
            this.node.addEventListener(name, callback);
        }
    }, {
        key: "removeDOMListener",
        value: function removeDOMListener(name, callback) {
            this.node.removeEventListener(name, callback);
        }
    }, {
        key: "addClickListener",
        value: function addClickListener(callback) {
            this.addDOMListener("click", callback);
        }
    }, {
        key: "setClickListener",
        value: function setClickListener(callback) {
            // TODO: remove old click listener
            this.addClickListener(callback);
        }
    }, {
        key: "removeClickListener",
        value: function removeClickListener(callback) {
            this.removeDOMListener("click", callback);
        }
    }, {
        key: "addDoubleClickListener",
        value: function addDoubleClickListener(callback) {
            this.addDOMListener("dblclick", callback);
        }
    }, {
        key: "removeDoubleClickListener",
        value: function removeDoubleClickListener(callback) {
            this.removeDOMListener("dblclick", callback);
        }

        // TODO: we need a consistent nomenclature, should be called addChangeListener

    }, {
        key: "onChange",
        value: function onChange(callback) {
            this.addDOMListener("change", callback);
        }

        // TODO: this should be done with decorators

    }, {
        key: "ensureFieldExists",
        value: function ensureFieldExists(name, value) {
            if (!this.hasOwnProperty(name)) {
                this[name] = value(this);
            }
            return this[name];
        }
    }, {
        key: "element",
        get: function get() {
            if (!this._element) {
                this._element = $(this.node);
            }
            return this._element;
        }
    }]);
    return NodeWrapper;
}(Dispatchable);

// TODO: this file needs to be revisited
function CreateAllowedAttributesMap(oldAttributesMap, allowedAttributesArray) {
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
            if (attribute.length < 2) {
                attribute.push({});
            }
            allowedAttributesMap.set(attribute[0], attribute[1]);
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

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = allowedAttributesMap[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _step2$value = slicedToArray(_step2.value, 2),
                key = _step2$value[0],
                value = _step2$value[1];

            if (!value) {
                value = {};
            }

            if (!value.domName) {
                value.domName = key;
            }

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

//TODO: should be as few of these as possible
var ATTRIBUTE_NAMES_MAP = CreateAllowedAttributesMap([["id"], ["action"], ["colspan"], ["default"], ["disabled", { noValue: true }], ["fixed"], ["forAttr", { domName: "for" }], ["hidden"], ["href"], ["rel"], ["minHeight"], ["minWidth"], ["role"], ["target"], ["HTMLtitle", { domName: "title" }], ["type"], ["placeholder"], ["src"], ["height"], ["width"]]);

var DOMAttributes = function () {
    function DOMAttributes(options) {
        var attributeNamesMap = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ATTRIBUTE_NAMES_MAP;
        classCallCheck(this, DOMAttributes);

        this.attributes = new Map();
        //this.className = null;
        this.classes = new Set();
        this.styleMap = null;
        //TODO: the set of allowed name should be static in the constructor

        for (var attributeName in options) {
            // No hasOwnProperty for perfomance
            if (attributeName.startsWith("data-") || attributeName.startsWith("aria-")) {
                this.attributes.set(attributeName, options[attributeName]);
            }

            if (attributeNamesMap.has(attributeName)) {

                var attribute = attributeNamesMap.get(attributeName);
                var value = options[attributeName];

                if (attribute.noValue) {
                    if (value) {
                        value = "";
                    } else {
                        value = undefined;
                    }
                }

                this.attributes.set(attribute.domName, value);
            }
        }

        if (options.hasOwnProperty("classes")) {
            // User filter here to prevent empty classes
            this.classes = new Set(options.classes.filter(function (cls) {
                return cls;
            }));
        } else if (options.hasOwnProperty("className")) {
            // regex matches any whitespace character or comma
            this.classes = new Set((options.className + "").split(/[\s,]+/).filter(function (cls) {
                return cls;
            }));
        }

        if (options.hasOwnProperty("style")) {
            this.styleMap = new Map();
            for (var key in options.style) {
                this.styleMap.set(key, options.style[key]);
            }
        }
    }

    createClass(DOMAttributes, [{
        key: "setAttribute",
        value: function setAttribute(key, value, node) {
            if (value === undefined) {
                return;
            }
            this.attributes.set(key, value);
            if (node) {
                // TODO: check here if different
                node.setAttribute(key, value);
            }
        }
    }, {
        key: "setStyle",
        value: function setStyle(key, value, node) {
            if (value === undefined) {
                return;
            }
            if (!this.styleMap) {
                this.styleMap = new Map();
            }
            this.styleMap.set(key, value);
            if (node && node.style[key] !== value) {
                node.style[key] = value;
            }
        }
    }, {
        key: "addClass",
        value: function addClass(classes, node) {
            if (!classes) return;

            if (Array.isArray(classes)) {
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = classes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var cls = _step3.value;

                        this.classes.add(cls);
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
            } else {
                this.addClass(classes.split(/[\s,]+/), node);
            }
        }
    }, {
        key: "removeClass",
        value: function removeClass(classes, node) {
            if (!classes) return;

            if (Array.isArray(classes)) {
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = classes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var cls = _step4.value;

                        this.classes.delete(cls);
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
            } else {
                this.removeClass(classes.split(/[\s,]+/), node);
            }
        }
    }, {
        key: "apply",
        value: function apply(node) {
            //TODO: attributes and styles should be synched (remove missing ones)
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = this.attributes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var _step5$value = slicedToArray(_step5.value, 2),
                        key = _step5$value[0],
                        value = _step5$value[1];

                    if (typeof value !== "undefined") {
                        node.setAttribute(key, value);
                    } else {
                        node.removeAttribute(key);
                    }
                }

                // node.removeAttribute("class");
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

            if (this.classes && this.classes.size > 0) {
                node.className = Array.from(this.classes).join(" ");
                // TODO: find out which solution is best
                // This solution works for svg nodes as well
                //for (let cls of this.classes) {
                //    node.classList.add(cls);
                //}
                // if (this.classes && this.classes.size > 0) {
                //     node.className = "";
                //     for (let cls of this.classes) {
                //         node.classList.add(cls);
                //     }
            } else {
                node.removeAttribute("class");
            }

            node.removeAttribute("style");
            if (this.styleMap) {
                var _iteratorNormalCompletion6 = true;
                var _didIteratorError6 = false;
                var _iteratorError6 = undefined;

                try {
                    for (var _iterator6 = this.styleMap[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                        var _step6$value = slicedToArray(_step6.value, 2),
                            key = _step6$value[0],
                            value = _step6$value[1];

                        if (node.style[key] !== value) {
                            node.style[key] = value;
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
        }
    }]);
    return DOMAttributes;
}();

var UI = {
    renderingStack: [] };

UI.TextElement = function () {
    function UITextElement(options) {
        classCallCheck(this, UITextElement);

        var value = "";
        if (typeof options === "string" || options instanceof String || typeof options === "number" || options instanceof Number) {
            value = String(options);
            options = null;
        } else {
            value = options.value || value;
        }
        this.setValue(value);
        if (options) {
            this.options = options;
        }
    }

    createClass(UITextElement, [{
        key: "mount",
        value: function mount(parent, nextSibling) {
            this.parent = parent;
            if (!this.node) {
                this.createNode();
            }
            this.redraw();
            parent.node.insertBefore(this.node, nextSibling);
        }
    }, {
        key: "canOverwrite",
        value: function canOverwrite(existingChild) {
            return existingChild.constructor === this.constructor;
        }
    }, {
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
            return Node.TEXT_NODE;
        }
    }, {
        key: "cleanup",
        value: function cleanup() {}
    }, {
        key: "copyState",
        value: function copyState(element) {
            this.setValue(element.getValue());
        }
    }, {
        key: "createNode",
        value: function createNode() {
            this.node = document.createTextNode(this.value);
            return this.node;
        }
    }, {
        key: "setValue",
        value: function setValue(value) {
            this.value = String(value);
            if (this.node) {
                this.redraw();
            }
        }
    }, {
        key: "getValue",
        value: function getValue() {
            return this.value;
        }
    }, {
        key: "redraw",
        value: function redraw() {
            if (this.node) {
                var newValue = this.getValue();
                if (this.node.nodeValue !== newValue) {
                    this.node.nodeValue = newValue;
                }
            }
            //TODO: make common with UI.Element
            if (this.options && this.options.ref) {
                var obj = this.options.ref.parent;
                var name = this.options.ref.name;
                obj[name] = this;
            }
        }
    }]);
    return UITextElement;
}();

//Some changes to the basic API for UI.Element need to be mirrored in UI.TextElement

var UIElement = function (_NodeWrapper) {
    inherits(UIElement, _NodeWrapper);

    function UIElement(options) {
        classCallCheck(this, UIElement);

        options = options || {};

        var _this = possibleConstructorReturn(this, (UIElement.__proto__ || Object.getPrototypeOf(UIElement)).call(this, null, options, true));

        _this.children = [];
        _this.setOptions(options);
        return _this;
    }

    createClass(UIElement, [{
        key: "setOptions",
        value: function setOptions(options) {
            this.options = options || {};
            this.options.children = this.options.children || [];

            if (options.hasOwnProperty("class")) {
                console.error("Invalid UIElement attribute: class. Did you mean className?");
            }
        }
    }, {
        key: "updateOptions",
        value: function updateOptions(options) {
            var updatedOptions = Object.assign(this.options, options);
            this.setOptions(updatedOptions);
        }
    }, {
        key: "copyState",
        value: function copyState(element) {
            this.setOptions(element.options);
        }

        //TODO: should be renamed to getDocumentTag or getTag, or getHTMLTag ?

    }, {
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
            return this.options.primitiveTag || "div";
        }
    }, {
        key: "getGivenChildren",
        value: function getGivenChildren() {
            return this.options.children || [];
        }
    }, {
        key: "getTitle",
        value: function getTitle() {
            return this.options.title || "";
        }
    }, {
        key: "renderHTML",
        value: function renderHTML() {
            return this.options.children;
        }
    }, {
        key: "createNode",
        value: function createNode() {
            this.node = document.createElement(this.getPrimitiveTag());
            return this.node;
        }

        //Add anything that needs to be called on cleanup here (dispatchers, etc)

    }, {
        key: "addCleanupTask",
        value: function addCleanupTask(task) {
            // TODO: this field should be an instance of CleanupJobs
            if (!this.cleanupTasks) {
                this.cleanupTasks = [];
            }
            this.cleanupTasks.push(task);
        }
    }, {
        key: "destroyNode",
        value: function destroyNode() {
            this.cleanup();
            this.node.remove();
            this.node = undefined;
        }
    }, {
        key: "runCleanupTasks",
        value: function runCleanupTasks() {
            if (this.cleanupTasks) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.cleanupTasks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var task = _step.value;

                        task.cleanup();
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

        // Abstract, gets called when removing DOM node associated with the

    }, {
        key: "cleanup",
        value: function cleanup() {
            this.runCleanupTasks();
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var child = _step2.value;

                    child.cleanup();
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

            this.clearNode();
            get$1(UIElement.prototype.__proto__ || Object.getPrototypeOf(UIElement.prototype), "cleanup", this).call(this);
        }
    }, {
        key: "applyRef",
        value: function applyRef() {
            // TODO: remove old field names
            if (this.options.ref) {
                var obj = this.options.ref.parent;
                var name = this.options.ref.name;
                obj[name] = this;
            }
        }
    }, {
        key: "canOverwrite",
        value: function canOverwrite(existingChild) {
            return this.constructor === existingChild.constructor && this.getPrimitiveTag() === existingChild.getPrimitiveTag();
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
                console.warn("Element not yet mounted. Redraw aborted!", this);
                return false;
            }

            UI.renderingStack.push(this);
            var newChildren = unwrapArray(this.renderHTML());
            UI.renderingStack.pop();

            if (newChildren === this.children) {
                for (var i = 0; i < newChildren.length; i += 1) {
                    newChildren[i].redraw();
                }
                //TODO: also handle ref stuff here
                this.applyDOMAttributes();
                return;
            }

            var domNode = this.node;
            var childrenKeyMap = this.getElementKeyMap(this.children);

            for (var _i = 0; _i < newChildren.length; _i++) {
                var newChild = newChildren[_i];
                var prevChildNode = _i > 0 ? newChildren[_i - 1].node : null;
                var currentChildNode = prevChildNode ? prevChildNode.nextSibling : domNode.firstChild;

                // Not an UIElement, to be converted to a TextElement
                if (!newChild.getPrimitiveTag) {
                    newChild = newChildren[_i] = new UI.TextElement(newChild);
                }

                // this means we are an UIElement
                var newChildKey = newChild.options && newChild.options.key || "autokey" + _i;
                var existingChild = childrenKeyMap.get(newChildKey);

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

            var newChildrenNodes = new Set();
            for (var _i2 = 0; _i2 < newChildren.length; _i2 += 1) {
                newChildrenNodes.add(newChildren[_i2].node);
            }

            for (var _i3 = 0; _i3 < this.children.length; _i3 += 1) {
                if (!newChildrenNodes.has(this.children[_i3].node)) {
                    //TODO: should call this.children[i].destroyNode()
                    this.children[_i3].cleanup();
                    domNode.removeChild(this.children[_i3].node);
                }
            }

            this.children = newChildren;

            this.applyDOMAttributes();

            this.applyRef();

            return true;
        }
    }, {
        key: "applyDOMAttributes",
        value: function applyDOMAttributes() {
            this.domAttributes = this.getDOMAttributes();
            this.domAttributes.apply(this.node);
        }
    }, {
        key: "setAttribute",
        value: function setAttribute(key, value) {
            // TODO: what to do about preserving this on the next redraw
            this.domAttributes.setAttribute(key, value, this.node);
        }
    }, {
        key: "setStyle",
        value: function setStyle(attributeName, value) {
            this.options.style = this.options.style || {};
            this.options.style[attributeName] = value;

            this.domAttributes.setStyle(attributeName, value, this.node);
        }
    }, {
        key: "addClass",
        value: function addClass(className) {
            this.domAttributes.addClass(String(className), this.node);
        }
    }, {
        key: "removeClass",
        value: function removeClass(className) {
            this.domAttributes.removeClass(String(className), this.node);
        }
    }, {
        key: "hasClass",
        value: function hasClass(className) {
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
        key: "getDOMAttributes",
        value: function getDOMAttributes() {
            if (this.constructor.extraDOMAttributes) {
                var domAttributes = get$1(UIElement.prototype.__proto__ || Object.getPrototypeOf(UIElement.prototype), "getDOMAttributes", this).call(this);
                this.extraDOMAttributes(domAttributes);
                return domAttributes;
            } else {
                return new DOMAttributes(this.options, this.constructor.domAttributesMap);
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

            while (index >= this[arrayName].length) {
                this[arrayName].push(null);
            }

            return { parent: this[arrayName], name: index };
        }
    }, {
        key: "mount",
        value: function mount(parent, nextSiblingNode) {
            var _this2 = this;

            if (!parent.node) {
                parent = new NodeWrapper(parent);
            }
            this.parent = parent;
            if (!this.node) {
                this.createNode();
            }
            this.redraw();

            parent.insertChildNodeBefore(this, nextSiblingNode);

            // TODO: this should be cleaned up
            if (this.options.onClick) {
                this.onClickHandler = function (event) {
                    UI.event = event;
                    if (_this2.options.onClick) {
                        _this2.options.onClick(_this2);
                    }
                };
                this.addClickListener(this.onClickHandler);
                //TODO: THIS NEEDS TO BE REMOVED
            }
            this.onMount();
        }
    }, {
        key: "onMount",
        value: function onMount() {}

        // You need to overwrite this if this.options.children !== this.children

    }, {
        key: "appendChild",
        value: function appendChild(child) {
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
    }], [{
        key: "create",
        value: function create(parentNode, options) {
            var uiElement = new this(options);
            uiElement.mount(parentNode, null);
            return uiElement;
        }
    }]);
    return UIElement;
}(NodeWrapper);

UIElement.domAttributesMap = ATTRIBUTE_NAMES_MAP;

UI.createElement = function (tag, options) {
    if (!tag) {
        console.error("Create element needs a valid object tag, did you mistype a class name?");
        return;
    }

    options = options || {};

    if (!options.children || arguments.length > 2) {
        options.children = [];

        for (var i = 2; i < arguments.length; i += 1) {
            options.children.push(arguments[i]);
        }
    }
    options.children = [];

    for (var _i4 = 2; _i4 < arguments.length; _i4 += 1) {
        options.children.push(arguments[_i4]);
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
            console.error("Warning! UI Element cannot have both a key and a ref fieldname. Key will be overriden.\n" + "Are you using the options from another object?", options);
        }

        options.key = "_ref" + options.ref.name;
    }

    if (typeof tag === "string") {
        options.primitiveTag = tag;
        tag = UIElement;
    }

    return new tag(options);
};

UI.Element = UIElement;

UI.str = function (value) {
    return new UI.TextElement({ value: value });
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
                    // TODO: if key is camelCase, it should be changed to dash-case here
                    // TODO: on some attributes, do we want to automatically add a px suffix?
                    str += key + ":" + value + ";";
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
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
            return "style";
        }
    }, {
        key: "getDOMAttributes",
        value: function getDOMAttributes() {
            // TODO: allow custom style attributes (media, scoped, etc)
            var attr = new DOMAttributes({});
            attr.setAttribute("name", this.options.name);
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
        key: "renderHTML",
        value: function renderHTML() {
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

// Class meant to group multiple classes inside a single <style> element, for convenience

var StyleSet = function (_Dispatchable) {
    inherits(StyleSet, _Dispatchable);

    function StyleSet() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        classCallCheck(this, StyleSet);

        var _this4 = possibleConstructorReturn(this, (StyleSet.__proto__ || Object.getPrototypeOf(StyleSet)).call(this));

        _this4.options = options;
        _this4.elements = new Set();
        if (_this4.options.updateOnResize) {
            window.addEventListener("resize", function () {
                _this4.update();
            });
        }
        var styleElementOptions = {
            children: [],
            name: _this4.options.name
        };
        _this4.styleElement = UI.StyleElement.create(document.head, styleElementOptions);
        return _this4;
    }

    createClass(StyleSet, [{
        key: "css",
        value: function css(style) {
            if (arguments.length > 1) {
                style = Object.assign.apply(Object, [{}].concat(Array.prototype.slice.call(arguments)));
            }
            var element = new UI.DynamicStyleElement({ style: style });
            this.elements.add(element);
            var styleInstances = element.renderHTML();
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = styleInstances[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var styleInstance = _step2.value;

                    this.styleElement.appendChild(styleInstance);
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

            return element;
        }
    }, {
        key: "keyframe",
        value: function keyframe(styles) {
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
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this.elements[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var value = _step3.value;

                    if (value instanceof UI.StyleElement) {
                        var styleElements = value.renderHTML();
                        children.push.apply(children, toConsumableArray(styleElements));
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

            this.styleElement.options.children = children;
            this.styleElement.redraw();
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
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this.classList[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var cls = _step4.value;

                    if (cls === classInstance) {
                        element.addClass(cls);
                    } else {
                        element.removeClass(cls);
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

UI.DoubleClickable = function (BaseClass) {
    return function (_BaseClass) {
        inherits(DoubleClickable, _BaseClass);

        function DoubleClickable() {
            classCallCheck(this, DoubleClickable);
            return possibleConstructorReturn(this, (DoubleClickable.__proto__ || Object.getPrototypeOf(DoubleClickable)).apply(this, arguments));
        }

        createClass(DoubleClickable, [{
            key: "addClickListener",
            value: function addClickListener(callback) {
                var _this2 = this;

                this.ensureFieldExists("_singleClickCallbacks", function (x) {
                    return new Map();
                });

                if (this._singleClickCallbacks.has(callback)) {
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
                this._singleClickCallbacks.set(callback, callbackWrapper);
                get$1(DoubleClickable.prototype.__proto__ || Object.getPrototypeOf(DoubleClickable.prototype), "addClickListener", this).call(this, callbackWrapper);
            }
        }, {
            key: "getSingleClickTimeout",
            value: function getSingleClickTimeout() {
                return 250;
            }
        }, {
            key: "removeClickListener",
            value: function removeClickListener(callback) {
                if (!this._singleClickCallbacks) {
                    return;
                }
                var callbackWrapper = this._singleClickCallbacks.get(callback);
                if (callbackWrapper) {
                    this._singleClickCallbacks.delete(callback);
                    get$1(DoubleClickable.prototype.__proto__ || Object.getPrototypeOf(DoubleClickable.prototype), "removeClickListener", this).call(this, callbackWrapper);
                }
            }
        }, {
            key: "addDoubleClickListener",
            value: function addDoubleClickListener(callback) {
                var _this3 = this;

                this.ensureFieldExists("_doubleClickCallbacks", function (x) {
                    return new Map();
                });

                if (this._doubleClickCallbacks.has(callback)) {
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
                this._doubleClickCallbacks.set(callback, callbackWrapper);
                get$1(DoubleClickable.prototype.__proto__ || Object.getPrototypeOf(DoubleClickable.prototype), "addClickListener", this).call(this, callbackWrapper);
            }
        }, {
            key: "removeDoubleClickListener",
            value: function removeDoubleClickListener(callback) {
                if (!this._doubleClickCallbacks) {
                    return;
                }
                var callbackWrapper = this._doubleClickCallbacks.get(callback);
                if (callbackWrapper) {
                    this._doubleClickCallbacks.delete(callback);
                    get$1(DoubleClickable.prototype.__proto__ || Object.getPrototypeOf(DoubleClickable.prototype), "removeClickListener", this).call(this, callbackWrapper);
                }
            }
        }]);
        return DoubleClickable;
    }(BaseClass);
};

// TODO: simplify this if possible
// TODO: rename to DraggableMixin?
UI.Draggable = function (BaseClass) {
    var Draggable = function (_BaseClass) {
        inherits(Draggable, _BaseClass);

        function Draggable() {
            classCallCheck(this, Draggable);
            return possibleConstructorReturn(this, (Draggable.__proto__ || Object.getPrototypeOf(Draggable)).apply(this, arguments));
        }

        createClass(Draggable, [{
            key: "addClickListener",
            value: function addClickListener(callback) {
                var _this2 = this;

                this.ensureFieldExists("_clickCallbacks", function (x) {
                    return new Map();
                });

                if (this._clickCallbacks.has(callback)) {
                    return;
                }
                var callbackWrapper = function callbackWrapper() {
                    if (_this2._okForClick) {
                        callback();
                    }
                };
                this._clickCallbacks.set(callback, callbackWrapper);
                get$1(Draggable.prototype.__proto__ || Object.getPrototypeOf(Draggable.prototype), "addClickListener", this).call(this, callbackWrapper);

                if (!this.hasOwnProperty("_clickDragListeners")) {
                    this._clickDragListeners = new Map();
                }
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
                if (!this._clickCallbacks) {
                    return;
                }
                var callbackWrapper = this._clickCallbacks.get(callback);
                if (callbackWrapper) {
                    this._clickCallbacks.delete(callback);
                    get$1(Draggable.prototype.__proto__ || Object.getPrototypeOf(Draggable.prototype), "removeClickListener", this).call(this, callbackWrapper);
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
                this.addDOMListener("touchstart", touchListenerWrapper.onWrapperStart);
                this.addDOMListener("mousedown", listenerWrapper.onWrapperStart);
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

                            this.removeDOMListener("touchstart", this._dragListeners[i].onWrapperStart);
                            document.body.removeEventListener("touchmove", this._dragListeners[i].onWrapperDrag);
                            document.body.removeEventListener("touchmove", this._dragListeners[i].onWrapperEnd);
                            this.removeDOMListener("mousedown", this._dragListeners[i].onWrapperStart);
                            document.body.removeEventListener("mousemove", this._dragListeners[i].onWrapperDrag);
                            document.body.removeEventListener("mousemove", this._dragListeners[i].onWrapperEnd);

                            this._dragListeners.splice(i, 1);
                        }
                    }
                }
            }
        }]);
        return Draggable;
    }(BaseClass);

    return Draggable;
};

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
UI.FullScreenable = function (BaseClass) {
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
    LARGE: "lg"
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

UI.SlideBar = function (_UI$Draggable) {
    inherits(SlideBar, _UI$Draggable);

    function SlideBar(options) {
        classCallCheck(this, SlideBar);
        return possibleConstructorReturn(this, (SlideBar.__proto__ || Object.getPrototypeOf(SlideBar)).call(this, options));
    }

    createClass(SlideBar, [{
        key: "getDOMAttributes",
        value: function getDOMAttributes() {
            var attributes = get$1(SlideBar.prototype.__proto__ || Object.getPrototypeOf(SlideBar.prototype), "getDOMAttributes", this).call(this);
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
        key: "renderHTML",
        value: function renderHTML() {
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
}(UI.Draggable(UI.Element));

UI.Link = function (_UI$Element2) {
    inherits(Link, _UI$Element2);

    function Link() {
        classCallCheck(this, Link);
        return possibleConstructorReturn(this, (Link.__proto__ || Object.getPrototypeOf(Link)).apply(this, arguments));
    }

    createClass(Link, [{
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
            return "a";
        }
    }, {
        key: "getDOMAttributes",
        value: function getDOMAttributes() {
            var attr = get$1(Link.prototype.__proto__ || Object.getPrototypeOf(Link.prototype), "getDOMAttributes", this).call(this);
            attr.setStyle("cursor", "pointer");
            return attr;
        }
    }, {
        key: "setOptions",
        value: function setOptions(options) {
            options = Object.assign({
                newTab: true
            }, options);

            get$1(Link.prototype.__proto__ || Object.getPrototypeOf(Link.prototype), "setOptions", this).call(this, options);

            if (this.options.newTab) {
                this.options.target = "_blank";
            }

            return options;
        }
    }, {
        key: "renderHTML",
        value: function renderHTML() {
            return [this.options.value];
        }
    }]);
    return Link;
}(UI.Element);

UI.Image = function (_UI$Element3) {
    inherits(Image, _UI$Element3);

    function Image() {
        classCallCheck(this, Image);
        return possibleConstructorReturn(this, (Image.__proto__ || Object.getPrototypeOf(Image)).apply(this, arguments));
    }

    createClass(Image, [{
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
            return "img";
        }
    }]);
    return Image;
}(UI.Element);

// Beware coder: If you ever use this class, you need to document why!
UI.RawHTML = function (_UI$Element4) {
    inherits(RawHTML, _UI$Element4);

    function RawHTML() {
        classCallCheck(this, RawHTML);
        return possibleConstructorReturn(this, (RawHTML.__proto__ || Object.getPrototypeOf(RawHTML)).apply(this, arguments));
    }

    createClass(RawHTML, [{
        key: "redraw",
        value: function redraw() {
            this.node.innerHTML = this.options.__innerHTML;
            this.applyDOMAttributes();
        }
    }]);
    return RawHTML;
}(UI.Element);

UI.TemporaryMessageArea = function (_UI$Element5) {
    inherits(TemporaryMessageArea, _UI$Element5);

    function TemporaryMessageArea() {
        classCallCheck(this, TemporaryMessageArea);
        return possibleConstructorReturn(this, (TemporaryMessageArea.__proto__ || Object.getPrototypeOf(TemporaryMessageArea)).apply(this, arguments));
    }

    createClass(TemporaryMessageArea, [{
        key: "setOptions",
        value: function setOptions(options) {
            options = Object.assign(this.constructor.getDefaultOptions(), options);
            get$1(TemporaryMessageArea.prototype.__proto__ || Object.getPrototypeOf(TemporaryMessageArea.prototype), "setOptions", this).call(this, options);
        }
    }, {
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
            return "span";
        }
    }, {
        key: "renderHTML",
        value: function renderHTML() {
            return [UI.createElement(UI.TextElement, { ref: "textElement", value: this.options.value || "" })];
        }
    }, {
        key: "getDOMAttributes",
        value: function getDOMAttributes() {
            var attr = get$1(TemporaryMessageArea.prototype.__proto__ || Object.getPrototypeOf(TemporaryMessageArea.prototype), "getDOMAttributes", this).call(this);
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
            this.applyDOMAttributes();
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
    }], [{
        key: "getDefaultOptions",
        value: function getDefaultOptions() {
            return {
                margin: 10
            };
        }
    }]);
    return TemporaryMessageArea;
}(UI.Element);

// Just putting in a lot of methods, to try to think of an interface
UI.ScrollableMixin = function (_UI$Element6) {
    inherits(ScrollableMixin, _UI$Element6);

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
            get$1(InfiniteScrollable.prototype.__proto__ || Object.getPrototypeOf(InfiniteScrollable.prototype), "setOptions", this).call(this, options);
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

UI.TimePassedSpan = function (_UI$Element7) {
    inherits(TimePassedSpan, _UI$Element7);

    function TimePassedSpan() {
        classCallCheck(this, TimePassedSpan);
        return possibleConstructorReturn(this, (TimePassedSpan.__proto__ || Object.getPrototypeOf(TimePassedSpan)).apply(this, arguments));
    }

    createClass(TimePassedSpan, [{
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
            return "span";
        }
    }, {
        key: "renderHTML",
        value: function renderHTML() {
            return this.getTimeDeltaDisplay(this.options.timeStamp);
        }
    }, {
        key: "getDOMAttributes",
        value: function getDOMAttributes() {
            var attr = get$1(TimePassedSpan.prototype.__proto__ || Object.getPrototypeOf(TimePassedSpan.prototype), "getDOMAttributes", this).call(this);
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
                return get$1(ConstructorInitMixin.prototype.__proto__ || Object.getPrototypeOf(ConstructorInitMixin.prototype), "createNode", this).call(this);
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

UI.body = new UI.Element();
UI.body.node = document.body;

UI.Form = function (_UI$Element) {
    inherits(Form, _UI$Element);

    function Form() {
        classCallCheck(this, Form);
        return possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
    }

    createClass(Form, [{
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
            return "form";
        }
    }, {
        key: "getDOMAttributes",
        value: function getDOMAttributes() {
            var attr = get$1(Form.prototype.__proto__ || Object.getPrototypeOf(Form.prototype), "getDOMAttributes", this).call(this);
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
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
            return "input";
        }
    }, {
        key: "getDOMAttributes",
        value: function getDOMAttributes() {
            var attr = get$1(Input.prototype.__proto__ || Object.getPrototypeOf(Input.prototype), "getDOMAttributes", this).call(this);

            var type = this.getInputType();
            if (type) {
                attr.setAttribute("type", type);
            }

            return attr;
        }
    }, {
        key: "redraw",
        value: function redraw() {
            get$1(Input.prototype.__proto__ || Object.getPrototypeOf(Input.prototype), "redraw", this).call(this);
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
            this.addDOMListener("input change", callback);
        }
    }, {
        key: "onKeyUp",
        value: function onKeyUp(callback) {
            this.addDOMListener("keyup", callback);
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
        key: "getDOMAttributes",
        value: function getDOMAttributes() {
            var attr = get$1(FormControl.prototype.__proto__ || Object.getPrototypeOf(FormControl.prototype), "getDOMAttributes", this).call(this);
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
            get$1(FormSettingsGroup.prototype.__proto__ || Object.getPrototypeOf(FormSettingsGroup.prototype), "setOptions", this).call(this, options);

            this.options.labelWidth = this.options.labelWidth || "41%";
            this.options.contentWidth = this.options.contentWidth || "59%";
        }
    }, {
        key: "getDOMAttributes",
        value: function getDOMAttributes() {
            var attr = get$1(FormSettingsGroup.prototype.__proto__ || Object.getPrototypeOf(FormSettingsGroup.prototype), "getDOMAttributes", this).call(this);
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
        key: "renderHTML",
        value: function renderHTML() {
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
            get$1(FormGroup.prototype.__proto__ || Object.getPrototypeOf(FormGroup.prototype), "setOptions", this).call(this, options);
            this.options.labelWidth = this.options.labelWidth || "16%";
            this.options.contentWidth = this.options.contentWidth || "32%";
            this.options.errorFieldWidth = this.options.errorFieldWidth || "48%";
        }
    }, {
        key: "getDOMAttributes",
        value: function getDOMAttributes() {
            var attr = get$1(FormGroup.prototype.__proto__ || Object.getPrototypeOf(FormGroup.prototype), "getDOMAttributes", this).call(this);
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
        key: "renderHTML",
        value: function renderHTML() {
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

UI.Input.domAttributesMap = CreateAllowedAttributesMap(UI.Element.domAttributesMap, [["autocomplete"], ["autofocus", { noValue: true }], ["formaction"], ["maxLength", { domName: "maxlength" }], ["minLength", { domName: "minlength" }], ["name"], ["placeholder"], ["readonly"], ["required"], ["value"]]);

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

UI.SubmitInput.domAttributesMap = CreateAllowedAttributesMap(UI.Element.domAttributesMap, [["formenctype"], ["formmethod"], ["formnovalidate"], ["formtarget"]]);

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
                var val = get$1(NumberInput.prototype.__proto__ || Object.getPrototypeOf(NumberInput.prototype), "getValue", this).call(this);
                return parseInt(val) || parseFloat(val);
            }
        }]);
        return NumberInput;
    }(BaseInputClass);

    numberInput.domAttributesMap = CreateAllowedAttributesMap(UI.Element.domAttributesMap, [["min"], ["max"], ["step"]]);
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

    fileInput.domAttributesMap = CreateAllowedAttributesMap(UI.Element.domAttributesMap, [["multipleFiles", { domName: "multiple", noValue: true }], ["fileTypes", { domName: "accept" }]]);
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
            get$1(CheckboxInput.prototype.__proto__ || Object.getPrototypeOf(CheckboxInput.prototype), "setOptions", this).call(this, options);
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

UI.CheckboxInput.domAttributesMap = CreateAllowedAttributesMap(UI.Element.domAttributesMap, [["checked", { noValue: true }]]);

UI.TextArea = function (_UI$Element5) {
    inherits(TextArea, _UI$Element5);

    function TextArea() {
        classCallCheck(this, TextArea);
        return possibleConstructorReturn(this, (TextArea.__proto__ || Object.getPrototypeOf(TextArea)).apply(this, arguments));
    }

    createClass(TextArea, [{
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
            return "textarea";
        }
    }, {
        key: "applyDOMAttributes",
        value: function applyDOMAttributes() {
            get$1(TextArea.prototype.__proto__ || Object.getPrototypeOf(TextArea.prototype), "applyDOMAttributes", this).call(this);
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
            get$1(TextArea.prototype.__proto__ || Object.getPrototypeOf(TextArea.prototype), "redraw", this).call(this);
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
        key: "renderHTML",
        value: function renderHTML() {}
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
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
            return "select";
        }
    }, {
        key: "renderHTML",
        value: function renderHTML() {
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
            get$1(Select.prototype.__proto__ || Object.getPrototypeOf(Select.prototype), "redraw", this).call(this);
            if (this.options.selected) {
                this.set(this.options.selected);
            }
        }
    }]);
    return Select;
}(UI.Element);

// This whole file needs a refactoring
// options.orientation is the orientation of the divided elements
UI.DividerBar = function (_UI$Element) {
    inherits(DividerBar, _UI$Element);

    function DividerBar(options) {
        classCallCheck(this, DividerBar);

        var _this = possibleConstructorReturn(this, (DividerBar.__proto__ || Object.getPrototypeOf(DividerBar)).call(this, options));

        _this.orientation = _this.options.orientation || UI.Orientation.HORIZONTAL;
        return _this;
    }

    createClass(DividerBar, [{
        key: "getDOMAttributes",
        value: function getDOMAttributes() {
            var attr = get$1(DividerBar.prototype.__proto__ || Object.getPrototypeOf(DividerBar.prototype), "getDOMAttributes", this).call(this);
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
        key: "renderHTML",
        value: function renderHTML() {
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
UI.SectionDivider = function (_UI$Element2) {
    inherits(SectionDivider, _UI$Element2);

    function SectionDivider(options) {
        classCallCheck(this, SectionDivider);

        var _this2 = possibleConstructorReturn(this, (SectionDivider.__proto__ || Object.getPrototypeOf(SectionDivider)).call(this, options));

        _this2.orientation = _this2.options.orientation || UI.Orientation.VERTICAL;
        _this2.childrenSize = 0;
        _this2.uncollapsedSizes = new WeakMap();
        return _this2;
    }

    createClass(SectionDivider, [{
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
            if (this.orientation === UI.Orientation.HORIZONTAL) {
                return element.getWidth();
            } else {
                return element.getHeight();
            }
        }
    }, {
        key: "setDimension",
        value: function setDimension(element, size) {
            if (this.orientation === UI.Orientation.HORIZONTAL) {
                element.setWidth(size);
            } else {
                element.setHeight(size);
            }
        }
    }, {
        key: "getMinDimension",
        value: function getMinDimension(element) {
            if (this.orientation === UI.Orientation.HORIZONTAL && element.options.hasOwnProperty("minWidth")) {
                return element.options.minWidth;
            } else if (this.orientation === UI.Orientation.VERTICAL && element.options.hasOwnProperty("minHeight")) {
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
            var _this3 = this;

            if (!this.options.noDividers) {
                var _loop = function _loop(i) {
                    var mousedownFunc = function mousedownFunc(event) {
                        //TODO: right now section divider only works on UIElements
                        var p = 2 * i;
                        var previous = _this3.children[p];
                        while (p && (previous.options.fixed || previous.options.collapsed)) {
                            p -= 2;
                            previous = _this3.children[p];
                        }
                        var n = 2 * i + 2;
                        var next = _this3.children[n];
                        while (n + 2 < _this3.children.length - 1 && (next.options.fixed || next.options.collapsed)) {
                            n += 2;
                            next = _this3.children[n];
                        }
                        //TODO @kira This is not perfect yet.
                        previous.show();
                        next.show();

                        previous.dispatch("resize");
                        next.dispatch("resize");

                        var parentSize = _this3.getDimension(_this3);
                        var previousSize = _this3.getDimension(previous) * 100 / _this3.getDimension(_this3);
                        var nextSize = _this3.getDimension(next) * 100 / _this3.getDimension(_this3);
                        var minPreviousSize = _this3.getMinDimension(previous);
                        var minNextSize = _this3.getMinDimension(next);
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

                            if (_this3.orientation === UI.Orientation.HORIZONTAL) {
                                delta = Device.getEventX(event) - currentX;
                            } else if (_this3.orientation === UI.Orientation.VERTICAL) {
                                delta = Device.getEventY(event) - currentY;
                            }

                            if (nextSize - delta * 100 / parentSize < minNextSize || previousSize + delta * 100 / parentSize < minPreviousSize) {
                                return;
                            }

                            nextSize -= delta * 100 / parentSize;
                            previousSize += delta * 100 / parentSize;
                            _this3.setDimension(next, nextSize + "%");
                            _this3.setDimension(previous, previousSize + "%");

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
                    _this3["divider" + i].addDOMListener("touchstart", mousedownFunc);
                    _this3["divider" + i].addDOMListener("mousedown", mousedownFunc);
                };

                for (var i = 0; i < this.dividers; i += 1) {
                    _loop(i);
                }
            } else {
                for (var _i4 = 0; _i4 < this.dividers; _i4 += 1) {
                    this.setDimension(this["divider" + _i4], 0);
                }
            }
            setTimeout(function () {
                _this3.recalculateDimensions();
            });
            window.addEventListener("resize", function () {
                _this3.recalculateDimensions();
            });
        }
    }, {
        key: "renderHTML",
        value: function renderHTML() {
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
            get$1(SectionDivider.prototype.__proto__ || Object.getPrototypeOf(SectionDivider.prototype), "redraw", this).call(this);
            // Safari bug fix
            if (this.orientation === UI.Orientation.HORIZONTAL) {
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
                        children.push(UI.createElement(UI.DividerBar, { ref: "divider" + this.dividers, orientation: this.orientation }));
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

// TODO: the whole table architecture probably needs a rethinking
UI.TableRow = function (_UI$Element) {
    inherits(TableRow, _UI$Element);

    function TableRow() {
        classCallCheck(this, TableRow);
        return possibleConstructorReturn(this, (TableRow.__proto__ || Object.getPrototypeOf(TableRow)).apply(this, arguments));
    }

    createClass(TableRow, [{
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
            return "tr";
        }
    }, {
        key: "renderHTML",
        value: function renderHTML() {
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
}(UI.Element);

UI.TableRowInCollapsibleTable = function (_UI$TableRow) {
    inherits(TableRowInCollapsibleTable, _UI$TableRow);

    function TableRowInCollapsibleTable() {
        classCallCheck(this, TableRowInCollapsibleTable);
        return possibleConstructorReturn(this, (TableRowInCollapsibleTable.__proto__ || Object.getPrototypeOf(TableRowInCollapsibleTable)).apply(this, arguments));
    }

    createClass(TableRowInCollapsibleTable, [{
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
            return "tbody";
        }
    }, {
        key: "renderHTML",
        value: function renderHTML() {
            return UI.createElement(
                "tr",
                null,
                get$1(TableRowInCollapsibleTable.prototype.__proto__ || Object.getPrototypeOf(TableRowInCollapsibleTable.prototype), "renderHTML", this).call(this)
            );
        }
    }]);
    return TableRowInCollapsibleTable;
}(UI.TableRow);

UI.CollapsibleTableRow = function (_UI$TableRow2) {
    inherits(CollapsibleTableRow, _UI$TableRow2);

    function CollapsibleTableRow(options) {
        classCallCheck(this, CollapsibleTableRow);

        var _this3 = possibleConstructorReturn(this, (CollapsibleTableRow.__proto__ || Object.getPrototypeOf(CollapsibleTableRow)).call(this, options));

        if (options.collapsed != null) {
            _this3.collapsed = options.collapsed;
        } else {
            _this3.collapsed = true;
        }
        return _this3;
    }

    createClass(CollapsibleTableRow, [{
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
            return "tbody";
        }
    }, {
        key: "onMount",
        value: function onMount() {
            var _this4 = this;

            this.collapseButton.addClickListener(function (event) {
                _this4.collapsed = _this4.collapsed != true;
                _this4.collapseButton.toggleClass("collapsed");
                // TODO (@kira): Find out how to do this
                _this4.collapsible.element.collapse("toggle");
            });
        }
    }, {
        key: "redraw",
        value: function redraw() {
            if (!get$1(CollapsibleTableRow.prototype.__proto__ || Object.getPrototypeOf(CollapsibleTableRow.prototype), "redraw", this).call(this)) {
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
        key: "renderHTML",
        value: function renderHTML() {
            var noPaddingHiddenRowStyle = {
                padding: 0
            };

            var rowCells = get$1(CollapsibleTableRow.prototype.__proto__ || Object.getPrototypeOf(CollapsibleTableRow.prototype), "renderHTML", this).call(this);

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

UI.Table = function (_UI$Element2) {
    inherits(Table, _UI$Element2);

    function Table() {
        classCallCheck(this, Table);
        return possibleConstructorReturn(this, (Table.__proto__ || Object.getPrototypeOf(Table)).apply(this, arguments));
    }

    createClass(Table, [{
        key: "setOptions",
        value: function setOptions(options) {
            get$1(Table.prototype.__proto__ || Object.getPrototypeOf(Table.prototype), "setOptions", this).call(this, options);

            this.setColumns(options.columns || []);
            this.entries = options.entries || [];
        }
    }, {
        key: "getDOMAttributes",
        value: function getDOMAttributes() {
            var attr = get$1(Table.prototype.__proto__ || Object.getPrototypeOf(Table.prototype), "getDOMAttributes", this).call(this);

            attr.addClass("ui-table table table-stripped");

            return attr;
        }
    }, {
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
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
        key: "renderHTML",
        value: function renderHTML() {
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
                get$1(SortableTable.prototype.__proto__ || Object.getPrototypeOf(SortableTable.prototype), "setOptions", this).call(this, options);

                this.columnSortingOrder = options.columnSortingOrder || [];
            }
        }, {
            key: "getDOMAttributes",
            value: function getDOMAttributes() {
                var attr = get$1(SortableTable.prototype.__proto__ || Object.getPrototypeOf(SortableTable.prototype), "getDOMAttributes", this).call(this);

                attr.addClass("ui-sortable-table");

                return attr;
            }
        }, {
            key: "onMount",
            value: function onMount() {
                var _this7 = this;

                get$1(SortableTable.prototype.__proto__ || Object.getPrototypeOf(SortableTable.prototype), "onMount", this).call(this);

                // TODO: fix multiple clicks registered here
                // Sort table by clicked column
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    var _loop = function _loop() {
                        var column = _step2.value;

                        _this7["columnHeader" + column.id].addClickListener(function () {
                            _this7.sortByColumn(column);
                        });
                    };

                    for (var _iterator2 = this.columns[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        _loop();
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
                    get$1(SortableTable.prototype.__proto__ || Object.getPrototypeOf(SortableTable.prototype), "renderColumnHeader", this).call(this, column),
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
                var _this8 = this;

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

                    if (_this8.sortBy) {
                        cmpRes = colCmp(a, b, _this8.sortBy);
                        if (cmpRes !== 0) {
                            return _this8.sortDescending ? -cmpRes : cmpRes;
                        }
                    }

                    for (var i = 0; i < _this8.columnSortingOrder.length; i += 1) {
                        cmpRes = colCmp(a, b, _this8.columnSortingOrder[i]);
                        if (_this8.columnSortingOrder[i].sortDescending) {
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
                return this.sortEntries(get$1(SortableTable.prototype.__proto__ || Object.getPrototypeOf(SortableTable.prototype), "getEntries", this).call(this));
            }
        }, {
            key: "columnDefaults",
            value: function columnDefaults(column, index) {
                get$1(SortableTable.prototype.__proto__ || Object.getPrototypeOf(SortableTable.prototype), "columnDefaults", this).call(this, column, index);

                if (!column.hasOwnProperty("cmp")) {
                    column.cmp = defaultComparator;
                }
            }
        }]);
        return SortableTable;
    }(BaseTableClass);
};

UI.SortableTable = UI.SortableTableInterface(UI.Table);

UI.CollapsibleTableInterface = function (BaseTableClass) {
    return function (_BaseTableClass2) {
        inherits(CollapsibleTable, _BaseTableClass2);

        function CollapsibleTable() {
            classCallCheck(this, CollapsibleTable);
            return possibleConstructorReturn(this, (CollapsibleTable.__proto__ || Object.getPrototypeOf(CollapsibleTable)).apply(this, arguments));
        }

        createClass(CollapsibleTable, [{
            key: "setOptions",
            value: function setOptions(options) {
                get$1(CollapsibleTable.prototype.__proto__ || Object.getPrototypeOf(CollapsibleTable.prototype), "setOptions", this).call(this, options);

                if (options.renderCollapsible) {
                    this.renderCollapsible = options.renderCollapsible;
                }
            }
        }, {
            key: "renderHTML",
            value: function renderHTML() {
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
            key: "getDOMAttributes",
            value: function getDOMAttributes() {
                var attr = get$1(CollapsibleTable.prototype.__proto__ || Object.getPrototypeOf(CollapsibleTable.prototype), "getDOMAttributes", this).call(this);
                attr.addClass("ui-collapsible-table");
                return attr;
            }
        }, {
            key: "setColumns",
            value: function setColumns(columns) {
                var _this10 = this;

                var collapseColumn = {
                    value: function value(entry) {
                        var rowClass = _this10.getRowClass(entry);
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

                get$1(CollapsibleTable.prototype.__proto__ || Object.getPrototypeOf(CollapsibleTable.prototype), "setColumns", this).call(this, [collapseColumn].concat(columns));
            }
        }]);
        return CollapsibleTable;
    }(BaseTableClass);
};

UI.CollapsibleTable = UI.CollapsibleTableInterface(UI.Table);

var EPS = 1e-6;

// Check if a value is equal to zero. Use epsilon check.
var isZero = function isZero(val) {
    var epsilon = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : EPS;

    return Math.abs(val) < epsilon;
};

// Simulate C/C++ rand() function


var equal = function equal(val1, val2) {
    var epsilon = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : EPS;

    return isZero(val1 - val2, epsilon);
};



// Compute square of a number
var sqr = function sqr(x) {
    return x * x;
};

// Compute the distance between 2 points
var distance = function distance(p1, p2) {
    return Math.sqrt(sqr(p1.x - p2.x) + sqr(p1.y - p2.y));
};











// Compute angle between 2 points in grad


// Transform gradian in radian


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







var polarToCartesian = function polarToCartesian(angle, radius, orig) {
    orig = orig || { x: 0, y: 0 };
    return {
        x: radius * Math.cos(angle) + orig.x,
        y: radius * Math.sin(angle) + orig.y
    };
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

var Color = function () {
    function Color() {
        classCallCheck(this, Color);
    }

    createClass(Color, null, [{
        key: "parseColor",
        value: function parseColor(color) {
            color = color.trim().toLowerCase();

            // Check if color is given by name
            if (COLORS_BY_NAME.hasOwnProperty(color)) {
                color = COLORS_BY_NAME[color];
            }

            // Check for hex3 (e.g. "#f00")
            var hex3 = color.match(/^#([0-9a-f]{3})$/i);
            if (hex3) {
                return [parseInt(hex3[1].charAt(0), 16) * 0x11, parseInt(hex3[1].charAt(1), 16) * 0x11, parseInt(hex3[1].charAt(2), 16) * 0x11, 1];
            }

            // Check for hex6 (e.g. "#ff0000")
            var hex6 = color.match(/^#([0-9a-f]{6})$/i);
            if (hex6) {
                return [parseInt(hex6[1].substr(0, 2), 16), parseInt(hex6[1].substr(2, 2), 16), parseInt(hex6[1].substr(4, 2), 16), 1];
            }

            // Check for rgba (e.g. "rgba(255, 0, 0, 0.5)")
            var rgba = color.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+.*\d*)\s*\)$/i);
            if (rgba) {
                return [parseInt(rgba[1]), parseInt(rgba[2]), parseInt(rgba[3]), parseFloat(rgba[4])];
            }

            // Check for rgb (e.g. "rgb(255, 0, 0)")
            var rgb = color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
            if (rgb) {
                return [parseInt(rgb[1]), parseInt(rgb[2]), parseInt(rgb[3]), 1];
            }

            // TODO(@wefgef): Add hsl support
        }
    }, {
        key: "buildRGBA",
        value: function buildRGBA(colorArray) {
            return "rgba(" + colorArray[0] + "," + colorArray[1] + "," + colorArray[2] + "," + colorArray[3] + ")";
        }

        // TODO: this should be implemented as a factory that generates an interpolator object, that just takes in a t

    }, {
        key: "interpolate",
        value: function interpolate(firstColor, secondColor, t) {
            var firstColorArray = Color.parseColor(firstColor);
            var secondColorArray = Color.parseColor(secondColor);
            return Color.buildRGBA([parseInt(firstColorArray[0] * (1 - t) + secondColorArray[0] * t), parseInt(firstColorArray[1] * (1 - t) + secondColorArray[1] * t), parseInt(firstColorArray[2] * (1 - t) + secondColorArray[2] * t), firstColorArray[3] * (1 - t) + secondColorArray[3] * t]);
        }
    }]);
    return Color;
}();

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
        key: "add",
        value: function add(transition) {
            var forceFinish = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            for (var i = 0; i < transition.dependsOn.length; i += 1) {
                if (transition.dependsOn[i].getEndTime() > transition.startTime) {
                    console.error("A transition depends on one that ends after its start!");
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
                    console.error("A transition depends on one that ends after its start!");
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
            this.node = document.createElementNS("http://www.w3.org/2000/svg", this.getPrimitiveTag());
            return this.node;
        }
    }, {
        key: "setOptions",
        value: function setOptions(options) {
            if (options.hasOwnProperty("style")) {
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
                // TODO: use object.assign and make sure everything work on the right level
                options = $.extend(true, {}, defaultOptions, options);
            }

            get$1(SVGElement.prototype.__proto__ || Object.getPrototypeOf(SVGElement.prototype), "setOptions", this).call(this, options);
        }
    }, {
        key: "saveState",
        value: function saveState() {
            var state = {};
            state.options = $.extend(true, {}, this.options);
            return state;
        }
    }, {
        key: "setStyle",
        value: function setStyle(attributeName, value) {
            get$1(SVGElement.prototype.__proto__ || Object.getPrototypeOf(SVGElement.prototype), "setStyle", this).call(this, attributeName, value);
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
        key: "getDOMAttributes",
        value: function getDOMAttributes() {
            var attr = get$1(SVGElement.prototype.__proto__ || Object.getPrototypeOf(SVGElement.prototype), "getDOMAttributes", this).call(this);
            attr.classes = null;

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

UI.SVG.Element.domAttributesMap = CreateAllowedAttributesMap(UI.Element.domAttributesMap, [["fill"], ["height"], ["opacity"], ["stroke"], ["strokeWidth", { domName: "stroke-width" }], ["clipPath", { domName: "clip-path" }], ["transform"], ["width"], ["cx"], ["cy"], ["rx"], ["ry"], ["x"], ["y"], ["offset"], ["stopColor", { domName: "stop-color" }], ["strokeDasharray", { domName: "stroke-dasharray" }], ["strokeLinecap", { domName: "stroke-linecap" }]]);

UI.SVG.SVGRoot = function (_UI$SVG$Element) {
    inherits(SVGRoot, _UI$SVG$Element);

    function SVGRoot() {
        classCallCheck(this, SVGRoot);
        return possibleConstructorReturn(this, (SVGRoot.__proto__ || Object.getPrototypeOf(SVGRoot)).apply(this, arguments));
    }

    createClass(SVGRoot, [{
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
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
            get$1(RawSVG.prototype.__proto__ || Object.getPrototypeOf(RawSVG.prototype), "redraw", this).call(this);
            this.node.innerHTML = this.options.innerHTML;
        }
    }]);
    return RawSVG;
}(UI.SVG.SVGRoot);

UI.SVG.Group = function (_UI$SVG$Element2) {
    inherits(SVGGroup, _UI$SVG$Element2);

    function SVGGroup() {
        classCallCheck(this, SVGGroup);
        return possibleConstructorReturn(this, (SVGGroup.__proto__ || Object.getPrototypeOf(SVGGroup)).apply(this, arguments));
    }

    createClass(SVGGroup, [{
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
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
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
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
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
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
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
            return "path";
        }
    }, {
        key: "getDOMAttributes",
        value: function getDOMAttributes() {
            var attr = get$1(SVGPath.prototype.__proto__ || Object.getPrototypeOf(SVGPath.prototype), "getDOMAttributes", this).call(this);
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
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
            return "circle";
        }
    }, {
        key: "getDOMAttributes",
        value: function getDOMAttributes() {
            var attr = get$1(SVGCircle.prototype.__proto__ || Object.getPrototypeOf(SVGCircle.prototype), "getDOMAttributes", this).call(this);
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

UI.SVG.HandDrawnCircle = function (_UI$SVG$Element7) {
    inherits(SVGHandDrawnCircle, _UI$SVG$Element7);

    function SVGHandDrawnCircle() {
        classCallCheck(this, SVGHandDrawnCircle);
        return possibleConstructorReturn(this, (SVGHandDrawnCircle.__proto__ || Object.getPrototypeOf(SVGHandDrawnCircle)).apply(this, arguments));
    }

    createClass(SVGHandDrawnCircle, [{
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
            return "path";
        }
    }, {
        key: "setParameters",
        value: function setParameters(parameters) {
            Object.assign(this.options, parameters);
            this.setAttribute("d", this.getPath());
            this.setAttribute("transform", this.getTransform());
        }
    }, {
        key: "setCenter",
        value: function setCenter(x, y) {
            this.options.x = x;
            this.options.y = y;
            this.setAttribute("transform", this.getTransform());
        }
    }, {
        key: "setRadius",
        value: function setRadius(r) {
            this.options.r = r;
            this.setAttribute("d", this.getPath());
        }
    }, {
        key: "getDOMAttributes",
        value: function getDOMAttributes() {
            var attr = get$1(SVGHandDrawnCircle.prototype.__proto__ || Object.getPrototypeOf(SVGHandDrawnCircle.prototype), "getDOMAttributes", this).call(this);
            attr.setAttribute("d", this.getPath());
            attr.setAttribute("transform", this.getTransform());
            return attr;
        }
    }, {
        key: "getPath",
        value: function getPath() {
            var r = this.options.r;
            var dR1 = this.options.minDeltaR;
            var dR2 = this.options.maxDeltaR;
            var minAngle = this.options.minStartingAngle;
            var maxAngle = this.options.maxStartingAngle;
            var minDAngle = this.options.minOverlap;
            var maxDAngle = this.options.maxOverlap;
            var c = 0.551915024494;
            var beta = Math.atan(c);
            var d = Math.sqrt(c * c + 1);
            var alpha = (minAngle + Math.random() * (maxAngle - minAngle)) * Math.PI / 180;

            var path = 'M' + [r * Math.sin(alpha), r * Math.cos(alpha)];
            path += ' C' + [d * r * Math.sin(alpha + beta), d * r * Math.cos(alpha + beta)];

            for (var i = 0; i < 4; i += 1) {
                var dAngle = minDAngle + Math.random() * (maxDAngle - minDAngle);
                alpha += Math.PI / 2 * (1 + dAngle);
                r *= 1 + dR1 + Math.random() * (dR2 - dR1);
                path += ' ' + (i ? 'S' : '') + [d * r * Math.sin(alpha - beta), d * r * Math.cos(alpha - beta)];
                path += ' ' + [r * Math.sin(alpha), r * Math.cos(alpha)];
            }

            return path;
        }
    }, {
        key: "getTransform",
        value: function getTransform() {
            var minL = this.options.minSquash;
            var maxL = this.options.maxSquash;
            var minAlpha = this.options.minSquashAngle;
            var maxAlpha = this.options.maxSquashAngle;
            var alpha = minAlpha + Math.random() * (maxAlpha - minAlpha);
            var lambda = minL + Math.random() * (maxL - minL);

            return 'translate(' + [this.options.x, this.options.y] + ') ' + 'rotate(' + alpha + ') scale(1, ' + lambda + ') rotate(' + -alpha + ')';
        }
    }], [{
        key: "getDefaultOptions",
        value: function getDefaultOptions() {
            return {
                minDeltaR: 0.1, // When the circle overlaps, the R decides the
                maxDeltaR: 0.1, // ratio between the diameter of the circle and the
                // "imperfection" at its union, and DeltaR is the
                // difference between R and 1 (bigger -> more like a spiral)

                minStartingAngle: 0, // Where the overlapping starts (0-360)
                maxStartingAngle: 0,

                minOverlap: 0.15, // How much the circle goes over itself (ratio to circumference)
                maxOverlap: 0.15,

                minSquash: 0.7, // How alike it is to an ellipse (1 is perfectly circular)
                maxSquash: 0.7,

                minSquashAngle: 150, // Angle of the axis by which its elliptical
                maxSquashAngle: 150,

                r: 19, // Radius

                x: 0, // Center
                y: 0,

                fill: "transparent",
                stroke: "black",
                strokeWidth: "2px"
            };
        }
    }]);
    return SVGHandDrawnCircle;
}(UI.SVG.Element);

//TODO Complete this class
UI.SVG.Ellipse = function (_UI$SVG$Element8) {
    inherits(SVGEllipse, _UI$SVG$Element8);

    function SVGEllipse() {
        classCallCheck(this, SVGEllipse);
        return possibleConstructorReturn(this, (SVGEllipse.__proto__ || Object.getPrototypeOf(SVGEllipse)).apply(this, arguments));
    }

    createClass(SVGEllipse, [{
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
            return "ellipse";
        }
    }, {
        key: "getDOMAttributes",
        value: function getDOMAttributes() {
            var attr = get$1(SVGEllipse.prototype.__proto__ || Object.getPrototypeOf(SVGEllipse.prototype), "getDOMAttributes", this).call(this);
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

UI.SVG.Rect = function (_UI$SVG$Element9) {
    inherits(SVGRect, _UI$SVG$Element9);

    function SVGRect() {
        classCallCheck(this, SVGRect);
        return possibleConstructorReturn(this, (SVGRect.__proto__ || Object.getPrototypeOf(SVGRect)).apply(this, arguments));
    }

    createClass(SVGRect, [{
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
            return "rect";
        }
    }, {
        key: "getDOMAttributes",
        value: function getDOMAttributes() {
            var attr = get$1(SVGRect.prototype.__proto__ || Object.getPrototypeOf(SVGRect.prototype), "getDOMAttributes", this).call(this);

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

UI.SVG.Line = function (_UI$SVG$Element10) {
    inherits(SVGLine, _UI$SVG$Element10);

    function SVGLine() {
        classCallCheck(this, SVGLine);
        return possibleConstructorReturn(this, (SVGLine.__proto__ || Object.getPrototypeOf(SVGLine)).apply(this, arguments));
    }

    createClass(SVGLine, [{
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
            return "line";
        }
    }, {
        key: "getDOMAttributes",
        value: function getDOMAttributes() {
            var attr = get$1(SVGLine.prototype.__proto__ || Object.getPrototypeOf(SVGLine.prototype), "getDOMAttributes", this).call(this);

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

UI.SVG.Text = function (_UI$SVG$Element11) {
    inherits(SVGText, _UI$SVG$Element11);

    function SVGText() {
        classCallCheck(this, SVGText);
        return possibleConstructorReturn(this, (SVGText.__proto__ || Object.getPrototypeOf(SVGText)).apply(this, arguments));
    }

    createClass(SVGText, [{
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
            return "text";
        }
    }, {
        key: "setOptions",
        value: function setOptions(options) {
            get$1(SVGText.prototype.__proto__ || Object.getPrototypeOf(SVGText.prototype), "setOptions", this).call(this, options);
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
        key: "getDOMAttributes",
        value: function getDOMAttributes() {
            var attr = get$1(SVGText.prototype.__proto__ || Object.getPrototypeOf(SVGText.prototype), "getDOMAttributes", this).call(this);

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
        key: "renderHTML",
        value: function renderHTML() {
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
            var _this18 = this;

            var dependsOn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
            var startTime = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

            return new Transition({
                func: function func(t, context) {
                    _this18.setPosition((1 - t) * context.x + t * coords.x, (1 - t) * context.y + t * coords.y);
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
            var _this19 = this;

            var dependsOn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
            var startTime = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

            return new Transition({
                func: function func(t, context) {
                    _this19.setColor(Color.interpolate(context.color, color, t), true);
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

UI.SVG.Text.domAttributesMap = CreateAllowedAttributesMap(UI.SVG.Element.domAttributesMap, [["fontFamily", { domName: "font-family" }]]);

UI.SVG.TextArea = function (_UI$SVG$Element12) {
    inherits(SVGTextArea, _UI$SVG$Element12);

    function SVGTextArea() {
        classCallCheck(this, SVGTextArea);
        return possibleConstructorReturn(this, (SVGTextArea.__proto__ || Object.getPrototypeOf(SVGTextArea)).apply(this, arguments));
    }

    createClass(SVGTextArea, [{
        key: "setOptions",
        value: function setOptions(options) {
            get$1(SVGTextArea.prototype.__proto__ || Object.getPrototypeOf(SVGTextArea.prototype), "setOptions", this).call(this, options);
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
        key: "renderHTML",
        value: function renderHTML() {}
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
        key: "getDOMAttributes",
        value: function getDOMAttributes() {
            var attr = get$1(Polygon.prototype.__proto__ || Object.getPrototypeOf(Polygon.prototype), "getDOMAttributes", this).call(this);
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

// TODO: move this somewhere else
UI.SVG.CSAIconPath = function (_UI$SVG$Path3) {
    inherits(SVGCSAIconPath, _UI$SVG$Path3);

    function SVGCSAIconPath() {
        classCallCheck(this, SVGCSAIconPath);
        return possibleConstructorReturn(this, (SVGCSAIconPath.__proto__ || Object.getPrototypeOf(SVGCSAIconPath)).apply(this, arguments));
    }

    createClass(SVGCSAIconPath, [{
        key: "setOptions",
        value: function setOptions(options) {
            this.options = options;
            this.options.x = options.x || "0";
            this.options.y = options.y || "0";
            this.options.size = options.size || 45;
            var ux = this.options.size / 1646;
            var uy = 0.8 * this.options.size / 1479;
            this.options.d = ' m ' + 823 * ux + ' ' + 1194 * uy + ' l ' + 0 * ux + ' ' + -152 * uy + ' l ' + -191 * ux + ' ' + 0 * uy + ' l ' + 191 * ux + ' ' + -330 * uy + ' l ' + 191 * ux + ' ' + 330 * uy + ' l ' + -191 * ux + ' ' + 0 * uy + ' l ' + 0 * ux + ' ' + 152 * uy + ' l ' + 257 * ux + ' ' + 0 * uy + ' l ' + 173 * ux + ' ' + 100 * uy + ' a ' + 194 * ux + ' ' + 194 * uy + ' 0 1 0 ' + 100 * ux + ' ' + -173 * uy + ' l ' + -173 * ux + ' ' + -100 * uy + ' l ' + -256 * ux + ' ' + -464 * uy + ' l ' + 0 * ux + ' ' + -200 * uy + ' a ' + 194 * ux + ' ' + 194 * uy + ' 0 1 0 ' + -200 * ux + ' ' + 0 * uy + ' l ' + 0 * ux + ' ' + 200 * uy + ' l ' + -256 * ux + ' ' + 464 * uy + ' l ' + -173 * ux + ' ' + 100 * uy + ' a ' + 194 * ux + ' ' + 194 * uy + ' 0 1 0 ' + 100 * ux + ' ' + 173 * uy + ' l ' + 173 * ux + ' ' + -100 * uy + '  z';
            this.options.fill = options.fill || "white";
            this.options.stroke = options.stroke || "none";
        }
    }]);
    return SVGCSAIconPath;
}(UI.SVG.Path);

UI.SVG.CSAIconSVG = function (_UI$SVG$SVGRoot2) {
    inherits(SVGCSAIconSVG, _UI$SVG$SVGRoot2);

    function SVGCSAIconSVG() {
        classCallCheck(this, SVGCSAIconSVG);
        return possibleConstructorReturn(this, (SVGCSAIconSVG.__proto__ || Object.getPrototypeOf(SVGCSAIconSVG)).apply(this, arguments));
    }

    createClass(SVGCSAIconSVG, [{
        key: "setOptions",
        value: function setOptions(options) {
            this.options = options;
            this.options.size = this.options.size || 45;
            this.options.width = this.options.size;
            this.options.height = this.options.size;
        }
    }, {
        key: "renderHTML",
        value: function renderHTML() {
            return [UI.createElement(UI.SVG.CSAIconPath, { size: this.options.size })];
        }
    }]);
    return SVGCSAIconSVG;
}(UI.SVG.SVGRoot);

UI.Switcher = function (_UI$Element) {
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
        key: "renderHTML",
        value: function renderHTML() {
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
            this.applyDOMAttributes();
            this.applyRef();

            // This renderHTML may be required to update this.options.children
            UI.renderingStack.push(this);
            this.renderHTML();
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
        key: "getActiveIndex",
        value: function getActiveIndex() {
            return this.getChildIndex(this.activeChild);
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
        key: "getChild",
        value: function getChild(index) {
            return this.options.children[index];
        }
    }, {
        key: "getChildIndex",
        value: function getChildIndex(element) {
            return this.options.children.indexOf(element);
        }
    }, {
        key: "onMount",
        value: function onMount() {
            var _this2 = this;

            this.addListener("shouldRedrawChild", function (event) {
                if (event.child.isInDOM()) {
                    event.child.redraw();
                } else {
                    _this2.getChildProperties(event.child).isUpToDate = false;
                }
            });
        }
    }]);
    return Switcher;
}(UI.Element);

UI.BasicTabTitle = function (_UI$Element) {
    inherits(BasicTabTitle, _UI$Element);

    function BasicTabTitle() {
        classCallCheck(this, BasicTabTitle);
        return possibleConstructorReturn(this, (BasicTabTitle.__proto__ || Object.getPrototypeOf(BasicTabTitle)).apply(this, arguments));
    }

    createClass(BasicTabTitle, [{
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
            return "li";
        }
    }, {
        key: "getDOMAttributes",
        value: function getDOMAttributes() {
            var attr = get$1(BasicTabTitle.prototype.__proto__ || Object.getPrototypeOf(BasicTabTitle.prototype), "getDOMAttributes", this).call(this);
            if (this.options.active) {
                attr.addClass("active");
            }
            return attr;
        }
    }, {
        key: "setActive",
        value: function setActive(active) {
            this.options.active = active;
            if (active) {
                this.addClass("active");
            } else {
                this.removeClass("active");
            }
        }
    }, {
        key: "renderHTML",
        value: function renderHTML() {
            var hrefOption = {};
            if (this.options.href) {
                hrefOption.href = this.options.href;
            }
            if (!this.options.title) {
                this.options.title = this.options.panel.getTitle();
            }
            return [UI.createElement(
                "a",
                _extends({}, hrefOption, { className: "tabTitle unselectable pointer-cursor csa-tab" }),
                UI.createElement(
                    "div",
                    { className: "csa-tab-title" },
                    this.options.title
                )
            )];
        }
    }, {
        key: "onMount",
        value: function onMount() {
            var _this2 = this;

            this.addClickListener(function () {
                _this2.dispatch("setActive");
            });
        }
    }]);
    return BasicTabTitle;
}(UI.Element);

UI.TabTitleArea = function (_UI$Element2) {
    inherits(TabTitleArea, _UI$Element2);

    function TabTitleArea(options) {
        classCallCheck(this, TabTitleArea);

        var _this3 = possibleConstructorReturn(this, (TabTitleArea.__proto__ || Object.getPrototypeOf(TabTitleArea)).call(this, options));

        _this3.activeTab = null;
        return _this3;
    }

    createClass(TabTitleArea, [{
        key: "getDOMAttributes",
        value: function getDOMAttributes() {
            var attr = get$1(TabTitleArea.prototype.__proto__ || Object.getPrototypeOf(TabTitleArea.prototype), "getDOMAttributes", this).call(this);
            attr.addClass("nav nav-tabs collapsible-tabs");
            attr.setAttribute("role", "tablist");
            return attr;
        }
    }, {
        key: "setActiveTab",
        value: function setActiveTab(tab) {
            if (this.activeTab) {
                this.activeTab.setActive(false);
            }
            this.activeTab = tab;
            this.activeTab.setActive(true);
        }
    }, {
        key: "appendTab",
        value: function appendTab(tab) {
            var _this4 = this;

            this.appendChild(tab);
            if (tab.options.active) {
                this.activeTab = tab;
                this.setActiveTab(tab);
            }
            tab.addClickListener(function () {
                _this4.setActiveTab(tab);
            });
        }
    }, {
        key: "onMount",
        value: function onMount() {
            for (var i = 0; i < this.options.children.length; i += 1) {
                var child = this.options.children[i];
                if (child.options.active) {
                    this.setActiveTab(child);
                }
            }
        }
    }]);
    return TabTitleArea;
}(UI.Element);

// Inactive class for the moment, should extend UI.BasicTabTitle
UI.SVGTabTitle = function (_UI$Element3) {
    inherits(SVGTabTitle, _UI$Element3);

    function SVGTabTitle() {
        classCallCheck(this, SVGTabTitle);
        return possibleConstructorReturn(this, (SVGTabTitle.__proto__ || Object.getPrototypeOf(SVGTabTitle)).apply(this, arguments));
    }

    createClass(SVGTabTitle, [{
        key: "setOptions",
        value: function setOptions(options) {
            get$1(SVGTabTitle.prototype.__proto__ || Object.getPrototypeOf(SVGTabTitle.prototype), "setOptions", this).call(this, options);
            this.options.angle = options.angle || "0";
            this.options.strokeWidth = options.strokeWidth || "2";
        }
    }, {
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
            return "li";
        }
    }, {
        key: "setLabel",
        value: function setLabel(label) {
            this.options.label = label;
            this.redraw();
        }
    }, {
        key: "redraw",
        value: function redraw() {
            var _this6 = this;

            get$1(SVGTabTitle.prototype.__proto__ || Object.getPrototypeOf(SVGTabTitle.prototype), "redraw", this).call(this);
            setTimeout(function () {
                var strokeWidth = parseFloat(_this6.options.strokeWidth);
                var mainHeight = 1.4 * _this6.tabTitle.getHeight();
                var angleWidth = Math.tan(_this6.options.angle / 180 * Math.PI) * mainHeight;
                var mainWidth = _this6.tabTitle.getWidth() + 1.2 * _this6.tabTitle.getHeight();
                var tabHeight = mainHeight;
                var tabWidth = mainWidth + 2 * angleWidth;

                var svgWidth = tabWidth + 2 * strokeWidth;
                var svgHeight = tabHeight + strokeWidth;

                var pathString = "M " + strokeWidth + " " + (svgHeight + strokeWidth / 2) + " l " + angleWidth + " -" + svgHeight + " l " + mainWidth + " 0 l " + angleWidth + " " + svgHeight;

                _this6.tabSvg.setWidth(svgWidth);
                _this6.tabSvg.setHeight(svgHeight);
                //TODO Check if this is working. It might not.
                _this6.tabPath.setPath(pathString);
                _this6.tabTitle.setStyle("top", tabHeight / 6 + strokeWidth);
                _this6.tabTitle.setStyle("left", angleWidth + strokeWidth + 0.6 * _this6.tabTitle.getHeight() + "px");
                console.log(angleWidth);
                _this6.setStyle("margin-right", -(angleWidth + 2 * strokeWidth));
                _this6.setStyle("z-index", 100);
            }, 0);
        }
    }, {
        key: "renderHTML",
        value: function renderHTML() {
            return [UI.createElement(
                UI.SVG.SVGRoot,
                { ref: "tabSvg", style: { width: "0px", height: "0px" } },
                UI.createElement(UI.SVG.Path, { ref: "tabPath", d: "" })
            ),
            //TODO Rename this to labelPanel
            UI.createElement(
                UI.Panel,
                { ref: "tabTitle", style: { pointerEvents: "none", position: "absolute" } },
                this.options.label
            )];
        }
    }]);
    return SVGTabTitle;
}(UI.Element);

UI.TabArea = function (_UI$Element4) {
    inherits(TabArea, _UI$Element4);

    function TabArea(options) {
        classCallCheck(this, TabArea);

        var _this7 = possibleConstructorReturn(this, (TabArea.__proto__ || Object.getPrototypeOf(TabArea)).call(this, options));

        _this7.tabTitleMap = new WeakMap();
        return _this7;
    }

    createClass(TabArea, [{
        key: "getDOMAttributes",
        value: function getDOMAttributes() {
            var attr = get$1(TabArea.prototype.__proto__ || Object.getPrototypeOf(TabArea.prototype), "getDOMAttributes", this).call(this);
            if (!this.options.variableHeightPanels) {
                attr.addClass("auto-height-parent");
            }
            return attr;
        }
    }, {
        key: "createTabPanel",
        value: function createTabPanel(panel) {
            var tab = UI.createElement(UI.BasicTabTitle, { panel: panel, active: panel.options.active, href: panel.options.tabHref });

            //TODO: Don't modify the tab panel class!!!!
            var panelClass = " tab-panel nopad";
            if (!this.options.variableHeightPanels) {
                panelClass += " auto-height-child";
            }
            panel.options.className = (panel.options.className || "") + panelClass;

            return [tab, panel];
        }
    }, {
        key: "connectTabTitleToPanel",
        value: function connectTabTitleToPanel(panel, tab) {
            if (this.tabTitleMap.get(panel) === tab) {
                return;
            }
            this.tabTitleMap.set(panel, tab);
            this.addTabListeners(tab, panel);
        }
    }, {
        key: "appendChild",
        value: function appendChild(panel, doMount) {
            this.options.children.push(panel);

            var _createTabPanel = this.createTabPanel(panel),
                _createTabPanel2 = slicedToArray(_createTabPanel, 2),
                tabTitle = _createTabPanel2[0],
                tabPanel = _createTabPanel2[1];

            this.titleArea.appendTab(tabTitle);
            // TODO: consider the best default for inserting
            this.switcherArea.appendChild(tabPanel, doMount || true);
            this.connectTabTitleToPanel(panel, tabTitle);
        }
    }, {
        key: "renderHTML",
        value: function renderHTML() {
            var tabTitles = [],
                tabPanels = [];
            for (var i = 0; i < this.options.children.length; i += 1) {
                var panel = this.options.children[i];

                var _createTabPanel3 = this.createTabPanel(panel),
                    _createTabPanel4 = slicedToArray(_createTabPanel3, 2),
                    tabTitle = _createTabPanel4[0],
                    tabPanel = _createTabPanel4[1];

                tabTitles.push(tabTitle);
                tabPanels.push(tabPanel);
            }
            if (this.options.variableHeightPanels) {
                this.switcherClass = "";
            } else {
                this.switcherClass = "auto-height";
            }
            return [UI.createElement(
                UI.TabTitleArea,
                { ref: "titleArea" },
                tabTitles
            ), UI.createElement(
                UI.Switcher,
                { ref: "switcherArea", className: this.switcherClass },
                tabPanels
            )];
        }
    }, {
        key: "redraw",
        value: function redraw() {
            get$1(TabArea.prototype.__proto__ || Object.getPrototypeOf(TabArea.prototype), "redraw", this).call(this);
            for (var i = 0; i < this.options.children.length; i += 1) {
                var panel = this.options.children[i];
                var tab = this.titleArea.children[i];
                this.connectTabTitleToPanel(panel, tab);
            }
        }
    }, {
        key: "getActive",
        value: function getActive() {
            return this.switcherArea.getActive();
        }
    }, {
        key: "addTabListeners",
        value: function addTabListeners(tab, panel) {
            var _this8 = this;

            this.addListener("resize", function () {
                panel.dispatch("resize");
            });
            //TODO: should not be a function, but a dispatcher
            panel.showTabPanel = function () {
                if (_this8.getActive() === panel) {
                    return;
                }
                _this8.switcherArea.setActive(panel);
                _this8.titleArea.setActiveTab(tab);
            };
            panel.addListener("show", function () {
                panel.showTabPanel();
            });
            tab.addListener("setActive", function () {
                panel.dispatch("resize");
                panel.showTabPanel();
            });
        }
    }]);
    return TabArea;
}(UI.Element);

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
            get$1(FloatingWindow.prototype.__proto__ || Object.getPrototypeOf(FloatingWindow.prototype), "setOptions", this).call(this, options);
        }
    }, {
        key: "renderHTML",
        value: function renderHTML() {
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
        key: "getDOMAttributes",
        value: function getDOMAttributes() {
            var attr = get$1(FloatingWindow.prototype.__proto__ || Object.getPrototypeOf(FloatingWindow.prototype), "getDOMAttributes", this).call(this);
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
            if (!this.isInDOM()) {
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
            if (this.isInDOM()) {
                this.fadeOut();
                setTimeout(function () {
                    if (_this3.isInDOM()) {
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
            if (!this.isInDOM()) {
                this.bindWindowListeners();
                get$1(VolatileFloatingWindow.prototype.__proto__ || Object.getPrototypeOf(VolatileFloatingWindow.prototype), "show", this).call(this);
            }
        }
    }, {
        key: "hide",
        value: function hide() {
            if (this.isInDOM()) {
                this.unbindWindowListeners();
                get$1(VolatileFloatingWindow.prototype.__proto__ || Object.getPrototypeOf(VolatileFloatingWindow.prototype), "hide", this).call(this);
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
            get$1(Modal.prototype.__proto__ || Object.getPrototypeOf(Modal.prototype), "setOptions", this).call(this, options);
        }
    }, {
        key: "renderHTML",
        value: function renderHTML() {
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
                closeButton = UI.createElement(
                    "div",
                    { style: { position: "absolute", right: "10px", zIndex: "10" } },
                    UI.createElement(UI.Button, { type: "button", className: "close", "data-dismiss": "modal", "aria-label": "Close",
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

            get$1(Modal.prototype.__proto__ || Object.getPrototypeOf(Modal.prototype), "onMount", this).call(this);
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
            return this.options.actionName || this.options.label;
        }
    }, {
        key: "getActionLevel",
        value: function getActionLevel() {
            return this.options.level || UI.Level.DEFAULT;
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
        key: "getFooterContent",
        value: function getFooterContent() {
            var _this14 = this;

            return [UI.createElement(UI.TemporaryMessageArea, { ref: "messageArea" }), UI.createElement(UI.Button, { level: UI.Level.DEFAULT, label: "Close", onClick: function onClick() {
                    return _this14.hide();
                } }), UI.createElement(UI.Button, { level: this.getActionLevel(), label: this.getActionName(), onClick: function onClick() {
                    return _this14.action();
                } })];
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
            key: "onMount",
            value: function onMount() {
                var _this16 = this;

                this.modal = UI.createElement(ActionModal, this.options);
                this.addClickListener(function () {
                    return _this16.modal.show();
                });
            }
        }]);
        return ActionModalButton;
    }(UI.Button);
};

function BootstrapMixin(BaseClass, bootstrapClassName) {
    var BootstrapClass = function (_BaseClass) {
        inherits(BootstrapClass, _BaseClass);

        function BootstrapClass() {
            classCallCheck(this, BootstrapClass);
            return possibleConstructorReturn(this, (BootstrapClass.__proto__ || Object.getPrototypeOf(BootstrapClass)).apply(this, arguments));
        }

        createClass(BootstrapClass, [{
            key: "setOptions",
            value: function setOptions(options) {
                get$1(BootstrapClass.prototype.__proto__ || Object.getPrototypeOf(BootstrapClass.prototype), "setOptions", this).call(this, options);
                this.options.level = this.options.level || UI.Level.DEFAULT;
            }
        }, {
            key: "getDOMAttributes",
            value: function getDOMAttributes() {
                var attr = get$1(BootstrapClass.prototype.__proto__ || Object.getPrototypeOf(BootstrapClass.prototype), "getDOMAttributes", this).call(this);

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
                this.applyDOMAttributes();
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

UI.Button = function (_BootstrapMixin) {
    inherits(Button, _BootstrapMixin);

    function Button() {
        classCallCheck(this, Button);
        return possibleConstructorReturn(this, (Button.__proto__ || Object.getPrototypeOf(Button)).apply(this, arguments));
    }

    createClass(Button, [{
        key: "getDOMAttributes",
        value: function getDOMAttributes() {
            var attr = get$1(Button.prototype.__proto__ || Object.getPrototypeOf(Button.prototype), "getDOMAttributes", this).call(this);

            if (this.getSize()) {
                attr.addClass(this.constructor.bootstrapClass() + "-" + this.getSize());
            }

            return attr;
        }
    }, {
        key: "setOptions",
        value: function setOptions(options) {
            get$1(Button.prototype.__proto__ || Object.getPrototypeOf(Button.prototype), "setOptions", this).call(this, options);
            this.options.label = options.label || "";
        }
    }, {
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
            return "button";
        }
    }, {
        key: "renderHTML",
        value: function renderHTML() {
            // TODO: Label was converted to string. Fix it.
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
    }, {
        key: "getSize",
        value: function getSize() {
            return this.options.size || "";
        }
    }, {
        key: "setSize",
        value: function setSize(size) {
            this.options.size = size;
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
}(BootstrapMixin(UI.Element, "btn"));

UI.StateButton = function (_UI$Button) {
    inherits(StateButton, _UI$Button);

    function StateButton() {
        classCallCheck(this, StateButton);
        return possibleConstructorReturn(this, (StateButton.__proto__ || Object.getPrototypeOf(StateButton)).apply(this, arguments));
    }

    createClass(StateButton, [{
        key: "setOptions",
        value: function setOptions(options) {
            options.state = this.options.state || options.state || UI.ActionStatus.DEFAULT;

            get$1(StateButton.prototype.__proto__ || Object.getPrototypeOf(StateButton.prototype), "setOptions", this).call(this, options);

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
        key: "renderHTML",
        value: function renderHTML() {
            var stateOptions = this.options.statusOptions[this.options.state - 1];

            this.options.label = stateOptions.label;
            this.options.faIcon = stateOptions.faIcon;

            return get$1(StateButton.prototype.__proto__ || Object.getPrototypeOf(StateButton.prototype), "renderHTML", this).call(this);
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
            var _this5 = this;

            this.setState(UI.ActionStatus.RUNNING);
            $.ajax({
                url: data.url,
                type: data.type,
                dataType: data.dataType,
                data: data.data,
                success: function success(successData) {
                    data.success(successData);
                    if (successData.error) {
                        _this5.setState(UI.ActionStatus.FAILED);
                    } else {
                        _this5.setState(UI.ActionStatus.SUCCESS);
                    }
                },
                error: function error(xhr, errmsg, err) {
                    data.error(xhr, errmsg, err);
                    _this5.setState(UI.ActionStatus.FAILED);
                },
                complete: function complete() {
                    setTimeout(function () {
                        _this5.setState(UI.ActionStatus.DEFAULT);
                    }, _this5.options.onCompete || 1000);
                }
            });
        }
    }]);
    return AjaxButton;
}(UI.StateButton);

UI.RadioButtonGroup = function (_BootstrapMixin2) {
    inherits(RadioButtonGroup, _BootstrapMixin2);

    function RadioButtonGroup() {
        classCallCheck(this, RadioButtonGroup);
        return possibleConstructorReturn(this, (RadioButtonGroup.__proto__ || Object.getPrototypeOf(RadioButtonGroup)).apply(this, arguments));
    }

    createClass(RadioButtonGroup, [{
        key: "renderHTML",
        value: function renderHTML() {
            var _this7 = this;

            this.buttons = [];

            var _loop = function _loop(i) {
                var handler = function handler() {
                    _this7.setIndex(i);
                };
                _this7.buttons.push(UI.createElement(UI.Button, { key: i, onClick: handler, label: _this7.options.givenOptions[i].toString(), level: _this7.options.buttonsLevel }));
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
            this.index = index;
            this.dispatch("setIndex", { value: this.options.givenOptions[index] });
        }
    }]);
    return RadioButtonGroup;
}(BootstrapMixin(UI.Element, "btn-group"));

UI.BootstrapLabel = function (_BootstrapMixin3) {
    inherits(BootstrapLabel, _BootstrapMixin3);

    function BootstrapLabel() {
        classCallCheck(this, BootstrapLabel);
        return possibleConstructorReturn(this, (BootstrapLabel.__proto__ || Object.getPrototypeOf(BootstrapLabel)).apply(this, arguments));
    }

    createClass(BootstrapLabel, [{
        key: "getPrimitiveTag",
        value: function getPrimitiveTag() {
            return "span";
        }
    }, {
        key: "getDOMAttributes",
        value: function getDOMAttributes() {
            var attr = get$1(BootstrapLabel.prototype.__proto__ || Object.getPrototypeOf(BootstrapLabel.prototype), "getDOMAttributes", this).call(this);
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
        key: "renderHTML",
        value: function renderHTML() {
            return [this.options.label];
        }
    }]);
    return BootstrapLabel;
}(BootstrapMixin(UI.Element, "label"));

UI.CardPanel = function (_BootstrapMixin4) {
    inherits(CardPanel, _BootstrapMixin4);

    function CardPanel() {
        classCallCheck(this, CardPanel);
        return possibleConstructorReturn(this, (CardPanel.__proto__ || Object.getPrototypeOf(CardPanel)).apply(this, arguments));
    }

    createClass(CardPanel, [{
        key: "setOptions",
        value: function setOptions(options) {
            get$1(CardPanel.prototype.__proto__ || Object.getPrototypeOf(CardPanel.prototype), "setOptions", this).call(this, options);
            this.options.level = this.options.level || UI.Level.DEFAULT;
        }
    }, {
        key: "renderHTML",
        value: function renderHTML() {
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
}(BootstrapMixin(UI.Element, "panel"));

//TODO: remove all bootstrap logic
UI.CollapsiblePanel = function (_UI$CardPanel) {
    inherits(CollapsiblePanel, _UI$CardPanel);

    function CollapsiblePanel(options) {
        classCallCheck(this, CollapsiblePanel);

        // If options.collapsed is set, use that value. otherwise it is collapsed
        var _this10 = possibleConstructorReturn(this, (CollapsiblePanel.__proto__ || Object.getPrototypeOf(CollapsiblePanel)).call(this, options));

        _this10.collapsed = options.collapsed != null ? options.collapsed : true;
        return _this10;
    }

    createClass(CollapsiblePanel, [{
        key: "onMount",
        value: function onMount() {
            var _this11 = this;

            this.expandLink.addClickListener(function () {
                if (_this11.collapsed) {
                    _this11.collapsed = false;
                } else {
                    _this11.collapsed = true;
                }
            });
        }
    }, {
        key: "renderHTML",
        value: function renderHTML() {
            var bodyId = "body" + this.uniqueId();
            var collapsedHeaderClass = "";
            var collapsedBodyClass = " in";
            var autoHeightClass = "";
            if (this.options.autoHeight) {
                autoHeightClass = "auto-height ";
            }
            if (this.collapsed) {
                collapsedHeaderClass = " collapsed";
                collapsedBodyClass = "";
            }

            return [UI.createElement(
                "div",
                { className: "panel-heading", role: "tab" },
                UI.createElement(
                    "h4",
                    { className: "panel-title" },
                    UI.createElement(
                        "a",
                        { ref: "expandLink", "data-toggle": "collapse", href: "#" + bodyId, className: "panelCollapseButton" + collapsedHeaderClass,
                            "aria-expanded": "true", "aria-controls": bodyId },
                        this.getTitle()
                    )
                )
            ), UI.createElement(
                "div",
                { ref: "contentArea", id: bodyId, className: autoHeightClass + "panel-collapse collapse" + collapsedBodyClass,
                    role: "tabpanel", "aria-expanded": "false" },
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
            var _this13 = this;

            this.expandLink.addClickListener(function () {
                if (!_this13._haveExpanded) {
                    _this13._haveExpanded = true;
                    UI.renderingStack.push(_this13);
                    _this13.contentArea.options.children = _this13.getGivenChildren();
                    UI.renderingStack.pop();
                    _this13.contentArea.redraw();
                    _this13.delayedMount();
                }
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

UI.ProgressBar = function (_BootstrapMixin5) {
    inherits(ProgressBar, _BootstrapMixin5);

    function ProgressBar() {
        classCallCheck(this, ProgressBar);
        return possibleConstructorReturn(this, (ProgressBar.__proto__ || Object.getPrototypeOf(ProgressBar)).apply(this, arguments));
    }

    createClass(ProgressBar, [{
        key: "renderHTML",
        value: function renderHTML() {
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
UI.CodeEditor = function (_UI$Element) {
    inherits(CodeEditor, _UI$Element);

    function CodeEditor() {
        classCallCheck(this, CodeEditor);
        return possibleConstructorReturn(this, (CodeEditor.__proto__ || Object.getPrototypeOf(CodeEditor)).apply(this, arguments));
    }

    createClass(CodeEditor, [{
        key: "setOptions",
        value: function setOptions(options) {
            get$1(CodeEditor.prototype.__proto__ || Object.getPrototypeOf(CodeEditor.prototype), "setOptions", this).call(this, options);
            if (this.ace) {
                this.applyAceOptions();
            }
        }
    }, {
        key: "applyAceOptions",
        value: function applyAceOptions() {
            var _this2 = this;

            //set the language mode
            this.ace.getSession().setMode("ace/mode/" + (this.options.aceMode || "text"));

            var defaultOptions = {
                readOnly: false,
                aceTheme: "dawn",
                fontSize: 14,
                tabSize: 4,
                showLineNumber: true,
                showPrintMargin: false,
                printMarginSize: 80
            };
            this.options = Object.assign(defaultOptions, this.options);
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
            var langTools = "/static/js/ext/ace/ext-language_tools.js";
            require([langTools], function () {
                _this2.setBasicAutocompletion(_this2.options.enableBasicAutocompletion);
                _this2.setLiveAutocompletion(_this2.options.enableLiveAutocompletion);
                _this2.setSnippets(_this2.options.enableSnippets);
            });
        }
    }, {
        key: "redraw",
        value: function redraw() {
            if (this.ace) {
                this.ace.resize();
                return;
            }
            get$1(CodeEditor.prototype.__proto__ || Object.getPrototypeOf(CodeEditor.prototype), "redraw", this).call(this);
        }
    }, {
        key: "onMount",
        value: function onMount() {
            var _this3 = this;

            if (!window.ace) {
                console.error("You need to have the ace library loaded to get this working");
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
        key: "onMount",
        value: function onMount() {
            get$1(StaticCodeHighlighter.prototype.__proto__ || Object.getPrototypeOf(StaticCodeHighlighter.prototype), "onMount", this).call(this);
            //default font
            this.ace.setFontSize(this.options.fontSize || this.getData("font-size", 13));
            // Make not editable by user
            this.setReadOnly(true);
            // Enable code wrapping
            this.ace.getSession().setUseWrapMode(true);
        }
    }]);
    return StaticCodeHighlighter;
}(UI.CodeEditor);

// Mixin classes
// Generic UI widget classes
// TODO: these next files should not be globally imported

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
        key: "update",


        // By default, applying an event just shallow copies the fields from event.data
        value: function update(event) {
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

// Not going to use promises until they mature
var Ajax = {};

Ajax.rawRequest = function (options) {
    // TODO: see this through, this is the last external dependency in the library
    return $.ajax(options);
};

Ajax.request = function (options) {
    options = Object.assign({
        // TODO: this should be in request header, like django recommends
        csrfmiddlewaretoken: CSRF_TOKEN,
        dataType: "json"
    }, options);

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
    options = Object.assign({
        type: "POST"
    }, options);

    return Ajax.request(options);
};

Ajax.get = function (options) {
    options = Object.assign({
        type: "GET"
    }, options);

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
                if (!this.id.startsWith("temp-")) {
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
            value: function applyUpdateObjectId(object, event) {
                var oldId = object.id;
                object.updateId(event.objectId);
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
                        this.applyUpdateObjectId(existingVirtualObject, event);
                    }
                }

                return get$1(VirtualStoreMixin.prototype.__proto__ || Object.getPrototypeOf(VirtualStoreMixin.prototype), "applyCreateEvent", this).apply(this, arguments);
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

// Mixin class meant for easier adding listeners to store objects, while also adding those listeners to cleanup jobs
// Should probably be used by UI elements that want to add listeners to store objects
// BaseClass needs to implement addCleanupTask
var StateSubscribableMixin = function StateSubscribableMixin(BaseClass) {
    return function (_BaseClass) {
        inherits(StateSubscribableMixin, _BaseClass);

        function StateSubscribableMixin() {
            classCallCheck(this, StateSubscribableMixin);
            return possibleConstructorReturn(this, (StateSubscribableMixin.__proto__ || Object.getPrototypeOf(StateSubscribableMixin)).apply(this, arguments));
        }

        createClass(StateSubscribableMixin, [{
            key: "attachListener",
            value: function attachListener(obj, eventName, callback) {
                this.addCleanupTask(obj.addListener(eventName, callback));
            }
        }, {
            key: "attachUpdateListener",
            value: function attachUpdateListener(obj, callback) {
                this.addCleanupTask(obj.addUpdateListener(callback));
            }
        }, {
            key: "attachCreateListener",
            value: function attachCreateListener(obj, callback) {
                this.addCleanupTask(obj.addCreateListener(callback));
            }
        }, {
            key: "attachDeleteListener",
            value: function attachDeleteListener(obj, callback) {
                this.addCleanupTask(obj.addDeleteListener(callback));
            }
        }, {
            key: "attachEventListener",
            value: function attachEventListener(obj, eventType, callback) {
                this.addCleanupTask(obj.addEventListener(eventType, callback));
            }
        }]);
        return StateSubscribableMixin;
    }(BaseClass);
};

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
                // Move either descending or ascending, to not overwrite values
                if (_optimalOffset < this._offset) {
                    for (var _i = 0; _i < length; _i += 1) {
                        this._values[_i + _optimalOffset] = this._values[_i + this._offset];
                    }
                } else {
                    for (var _i2 = length - 1; _i2 >= 0; _i2 -= 1) {
                        this._values[_i2 + _optimalOffset] = this._values[_i2 + this._offset];
                    }
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
exports.StateClass = StateClass;
exports.GlobalState = GlobalState$1;
exports.StoreObject = StoreObject;
exports.BaseStore = BaseStore;
exports.GenericObjectStore = GenericObjectStore;
exports.SingletonStore = SingletonStore;
exports.AjaxFetchMixin = AjaxFetchMixin;
exports.VirtualStoreMixin = VirtualStoreMixin;
exports.VirtualStoreObjectMixin = VirtualStoreObjectMixin;
exports.StateSubscribableMixin = StateSubscribableMixin;
exports.Dispatcher = Dispatcher;
exports.Dispatchable = Dispatchable;
exports.RunOnce = RunOnce;
exports.CleanupJobs = CleanupJobs;
exports.CleanupMixin = CleanupMixin;
exports.Ajax = Ajax;
exports.Plugin = Plugin;
exports.Pluginable = Pluginable;
exports.unwrapArray = unwrapArray;
exports.splitInChunks = splitInChunks;
exports.isIterable = isIterable;
exports.defaultComparator = defaultComparator;
exports.URLRouter = URLRouter;
exports.Deque = Deque;

Object.defineProperty(exports, '__esModule', { value: true });

})));
