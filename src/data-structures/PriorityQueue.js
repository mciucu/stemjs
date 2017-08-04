// TODO: this class still needs to be implemented

// Key can be anything that can be used as a key in a map (number, string or object)
class PriorityQueue {
    constructor(options={}) {
        // Options can have:
        // cmp - the comparison function
        // data - an iterable from which to build the initial structure.
        // Each entry is either an array with [key, priority] entries, or {key:, value:} objects.

        // A priority queue is backed by a heap array
        // Keep a map for each key to its index in the heap
        this.keyMap = new Map();
        this.heap = [];
        this.cmp = options.cmp || function cmp(a, b) {
            return +b - a;
        };
    }

    set(key, priority) {
        // Change the priority of an existing key, or insert in heap if missing
    }

    getPriority(key) {
        let heapIndex = this.keyMap.get(key);
        if (heapIndex != null) {
            return this.heap[heapIndex].priority;
        }
    }

    peek() {
        // Return [topKey, priority]
    }

    pop() {
        // Take out and return [topKey, priority]
    }

    get size() {
        return this.heap.length;
    }

    isEmpty() {
        return this.size === 0;
    }

    entries() {
        let values = this.heap.map(obj => obj.key);
        values.sort(this.cmp);
        return values;
    }

    [Symbol.iterator]() {
        return this.entries();
    }
}

export {PriorityQueue};
