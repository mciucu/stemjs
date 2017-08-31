import {Device} from "../base/Device";
import {CleanupJobs} from "../base/Dispatcher";

class WheelZoomEventHandler {
    constructor(uiElement, callback, unit) {
        this.eventHandler = uiElement.addNodeListener("wheel", (event) => {
            const deltaY = event.deltaY;
            const factor = (deltaY <= 0) ? 1 - deltaY / unit : 1 / (1 + deltaY / unit);
            callback({
                x: Device.getEventX(event),
                y: Device.getEventY(event),
                zoomFactor: factor,
                event: event
            });
        });
    }

    cleanup() {
        this.eventHandler.remove();
    }
}

class PinchZoomEventHandler {
    constructor(uiElement, callback, unit) {
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
                const [newCentroid, newAveregeDist] = this.calculateCentroid(event.touches);
                const delta = this.averegeDist - newAveregeDist;
                const factor = (delta <= 0) ? 1 - delta / unit : 1 / (1 + delta / unit);
                callback({
                    x: Device.getEventX(event),
                    y: Device.getEventY(event),
                    zoomFactor: factor,
                    event: event
                });
                this.centroid = newCentroid;
                this.averegeDist = newAveregeDist;
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

        let averegeDist = 0;
        for (const touch of touches) {
            const x = Device.getEventX(touch), y = Device.getEventY(touch);
            averegeDist += Math.sqrt(   (x - centroid.x) * (x - centroid.x) +
                                        (y - centroid.y) * (y - centroid.y)
                                    );
        }
        averegeDist /= touches.length;
        return [centroid, averegeDist]
    }

    recalculateCentroid(event) {
        const touches = event.touches || [];
        if (touches.length < 2) {
            this.pinchActive = false;
            return;
        }
        this.pinchActive = true;
        [this.centroid, this.averegeDist] = this.calculateCentroid(touches);
    }

    cleanup() {
        this.touchStartHandler.remove();
        this.touchMoveHandler.remove();
        this.touchEndHandler.remove();
        this.touchCancelHandler.remove();
    }
}

export const Zoomable = (BaseClass) => class Zoomable extends BaseClass {
    getZoomLevel() {
        return this.options.zoomLevel || 1;
    }

    getMinZoomLevel() {
        return this.options.minZoomLevel || 0.02;
    }

    getMaxZoomLevel() {
        return this.options.maxZoomLevel || 50;
    }

    setZoomLevel(zoomLevel, event) {
        zoomLevel = Math.max(this.getMinZoomLevel(), zoomLevel);
        zoomLevel = Math.min(this.getMaxZoomLevel(), zoomLevel);
        if (this.getZoomLevel() === zoomLevel) {
            return;
        }
        this.options.zoomLevel = zoomLevel;
        this.redraw();
        this.dispatch("setZoomLevel", zoomLevel);
    }

    addZoomListener(callback, unit=200) {
        // callback will be called with three arguments: x, y and factor
        const wheelEventHandler = new WheelZoomEventHandler(this, callback, unit);
        const pinchEventHandler = new PinchZoomEventHandler(this, callback, 0.5 * unit);

        return this.zoomHandler = new CleanupJobs([
            wheelEventHandler,
            pinchEventHandler
        ]);
    }

    removeZoomListener() {
        this.zoomHandler && this.zoomHandler.cleanup();
        delete this.zoomHandler;
    }
};