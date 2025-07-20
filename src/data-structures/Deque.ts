export class Deque<T> {
    private values: (T | undefined)[];
    private offset: number;
    private _length: number;

    constructor() {
        this.values = new Array(8);
        this.offset = (this.values.length / 2) | 0;
        this._length = 0;
    }

    private shouldShrink(): boolean {
        return this.values.length > 4 * this._length + 8;
    }

    private maybeShrink(): void {
        if (this.shouldShrink()) {
            this.rebalance(true);
        }
    }

    private rebalance(forceResize?: boolean): void {
        const capacity = this.values.length;
        const length = this._length;
        const optimalCapacity = (length * 1.618 + 8) | 0;
        const shouldResize = forceResize || (capacity < optimalCapacity);

        if (shouldResize) {
            // Allocate a new array and balance objects around the middle
            const values: (T | undefined)[] = new Array(optimalCapacity);
            const optimalOffset = (optimalCapacity / 2 - length / 2) | 0;
            for (let i = 0; i < length; i += 1) {
                values[optimalOffset + i] = this.values[this.offset + i];
            }
            this.values = values;
            this.offset = optimalOffset;
        } else {
            //Just balance the elements in the middle of the array
            const optimalOffset = (capacity / 2 - length / 2) | 0;
            this.values.copyWithin(optimalOffset, this.offset, this.offset + this._length);
            // Remove references, to not mess up gc
            if (optimalOffset < this.offset) {
                this.values.fill(undefined, optimalOffset + this._length, this.offset + this._length);
            } else {
                this.values.fill(undefined, this.offset + this._length, optimalOffset + this._length);
            }
            this.offset = optimalOffset;
        }
    }

    pushFront(value: T): void {
        if (this.offset == 0) {
            this.rebalance();
        }
        this.values[--this.offset] = value;
        this._length += 1;
    }

    popFront(): T {
        const value = this.peekFront();

        this.values[this.offset++] = undefined;
        this._length -= 1;
        this.maybeShrink();

        return value;
    }

    peekFront(): T {
        if (this._length == 0) {
            throw Error("Invalid operation, empty deque");
        }
        return this.values[this.offset] as T;
    }

    pushBack(value: T): void {
        if (this.offset + this._length === this.values.length) {
            this.rebalance();
        }
        this.values[this.offset + this._length] = value;
        this._length += 1;
    }

    popBack(): T {
        const value = this.peekBack();

        this._length -= 1;
        this.values[this.offset + this._length] = undefined;
        this.maybeShrink();

        return value;
    }

    peekBack(): T {
        if (this._length == 0) {
            throw Error("Invalid operation, empty deque");
        }
        return this.values[this.offset + this._length - 1] as T;
    }

    get(index: number): T {
        if (index < 0 || index >= this._length) {
            throw Error("Invalid index " + index);
        }
        return this.values[this.offset + index] as T;
    }

    get length(): number {
        return this._length;
    }

    set length(value: number) {
        throw Error("Can't resize a deque");
    }

    toArray(): T[] {
        return this.values.slice(this.offset, this.offset + this._length) as T[];
    }

    toString(): string {
        return this.toArray().toString();
    }

    entries(): IterableIterator<T> {
        // TODO: implement with yield?
        return this.toArray()[Symbol.iterator]();
    }

    [Symbol.iterator](): IterableIterator<T> {
        return this.entries();
    }

    // Also support the standard javascript method names
    pop(): T {
        return this.popBack();
    }

    push(value: T): void {
        return this.pushBack(value);
    }

    shift(): T {
        return this.popFront();
    }

    unshift(value: T): void {
        return this.pushFront(value);
    }
}