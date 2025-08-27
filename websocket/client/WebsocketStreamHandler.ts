// TODO @Mihai this was written originally in 2016, pretty old and crappy
import {Dispatcher} from "../../base/Dispatcher";

interface WebsocketSubscriber {
    sendResubscribe(streamName: string, index: number): void;
    sendSubscribe(streamName: string): void;
    calcRetryTimeout(attempts: number): number;
}

interface StreamHandlerOptions {
    rawMessage?: boolean;
    parseMayFail?: boolean;
}

export class WebsocketStreamHandler extends Dispatcher {
    static NONE = Symbol();
    static SUBSCRIBING = Symbol();
    static SUBSCRIBED = Symbol();
    static UNSUBSCRIBED = Symbol();

    static MISSING_MESSAGE = "INVALID_MESSAGE_MISSING_FROM_ROLLING_WINDOW";

    websocketSubscriber: WebsocketSubscriber;
    streamName: string;
    declare options: StreamHandlerOptions;
    bytesReceived: number;
    isIndexed: boolean;
    lastMessageIndex: number;
    messageBuffer: Map<number, string>;
    missedPackets: number;
    status: symbol;
    subscribeTryCount: number;
    resendSubscribeTimeout?: number;

    constructor(websocketSubscriber: WebsocketSubscriber, streamName: string, options: StreamHandlerOptions = {}) {
        super();
        this.websocketSubscriber = websocketSubscriber;
        this.streamName = streamName;
        this.options = options;
        this.bytesReceived = 0;
        this.isIndexed = false;
        this.lastMessageIndex = -1;
        this.messageBuffer = new Map();
        this.missedPackets = 0;
        this.subscribeTryCount = 0;
        this.resetStatus();
    }

    sendSubscribe(): void {
        const websocketSubscriber = this.websocketSubscriber;

        this.clearResubscribeTimeout();
        this.status = WebsocketStreamHandler.SUBSCRIBING;

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

    clearResubscribeTimeout(): void {
        if (this.resendSubscribeTimeout) {
            clearTimeout(this.resendSubscribeTimeout);
            this.resendSubscribeTimeout = undefined;
        }
    }

    setStatusSubscribed(): void {
        this.clearResubscribeTimeout();
        this.status = WebsocketStreamHandler.SUBSCRIBED;
    }

    resetStatus(): void {
        this.clearResubscribeTimeout();
        this.status = WebsocketStreamHandler.NONE;
        this.subscribeTryCount = 0;
    }

    processPacket(packet: string): void {
        this.bytesReceived += packet.length;

        let payloadType: string, payload: string;
        if (packet[0] === "{") {
            payloadType = "v";
            payload = packet;
        } else {
            let firstSpace = packet.indexOf(" ");
            if (firstSpace > 0) {
                payloadType = packet.substring(0, firstSpace).trim();
                payload = packet.substring(firstSpace + 1).trim();
            } else {
                console.error("WebsocketStreamHandler: Could not process stream packet: " + packet);
                return;
            }
        }

        if (payloadType === "i") {
            this.processIndexedPacket(payload);
        } else if (payloadType === "v") {
            this.processVanillaPacket(payload);
        } else {
            console.error("WebsocketStreamHandler: invalid packet type " + payloadType);
        }
    }

    processIndexedMessage(index: number, message: string) {
        this.isIndexed = true;
        if (this.lastMessageIndex === -1) {
            this.lastMessageIndex = index;
            this.processVanillaPacket(message);
        } else if (this.lastMessageIndex + 1 === index) {
            this.lastMessageIndex = index;
            this.processVanillaPacket(message);
            ++index;
            while (this.messageBuffer.has(index)) {
                message = this.messageBuffer.get(index)!;
                this.messageBuffer.delete(index);
                this.lastMessageIndex = index;
                this.processVanillaPacket(message);
                ++index;
            }
        } else {
            this.messageBuffer.set(index, message);
        }
    }

    processMissedPacket(packet: string) {
        this.processIndexedMessage(parseInt(packet), WebsocketStreamHandler.MISSING_MESSAGE);
    }

    processVanillaPacket(packet: string) {
        if (packet == WebsocketStreamHandler.MISSING_MESSAGE) {
            this.missedPackets++;
        }

        if (!this.options.rawMessage) {
            try {
                packet = JSON.parse(packet);
            } catch (exception: any) {
                if (!this.options.parseMayFail) {
                    console.error("WebsocketStreamHandler: Failed to parse ", packet, " on stream ", this.streamName,
                                  " Exception:", exception.message);
                    return;
                }
            }
        }
        this.dispatch(packet);
    }

    processIndexedPacket(packet: string) {
        let firstSpace = packet.indexOf(" ");
        let message: string, index: number;
        if (firstSpace > 0) {
            index = parseInt(packet.substring(0, firstSpace).trim());
            message = packet.substring(firstSpace + 1).trim();
        } else {
            console.error("WebsocketStreamHandler: Could not process indexed stream packet: " + packet);
            return;
        }

        this.processIndexedMessage(index, message);
    }

    haveIndex(): boolean {
        return this.isIndexed;
    }

    getLastIndex(): number {
        return this.lastMessageIndex;
    }
}