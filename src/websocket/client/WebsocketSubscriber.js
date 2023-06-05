import {Dispatchable} from "../../base/Dispatcher.js";
import {WebsocketStreamHandler} from "./WebsocketStreamHandler.js";
import {toArray} from "../../base/Utils.js";

function splitPayload(str) {
    const delimitedIndex = str.indexOf(" ");
    if (delimitedIndex <= 0) {
        return [str, null];
    }
    return [
        str.substring(0, delimitedIndex),
        str.substring(delimitedIndex + 1).trim(),
    ]
}


// TODO cleanup & simplify
export class WebsocketSubscriber extends Dispatchable {
    static ConnectionStatus = {
        NONE: 0,
        CONNECTING: 1,
        CONNECTED: 2,
        DISCONNECTED: 3
    };

    static CONNECT_RETRY_TIMEOUT = 3000;
    static CONNECT_RETRY_MAX_TIMEOUT = 30000;

    static HEARTBEAT_MESSAGE = "-heartbeat-city-";

    constructor(urls=self.WEBSOCKET_URL) {
        super();
        this.urls = toArray(urls);
        this.streamHandlers = new Map();
        this.attemptedConnect = false;
        this.connectionStatus = WebsocketSubscriber.ConnectionStatus.NONE;
        this.websocket = null;
        this.failedReconnectAttempts = 0;
        this.numConnectionAttempts = 0;
        //TODO: should probably try to connect right now?
    }

    setConnectionStatus(connectionStatus) {
        this.connectionStatus = connectionStatus;
        this.dispatch("connectionStatus", connectionStatus);
    }

    getNextUrl() {
        const currentURLIndex = (this.numConnectionAttempts++) % this.urls.length;
        return this.urls[currentURLIndex];
    }

    connect() {
        const url = this.getNextUrl();
        this.setConnectionStatus(WebsocketSubscriber.ConnectionStatus.CONNECTING);
        try {
            console.log("WebsocketSubscriber: Connecting to " + url + " ...");
            this.websocket = new WebSocket(url);
            this.websocket.onopen = () => this.onWebsocketOpen();
            this.websocket.onmessage = (event) => this.onWebsocketMessage(event);
            this.websocket.onerror = (event) => this.onWebsocketError(event);
            this.websocket.onclose = (event) => this.onWebsocketClose(event);
        } catch (e) {
            this.tryReconnect();
            console.error("WebsocketSubscriber: Failed to connect to ", url, "\nError: ", e.message);
        }
    }

    tryReconnect() {
        let reconnectWait = Math.min(WebsocketSubscriber.CONNECT_RETRY_TIMEOUT * this.failedReconnectAttempts,
                                     WebsocketSubscriber.CONNECT_RETRY_MAX_TIMEOUT);

        this.failedReconnectAttempts++;

        if (!this.reconnectTimeout) {
            this.reconnectTimeout = setTimeout(() => {
                this.reconnectTimeout = null;
                console.log("WebsocketSubscriber: Trying to reconnect websocket connection");
                this.connect();
            }, reconnectWait);
        }
    }

    subscribe(streamName) {
        // TODO: make sure to not explicitly support streams with spaces in the name
        console.log("WebsocketSubscriber: Subscribing to stream ", streamName);

        if (!this.attemptedConnect) {
            this.connect();
            this.attemptedConnect = true;
        }

        if (this.streamHandlers.has(streamName)) {
            console.warning("WebsocketSubscriber: Already subscribed to stream ", streamName);
            return;
        }

        let streamHandler = new WebsocketStreamHandler(this, streamName);
        this.streamHandlers.set(streamName, streamHandler);

        // Check if the websocket connection is open, to see if we can send the subscription now
        if (this.isOpen()) {
            this.sendSubscribe(streamName);
        }

        return streamHandler;
    }

    isOpen() {
        return this.websocket?.readyState === 1;
    }

    sendSubscribe(streamName) {
        if (this.isOpen()) {
            this.send("s " + streamName);
        }
    }

    sendResubscribe(streamName, index) {
        if (this.isOpen(streamName)) {
            this.send("r " + index + " " + streamName);
        }
    }

