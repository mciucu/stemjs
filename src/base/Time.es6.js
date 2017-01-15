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
    if (Math.max(timeA, timeB) - Math.min(timeA, timeB) > DAY_IN_MILLISECONDS / 1000) {
        return true;
    }
    // Check if different day of the week, when difference is less than a day
    if (moment.unix(timeA).day() !== moment.unix(timeB).day()) {
        return true;
    }
    return false;
}

export {ServerTime};
