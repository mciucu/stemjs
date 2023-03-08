class DispatcherHandle {
    constructor(dispatcher, callback) {
        this.dispatcher = dispatcher;
        this.callback = callback;
    }

    remove() {
        if (!this.dispatcher) {
            console.warn("Removing a dispatcher twice");
            return;
        }
        this.dispatcher.removeListener(this.callback);
        this.dispatcher = undefined;
        this.callback = undefined;
    }

    cleanup() {
        this.remove();
    }
}

class Dispatcher {
    constructor(options = {}) {
        this.options = options;
        this.listeners = [];
    }

    callbackExists(callback) {
        for (let i = 0; i < this.listeners.length; i += 1) {
            if (this.listeners[i] === callback) {
                return true;
            }
        }
        return false;
    }

    addListener(callback) {
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

    addListenerOnce(callback) {
        let handler = this.addListener(function () {
            callback(...arguments);
            handler.remove();
        });
        return handler;
    }

    async awaitOnce() {
        return new Promise((resolve) => this.addListenerOnce((...args) => resolve(...args)));
    }

    removeListener(callback) {
        for (let i = 0; i < this.listeners.length; i += 1) {
            if (this.listeners[i] === callback) {
                // Erase and return
                return this.listeners.splice(i, 1)[0];
            }
        }
    };

    removeAllListeners() {
        this.listeners = [];
    }

    dispatch(payload) {
        for (let i = 0; i < this.listeners.length; ) {
            let listener = this.listeners[i];
            listener(...arguments);
            // In case the current listener deleted itself, keep the loop counter the same
            // If it deleted listeners that were executed before it, that's just wrong and there are no guaranteed about
            if (listener === this.listeners[i]) {
                i++;
            }
        }
    };
}

export const DispatchersSymbol = Symbol("Dispatchers");

class Dispatchable {
    get dispatchers() {
        return this[DispatchersSymbol] || (this[DispatchersSymbol] = new Map());
    }

    getDispatcher(name, addIfMissing = true) {
        let dispatcher = this.dispatchers.get(name);
        if (!dispatcher && addIfMissing) {
            dispatcher = new Dispatcher();
            this.dispatchers.set(name, dispatcher);
        }
        return dispatcher;
    }

    dispatch(name, payload) {
        let dispatcher = this.getDispatcher(name, false);
        if (dispatcher) {
            // Optimize the average case
            if (arguments.length <= 2) {
                dispatcher.dispatch(payload);
            } else {
                let args = Array.prototype.slice.call(arguments, 1);
                dispatcher.dispatch(...args);
            }
        }
    }

    addListenerGeneric(methodName, name, callback) {
        if (Array.isArray(name)) {
            return new CleanupJobs(name.map(x => this[methodName](x, callback)));
        }
        return this.getDispatcher(name)[methodName](callback);
    }

    addListener(name, callback) {
        return this.addListenerGeneric("addListener", name, callback);
    }

    addListenerOnce(name, callback) {
        return this.addListenerGeneric("addListenerOnce", name, callback);
    }

    removeListener(name, callback) {
        const dispatcher = this.getDispatcher(name, false);
        dispatcher?.removeListener(callback);
    }

    removeAllListeners(name) {
        const dispatcher = this.getDispatcher(name, false);
        dispatcher?.removeAllListeners();
    }

    cleanup() {
        this.runCleanupJobs();
        delete this[DispatchersSymbol];
    }

    // These function don't really belong here, but they don't really hurt here and I don't want a long proto chain
    // Add anything that needs to be called on cleanup here (dispatchers, etc)
    addCleanupJob(cleanupJob) {
        if (!this.hasOwnProperty("_cleanupJobs")) {
            this._cleanupJobs = new CleanupJobs();
        }
        this._cleanupJobs.add(cleanupJob);
        return cleanupJob;
    }

    runCleanupJobs() {
        if (this._cleanupJobs) {
            this._cleanupJobs.cleanup();
        }
    }

