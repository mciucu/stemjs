import {Device} from "../base/Device";
import {UI} from "./UIBase";

// Type definitions for draggable functionality
interface DragListeners {
    onStart?: (event: Event) => void;
    onDrag: (deltaX: number, deltaY: number) => void;
    onEnd?: (event: Event) => void;
}

interface DragListenerWrapper extends DragListeners {
    _lastX?: number;
    _lastY?: number;
    onWrapperStart?: (event: Event) => void;
    onWrapperDrag?: (event: Event) => void;
    onWrapperEnd?: (event: Event) => void;
}

type ClickCallback = () => void;

export const Draggable = <T extends new (...args: any[]) => any>(BaseClass: T = UI.Element as any) => class Draggable extends BaseClass {
    private clickCallbacks = new Map<ClickCallback, () => void>();
    private clickDragListeners = new Map<ClickCallback, DragListeners>();
    private dragListeners: DragListenerWrapper[] = [];
    private okForClick?: boolean;

    addClickListener(callback: ClickCallback): void {
        if (this.clickCallbacks.has(callback)) {
            return;
        }
        const callbackWrapper = (): void => {
            if (this.okForClick) {
                callback();
            }
        };
        this.clickCallbacks.set(callback, callbackWrapper);
        super.addClickListener(callbackWrapper);

        if (this.clickDragListeners.has(callback)) {
            return;
        }
        const clickDragListener = {
            onStart: (): void => { this.dragForClickStarted(); },
            onDrag: (): void => { this.dragForClick(); }
        };
        this.clickDragListeners.set(callback, clickDragListener);
        this.addDragListener(clickDragListener);
    }

    dragForClickStarted(): void {
        this.okForClick = true;
    }

    dragForClick(): void {
        this.okForClick = false;
    }

    removeClickListener(callback: ClickCallback): void {
        let callbackWrapper = this.clickCallbacks.get(callback);
        if (callbackWrapper) {
            this.clickCallbacks.delete(callback);
            super.removeClickListener(callbackWrapper);
        }
        if (!this.clickDragListeners) {
            return;
        }
        let clickDragListener = this.clickDragListeners.get(callback);
        if (clickDragListener) {
            this.clickDragListeners.delete(callback);
            this.removeDragListener(clickDragListener);
        }
    }

    createDragGenericListenerWrapper(listeners: DragListeners, dragEventType: string): DragListenerWrapper {
        let listenerWrapper: DragListenerWrapper = Object.assign({}, listeners);
        let dragStarted = false;

        listenerWrapper.onWrapperDrag = (event: Event): void => {
            if (!dragStarted) {
                return;
            }

            const eventX = Device.getEventX(event) || 0;
            const eventY = Device.getEventY(event) || 0;

            let deltaX = eventX - listenerWrapper._lastX;
            listenerWrapper._lastX = eventX;

            let deltaY = eventY - listenerWrapper._lastY;
            listenerWrapper._lastY = eventY;

            listeners.onDrag!(deltaX, deltaY);
        };

        listenerWrapper.onWrapperStart = (event: Event): void => {
            dragStarted = true;

            listenerWrapper._lastX = Device.getEventX(event);
            listenerWrapper._lastY = Device.getEventY(event);

            if (listeners.onStart) {
                listeners.onStart(event);
            }

            // TODO: Replace with our body
            document.body.addEventListener(dragEventType, listenerWrapper.onWrapperDrag);
        };

        listenerWrapper.onWrapperEnd = (event: Event): void => {
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

    createDragListenerWrapper(listeners: DragListeners): DragListenerWrapper {
        return this.createDragGenericListenerWrapper(listeners, "mousemove");
    }

    createTouchDragListenerWrapper(listeners: DragListeners): DragListenerWrapper {
        return this.createDragGenericListenerWrapper(listeners, "touchmove");
    }

    addDragListener(listeners: DragListeners): void {
        const listenerWrapper = this.createDragListenerWrapper(listeners);
        const touchListenerWrapper = this.createTouchDragListenerWrapper(listeners);
        this.addNodeListener("touchstart", touchListenerWrapper.onWrapperStart);
        if (!Device.isMobileDevice()) {
            this.addNodeListener("mousedown", listenerWrapper.onWrapperStart);
        }

        // TODO: Replace with our body
        document.body.addEventListener("touchend", touchListenerWrapper.onWrapperEnd);
        if (!Device.isMobileDevice()) {
            document.body.addEventListener("mouseup", listenerWrapper.onWrapperEnd);
        }

        this.dragListeners.push(touchListenerWrapper);
        this.dragListeners.push(listenerWrapper);
    }

    removeDragListener(listeners: DragListeners): void {
        for (let i = this.dragListeners.length - 1; i >= 0; i -= 1) {
            if (this.dragListeners[i].onStart === listeners.onStart &&
                this.dragListeners[i].onDrag === listeners.onDrag &&
                this.dragListeners[i].onEnd === listeners.onEnd) {

                this.removeNodeListener("touchstart", this.dragListeners[i].onWrapperStart);
                document.body.removeEventListener("touchmove", this.dragListeners[i].onWrapperDrag);
                document.body.removeEventListener("touchmove", this.dragListeners[i].onWrapperEnd);
                this.removeNodeListener("mousedown", this.dragListeners[i].onWrapperStart);
                document.body.removeEventListener("mousemove", this.dragListeners[i].onWrapperDrag);
                document.body.removeEventListener("mousemove", this.dragListeners[i].onWrapperEnd);

                this.dragListeners.splice(i, 1);
            }
        }
    }
};

export const DraggableElement = Draggable();
