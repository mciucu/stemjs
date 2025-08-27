import {ActionStatus} from "../Constants.js";
import {Button} from "./Button.jsx";

export class StateButton extends Button {
    setOptions(options) {
        options.state = (this.options && this.options.state) || options.state || ActionStatus.INITIAL;

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
        if (status === ActionStatus.INITIAL) {
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
