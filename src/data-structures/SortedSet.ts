import {mapIterator} from "../base/Utils";

// Data structure to keep a set of objects/values sorted by a given criteria
// Can support inserting a value (with an optional key), getting a range
// Can be used for instance to keep a rolling view on a table while scrolling
// TODO: should probably also support keeping track of a range with dispatchers?


type ComparatorFunction<K> = (a: K, b: K) => number;

class BinarySearchTreeNode<T, K> {
    weight: number;
    parent: BinarySearchTreeNode<T, K> | null;
    left: BinarySearchTreeNode<T, K> | null;
    right: BinarySearchTreeNode<T, K> | null;
    key: K;

    constructor(key: K, parent: BinarySearchTreeNode<T, K> | null = null) {
        this.weight = Math.random();
        this.parent = parent;
        this.left = this.right = null;
        this.key = key;
    }

    leftWeight(): number {
        return (this.left && this.left.weight) || -1;
    }

    rightWeight(): number {
        return (this.right && this.right.weight) || -1;
    }

    min(): BinarySearchTreeNode<T, K> {
        return (this.left && this.left.min()) || this;
    }

    max(): BinarySearchTreeNode<T, K> {
        return (this.right && this.right.max()) || this;
    }

    replaceParentRef(newNode: BinarySearchTreeNode<T, K> | null): void {
        if (!this.parent) {
            return;
        }
        if (this.parent.left === this) {
            this.parent.left = newNode;
        }
        if (this.parent.right === this) {
            this.parent.right = newNode;
        }
    }

    rotateLeft(): BinarySearchTreeNode<T, K> {
        const a = this, b = this.right!;
        const c = b.left;

        a.replaceParentRef(b);
        b.left = a;
        b.parent = a.parent;
        a.parent = b;
        a.right = c;
        if (c) {
            c.parent = a;
        }

        return b;
    }

    rotateRight(): BinarySearchTreeNode<T, K> {
        const a = this.left!, b = this;
        const c = a.right;

        b.replaceParentRef(a);
        a.right = b;
        a.parent = b.parent;
        b.parent = a;
        b.left = c;
        if (c) {
            c.parent = b;
        }

        return a;
    }

    balance(nodeToReturn: BinarySearchTreeNode<T, K> | null): [BinarySearchTreeNode<T, K> | null, BinarySearchTreeNode<T, K>] {
        let newRoot: BinarySearchTreeNode<T, K> = this;

        if (this.rightWeight() > this.weight) {
            newRoot = this.rotateLeft();
        } else if (this.leftWeight() > this.weight) {
            newRoot = this.rotateRight();
        }

        newRoot.update();

        return [nodeToReturn, newRoot];
    }

    add(value: T, key: K, comparator: ComparatorFunction<K>): [BinarySearchTreeNode<T, K> | null, BinarySearchTreeNode<T, K>] {
        const comp = comparator(key, this.key);
        let addedNode: BinarySearchTreeNode<T, K> | null = null, newRoot: BinarySearchTreeNode<T, K>;
        if (comp < 0) {
            if (this.left == null) {
                this.left = new (this.constructor as any)(value, key, this);
                addedNode = this.left;
            } else {
                [addedNode, newRoot] = this.left.add(value, key, comparator);
                this.left = newRoot;
            }
        } else if (comp > 0) {
            if (this.right == null) {
                this.right = new (this.constructor as any)(value, key, this);
                addedNode = this.right;
            } else {
                [addedNode, newRoot] = this.right.add(value, key, comparator);
                this.right = newRoot;
            }
        }
        return this.balance(addedNode);
    }

    delete(value: T, key: K, comparator: ComparatorFunction<K>): [BinarySearchTreeNode<T, K> | null, BinarySearchTreeNode<T, K> | null] {
        const comp = comparator(key, this.key);
        let removedNode: BinarySearchTreeNode<T, K> | null = null, newRoot: BinarySearchTreeNode<T, K> | null;
        if (comp === 0) {
            if (!this.left && !this.right) {
                return [this, null];
            }
            if (this.leftWeight() > this.rightWeight()) {
                return this.rotateRight().delete(value, key, comparator);
            } else {
                return this.rotateLeft().delete(value, key, comparator);
            }
        }
        if (comp === -1) {
            [removedNode, newRoot] = this.left!.delete(value, key, comparator);
            this.left = newRoot;
        } else if (comp === 1) {
            [removedNode, newRoot] = this.right!.delete(value, key, comparator);
            this.right = newRoot;
        }
        return this.balance(removedNode);
    }

    next(): BinarySearchTreeNode<T, K> | null {
        if (this.right) {
            let node = this.right;
            while (node.left) {
                node = node.left;
            }
            return node;
        }
        let node: BinarySearchTreeNode<T, K> = this;
        while (node.parent && node.parent.right === node) {
            node = node.parent;
        }
        return node.parent;
    }

    update(): void {
        // This method is called whenever a change that occurs in the tree influences this node.
        // This is the only method from this class that should be overwritten.
    }

}


class SortedSetNode<T, K> extends BinarySearchTreeNode<T, K> {
    value: T;
    size: number;

    constructor(value: T, key: K, parent: SortedSetNode<T, K> | null = null) {
        super(key, parent);
        this.value = value;
        this.size = 1;
    }

    leftSize(): number {
        return (this.left && (this.left as SortedSetNode<T, K>).size) || 0;
    }

    rightSize(): number {
        return (this.right && (this.right as SortedSetNode<T, K>).size) || 0;
    }

    recalcSize(): void {
        this.size = this.leftSize() + this.rightSize() + 1;
    }

    update(): void {
        this.left && (this.left as SortedSetNode<T, K>).recalcSize();
        this.right && (this.right as SortedSetNode<T, K>).recalcSize();
        this.recalcSize();
    }

