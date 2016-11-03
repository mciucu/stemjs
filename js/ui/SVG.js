define(["exports", "UIBase", "math", "DOMAttributes", "Color", "Transition", "UIPrimitives"], function (exports, _UIBase, _math, _DOMAttributes, _Color, _Transition) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.SVG = undefined;

    var math = _interopRequireWildcard(_math);

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

    _UIBase.UI.SVG = {};

    var FIREFOX_SVG_STYLE_ELEMENTS = ["width", "height", "rx", "ry", "cx", "cy", "x", "y"];

    _UIBase.UI.SVG.Element = function (_UI$Element) {
        _inherits(SVGElement, _UI$Element);

        function SVGElement() {
            _classCallCheck(this, SVGElement);

            return _possibleConstructorReturn(this, (SVGElement.__proto__ || Object.getPrototypeOf(SVGElement)).apply(this, arguments));
        }

        _createClass(SVGElement, [{
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

                _get(SVGElement.prototype.__proto__ || Object.getPrototypeOf(SVGElement.prototype), "setOptions", this).call(this, options);
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
                _get(SVGElement.prototype.__proto__ || Object.getPrototypeOf(SVGElement.prototype), "setStyle", this).call(this, attributeName, value);
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
                var attr = _get(SVGElement.prototype.__proto__ || Object.getPrototypeOf(SVGElement.prototype), "getDOMAttributes", this).call(this);
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
                return new _Transition.Transition({
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
                return new _Transition.Transition({
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

                return new _Transition.Transition({
                    func: function func(t, context) {
                        _this4.setColor(_Color.Color.interpolate(context.color, color, t));
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
    }(_UIBase.UI.Element);

    _UIBase.UI.SVG.Element.domAttributesMap = (0, _DOMAttributes.CreateAllowedAttributesMap)(_UIBase.UI.Element.domAttributesMap, [["fill"], ["height"], ["opacity"], ["stroke"], ["strokeWidth", { domName: "stroke-width" }], ["clipPath", { domName: "clip-path" }], ["transform"], ["width"], ["cx"], ["cy"], ["rx"], ["ry"], ["x"], ["y"], ["offset"], ["stopColor", { domName: "stop-color" }], ["strokeDasharray", { domName: "stroke-dasharray" }], ["strokeLinecap", { domName: "stroke-linecap" }]]);

    _UIBase.UI.SVG.SVGRoot = function (_UI$SVG$Element) {
        _inherits(SVGRoot, _UI$SVG$Element);

        function SVGRoot() {
            _classCallCheck(this, SVGRoot);

            return _possibleConstructorReturn(this, (SVGRoot.__proto__ || Object.getPrototypeOf(SVGRoot)).apply(this, arguments));
        }

        _createClass(SVGRoot, [{
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
    }(_UIBase.UI.SVG.Element);

    _UIBase.UI.SVG.RawSVG = function (_UI$SVG$SVGRoot) {
        _inherits(RawSVG, _UI$SVG$SVGRoot);

        function RawSVG() {
            _classCallCheck(this, RawSVG);

            return _possibleConstructorReturn(this, (RawSVG.__proto__ || Object.getPrototypeOf(RawSVG)).apply(this, arguments));
        }

        _createClass(RawSVG, [{
            key: "redraw",
            value: function redraw() {
                _get(RawSVG.prototype.__proto__ || Object.getPrototypeOf(RawSVG.prototype), "redraw", this).call(this);
                this.node.innerHTML = this.options.innerHTML;
            }
        }]);

        return RawSVG;
    }(_UIBase.UI.SVG.SVGRoot);

    _UIBase.UI.SVG.Group = function (_UI$SVG$Element2) {
        _inherits(SVGGroup, _UI$SVG$Element2);

        function SVGGroup() {
            _classCallCheck(this, SVGGroup);

            return _possibleConstructorReturn(this, (SVGGroup.__proto__ || Object.getPrototypeOf(SVGGroup)).apply(this, arguments));
        }

        _createClass(SVGGroup, [{
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
    }(_UIBase.UI.SVG.Element);

    _UIBase.UI.SVG.Defs = function (_UI$SVG$Element3) {
        _inherits(SVGDefs, _UI$SVG$Element3);

        function SVGDefs() {
            _classCallCheck(this, SVGDefs);

            return _possibleConstructorReturn(this, (SVGDefs.__proto__ || Object.getPrototypeOf(SVGDefs)).apply(this, arguments));
        }

        _createClass(SVGDefs, [{
            key: "getPrimitiveTag",
            value: function getPrimitiveTag() {
                return "defs";
            }
        }]);

        return SVGDefs;
    }(_UIBase.UI.SVG.Element);

    _UIBase.UI.SVG.ClipPath = function (_UI$SVG$Element4) {
        _inherits(ClipPath, _UI$SVG$Element4);

        function ClipPath() {
            _classCallCheck(this, ClipPath);

            return _possibleConstructorReturn(this, (ClipPath.__proto__ || Object.getPrototypeOf(ClipPath)).apply(this, arguments));
        }

        _createClass(ClipPath, [{
            key: "getPrimitiveTag",
            value: function getPrimitiveTag() {
                return "clipPath";
            }
        }]);

        return ClipPath;
    }(_UIBase.UI.SVG.Element);

    _UIBase.UI.SVG.Path = function (_UI$SVG$Element5) {
        _inherits(SVGPath, _UI$SVG$Element5);

        function SVGPath() {
            _classCallCheck(this, SVGPath);

            return _possibleConstructorReturn(this, (SVGPath.__proto__ || Object.getPrototypeOf(SVGPath)).apply(this, arguments));
        }

        _createClass(SVGPath, [{
            key: "getPrimitiveTag",
            value: function getPrimitiveTag() {
                return "path";
            }
        }, {
            key: "getDOMAttributes",
            value: function getDOMAttributes() {
                var attr = _get(SVGPath.prototype.__proto__ || Object.getPrototypeOf(SVGPath.prototype), "getDOMAttributes", this).call(this);
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
    }(_UIBase.UI.SVG.Element);

    _UIBase.UI.SVG.Circle = function (_UI$SVG$Element6) {
        _inherits(SVGCircle, _UI$SVG$Element6);

        function SVGCircle() {
            _classCallCheck(this, SVGCircle);

            return _possibleConstructorReturn(this, (SVGCircle.__proto__ || Object.getPrototypeOf(SVGCircle)).apply(this, arguments));
        }

        _createClass(SVGCircle, [{
            key: "getPrimitiveTag",
            value: function getPrimitiveTag() {
                return "circle";
            }
        }, {
            key: "getDOMAttributes",
            value: function getDOMAttributes() {
                var attr = _get(SVGCircle.prototype.__proto__ || Object.getPrototypeOf(SVGCircle.prototype), "getDOMAttributes", this).call(this);
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
                return new _UIBase.UI.SVG.Path({ d: pathString });
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
    }(_UIBase.UI.SVG.Element);

    _UIBase.UI.SVG.HandDrawnCircle = function (_UI$SVG$Element7) {
        _inherits(SVGHandDrawnCircle, _UI$SVG$Element7);

        function SVGHandDrawnCircle() {
            _classCallCheck(this, SVGHandDrawnCircle);

            return _possibleConstructorReturn(this, (SVGHandDrawnCircle.__proto__ || Object.getPrototypeOf(SVGHandDrawnCircle)).apply(this, arguments));
        }

        _createClass(SVGHandDrawnCircle, [{
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
                var attr = _get(SVGHandDrawnCircle.prototype.__proto__ || Object.getPrototypeOf(SVGHandDrawnCircle.prototype), "getDOMAttributes", this).call(this);
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
    }(_UIBase.UI.SVG.Element);

    //TODO Complete this class
    _UIBase.UI.SVG.Ellipse = function (_UI$SVG$Element8) {
        _inherits(SVGEllipse, _UI$SVG$Element8);

        function SVGEllipse() {
            _classCallCheck(this, SVGEllipse);

            return _possibleConstructorReturn(this, (SVGEllipse.__proto__ || Object.getPrototypeOf(SVGEllipse)).apply(this, arguments));
        }

        _createClass(SVGEllipse, [{
            key: "getPrimitiveTag",
            value: function getPrimitiveTag() {
                return "ellipse";
            }
        }, {
            key: "getDOMAttributes",
            value: function getDOMAttributes() {
                var attr = _get(SVGEllipse.prototype.__proto__ || Object.getPrototypeOf(SVGEllipse.prototype), "getDOMAttributes", this).call(this);
                attr.setAttribute("rx", this.options.rx);
                attr.setAttribute("ry", this.options.ry);
                return attr;
            }
        }]);

        return SVGEllipse;
    }(_UIBase.UI.SVG.Element);

    _UIBase.UI.SVG.CircleArc = function (_UI$SVG$Path) {
        _inherits(SVGCircleArc, _UI$SVG$Path);

        function SVGCircleArc() {
            _classCallCheck(this, SVGCircleArc);

            return _possibleConstructorReturn(this, (SVGCircleArc.__proto__ || Object.getPrototypeOf(SVGCircleArc)).apply(this, arguments));
        }

        _createClass(SVGCircleArc, [{
            key: "getPath",
            value: function getPath() {
                var startAngle = this.options.startAngle;
                var endAngle = this.options.endAngle;
                var radius = this.options.radius;
                var center = this.options.center;

                var angleDiff = endAngle - startAngle + (endAngle < startAngle ? 2 * Math.PI : 0);
                var startPoint = math.polarToCartesian(startAngle, radius, center);
                var endPoint = math.polarToCartesian(endAngle, radius, center);
                var sweepFlag;
                var largeArcFlag;

                // Set largeArcFlag and sweepFlag
                if (angleDiff <= Math.PI) {
                    largeArcFlag = 0;
                    if (math.crossProduct(startPoint, endPoint, center) <= 0) {
                        sweepFlag = 0;
                    } else {
                        sweepFlag = 1;
                    }
                } else {
                    largeArcFlag = 1;
                    if (math.crossProduct(startPoint, endPoint, center) <= 0) {
                        sweepFlag = 1;
                    } else {
                        sweepFlag = 0;
                    }
                }

                return "M " + startPoint.x + " " + startPoint.y + " A " + radius + " " + radius + " 0 " + largeArcFlag + " " + sweepFlag + " " + endPoint.x + " " + endPoint.y;
            }
        }]);

        return SVGCircleArc;
    }(_UIBase.UI.SVG.Path);

    _UIBase.UI.SVG.Rect = function (_UI$SVG$Element9) {
        _inherits(SVGRect, _UI$SVG$Element9);

        function SVGRect() {
            _classCallCheck(this, SVGRect);

            return _possibleConstructorReturn(this, (SVGRect.__proto__ || Object.getPrototypeOf(SVGRect)).apply(this, arguments));
        }

        _createClass(SVGRect, [{
            key: "getPrimitiveTag",
            value: function getPrimitiveTag() {
                return "rect";
            }
        }, {
            key: "getDOMAttributes",
            value: function getDOMAttributes() {
                var attr = _get(SVGRect.prototype.__proto__ || Object.getPrototypeOf(SVGRect.prototype), "getDOMAttributes", this).call(this);

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
    }(_UIBase.UI.SVG.Element);

    _UIBase.UI.SVG.Line = function (_UI$SVG$Element10) {
        _inherits(SVGLine, _UI$SVG$Element10);

        function SVGLine() {
            _classCallCheck(this, SVGLine);

            return _possibleConstructorReturn(this, (SVGLine.__proto__ || Object.getPrototypeOf(SVGLine)).apply(this, arguments));
        }

        _createClass(SVGLine, [{
            key: "getPrimitiveTag",
            value: function getPrimitiveTag() {
                return "line";
            }
        }, {
            key: "getDOMAttributes",
            value: function getDOMAttributes() {
                var attr = _get(SVGLine.prototype.__proto__ || Object.getPrototypeOf(SVGLine.prototype), "getDOMAttributes", this).call(this);

                attr.setAttribute("x1", this.options.x1);
                attr.setAttribute("y1", this.options.y1);
                attr.setAttribute("x2", this.options.x2);
                attr.setAttribute("y2", this.options.y2);

                return attr;
            }
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
    }(_UIBase.UI.SVG.Element);

    _UIBase.UI.SVG.Text = function (_UI$SVG$Element11) {
        _inherits(SVGText, _UI$SVG$Element11);

        function SVGText() {
            _classCallCheck(this, SVGText);

            return _possibleConstructorReturn(this, (SVGText.__proto__ || Object.getPrototypeOf(SVGText)).apply(this, arguments));
        }

        _createClass(SVGText, [{
            key: "getPrimitiveTag",
            value: function getPrimitiveTag() {
                return "text";
            }
        }, {
            key: "setOptions",
            value: function setOptions(options) {
                _get(SVGText.prototype.__proto__ || Object.getPrototypeOf(SVGText.prototype), "setOptions", this).call(this, options);
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
                var attr = _get(SVGText.prototype.__proto__ || Object.getPrototypeOf(SVGText.prototype), "getDOMAttributes", this).call(this);

                var allowedAttrNames = new Map([["dx", "dx"], ["dy", "dy"], ["fontSize", "font-size"], ["textAnchor", "text-anchor"], ["style", "style"]]);
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = allowedAttrNames[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var _step2$value = _slicedToArray(_step2.value, 2),
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
                return [_UIBase.UI.createElement(_UIBase.UI.TextElement, { ref: "textElement", value: this.options.text + "" })];
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

                return new _Transition.Transition({
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

                return new _Transition.Transition({
                    func: function func(t, context) {
                        _this19.setColor(_Color.Color.interpolate(context.color, color, t), true);
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
    }(_UIBase.UI.SVG.Element);

    _UIBase.UI.SVG.Text.domAttributesMap = (0, _DOMAttributes.CreateAllowedAttributesMap)(_UIBase.UI.SVG.Element.domAttributesMap, [["fontFamily", { domName: "font-family" }]]);

    _UIBase.UI.SVG.TextArea = function (_UI$SVG$Element12) {
        _inherits(SVGTextArea, _UI$SVG$Element12);

        function SVGTextArea() {
            _classCallCheck(this, SVGTextArea);

            return _possibleConstructorReturn(this, (SVGTextArea.__proto__ || Object.getPrototypeOf(SVGTextArea)).apply(this, arguments));
        }

        _createClass(SVGTextArea, [{
            key: "setOptions",
            value: function setOptions(options) {
                _get(SVGTextArea.prototype.__proto__ || Object.getPrototypeOf(SVGTextArea.prototype), "setOptions", this).call(this, options);
                this.rect = _UIBase.UI.createElement(_UIBase.UI.SVG.Rect, null);
                this.text = _UIBase.UI.createElement(_UIBase.UI.SVG.Text, null);
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
    }(_UIBase.UI.SVG.Element);

    _UIBase.UI.SVG.Polygon = function (_UI$SVG$Path2) {
        _inherits(Polygon, _UI$SVG$Path2);

        function Polygon() {
            _classCallCheck(this, Polygon);

            return _possibleConstructorReturn(this, (Polygon.__proto__ || Object.getPrototypeOf(Polygon)).apply(this, arguments));
        }

        _createClass(Polygon, [{
            key: "getDOMAttributes",
            value: function getDOMAttributes() {
                var attr = _get(Polygon.prototype.__proto__ || Object.getPrototypeOf(Polygon.prototype), "getDOMAttributes", this).call(this);
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
    }(_UIBase.UI.SVG.Path);

    // TODO: move this somewhere else
    _UIBase.UI.SVG.CSAIconPath = function (_UI$SVG$Path3) {
        _inherits(SVGCSAIconPath, _UI$SVG$Path3);

        function SVGCSAIconPath() {
            _classCallCheck(this, SVGCSAIconPath);

            return _possibleConstructorReturn(this, (SVGCSAIconPath.__proto__ || Object.getPrototypeOf(SVGCSAIconPath)).apply(this, arguments));
        }

        _createClass(SVGCSAIconPath, [{
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
    }(_UIBase.UI.SVG.Path);

    _UIBase.UI.SVG.CSAIconSVG = function (_UI$SVG$SVGRoot2) {
        _inherits(SVGCSAIconSVG, _UI$SVG$SVGRoot2);

        function SVGCSAIconSVG() {
            _classCallCheck(this, SVGCSAIconSVG);

            return _possibleConstructorReturn(this, (SVGCSAIconSVG.__proto__ || Object.getPrototypeOf(SVGCSAIconSVG)).apply(this, arguments));
        }

        _createClass(SVGCSAIconSVG, [{
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
                return [_UIBase.UI.createElement(_UIBase.UI.SVG.CSAIconPath, { size: this.options.size })];
            }
        }]);

        return SVGCSAIconSVG;
    }(_UIBase.UI.SVG.SVGRoot);

    var SVG = _UIBase.UI.SVG;

    exports.SVG = SVG;
});
