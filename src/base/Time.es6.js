// File meant to handle server time/client time differences

class ServerTime {
    static getServerOffset() {

    }

    static now() {
        // TODO: user performance.timing to figure out when the server time was received
    }

    static update(serverTime, estimatedLatency) {
    }
}

function getUnixTime() {
    return Date.now() / 1000.0;
}

export const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

// times should be in unix seconds
// TODO: should be in the time file
export function isDifferentDay(timaA, timeB) {
    if (Math.max(timaA, timeB) - Math.min(timaA, timeB) > DAY_IN_MILLISECONDS / 1000) {
        return true;
    }
    // Check if different day of the week, when difference is less than a day
    if (moment.unix(timaA).day() !== moment.unix(timeB).day()) {
        return true;
    }
    return false;
}

export {ServerTime};
