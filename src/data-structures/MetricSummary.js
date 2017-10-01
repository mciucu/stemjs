import {Deque} from "./Deque";

class MaxLengthDeque extends Deque {
    constructor(maxLength) {
        super();
        this.maxLength = maxLength;
    }

    last() {
        return this.peekBack();
    }

    push(value) {
        if (this.length + 1 >= this.maxLength) {
            this.unshift();
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
    constructor(type, duration, maxLength) {
        this.values = new MaxLengthDeque(maxLength);
        this.lastTimestamp = null;
        this.type = type;
    }

    addInterval(start, end, value) {
        if (this.lastTimestamp && start != this.lastTimestamp) {
            console.error("Timestamp inconsistency in latest chunk", time.lastTimestamp, start);
        }
        this.lastTimestamp = end;
        // Ignore the value for now
    }
}

export class MetricSummary {
    constructor(type, options={}) {
        this.type = type;
        this.options = options;
        // To not have dequeues all resizing at the same time
        this.maxLength = this.options.maxLength || 8;
        this.rawTimestamps = new MaxLengthDeque(this.maxValues);
        this.rawValues = new MaxLengthDeque(this.maxValues);
        for (let i = 0, duration = 5; i < 7; i++, duration *= 4) {
            this.averages.push(new ChunkAverager(duration, this.maxValues));
        }
    }

    addInterval(start, end, value) {
        for (let averager of this.averagers) {
            averager.addInterval(start, end, value);
        }
    }

    addValue(timestamp=Date.now(), value=1) {
        // Normalize timestamp to miliseconds
        timestamp = +(new StemDate(timestamp));
        const lastTimestamp = this.rawTimestamps.length && this.rawTimestamps.last();
        if (lastTimestamp && lastTimestamp >= timestamp) {
            console.error("Invalid new timestamp:", timestamp, this.getLastTimestamp());
            return;
        }
        this.rawTimestamps.push(timestamp);
        this.rawValues.push(value);
        if (lastTimestamp) {
            this.addInterval(lastTimestamp, timestamp, value);
        }
    }

    getValues(startDate, endDate, maxValues=1024) {
        startDate = +(new StemDate(startDate));
        endDate = +(new StemDate(endDate));
        let values = [];
        for (let i = 0; i < this.rawValues.length; i++) {
            const timestamp = this.rawTimestamps.get(i);
            if (startDate <= timestamp && timestamp <= endDate) {
                values.push({
                    timestamp: timestamp,
                    value: this.rawValues.get(i)
                });
            }
        }
        return values;
    }
}
