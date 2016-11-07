define(["./UIBase"], function (_UIBase) {
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

    _UIBase.UI.DoubleClickable = function (BaseClass) {
        return function (_BaseClass) {
            _inherits(DoubleClickable, _BaseClass);

            function DoubleClickable() {
                _classCallCheck(this, DoubleClickable);

                return _possibleConstructorReturn(this, (DoubleClickable.__proto__ || Object.getPrototypeOf(DoubleClickable)).apply(this, arguments));
            }

            _createClass(DoubleClickable, [{
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
                    _get(DoubleClickable.prototype.__proto__ || Object.getPrototypeOf(DoubleClickable.prototype), "addClickListener", this).call(this, callbackWrapper);
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
                        _get(DoubleClickable.prototype.__proto__ || Object.getPrototypeOf(DoubleClickable.prototype), "removeClickListener", this).call(this, callbackWrapper);
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
                    _get(DoubleClickable.prototype.__proto__ || Object.getPrototypeOf(DoubleClickable.prototype), "addClickListener", this).call(this, callbackWrapper);
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
                        _get(DoubleClickable.prototype.__proto__ || Object.getPrototypeOf(DoubleClickable.prototype), "removeClickListener", this).call(this, callbackWrapper);
                    }
                }
            }]);

            return DoubleClickable;
        }(BaseClass);
    };
});
