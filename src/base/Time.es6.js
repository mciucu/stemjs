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

export {ServerTime};
