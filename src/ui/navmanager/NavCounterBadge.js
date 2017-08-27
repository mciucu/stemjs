import {NavManager} from "./NavManager";
import {Badge} from "../Bootstrap3";

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

    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        if (this.options.counter === 0) {
            attr.addClass("hidden");
        } else {
            attr.removeClass("hidden");
        }
    }

    render() {
        return this.options.counter;
    }

    setValue(value) {
        this.updateOptions({counter: value});
        NavManager.Global.checkForWrap();
    }

    getValue() {
        return this.options.counter;
    }

    increment() {
        this.setValue(this.getValue() + 1);
    }

    reset() {
        this.setValue(0);
    }

    attachListenerForAction(obj, eventName, action, condition) {
        this.attachListener(obj, eventName, (...args) => {
            if (!condition || !(typeof condition === "function") || condition(...args)) {
                action(...args);
            }
        });
    }

    attachListenerForIncrement(obj, eventName, condition) {
        this.attachListenerForAction(obj, eventName, () => this.increment(), condition);
    }

    attachListenerForReset(obj, eventName, condition) {
        this.attachListenerForAction(obj, eventName, () => this.reset(), condition);
    }
}