define(["./UIBase", "../base/Device"], function (_UIBase, _Device) {
    "use strict";

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

    // options.orientation is the orientation of the divided elements
    _UIBase.UI.DividerBar = function (_UI$Element) {
        _inherits(DividerBar, _UI$Element);

        function DividerBar(options) {
            _classCallCheck(this, DividerBar);

            var _this = _possibleConstructorReturn(this, (DividerBar.__proto__ || Object.getPrototypeOf(DividerBar)).call(this, options));

            _this.orientation = _this.options.orientation || _UIBase.UI.Orientation.HORIZONTAL;
            return _this;
        }

        _createClass(DividerBar, [{
            key: "getDOMAttributes",
            value: function getDOMAttributes() {
                var attr = _get(DividerBar.prototype.__proto__ || Object.getPrototypeOf(DividerBar.prototype), "getDOMAttributes", this).call(this);
                if (this.orientation === _UIBase.UI.Orientation.VERTICAL) {
                    attr.addClass("sectionDividerHorizontal");
                    attr.setStyle("width", "100%");
                } else if (this.orientation === _UIBase.UI.Orientation.HORIZONTAL) {
                    attr.addClass("sectionDividerVertical");
                    attr.setStyle("height", "100%");
                    attr.setStyle("display", "inline-block");
                }
                return attr;
            }
        }, {
            key: "renderHTML",
            value: function renderHTML() {
                if (this.orientation === _UIBase.UI.Orientation.VERTICAL) {
                    return [_UIBase.UI.createElement("div", { style: { height: "3px", width: "100%" } }), _UIBase.UI.createElement("div", { style: { height: "2px", width: "100%", background: "#DDD" } }), _UIBase.UI.createElement("div", { style: { height: "3px", width: "100%" } })];
                } else {
                    return [_UIBase.UI.createElement("div", { style: { width: "3px", display: "inline-block" } }), _UIBase.UI.createElement("div", { style: { width: "2px", height: "100%", background: "#DDD", display: "inline-block" } }), _UIBase.UI.createElement("div", { style: { width: "3px", display: "inline-block" } })];
                }
            }
        }]);

        return DividerBar;
    }(_UIBase.UI.Element);

    /* Divider class should take in:
        - Vertical or horizontal separation
        - All the children it's dividing
        - An option on how to redivide the sizes of the children
     */
    _UIBase.UI.SectionDivider = function (_UI$Element2) {
        _inherits(SectionDivider, _UI$Element2);

        function SectionDivider(options) {
            _classCallCheck(this, SectionDivider);

            var _this2 = _possibleConstructorReturn(this, (SectionDivider.__proto__ || Object.getPrototypeOf(SectionDivider)).call(this, options));

            _this2.orientation = _this2.options.orientation || _UIBase.UI.Orientation.VERTICAL;
            _this2.childrenSize = 0;
            _this2.uncollapsedSizes = new WeakMap();
            return _this2;
        }

        _createClass(SectionDivider, [{
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
                if (this.orientation === _UIBase.UI.Orientation.HORIZONTAL) {
                    return element.getWidth();
                } else {
                    return element.getHeight();
                }
            }
        }, {
            key: "setDimension",
            value: function setDimension(element, size) {
                if (this.orientation === _UIBase.UI.Orientation.HORIZONTAL) {
                    element.setWidth(size);
                } else {
                    element.setHeight(size);
                }
            }
        }, {
            key: "getMinDimension",
            value: function getMinDimension(element) {
                if (this.orientation === _UIBase.UI.Orientation.HORIZONTAL && element.options.hasOwnProperty("minWidth")) {
                    return element.options.minWidth;
                } else if (this.orientation === _UIBase.UI.Orientation.VERTICAL && element.options.hasOwnProperty("minHeight")) {
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
                            var currentX = _Device.Device.getEventX(event);
                            var currentY = _Device.Device.getEventY(event);

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

                                if (_this3.orientation === _UIBase.UI.Orientation.HORIZONTAL) {
                                    delta = _Device.Device.getEventX(event) - currentX;
                                } else if (_this3.orientation === _UIBase.UI.Orientation.VERTICAL) {
                                    delta = _Device.Device.getEventY(event) - currentY;
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

                                currentX = _Device.Device.getEventX(event);
                                currentY = _Device.Device.getEventY(event);
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
                return [this.dividedChildren(), _UIBase.UI.createElement(
                    _UIBase.UI.StyleElement,
                    null,
                    _UIBase.UI.createElement(_UIBase.UI.StyleInstance, { selector: ".sectionDividerHorizontal:hover", attributes: { "cursor": "row-resize" } }),
                    _UIBase.UI.createElement(_UIBase.UI.StyleInstance, { selector: ".sectionDividerVertical:hover", attributes: { "cursor": "col-resize" } })
                )];
            }
        }, {
            key: "redraw",
            value: function redraw() {
                _get(SectionDivider.prototype.__proto__ || Object.getPrototypeOf(SectionDivider.prototype), "redraw", this).call(this);
                // Safari bug fix
                if (this.orientation === _UIBase.UI.Orientation.HORIZONTAL) {
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
                            children.push(_UIBase.UI.createElement(_UIBase.UI.DividerBar, { ref: "divider" + this.dividers, orientation: this.orientation }));
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
    }(_UIBase.UI.Element);
});
