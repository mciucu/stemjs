export function enqueueIfNotLoaded(target, key, descriptor) {
    const method = descriptor.value;
    return Object.assign({}, descriptor, {
        value: function() {
            if (this.isLoaded()) {
                return method.call(this, ...arguments);
            } else {
                this.enqueueMethodCall(method, arguments);
                return null;
            }
        }
    });
}


export const EnqueueableMethodMixin = (BaseClass) => class EnqueueableMethodClass extends BaseClass {
    isLoaded() {
        throw Error("Not implemented!");
    }

    enqueueMethodCall(method, args) {
        this.methodCallQueue = this.methodCallQueue || [];
        this.methodCallQueue.push([method, args]);
    }

    resolveQueuedMethods() {
        if (!this.isLoaded()) {
            throw Error("Cannot process scheduled jobs, element not loaded");
        }
        for (let methodCall of this.methodCallQueue || []) {
            methodCall[0].call(this, ...methodCall[1]);
        }
        delete this.methodCallQueue;
    }
};
