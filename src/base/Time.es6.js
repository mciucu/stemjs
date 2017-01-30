import {StemDate} from "../time/Date";

// TODO: need to take care of dependency on moment
// File meant to handle server time/client time differences
let ServerTime = {
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

// times should be in unix seconds
// TODO: should be in the time file
export function isDifferentDay(timeA, timeB) {
    if (Math.abs(timeA - timeB) > DAY_IN_MILLISECONDS / 1000) {
        return true;
    }
    // Check if different day of the month, when difference is less than a day
    return (StemDate.unix(timeA).getDate() !== StemDate.unix(timeB).getDate());
}

export function unix(timestamp) {
    return new Date(parseInt(timestamp * 1000));
}

export function format(date, pattern) {

}

export {ServerTime};

export * from "../time/Date";
export * from "../time/Duration";
