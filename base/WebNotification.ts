import {Dispatchable} from "../base/Dispatcher";
import {EnqueueableMethodMixin, enqueueIfNotLoaded} from "../base/EnqueueableMethodMixin";


export class WebNotification extends EnqueueableMethodMixin(Dispatchable) {
    static isSupported() {
        return self.hasOwnProperty("Notification");
    }

    static getPermissionStatus() {
        return self.Notification.permission;
    }

    static isAllowed() {
        return this.getPermissionStatus() === "granted";
    }

    static requestPermission(callback) {
        if (this.getPermissionStatus() !== "denied") {
            self.Notification.requestPermission(callback);
        } else {
            console.error("Notification permission already denied");
        }
    }

    static defaultOptions = {};
    static setDefaultOptions(options) {
        this.defaultOptions = options;
    }

    static updateDefaultOptions(options) {
        this.defaultOptions = Object.assign(this.defaultOptions, options);
    }

    constructor(options) {
        super();
        this.options = options;
    }

    isLoaded() {
        return !!this._notification;
    }

    show() {
        if (!this.constructor.isSupported()) {
            console.error("Notifications not supported by browser.");
            return;
        }
        this._notification = new self.Notification(this.options.title, Object.assign(this.constructor.defaultOptions, this.options));
    }

    @enqueueIfNotLoaded
    hide() {
        this._notification.close();
        delete this._notification;
    }

    @enqueueIfNotLoaded
    addClickListener(callback) {
        this.clickListeners = this.clickListeners || [];
        this.clickListeners.push(callback);
        this._notification.onclick = (event) => {
            for (const callback of this.clickListeners) {
                callback(event);
            }
        }
    }

    @enqueueIfNotLoaded
    addErrorListener(callback) {
        this.errorListeners = this.errorListeners || [];
        this.errorListeners.push(callback);
        this._notification.onerror = (event) => {
            console.log(event);
            for (const callback of this.errorListeners) {
                callback(event);
            }
        }
    }
}
