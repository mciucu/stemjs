import {Dispatchable} from "./Dispatcher";

type BatchProcessor<T> = (batch: T[]) => Promise<void>;

export class Batcher<T> extends Dispatchable {
    queue: T[] = [];
    timeoutHandler?: ReturnType<typeof setTimeout>;
    processBatch: BatchProcessor<T>;
    timeout: number;
    maxBatchSize: number;

    constructor(processBatch: BatchProcessor<T>, {timeout = 20, maxBatchSize = 64}: {timeout?: number; maxBatchSize?: number} = {}) {
        super();
        this.processBatch = processBatch;
        this.timeout = timeout;
        this.maxBatchSize = maxBatchSize;
    }

    async handleBatch(): Promise<void> {
        clearTimeout(this.timeoutHandler);
        this.timeoutHandler = undefined;
        const {queue} = this;
        this.queue = [];
        await this.processBatch(queue);
    }

    // TODO make this async, and have processBatch be an async [] => []
    process(value: T): void {
        this.queue.push(value);
        if (this.queue.length === this.maxBatchSize) {
            this.handleBatch().then();
        } else {
            // Ensure there's a timeout set to handle this batch
            this.timeoutHandler = this.timeoutHandler || setTimeout(() => this.handleBatch(), this.timeout);
        }
    }
}
