import {isFunction, TimeoutHandler, IntervalHandler} from "./Utils";

type Callback = Function;

export interface RemoveHandle {
    remove: () => void;
}

export interface CleanupHandle {
    cleanup: () => void;
}

export type CleanupJob = RemoveHandle | CleanupHandle | Function;

function implementsRemoveHandle(job: CleanupJob): job is RemoveHandle {
    return "remove" in job && isFunction(job.remove);
}

function implementsCleanupHandle(job: CleanupJob): job is CleanupHandle {
    return "cleanup" in job && isFunction(job.cleanup);
}

class DispatcherHandle implements RemoveHandle {
    dispatcher: Dispatcher | undefined;
    callback: Callback | undefined;

    constructor(dispatcher: Dispatcher, callback: Callback) {
        this.dispatcher = dispatcher;
        this.callback = callback;
    }

    remove(): void {
        if (!this.dispatcher) {
            console.warn("Removing a dispatcher twice");
            return;
        }
        this.dispatcher.removeListener(this.callback!);
        this.dispatcher = undefined;
        this.callback = undefined;
    }

    cleanup(): void {
        this.remove();
    }
}

class Dispatcher {
    options: any;
    listeners: Callback[];

    constructor(options: any = {}) {
        this.options = options;
        this.listeners = [];
    }

    callbackExists(callback: Callback): boolean {
        for (let i = 0; i < this.listeners.length; i += 1) {
            if (this.listeners[i] === callback) {
                return true;
            }
        }
        return false;
    }

    addListener(callback: Callback): DispatcherHandle | undefined {
        if (!(typeof callback === "function")) {
            console.error("The listener needs to be a function: ", callback);
            return;
        }
        if (this.callbackExists(callback)) {
            console.error("Can't re-register for the same callback: ", this, " ", callback);
            return;
        }

        this.listeners.push(callback);
        return new DispatcherHandle(this, callback);
    };

    addListenerOnce(callback: Callback): DispatcherHandle | undefined {
        let handler = this.addListener(function (...args: any[]) {
            callback(...args);
            handler!.remove();
        });
        return handler;
    }

    async awaitOnce(): Promise<any> {
        return new Promise((resolve) => {
            this.addListenerOnce((...args: any[]) => {
                // @ts-ignore
                resolve(...args);
            });
        });
    }

    removeListener(callback: Callback): Callback | undefined {
        for (let i = 0; i < this.listeners.length; i += 1) {
            if (this.listeners[i] === callback) {
                // Erase and return
                return this.listeners.splice(i, 1)[0];
            }
        }
    };

    removeAllListeners(): void {
        this.listeners = [];
    }

    dispatch(...args: any[]): void {
        for (let i = 0; i < this.listeners.length; ) {
            let listener = this.listeners[i];
            listener(...args);
            // In case the current listener deleted itself, keep the loop counter the same
            // If it deleted listeners that were executed before it, that's just wrong and there are no guaranteed about
            if (listener === this.listeners[i]) {
                i++;
            }
        }
    };
}

export const DispatchersSymbol = Symbol("Dispatchers");
export const CleanupJobsSymbol = Symbol("CleanupJobs");

class Dispatchable {
    declare private [DispatchersSymbol]?: Map<string, Dispatcher>;
    declare private [CleanupJobsSymbol]?: CleanupJobs;

    get dispatchers(): Map<string, Dispatcher> {
        return this[DispatchersSymbol] || (this[DispatchersSymbol] = new Map());
    }

    get cleanupJobs(): CleanupJobs {
        return this[CleanupJobsSymbol] || (this[CleanupJobsSymbol] = new CleanupJobs());
    }

    getDispatcher(name: string, addIfMissing: boolean = true): Dispatcher | undefined {
        let dispatcher = this.dispatchers.get(name);
        if (!dispatcher && addIfMissing) {
            dispatcher = new Dispatcher();
            this.dispatchers.set(name, dispatcher);
        }
        return dispatcher;
    }

