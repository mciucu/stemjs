define(["UIBase"], function (_UIBase) {
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

    _UIBase.UI.FloatingWindow = function (_UI$Element) {
        _inherits(FloatingWindow, _UI$Element);

        function FloatingWindow() {
            _classCallCheck(this, FloatingWindow);

            return _possibleConstructorReturn(this, (FloatingWindow.__proto__ || Object.getPrototypeOf(FloatingWindow)).apply(this, arguments));
        }

        _createClass(FloatingWindow, [{
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
                _get(FloatingWindow.prototype.__proto__ || Object.getPrototypeOf(FloatingWindow.prototype), "setOptions", this).call(this, options);
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

                return _UIBase.UI.createElement(
                    _UIBase.UI.StyleElement,
                    null,
                    _UIBase.UI.createElement(_UIBase.UI.StyleInstance, { selector: ".hidden-animated", attributes: hiddenStyleAttributes }),
                    _UIBase.UI.createElement(_UIBase.UI.StyleInstance, { selector: ".visible-animated", attributes: visibleStyleAttributes })
                );
            }
        }, {
            key: "getDOMAttributes",
            value: function getDOMAttributes() {
                var attr = _get(FloatingWindow.prototype.__proto__ || Object.getPrototypeOf(FloatingWindow.prototype), "getDOMAttributes", this).call(this);
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
    }(_UIBase.UI.Element);

    _UIBase.UI.VolatileFloatingWindow = function (_UI$FloatingWindow) {
        _inherits(VolatileFloatingWindow, _UI$FloatingWindow);

        function VolatileFloatingWindow() {
            _classCallCheck(this, VolatileFloatingWindow);

            return _possibleConstructorReturn(this, (VolatileFloatingWindow.__proto__ || Object.getPrototypeOf(VolatileFloatingWindow)).apply(this, arguments));
        }

        _createClass(VolatileFloatingWindow, [{
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
                    _get(VolatileFloatingWindow.prototype.__proto__ || Object.getPrototypeOf(VolatileFloatingWindow.prototype), "show", this).call(this);
                }
            }
        }, {
            key: "hide",
            value: function hide() {
                if (this.isInDOM()) {
                    this.unbindWindowListeners();
                    _get(VolatileFloatingWindow.prototype.__proto__ || Object.getPrototypeOf(VolatileFloatingWindow.prototype), "hide", this).call(this);
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
    }(_UIBase.UI.FloatingWindow);

    _UIBase.UI.Modal = function (_UI$Element2) {
        _inherits(Modal, _UI$Element2);

        function Modal() {
            _classCallCheck(this, Modal);

            return _possibleConstructorReturn(this, (Modal.__proto__ || Object.getPrototypeOf(Modal)).apply(this, arguments));
        }

        _createClass(Modal, [{
            key: "setOptions",
            value: function setOptions(options) {
                options = Object.assign(this.constructor.getDefaultOptions(), options);
                _get(Modal.prototype.__proto__ || Object.getPrototypeOf(Modal.prototype), "setOptions", this).call(this, options);
            }
        }, {
            key: "renderHTML",
            value: function renderHTML() {
                return [_UIBase.UI.createElement(
                    _UIBase.UI.Panel,
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
                return _UIBase.UI.createElement(_UIBase.UI.Panel, { ref: "behindPanel", className: "hidden-animated", style: this.getBehindPanelStyle() });
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
                    closeButton = _UIBase.UI.createElement(
                        "div",
                        { style: { position: "absolute", right: "10px", zIndex: "10" } },
                        _UIBase.UI.createElement(_UIBase.UI.Button, { type: "button", className: "close", "data-dismiss": "modal", "aria-label": "Close",
                            label: "×", onClick: function onClick() {
                                return _this7.hide();
                            } })
                    );
                }

                return _UIBase.UI.createElement(
                    _UIBase.UI.FloatingWindow,
                    { ref: "modalWindow", style: this.getModalWindowStyle() },
                    closeButton,
                    _UIBase.UI.createElement(
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

                _get(Modal.prototype.__proto__ || Object.getPrototypeOf(Modal.prototype), "onMount", this).call(this);
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
    }(_UIBase.UI.Element);

    _UIBase.UI.ErrorModal = function (_UI$Modal) {
        _inherits(ErrorModal, _UI$Modal);

        function ErrorModal() {
            _classCallCheck(this, ErrorModal);

            return _possibleConstructorReturn(this, (ErrorModal.__proto__ || Object.getPrototypeOf(ErrorModal)).apply(this, arguments));
        }

        _createClass(ErrorModal, [{
            key: "getGivenChildren",
            value: function getGivenChildren() {
                return [this.getHeader(), this.getBody(), this.getFooter()];
            }
        }, {
            key: "getHeader",
            value: function getHeader() {
                return [_UIBase.UI.createElement(
                    "div",
                    { className: "modal-header" },
                    _UIBase.UI.createElement(
                        "h4",
                        { className: "modal-title" },
                        "An Error occurred"
                    )
                )];
            }
        }, {
            key: "getBody",
            value: function getBody() {
                return _UIBase.UI.createElement(
                    "div",
                    { className: "modal-body" },
                    this.options.error.message || this.options.error
                );
            }
        }, {
            key: "getFooter",
            value: function getFooter() {
                var _this12 = this;

                return _UIBase.UI.createElement(
                    "div",
                    { className: "modal-footer" },
                    _UIBase.UI.createElement(_UIBase.UI.Button, { level: _UIBase.UI.Level.DANGER, label: "Dismiss", onClick: function onClick() {
                            return _this12.hide();
                        } })
                );
            }
        }]);

        return ErrorModal;
    }(_UIBase.UI.Modal);

    _UIBase.UI.ActionModal = function (_UI$Modal2) {
        _inherits(ActionModal, _UI$Modal2);

        function ActionModal() {
            _classCallCheck(this, ActionModal);

            return _possibleConstructorReturn(this, (ActionModal.__proto__ || Object.getPrototypeOf(ActionModal)).apply(this, arguments));
        }

        _createClass(ActionModal, [{
            key: "getActionName",
            value: function getActionName() {
                return this.options.actionName || this.options.label;
            }
        }, {
            key: "getActionLevel",
            value: function getActionLevel() {
                return this.options.level || _UIBase.UI.Level.DEFAULT;
            }
        }, {
            key: "getGivenChildren",
            value: function getGivenChildren() {
                return [this.getHeader(), this.getBody(), this.getFooter()];
            }
        }, {
            key: "getHeader",
            value: function getHeader() {
                return [_UIBase.UI.createElement(
                    "div",
                    { className: "modal-header" },
                    _UIBase.UI.createElement(
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
                return content ? _UIBase.UI.createElement(
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
                return content ? _UIBase.UI.createElement(
                    "div",
                    { className: "modal-footer" },
                    content
                ) : null;
            }
        }, {
            key: "getFooterContent",
            value: function getFooterContent() {
                var _this14 = this;

                return [_UIBase.UI.createElement(_UIBase.UI.TemporaryMessageArea, { ref: "messageArea" }), _UIBase.UI.createElement(_UIBase.UI.Button, { level: _UIBase.UI.Level.DEFAULT, label: "Close", onClick: function onClick() {
                        return _this14.hide();
                    } }), _UIBase.UI.createElement(_UIBase.UI.Button, { level: this.getActionLevel(), label: this.getActionName(), onClick: function onClick() {
                        return _this14.action();
                    } })];
            }
        }, {
            key: "action",
            value: function action() {}
        }]);

        return ActionModal;
    }(_UIBase.UI.Modal);

    _UIBase.UI.ActionModalButton = function (ActionModal) {
        return function (_UI$Button) {
            _inherits(ActionModalButton, _UI$Button);

            function ActionModalButton() {
                _classCallCheck(this, ActionModalButton);

                return _possibleConstructorReturn(this, (ActionModalButton.__proto__ || Object.getPrototypeOf(ActionModalButton)).apply(this, arguments));
            }

            _createClass(ActionModalButton, [{
                key: "onMount",
                value: function onMount() {
                    var _this16 = this;

                    this.modal = _UIBase.UI.createElement(ActionModal, this.options);
                    this.addClickListener(function () {
                        return _this16.modal.show();
                    });
                }
            }]);

            return ActionModalButton;
        }(_UIBase.UI.Button);
    };
});
