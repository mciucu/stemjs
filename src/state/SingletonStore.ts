import {StoreEvent} from "./State";
import {BaseStore, StoreObject, StoreOptions} from "./Store";

export class SingletonStore<T extends SingletonStore<T> = any> extends BaseStore<any> {
    constructor(objectType: string, options: StoreOptions = {}) {
        super(objectType, SingletonStore as any, options);
    }

    get(): T {
        return this as unknown as T;
    }

    all(): T[] {
        return [this as unknown as T];
    }

    toJSON(): string {
        return JSON.stringify([this]);
    }

    applyEvent(event: StoreEvent): void {
        Object.assign(this, event.data);
        this.dispatchChange(event);
    }

    importState(obj: any): void {
        Object.assign(this, obj);
        this.dispatchChange(obj);
    }

    // Use the same logic as StoreObject when listening to events
    addEventListener = StoreObject.prototype.addEventListener.bind(this);
}
