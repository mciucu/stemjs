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
            // TODO: optimize common cases
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

    getDispatcher(name, addIfMissing) {
        let dispatcher = this.dispatchers.get(name);
        if (!dispatcher && addIfMissing) {
            dispatcher = new Dispatcher();
            this.dispatchers.set(name, dispatcher);
        }
        return dispatcher;
    }

    dispatch(name, payload) {
        let dispatcher = this.getDispatcher(name);
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
        return this.getDispatcher(name, true)[methodName](callback);
    }

    addListener(name, callback) {
        return this.addListenerGeneric("addListener", name, callback);
    }

    addListenerOnce(name, callback) {
        return this.addListenerGeneric("addListenerOnce", name, callback);
    }

    removeListener(name, callback) {
        let dispatcher = this.getDispatcher(name);
        if (dispatcher) {
            dispatcher.removeListener(callback);
        }
    }

    removeAllListeners(name) {
        let dispatcher = this.getDispatcher(name);
        if (dispatcher) {
            dispatcher.removeAllListeners();
        }
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
        let executed = false;
        const timeoutId = setTimeout((...args) => {
            executed = true;
            callback(...args);
        }, timeout);
        this.addCleanupJob(() => {
            if (!executed) {
                clearTimeout(timeoutId);
            }
        });
        return timeoutId;
    }

    attachInterval(callback, timeout) {
        const intervalId = setInterval(callback, timeout);
        this.addCleanupJob(() => {
            clearInterval(intervalId);
        });
        return intervalId;
    }

    attachAnimationFrame(callback) {
        const animationId = requestAnimationFrame(callback);
        this.addCleanupJob(() => {
            cancelAnimationFrame(animationId);
        });
        return animationId;
    }

    addUpdateListener(callback) {
        return this.addListener("update", callback);
    }

    removeUpdateListener(callback) {
        return this.removeListener("update", callback);
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

// Not sure if these should be added like this, but meh
Dispatchable.prototype.attachListener           = getAttachCleanupJobMethod("Listener");
Dispatchable.prototype.attachEventListener      = getAttachCleanupJobMethod("EventListener");
Dispatchable.prototype.attachCreateListener     = getAttachCleanupJobMethod("CreateListener");
Dispatchable.prototype.attachUpdateListener     = getAttachCleanupJobMethod("UpdateListener");
Dispatchable.prototype.attachDeleteListener     = getAttachCleanupJobMethod("DeleteListener");
Dispatchable.prototype.attachChangeListener     = getAttachCleanupJobMethod("ChangeListener");
Dispatchable.prototype.attachListenerOnce       = getAttachCleanupJobMethod("ListenerOnce");

Dispatcher.Global = new Dispatchable();

class RunOnce {
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

// Class that can be used to pass around ownership of a resource.
// It informs the previous owner of the change (once) and dispatches the new element for all listeners
// TODO: a better name
class SingleActiveElementDispatcher extends Dispatcher {
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

export {Dispatcher, Dispatchable, RunOnce, CleanupJobs, SingleActiveElementDispatcher, getAttachCleanupJobMethod};
