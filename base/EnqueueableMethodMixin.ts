import {type Constructor} from "./Utils";
export function enqueueIfNotLoaded(target: object, key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const method = descriptor.value;
    return {
        ...descriptor,
        value: function(this: EnqueueableMethodInterface, ...args: any[]) {
            if (this.isLoaded()) {
                return method.call(this, ...args);
            } else {
                this.enqueueMethodCall(method, args);
                return null;
            }
        },
    };
}



// A method held until the element is loaded, with the arguments it was called with
type QueuedCall = [(...args: any[]) => unknown, any[]];

interface EnqueueableMethodInterface {
    methodCallQueue?: QueuedCall[];
    isLoaded(): boolean;
    enqueueMethodCall(method: QueuedCall[0], args: any[]): void;
    resolveQueuedMethods(): void;
}

export function EnqueueableMethodMixin<TBase extends Constructor>(BaseClass: TBase) {
    return class EnqueueableMethodClass extends BaseClass implements EnqueueableMethodInterface {
        methodCallQueue?: QueuedCall[];

        isLoaded(): boolean {
            throw Error("Not implemented!");
        }

        enqueueMethodCall(method: QueuedCall[0], args: any[]): void {
            this.methodCallQueue = this.methodCallQueue || [];
            this.methodCallQueue.push([method, args]);
        }

        resolveQueuedMethods(): void {
            if (!this.isLoaded()) {
                throw Error("Cannot process scheduled jobs, element not loaded");
            }
            for (let methodCall of this.methodCallQueue || []) {
                methodCall[0].call(this, ...methodCall[1]);
            }
            delete this.methodCallQueue;
        }
    };
}
