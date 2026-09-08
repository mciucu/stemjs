import {type RawStoreObject, State, type StoreEvent} from "./State";
import {type StoreDependency, StoreObject, type StoreOptions} from "./Store";

export class SingletonStore<T extends SingletonStore<T> = any> extends StoreObject {
    objectType: string;
    state?: State;
    dependencies?: StoreDependency[];

    constructor(objectType: string, options: StoreOptions = {}) {
        super({});
        this.objectType = objectType.toLowerCase();
        this.state = options.state;
        this.dependencies = options.dependencies;
    }

    get(): T {
        return this as any as T;
    }

    all(): T[] {
        return [this as any as T];
    }

    // A singleton is its own store, so it answers the way a store does - with its one object in an array.
    // Left standing: that collides with the single object StoreObject.toJSON answers with, which is the
    // other half of the same class
    toJSON(): RawStoreObject[] {
        return [super.toJSON()];
    }

    applyEvent(event: StoreEvent): T {
        Object.assign(this, event.data);
        this.dispatchChange(event);
        return this as any as T;
    }

    importState(obj: any): void {
        Object.assign(this, obj);
        this.dispatchChange(obj);
    }
}
