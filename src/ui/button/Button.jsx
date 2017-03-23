import {Ajax} from "../../base/Ajax";
import {GlobalStyle} from "../GlobalStyle";
import {IconableInterface} from "../Bootstrap3";
import {UI} from "../UIBase";


class Button extends UI.Primitive(IconableInterface, "button") {
    extraNodeAttributes(attr) {
        attr.addClass(GlobalStyle.Button.DEFAULT);

        if (this.getSize()) {
            attr.addClass(GlobalStyle.Button.Size(this.getSize()));
        }

        if (this.getLevel()) {
            attr.addClass(GlobalStyle.Button.Level(this.getLevel()));
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
        options.state = (this.options && this.options.state) || options.state || UI.ActionStatus.DEFAULT;

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
        if (status === UI.ActionStatus.DEFAULT) {
            this.enable();
        } else if (status === UI.ActionStatus.RUNNING) {
            this.disable();
        } else if (status === UI.ActionStatus.SUCCESS) {
        } else if (status === UI.ActionStatus.FAILED) {
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
    ajaxCall(data) {
        this.setState(UI.ActionStatus.RUNNING);
        Ajax.fetch(Object.assign({}, data, {
            success: (successData) => {
                data.success(successData);
                if (successData.error) {
                    this.setState(UI.ActionStatus.FAILED);
                } else {
                    this.setState(UI.ActionStatus.SUCCESS);
                }
            },
            error: (xhr, errmsg, err) => {
                data.error(xhr, errmsg, err);
                this.setState(UI.ActionStatus.FAILED);
            },
            complete: () => {
                setTimeout(() => {
                    this.setState(UI.ActionStatus.DEFAULT);
                }, this.options.onCompete || 1000);
            }
        }));
    }
}

export {Button, StateButton, AjaxButton};
