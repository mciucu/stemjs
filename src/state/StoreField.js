import {StemDate} from "../time/Date.js";
import {GlobalState} from "./State.js";
import {lazyInit} from "../decorators/LazyInitialize.js";
import {isString} from "../base/Utils.js";

export const FIELD_LOADERS = {
    [Date]: (value) => StemDate.optionally(value),
    [String]: null, // No change to the underlying value
    [Boolean]: null,
    [Number]: null,
    [Array]: null, // TODO @Mihai implement a way to say @field(Array, "Merchant") or @field(Array, Class)
    [Object]: null, // meaning generic JSON field
    // TODO: Enum support? Assume plain object here or if Object.isFrozen(key)?
}

function makeForeignKeyField(type, options) {
    let {
        rawField,
    } = options;

    return (targetProto, name, descriptor) => {
        rawField = rawField || (name + "Id");

        // TODO: also mark the target with this info, so be able to run code analysis and compare with backend.

        return {
            get() {
                const store = (type != "self") ? GlobalState.getStore(type) : this.getStore();
                const id = this[rawField];
                return store.get(id);
            },
            set() {
                throw "Read only field " + name;
            }
        }
    }
}

function makeManyToOneField(type, options) {
    let {
        manyField
    } = options;

    return (target, name, descriptor) => {
        return {
            get() {
                // TODO: we can probably pre-index these, good enough for now
                const store = GlobalState.getStore(type);
                return store.filter(obj => obj[manyField] == this.id);
            },
            set() {
                throw "Read only field " + name;
            }
        }
    }
}

function makeWrapperField(type, options) {
    const fieldLoaderSymbol = type?.fieldLoaderSymbol ? type.fieldLoaderSymbol : type;

    if (!FIELD_LOADERS.hasOwnProperty(fieldLoaderSymbol)) {
        // We'd need to explicitly handle the type. Otherwise, just use the plain way -- @field fieldName
        throw "Can't process field type" + type;
    }

    const loader = FIELD_LOADERS[fieldLoaderSymbol];

    if (loader == null) {
        return lazyInit;
    }

    if (loader.wrapIdField) {
        // We want to wrap the IdField by default for some loaders.
        options = {
            wrapIdField: true,
            ...options,
        }
    }

    // We're proxying a different field (like an Id field)
    return (target, name, descriptor) => {
        const rawField = options.wrapIdField ? (name + "Id") : options.rawField;

        if (!rawField) {
            // We're proxying the same field
            const nameSymbol = Symbol.for(name);
            return {
                get() {
                    return this[nameSymbol]; //  TOD
                },
                set(value) {
                    return this[nameSymbol] = loader(value, this);
                }
            }
        }

        const rawFieldSymbol = Symbol.for(rawField);

        Object.defineProperty(target, rawField, {
            get() {
                return this[rawFieldSymbol];
            },
            set(value) {
                this[rawFieldSymbol] = loader(value, this);
            },
        });

        return {
            get() {
                return this[rawFieldSymbol];
            },
            set(value) {
                throw "Can't overwrite proxy field";
            }
        };
    }
}

// Decorator for store fields, to not overwrite what was received in the constructor
// In the admin, this also makes the field observable
function field(type, options = {}) {
    if (arguments.length === 3) {
        // We're being called directly on the field
        return lazyInit(...arguments);
    }

    if (isString(type)) {
        // This is DB relationship, either a foreign key or many to one.
        const {manyField} = options;
        if (manyField) {
            return makeManyToOneField(type, options);
        }
        return makeForeignKeyField(type, options);
    }

    return makeWrapperField(type, options);
}

export {field}
