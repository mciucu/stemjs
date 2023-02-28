import {StemDate} from "../time/Date.js";
import {isFunction, isString} from "../base/Utils.js";


class FieldDescriptor {
    constructor(type, options) {
        this.type = type;
        Object.assign(this, options);
    }

    setTarget(targetProto, key, rawDescriptor) {
        if (!targetProto.fieldDescriptors) {
            targetProto.fieldDescriptors = [];
        }
        targetProto.fieldDescriptors.push(this);

        this.targetProto = targetProto;
        this.key = key;
        this.rawDescriptor = rawDescriptor;
    }

    // TODO Use this to support lazy initialization
    getDefaultValue(obj) {
        const {initializer} = this.rawDescriptor;
        return initializer?.call(obj);
    }

    makeDescriptor() {
        // TODO "self" should mean type = this.targetProto
        if (isString(this.type)) {
            // We're a Foreign key
            this.rawField = this.rawField || (key => key + "Id"); // By default we'll add a suffix
            this.cacheField = false;

            const storeName = (this.type === "self") ? null : this.type;

            this.loader = (value, obj) => {
                const store = obj.getStore(storeName);
                return store.get(value);
            }
        }

        // First let the type modify this, in case it needs to overwrite some behavior
        if (!this.loader && this.type.makeFieldLoader) {
            this.loader = this.type.makeFieldLoader(this);
            // We actually prefer by default to have a cache to that object[field] === object[field] (which would have been invalidated by another load)
            this.cacheField = this.cacheField ?? Symbol("cached-" + this.key);
        }

        // Apply default logic in case it was not explicitly given
        if (isFunction(this.rawField)) {
            this.rawField = this.rawField(this.key, this);
        }

        if (!this.rawField) {
            this.rawField = Symbol("_" + this.key);
        } else {
            this.isReadOnly = true;
        }

        // Extracting for speed in the functions bellow
        const {rawField, cacheField, loader, isReadOnly, key} = this;

        return {
            get() {
                if (cacheField && this[cacheField]) {
                    return this[cacheField];
                }

                const value = this[rawField];

                if (value == null || !loader) {
                    return value;
                }

                const result = loader(value, this);
                if (cacheField) {
                    this[cacheField] = result
                }
                return result;
            },
            set(value) {
                if (isReadOnly) {
                    throw `Not allowed to change field ${key}`;
                }
                // TODO type validation
                // if (!(value instanceof type)) {
                //     console.warn("Invalid type detected", key, value);
                // }
                this[rawField] = value;
                if (cacheField) {
                    delete this[cacheField];
                }
            }
        }
    }
}


// TODO Implement a way to say @field(Array, "StoreObject") for instance
export function field(type, arg={}) {
    // The actual descriptor
    return (targetProto, name, rawDescriptor) => {
        const fieldDescriptor = new FieldDescriptor(type, arg);
        fieldDescriptor.setTarget(targetProto, name, rawDescriptor);
        return fieldDescriptor.makeDescriptor();
    }
}

// Default handling of objects
Date.makeFieldLoader = () => {
    return (value) => StemDate.optionally(value);
}
