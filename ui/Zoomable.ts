import {Device} from "../base/Device";
import {CleanupJobs} from "../base/Dispatcher";

function generateZoomEvent(rawEvent, delta, unit=200) {
    return {
        x: Device.getEventX(rawEvent),
        y: Device.getEventY(rawEvent),
        zoomFactor: (delta <= 0) ? 1 - delta / unit : 1 / (1 + delta / unit),
        rawEvent
    };
}

class WheelZoomEventHandler {
    constructor(uiElement, callback) {
        this.eventHandler = uiElement.addNodeListener("wheel", (event) => {
            // TODO: see if both of these are needed
            event.preventDefault();
            event.stopPropagation();
            callback(event, event.deltaY);
        });
    }

    cleanup() {
        this.eventHandler.remove();
    }
}

class PinchZoomEventHandler {
    constructor(uiElement, callback) {
        this.pinchActive = false;
        this.touchStartHandler = uiElement.addNodeListener("touchstart", (event) => {
            this.recalculateCentroid(event);
        });
        this.touchEndHandler = uiElement.addNodeListener("touchend", (event) => {
            this.recalculateCentroid(event);
        });
        this.touchCancelHandler = uiElement.addNodeListener("touchcancel", (event) => {
            this.recalculateCentroid(event);
        });
        this.touchMoveHandler = uiElement.addNodeListener("touchmove", (event) => {

            if (this.pinchActive && event.touches && event.touches.length > 1) {
                const {centroid, averageDist} = this.calculateCentroid(event.touches);
                callback(event, this.averageDist - averageDist);
                Object.assign(this, {centroid, averageDist});
            }
        });
    }

    calculateCentroid(touches) {
        let centroid = {x: 0, y: 0};
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

    recalculateCentroid(event) {
        const touches = event.touches || [];
        if (touches.length < 2) {
            this.pinchActive = false;
            return;
        }
        this.pinchActive = true;
        Object.assign(this, this.calculateCentroid(touches));
    }

    cleanup() {
        this.touchStartHandler.remove();
        this.touchMoveHandler.remove();
        this.touchEndHandler.remove();
        this.touchCancelHandler.remove();
    }
}

export const Zoomable = (BaseClass) => class Zoomable extends BaseClass {
    static EVENT_HANDLERS = [WheelZoomEventHandler, PinchZoomEventHandler];

    _zoomListeners = [];

    getZoomLevel() {
        return this.options.zoomLevel || 1;
    }

    getMinZoomLevel() {
        return this.options.minZoomLevel || 0.02;
    }

    getMaxZoomLevel() {
        return this.options.maxZoomLevel || 50;
    }

    setZoomLevel(zoomLevel) {
        zoomLevel = Math.max(this.getMinZoomLevel(), zoomLevel);
        zoomLevel = Math.min(this.getMaxZoomLevel(), zoomLevel);
        if (this.getZoomLevel() === zoomLevel) {
            return;
        }
        this.options.zoomLevel = zoomLevel;
        this.dispatch("setZoomLevel", zoomLevel);
    }

    addZoomListener(callback, unit=200) {
        if (this._zoomListeners.find(listener => listener.callback === callback)) {
            console.warn("Trying to add a listener twice!", callback);
            return;
        }
        let eventHandlers = [];
        for (const EventHandlerClass of this.constructor.EVENT_HANDLERS) {
            eventHandlers.push(new EventHandlerClass(this,
                (event, delta) => callback(generateZoomEvent(event, delta, unit))
            ));
        }
        const listener = {
            handler: new CleanupJobs(eventHandlers),
            callback
        };
        this._zoomListeners.push(listener);
        return listener.handler;
    }

    removeZoomListener(callback) {
        const listener = this._zoomListeners.find(listener => listener.callback === callback);
        if (!listener) {
            return;
        }
        listener.handler.cleanup();
        this._zoomListeners.splice(this._zoomListeners.indexOf(listener), 1);
    }
};