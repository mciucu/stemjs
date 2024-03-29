import {Dispatchable} from "./Dispatcher";
import {toArray} from "./Utils.js";

class ScriptResolver extends Dispatchable {
    constructor(scriptPath) {
        super();
        this.loaded = false;
        this.jobs = [];
        // TODO: should be more thought out
        let scriptElement = document.createElement("script");
        scriptElement.async = true;
        scriptElement.src = scriptPath;
        scriptElement.onload = () => this.onLoad();
        // TODO: what about error?
        document.getElementsByTagName("head")[0].appendChild(scriptElement);
    }

    onLoad() {
        this.loaded = true;
        for (let i = 0; i < this.jobs.length; i += 1) {
            this.jobs[i](this);
        }
        this.jobs = [];
    }

    resolve(callback) {
        if (this.loaded) {
            callback(this);
            return;
        }
        this.jobs.push(callback);
    }
}

let scriptResolveMap = new Map();

async function ensureSingle(script) {
    let scriptResolver = scriptResolveMap.get(script);
    if (!scriptResolver) {
        scriptResolver = new ScriptResolver(script);
        scriptResolveMap.set(script, scriptResolver);
    }
    return new Promise(function(resolve, reject) {
        scriptResolver.resolve(resolve, reject);
    });
}

async function ensure(scripts, callback) {
    scripts = toArray(scripts);
    let promises = scripts.map(script => ensureSingle(script));
    return Promise.all(promises).then(function () {
        if (callback) {
            callback(...arguments);
        }
    });
}

export {ensure};
