import {decorate, createDefaultSetter} from './Utils';

function handleDescriptor(target, key, descriptor) {
    const { configurable, enumerable, initializer, value } = descriptor;
    // The "key" property is constructed with accessor descriptor (getter / setter),
    // but the first time the getter is used, the property is reconstructed with data descriptor.
    return {
        configurable,
        enumerable,

        get() {
            // This happens if someone accesses the property directly on the prototype
            if (this === target) {
                return;
            }

            const ret = initializer ? initializer.call(this) : value;

            Object.defineProperty(this, key, {
                configurable,
                enumerable,
                writable: true,
                value: ret
            });

            return ret;
        },

        set: createDefaultSetter(key)
    };
}

export function lazyInitialize(...args) {
    return decorate(handleDescriptor, args);
}

let lazyInit = lazyInitialize;

export {lazyInit};
