define(["exports", "./UIBase", "../base/Dispatcher", "./DOMAttributes"], function (exports, _UIBase, _Dispatcher, _DOMAttributes) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.active = exports.focus = exports.hover = exports.wrapCSS = exports.styleMap = exports.ExclusiveClassSet = exports.StyleSet = exports.css = undefined;

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

    var _slicedToArray = function () {
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

    // TODO: should this be actually better done throught the dynamic CSS API, without doing through the DOM?
    _UIBase.UI.StyleInstance = function (_UI$TextElement) {
        _inherits(StyleInstance, _UI$TextElement);

        function StyleInstance(options) {
            _classCallCheck(this, StyleInstance);

            var _this = _possibleConstructorReturn(this, (StyleInstance.__proto__ || Object.getPrototypeOf(StyleInstance)).call(this, options));

            _this.setOptions(options);
            return _this;
        }

        _createClass(StyleInstance, [{
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
                        var _step$value = _slicedToArray(_step.value, 2),
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
    }(_UIBase.UI.TextElement);

    _UIBase.UI.StyleElement = function (_UI$Element) {
        _inherits(StyleElement, _UI$Element);

        function StyleElement() {
            _classCallCheck(this, StyleElement);

            return _possibleConstructorReturn(this, (StyleElement.__proto__ || Object.getPrototypeOf(StyleElement)).apply(this, arguments));
        }

        _createClass(StyleElement, [{
            key: "getPrimitiveTag",
            value: function getPrimitiveTag() {
                return "style";
            }
        }, {
            key: "getDOMAttributes",
            value: function getDOMAttributes() {
                // TODO: allow custom style attributes (media, scoped, etc)
                var attr = new _DOMAttributes.DOMAttributes({});
                attr.setAttribute("name", this.options.name);
                return attr;
            }
        }]);

        return StyleElement;
    }(_UIBase.UI.Element);

    var ALLOWED_SELECTOR_STARTS = new Set([":", ">", " ", "+", "~", "[", "."]);

    // TODO: figure out how to work with animation frames, this only creates a wrapper class
    _UIBase.UI.DynamicStyleElement = function (_UI$StyleElement) {
        _inherits(DynamicStyleElement, _UI$StyleElement);

        function DynamicStyleElement() {
            _classCallCheck(this, DynamicStyleElement);

            return _possibleConstructorReturn(this, (DynamicStyleElement.__proto__ || Object.getPrototypeOf(DynamicStyleElement)).apply(this, arguments));
        }

        _createClass(DynamicStyleElement, [{
            key: "toString",
            value: function toString() {
                return this.getClassName();
            }
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
                        result.push.apply(result, _toConsumableArray(subStyle));
                    }
                }

                if (haveOwnStyle) {
                    result.unshift(new _UIBase.UI.StyleInstance({ selector: selector, key: selector, attributes: ownStyle }));
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
    }(_UIBase.UI.StyleElement);

    // Class meant to group multiple classes inside a single <style> element, for convenience

    var StyleSet = function (_Dispatchable) {
        _inherits(StyleSet, _Dispatchable);

        function StyleSet() {
            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            _classCallCheck(this, StyleSet);

            var _this4 = _possibleConstructorReturn(this, (StyleSet.__proto__ || Object.getPrototypeOf(StyleSet)).call(this));

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
            _this4.styleElement = _UIBase.UI.StyleElement.create(document.head, styleElementOptions);
            return _this4;
        }

        _createClass(StyleSet, [{
            key: "css",
            value: function css(style) {
                if (arguments.length > 1) {
                    style = Object.assign.apply(Object, [{}].concat(Array.prototype.slice.call(arguments)));
                }
                var element = new _UIBase.UI.DynamicStyleElement({ style: style });
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

                        if (value instanceof _UIBase.UI.StyleElement) {
                            var styleElements = value.renderHTML();
                            children.push.apply(children, _toConsumableArray(styleElements));
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
    }(_Dispatcher.Dispatchable);

    var ExclusiveClassSet = function () {
        function ExclusiveClassSet(classList, element) {
            _classCallCheck(this, ExclusiveClassSet);

            // TODO: check that classList is an array (or at least iterable)
            this.classList = classList;
            this.element = element;
        }

        _createClass(ExclusiveClassSet, [{
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
            styleWrapper = _UIBase.UI.DynamicStyleElement.create(document.body, { style: style });
            styleMap.set(style, styleWrapper);
        }
        return styleWrapper;
    }

    exports.css = css;
    exports.StyleSet = StyleSet;
    exports.ExclusiveClassSet = ExclusiveClassSet;
    exports.styleMap = styleMap;
    exports.wrapCSS = wrapCSS;
    exports.hover = hover;
    exports.focus = focus;
    exports.active = active;
});
