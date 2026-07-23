export const DEFAULT_HEARTBEAT_MESSAGE: string = "-heartbeat-city-";

// Server heartbeat cadence; the client treats a socket silent for a couple of intervals as dead.
export const HEARTBEAT_INTERVAL_MS = 30_000;
