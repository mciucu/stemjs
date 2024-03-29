import {createClient as redisCreateClient} from "redis";
import {App as WSApp} from "uWebSockets.js";
import {CheckStreamPermission, IdentifySessionId, LoadSessionId, RPCCaller} from "./PermissionChecking.js";
import {DEFAULT_HEARTBEAT_MESSAGE} from "../Shared.js";

const CONNECTION_KEYS = ["ipAddress", "userId", "sessionId"];


export class WebsocketServer {
    stats = {
        numRequestedConnections: 0,
        numOpenedConnection: 0,
        numMessagesReceived: 0,
    }
    connections = new Set();
    connectionsBy = Object.fromEntries(CONNECTION_KEYS.map(key => [key, new Map()]));

    constructor(appConfig) {
        this.appConfig = appConfig;
    }

    addConnection(wsConnection) {
        this.stats.numOpenedConnection += 1;
        wsConnection.subscribe("heartbeat");
        const userData = wsConnection.getUserData();
        userData.connectionTime = new Date();
        for (const key of CONNECTION_KEYS) {
            const connectionMap = this.connectionsBy[key];
            const value = userData[key];
            if (!connectionMap.has(value)) {
                connectionMap.set(value, new Set());
            }
            connectionMap.get(value).add(wsConnection);
        }
        this.connections.add(wsConnection);
    }

    removeConnection(wsConnection) {
        const userData = wsConnection.getUserData();
        for (const key of CONNECTION_KEYS) {
            const connectionMap = this.connectionsBy[key];
            const value = userData[key];
            const connSet = connectionMap.get(value);
            connSet.delete(wsConnection)
            if (connSet.size === 0) {
                connectionMap.delete(value);
            }
        }
        this.connections.delete(wsConnection);
        wsConnection.isClosed = true;
    }

    async startServer() {
        const {appConfig, rpcCaller} = this;


        const {port} = this.appConfig;
        const {stats} = this;

        this.rawServer = WSApp({}).ws("/*", {
            maxBackpressure: appConfig.maxBackpressure,
            async upgrade(response, request, context) {
                stats.numRequestedConnections += 1;
                const ipAddress = request.getHeader("realaddr");
                const secWebSocketKey = request.getHeader("sec-websocket-key");
                const secWebSocketProtocol = request.getHeader("sec-websocket-protocol");
                const secWebSocketExtensions = request.getHeader("sec-websocket-extensions");

                // Keep track of aborting connection
                const upgradeAborted = {aborted: false};
                response.onAborted(() => {
                    upgradeAborted.aborted = true;
                });

                // TODO limit num connections per IP/user
                const sessionId = LoadSessionId(request);
                const userId = await IdentifySessionId(rpcCaller, sessionId);

                if (upgradeAborted.aborted) {
                    return;
                }
                // Upgrade logic, have checked the identity
                const userData = {userId, sessionId, ipAddress};

                response.cork(() => {
                    response.upgrade(
                        userData,
                        secWebSocketKey,
                        secWebSocketProtocol,
                        secWebSocketExtensions,
                        context
                    );
                });
            },
            open: (wsConnection) => this.addConnection(wsConnection),
            close: (wsConnection, code, message) => this.removeConnection(wsConnection),
            message: async (wsConnection, message) => {
                this.stats.numMessagesReceived += 1;
                // TODO throttle this per IP as well
                message = new TextDecoder().decode(message);
                if (message.length > 4096) {
                    // TODO Ban this asshole
                }
                let [command, streamName, secondArg] = message.split(" ", 3);
                if (command === "r") {
                    command = "s";
                    streamName = secondArg; // TODO The second argument is the index, we should resend those messages if we have them
                }

                if (command === "s") {
                    const {userId} = wsConnection.getUserData();
                    const allowed = await CheckStreamPermission(rpcCaller, userId, streamName);

                    if (wsConnection.isClosed) {
                        // The socket might have closed while we're waiting
                        return;
                    }

                    try {
                        if (allowed[0]) {
                            wsConnection.subscribe(streamName);
                            wsConnection.send("s " + streamName);
                        } else {
                            wsConnection.send(`Failed to subscribe to stream ${streamName}: ${allowed[1]}`);
                        }
                    } catch (error) {
                        // It's possible that the connection might have been closed between
                    }
                } else {
                    // TODO Seems to need r index stream
                    wsConnection.send("What? " + message);
                }
            },
            drain(wsConnection) {
                // the socket is ready to receive more data
            },
        }).listen(port, (token) => {
            if (token) {
                console.log("WS Listening on port", port);
            } else {
                console.error("Failed to listen on port", port);
            }
        });

        setInterval(() => {
            this.rawServer.publish("heartbeat", DEFAULT_HEARTBEAT_MESSAGE);
            if (global.gc) {
                const startTime = performance.now();
                global.gc();
                this.stats.gcDuration = performance.now() - startTime;
            }
            this.writeStats();
        }, 10000);
    }

    writeStats() {
        const {stats} = this;
        console.log("Stats:", {
            ...stats,
            numActiveConnection: this.connections.size,
            rpc: this.rpcCaller.stats,
        });
    }

    async connectToRedis() {
        this.redisClient = redisCreateClient(this.appConfig.redisEndpoint);

        // It seems like redisClient will do the reconnection itself, we just need to know when that happens
        this.redisClient.on("error", error => console.error("Redis error", error));
        this.redisClient.on("reconnecting", message => console.error("Redis reconnecting", message));

        await this.redisClient.connect();
        await this.redisClient.pSubscribe("*", (message, streamName) => {
            if (streamName === "system-logout") {
                this.forceClose(message);
                return;
            }
            this.broadcast(streamName, message);
        });
    }

    async init() {
        this.rpcCaller = new RPCCaller(this.appConfig);

        // TODO put this in 5 try loop
        this.extraConfig = await this.rpcCaller.query("config");

        if (this.extraConfig == null) {
            console.error("Failed to get a config response, shutting down!");
            process.exit(1);
        }

        await this.startServer();

        await this.connectToRedis();
    }

    // Broadcast to anyone that should listen to this
    broadcast(streamName, message) {
        // TODO If we want to support reconnection, we need to keep ~5 min or 100 MB of messages in a rolling buffer
        const formattedMessage = `m ${streamName} ${message}`;
        this.rawServer.publish(streamName, formattedMessage);
    }

    forceClose(userOrSessionId) {
        // Can't be both at the same time
        const connections = this.connectionsBy.userId.get(userOrSessionId) || this.connectionsBy.sessionId.get(userOrSessionId) || [];

        for (const wsConnection of Array.from(connections)) {
            wsConnection.close();
        }
    }
}
