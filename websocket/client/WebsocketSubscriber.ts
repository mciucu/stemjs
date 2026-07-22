import {Dispatchable} from "../../base/Dispatcher";
import {WebsocketStreamHandler} from "./WebsocketStreamHandler";
import {toArray, TimeoutHandler, IntervalHandler} from "../../base/Utils";
import {DEFAULT_HEARTBEAT_MESSAGE, HEARTBEAT_INTERVAL_MS} from "../Shared";

type Callback = (...args: any[]) => void;

const ConnectionStatus = {
    NONE: 0,
    CONNECTING: 1,
    CONNECTED: 2,
    DISCONNECTED: 3,
} as const;

type ConnectionStatusValue = typeof ConnectionStatus[keyof typeof ConnectionStatus];

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


export class WebsocketSubscriber extends Dispatchable {
    static ConnectionStatus = ConnectionStatus;

    // TODO sync globally cleaner
    static Global = (self as any).WEBSOCKET_URL ? new WebsocketSubscriber((self as any).WEBSOCKET_URL) : null;

    streamHandlers: Map<string, WebsocketStreamHandler> = new Map();
    attemptedConnect: boolean = false;
    connectionStatus: ConnectionStatusValue = ConnectionStatus.NONE;
    websocket: WebSocket | null = null;
    failedReconnectAttempts: number = 0;
    manualClose: boolean = false;
    numConnectionAttempts: number = 0;
    retryDefaultTimeout: number = 3000;
    retryMaxTimeout: number = 30000;
    heartbeatMessage: string = DEFAULT_HEARTBEAT_MESSAGE;
    urls: string[];
    reconnectTimeout?: TimeoutHandler;
    failedReconnectAttemptsBeforeOpen?: number;
    lastServerMessageTime: number = 0;
    livenessCheckInterval?: IntervalHandler;
    // Two missed heartbeats plus slack before a silent socket is declared dead.
    staleConnectionThreshold: number = 2.5 * HEARTBEAT_INTERVAL_MS;

    constructor(urls: string | string[]) {
        super();
        this.urls = toArray(urls);
    }

    setConnectionStatus(connectionStatus: ConnectionStatusValue): void {
        this.connectionStatus = connectionStatus;
        this.dispatch("connectionStatus", connectionStatus);
    }

    getNextUrl(): string {
        const currentURLIndex = (this.numConnectionAttempts++) % this.urls.length;
        return this.urls[currentURLIndex];
    }

