import {lazyInit} from "../decorators/Decorators";

let DoubleClickable = (BaseClass) => class DoubleClickable extends BaseClass {
    // @lazyInit
    singleClickCallbacks = new Map();

    // @lazyInit
    doubleClickCallbacks = new Map();

    addClickListener(callback) {
        if (this.singleClickCallbacks.has(callback)) {
            return;
        }

        let callbackWrapper = () => {
            let now = Date.now();

            if (!this.hasOwnProperty("_singleClickTime") || now - this._singleClickTime >= this.getSingleClickTimeout()) {
                // It's a single click
                // TODO: why is this wrapped in a setTimeout?
                setTimeout(() => {
                    this._singleClickTime = now;
                });
                setTimeout(() => {
                    if (this.hasOwnProperty("_singleClickTime") && this._singleClickTime === now) {
                        callback();
                    }
                }, this.getSingleClickTimeout());
            } else {
                // It's a double click
                setTimeout(() => {
                    delete this._singleClickTime;
                });
            }
        };
        this.singleClickCallbacks.set(callback, callbackWrapper);
        super.addClickListener(callbackWrapper);
    }

    getSingleClickTimeout() {
        return 250;
    }

    removeClickListener(callback) {
        let callbackWrapper = this.singleClickCallbacks.get(callback);
        if (callbackWrapper) {
            this.singleClickCallbacks.delete(callback);
            super.removeClickListener(callbackWrapper);
        }
    }

    addDoubleClickListener(callback) {
        if (this.doubleClickCallbacks.has(callback)) {
            return;
        }

        let callbackWrapper = () => {

            let now = new Date().getTime();

            if (!this.hasOwnProperty("_singleClickTime") ||
                now - this._singleClickTime >= this.getSingleClickTimeout()) {
                // It's a single click
                setTimeout(() => {
                    this._singleClickTime = now;
                });
            } else {
                // It's a double click
                setTimeout(() => {
                    delete this._singleClickTime;
                });
                callback();
            }
        };
        this.doubleClickCallbacks.set(callback, callbackWrapper);
        super.addClickListener(callbackWrapper);
    }

    removeDoubleClickListener(callback) {
        let callbackWrapper = this.doubleClickCallbacks.get(callback);
        if (callbackWrapper) {
            this.doubleClickCallbacks.delete(callback);
            super.removeClickListener(callbackWrapper);
        }
    }
};

export {DoubleClickable}
