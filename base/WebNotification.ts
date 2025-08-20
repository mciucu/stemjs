import {Dispatchable} from "./Dispatcher";
import {EnqueueableMethodMixin, enqueueIfNotLoaded} from "./EnqueueableMethodMixin";

interface WebNotificationOptions extends NotificationOptions {
    title: string;
}

type NotificationClickListener = (event: Event) => void;
type NotificationErrorListener = (event: Event) => void;

export class WebNotification extends EnqueueableMethodMixin(Dispatchable) {
    private options: WebNotificationOptions;
    private declare _notification?: Notification;
    private declare clickListeners?: NotificationClickListener[];
    private declare errorListeners?: NotificationErrorListener[];

    constructor(options: WebNotificationOptions) {
        super();
        this.options = options;
    }

    isLoaded(): boolean {
        return !!this._notification;
    }

    show(): void {
        if (!this.constructor.isSupported()) {
            console.error("Notifications not supported by browser.");
            return;
        }
        this._notification = new self.Notification(this.options.title, Object.assign(this.constructor.defaultOptions, this.options));
    }

    @enqueueIfNotLoaded
    hide(): void {
        this._notification!.close();
        delete this._notification;
    }

    @enqueueIfNotLoaded
    addClickListener(callback: NotificationClickListener): void {
        this.clickListeners = this.clickListeners || [];
        this.clickListeners.push(callback);
        this._notification!.onclick = (event: Event) => {
            for (const callback of this.clickListeners!) {
                callback(event);
            }
        }
    }

    @enqueueIfNotLoaded
    addErrorListener(callback: NotificationErrorListener): void {
        this.errorListeners = this.errorListeners || [];
        this.errorListeners.push(callback);
        this._notification!.onerror = (event: Event) => {
            console.log(event);
            for (const callback of this.errorListeners!) {
                callback(event);
            }
        }
    }

        static defaultOptions: NotificationOptions = {};

    static isSupported(): boolean {
        return self.hasOwnProperty("Notification");
    }

    static getPermissionStatus(): NotificationPermission {
        return self.Notification.permission;
    }

    static isAllowed(): boolean {
        return this.getPermissionStatus() === "granted";
    }

    static requestPermission(callback?: NotificationPermissionCallback): void {
        if (this.getPermissionStatus() !== "denied") {
            self.Notification.requestPermission(callback);
        } else {
            console.error("Notification permission already denied");
        }
    }

    static setDefaultOptions(options: NotificationOptions): void {
        this.defaultOptions = options;
    }

    static updateDefaultOptions(options: NotificationOptions): void {
        this.defaultOptions = Object.assign(this.defaultOptions, options);
    }
}
