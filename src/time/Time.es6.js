import {StemDate} from "./Date";

// File meant to handle server time/client time differences
let ServerTime = {
    // TODO: this should return a StemDate, change it
    now() {
        return Date.now() - this.getOffset();
    },

    unixNow() {
        return this.now() / 1000.0;
    },

    getOffset() {
        return this.offset;
    },

    setPageLoadTime(unixTime, estimatedLatency=0) {
        this.serverPageLoad = unixTime;
        this.offset = performance.timing.responseStart - unixTime * 1000;
    }
};

export const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

// TODO: should have a generic method time1.isSame("x", time);
export function isDifferentDay(timeA, timeB) {
    timeA = StemDate(timeA);
    timeB = StemDate(timeB);
    if (+timeA - timeB > DAY_IN_MILLISECONDS) {
        return true;
    }
    // Check if different day of the month, when difference is less than a day
    return (timeA.getDate() !== timeB.getDate());
}

export function unix(timestamp) {
    return new Date(parseInt(timestamp * 1000));
}

export function format(date, pattern) {

}

export {ServerTime};

export * from "./Date";
export * from "./Duration";
