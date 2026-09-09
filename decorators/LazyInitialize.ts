import {decorate, createDefaultSetter, type DecorateResult} from "./Utils";

interface LazyDescriptor extends PropertyDescriptor {
    initializer?: () => unknown;
}

function handleDescriptor(target: object, key: string | symbol, descriptor: LazyDescriptor, _args: unknown[]): PropertyDescriptor {
    const { configurable, enumerable, initializer, value } = descriptor;
    // The "key" property is constructed with accessor descriptor (getter / setter),
    // but the first time the getter is used, the property is reconstructed with data descriptor.
    return {
        configurable,
        enumerable,

        get(this: object): unknown {
            // This happens if someone accesses the property directly on the prototype
            if (this === target) {
                return;
            }

            const ret = initializer ? initializer.call(this) : value;

            // Overwrite the getter & setter combo with the plain field on first assignment.
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

// Applied directly it answers with the descriptor; called as a factory it answers with the decorator
export function lazyInit(target: object, key: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor;
export function lazyInit(...args: unknown[]): DecorateResult;
export function lazyInit(...args: any[]): DecorateResult {
    return decorate(handleDescriptor, args);
}
