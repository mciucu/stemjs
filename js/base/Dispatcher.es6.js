class DispatcherCallback {
    constructor(dispatcher, callback) {
        this.dispatcher = dispatcher;
        this.callback = callback;
    }

    remove() {
        this.dispatcher.removeListener(this.callback);
    }

    cleanup() {
        this.remove();
    }
}

class Dispatcher {
    constructor(options={}) {
        this.options = options;
        this.listeners = [];
    }

    addListener(callback) {
        for (let i = 0; i < this.listeners.length; i += 1) {
            if (this.listeners[i].callback === callback) {
                console.error("Can't re-register for the same callback: ", this.name, " ", callback);
                return this.listeners[i];
            }
        }

        let dispatcherCallback = new DispatcherCallback(this, callback);
        this.listeners.push(dispatcherCallback);
        return dispatcherCallback;
    };

    removeListener(callback) {
        for (let i = 0; i < this.listeners.length; i += 1) {
            if (this.listeners[i].callback === callback) {
                // Erase and return
                return this.listeners.splice(i, 1)[0];
            }
        }
    };

    dispatch(payload) {
        for (let i = 0; i < this.listeners.length; i += 1) {
            let listener = this.listeners[i];
            // TODO: maybe optimize for cases with 1-2 arguments?
            listener.callback(...arguments);
        }
    };
}

class Dispatchable {
    constructor() {
    }

    // TODO: this should probably be used with a @lazy decorator
    get dispatchers() {
        if (!this.hasOwnProperty("_dispatchers")) {
            this._dispatchers = new Map();
        }
        return this._dispatchers;
    }

    getDispatcher(name) {
        return this.dispatchers.get(name);
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

    addListener(name, callback) {
        let dispatcher = this.getDispatcher(name);
        if (!dispatcher) {
            dispatcher = new Dispatcher();
            this.dispatchers.set(name, dispatcher);
        }
        return dispatcher.addListener(callback);
    }

    removeListener(name, callback) {
        let dispatcher = this.getDispatcher(name);
        if (dispatcher) {
            dispatcher.removeListener(callback);
        }
    }

    cleanup() {
        delete this._dispatchers;
    }
}

Dispatcher.Global = new Dispatchable();

class RunOnce {
    run(callback, timeout=0) {
        if (this.timeout) {
            return;
        }
        this.timeout = setTimeout(() => {
            callback();
            this.timeout = null;
        }, timeout);
    }
}

class CleanupJobs {
    constructor(jobs=[]) {
        this.jobs = jobs;
    }

    add(job) {
        this.jobs.push(job);
    }

    cleanup() {
        for (let job of this.jobs) {
            job.cleanup();
        }
        this.jobs = [];
    }

    remove() {
        this.cleanup();
    }
}

function Cleanable(BaseClass) {
    return class Cleanable extends BaseClass {
        addCleanupTask(cleanupJob) {
            if (!this.hasOwnProperty("_cleanupJobs")) {
                this._cleanupJobs = new CleanupJobs();
            }
            this._cleanupJobs.add(cleanupJob);
        }

        cleanup() {
            if (this._cleanupJobs) {
                this._cleanupJobs.cleanup();
            }
        }
    }
}

export {Dispatcher, Dispatchable, RunOnce, CleanupJobs, Cleanable};
