define(["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

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
                var _step2$value = _slicedToArray(_step2.value, 2),
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

            _classCallCheck(this, DOMAttributes);

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

        _createClass(DOMAttributes, [{
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
                var _iteratorNormalCompletion5 = true;
                var _didIteratorError5 = false;
                var _iteratorError5 = undefined;

                try {
                    //TODO: attributes and styles should be synched (remove missing ones)
                    for (var _iterator5 = this.attributes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                        var _step5$value = _slicedToArray(_step5.value, 2),
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
                            var _step6$value = _slicedToArray(_step6.value, 2),
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

    exports.CreateAllowedAttributesMap = CreateAllowedAttributesMap;
    exports.DOMAttributes = DOMAttributes;
    exports.ATTRIBUTE_NAMES_MAP = ATTRIBUTE_NAMES_MAP;
});
