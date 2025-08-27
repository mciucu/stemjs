import {isString} from "../base/Utils.js";

export class RandGen {
    constructor(seed = Date.now() ^ Math.floor(100000 * Math.random()), y = 0xf23151df, z = 0xcafe0dee) {
        this.x = seed | 0;
        this.y = y | 0;
        this.z = z | 0;

        if (isString(seed)) {
            for (let i = 0; i < seed.length; i++) {
                const chr = seed.charCodeAt(i);
                this.x += chr ^ (chr << 16) ^ (chr << 24);
                this.y += chr;
                this.z -= chr;
                this.nextInt();
            }
            for (let i = 0; i < 100; i++) {
                this.nextInt();
            }
        }
    }

    nextInt() {
        const t = this.x ^ (this.x << 11);
        this.x = this.y;
        this.y = this.z;
        this.z ^= (this.z >> 19) ^ t ^ (t >> 8);
        return this.z;
    }

    random() {
        return (this.nextInt() >>> 0) / (2 ** 31);
    }

    rand(N) {
        return this.nextInt() % N;
    }

    hex(count = 8) {
        let result = "";
        while (count > 0) {
            const charAvailable = 8;
            const hexStr = this.nextInt().toString(16).padEnd(charAvailable, "0");
            const charTaken = Math.min(charAvailable, count);
            count -= charTaken;
            result += hexStr.substring(0, charTaken);
        }
        return result;
    }

    pick(elements) {
        const poz = this.rand(elements.length);
        return elements[poz];
    }

    // TODO Should probably have a decorator that creates an instance and adds all static methods
    static random() {
        return this.instance.random();
    }

    static nextInt() {
        return this.instance.nextInt();
    }

    static rand(N) {
        return this.instance.rand(N);
    }
}

RandGen.instance = new RandGen();
