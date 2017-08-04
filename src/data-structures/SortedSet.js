// This class is work in progress, not usable right now

// Data structure to keep a set of objects/values sorted by a given criteria
// Can support inserting a value (with an optional key), getting a range
// Can be used for instance to keep a rolling view on a table while scrolling
// TODO: should probably also support keeping track of a range with dispatchers?

class SortedSetNode {
    constructor(value, key) {
        this.value = value;
        this.key = key;
        this.weight = Math.random();
        this.left = this.right = null;
        this.size = 1;
    }
}

class SortedSet {
    constructor(values=[], options={}) {
        if (!Array.isArray(values)) {
            options = values;
            values = [];
        }
        this.comparator = options.cmp || options.comparator || this.constructor.defaultComparator;
        // WeakMap to store the link between an object and their index, etc.
        this.nodeMap = new WeakMap();
        for (let value of values) {
            let key;
            if (Array.isArray(value)) {
                key = value[1];
                value = value[0];
            } else {
                key = value;
            }
            this.add(value, key);
        }

    }

    setComparator(cmp) {
        throw Error("This needs to be implemented");
    }

    static defaultComparator(a, b) {
        if (a == b) {
            return 0;
        }
        return (a < b) ? -1 : 1;
    }

    add(value, key=value) {
    }

    has(value) {
        return this.nodeMap.has(value);
    }

    getIndex(value) {
        let node = this.nodeMap.get(value);
        return node.index;
    }

    // Remove the passed value from the SortedSet
    delete(value) {
        if (!this.has(value)) {
        }
    }

    // Return the index-th value in order by priority
    get(index) {
    }

    // Return iterator over [key, value]
    entries() {

    }

    values() {

    }

    toArray(startIndex = 0, count = this.size()) {
        let rez = [];
        let length = this.size();
        // TODO: this should be O(count + log N), with an iterator
        for (let index = startIndex; index < startIndex + count && index < length; index += 1) {
            rez.push(this.get(index));
        }
        return rez;
    }

    toString() {
        return this.toArray().toString();
    }
}

SortedSet.prototype.remove = SortedSet.prototype.delete;
SortedSet.prototype[Symbol.iterator] = SortedSet.prototype.values;

export {SortedSet};
