export function enqueueIfNotLoaded(target: any, key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const method = descriptor.value;
    return Object.assign({}, descriptor, {
        value: function(...args: any[]) {
            if (this.isLoaded()) {
                return method.call(this, ...args);
            } else {
                this.enqueueMethodCall(method, args);
                return null;
            }
        }
    });
}


type Constructor<T = {}> = new (...args: any[]) => T;

interface EnqueueableMethodInterface {
    methodCallQueue?: [Function, any[]][];
    isLoaded(): boolean;
    enqueueMethodCall(method: Function, args: any[]): void;
    resolveQueuedMethods(): void;
}

export function EnqueueableMethodMixin<TBase extends Constructor>(BaseClass: TBase) {
    return class EnqueueableMethodClass extends BaseClass implements EnqueueableMethodInterface {
        methodCallQueue?: [Function, any[]][];

        isLoaded(): boolean {
            throw Error("Not implemented!");
        }

        enqueueMethodCall(method: Function, args: any[]): void {
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
