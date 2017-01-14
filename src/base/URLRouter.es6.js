import {unwrapArray} from "./Utils";
import {Dispatchable} from "./Dispatcher";

// TODO: might need a redesign, to handle full urls
class URLRouterClass extends Dispatchable {
    constructor() {
        super();
        window.onhashchange = () => {
            this.routeCallback();
        };
    }

    routeCallback() {
        let location = this.getLocation();
        if (location) {
            this.dispatch("route", location);
        }
    };

    addRouteListener(callback) {
        return this.addListener("route", callback);
    }

    removeRouteListener(callback) {
        this.removeListener("route", callback);
    }

    route() {
        let args = Array.from(arguments);

        // we allow the function to be called with an array of arguments
        args = unwrapArray(args);

        let newPath = "#" + args.join("/");

        if (newPath === window.location.hash) {
            return; // prevent stackoverflow when accidentally routing in callback
        }

        // Do we need to use state object?
        history.pushState({}, "", newPath);
        this.routeCallback();
    }

    routeNewTab() {
        let args = Array.from(arguments);

        // we allow the function to be called with an array of arguments
        args = unwrapArray(args);

        let newPath = window.location.origin + window.location.pathname + "#" + args.join("/");
        window.open(newPath, "_blank");
    }

    getLocation() {
        let hash = window.location.hash;
        if (hash.length === 0) {
            return {
                location: hash,
                args: []
            };
        } else if (/^#(?:[\w+-]\/?)+$/.test(hash)) {
            // Check if hash is of type '#foo/bar'. Test guarantees non-empty array.
            let args = hash.slice(1).split("/"); // slice to ignore hash
            if (args[args.length - 1].length === 0) {
                // In case of trailing '/'
                args.pop();
            }

            return {
                location: hash,
                args: args
            };
        } else {
            console.log("Invalid hash route ", hash);
            return null;
        }
    }
}

// Singleton
export var URLRouter = new URLRouterClass();
