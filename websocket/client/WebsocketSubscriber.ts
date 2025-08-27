import {Dispatchable} from "../../base/Dispatcher";
import {WebsocketStreamHandler} from "./WebsocketStreamHandler";
import {toArray} from "../../base/Utils";
import {DEFAULT_HEARTBEAT_MESSAGE} from "../Shared";

type Callback = (...args: any[]) => void;

interface WebsocketSubscriberInterface {
    sendResubscribe(streamName: string, index: number): void;
    sendSubscribe(streamName: string): void;
    calcRetryTimeout(attempts: number): number;
}

function splitPayload(str: string): [string, string | null] {
    const delimitedIndex = str.indexOf(" ");
    if (delimitedIndex <= 0) {
        return [str, null];
    }
    return [
        str.substring(0, delimitedIndex),
        str.substring(delimitedIndex + 1).trim(),
    ];
}


// TODO cleanup & simplify
export class WebsocketSubscriber extends Dispatchable implements WebsocketSubscriberInterface {
    static ConnectionStatus = {
        NONE: 0,
        CONNECTING: 1,
        CONNECTED: 2,
        DISCONNECTED: 3
    } as const;

    // TODO sync globally cleaner
    static Global = (self as any).WEBSOCKET_URL ? new WebsocketSubscriber((self as any).WEBSOCKET_URL) : null;

    streamHandlers: Map<string, WebsocketStreamHandler> = new Map();
    attemptedConnect: boolean = false;
    connectionStatus: number = WebsocketSubscriber.ConnectionStatus.NONE;
    websocket: WebSocket | null = null;
    failedReconnectAttempts: number = 0;
    numConnectionAttempts: number = 0;
    retryDefaultTimeout: number = 3000;
    retryMaxTimeout: number = 30000;
    heartbeatMessage: string = DEFAULT_HEARTBEAT_MESSAGE;
    urls: string[];
    reconnectTimeout?: number;
    previousFailedReconnectAttempts?: number;

    constructor(urls: string | string[]) {
        super();
        this.urls = toArray(urls);
        //TODO: should probably try to connect right now?
    }

    setConnectionStatus(connectionStatus: number): void {
        this.connectionStatus = connectionStatus;
        this.dispatch("connectionStatus", connectionStatus);
    }

    getNextUrl(): string {
        const currentURLIndex = (this.numConnectionAttempts++) % this.urls.length;
        return this.urls[currentURLIndex];
    }

    connect(): void {
        const url = this.getNextUrl();
        this.setConnectionStatus(WebsocketSubscriber.ConnectionStatus.CONNECTING);
        try {
            console.log("WebsocketSubscriber: Connecting to " + url + " ...");
            this.websocket = new WebSocket(url);
            this.websocket.onopen = () => this.onWebsocketOpen();
            this.websocket.onmessage = (event) => this.onWebsocketMessage(event);
            this.websocket.onerror = (event) => this.onWebsocketError(event);
            this.websocket.onclose = (event) => this.onWebsocketClose(event);
        } catch (e: any) {
            this.tryReconnect();
            console.error("WebsocketSubscriber: Failed to connect to ", url, "\nError: ", e.message);
        }
    }

    calcRetryTimeout(numFailedAttempts: number): number {
        return Math.min(this.retryDefaultTimeout * numFailedAttempts, this.retryMaxTimeout);
    }

    tryReconnect(): void {
        const reconnectWait = this.calcRetryTimeout(this.failedReconnectAttempts);
        this.failedReconnectAttempts++;

        if (!this.reconnectTimeout) {
            this.reconnectTimeout = setTimeout(() => {
                this.reconnectTimeout = undefined;
                console.log("WebsocketSubscriber: Trying to reconnect websocket connection");
                this.connect();
            }, reconnectWait);
        }
    }

    subscribe(streamName: string): WebsocketStreamHandler {
        // TODO: make sure to not explicitly support streams with spaces in the name
        console.log("WebsocketSubscriber: Subscribing to stream ", streamName);

        if (!this.attemptedConnect) {
            this.connect();
            this.attemptedConnect = true;
        }

        if (this.streamHandlers.has(streamName)) {
            console.warn("WebsocketSubscriber: Already subscribed to stream ", streamName);
            return this.streamHandlers.get(streamName)!;
        }

        let streamHandler = new WebsocketStreamHandler(this, streamName);
        this.streamHandlers.set(streamName, streamHandler);

        // Check if the websocket connection is open, to see if we can send the subscription now
        if (this.isOpen()) {
            this.sendSubscribe(streamName);
        }

        return streamHandler;
    }

    isOpen(): boolean {
        return this.websocket?.readyState === 1;
    }

    sendSubscribe(streamName: string): void {
        if (this.isOpen()) {
            this.send("s " + streamName);
        }
    }

