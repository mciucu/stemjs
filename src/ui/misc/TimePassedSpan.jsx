import {UI} from "../UIBase.js";
import {Dispatchable} from "../../base/Dispatcher.js";

export class TimePassedSpan extends UI.Primitive("span") {
    render() {
        return this.getTimeDeltaDisplay(this.options.timeStamp);
    }

    getDefaultOptions() {
        return {
            style: {
                color: "#aaa"
            }
        }
    }

    getTimeDeltaDisplay(timeStamp) {
        let timeNow = Date.now();
        let timeDelta = parseInt((timeNow - timeStamp * 1000) / 1000);
        let timeUnitsInSeconds = [31556926, 2629743, 604800, 86400, 3600, 60];
        let timeUnits = ["year", "month", "week", "day", "hour", "minute"];
        if (timeDelta < 0) {
            timeDelta = 0;
        }
        for (let i = 0; i < timeUnits.length; i += 1) {
            let value = parseInt(timeDelta / timeUnitsInSeconds[i]);
            if (timeUnitsInSeconds[i] <= timeDelta) {
                return value + " " + timeUnits[i] + (value > 1 ? "s" : "") + " ago";
            }
        }
        return "Few seconds ago";
    }

    static addIntervalListener(callback) {
        if (!this.updateFunction) {
            this.TIME_DISPATCHER = new Dispatchable();
            this.updateFunction = setInterval(() => {
                this.TIME_DISPATCHER.dispatch("updateTimeValue");
            }, 5000);
        }
        return this.TIME_DISPATCHER.addListener("updateTimeValue", callback);
    }

    onMount() {
        this._updateListener = this.constructor.addIntervalListener(() => {
            this.redraw();
        })
    }

    onUnmount() {
        this._updateListener && this._updateListener.remove();
    }
}
