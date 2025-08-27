// Primitive utils for wrapping browser info

type BrowserName = "Opera" | "Firefox" | "Safari" | "Internet Explorer" | "Edge" | "Chrome" | "Unknown";
type CoordinateReference = "client" | "page" | "screen";
type CoordinateAxis = "X" | "Y";

interface TouchEvent extends Event {
    touches: TouchList;
    originalEvent?: TouchEvent;
}

interface EventWithCoordinates extends Event {
    clientX?: number;
    clientY?: number;
    pageX?: number;
    pageY?: number;
    screenX?: number;
    screenY?: number;
    touches?: TouchList;
    originalEvent?: EventWithCoordinates;
}

export function isTouchDevice(): boolean {
    return !!(("createTouch" in window.document) ||
        ((navigator as any).maxTouchPoints > 0) ||
        ((navigator as any).msMaxTouchPoints > 0) ||
        ("ontouchstart" in window));
}

export function isMobileDevice(): boolean {
    const mobileDevices = ["Android", "webOS", "iPad", "iPhone", "iPod", "BlackBerry", "Windows Phone"];
    for (let device of mobileDevices) {
        if (navigator.userAgent.indexOf(device) !== -1) {
            return true;
        }
    }
    return false;
}

export function isLandscape(): boolean {
    const orientation = (window.screen as any).orientation;

    if (orientation === -90 || orientation === 90) {
        return true;
    }

    if (!isMobileDevice()) {
        return window.innerWidth > window.innerHeight;
    }

    const width = (isMobileDevice() && window.screen?.width) ||  window.innerWidth;
    const height = (isMobileDevice() && window.screen?.height) ||  window.innerHeight;

    return width > height || height < 380;
}

export function getEventTouchIdentifier(event: TouchEvent): number {
    return Math.min(...Array.from(event.touches).map(touch => touch.identifier));
}

export function getEventTouch(event: TouchEvent): Touch | undefined {
    const identifier = getEventTouchIdentifier(event);
    return Array.from(event.touches).find(touch => touch.identifier === identifier);
}

export function getEventCoord(event: EventWithCoordinates, axis: CoordinateAxis, reference: CoordinateReference = "client"): number | undefined {
    let coordName = reference + axis as keyof EventWithCoordinates;
    if (event[coordName]) {
        return event[coordName] as number;
    }
    if (event.touches) {
        const touch = getEventTouch(event as TouchEvent);
        return touch ? (touch as any)[coordName] : undefined;
    }
    if (event.originalEvent) {
        return getEventCoord(event.originalEvent, axis, reference);
    }

    console.warn("Couldn't find coordinates for event. Maybe wrong reference point? (client/page/screen)");
    return undefined;
}

export function getEventX(event: EventWithCoordinates, reference: CoordinateReference = "client"): number | undefined {
    return getEventCoord(event, "X", reference);
}

export function getEventY(event: EventWithCoordinates, reference: CoordinateReference = "client"): number | undefined {
    return getEventCoord(event, "Y", reference);
}

export function getBrowser(): BrowserName {
    // TODO: should try to use navigator
    if (((window as any).opr && (window as any).opr.addons) || !!(window as any).opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
        return "Opera";
    }
    if (typeof (window as any).InstallTrigger !== 'undefined') {
        return "Firefox";
    }
    if (Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0) {
        return "Safari";
    }
    if ((document as any).documentMode) {
        return "Internet Explorer";
    }
    if ((window as any).StyleMedia) {
        return "Edge";
    }
    if ((window as any).chrome && (window as any).chrome.webstore) {
        return "Chrome";
    }
    return "Unknown";
}

const supportsEventCache = new Map<string, boolean>();
export function supportsEvent(eventName: string): boolean {
    if (!supportsEventCache.has(eventName)) {
        const element = document.createElement("div");
        const onEventName = "on" + eventName;
        let isSupported = (onEventName in element);
        if (!isSupported) {
            element.setAttribute(onEventName, "return;");
            isSupported = typeof element[onEventName] === "function";
        }
        supportsEventCache.set(eventName, isSupported);
    }
    return supportsEventCache.get(eventName)!;
}

// TODO This object is deprecated, use the functions in this file directly instead.
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