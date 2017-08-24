import {Ajax} from "../../base/Ajax";
import {IconableInterface} from "../Bootstrap3";
import {UI} from "../UIBase";
import {ActionStatus} from "../Constants";
import {registerStyle} from "../style/Theme";
import {ButtonStyle} from "./ButtonStyle";

@registerStyle(ButtonStyle)
class Button extends UI.Primitive(IconableInterface, "button") {
    extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.DEFAULT);

        if (this.getSize()) {
            attr.addClass(this.styleSheet.Size(this.getSize()));
        }

        if (this.getLevel()) {
            attr.addClass(this.styleSheet.Level(this.getLevel()));
        }
    }

    disable() {
        this.options.disabled = true;
        this.node.disabled = true;
    }

    enable() {
        this.options.disabled = false;
        this.node.disabled = false;
    }

    setEnabled(enabled) {
        this.options.disabled = !enabled;
        this.node.disabled = !enabled;
    };
}


class StateButton extends Button {
    setOptions(options) {
        options.state = (this.options && this.options.state) || options.state || ActionStatus.DEFAULT;

        super.setOptions(options);

        this.options.statusOptions = this.options.statusOptions || [];
        for (let i = 0; i < 4; i += 1) {
            if (typeof this.options.statusOptions[i] === "string") {
                let statusLabel = this.options.statusOptions[i];
                this.options.statusOptions[i] = {
                    label: statusLabel,
                    faIcon: ""
                }
            }
        }
    }

    setState(status) {
        this.options.state = status;
        if (status === ActionStatus.DEFAULT) {
            this.enable();
        } else if (status === ActionStatus.RUNNING) {
            this.disable();
        } else if (status === ActionStatus.SUCCESS) {
        } else if (status === ActionStatus.FAILED) {
        }

        this.redraw();
    }

    render() {
        let stateOptions = this.options.statusOptions[this.options.state - 1];

        this.options.label = stateOptions.label;
        this.options.faIcon = stateOptions.faIcon;

        return super.render();
    }
}


class AjaxButton extends StateButton {
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
            this.setState(ActionStatus.DEFAULT);
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

export {Button, StateButton, AjaxButton};
