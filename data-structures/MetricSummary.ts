import {Dispatchable} from "../base/Dispatcher";
import {Deque} from "./Deque";
import {StemDate} from "../time/Date";

export class MaxLengthDeque<T> extends Deque<T> {
    readonly maxLength: number;

    constructor(maxLength: number) {
        super();
        this.maxLength = maxLength;
    }

    last(): T {
        return this.peekBack();
    }

    push(value: T): void {
        if (this.length + 1 > this.maxLength) {
            this.popFront();
        }
        super.push(value);
    }
}

export const MetricType = {
    VALUE: Symbol("Value"),
    COUNTER: Symbol("Counter"),
    COUNTER_SUM: Symbol("CounterSum")
};

class ChunkAverager {
    private values: MaxLengthDeque<number>;
    private lastTimestamp: number | null;
    private type: number;

    constructor(type: number, duration: number, maxLength: number) {
        this.values = new MaxLengthDeque(maxLength);
        this.lastTimestamp = null;
        this.type = type;
    }

    addInterval(start: number, end: number, value: number): void {
        if (this.lastTimestamp && start != this.lastTimestamp) {
            console.error("Timestamp inconsistency in latest chunk", this.lastTimestamp, start);
        }
        this.lastTimestamp = end;
        // Ignore the value for now
    }
}

interface MetricSummaryOptions {
    maxLength?: number;
}

interface MetricValue {
    timestamp: number;
    value: number;
}

export class MetricSummary extends Dispatchable {
    private type: symbol;
    private options: MetricSummaryOptions;
    private maxLength: number;
    private rawTimestamps: MaxLengthDeque<number>;
    private rawValues: MaxLengthDeque<number>;
    private averagers: ChunkAverager[];

    constructor(type: symbol, options: MetricSummaryOptions = {}) {
        super();
        this.type = type;
        this.options = options;
        // To not have dequeues all resizing at the same time
        this.maxLength = this.options.maxLength || 8;
        this.rawTimestamps = new MaxLengthDeque(this.maxLength);
        this.rawValues = new MaxLengthDeque(this.maxLength);
        this.averagers = [];
        for (let i = 0, duration = 5; i < 7; i++, duration *= 4) {
            this.averagers.push(new ChunkAverager(type as any, duration, this.maxLength));
        }
    }

    addInterval(start: number, end: number, value: number): void {
        for (let averager of this.averagers) {
            averager.addInterval(start, end, value);
        }
    }

    addValue(timestamp: number = Date.now(), value: number = 1): void {
        // Normalize timestamp to miliseconds
        timestamp = +(new StemDate(timestamp));
        const lastTimestamp = this.rawTimestamps.length && this.rawTimestamps.last();
        if (lastTimestamp && lastTimestamp >= timestamp) {
            if (lastTimestamp > timestamp) {
                // Only warn for strictly larger timestamps
                console.warn("Invalid new timestamp:", timestamp, lastTimestamp);
            }
            return;
        }

        this.rawTimestamps.push(timestamp);
        this.rawValues.push(value);

        if (this.type === MetricType.COUNTER_SUM) {
            if (this.rawValues.length > 0) {
                const prevValue = this.rawValues.last();
                if (prevValue <= value) {
                    value = value - prevValue;
                } else {
                    // This is probably a machine reboot, consider the counter was reset to 0
                }
            } else {
                // We'll add once we have a previous value, to not have strange data
                value = null;
            }
        }

        if (lastTimestamp && value != null) {
            this.addInterval(lastTimestamp, timestamp, value);
        }

        this.dispatchChange({timestamp, value, lastTimestamp});
    }

    getValues(startDate: number = this.rawTimestamps.peekFront(), endDate: number = this.rawTimestamps.last(), maxValues: number = 1024): MetricValue[] {
        startDate = +(new StemDate(startDate));
        endDate = +(new StemDate(endDate));
        let values: MetricValue[] = [];
        for (let i = 0; i < this.rawValues.length; i++) {
            const timestamp = this.rawTimestamps.get(i);
            if (startDate <= timestamp && timestamp <= endDate) {
                let value = this.rawValues.get(i);
                if (this.type === MetricType.COUNTER_SUM) {
                    if (i === 0) {
                        // Ignore the first one
                        continue;
                    }
                    const prevValue = this.rawValues.get(i - 1);
                    value = (value > prevValue) ? (value - prevValue) : value;
                }
                if (this.type === MetricType.COUNTER ||
                    this.type === MetricType.COUNTER_SUM) {
                    if (i === 0) {
                        continue;
                    }
                    // Normalize to counts per second
                    const prevTimestamp = this.rawTimestamps.get(i - 1);
                    value = 1000.0 * value / (timestamp - prevTimestamp);
                }
                values.push({
                    timestamp: timestamp,
                    value: value,
                });
            }
        }
        return values;
    }
}