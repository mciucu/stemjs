// Primitive utils for wrapping browser info
class Device {
    static isTouchDevice() {
        if (!this.hasOwnProperty("_isTouchDevice")) {
            this._isTouchDevice = !!(('createTouch' in window.document) ||
                                            (navigator.MaxTouchPoints > 0) ||
                                            (navigator.msMaxTouchPoints > 0) ||
                                            ('ontouchstart' in window));
        }
        return this._isTouchDevice;
    }

    static getEventCoord(event, axis) {
        let pageName = "page" + axis;
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

    static getEventX(event) {
        return this.getEventCoord(event, "X");
    }

    static getEventY(event) {
        return this.getEventCoord(event, "Y");
    }

    static getBrowser() {
        // TODO: should try to use navigator
        if ((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
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

    static supportsEvent(eventName) {
        if (!this.cachedSupportedValues.has(eventName)) {
            var element = document.createElement("div");
            let onEventName = "on" + eventName;
            var isSupported = (onEventName in element);
            if (!isSupported) {
                element.setAttribute(onEventName, "return;");
                isSupported = typeof element[onEventName] === "function";
            }
            element = null;
            this.cachedSupportedValues.set(eventName, isSupported);
        }
        return this.cachedSupportedValues.get(eventName);
    }
}

Device.cachedSupportedValues = new Map();

export {Device};