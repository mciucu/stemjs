import {Dispatchable} from "./Dispatcher.js";

export class Batcher extends Dispatchable {
    queue = [];
    timeoutHandler = null;

    constructor(processBatch, {timeout=20, maxBatchSize=64} = {}) {
        super();
        this.processBatch = processBatch;
        this.timeout = timeout;
        this.maxBatchSize = maxBatchSize;
    }

    async handleBatch() {
        clearTimeout(this.timeoutHandler);
        this.timeoutHandler = null;
        const {queue} = this;
        this.queue = [];
        await this.processBatch(queue);
    }

    // TODO make this async, and have processBatch be an async [] => []
    process(value) {
        this.queue.push(value)
        if (this.queue.length === this.maxBatchSize) {
            this.handleBatch().then();
        } else {
            // Ensure there's a timeout set to handle this batch
            this.timeoutHandler = this.timeoutHandler || setTimeout(() => this.handleBatch(), this.timeout);
        }
    }
}
