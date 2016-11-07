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
    _UIBase.UI.FullScreenable = function (BaseClass) {
        return function (_BaseClass) {
            _inherits(FullScreenable, _BaseClass);

            function FullScreenable() {
                _classCallCheck(this, FullScreenable);

                return _possibleConstructorReturn(this, (FullScreenable.__proto__ || Object.getPrototypeOf(FullScreenable)).apply(this, arguments));
            }

            _createClass(FullScreenable, [{
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
});
