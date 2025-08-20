import {State, StoreEvent} from "./State";
import {StoreObject, StoreOptions} from "./Store";

export class SingletonStore<T extends SingletonStore<T> = any> extends StoreObject {
    objectType: string;
    state?: State;
    dependencies: string[];

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
}
