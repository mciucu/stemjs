import {UI} from "UIBase";

// TODO: simplify this if possible
// TODO: rename to DraggableMixin?
UI.Draggable = function(BaseClass) {
    class Draggable extends BaseClass {
        addClickListener(callback) {
            this.ensureFieldExists("_clickCallbacks", x => new Map());

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

            if (!this.hasOwnProperty("_clickDragListeners")) {
                this._clickDragListeners = new Map();
            }
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
            if (!this._clickCallbacks) {
                return;
            }
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

        createDragListenerWrapper(listeners) {
            let listenerWrapper = Object.assign({}, listeners);

            listenerWrapper.onWrapperDrag = (event) => {
                let deltaX = event.clientX - listenerWrapper._lastX;
                listenerWrapper._lastX = event.clientX;

                let deltaY = event.clientY - listenerWrapper._lastY;
                listenerWrapper._lastY = event.clientY;

                listeners.onDrag(deltaX, deltaY);
            };

            listenerWrapper.onWrapperStart = (event) => {
                listenerWrapper._lastX = event.clientX;
                listenerWrapper._lastY = event.clientY;

                if (listeners.onStart) {
                    listeners.onStart(event);
                }

                // TODO: Replace with our body
                document.body.addEventListener("mousemove", listenerWrapper.onWrapperDrag);
            };

            listenerWrapper.onWrapperEnd = (event) => {
                if (listeners.onEnd) {
                    listeners.onEnd(event)
                }
                // TODO: Replace with our body
                document.body.removeEventListener("mousemove", listenerWrapper.onWrapperDrag);
            };
            return listenerWrapper;
        }

        createTouchDragListenerWrapper(listeners) {
            let listenerWrapper = Object.assign({}, listeners);

            listenerWrapper.onWrapperDrag = (event) => {
                let touch = event.targetTouches[0];
                let deltaX = touch.pageX - listenerWrapper._lastX;
                listenerWrapper._lastX = touch.pageX;

                let deltaY = touch.pageY - listenerWrapper._lastY;
                listenerWrapper._lastY = touch.pageY;

                listeners.onDrag(deltaX, deltaY);
            };

            listenerWrapper.onWrapperStart = (event) => {
                let touch = event.targetTouches[0];
                listenerWrapper._lastX = touch.pageX;
                listenerWrapper._lastY = touch.pageY;

                if (listeners.onStart) {
                    listeners.onStart(event);
                }
                event.preventDefault();

                // TODO: Replace with our body
                document.body.addEventListener("touchmove", listenerWrapper.onWrapperDrag);
            };

            listenerWrapper.onWrapperEnd = (event) => {
                if (listeners.onEnd) {
                    listeners.onEnd(event);
                }
                // TODO: Replace with our body
                document.body.removeEventListener("touchmove", listenerWrapper.onWrapperDrag);
            };
            return listenerWrapper;
        }

        addDragListener(listeners) {
            let listenerWrapper = this.createDragListenerWrapper(listeners);
            let touchListenerWrapper = this.createTouchDragListenerWrapper(listeners);
            this.addDOMListener("touchstart", touchListenerWrapper.onWrapperStart);
            this.addDOMListener("mousedown", listenerWrapper.onWrapperStart);
            // TODO: Replace with our body
            document.body.addEventListener("touchend", touchListenerWrapper.onWrapperEnd);
            document.body.addEventListener("mouseup", listenerWrapper.onWrapperEnd);

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

                        this.removeDOMListener("touchstart", this._dragListeners[i].onWrapperStart);
                        document.body.removeEventListener("touchmove", this._dragListeners[i].onWrapperDrag);
                        document.body.removeEventListener("touchmove", this._dragListeners[i].onWrapperEnd);
                        this.removeDOMListener("mousedown", this._dragListeners[i].onWrapperStart);
                        document.body.removeEventListener("mousemove", this._dragListeners[i].onWrapperDrag);
                        document.body.removeEventListener("mousemove", this._dragListeners[i].onWrapperEnd);

                        this._dragListeners.splice(i, 1);
                    }
                }
            }
        }
    }

    return Draggable;
};