    detachListener(dispatcherHandle) {
        if (this._cleanupJobs) {
            this._cleanupJobs.remove(dispatcherHandle);
        } else {
            dispatcherHandle.remove();
        }
    }

    attachTimeout(callback, timeout) {
        // TODO when the timeout executes, it doesn't get cleared from the cleanup jobs and would leak
        const timeoutId = setTimeout(callback, timeout);
        this.addCleanupJob(() => clearTimeout(timeoutId));
        return timeoutId;
    }

    attachInterval(callback, timeout) {
        const intervalId = setInterval(callback, timeout);
        this.addCleanupJob(() => clearInterval(intervalId));
        return intervalId;
    }

    attachAnimationFrame(callback) {
        const animationId = requestAnimationFrame(callback);
        this.addCleanupJob(() => cancelAnimationFrame(animationId));
        return animationId;
    }

    addChangeListener(callback) {
        return this.addListener("change", callback);
    }

    dispatchChange(value) {
        this.dispatch("change", value, this);
    }
}

// Creates a method that calls the method methodName on obj, and adds the result as a cleanup task
function getAttachCleanupJobMethod(methodName) {
    let addMethodName = "add" + methodName;
    let removeMethodName = "remove" + methodName;
    return function (obj) {
        let args = Array.prototype.slice.call(arguments, 1);
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
Dispatchable.prototype.attachListener           = getAttachCleanupJobMethod("Listener");
Dispatchable.prototype.attachEventListener      = getAttachCleanupJobMethod("EventListener");
Dispatchable.prototype.attachCreateListener     = getAttachCleanupJobMethod("CreateListener");
Dispatchable.prototype.attachDeleteListener     = getAttachCleanupJobMethod("DeleteListener");
Dispatchable.prototype.attachChangeListener     = getAttachCleanupJobMethod("ChangeListener");
Dispatchable.prototype.attachListenerOnce       = getAttachCleanupJobMethod("ListenerOnce");

Dispatcher.Global = new Dispatchable();

export class RunOnce {
    run(callback, timeout = 0) {
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
    constructor(callback) {
        this.callback = callback;
        this.throttle = new WeakMap();
    }

    maybeEnqueue(obj) {
        if (this.throttle.get(obj)) {
            return false;
        }
        this.throttle.set(obj, true);
        queueMicrotask(() => {
            if (!this.throttle.get(obj)) {
                // We have been canceled
                return;
            }
            this.clear(obj);
            this.callback(obj);
        });
        return true;
    }

    clear(obj) {
        this.throttle.delete(obj);
    }
}

class CleanupJobs {
    constructor(jobs = []) {
        this.jobs = jobs;
    }

    add(job) {
        this.jobs.push(job);
    }

    cleanup() {
        for (let job of this.jobs) {
            if (typeof job.cleanup === "function") {
                job.cleanup();
            } else if (typeof job.remove === "function" ) {
                job.remove();
            } else {
                job();
            }
        }
        this.jobs = [];
    }

    remove(job) {
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
    dispatch(...args) {
        this.dispatchArgs = args; // Save the arguments
        super.dispatch(...args);
    }

    haveDispatched() {
        return this.dispatchArgs;
    }

    addListener(callback) {
        if (this.haveDispatched()) {
            // Just pass the existing arguments
            callback(...this.dispatchArgs);
            return new CleanupJobs();
        }

        const handler = super.addListener(function () {
            callback(...arguments);
            handler.remove();
        });
        return handler;
    }

    // Either of these methods do the same thing
    addListenerOnce(callback) {
        return this.addListener(callback);
    }
}

// Class that can be used to pass around ownership of a resource.
// It informs the previous owner of the change (once) and dispatches the new element for all listeners
// TODO: a better name
export class SingleActiveElementDispatcher extends Dispatcher {
    setActive(element, addChangeListener, forceDispatch) {
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

    getActive() {
        return this._active;
    }
}

export {Dispatcher, Dispatchable, CleanupJobs, getAttachCleanupJobMethod};
