define(["UIBase", "Device", "Dispatcher", "Draggable"], function (_UIBase, _Device, _Dispatcher) {
    "use strict";

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

    _UIBase.UI.Orientation = {
        HORIZONTAL: 1,
        VERTICAL: 2
    };

    _UIBase.UI.Direction = {
        UP: "up",
        LEFT: "left",
        DOWN: "down",
        RIGHT: "right"
    };

    // TODO: move to Bootstrap file
    _UIBase.UI.Level = {
        NONE: null,
        DEFAULT: "default",
        INFO: "info",
        PRIMARY: "primary",
        SUCCESS: "success",
        WARNING: "warning",
        DANGER: "danger",
        ERROR: "danger"
    };

    _UIBase.UI.Size = {
        NONE: null,
        EXTRA_SMALL: "xs",
        SMALL: "sm",
        DEFAULT: "default",
        LARGE: "lg"
    };

    _UIBase.UI.VoteStatus = {
        NONE: null,
        LIKE: 1,
        DISLIKE: -1
    };

    _UIBase.UI.ActionStatus = {
        DEFAULT: 1,
        RUNNING: 2,
        SUCCESS: 3,
        FAILED: 4
    };

    //TODO: should panel be a generic element that just encapsulates something while exposing a title?
    _UIBase.UI.Panel = function (_UI$Element) {
        _inherits(Panel, _UI$Element);

        function Panel() {
            _classCallCheck(this, Panel);

            return _possibleConstructorReturn(this, (Panel.__proto__ || Object.getPrototypeOf(Panel)).apply(this, arguments));
        }

        _createClass(Panel, [{
            key: "getTitle",
            value: function getTitle() {
                return this.options.title;
            }
        }]);

        return Panel;
    }(_UIBase.UI.Element);

    _UIBase.UI.SlideBar = function (_UI$Draggable) {
        _inherits(SlideBar, _UI$Draggable);

        function SlideBar(options) {
            _classCallCheck(this, SlideBar);

            return _possibleConstructorReturn(this, (SlideBar.__proto__ || Object.getPrototypeOf(SlideBar)).call(this, options));
        }

        _createClass(SlideBar, [{
            key: "getDOMAttributes",
            value: function getDOMAttributes() {
                var attributes = _get(SlideBar.prototype.__proto__ || Object.getPrototypeOf(SlideBar.prototype), "getDOMAttributes", this).call(this);
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
                return [_UIBase.UI.createElement(_UIBase.UI.ProgressBar, { ref: "progressBar", active: "true", value: this.options.value, disableTransition: true,
                    style: {
                        height: "5px",
                        width: this.options.width + "px",
                        position: "relative",
                        top: "15px"
                    }
                }), _UIBase.UI.createElement("div", { ref: "slider", style: {
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
                        _this3.setValue((_Device.Device.getEventX(event) - _this3.progressBar.getOffset().left) / _this3.options.width);
                    },
                    onDrag: function onDrag(deltaX, deltaY) {
                        _this3.setValue(_this3.options.value + deltaX / _this3.options.width);
                    }
                });
            }
        }]);

        return SlideBar;
    }(_UIBase.UI.Draggable(_UIBase.UI.Element));

    _UIBase.UI.Link = function (_UI$Element2) {
        _inherits(Link, _UI$Element2);

        function Link() {
            _classCallCheck(this, Link);

            return _possibleConstructorReturn(this, (Link.__proto__ || Object.getPrototypeOf(Link)).apply(this, arguments));
        }

        _createClass(Link, [{
            key: "getPrimitiveTag",
            value: function getPrimitiveTag() {
                return "a";
            }
        }, {
            key: "getDOMAttributes",
            value: function getDOMAttributes() {
                var attr = _get(Link.prototype.__proto__ || Object.getPrototypeOf(Link.prototype), "getDOMAttributes", this).call(this);
                attr.setStyle("cursor", "pointer");
                return attr;
            }
        }, {
            key: "setOptions",
            value: function setOptions(options) {
                options = Object.assign({
                    newTab: true
                }, options);

                _get(Link.prototype.__proto__ || Object.getPrototypeOf(Link.prototype), "setOptions", this).call(this, options);

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
    }(_UIBase.UI.Element);

    _UIBase.UI.Image = function (_UI$Element3) {
        _inherits(Image, _UI$Element3);

        function Image() {
            _classCallCheck(this, Image);

            return _possibleConstructorReturn(this, (Image.__proto__ || Object.getPrototypeOf(Image)).apply(this, arguments));
        }

        _createClass(Image, [{
            key: "getPrimitiveTag",
            value: function getPrimitiveTag() {
                return "img";
            }
        }]);

        return Image;
    }(_UIBase.UI.Element);

    // Beware coder: If you ever use this class, you need to document why!
    _UIBase.UI.RawHTML = function (_UI$Element4) {
        _inherits(RawHTML, _UI$Element4);

        function RawHTML() {
            _classCallCheck(this, RawHTML);

            return _possibleConstructorReturn(this, (RawHTML.__proto__ || Object.getPrototypeOf(RawHTML)).apply(this, arguments));
        }

        _createClass(RawHTML, [{
            key: "redraw",
            value: function redraw() {
                this.node.innerHTML = this.options.__innerHTML;
                this.applyDOMAttributes();
            }
        }]);

        return RawHTML;
    }(_UIBase.UI.Element);

    _UIBase.UI.TemporaryMessageArea = function (_UI$Element5) {
        _inherits(TemporaryMessageArea, _UI$Element5);

        function TemporaryMessageArea() {
            _classCallCheck(this, TemporaryMessageArea);

            return _possibleConstructorReturn(this, (TemporaryMessageArea.__proto__ || Object.getPrototypeOf(TemporaryMessageArea)).apply(this, arguments));
        }

        _createClass(TemporaryMessageArea, [{
            key: "setOptions",
            value: function setOptions(options) {
                options = Object.assign(this.constructor.getDefaultOptions(), options);
                _get(TemporaryMessageArea.prototype.__proto__ || Object.getPrototypeOf(TemporaryMessageArea.prototype), "setOptions", this).call(this, options);
            }
        }, {
            key: "getPrimitiveTag",
            value: function getPrimitiveTag() {
                return "span";
            }
        }, {
            key: "renderHTML",
            value: function renderHTML() {
                return [_UIBase.UI.createElement(_UIBase.UI.TextElement, { ref: "textElement", value: this.options.value || "" })];
            }
        }, {
            key: "getDOMAttributes",
            value: function getDOMAttributes() {
                var attr = _get(TemporaryMessageArea.prototype.__proto__ || Object.getPrototypeOf(TemporaryMessageArea.prototype), "getDOMAttributes", this).call(this);
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
    }(_UIBase.UI.Element);

    // Just putting in a lot of methods, to try to think of an interface
    _UIBase.UI.ScrollableMixin = function (_UI$Element6) {
        _inherits(ScrollableMixin, _UI$Element6);

        function ScrollableMixin() {
            _classCallCheck(this, ScrollableMixin);

            return _possibleConstructorReturn(this, (ScrollableMixin.__proto__ || Object.getPrototypeOf(ScrollableMixin)).apply(this, arguments));
        }

        _createClass(ScrollableMixin, [{
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
    }(_UIBase.UI.Element);

    //TODO: this class would need some binary searches
    _UIBase.UI.InfiniteScrollable = function (_UI$ScrollableMixin) {
        _inherits(InfiniteScrollable, _UI$ScrollableMixin);

        function InfiniteScrollable() {
            _classCallCheck(this, InfiniteScrollable);

            return _possibleConstructorReturn(this, (InfiniteScrollable.__proto__ || Object.getPrototypeOf(InfiniteScrollable)).apply(this, arguments));
        }

        _createClass(InfiniteScrollable, [{
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
                _get(InfiniteScrollable.prototype.__proto__ || Object.getPrototypeOf(InfiniteScrollable.prototype), "setOptions", this).call(this, options);
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
    }(_UIBase.UI.ScrollableMixin);

    _UIBase.UI.TimePassedSpan = function (_UI$Element7) {
        _inherits(TimePassedSpan, _UI$Element7);

        function TimePassedSpan() {
            _classCallCheck(this, TimePassedSpan);

            return _possibleConstructorReturn(this, (TimePassedSpan.__proto__ || Object.getPrototypeOf(TimePassedSpan)).apply(this, arguments));
        }

        _createClass(TimePassedSpan, [{
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
                var attr = _get(TimePassedSpan.prototype.__proto__ || Object.getPrototypeOf(TimePassedSpan.prototype), "getDOMAttributes", this).call(this);
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
                    this.TIME_DISPATCHER = new _Dispatcher.Dispatchable();
                    this.updateFunction = setInterval(function () {
                        _this13.TIME_DISPATCHER.dispatch("updateTimeValue");
                    }, 5000);
                }
                this.TIME_DISPATCHER.addListener("updateTimeValue", callback);
            }
        }]);

        return TimePassedSpan;
    }(_UIBase.UI.Element);

    _UIBase.UI.ConstructorInitMixin = function (BaseClass) {
        var ConstructorInitMixin = function (_BaseClass) {
            _inherits(ConstructorInitMixin, _BaseClass);

            function ConstructorInitMixin() {
                _classCallCheck(this, ConstructorInitMixin);

                return _possibleConstructorReturn(this, (ConstructorInitMixin.__proto__ || Object.getPrototypeOf(ConstructorInitMixin)).apply(this, arguments));
            }

            _createClass(ConstructorInitMixin, [{
                key: "createNode",
                value: function createNode() {
                    this.constructor.ensureInit();
                    return _get(ConstructorInitMixin.prototype.__proto__ || Object.getPrototypeOf(ConstructorInitMixin.prototype), "createNode", this).call(this);
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

        ;

        return ConstructorInitMixin;
    };

    _UIBase.UI.body = new _UIBase.UI.Element();
    _UIBase.UI.body.node = document.body;
});
