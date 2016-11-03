define(['exports'], function (exports) {
    'use strict';

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

    var Device = function () {
        function Device() {
            _classCallCheck(this, Device);
        }

        _createClass(Device, null, [{
            key: 'isTouchDevice',
            value: function isTouchDevice() {
                if (!this.hasOwnProperty("_isTouchDevice")) {
                    this._isTouchDevice = !!('createTouch' in window.document || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0 || 'ontouchstart' in window);
                }
                return this._isTouchDevice;
            }
        }, {
            key: 'getEventCoord',
            value: function getEventCoord(event, axis) {
                var pageName = "page" + axis;
                if (this.isTouchDevice()) {
                    if (event.targetTouches) {
                        return event.targetTouches[0][pageName];
                    }
                    if (event.originalEvent && event.originalEvent.targetTouches) {
                        return event.originalEvent.targetTouches[0][pageName];
                    }
                }
                return event[pageName];
            }
        }, {
            key: 'getEventX',
            value: function getEventX(event) {
                return this.getEventCoord(event, "X");
            }
        }, {
            key: 'getEventY',
            value: function getEventY(event) {
                return this.getEventCoord(event, "Y");
            }
        }, {
            key: 'getBrowser',
            value: function getBrowser() {
                // TODO: should try to use navigator
                if (!!window.opr && !!opr.addons || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
                    return "Opera";
                }
                if (typeof InstallTrigger !== 'undefined') {
                    return "Firefox";
                }
                if (Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0) {
                    return "Safari";
                }
                if (document.documentMode) {
                    return "Internet Explorer";
                }
                if (window.StyleMedia) {
                    return "Edge";
                }
                if (window.chrome && window.chrome.webstore) {
                    return "Chrome";
                }
                return "Unknown";
            }
        }, {
            key: 'supportsEvent',
            value: function supportsEvent(eventName) {
                if (!this.cachedSupportedValues.has(eventName)) {
                    var element = document.createElement("div");
                    var onEventName = "on" + eventName;
                    var isSupported = onEventName in element;
                    if (!isSupported) {
                        element.setAttribute(onEventName, "return;");
                        isSupported = typeof element[onEventName] === "function";
                    }
                    element = null;
                    this.cachedSupportedValues.set(eventName, isSupported);
                }
                return this.cachedSupportedValues.get(eventName);
            }
        }]);

        return Device;
    }();

    Device.cachedSupportedValues = new Map();

    exports.Device = Device;
});
