export const DEFAULT_HEARTBEAT_MESSAGE: string = "-heartbeat-city-";

// The server publishes a heartbeat frame on this cadence. The client treats a socket
// that has been silent for a couple of intervals as dead and reconnects.
export const HEARTBEAT_INTERVAL_MS = 30_000;
