import {type StoreEvent, type StoreId} from "../State";
import {isString} from "../../base/Utils";
import {BaseStore, type StoreClass, type StoreObject} from "../Store";
import {Dispatchable} from "../../base/Dispatcher";

export const VirtualObjectStoreMixin = (objectType: string) => class VirtualStoreObject extends BaseStore(objectType) {
    hasTemporaryId(): boolean {
        return isString(this.id) && this.id.startsWith("temp-");
    }

    isVirtual(): boolean {
        return this.hasTemporaryId();
    }

    // Meant for updating temporary objects that need to exist before being properly created
    updateId(newId: StoreId): void {
        if (this.id == newId) {
            return;
        }
        let oldId = this.id;
        if (!this.hasTemporaryId()) {
            console.error("This is only meant to replace temporary ids!");
        }
        this.id = newId;
        this.dispatch("updateId", {oldId: oldId});
    }

    static virtualIdCounter: number;

    static generateVirtualId(): number {
        if (!this.virtualIdCounter) {
            this.virtualIdCounter = 0;
        }
        this.virtualIdCounter += 1;
        return this.virtualIdCounter;
    }

    // TODO: we probably shouldn't have getVirtualObject take in an event
    // The map is the base's, so it is typed by the base's instance; what a temp id parks is one of ours
    static getVirtualObject(event: StoreEvent): VirtualStoreObject | undefined {
        return this.objects.get("temp-" + event.virtualId) as VirtualStoreObject;
    }

    static applyUpdateObjectId<T extends VirtualStoreObject>(this: StoreClass<T> & Dispatchable, object: T, id: string): void {
        if (object.id === id) {
            return;
        }
        const oldId = String(object.id);
        object.updateId(id);
        this.objects.delete(oldId);
        this.addObject(object.id, object);
        this.dispatch("updateObjectId", object, oldId);
    }

    static applyCreateOrUpdateEvent<T extends StoreObject>(this: StoreClass<T> & Dispatchable & typeof VirtualStoreObject, event: StoreEvent, sendDispatch: boolean = true): T {
        if (event.virtualId) {
            let existingVirtualObject = this.getVirtualObject(event);
            if (existingVirtualObject) {
                this.applyUpdateObjectId(existingVirtualObject, event.objectId as string);
            }
        }

        return super.applyCreateOrUpdateEvent<T>(event, sendDispatch);
    }
};
