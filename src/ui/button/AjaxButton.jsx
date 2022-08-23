import {Ajax} from "../../base/Ajax.js";
import {ActionStatus} from "../Constants.js";
import {StateButton} from "./StateButton.jsx";

export class AjaxButton extends StateButton {
    getDefaultOptions() {
        return Object.assign(super.getDefaultOptions() || {}, {
            resetToDefaultTimeout: 1000
        });
    }

    getAjaxHandler() {
        return this.options.ajaxHandler || Ajax;
    }

    setAjaxHandler(ajaxHandler) {
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
        }, this.resetToDefaultTimeout);
    }

    ajax(methodName, ...args) {
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

    ajaxCall(data) {
        return this.ajax("fetch", data);
    }
}

for (const methodName of ["fetch", "request", "get", "post", "getJSON", "postJSON"]) {
    AjaxButton.prototype[methodName] = function(...args) {
        return this.ajax(methodName, ...args);
    }
}
