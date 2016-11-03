define(["UIBase", "Switcher"], function (_UIBase) {
    "use strict";

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

    _UIBase.UI.BasicTabTitle = function (_UI$Element) {
        _inherits(BasicTabTitle, _UI$Element);

        function BasicTabTitle() {
            _classCallCheck(this, BasicTabTitle);

            return _possibleConstructorReturn(this, (BasicTabTitle.__proto__ || Object.getPrototypeOf(BasicTabTitle)).apply(this, arguments));
        }

        _createClass(BasicTabTitle, [{
            key: "getPrimitiveTag",
            value: function getPrimitiveTag() {
                return "li";
            }
        }, {
            key: "getDOMAttributes",
            value: function getDOMAttributes() {
                var attr = _get(BasicTabTitle.prototype.__proto__ || Object.getPrototypeOf(BasicTabTitle.prototype), "getDOMAttributes", this).call(this);
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
                return [_UIBase.UI.createElement(
                    "a",
                    _extends({}, hrefOption, { className: "tabTitle unselectable pointer-cursor csa-tab" }),
                    _UIBase.UI.createElement(
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
    }(_UIBase.UI.Element);

    _UIBase.UI.TabTitleArea = function (_UI$Element2) {
        _inherits(TabTitleArea, _UI$Element2);

        function TabTitleArea(options) {
            _classCallCheck(this, TabTitleArea);

            var _this3 = _possibleConstructorReturn(this, (TabTitleArea.__proto__ || Object.getPrototypeOf(TabTitleArea)).call(this, options));

            _this3.activeTab = null;
            return _this3;
        }

        _createClass(TabTitleArea, [{
            key: "getDOMAttributes",
            value: function getDOMAttributes() {
                var attr = _get(TabTitleArea.prototype.__proto__ || Object.getPrototypeOf(TabTitleArea.prototype), "getDOMAttributes", this).call(this);
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
    }(_UIBase.UI.Element);

    // Inactive class for the moment, should extend UI.BasicTabTitle
    _UIBase.UI.SVGTabTitle = function (_UI$Element3) {
        _inherits(SVGTabTitle, _UI$Element3);

        function SVGTabTitle() {
            _classCallCheck(this, SVGTabTitle);

            return _possibleConstructorReturn(this, (SVGTabTitle.__proto__ || Object.getPrototypeOf(SVGTabTitle)).apply(this, arguments));
        }

        _createClass(SVGTabTitle, [{
            key: "setOptions",
            value: function setOptions(options) {
                _get(SVGTabTitle.prototype.__proto__ || Object.getPrototypeOf(SVGTabTitle.prototype), "setOptions", this).call(this, options);
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

                _get(SVGTabTitle.prototype.__proto__ || Object.getPrototypeOf(SVGTabTitle.prototype), "redraw", this).call(this);
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
                return [_UIBase.UI.createElement(
                    _UIBase.UI.SVG.SVGRoot,
                    { ref: "tabSvg", style: { width: "0px", height: "0px" } },
                    _UIBase.UI.createElement(_UIBase.UI.SVG.Path, { ref: "tabPath", d: "" })
                ),
                //TODO Rename this to labelPanel
                _UIBase.UI.createElement(
                    _UIBase.UI.Panel,
                    { ref: "tabTitle", style: { pointerEvents: "none", position: "absolute" } },
                    this.options.label
                )];
            }
        }]);

        return SVGTabTitle;
    }(_UIBase.UI.Element);

    _UIBase.UI.TabArea = function (_UI$Element4) {
        _inherits(TabArea, _UI$Element4);

        function TabArea(options) {
            _classCallCheck(this, TabArea);

            var _this7 = _possibleConstructorReturn(this, (TabArea.__proto__ || Object.getPrototypeOf(TabArea)).call(this, options));

            _this7.tabTitleMap = new WeakMap();
            return _this7;
        }

        _createClass(TabArea, [{
            key: "getDOMAttributes",
            value: function getDOMAttributes() {
                var attr = _get(TabArea.prototype.__proto__ || Object.getPrototypeOf(TabArea.prototype), "getDOMAttributes", this).call(this);
                if (!this.options.variableHeightPanels) {
                    attr.addClass("auto-height-parent");
                }
                return attr;
            }
        }, {
            key: "createTabPanel",
            value: function createTabPanel(panel) {
                var tab = _UIBase.UI.createElement(_UIBase.UI.BasicTabTitle, { panel: panel, active: panel.options.active, href: panel.options.tabHref });

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
                    _createTabPanel2 = _slicedToArray(_createTabPanel, 2),
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
                        _createTabPanel4 = _slicedToArray(_createTabPanel3, 2),
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
                return [_UIBase.UI.createElement(
                    _UIBase.UI.TabTitleArea,
                    { ref: "titleArea" },
                    tabTitles
                ), _UIBase.UI.createElement(
                    _UIBase.UI.Switcher,
                    { ref: "switcherArea", className: this.switcherClass },
                    tabPanels
                )];
            }
        }, {
            key: "redraw",
            value: function redraw() {
                _get(TabArea.prototype.__proto__ || Object.getPrototypeOf(TabArea.prototype), "redraw", this).call(this);
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
    }(_UIBase.UI.Element);
});
