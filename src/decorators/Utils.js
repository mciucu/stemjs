export function isDescriptor(desc) {
    if (!desc || !desc.hasOwnProperty) {
        return false;
    }

    const keys = ['value', 'initializer', 'get', 'set'];

    for (let key of keys) {
        if (desc.hasOwnProperty(key)) {
            return true;
        }
    }

    return false;
}

export function decorate(handleDescriptor, entryArgs) {
    if (isDescriptor(entryArgs[entryArgs.length - 1])) {
        return handleDescriptor(...entryArgs, []);
    } else {
        return function () {
            return handleDescriptor(...arguments, entryArgs);
        };
    }
}

export function createDefaultSetter(key) {
    return function set(newValue) {
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
