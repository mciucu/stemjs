class Deque {
    constructor() {
        this._values = new Array(8);
        this._length = 0;
        this._offset = (this._values.length / 2) | 0;
    }

    shouldShrink() {
        return this._values.length > 4 * this._length + 8;
    }

    maybeShrink() {
        if (this.shouldShrink()) {
            this.rebalance(true);
        }
    }

    rebalance(forceResize) {
        let capacity = this._values.length;
        let length = this._length;
        let optimalCapacity = (length * 1.618 + 8) | 0;
        let shouldResize = forceResize || (capacity < optimalCapacity);

        if (shouldResize) {
            // Allocate a new array and balance objects around the middle
            let values = new Array(optimalCapacity);
            let optimalOffset = (optimalCapacity / 2 - length / 2) | 0;
            for (let i = 0; i < length; i += 1) {
                values[optimalOffset + i] = this._values[this._offset + i];
            }
            this._values = values;
            this._offset = optimalOffset;
        } else {
            //Just balance the elements in the middle of the array
            let optimalOffset = (capacity / 2 - length / 2) | 0;
            this._values.copyWithin(optimalOffset, this._offset, this._offset + this._length);
            // Remove references, to not mess up gc
            if (optimalOffset < this._offset) {
                this._values.fill(undefined, optimalOffset + this._length, this._offset + this._length);
            } else {
                this._values.fill(undefined, this._offset + this._length, optimalOffset + this._length);
            }
            this._offset = optimalOffset;
        }
    }

    pushFront(value) {
        if (this._offset == 0) {
            this.rebalance();
        }
        this._values[--this._offset] = value;
        this._length += 1;
    }

    popFront() {
        let value = this.peekBack();

        this._values[this._offset++] = undefined;
        this._length -= 1;
        this.maybeShrink();

        return value;
    }

    peekFront() {
        if (this._length == 0) {
            throw Error("Invalid operation, empty deque");
        }
        return this._values[this._offset];
    }

    pushBack(value) {
        if (this._offset + this._length === this._values.length) {
            this.rebalance();
        }
        this._values[this._offset + this._length] = value;
        this._length += 1;
    }

    popBack() {
        let value = this.peekFront();

        this._length -= 1;
        this._values[this._offset + this._length] = undefined;
        this.maybeShrink();

        return value;
    }

    peekBack() {
        if (this._length == 0) {
            throw Error("Invalid operation, empty deque");
        }
        return this._values[this._offset + this._length - 1];
    }

    get(index) {
        if (index < 0 || index >= this._length) {
            throw Error("Invalid index", index);
        }
        return this._values[this._offset + index];
    }

    get length() {
        return this._length;
    }

    set length(value) {
        throw Error("Can't resize a deque");
    }

    toArray() {
        return this._values.slice(this._offset, this._offset + this._length);
    }

    toString() {
        return this.toArray().toString();
    }

    entries() {
        // TODO: implement with yield?
        return this.toArray()[Symbol.iterator];
    }

    [Symbol.iterator]() {
        return this.entries();
    }
}

// Also support the standard javascript method names
Deque.prototype.pop     = Deque.prototype.popBack;
Deque.prototype.push    = Deque.prototype.pushBack;
Deque.prototype.shift   = Deque.prototype.popFront;
Deque.prototype.unshift = Deque.prototype.pushFront;

export {Deque};
