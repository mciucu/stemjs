export interface AppConfig {
    port: number;
    maxBackpressure: number;
    redisEndpoint: string;
    rpcEndpoint: string;
    // If set, the server periodically posts an "online-status-update" RPC with the
    // list of currently-connected userIds. The RPC backend decides what to do with it.
    // Leave undefined to disable the sweep entirely.
    onlineStatusTickIntervalMs?: number;
}
