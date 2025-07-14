import {StemDate} from "../time/Date.js";
import {isFunction, isString} from "../base/Utils.js";
import {GlobalState} from "./State.js";
import {StoreObject} from "./Store";

export interface FieldOptions {
    rawField?: string | symbol | ((key: string, descriptor?: FieldDescriptor) => string | symbol);
    cacheField?: boolean | symbol;
    loader?: (value: any, obj: any) => any;
    isReadOnly?: boolean;
    [key: string]: any;
}

export interface StoreObjectWithFields extends StoreObject {
    fieldDescriptors?: FieldDescriptor[];
}

export type FieldType = string | { makeFieldLoader?: (descriptor: FieldDescriptor) => (value: any, obj: any) => any; } | any;

// Legacy decorator signature for JavaScript compatibility
export type LegacyDecorator = (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => PropertyDescriptor;

class FieldDescriptor {
    type: FieldType;
    targetProto?: any;
    key?: string;
    rawDescriptor?: PropertyDescriptor;
    rawField?: string | symbol | ((key: string, descriptor?: FieldDescriptor) => string | symbol);
    cacheField?: false | symbol;
    loader?: (value: any, obj: any) => any;
    isReadOnly?: boolean;
    [key: string]: any;

    constructor(type: FieldType, options: FieldOptions = {}) {
        this.type = type;
        Object.assign(this, options);
    }

    setTarget(targetProto: StoreObjectWithFields, key: string, rawDescriptor?: PropertyDescriptor): void {
        if (!targetProto.fieldDescriptors) {
            targetProto.fieldDescriptors = [];
        }
        targetProto.fieldDescriptors.push(this);

        this.targetProto = targetProto;
        this.key = key;
        this.rawDescriptor = rawDescriptor;
    }

    // TODO Use this to support lazy initialization
    getDefaultValue(obj: any): any {
        const {initializer} = this.rawDescriptor as any;
        return initializer?.call(obj);
    }

    makeDescriptor(): PropertyDescriptor {
        // TODO "self" should mean type = this.targetProto
        if (isString(this.type)) {
            // We're a Foreign key
            this.rawField = this.rawField || ((key: string) => key + "Id"); // By default we'll add a suffix
            this.cacheField = false;

            const storeName = (this.type === "self") ? null : this.type as string;

            this.loader = (value: any, obj: StoreObjectWithFields) => {
                // TODO Instead of calling GlobalState, the object should implement .getState()
                const store = obj.getStore ? obj.getStore(storeName) : GlobalState.getStore(storeName);
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
            get(this: any): any {
                if (cacheField && this[cacheField]) {
                    return this[cacheField];
                }

                const value = this[rawField!];

                if (value == null || !loader) {
                    return value;
                }

                const result = loader(value, this);
                if (cacheField) {
                    this[cacheField] = result
                }
                return result;
            },
            set(this: any, value: any): void {
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
export function field(type: FieldType, arg: FieldOptions = {}): LegacyDecorator {
    // The actual descriptor - supports both legacy JS decorators and can be gradually migrated to TS
    return (targetProto: any, name: string, rawDescriptor?: PropertyDescriptor): PropertyDescriptor => {
        const fieldDescriptor = new FieldDescriptor(type, arg);
        fieldDescriptor.setTarget(targetProto, name, rawDescriptor);
        return fieldDescriptor.makeDescriptor();
    }
}

// Default handling of objects
(Date as any).makeFieldLoader = (): ((value: any) => any) => {
    return (value: any) => StemDate.optionally(value);
}