    sendResubscribe(streamName: string, index: number): void {
        if (this.isOpen()) {
            this.send("r " + index + " " + streamName);
        }
    }

    resubscribe(): void {
        // Iterate over all streams and resubscribe to them
        for (let streamHandler of this.streamHandlers.values()) {
            streamHandler.sendSubscribe();
        }
    }

    onStreamSubscribe(streamName: string): void {
        const streamHandler = this.getStreamHandler(streamName);
        if (!streamHandler) {
            console.error("WebsocketSubscriber: received subscribe success response for unrequested stream ", streamName);
            return;
        }
        console.log("WebsocketSubscriber: Successfully subscribed to stream", streamName);
        streamHandler.setStatusSubscribed();
    }

    onWebsocketOpen(): void {
        this.previousFailedReconnectAttempts = this.failedReconnectAttempts;
        this.failedReconnectAttempts = 0;
        console.log("WebsocketSubscriber: Websocket connection established!");

        this.reset();
        this.setConnectionStatus(WebsocketSubscriber.ConnectionStatus.CONNECTED);
        this.resubscribe();
    }

    handleMessageWithoutListeners(streamName: string, message: string): void {
        console.error("No handler for websocket stream", streamName);
    }

    handleServerError(payload: string): void {
        console.error("Websocket error:", payload);
        const [errorType, details] = splitPayload(payload);

        if (errorType === "invalidSubscription") {
            // Stop trying to resubscribe to a stream that's been rejected by the server
            const streamHandler = this.getStreamHandler(details);
            if (streamHandler) {
                // TODO: set permission denied explicitly?
                streamHandler.clearResubscribeTimeout();
            }
        }
    }

    handleStreamMessage(payload: string): void {
        const [streamName, message] = splitPayload(payload);

        if (message == null) {
            console.error("Could not process stream packet", payload);
            return;
        }

        const streamHandler = this.streamHandlers.get(streamName);

        if (!streamHandler) {
            this.handleMessageWithoutListeners(streamName, message);
            return;
        }

        streamHandler.processPacket(message);
    }

    handleServerClose(payload: string): void {
        this.failedReconnectAttempts = this.previousFailedReconnectAttempts || 0;
        console.error("WebsocketSubscriber: server fatal error close: ", payload);
        this.onWebsocketError(payload);
    }

    onWebsocketMessage(event: MessageEvent): void {
        const {data} = event;
        if (data === this.heartbeatMessage) {
            // TODO: keep track of the last heartbeat timestamp
            return;
        }

        const [type, payload] = splitPayload(data);

        if (type === "e" || type === "error") { // error
            this.handleServerError(payload!)
        } else if (type === "s") { // subscribed
            this.onStreamSubscribe(payload!);
        } else if (type === "m") { // stream message
            this.handleStreamMessage(payload!);
        } else if (type  === "c") { // command
            this.dispatch("serverCommand", payload);
        } else if (type == "close") {
            this.handleServerClose(payload!);
        } else {
            console.error("WebsocketSubscriber: Can't process " + event.data);
        }
    }

    reset(): void {
        this.setConnectionStatus(WebsocketSubscriber.ConnectionStatus.DISCONNECTED);
        for (const streamHandler of this.streamHandlers.values()) {
            streamHandler.resetStatus();
        }
    }

    onWebsocketError(event: Event | string): void {
        console.error("WebsocketSubscriber: Websocket connection is broken!");
        this.reset();
        this.tryReconnect();
    }

    onWebsocketClose(event: CloseEvent): void {
        console.log("WebsocketSubscriber: Connection closed!");
        this.reset();
        this.tryReconnect();
    }

    send(message: string): void {
        // TODO: if the websocket is not open, enqueue WebsocketSubscriber message to be sent on open or just fail?
        this.websocket!.send(message);
    }

    getStreamHandler(streamName: string): WebsocketStreamHandler | null {
        const streamHandler = this.streamHandlers.get(streamName);
        if (!streamHandler) {
            return null;
        }
        return streamHandler;
    }

    // this should be pretty much the only external function
    addStreamListener(streamName: string, callback: Callback): void {
        let streamHandler = this.getStreamHandler(streamName);
        if (!streamHandler) {
            streamHandler = this.subscribe(streamName);
        }
        if (streamHandler.callbackExists(callback)) {
            return;
        }
        streamHandler.addListener(callback);
    }

    removeStreamListener(streamName: string, callback: Callback): void {
        const streamHandler = this.streamHandlers.get(streamName);
        if (streamHandler) {
            streamHandler.removeListener(callback);
        }
    }

    static addListener(streamName: string, callback: Callback): void {
        return this.Global!.addStreamListener(streamName, callback);
    }
}