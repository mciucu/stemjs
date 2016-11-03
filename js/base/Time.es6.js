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

export {ServerTime};