    dispatch(name: string, ...args: any[]): void {
        let dispatcher = this.getDispatcher(name, false);
        if (dispatcher) {
            dispatcher.dispatch(...args);
        }
    }

    addListenerGeneric(methodName: keyof Dispatcher, name: string | string[], callback: Callback): DispatcherHandle | CleanupJobs | undefined {
        if (Array.isArray(name)) {
            return new CleanupJobs(name.map(x => (this as any)[methodName](x, callback)));
        }
        return (this.getDispatcher(name) as any)?.[methodName](callback);
    }

    addListener(name: string | string[], callback: Callback): DispatcherHandle | CleanupJobs | undefined {
        return this.addListenerGeneric("addListener", name, callback);
    }

    addListenerOnce(name: string | string[], callback: Callback): DispatcherHandle | CleanupJobs | undefined {
        return this.addListenerGeneric("addListenerOnce", name, callback);
    }

    removeListener(name: string, callback: Callback): void {
        const dispatcher = this.getDispatcher(name, false);
        dispatcher?.removeListener(callback);
    }

    removeAllListeners(name: string): void {
        const dispatcher = this.getDispatcher(name, false);
        dispatcher?.removeAllListeners();
    }

    cleanup(): void {
        this.runCleanupJobs();
        delete this[DispatchersSymbol];
    }

    // These function don't really belong here, but they don't really hurt here and I don't want a long proto chain
    // Add anything that needs to be called on cleanup here (dispatchers, etc)
    addCleanupJob(cleanupJob: CleanupJob): CleanupJob {
        this.cleanupJobs.add(cleanupJob);
        return cleanupJob;
    }

    runCleanupJobs(): void {
        this.cleanupJobs?.cleanup();
    }

    detachListener(dispatcherHandle: DispatcherHandle): void {
        if (this[CleanupJobsSymbol]) {
            this[CleanupJobsSymbol].remove(dispatcherHandle);
        } else {
            dispatcherHandle.remove();
        }
    }

    attachTimeout(callback: () => void, timeout: number): TimeoutHandler {
        // TODO when the timeout executes, it doesn't get cleared from the cleanup jobs and would leak
        const timeoutId = setTimeout(callback, timeout);
        this.addCleanupJob(() => clearTimeout(timeoutId));
        return timeoutId;
    }

    attachInterval(callback: () => void, timeout: number): IntervalHandler {
        const intervalId = setInterval(callback, timeout);
        this.addCleanupJob(() => clearInterval(intervalId));
        return intervalId;
    }

    attachAnimationFrame(callback: (time: number) => void): TimeoutHandler | number {
        const animationId = requestAnimationFrame(callback);
        this.addCleanupJob(() => cancelAnimationFrame(animationId));
        return animationId;
    }

    // TODO @Mihai when can this return an undefined? Shouldn't be possible
    addChangeListener(callback: Callback): DispatcherHandle | CleanupJobs | undefined {
        return this.addListener("change", callback);
    }

    dispatchChange(...args: any[]): void {
        this.dispatch("change", ...args, this);
    }
}

// Creates a method that calls the method methodName on obj, and adds the result as a cleanup task
function getAttachCleanupJobMethod(methodName: string) {
    let addMethodName = "add" + methodName;
    let removeMethodName = "remove" + methodName;
    return function (this: Dispatchable, obj: any, ...args: any[]) {
        let handler = obj[addMethodName](...args);
        // TODO: This should be changed. It is bad to receive 2 different types of handlers.
        if (!handler) {
            handler = () => {
                obj[removeMethodName](...args);
            }
        }
        this.addCleanupJob(handler);
        return handler;
    }
}

// TODO maybe this can be handle better through a Proxy?
// Not sure if these should be added like this, but meh
(Dispatchable.prototype as any).attachListener           = getAttachCleanupJobMethod("Listener");
(Dispatchable.prototype as any).attachEventListener      = getAttachCleanupJobMethod("EventListener");
(Dispatchable.prototype as any).attachCreateListener     = getAttachCleanupJobMethod("CreateListener");
(Dispatchable.prototype as any).attachDeleteListener     = getAttachCleanupJobMethod("DeleteListener");
(Dispatchable.prototype as any).attachChangeListener     = getAttachCleanupJobMethod("ChangeListener");
(Dispatchable.prototype as any).attachListenerOnce       = getAttachCleanupJobMethod("ListenerOnce");

