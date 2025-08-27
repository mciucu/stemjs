import {Dispatchable} from "./Dispatcher";
import {toArray} from "./Utils";

class ScriptResolver extends Dispatchable {
    loaded: boolean;
    jobs: Function[];

    constructor(scriptPath: string) {
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

    onLoad(): void {
        this.loaded = true;
        for (let i = 0; i < this.jobs.length; i += 1) {
            this.jobs[i](this);
        }
        this.jobs = [];
    }

    resolve(callback: Function): void {
        if (this.loaded) {
            callback(this);
            return;
        }
        this.jobs.push(callback);
    }
}

const scriptResolveMap = new Map<string, ScriptResolver>();

async function ensureSingle(script: string) {
    let scriptResolver = scriptResolveMap.get(script);
    if (!scriptResolver) {
        scriptResolver = new ScriptResolver(script);
        scriptResolveMap.set(script, scriptResolver);
    }
    return new Promise<ScriptResolver>(function(resolve, reject) {
        scriptResolver!.resolve(resolve);
    });
}

export async function ensure(scripts: string | string[], callback?: Function) {
    scripts = toArray(scripts);
    const promises = scripts.map(script => ensureSingle(script));
    return Promise.all(promises).then(function (results) {
        if (callback) {
            callback(...results);
        }
        return results;
    });
}
