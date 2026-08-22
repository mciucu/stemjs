// this.constructor carries the class's statics. The case worth guarding is a base and a class deriving
// from it both reading one: the declaration has to drop the class's construct signature, or the derived
// class's own constructor is an incompatible override of the base's.

class Base {
    static label = "base";

    describe(): string {
        return this.constructor.label;
    }

    clone(): Base {
        return new this.constructor();
    }
}

class Derived extends Base {
    static extra = 7;

    describeExtra(): number {
        return this.constructor.extra;
    }
}

export const label: string = new Base().describe();
export const extra: number = new Derived().describeExtra();
export const cloned: Base = new Derived().clone();

// A static the class doesn't have is still an error
// @ts-expect-error
export const missing = new Base().describe().nope;
// The base doesn't get the derived class's statics
// @ts-expect-error
export const notOnBase: number = Base.extra;
