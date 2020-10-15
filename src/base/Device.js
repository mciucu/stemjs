// Primitive utils for wrapping browser info

export function isTouchDevice() {
    return !!(("createTouch" in window.document) ||
        (navigator.MaxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0) ||
        ("ontouchstart" in window));
}

export function isMobileDevice() {
    const mobileDevices = ["Android", "webOS", "iPad", "iPhone", "iPod", "BlackBerry", "Windows Phone"];
    for (let device of mobileDevices) {
        if (navigator.userAgent.indexOf(device) !== -1) {
            return true;
        }
    }
    return false;
}

export function isLandscape() {
    if (window.orientation && (window.orientation === -90 || window.orientation === 90)) {
        return true;
    }
    if (!this.isMobileDevice()) {
        return window.innerWidth > window.innerHeight;
    }

    const width = (this.isMobileDevice() && window.screen?.width) ||  window.innerWidth;
    const height = (this.isMobileDevice() && window.screen?.height) ||  window.innerHeight;

    return width > height || height < 380;
}

export function getEventTouchIdentifier(event) {
    return Math.min(...[...event.touches].map(touch => touch.identifier));
}

export function getEventTouch(event) {
    const identifier = getEventTouchIdentifier(event);
    return [...event.touches].find(touch => touch.identifier === identifier);
}

export function getEventCoord(event, axis, reference="client") {
    let coordName = reference + axis;
    if (event[coordName]) {
        return event[coordName];
    }
    if (event.touches) {
        return getEventTouch(event)[coordName];
    }
    if (event.originalEvent) {
        return getEventCoord(event.originalEvent, axis, reference);
    }

    console.warn("Couldn't find coordinates for event. Maybe wrong reference point? (client/page/screen)");
}

export function getEventX(event, reference="client") {
    return getEventCoord(event, "X", reference);
}

export function getEventY(event, reference="client") {
    return getEventCoord(event, "Y", reference);
}

export function getBrowser() {
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

const supportsEventCache = new Map();
export function supportsEvent(eventName) {
    if (!supportsEventCache.has(eventName)) {
        var element = document.createElement("div");
        let onEventName = "on" + eventName;
        var isSupported = (onEventName in element);
        if (!isSupported) {
            element.setAttribute(onEventName, "return;");
            isSupported = typeof element[onEventName] === "function";
        }
        element = null;
        supportsEventCache.set(eventName, isSupported);
    }
    return supportsEventCache.get(eventName);
}

// This object is deprecated, use the functions in this file directly instead.
export const Device = {
    isTouchDevice,
    isMobileDevice,
    isLandscape,
    getEventTouchIdentifier,
    getEventTouch,
    getEventCoord,
    getEventX,
    getEventY,
    getBrowser,
    supportsEvent,
};