    resubscribe() {
        // Iterate over all streams and resubscribe to them
        for (let streamHandler of this.streamHandlers.values()) {
            streamHandler.sendSubscribe();
        }
    }

    onStreamSubscribe(streamName) {
        const streamHandler = this.getStreamHandler(streamName);
        if (!streamHandler) {
            console.error("WebsocketSubscriber: received subscribe success response for unrequested stream ", streamName);
            return;
        }
        console.log("WebsocketSubscriber: Successfully subscribed to stream", streamName);
        streamHandler.setStatusSubscribed();
    }

    onWebsocketOpen() {
        this.previousFailedReconnectAttempts = this.failedReconnectAttempts;
        this.failedReconnectAttempts = 0;
        console.log("WebsocketSubscriber: Websocket connection established!");

        this.reset();
        this.setConnectionStatus(WebsocketSubscriber.ConnectionStatus.CONNECTED);
        this.resubscribe();
    }

    handleMessageWithoutListeners(streamName, message) {
        console.error("No handler for websocket stream", streamName);
    }

    handleServerError(payload) {
        console.error("Websocket error:", payload);
        const [errorType, details] = splitPayload(payload);

        if (errorType === "invalidSubscription") {
            // Stop trying to resubscribe to a stream that's been rejected by the server
            const streamName = details;
            const streamHandler = this.getStreamHandler(streamName);
            if (streamHandler) {
                // TODO: set permission denied explicitly?
                streamHandler.clearResubscribeTimeout();
            }
        }

    }

    handleStreamMessage(payload) {
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

    handleServerClose(payload) {
        this.failedReconnectAttempts = this.previousFailedReconnectAttempts;
        console.error("WebsocketSubscriber: server fatal error close: ", payload);
        this.onWebsocketError(payload);
    }

    onWebsocketMessage(event) {
        const {data} = event;
        if (data === WebsocketSubscriber.HEARTBEAT_MESSAGE) {
            // TODO: keep track of the last heartbeat timestamp
            return;
        }

        const [type, payload] = splitPayload(data);

        if (type === "e" || type === "error") { // error
            this.handleServerError(payload)
        } else if (type === "s") { // subscribed
            this.onStreamSubscribe(payload);
        } else if (type === "m") { // stream message
            this.handleStreamMessage(payload);
        } else if (type  === "c") { // command
            this.dispatch("serverCommand", payload);
        } else if (type == "close") {
            this.handleServerClose(payload);
        } else {
            console.error("WebsocketSubscriber: Can't process " + event.data);
        }
    }

    reset() {
        this.setConnectionStatus(WebsocketSubscriber.ConnectionStatus.DISCONNECTED);
        for (const streamHandler of this.streamHandlers.values()) {
            streamHandler.resetStatus();
        }
    }

    onWebsocketError(event) {
        console.error("WebsocketSubscriber: Websocket connection is broken!");
        this.reset();
        this.tryReconnect();
    }

    onWebsocketClose(event) {
        console.log("WebsocketSubscriber: Connection closed!");
        this.reset();
        this.tryReconnect();
    }

    send(message) {
        // TODO: if the websocket is not open, enqueue WebsocketSubscriber message to be sent on open or just fail?
        this.websocket.send(message);
    }

    getStreamHandler(streamName) {
        let streamHandler = this.streamHandlers.get(streamName);
        if (!streamHandler) {
            streamHandler = this.subscribe(streamName);
        }
        return streamHandler;
    }

    // this should be pretty much the only external function
    addStreamListener(streamName, callback) {
        let streamHandler = this.getStreamHandler(streamName);
        if (streamHandler.callbackExists(callback)) {
            return;
        }
        streamHandler.addListener(callback);
    }

    removeStreamListener(streamName, callback) {
        let streamHandler = this.streamHandlers.get(streamName);
        if (streamHandler) {
            streamHandler.removeListener(callback);
        }
    }

    static addListener(streamName, callback) {
        return this.Global.addStreamListener(streamName, callback);
    };
}

// TODO sync globally cleaner
WebsocketSubscriber.Global = new WebsocketSubscriber();