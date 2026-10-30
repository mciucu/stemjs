export const DEFAULT_HEARTBEAT_MESSAGE: string = "-heartbeat-city-";

// Server heartbeat cadence; the client treats a socket silent for a couple of intervals as dead.
export const HEARTBEAT_INTERVAL_MS = 30_000;

// Added at random to each reconnect's wait, so the tabs of a server that went away don't all come back in the same instant
export const RECONNECT_JITTER_MS = 10_000;
