type HandleDescriptor = (target: any, key: string | symbol, descriptor: PropertyDescriptor, args: any[]) => PropertyDescriptor;

export function isDescriptor(desc: any): desc is PropertyDescriptor {
    if (!desc?.hasOwnProperty) {
        return false;
    }

    const keys: (keyof PropertyDescriptor)[] = ["value", "initializer", "get", "set"];

    for (let key of keys) {
        if (desc.hasOwnProperty(key)) {
            return true;
        }
    }

    return false;
}

// TODO @types what should entryArgs really be?
export function decorate(handleDescriptor: HandleDescriptor, entryArgs: any[]): any {
    if (isDescriptor(entryArgs[entryArgs.length - 1])) {
        return handleDescriptor(...entryArgs, []);
    } else {
        return function (target: any, key: string | symbol, descriptor: PropertyDescriptor) {
            return handleDescriptor(target, key, descriptor, entryArgs);
        };
    }
}

export function createDefaultSetter<T>(key: string | symbol): (newValue: T) => T {
    return function set(this: any, newValue: T): T {
        Object.defineProperty(this, key, {
            configurable: true,
            writable: true,
            // IS enumerable when reassigned by the outside word
            enumerable: true,
            value: newValue
        });

        return newValue;
    };
}
