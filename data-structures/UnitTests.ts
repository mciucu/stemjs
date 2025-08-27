import {SortedSet} from "./SortedSet";
import {suffixWithOrdinal} from "../base/Utils";

export class SortedSetUnitTests {
    static tests = [
        "emptySet",
        "add10Delete1",
        "add1Delete1",
        "add10Clear",
        "indexQuery",
        "valueQuery"
    ];

    static int() {
        return parseInt(Math.random() * 10000000);
    }

    static checkSanity(set) {
        const dfs = (node) => {
            if (!node) {
                return true;
            }
            if ((node.left && set.comparator(node.key, node.left.key) === -1) || (node.right && set.comparator(node.key, node.right.key) === 1)) {
                console.error("BST property not maintained for node", node);
                return false;
            }
            if (node.weight < node.leftWeight() || node.weight < node.rightWeight()) {
                console.error("Heap property not maintained for node", node);
                return false;
            }
            if (node.size !== node.leftSize() + node.rightSize() + 1) {
                console.error("Size not maintained for node", node);
                return false;
            }
            return (!node.left || dfs(node.left)) && (!node.right || dfs(node.right));
        };
        return dfs(set.rootNode);
    }

    static emptySet() {
        let set = new SortedSet();
        return this.checkSanity(set);
    }

    static add10Delete1() {
        let set = new SortedSet();
        let ok = true;
        for (let i = 0; i < 100; i += 1) {
            let x;
            for (let j = 0; j < 10; j += 1) {
                if (j === 4) {
                    x = this.int();
                    set.add(x);
                } else {
                    set.add(this.int());
                }
                ok = ok && this.checkSanity(set);
            }
            set.delete(x);
            ok = ok && this.checkSanity(set);
        }
        return ok;
    }

    static add1Delete1() {
        let set = new SortedSet();
        let ok = true;
        for (let i = 0; i < 100; i += 1) {
            let x = this.int();
            set.add(x);
            ok = ok && this.checkSanity(set);
            set.delete(x);
            ok = ok && this.checkSanity(set);
        }
        return ok;
    }

    static add10Clear() {
        let set = new SortedSet();
        let ok = true;
        for (let i = 0; i < 100; i += 1) {
            for (let j = 0; j < 10; j += 1) {
                set.add(this.int());
                ok = ok && this.checkSanity(set);
            }
            set.clear();
            ok = ok && this.checkSanity(set);
        }
        return ok;
    }

    static indexQuery() {
        let set = new SortedSet();
        let ok = true;
        let n = 500;
        let a = [];
        for (let i = 0; i < n; i += 1) {
            a.push(this.int());
            set.add(a[a.length - 1]);
        }
        a.sort();
        for (let i = 0; i < 100; i += 1) {
            let index = parseInt(Math.random() * n);
            if (set.get(index) !== a[index]) {
                console.error("Wrong index query", index, set);
                ok = false;
                break;
            }
        }
        return ok;
    }

    static valueQuery() {
        let set = new SortedSet();
        let ok = true;
        let n = 500;
        let a = [];
        for (let i = 0; i < n; i += 1) {
            a.push(this.int());
            set.add(a[a.length - 1]);
        }
        a.sort();
        for (let i = 0; i < 100; i += 1) {
            let index = parseInt(Math.random() * n);
            if (set.getIndex(a[index]) !== index) {
                console.error("Wrong value query", index, set);
                ok = false;
                break;
            }
        }
        return ok;
    }

    static runAllTests(numRuns=100) {
        let ok = true;
        for (let i = 1; i <= numRuns; i += 1) {
            console.log("Running tests " + suffixWithOrdinal(i) + " time out of " + numRuns);
            for (let test of this.tests) {
                ok = ok && this[test]();
            }
        }
        if (ok) {
            console.log("Successfully ran all tests " + numRuns + " times.");
        }
    }
}
export class SortedSetProfiler {
    static NUM_OPERATIONS = 100000;

    static runProfiler(steps=this.NUM_OPERATIONS) {
        let s = new SortedSet();
        let startTime = performance.now();
        let existing = 0;
        for (let j = 0; j < 10; j += 1) {
            startTime = performance.now();
            for (let i = 0; i < steps; i += 1) {
                s.add(Math.random());
            }
            console.log("Added", steps, "values to set already containing", existing, "values in", performance.now() - startTime, "ms");
            existing += steps;
        }
    }
}
