import {State, type StoreEvent} from "./State";
import {type StoreDependency, StoreObject, type StoreOptions} from "./Store";

export class SingletonStore extends StoreObject {
    objectType: string;
    state?: State;
    dependencies?: StoreDependency[];

    constructor(objectType: string, options: StoreOptions = {}) {
        super({});
        this.objectType = objectType.toLowerCase();
        this.state = options.state;
        this.dependencies = options.dependencies;
    }

    get(): this {
        return this;
    }

    all(): this[] {
        return [this];
    }

    applyEvent(event: StoreEvent): this {
        Object.assign(this, event.data);
        this.dispatchChange(event);
        return this;
    }

    importState(obj: unknown): void {
        Object.assign(this, obj);
        this.dispatchChange(obj);
    }
}
