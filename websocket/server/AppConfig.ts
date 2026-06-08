export interface AppConfig {
    port: number;
    // Interface to bind the listener to. Defaults to "127.0.0.1" (same-host only, leaving a
    // reverse proxy as the sole entry point); set "0.0.0.0" to expose on all interfaces.
    bindAddress?: string;
    maxBackpressure: number;
    redisEndpoint: string;
    rpcEndpoint: string;
    // If set, the server periodically posts an "online-status-update" RPC with the
    // list of currently-connected userIds. The RPC backend decides what to do with it.
    // Leave undefined to disable the sweep entirely.
    onlineStatusTickIntervalMs?: number;
}
