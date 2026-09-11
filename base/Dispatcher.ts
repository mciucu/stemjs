import {isFunction, type TimeoutHandler, type IntervalHandler} from "./Utils";

export type Callback = Function;

export interface RemoveHandle {
    remove: () => void;
}

export interface CleanupHandle {
    cleanup: () => void;
}

export type CleanupJob = RemoveHandle | CleanupHandle | Function;

// A handle from the add*Listener family: callers reach for either name, so one answers to both, which is
// what DispatcherHandle has always done by delegating cleanup() to remove()
export interface ListenerRemover extends RemoveHandle, CleanupHandle {}

// What the add*Listener family answers with: one handle, or a bundle of them for an array of names.
// An interface rather than DispatcherHandle, so an adder wrapping something else - Ace's session, a DOM
// node - can answer with a handle of its own instead of with nothing
export type ListenerHandle = ListenerRemover | CleanupJobs;

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

export class Dispatcher {
    // Assigned below, once Dispatchable is defined
    declare static Global: Dispatchable;

    // The base only stores them; a subclass that has options of its own redeclares this with their type
    options: unknown;
    listeners: Callback[];

    constructor(options: unknown = {}) {
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
                // A promise's resolve only takes a single argument
                resolve(args[0]);
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

export type DispatcherName = string | number;

export class Dispatchable {
    declare private [DispatchersSymbol]?: Map<DispatcherName, Dispatcher>;
    declare private [CleanupJobsSymbol]?: CleanupJobs;

    get dispatchers(): Map<DispatcherName, Dispatcher> {
        return this[DispatchersSymbol] || (this[DispatchersSymbol] = new Map());
    }

    get cleanupJobs(): CleanupJobs {
        return this[CleanupJobsSymbol] || (this[CleanupJobsSymbol] = new CleanupJobs());
    }

    // Asked to add the missing one, it always answers with a dispatcher, which is what lets a listener
    // added under a name nothing has dispatched yet still hand back a real handle
    getDispatcher(name: DispatcherName, addIfMissing?: true): Dispatcher;
    getDispatcher(name: DispatcherName, addIfMissing: boolean): Dispatcher | undefined;
    getDispatcher(name: DispatcherName, addIfMissing: boolean = true): Dispatcher | undefined {
        let dispatcher = this.dispatchers.get(name);
        if (!dispatcher && addIfMissing) {
            dispatcher = new Dispatcher();
            this.dispatchers.set(name, dispatcher);
        }
        return dispatcher;
    }

    dispatch(name: DispatcherName, ...args: any[]): void {
        let dispatcher = this.getDispatcher(name, false);
        if (dispatcher) {
            dispatcher.dispatch(...args);
        }
    }

    // The two adders below are the only callers, and naming them is what lets both lookups resolve
    addListenerGeneric(methodName: "addListener" | "addListenerOnce", name: DispatcherName | DispatcherName[], callback: Callback): ListenerHandle {
        if (Array.isArray(name)) {
            return new CleanupJobs(name.map(x => this[methodName](x, callback)));
        }
        return this.getDispatcher(name)[methodName](callback);
    }

    addListener(name: DispatcherName | DispatcherName[], callback: Callback): ListenerHandle {
        return this.addListenerGeneric("addListener", name, callback);
    }

    addListenerOnce(name: DispatcherName | DispatcherName[], callback: Callback): ListenerHandle {
        return this.addListenerGeneric("addListenerOnce", name, callback);
    }

    removeListener(name: DispatcherName, callback: Callback): void {
        const dispatcher = this.getDispatcher(name, false);
        dispatcher?.removeListener(callback);
    }

    removeAllListeners(name: DispatcherName): void {
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

    detachListener(dispatcherHandle: RemoveHandle): void {
        if (this[CleanupJobsSymbol]) {
            this[CleanupJobsSymbol].remove(dispatcherHandle);
        } else {
            dispatcherHandle.remove();
        }
    }

    attachTimeout(callback: () => void, timeout: number = 0): TimeoutHandler {
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

    // These methods are added dynamically to the prototype below via getAttachCleanupJobMethod.
    // They call obj.add[MethodName](...args) and register the result as a cleanup job, so each one takes
    // and answers with whatever the adder it forwards to declares
    declare attachListener: <T extends {addListener(...args: any[]): any}>(
        obj: T, ...args: Parameters<T["addListener"]>) => ReturnType<T["addListener"]>;
    declare attachEventListener: <T extends {addEventListener(...args: any[]): any}>(
        obj: T, ...args: Parameters<T["addEventListener"]>) => ReturnType<T["addEventListener"]>;
    declare attachCreateListener: <T extends {addCreateListener(...args: any[]): any}>(
        obj: T, ...args: Parameters<T["addCreateListener"]>) => ReturnType<T["addCreateListener"]>;
    declare attachDeleteListener: <T extends {addDeleteListener(...args: any[]): any}>(
        obj: T, ...args: Parameters<T["addDeleteListener"]>) => ReturnType<T["addDeleteListener"]>;
    declare attachChangeListener: <T extends {addChangeListener(...args: any[]): any}>(
        obj: T, ...args: Parameters<T["addChangeListener"]>) => ReturnType<T["addChangeListener"]>;
    declare attachListenerOnce: <T extends {addListenerOnce(...args: any[]): any}>(
        obj: T, ...args: Parameters<T["addListenerOnce"]>) => ReturnType<T["addListenerOnce"]>;

    // Answers with nothing when the dispatcher refuses the callback: not a function, or already registered
    addChangeListener(callback: Callback): ListenerHandle | undefined {
        return this.addListener("change", callback);
    }

    dispatchChange(...args: any[]): void {
        this.dispatch("change", ...args, this);
    }
}

// Creates a method that calls the method methodName on obj, and adds the result as a cleanup task.
// An adder that answers with nothing is asked for its remover instead, which is how a DOM target is
// detached: addEventListener returns void and removeEventListener takes the same arguments back. Stem's own
// add<Name>Listener family has no matching remove<Name>Listener, and calling one threw at cleanup time, so
// the remover is only used when the object actually has it - a Dispatcher that refused a duplicate callback
// and an enqueued CodeEditor call both registered nothing, and have nothing to undo.
export function getAttachCleanupJobMethod(methodName: string) {
    const addMethodName = "add" + methodName;
    const removeMethodName = "remove" + methodName;
    return function (this: Dispatchable, obj: any, ...args: any[]) {
        let handler = obj[addMethodName](...args);
        if (!handler && isFunction(obj[removeMethodName])) {
            handler = () => obj[removeMethodName](...args);
        }
        if (handler) {
            this.addCleanupJob(handler);
        }
        return handler;
    }
}

// TODO maybe this can be handle better through a Proxy?
// Not sure if these should be added like this, but meh
Dispatchable.prototype.attachListener           = getAttachCleanupJobMethod("Listener");
Dispatchable.prototype.attachEventListener      = getAttachCleanupJobMethod("EventListener");
Dispatchable.prototype.attachCreateListener     = getAttachCleanupJobMethod("CreateListener");
Dispatchable.prototype.attachDeleteListener     = getAttachCleanupJobMethod("DeleteListener");
Dispatchable.prototype.attachChangeListener     = getAttachCleanupJobMethod("ChangeListener");
Dispatchable.prototype.attachListenerOnce       = getAttachCleanupJobMethod("ListenerOnce");

Dispatcher.Global = new Dispatchable();

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

export class CleanupJobs {
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
    private declare dispatchArgs?: unknown[];

    dispatch(...args: any[]): void {
        this.dispatchArgs = args; // Save the arguments
        super.dispatch(...args);
    }

    haveDispatched(): unknown[] | undefined {
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
            this.addListenerOnce((newElement: T) => {
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
