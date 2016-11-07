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

    // TODO: simplify this if possible
    // TODO: rename to DraggableMixin?
    _UIBase.UI.Draggable = function (BaseClass) {
        var Draggable = function (_BaseClass) {
            _inherits(Draggable, _BaseClass);

            function Draggable() {
                _classCallCheck(this, Draggable);

                return _possibleConstructorReturn(this, (Draggable.__proto__ || Object.getPrototypeOf(Draggable)).apply(this, arguments));
            }

            _createClass(Draggable, [{
                key: "addClickListener",
                value: function addClickListener(callback) {
                    var _this2 = this;

                    this.ensureFieldExists("_clickCallbacks", function (x) {
                        return new Map();
                    });

                    if (this._clickCallbacks.has(callback)) {
                        return;
                    }
                    var callbackWrapper = function callbackWrapper() {
                        if (_this2._okForClick) {
                            callback();
                        }
                    };
                    this._clickCallbacks.set(callback, callbackWrapper);
                    _get(Draggable.prototype.__proto__ || Object.getPrototypeOf(Draggable.prototype), "addClickListener", this).call(this, callbackWrapper);

                    if (!this.hasOwnProperty("_clickDragListeners")) {
                        this._clickDragListeners = new Map();
                    }
                    if (this._clickDragListeners.has(callback)) {
                        return;
                    }
                    var clickDragListener = {
                        onStart: function onStart() {
                            _this2.dragForClickStarted();
                        },
                        onDrag: function onDrag() {
                            _this2.dragForClick();
                        }
                    };
                    this._clickDragListeners.set(callback, clickDragListener);
                    this.addDragListener(clickDragListener);
                }
            }, {
                key: "dragForClickStarted",
                value: function dragForClickStarted() {
                    this._okForClick = true;
                }
            }, {
                key: "dragForClick",
                value: function dragForClick() {
                    this._okForClick = false;
                }
            }, {
                key: "removeClickListener",
                value: function removeClickListener(callback) {
                    if (!this._clickCallbacks) {
                        return;
                    }
                    var callbackWrapper = this._clickCallbacks.get(callback);
                    if (callbackWrapper) {
                        this._clickCallbacks.delete(callback);
                        _get(Draggable.prototype.__proto__ || Object.getPrototypeOf(Draggable.prototype), "removeClickListener", this).call(this, callbackWrapper);
                    }
                    if (!this._clickDragListeners) {
                        return;
                    }
                    var clickDragListener = this._clickDragListeners.get(callback);
                    if (clickDragListener) {
                        this._clickDragListeners.delete(callback);
                        this.removeDragListener(clickDragListener);
                    }
                }
            }, {
                key: "createDragListenerWrapper",
                value: function createDragListenerWrapper(listeners) {
                    var listenerWrapper = Object.assign({}, listeners);

                    listenerWrapper.onWrapperDrag = function (event) {
                        var deltaX = event.clientX - listenerWrapper._lastX;
                        listenerWrapper._lastX = event.clientX;

                        var deltaY = event.clientY - listenerWrapper._lastY;
                        listenerWrapper._lastY = event.clientY;

                        listeners.onDrag(deltaX, deltaY);
                    };

                    listenerWrapper.onWrapperStart = function (event) {
                        listenerWrapper._lastX = event.clientX;
                        listenerWrapper._lastY = event.clientY;

                        if (listeners.onStart) {
                            listeners.onStart(event);
                        }

                        // TODO: Replace with our body
                        document.body.addEventListener("mousemove", listenerWrapper.onWrapperDrag);
                    };

                    listenerWrapper.onWrapperEnd = function (event) {
                        if (listeners.onEnd) {
                            listeners.onEnd(event);
                        }
                        // TODO: Replace with our body
                        document.body.removeEventListener("mousemove", listenerWrapper.onWrapperDrag);
                    };
                    return listenerWrapper;
                }
            }, {
                key: "createTouchDragListenerWrapper",
                value: function createTouchDragListenerWrapper(listeners) {
                    var listenerWrapper = Object.assign({}, listeners);

                    listenerWrapper.onWrapperDrag = function (event) {
                        var touch = event.targetTouches[0];
                        var deltaX = touch.pageX - listenerWrapper._lastX;
                        listenerWrapper._lastX = touch.pageX;

                        var deltaY = touch.pageY - listenerWrapper._lastY;
                        listenerWrapper._lastY = touch.pageY;

                        listeners.onDrag(deltaX, deltaY);
                    };

                    listenerWrapper.onWrapperStart = function (event) {
                        var touch = event.targetTouches[0];
                        listenerWrapper._lastX = touch.pageX;
                        listenerWrapper._lastY = touch.pageY;

                        if (listeners.onStart) {
                            listeners.onStart(event);
                        }
                        event.preventDefault();

                        // TODO: Replace with our body
                        document.body.addEventListener("touchmove", listenerWrapper.onWrapperDrag);
                    };

                    listenerWrapper.onWrapperEnd = function (event) {
                        if (listeners.onEnd) {
                            listeners.onEnd(event);
                        }
                        // TODO: Replace with our body
                        document.body.removeEventListener("touchmove", listenerWrapper.onWrapperDrag);
                    };
                    return listenerWrapper;
                }
            }, {
                key: "addDragListener",
                value: function addDragListener(listeners) {
                    var listenerWrapper = this.createDragListenerWrapper(listeners);
                    var touchListenerWrapper = this.createTouchDragListenerWrapper(listeners);
                    this.addDOMListener("touchstart", touchListenerWrapper.onWrapperStart);
                    this.addDOMListener("mousedown", listenerWrapper.onWrapperStart);
                    // TODO: Replace with our body
                    document.body.addEventListener("touchend", touchListenerWrapper.onWrapperEnd);
                    document.body.addEventListener("mouseup", listenerWrapper.onWrapperEnd);

                    if (!this.hasOwnProperty("_dragListeners")) {
                        this._dragListeners = [];
                    }
                    this._dragListeners.push(touchListenerWrapper);
                    this._dragListeners.push(listenerWrapper);
                }
            }, {
                key: "removeDragListener",
                value: function removeDragListener(listeners) {
                    if (this._dragListeners) {
                        for (var i = this._dragListeners.length - 1; i >= 0; i -= 1) {
                            if (this._dragListeners[i].onStart === listeners.onStart && this._dragListeners[i].onDrag === listeners.onDrag && this._dragListeners[i].onEnd === listeners.onEnd) {

                                this.removeDOMListener("touchstart", this._dragListeners[i].onWrapperStart);
                                document.body.removeEventListener("touchmove", this._dragListeners[i].onWrapperDrag);
                                document.body.removeEventListener("touchmove", this._dragListeners[i].onWrapperEnd);
                                this.removeDOMListener("mousedown", this._dragListeners[i].onWrapperStart);
                                document.body.removeEventListener("mousemove", this._dragListeners[i].onWrapperDrag);
                                document.body.removeEventListener("mousemove", this._dragListeners[i].onWrapperEnd);

                                this._dragListeners.splice(i, 1);
                            }
                        }
                    }
                }
            }]);

            return Draggable;
        }(BaseClass);

        return Draggable;
    };
});
