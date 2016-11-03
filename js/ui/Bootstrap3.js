define(["exports", "UIBase", "UIPrimitives"], function (exports, _UIBase) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.BootstrapMixin = undefined;

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

    function BootstrapMixin(BaseClass, bootstrapClassName) {
        var BootstrapClass = function (_BaseClass) {
            _inherits(BootstrapClass, _BaseClass);

            function BootstrapClass() {
                _classCallCheck(this, BootstrapClass);

                return _possibleConstructorReturn(this, (BootstrapClass.__proto__ || Object.getPrototypeOf(BootstrapClass)).apply(this, arguments));
            }

            _createClass(BootstrapClass, [{
                key: "setOptions",
                value: function setOptions(options) {
                    _get(BootstrapClass.prototype.__proto__ || Object.getPrototypeOf(BootstrapClass.prototype), "setOptions", this).call(this, options);
                    this.options.level = this.options.level || _UIBase.UI.Level.DEFAULT;
                }
            }, {
                key: "getDOMAttributes",
                value: function getDOMAttributes() {
                    var attr = _get(BootstrapClass.prototype.__proto__ || Object.getPrototypeOf(BootstrapClass.prototype), "getDOMAttributes", this).call(this);

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

    _UIBase.UI.Button = function (_BootstrapMixin) {
        _inherits(Button, _BootstrapMixin);

        function Button() {
            _classCallCheck(this, Button);

            return _possibleConstructorReturn(this, (Button.__proto__ || Object.getPrototypeOf(Button)).apply(this, arguments));
        }

        _createClass(Button, [{
            key: "getDOMAttributes",
            value: function getDOMAttributes() {
                var attr = _get(Button.prototype.__proto__ || Object.getPrototypeOf(Button.prototype), "getDOMAttributes", this).call(this);

                if (this.getSize()) {
                    attr.addClass(this.constructor.bootstrapClass() + "-" + this.getSize());
                }

                return attr;
            }
        }, {
            key: "setOptions",
            value: function setOptions(options) {
                _get(Button.prototype.__proto__ || Object.getPrototypeOf(Button.prototype), "setOptions", this).call(this, options);
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

                return _UIBase.UI.createElement("span", iconOptions);
            }
        }]);

        return Button;
    }(BootstrapMixin(_UIBase.UI.Element, "btn"));

    _UIBase.UI.StateButton = function (_UI$Button) {
        _inherits(StateButton, _UI$Button);

        function StateButton() {
            _classCallCheck(this, StateButton);

            return _possibleConstructorReturn(this, (StateButton.__proto__ || Object.getPrototypeOf(StateButton)).apply(this, arguments));
        }

        _createClass(StateButton, [{
            key: "setOptions",
            value: function setOptions(options) {
                options.state = this.options.state || options.state || _UIBase.UI.ActionStatus.DEFAULT;

                _get(StateButton.prototype.__proto__ || Object.getPrototypeOf(StateButton.prototype), "setOptions", this).call(this, options);

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
                if (status === _UIBase.UI.ActionStatus.DEFAULT) {
                    this.enable();
                } else if (status === _UIBase.UI.ActionStatus.RUNNING) {
                    this.disable();
                } else if (status === _UIBase.UI.ActionStatus.SUCCESS) {} else if (status === _UIBase.UI.ActionStatus.FAILED) {}

                this.redraw();
            }
        }, {
            key: "renderHTML",
            value: function renderHTML() {
                var stateOptions = this.options.statusOptions[this.options.state - 1];

                this.options.label = stateOptions.label;
                this.options.faIcon = stateOptions.faIcon;

                return _get(StateButton.prototype.__proto__ || Object.getPrototypeOf(StateButton.prototype), "renderHTML", this).call(this);
            }
        }]);

        return StateButton;
    }(_UIBase.UI.Button);

    _UIBase.UI.AjaxButton = function (_UI$StateButton) {
        _inherits(AjaxButton, _UI$StateButton);

        function AjaxButton() {
            _classCallCheck(this, AjaxButton);

            return _possibleConstructorReturn(this, (AjaxButton.__proto__ || Object.getPrototypeOf(AjaxButton)).apply(this, arguments));
        }

        _createClass(AjaxButton, [{
            key: "ajaxCall",
            value: function ajaxCall(data) {
                var _this5 = this;

                this.setState(_UIBase.UI.ActionStatus.RUNNING);
                $.ajax({
                    url: data.url,
                    type: data.type,
                    dataType: data.dataType,
                    data: data.data,
                    success: function success(successData) {
                        data.success(successData);
                        if (successData.error) {
                            _this5.setState(_UIBase.UI.ActionStatus.FAILED);
                        } else {
                            _this5.setState(_UIBase.UI.ActionStatus.SUCCESS);
                        }
                    },
                    error: function error(xhr, errmsg, err) {
                        data.error(xhr, errmsg, err);
                        _this5.setState(_UIBase.UI.ActionStatus.FAILED);
                    },
                    complete: function complete() {
                        setTimeout(function () {
                            _this5.setState(_UIBase.UI.ActionStatus.DEFAULT);
                        }, _this5.options.onCompete || 1000);
                    }
                });
            }
        }]);

        return AjaxButton;
    }(_UIBase.UI.StateButton);

    _UIBase.UI.RadioButtonGroup = function (_BootstrapMixin2) {
        _inherits(RadioButtonGroup, _BootstrapMixin2);

        function RadioButtonGroup() {
            _classCallCheck(this, RadioButtonGroup);

            return _possibleConstructorReturn(this, (RadioButtonGroup.__proto__ || Object.getPrototypeOf(RadioButtonGroup)).apply(this, arguments));
        }

        _createClass(RadioButtonGroup, [{
            key: "renderHTML",
            value: function renderHTML() {
                var _this7 = this;

                this.buttons = [];

                var _loop = function _loop(i) {
                    var handler = function handler() {
                        _this7.setIndex(i);
                    };
                    _this7.buttons.push(_UIBase.UI.createElement(_UIBase.UI.Button, { key: i, onClick: handler, label: _this7.options.givenOptions[i].toString(), level: _this7.options.buttonsLevel }));
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
    }(BootstrapMixin(_UIBase.UI.Element, "btn-group"));

    _UIBase.UI.BootstrapLabel = function (_BootstrapMixin3) {
        _inherits(BootstrapLabel, _BootstrapMixin3);

        function BootstrapLabel() {
            _classCallCheck(this, BootstrapLabel);

            return _possibleConstructorReturn(this, (BootstrapLabel.__proto__ || Object.getPrototypeOf(BootstrapLabel)).apply(this, arguments));
        }

        _createClass(BootstrapLabel, [{
            key: "getPrimitiveTag",
            value: function getPrimitiveTag() {
                return "span";
            }
        }, {
            key: "getDOMAttributes",
            value: function getDOMAttributes() {
                var attr = _get(BootstrapLabel.prototype.__proto__ || Object.getPrototypeOf(BootstrapLabel.prototype), "getDOMAttributes", this).call(this);
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
    }(BootstrapMixin(_UIBase.UI.Element, "label"));

    _UIBase.UI.CardPanel = function (_BootstrapMixin4) {
        _inherits(CardPanel, _BootstrapMixin4);

        function CardPanel() {
            _classCallCheck(this, CardPanel);

            return _possibleConstructorReturn(this, (CardPanel.__proto__ || Object.getPrototypeOf(CardPanel)).apply(this, arguments));
        }

        _createClass(CardPanel, [{
            key: "setOptions",
            value: function setOptions(options) {
                _get(CardPanel.prototype.__proto__ || Object.getPrototypeOf(CardPanel.prototype), "setOptions", this).call(this, options);
                this.options.level = this.options.level || _UIBase.UI.Level.DEFAULT;
            }
        }, {
            key: "renderHTML",
            value: function renderHTML() {
                return [_UIBase.UI.createElement(
                    "div",
                    { className: "panel-heading" },
                    this.getTitle()
                ), _UIBase.UI.createElement(
                    "div",
                    { className: "panel-body", style: this.options.bodyStyle },
                    this.getGivenChildren()
                )];
            }
        }]);

        return CardPanel;
    }(BootstrapMixin(_UIBase.UI.Element, "panel"));

    //TODO: remove all bootstrap logic
    _UIBase.UI.CollapsiblePanel = function (_UI$CardPanel) {
        _inherits(CollapsiblePanel, _UI$CardPanel);

        function CollapsiblePanel(options) {
            _classCallCheck(this, CollapsiblePanel);

            var _this10 = _possibleConstructorReturn(this, (CollapsiblePanel.__proto__ || Object.getPrototypeOf(CollapsiblePanel)).call(this, options));

            // If options.collapsed is set, use that value. otherwise it is collapsed
            _this10.collapsed = options.collapsed != null ? options.collapsed : true;
            return _this10;
        }

        _createClass(CollapsiblePanel, [{
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

                return [_UIBase.UI.createElement(
                    "div",
                    { className: "panel-heading", role: "tab" },
                    _UIBase.UI.createElement(
                        "h4",
                        { className: "panel-title" },
                        _UIBase.UI.createElement(
                            "a",
                            { ref: "expandLink", "data-toggle": "collapse", href: "#" + bodyId, className: "panelCollapseButton" + collapsedHeaderClass,
                                "aria-expanded": "true", "aria-controls": bodyId },
                            this.getTitle()
                        )
                    )
                ), _UIBase.UI.createElement(
                    "div",
                    { ref: "contentArea", id: bodyId, className: autoHeightClass + "panel-collapse collapse" + collapsedBodyClass,
                        role: "tabpanel", "aria-expanded": "false" },
                    this.getGivenChildren()
                )];
            }
        }]);

        return CollapsiblePanel;
    }(_UIBase.UI.CardPanel);

    _UIBase.UI.DelayedCollapsiblePanel = function (_UI$CollapsiblePanel) {
        _inherits(DelayedCollapsiblePanel, _UI$CollapsiblePanel);

        function DelayedCollapsiblePanel() {
            _classCallCheck(this, DelayedCollapsiblePanel);

            return _possibleConstructorReturn(this, (DelayedCollapsiblePanel.__proto__ || Object.getPrototypeOf(DelayedCollapsiblePanel)).apply(this, arguments));
        }

        _createClass(DelayedCollapsiblePanel, [{
            key: "onMount",
            value: function onMount() {
                var _this13 = this;

                this.expandLink.addClickListener(function () {
                    if (!_this13._haveExpanded) {
                        _this13._haveExpanded = true;
                        _UIBase.UI.renderingStack.push(_this13);
                        _this13.contentArea.options.children = _this13.getGivenChildren();
                        _UIBase.UI.renderingStack.pop();
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
    }(_UIBase.UI.CollapsiblePanel);

    _UIBase.UI.ProgressBar = function (_BootstrapMixin5) {
        _inherits(ProgressBar, _BootstrapMixin5);

        function ProgressBar() {
            _classCallCheck(this, ProgressBar);

            return _possibleConstructorReturn(this, (ProgressBar.__proto__ || Object.getPrototypeOf(ProgressBar)).apply(this, arguments));
        }

        _createClass(ProgressBar, [{
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

                return _UIBase.UI.createElement(
                    "div",
                    barOptions,
                    _UIBase.UI.createElement(
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
    }(BootstrapMixin(_UIBase.UI.Element, "progress"));

    _UIBase.UI.BootstrapMixin = BootstrapMixin;

    exports.BootstrapMixin = BootstrapMixin;
});
