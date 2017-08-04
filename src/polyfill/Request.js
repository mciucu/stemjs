import {Body} from "./Body";

class Request extends Body {
    constructor(input, options={}) {
        super();
        let body = options.body;

        if ((typeof input === "string") || (input instanceof String)) {
            input = {
                url: input
            };
        }

        if (input.bodyUsed) {
            throw new TypeError("Already read");
        }
        if (!body && input.hasOwnProperty("_bodyInit") && input._bodyInit != null) {
            body = input._bodyInit;
            input.bodyUsed = true;
        }

        this.method = this.constructor.normalizeMethod(options.method || input.method || "GET");
        this.url = input.url;

        let headerArgs = options.headers || input.headers || null;
        this.headers = headerArgs ? new Headers(headerArgs) : new Headers();
        this.context = options.context || input.context || "";
        this.referrer = options.referrer || input.referrer || "about:client";
        this.referrerPolicy = options.referrerPolicy || input.referrerPolicy || "";
        this.mode = options.mode || input.mode || null;
        this.credentials = options.credentials || input.credentials || "omit";
        this.cache = options.cache || input.cache || "default";

        if ((this.method === "GET" || this.method === "HEAD") && body) {
            throw new TypeError("Body not allowed for GET or HEAD requests");
        }
        this.initialize(body);
    }

    static methods = ["DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT"];
    static normalizeMethod(method) {
        let upcased = method.toUpperCase();
        return (this.methods.indexOf(upcased) > -1) ? upcased : method;
    }

    clone() {
        return new Request(this, {body: this._bodyInit});
    }
}

function polyfillRequest(global) {
    global.Request = global.Request || Request;
}

export {Request, polyfillRequest};