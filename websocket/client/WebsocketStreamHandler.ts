// TODO @Mihai this was written originally in 2016, pretty old and crappy
import {Dispatcher} from "../../base/Dispatcher.js";


export class WebsocketStreamHandler extends Dispatcher {
    static NONE = Symbol();
    static SUBSCRIBING = Symbol();
    static SUBSCRIBED = Symbol();
    static UNSUBSCRIBED = Symbol();

    static MISSING_MESSAGE = "INVALID_MESSAGE_MISSING_FROM_ROLLING_WINDOW";

    constructor(websocketSubscriber, streamName, options={}) {
        super();
        this.websocketSubscriber = websocketSubscriber;
        this.streamName = streamName;
        this.options = options;
        this.bytesReceived = 0;
        this.isIndexed = false;
        this.lastMessageIndex = -1;
        this.messageBuffer = new Map();
        this.missedPackets = 0;
        this.resetStatus();
    }

    sendSubscribe() {
        const websocketSubscriber = this.websocketSubscriber;

        this.clearResubscribeTimeout();
        this.status = this.constructor.SUBSCRIBING;

        if (this.isIndexed) {
            websocketSubscriber.sendResubscribe(this.streamName, this.getLastIndex());
        } else {
            websocketSubscriber.sendSubscribe(this.streamName);
        }

        this.subscribeTryCount++;
        const timeoutDuration = websocketSubscriber.calcRetryTimeout(this.subscribeTryCount);

        this.resendSubscribeTimeout = setTimeout(() => {
            console.log("WebsocketSubscriber: stream subscribe timeout for #" + this.streamName + " reached! Trying to resubscribe again!");
            this.sendSubscribe();
        }, timeoutDuration);
    }

    clearResubscribeTimeout() {
        if (this.resendSubscribeTimeout) {
            clearTimeout(this.resendSubscribeTimeout);
            this.resendSubscribeTimeout = undefined;
        }
    }

    setStatusSubscribed() {
        this.clearResubscribeTimeout();
        this.status = this.constructor.SUBSCRIBED;
    }

    resetStatus() {
        this.clearResubscribeTimeout();
        this.status = this.constructor.NONE;
        this.subscribeTryCount = 0;
    }

    processPacket(packet) {
        this.bytesReceived += packet.length;

        let type, payload;
        if (packet[0] === "{") {
            type = "v";
            payload = packet;
        } else {
            let firstSpace = packet.indexOf(" ");
            if (firstSpace > 0) {
                type = packet.substr(0, firstSpace).trim();
                payload = packet.substr(firstSpace + 1).trim();
            } else {
                console.error("WebsocketStreamHandler: Could not process stream packet: " + packet);
                return;
            }
        }

        if (type === "i") {
            this.processIndexedPacket(payload);
        } else if (type === "v") {
            this.processVanillaPacket(payload);
        } else {
            console.error("WebsocketStreamHandler: invalid packet type " + type);
        }
    }

    processIndexedMessage(index, message) {
        this.isIndexed = true;
        if (this.lastMessageIndex === -1) {
            this.lastMessageIndex = index;
            this.processVanillaPacket(message);
        } else if (this.lastMessageIndex + 1 === index) {
            this.lastMessageIndex = index;
            this.processVanillaPacket(message);
            ++index;
            while (this.messageBuffer.has(index)) {
                message = this.messageBuffer.get(index);
                this.messageBuffer.delete(index);
                this.lastMessageIndex = index;
                this.processVanillaPacket(message);
                ++index;
            }
        } else {
            this.messageBuffer.set(index, message);
        }
    }

    processMissedPacket(packet) {
        this.processIndexedMessage(parseInt(packet), WebsocketStreamHandler.MISSING_MESSAGE);
    }

    processVanillaPacket(packet) {
        if (packet == WebsocketStreamHandler.MISSING_MESSAGE) {
            this.missedPackets++;
        }

        if (!this.options.rawMessage) {
            try {
                packet = JSON.parse(packet);
            } catch (exception) {
                if (!this.options.parseMayFail) {
                    console.error("WebsocketStreamHandler: Failed to parse ", packet, " on stream ", this.streamName,
                                  " Exception:", exception.message);
                    return;
                }
            }
        }
        this.dispatch(packet);
    }

    processIndexedPacket(packet) {
        let firstSpace = packet.indexOf(" ");
        let message, index;
        if (firstSpace > 0) {
            index = parseInt(packet.substr(0, firstSpace).trim());
            message = packet.substr(firstSpace + 1).trim();
        } else {
            console.error("WebsocketStreamHandler: Could not process indexed stream packet: " + packet);
            return;
        }

        this.processIndexedMessage(index, message);
    }

    haveIndex() {
        return this.isIndexed;
    }

    getLastIndex() {
        return this.lastMessageIndex;
    }
}
