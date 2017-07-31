// Several times faster than Math.random()
export class RandGenFast {
    constructor(x=Date.now() ^ Math.floor(100000 * Math.random()), y=0x123151df, z=0xcafe0dee) {
        this.x = x | 0;
        this.y = y | 0;
        this.z = z | 0;
    }

    nextInt() {
        const t = this.x ^ (this.x << 11);
        this.x = this.y;
        this.y = this.z;
        this.z ^= (this.z >> 19) ^ t ^ (t >> 8);
        return this.z;
    }

    random() {
        return this.nextInt() / 2147483648.0;
    }

    rand(N) {
        return this.nextInt() % N;
    }

    static random() {
        return this.instance.random();
    }

    static nextInt() {
        return this.instance.nextInt();
    }

    static rand(N) {
        return this.instance.rand(N);
    }
};

RandGenFast.instance = new RandGenFast();
