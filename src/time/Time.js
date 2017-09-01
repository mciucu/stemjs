import {StemDate} from "./Date";
import {TimeUnit} from "./Duration"

// File meant to handle server time/client time differences
let ServerTime = {
    now() {
        return StemDate().subtract(this.getOffset());
    },

    getOffset() {
        return this.offset;
    },

    set(date, onlyIfMissing=false) {
        if (!onlyIfMissing || this.offset == null) {
            this.offset = Date.now() - (new StemDate(date));
        }
    },

    setPageLoadTime(unixTime, estimatedLatency=0) {
        this.serverPageLoad = unixTime;
        this.offset = performance.timing.responseStart - unixTime * 1000;
    }
};

// TODO: should use +TimeUnit.DAY
export const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

// TODO: should have a generic method time1.isSame("x", time);
export function isDifferentDay(timeA, timeB) {
    // return !StemDate(timeA).same(TimeUnit.DAY, timeB);
    timeA = StemDate(timeA);
    timeB = StemDate(timeB);

    // First check if difference is gre
    if (timeA.diff(timeB) > +TimeUnit.DAY) {
        return true;
    }
    // Check if different day of the month, when difference is less than a day
    return (timeA.getDate() !== timeB.getDate());
}

export {ServerTime};

export * from "./Date";
export * from "./Duration";
