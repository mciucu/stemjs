import {Device} from "../base/Device";
import {CleanupJobs} from "../base/Dispatcher";

interface ZoomEvent {
    x: number;
    y: number;
    zoomFactor: number;
    rawEvent: Event;
}

interface ZoomListener {
    handler: CleanupJobs;
    callback: (event: ZoomEvent) => void;
}

interface TouchCentroid {
    x: number;
    y: number;
}

interface CentroidData {
    centroid: TouchCentroid;
    averageDist: number;
}

type ZoomEventHandler = new (uiElement: any, callback: (event: Event, delta: number) => void) => {
    cleanup(): void;
};

type ZoomEventCallback = (event: Event, delta: number) => void;

function generateZoomEvent(rawEvent: Event, delta: number, unit: number = 200): ZoomEvent {
    return {
        x: Device.getEventX(rawEvent),
        y: Device.getEventY(rawEvent),
        zoomFactor: (delta <= 0) ? 1 - delta / unit : 1 / (1 + delta / unit),
        rawEvent
    };
}

class WheelZoomEventHandler {
    private eventHandler: any;

    constructor(uiElement: any, callback: ZoomEventCallback) {
        this.eventHandler = uiElement.addNodeListener("wheel", (event: WheelEvent) => {
            // TODO: see if both of these are needed
            event.preventDefault();
            event.stopPropagation();
            callback(event, event.deltaY);
        });
    }

    cleanup(): void {
        this.eventHandler.remove();
    }
}

class PinchZoomEventHandler {
    private pinchActive: boolean;
    private touchStartHandler: any;
    private touchEndHandler: any;
    private touchCancelHandler: any;
    private touchMoveHandler: any;
    private centroid?: TouchCentroid;
    private averageDist?: number;

    constructor(uiElement: any, callback: ZoomEventCallback) {
        this.pinchActive = false;
        this.touchStartHandler = uiElement.addNodeListener("touchstart", (event: TouchEvent) => {
            this.recalculateCentroid(event);
        });
        this.touchEndHandler = uiElement.addNodeListener("touchend", (event: TouchEvent) => {
            this.recalculateCentroid(event);
        });
        this.touchCancelHandler = uiElement.addNodeListener("touchcancel", (event: TouchEvent) => {
            this.recalculateCentroid(event);
        });
        this.touchMoveHandler = uiElement.addNodeListener("touchmove", (event: TouchEvent) => {

            if (this.pinchActive && event.touches && event.touches.length > 1) {
                const {centroid, averageDist} = this.calculateCentroid(event.touches);
                callback(event, this.averageDist! - averageDist);
                Object.assign(this, {centroid, averageDist});
            }
        });
    }

    calculateCentroid(touches: TouchList): CentroidData {
        let centroid: TouchCentroid = {x: 0, y: 0};
        for (const touch of touches) {
            centroid.x += Device.getEventX(touch);
            centroid.y += Device.getEventY(touch);
        }
        centroid.x /= touches.length;
        centroid.y /= touches.length;

        let averageDist = 0;
        for (const touch of touches) {
            const x = Device.getEventX(touch), y = Device.getEventY(touch);
            averageDist += Math.sqrt(   (x - centroid.x) * (x - centroid.x) +
                                        (y - centroid.y) * (y - centroid.y)
                                    );
        }
        averageDist /= touches.length;
        return {centroid, averageDist};
    }

    recalculateCentroid(event: TouchEvent): void {
        const touches = event.touches || [];
        if (touches.length < 2) {
            this.pinchActive = false;
            return;
        }
        this.pinchActive = true;
        Object.assign(this, this.calculateCentroid(touches));
    }

    cleanup(): void {
        this.touchStartHandler.remove();
        this.touchMoveHandler.remove();
        this.touchEndHandler.remove();
        this.touchCancelHandler.remove();
    }
}

export const Zoomable = <T extends new (...args: any[]) => any>(BaseClass: T) => class Zoomable extends BaseClass {
    static EVENT_HANDLERS: ZoomEventHandler[] = [WheelZoomEventHandler, PinchZoomEventHandler];

    private _zoomListeners: ZoomListener[] = [];
    declare options: {
        zoomLevel?: number;
        minZoomLevel?: number;
        maxZoomLevel?: number;
        [key: string]: any;
    };

    getZoomLevel(): number {
        return this.options.zoomLevel || 1;
    }

    getMinZoomLevel(): number {
        return this.options.minZoomLevel || 0.02;
    }

    getMaxZoomLevel(): number {
        return this.options.maxZoomLevel || 50;
    }

    setZoomLevel(zoomLevel: number): void {
        zoomLevel = Math.max(this.getMinZoomLevel(), zoomLevel);
        zoomLevel = Math.min(this.getMaxZoomLevel(), zoomLevel);
        if (this.getZoomLevel() === zoomLevel) {
            return;
        }
        this.options.zoomLevel = zoomLevel;
        this.dispatch("setZoomLevel", zoomLevel);
    }

    addZoomListener(callback: (event: ZoomEvent) => void, unit: number = 200): CleanupJobs {
        if (this._zoomListeners.find(listener => listener.callback === callback)) {
            console.warn("Trying to add a listener twice!", callback);
            return new CleanupJobs([]);
        }
        let eventHandlers: any[] = [];
        for (const EventHandlerClass of (this.constructor as any).EVENT_HANDLERS) {
            eventHandlers.push(new EventHandlerClass(this,
                (event: Event, delta: number) => callback(generateZoomEvent(event, delta, unit))
            ));
        }
        const listener: ZoomListener = {
            handler: new CleanupJobs(eventHandlers),
            callback
        };
        this._zoomListeners.push(listener);
        return listener.handler;
    }

    removeZoomListener(callback: (event: ZoomEvent) => void): void {
        const listener = this._zoomListeners.find(listener => listener.callback === callback);
        if (!listener) {
            return;
        }
        listener.handler.cleanup();
        this._zoomListeners.splice(this._zoomListeners.indexOf(listener), 1);
    }
};