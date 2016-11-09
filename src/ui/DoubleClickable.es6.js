import {UI} from "./UIBase";

UI.DoubleClickable = function(BaseClass) {
    return class DoubleClickable extends BaseClass {
        addClickListener(callback) {
            this.ensureFieldExists("_singleClickCallbacks", x => new Map());

            if (this._singleClickCallbacks.has(callback)) {
                return;
            }

            let callbackWrapper = () => {
                let now = Date.now();

                if (!this.hasOwnProperty("_singleClickTime") ||
                    now - this._singleClickTime >= this.getSingleClickTimeout()) {
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
            this._singleClickCallbacks.set(callback, callbackWrapper);
            super.addClickListener(callbackWrapper);
        }

        getSingleClickTimeout() {
            return 250;
        }

        removeClickListener(callback) {
            if (!this._singleClickCallbacks) {
                return;
            }
            let callbackWrapper = this._singleClickCallbacks.get(callback);
            if (callbackWrapper) {
                this._singleClickCallbacks.delete(callback);
                super.removeClickListener(callbackWrapper);
            }
        }

        addDoubleClickListener(callback) {
            this.ensureFieldExists("_doubleClickCallbacks", x => new Map());

            if (this._doubleClickCallbacks.has(callback)) {
                return;
            }

            let callbackWrapper = () => {

                let now = new Date().getTime();
                console.log(now);

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
            this._doubleClickCallbacks.set(callback, callbackWrapper);
            super.addClickListener(callbackWrapper);
        }

        removeDoubleClickListener(callback) {
            if (!this._doubleClickCallbacks) {
                return;
            }
            let callbackWrapper = this._doubleClickCallbacks.get(callback);
            if (callbackWrapper) {
                this._doubleClickCallbacks.delete(callback);
                super.removeClickListener(callbackWrapper);
            }
        }
    }
};
