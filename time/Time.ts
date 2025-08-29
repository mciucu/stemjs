import {StemDate} from "./Date";

interface ServerTimeInterface {
    offset?: number;
    serverPageLoad?: number;
    now(): StemDate;
    getOffset(): number | undefined;
    set(date: Date | StemDate | number | string, onlyIfMissing?: boolean): void;
    setPageLoadTime(unixTime: number, estimatedLatency?: number): void;
}

// File meant to handle server time/client time differences
export const ServerTime: ServerTimeInterface = {
    now(): StemDate {
        return new StemDate().subtract(this.getOffset() || 0);
    },

    getOffset(): number | undefined {
        return this.offset;
    },

    set(date: Date | StemDate | number | string, onlyIfMissing: boolean = false): void {
        if (!onlyIfMissing || this.offset == null) {
            this.offset = Date.now() - (+new StemDate(date));
        }
    },

    setPageLoadTime(unixTime: number, estimatedLatency: number = 0): void {
        this.serverPageLoad = unixTime;
        this.offset = globalThis.performance.timing.responseStart - unixTime * 1000;
    }
};

// TODO remove re-exports
export * from "./Date";
export * from "./Duration";