    clearReconnectTimeout(): void {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = undefined;
        }
    }

    // Drop the current socket without triggering any reconnect logic: handlers are
    // detached first so its close event cannot schedule a competing reconnect.
    // Leaves connectionStatus alone; status transitions belong to the callers.
    discardWebsocket(): void {
        const websocket = this.websocket;
        if (!websocket) {
            return;
        }
        websocket.onopen = null;
        websocket.onmessage = null;
        websocket.onerror = null;
        websocket.onclose = null;
        try {
            websocket.close();
        } catch {
            // May still be connecting or already closed; nothing to do.
        }
        this.websocket = null;
    }

    // Safe to call from any path at any time: replaces whatever socket exists and
    // cancels any pending reconnect, so concurrent callers can never stack sockets.
    connect(): void {
        this.manualClose = false;
        this.clearReconnectTimeout();
        this.discardWebsocket();
        const url = this.getNextUrl();
        this.setConnectionStatus(ConnectionStatus.CONNECTING);
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
        this.startLivenessWatchdog();
    }

    disconnect(): void {
        this.manualClose = true;
        this.stopLivenessWatchdog();
        this.clearReconnectTimeout();
        this.discardWebsocket();
        this.setConnectionStatus(ConnectionStatus.DISCONNECTED);
        this.resetStreamHandlerStatuses();
    }

    startLivenessWatchdog(): void {
        if (this.livenessCheckInterval) {
            return;
        }
        this.livenessCheckInterval = setInterval(() => this.checkConnectionLiveness(), HEARTBEAT_INTERVAL_MS / 2);
    }

    stopLivenessWatchdog(): void {
        if (this.livenessCheckInterval) {
            clearInterval(this.livenessCheckInterval);
            this.livenessCheckInterval = undefined;
        }
    }

    checkConnectionLiveness(): void {
        // Only judge sockets we believe are healthy; the CONNECTING/backoff paths manage themselves.
        if (this.connectionStatus !== ConnectionStatus.CONNECTED) {
            return;
        }
        if (Date.now() - this.lastServerMessageTime > this.staleConnectionThreshold) {
            console.warn("WebsocketSubscriber: no server traffic for too long, reconnecting");
            this.connect();
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
        // The wire protocol is space-delimited, so a name with a space would silently corrupt it.
        if (streamName.includes(" ")) {
            throw new Error("Websocket stream names cannot contain spaces: " + streamName);
        }
        console.log("WebsocketSubscriber: Subscribing to stream ", streamName);

        // Connecting is lazy: the first subscription opens the socket.
        if (!this.attemptedConnect) {
            this.connect();
            this.attemptedConnect = true;
        }

        if (this.streamHandlers.has(streamName)) {
            console.warn("WebsocketSubscriber: Already subscribed to stream ", streamName);
            return this.streamHandlers.get(streamName)!;
        }

        const streamHandler = new WebsocketStreamHandler(this, streamName);
        this.streamHandlers.set(streamName, streamHandler);

        if (this.isOpen()) {
            this.sendSubscribeCommand(streamName);
        }

        return streamHandler;
    }

    isOpen(): boolean {
        return this.websocket?.readyState === WebSocket.OPEN;
    }

    // Nothing is queued while the socket is down: subscriptions are re-sent on open and
    // by each stream handler's retry timer, so dropping here is safe.
    send(message: string): void {
        if (this.isOpen()) {
            this.websocket!.send(message);
        }
    }

    sendSubscribeCommand(streamName: string): void {
        this.send("s " + streamName);
    }

    sendResubscribeCommand(streamName: string, index: number): void {
        this.send("r " + index + " " + streamName);
    }

    resubscribe(): void {
        for (const streamHandler of this.streamHandlers.values()) {
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
        this.lastServerMessageTime = Date.now();
        this.failedReconnectAttemptsBeforeOpen = this.failedReconnectAttempts;
        this.failedReconnectAttempts = 0;
        console.log("WebsocketSubscriber: Websocket connection established!");

        // Clear any subscription state and retry timers left over from a previous socket
        // before resubscribing everything on this one.
        this.resetStreamHandlerStatuses();
        this.setConnectionStatus(ConnectionStatus.CONNECTED);
        this.resubscribe();
    }

    handleMessageWithoutListeners(streamName: string, message: string): void {
        console.error("No handler for websocket stream", streamName);
    }

    handleServerError(payload: string): void {
        console.error("Websocket error:", payload);
        const [errorType, details] = splitPayload(payload);

        if (errorType === "invalidSubscription" && details) {
            // The server rejected this stream (permissions); retrying would just be rejected again.
            this.getStreamHandler(details)?.clearResubscribeTimeout();
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
        // Opening the connection zeroed the backoff counter, but a server-side fatal close
        // means we are still failing; restore the pre-open count so backoff keeps growing.
        this.failedReconnectAttempts = this.failedReconnectAttemptsBeforeOpen || 0;
        console.error("WebsocketSubscriber: server fatal error close: ", payload);
        this.onWebsocketError(payload);
    }

    onWebsocketMessage(event: MessageEvent): void {
        this.lastServerMessageTime = Date.now();
        const {data} = event;
        if (data === this.heartbeatMessage) {
            return;
        }

        const [type, payload] = splitPayload(data);

        if (type === "e" || type === "error") { // error
            this.handleServerError(payload!);
        } else if (type === "s") { // subscribed
            this.onStreamSubscribe(payload!);
        } else if (type === "m") { // stream message
            this.handleStreamMessage(payload!);
        } else if (type === "c") { // command
            this.dispatch("serverCommand", payload);
        } else if (type === "close") {
            this.handleServerClose(payload!);
        } else if (type === "id" || type === "nid") {
            // Connection identity handshake ("id <userId>" when authenticated,
            // "nid <sessionId> <ipAddress>" when anonymous). Nothing to do here.
        } else {
            console.error("WebsocketSubscriber: Can't process " + event.data);
        }
    }

    resetStreamHandlerStatuses(): void {
        for (const streamHandler of this.streamHandlers.values()) {
            streamHandler.resetStatus();
        }
    }

    onWebsocketError(event: Event | string): void {
        console.error("WebsocketSubscriber: Websocket connection is broken!");
        this.setConnectionStatus(ConnectionStatus.DISCONNECTED);
        this.resetStreamHandlerStatuses();
        if (!this.manualClose) {
            this.tryReconnect();
        }
    }

    onWebsocketClose(event: CloseEvent): void {
        console.log("WebsocketSubscriber: Connection closed!");
        this.setConnectionStatus(ConnectionStatus.DISCONNECTED);
        this.resetStreamHandlerStatuses();
        if (!this.manualClose) {
            this.tryReconnect();
        }
    }

    getStreamHandler(streamName: string): WebsocketStreamHandler | null {
        return this.streamHandlers.get(streamName) || null;
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

    // Fully drop a stream so a later reconnect's resubscribe() won't try to subscribe to it again.
    unsubscribe(streamName: string): void {
        const streamHandler = this.streamHandlers.get(streamName);
        if (streamHandler) {
            streamHandler.clearResubscribeTimeout();
            this.streamHandlers.delete(streamName);
        }
    }

    static addListener(streamName: string, callback: Callback): void {
        return this.Global!.addStreamListener(streamName, callback);
    }
}
