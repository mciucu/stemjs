import {ActionStatus, type ActionStatusType} from "../Constants";
import {Button, type ButtonOptions} from "./Button";
import {type UIChild} from "../UIBase";
import {BaseUIElement} from "../UIBase";

export interface StatusOption {
    label: UIChild;
    faIcon: string;
}

export type StateButtonOptions = ButtonOptions & StatusOption & {
    faIcon?: string;
    state?: ActionStatusType;
    statusOptions?: (string | StatusOption)[];
};

export class StateButton<ExtraOptions = {}> extends Button<StateButtonOptions & ExtraOptions> {
    setOptions(options: typeof this.options): void {
        options.state = this.options?.state || options.state || ActionStatus.INITIAL;

        super.setOptions(options);

        this.options.statusOptions = this.options.statusOptions || [];
        for (let i = 0; i < 4; i += 1) {
            if (typeof this.options.statusOptions[i] === "string") {
                const statusLabel = this.options.statusOptions[i] as string;
                this.options.statusOptions[i] = {
                    label: statusLabel,
                    faIcon: ""
                };
            }
        }
    }

    setState(status: ActionStatusType): void {
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

    render(): UIChild {
        const stateOptions = this.options.statusOptions![this.options.state! - 1] as StatusOption;

        this.options.label = stateOptions.label;
        this.options.faIcon = stateOptions.faIcon;

        return super.render();
    }
}
