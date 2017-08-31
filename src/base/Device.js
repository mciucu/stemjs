// Primitive utils for wrapping browser info
class Device {
    static isTouchDevice() {
        if (!this.hasOwnProperty("_isTouchDevice")) {
            this._isTouchDevice = !!(("createTouch" in window.document) ||
                                            (navigator.MaxTouchPoints > 0) ||
                                            (navigator.msMaxTouchPoints > 0) ||
                                            ("ontouchstart" in window));
        }
        return this._isTouchDevice;
    }

    static isMobileDevice() {
        if (!this.hasOwnProperty("_isMobileDevice")) {
            const mobileDevices = ["Android", "webOS", "iPad", "iPhone", "iPod", "BlackBerry", "Windows Phone"];
            this._isMobileDevice = false;
            for (let device of mobileDevices) {
                if (navigator.userAgent.indexOf(device) !== -1) {
                    this._isMobileDevice = true;
                }
            }
        }
        return this._isMobileDevice;
    }

    static getEventTouchIdentifier(event) {
        return Math.min(...[...event.touches].map(touch => touch.identifier));
    }

    static getEventTouch(event) {
        const identifier = this.getEventTouchIdentifier(event);
        return [...event.touches].find(touch => touch.identifier === identifier);
    }

    static getEventCoord(event, axis, reference="client") {
        let coordName = reference + axis;
        if (event[coordName]) {
            return event[coordName];
        }
        if (event.touches) {
            return this.getEventTouch(event)[coordName];
        }
        if (event.originalEvent) {
            return this.getEventCoord(event.originalEvent, axis, reference);
        }

        console.warn("Couldn't find coordinates for event. Maybe wrong reference point? (client/page/screen)");
    }

    static getEventX(event, reference="client") {
        return this.getEventCoord(event, "X", reference);
    }

    static getEventY(event, reference="client") {
        return this.getEventCoord(event, "Y", reference);
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