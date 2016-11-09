class DispatcherHandle {
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
    constructor(options = {}) {
        this.options = options;
        this.listeners = [];
    }

    addListener(callback) {
        if (!(typeof callback === "function")) {
            console.error("The listener needs to be a function: ", callback);
            return;
        }
        for (let i = 0; i < this.listeners.length; i += 1) {
            if (this.listeners[i] === callback) {
                console.error("Can't re-register for the same callback: ", this, " ", callback);
                return new DispatcherHandle(this, this.listeners[i]);
            }
        }

        this.listeners.push(callback);
        return new DispatcherHandle(this, callback);
    };

    removeListener(callback) {
        for (let i = 0; i < this.listeners.length; i += 1) {
            if (this.listeners[i] === callback) {
                // Erase and return
                return this.listeners.splice(i, 1)[0];
            }
        }
    };

    dispatch(payload) {
        for (let i = 0; i < this.listeners.length; i += 1) {
            let listener = this.listeners[i];
            listener(...arguments);
        }
    };
}

class Dispatchable {
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
        if (Array.isArray(name)) {
            return new CleanupJobs(name.map(x => this.addListener(x, callback)));
        }
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
    run(callback, timeout = 0) {
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
    constructor(jobs = []) {
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

let CleanupMixin = (BaseClass) => class Cleanup extends BaseClass {
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

export {Dispatcher, Dispatchable, RunOnce, CleanupJobs, CleanupMixin};
