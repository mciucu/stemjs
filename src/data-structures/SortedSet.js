import {mapIterator} from "../base/Utils";

// Data structure to keep a set of objects/values sorted by a given criteria
// Can support inserting a value (with an optional key), getting a range
// Can be used for instance to keep a rolling view on a table while scrolling
// TODO: should probably also support keeping track of a range with dispatchers?


class BinarySearchTreeNode {
    constructor(key, parent=null) {
        this.weight = Math.random();
        this.parent = parent;
        this.left = this.right = null;
        this.key = key;
    }

    leftWeight() {
        return (this.left && this.left.weight) || -1;
    }

    rightWeight() {
        return (this.right && this.right.weight) || -1;
    }

    min() {
        return (this.left && this.left.min()) || this;
    }

    max() {
        return (this.right && this.right.max()) || this;
    }

    replaceParentRef(newNode) {
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

    rotateLeft() {
        const a = this, b = this.right;
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

    rotateRight() {
        const a = this.left, b = this;
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

    balance(nodeToReturn) {
        let newRoot = this;

        if (this.rightWeight() > this.weight) {
            newRoot = this.rotateLeft();
        } else if (this.leftWeight() > this.weight) {
            newRoot = this.rotateRight();
        }

        newRoot.update();

        return [nodeToReturn, newRoot];
    }

    add(value, key, comparator) {
        const comp = comparator(key, this.key);
        let addedNode, newRoot;
        if (comp < 0) {
            if (this.left == null) {
                this.left = new this.constructor(value, key, this);
                addedNode = this.left;
            } else {
                [addedNode, newRoot] = this.left.add(value, key, comparator);
                this.left = newRoot;
            }
        } else if (comp > 0) {
            if (this.right == null) {
                this.right = new this.constructor(value, key, this);
                addedNode = this.right;
            } else {
                [addedNode, newRoot] = this.right.add(value, key, comparator);
                this.right = newRoot;
            }
        }
        return this.balance(addedNode);
    }

    delete(value, key, comparator) {
        const comp = comparator(key, this.key);
        let removedNode, newRoot;
        if (comp === 0) {
            if (!this.left && !this.right) {
                return [this, undefined];
            }
            if (this.leftWeight() > this.rightWeight()) {
                return this.rotateRight().delete(value, key, comparator);
            } else {
                return this.rotateLeft().delete(value, key, comparator);
            }
        }
        if (comp === -1) {
            [removedNode, newRoot] = this.left.delete(value, key, comparator);
            this.left = newRoot;
        } else if (comp === 1) {
            [removedNode, newRoot] = this.right.delete(value, key, comparator);
            this.right = newRoot;
        }
        return this.balance(removedNode);
    }

    next() {
        if (this.right) {
            let node = this.right;
            while (node.left) {
                node = node.left;
            }
            return node;
        }
        let node = this;
        while (node.parent && node.parent.right === node) {
            node = node.parent;
        }
        return node.parent;
    }

    update() {
        // This method is called whenever a change that occurs in the tree influences this node.
        // This is the only method from this class that should be overwritten.
    }

}


class SortedSetNode extends BinarySearchTreeNode {
    constructor(value, key, parent=null) {
        super(key, parent);
        this.value = value;
        this.size = 1;
    }

    leftSize() {
        return (this.left && this.left.size) || 0;
    }

    rightSize() {
        return (this.right && this.right.size) || 0;
    }

    recalcSize() {
        this.size = this.leftSize() + this.rightSize() + 1;
    }

    update() {
        this.left && this.left.recalcSize();
        this.right && this.right.recalcSize();
        this.recalcSize();
    }

    getIndex(value, key, comparator) {
        const comp = comparator(key, this.key);
        if (comp === 0) {
            return this.leftSize();
        }
        if (comp === -1) {
            return this.left.getIndex(value, key, comparator);
        }
        return this.leftSize() + 1 + this.right.getIndex(value, key, comparator);
    }

    get(index) {
        const leftSize = this.leftSize();
        if (leftSize === index) {
            return this.value;
        }
        if (leftSize > index) {
            return this.left.get(index);
        }
        return this.right.get(index - leftSize - 1);
    }

    toJSON() {
        let json = {
            value: this.value,
            key: this.key,
            weight: this.weight,
            size: this.size
        };
        if (this.left) {
            json.left = this.left.toJSON();
        }
        if (this.right) {
            json.right = this.right.toJSON();
        }
        return json;
    }
}


export class SortedSet {
    constructor(values=[], options={}) {
        if (!Array.isArray(values)) {
            options = values;
            values = [];
        }
        this.comparator = options.cmp || options.comparator || this.constructor.defaultComparator;
        this.init(values);
    }

    init(values) {
        // Map to store the link between an object and their node in the tree.
        this.nodeMap = new Map();
        this.rootNode = null;
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

    getNodeByIndex(index) {
        return this.nodeMap.get(this.get(index));
    }

    getNodeByValue(value) {
        return this.nodeMap.get(value);
    }

    setComparator(cmp) {
        this.comparator = cmp;
        this.init(this.toArray());
    }

    static defaultComparator(a, b) {
        if (a == b) {
            return 0;
        }
        return (a < b) ? -1 : 1;
    }

    add(value, key=value) {
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
        this.rootNode = newRoot;
        return node;
    }

    has(value) {
        return this.nodeMap.has(value);
    }

    size() {
        if (!this.rootNode) {
            return 0;
        }
        return this.rootNode.size;
    }

    // Remove the passed value from the SortedSet
    delete(value, key=value) {
        if (!this.has(value)) {
            return null;
        }
        const [node, newRoot] = this.rootNode.delete(value, key, this.comparator);
        this.rootNode = newRoot;
        this.nodeMap.delete(value);
        return node;
    }

    clear() {
        this.init([]);
    }

    getIndex(value, key=value) {
        if (!this.has(value)) {
            return -1;
        }
        return this.rootNode.getIndex(value, key, this.comparator);
    }

    // Return the index-th value in order by priority
    get(index) {
        if (this.size() < index) {
            return null;
        }
        return this.rootNode.get(index);
    }

    min() {
        if (!this.size()) {
            return null;
        }
        return this.rootNode.min().value;
    }

    max() {
        if (!this.size()) {
            return null;
        }
        return this.rootNode.max().value;
    }

    // Return iterator over [key, value]
    * entries(startIndex=0, endIndex=this.size()) {
        if (startIndex < endIndex) {
            let node = this.getNodeByIndex(startIndex);
            let position = startIndex;
            while (node && position < endIndex) {
                yield [node.key, node.value];
                node = node.next();
                position += 1;
            }
        }
    }

    values(startIndex=0, endIndex=this.size()) {
        return mapIterator(this.entries(startIndex, endIndex), it => it[1]);
    }

    toArray(startIndex=0, endIndex=this.size()) {
        return Array.from(this.values(startIndex, endIndex));
    }

    toJSON() {
        if (!this.rootNode) {
            return {};
        }
        return this.rootNode.toJSON();
    }

    toString() {
        return this.toArray().toString();
    }
}

SortedSet.prototype.remove = SortedSet.prototype.delete;
SortedSet.prototype[Symbol.iterator] = SortedSet.prototype.values;