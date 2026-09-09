type HandleDescriptor = (target: object, key: string | symbol, descriptor: PropertyDescriptor, args: unknown[]) => PropertyDescriptor;

// What a legacy decorator is handed: the field's initializer rides along on the descriptor, and the
// standard PropertyDescriptor does not model it
export interface LegacyPropertyDescriptor extends PropertyDescriptor {
    initializer?: () => unknown;
}

export function isDescriptor(desc: any): desc is PropertyDescriptor {
    if (!desc?.hasOwnProperty) {
        return false;
    }

    const keys = ["value", "initializer", "get", "set"];

    for (let key of keys) {
        if (desc.hasOwnProperty(key)) {
            return true;
        }
    }

    return false;
}

// Either the descriptor a direct application produces, or the decorator a factory call answers with
export type DecorateResult = PropertyDescriptor | ((target: object, key: string | symbol, descriptor: PropertyDescriptor) => PropertyDescriptor);

// TODO @types what should entryArgs really be?
export function decorate(handleDescriptor: HandleDescriptor, entryArgs: any[]): DecorateResult {
    if (isDescriptor(entryArgs[entryArgs.length - 1])) {
        return handleDescriptor(...entryArgs as [object, string | symbol, PropertyDescriptor], []);
    } else {
        return function (target: object, key: string | symbol, descriptor: PropertyDescriptor) {
            return handleDescriptor(target, key, descriptor, entryArgs);
        };
    }
}

export function createDefaultSetter<T>(key: string | symbol): (newValue: T) => T {
    return function set(this: object, newValue: T): T {
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
