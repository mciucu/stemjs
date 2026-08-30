import {Ajax} from "../../base/Ajax";
import {ActionStatus} from "../Constants";
import {StateButton} from "./StateButton";

export interface AjaxButtonOptions {
    ajaxHandler?: typeof Ajax;
    resetToDefaultTimeout?: number;
}

// TODO @types rename to RequestButton, remove Ajax references
export class AjaxButton extends StateButton<AjaxButtonOptions> {
    declare stateResetTimeout?: ReturnType<typeof setTimeout>;

    // Installed on the prototype at the bottom of this file, each forwarding to the handler's own method
    declare fetch: typeof Ajax.fetch;
    declare request: typeof Ajax.request;
    declare get: typeof Ajax.get;
    declare post: typeof Ajax.post;
    declare getJSON: typeof Ajax.getJSON;
    declare postJSON: typeof Ajax.postJSON;

    getDefaultOptions(): Partial<AjaxButtonOptions> {
        return Object.assign(super.getDefaultOptions() || {}, {
            resetToDefaultTimeout: 1000
        });
    }

    getAjaxHandler() {
        return this.options.ajaxHandler || Ajax;
    }

    setAjaxHandler(ajaxHandler: typeof Ajax) {
        this.options.ajaxHandler = ajaxHandler;
    }

    clearResetTimeout() {
        if (this.stateResetTimeout) {
            clearTimeout(this.stateResetTimeout);
            delete this.stateResetTimeout;
        }
    }

    scheduleStateReset() {
        this.clearResetTimeout();
        this.stateResetTimeout = setTimeout(() => {
            this.setState(ActionStatus.INITIAL);
            this.clearResetTimeout();
        }, this.options.resetToDefaultTimeout);
    }

    // TODO @types rename to makeRequest
    ajax(methodName: string, ...args: any[]) {
        this.setState(ActionStatus.RUNNING);
        let ajaxPromise = this.getAjaxHandler()[methodName](...args);
        ajaxPromise.getPromise().then(
            (data) => {
                this.setState(ActionStatus.SUCCESS);
                this.scheduleStateReset();
            },
            (error) => {
                this.setState(ActionStatus.FAILED);
                this.scheduleStateReset();
            }
        );
        return ajaxPromise;
    }

    ajaxCall(data: any) {
        return this.ajax("fetch", data);
    }
}

for (const methodName of ["fetch", "request", "get", "post", "getJSON", "postJSON"]) {
    (AjaxButton.prototype as any)[methodName] = function(...args: any[]) {
        return this.ajax(methodName, ...args);
    }
}
