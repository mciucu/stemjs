import {NavManager} from "./NavManager";
import {Badge} from "../SimpleElements";
import {NodeAttributes} from "../NodeAttributes";

export class NavCounterBadge extends Badge {
    getDefaultOptions() {
        return {
            style: {
                right: "-5px",
                top: "30px",
                position: "absolute",
                zIndex: "1"
            },
            counter: 0
        };
    }

    extraNodeAttributes(attr: NodeAttributes): void {
        super.extraNodeAttributes(attr);
        if (this.options.counter === 0) {
            attr.addClass("hidden");
        } else {
            attr.removeClass("hidden");
        }
    }

    render(): number {
        return this.options.counter;
    }

    setValue(value: number): void {
        this.updateOptions({counter: value});
        NavManager.Global.checkForWrap();
    }

    getValue(): number {
        return this.options.counter;
    }

    increment(): void {
        this.setValue(this.getValue() + 1);
    }

    reset(): void {
        this.setValue(0);
    }

    attachListenerForAction(obj: any, eventName: string, action: (...args: any[]) => void, condition?: (...args: any[]) => boolean): void {
        this.attachListener(obj, eventName, (...args: any[]) => {
            if (!condition || !(typeof condition === "function") || condition(...args)) {
                action(...args);
            }
        });
    }

    attachListenerForIncrement(obj: any, eventName: string, condition?: (...args: any[]) => boolean): void {
        this.attachListenerForAction(obj, eventName, () => this.increment(), condition);
    }

    attachListenerForReset(obj: any, eventName: string, condition?: (...args: any[]) => boolean): void {
        this.attachListenerForAction(obj, eventName, () => this.reset(), condition);
    }
}