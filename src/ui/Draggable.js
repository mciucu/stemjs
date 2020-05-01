import {Device} from "../base/Device";
import {UI} from "./UIBase";

export const Draggable = (BaseClass=UI.Element) => class Draggable extends BaseClass {
    _clickCallbacks = new Map();
    _clickDragListeners = new Map();

    addClickListener(callback) {
        if (this._clickCallbacks.has(callback)) {
            return;
        }
        let callbackWrapper = () => {
            if (this._okForClick) {
                callback();
            }
        };
        this._clickCallbacks.set(callback, callbackWrapper);
        super.addClickListener(callbackWrapper);

        if (this._clickDragListeners.has(callback)) {
            return;
        }
        let clickDragListener = {
            onStart: () => { this.dragForClickStarted(); },
            onDrag: () => { this.dragForClick(); }
        };
        this._clickDragListeners.set(callback, clickDragListener);
        this.addDragListener(clickDragListener);
    }

    dragForClickStarted() {
        this._okForClick = true;
    }

    dragForClick() {
        this._okForClick = false;
    }

    removeClickListener(callback) {
        let callbackWrapper = this._clickCallbacks.get(callback);
        if (callbackWrapper) {
            this._clickCallbacks.delete(callback);
            super.removeClickListener(callbackWrapper);
        }
        if (!this._clickDragListeners) {
            return;
        }
        let clickDragListener = this._clickDragListeners.get(callback);
        if (clickDragListener) {
            this._clickDragListeners.delete(callback);
            this.removeDragListener(clickDragListener);
        }
    }

    createDragGenericListenerWrapper(listeners, dragEventType) {
        let listenerWrapper = Object.assign({}, listeners);
        let dragStarted = false;

        listenerWrapper.onWrapperDrag = (event) => {
            if (!dragStarted) {
                return;
            }

            const eventX = Device.getEventX(event) || 0;
            const eventY = Device.getEventY(event) || 0;

            let deltaX = eventX - listenerWrapper._lastX;
            listenerWrapper._lastX = eventX;

            let deltaY = eventY - listenerWrapper._lastY;
            listenerWrapper._lastY = eventY;

            listeners.onDrag(deltaX, deltaY);
        };

        listenerWrapper.onWrapperStart = (event) => {
            dragStarted = true;

            listenerWrapper._lastX = Device.getEventX(event);
            listenerWrapper._lastY = Device.getEventY(event);

            if (listeners.onStart) {
                listeners.onStart(event);
            }

            // TODO: Replace with our body
            document.body.addEventListener(dragEventType, listenerWrapper.onWrapperDrag);
        };

        listenerWrapper.onWrapperEnd = (event) => {
            if (dragStarted) {
                if (listeners.onEnd) {
                    listeners.onEnd(event);
                }
            }

            dragStarted = false;

            // TODO: Replace with our body
            document.body.removeEventListener(dragEventType, listenerWrapper.onWrapperDrag);
        };
        return listenerWrapper;
    }

    createDragListenerWrapper(listeners) {
        return this.createDragGenericListenerWrapper(listeners, "mousemove");
    }

    createTouchDragListenerWrapper(listeners) {
        return this.createDragGenericListenerWrapper(listeners, "touchmove");
    }

    addDragListener(listeners) {
        let listenerWrapper = this.createDragListenerWrapper(listeners);
        let touchListenerWrapper = this.createTouchDragListenerWrapper(listeners);
        this.addNodeListener("touchstart", touchListenerWrapper.onWrapperStart);
        if (!Device.isMobileDevice()) {
            this.addNodeListener("mousedown", listenerWrapper.onWrapperStart);
        }

        // TODO: Replace with our body
        document.body.addEventListener("touchend", touchListenerWrapper.onWrapperEnd);
        if (!Device.isMobileDevice()) {
            document.body.addEventListener("mouseup", listenerWrapper.onWrapperEnd);
        }

        if (!this.hasOwnProperty("_dragListeners")) {
            this._dragListeners = [];
        }
        this._dragListeners.push(touchListenerWrapper);
        this._dragListeners.push(listenerWrapper);
    }

    removeDragListener(listeners) {
        if (this._dragListeners) {
            for (let i = this._dragListeners.length - 1; i >= 0; i -= 1) {
                if (this._dragListeners[i].onStart === listeners.onStart &&
                    this._dragListeners[i].onDrag === listeners.onDrag &&
                    this._dragListeners[i].onEnd === listeners.onEnd) {

                    this.removeNodeListener("touchstart", this._dragListeners[i].onWrapperStart);
                    document.body.removeEventListener("touchmove", this._dragListeners[i].onWrapperDrag);
                    document.body.removeEventListener("touchmove", this._dragListeners[i].onWrapperEnd);
                    this.removeNodeListener("mousedown", this._dragListeners[i].onWrapperStart);
                    document.body.removeEventListener("mousemove", this._dragListeners[i].onWrapperDrag);
                    document.body.removeEventListener("mousemove", this._dragListeners[i].onWrapperEnd);

                    this._dragListeners.splice(i, 1);
                }
            }
        }
    }
};

export const DraggableElement = Draggable();