(Dispatcher as any).Global = new Dispatchable();

export class RunOnce {
    private timeout?: TimeoutHandler;

    run(callback: () => void, timeout: number = 0): void {
        if (this.timeout) {
            return;
        }
        this.timeout = setTimeout(() => {
            callback();
            this.timeout = undefined;
        }, timeout);
    }
}

export class OncePerTickRunner {
    private callback: (obj: any, ...args: any[]) => void;
    private throttle: WeakMap<object, any[]>;

    constructor(callback: (obj: any, ...args: any[]) => void) {
        this.callback = callback;
        this.throttle = new WeakMap();
    }

    maybeEnqueue(obj: object, ...args: any[]): boolean {
        const existingArgs = this.throttle.get(obj);
        this.throttle.set(obj, args);

        if (existingArgs) {
            // We just updated the args
            return false;
        }

        queueMicrotask(() => {
            const existingArgs = this.throttle.get(obj)
            if (!existingArgs) {
                // We have been canceled
                return;
            }
            this.clear(obj);
            this.callback(obj, ...existingArgs);
        });

        return true;
    }

    clear(obj: object): void {
        this.throttle.delete(obj);
    }
}

class CleanupJobs {
    jobs: CleanupJob[];

    constructor(jobs: CleanupJob[] = []) {
        this.jobs = jobs;
    }

    add(job: CleanupJob): void {
        this.jobs.push(job);
    }

    cleanup(): void {
        for (let job of this.jobs) {
            if (!job) {
                continue;
            }
            if (implementsCleanupHandle(job)) {
                job.cleanup();
            } else if (implementsRemoveHandle(job)) {
                job.remove();
            } else {
                job();
            }
        }
        this.jobs = [];
    }

    remove(job?: RemoveHandle): void {
        if (job) {
            const index = this.jobs.indexOf(job);
            if (index >= 0) {
                this.jobs.splice(index, 1);
            }
            job.remove();
        } else {
            this.cleanup();
        }
    }
}


// Class for events that should only happen once. Any listener added after the first firing will be automatically called with those arguments.
// Useful for caching initializations for instance.
export class OnceDispatcher extends Dispatcher {
    private declare dispatchArgs?: any[];

    dispatch(...args: any[]): void {
        this.dispatchArgs = args; // Save the arguments
        super.dispatch(...args);
    }

    haveDispatched(): any[] | undefined {
        return this.dispatchArgs;
    }

    // TODO wouldn't it be simpler if this always returns a DispatchHandle?
    addListener(callback: Callback): DispatcherHandle | undefined {
        if (this.haveDispatched()) {
            // Just pass the existing arguments
            callback(...this.dispatchArgs!);
            return undefined;
        }

        const handler = super.addListener(function (...args: any[]) {
            callback(...args);
            handler!.remove();
        });
        return handler;
    }

    // Either of these methods do the same thing
    addListenerOnce(callback: Callback): DispatcherHandle | undefined {
        return this.addListener(callback);
    }
}

// Class that can be used to pass around ownership of a resource.
// It informs the previous owner of the change (once) and dispatches the new element for all listeners
// TODO: a better name
export class SingleActiveElementDispatcher<T = any> extends Dispatcher {
    private _active?: T;

    setActive(element: T, addChangeListener?: (newElement: T) => void, forceDispatch?: boolean): void {
        if (!forceDispatch && element === this._active) {
            return;
        }
        this._active = element;
        this.dispatch(element);
        if (addChangeListener) {
            this.addListenerOnce((newElement) => {
                if (newElement != element) {
                    addChangeListener(newElement);
                }
            });
        }
    }

    getActive(): T | undefined {
        return this._active;
    }
}

export {Dispatcher, Dispatchable, CleanupJobs, getAttachCleanupJobMethod};