    getIndex(value: T, key: K, comparator: ComparatorFunction<K>): number {
        const comp = comparator(key, this.key);
        if (comp === 0) {
            return this.leftSize();
        }
        if (comp === -1) {
            return (this.left as SortedSetNode<T, K>).getIndex(value, key, comparator);
        }
        return this.leftSize() + 1 + (this.right as SortedSetNode<T, K>).getIndex(value, key, comparator);
    }

    get(index: number): T {
        const leftSize = this.leftSize();
        if (leftSize === index) {
            return this.value;
        }
        if (leftSize > index) {
            return (this.left as SortedSetNode<T, K>).get(index);
        }
        return (this.right as SortedSetNode<T, K>).get(index - leftSize - 1);
    }

    toJSON(): any {
        let json: any = {
            value: this.value,
            key: this.key,
            weight: this.weight,
            size: this.size
        };
        if (this.left) {
            json.left = (this.left as SortedSetNode<T, K>).toJSON();
        }
        if (this.right) {
            json.right = (this.right as SortedSetNode<T, K>).toJSON();
        }
        return json;
    }
}


interface SortedSetOptions<K> {
    cmp?: ComparatorFunction<K>;
    comparator?: ComparatorFunction<K>;
}

export class SortedSet<T, K = T> {
    private comparator: ComparatorFunction<K>;
    private nodeMap: Map<T, SortedSetNode<T, K>>;
    private rootNode: SortedSetNode<T, K> | null;

    constructor(values: (T | [T, K])[] = [], options: SortedSetOptions<K> = {}) {
        if (!Array.isArray(values)) {
            options = values as SortedSetOptions<K>;
            values = [];
        }
        this.comparator = options.cmp || options.comparator || SortedSet.defaultComparator;
        this.init(values);
    }

    init(values: (T | [T, K])[]): void {
        // Map to store the link between an object and their node in the tree.
        this.nodeMap = new Map();
        this.rootNode = null;
        for (let value of values) {
            let key: K;
            if (Array.isArray(value)) {
                key = value[1];
                value = value[0];
            } else {
                key = value as any;
            }
            this.add(value, key);
        }
    }

    getNodeByIndex(index: number): SortedSetNode<T, K> | undefined {
        return this.nodeMap.get(this.get(index)!);
    }

    getNodeByValue(value: T): SortedSetNode<T, K> | undefined {
        return this.nodeMap.get(value);
    }

    setComparator(cmp: ComparatorFunction<K>): void {
        this.comparator = cmp;
        this.init(this.toArray());
    }

    getComparator(): ComparatorFunction<K> {
        return this.comparator;
    }

    static defaultComparator<K>(a: K, b: K): number {
        if (a == b) {
            return 0;
        }
        return (a < b) ? -1 : 1;
    }

    add(value: T, key: K = value as any): SortedSetNode<T, K> | null {
        if (this.has(value)) {
            return null;
        }

        if (!this.rootNode) {
            this.rootNode = new SortedSetNode(value, key);
            this.nodeMap.set(value, this.rootNode);
            return this.rootNode;
        }
        const [node, newRoot] = this.rootNode.add(value, key, this.comparator);
        this.nodeMap.set(value, node);
        this.rootNode = newRoot as SortedSetNode<T, K>;
        return node as SortedSetNode<T, K>;
    }

    has(value: T): boolean {
        return this.nodeMap.has(value);
    }

    size(): number {
        if (!this.rootNode) {
            return 0;
        }
        return this.rootNode.size;
    }

    // Remove the passed value from the SortedSet
    delete(value: T, key: K = value as any): SortedSetNode<T, K> | null {
        if (!this.has(value)) {
            return null;
        }
        const [node, newRoot] = this.rootNode!.delete(value, key, this.comparator);
        this.rootNode = newRoot as SortedSetNode<T, K>;
        this.nodeMap.delete(value);
        return node as SortedSetNode<T, K>;
    }

    clear(): void {
        this.init([]);
    }

    getIndex(value: T, key: K = value as any): number {
        if (!this.has(value)) {
            return -1;
        }
        return this.rootNode!.getIndex(value, key, this.comparator);
    }

    // Return the index-th value in order by priority
    get(index: number): T | null {
        if (this.size() <= index) {
            return null;
        }
        return this.rootNode!.get(index);
    }

    min(): T | null {
        if (!this.size()) {
            return null;
        }
        return (this.rootNode!.min() as SortedSetNode<T, K>).value;
    }

    max(): T | null {
        if (!this.size()) {
            return null;
        }
        return (this.rootNode!.max() as SortedSetNode<T, K>).value;
    }

    // Return iterator over [key, value]
    *entries(startIndex: number = 0, endIndex: number = this.size()): IterableIterator<[K, T]> {
        if (startIndex < endIndex) {
            let node = this.getNodeByIndex(startIndex);
            let position = startIndex;
            while (node && position < endIndex) {
                yield [node.key, node.value];
                node = node.next() as SortedSetNode<T, K> | null;
                position += 1;
            }
        }
    }

    values(startIndex: number = 0, endIndex: number = this.size()): IterableIterator<T> {
        return mapIterator(this.entries(startIndex, endIndex), it => it[1]);
    }

    toArray(startIndex: number = 0, endIndex: number = this.size()): T[] {
        return Array.from(this.values(startIndex, endIndex));
    }

    toJSON(): any {
        if (!this.rootNode) {
            return {};
        }
        return this.rootNode.toJSON();
    }

    toString(): string {
        return this.toArray().toString();
    }

    remove(value: T, key: K = value as any): SortedSetNode<T, K> | null {
        return this.delete(value, key);
    }

    [Symbol.iterator](): IterableIterator<T> {
        return this.values();
    }
}