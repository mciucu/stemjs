import {Body} from "Body";

class Response extends Body {
    constructor(bodyInit, options) {
        super();
        options = options || {};

        this.type = "default";
        if (options.hasOwnProperty("status")) {
            this.status = options.status;
        } else {
            this.status = 200;
        }
        this.ok = (this.status >= 200 && this.status < 300);
        if (options.hasOwnProperty("statusText")) {
            this.statusText = options.statusText;
        } else {
            this.statusText = "OK";
        }
        this.headers = new Headers(options.headers);
        this.url = options.url || "";
        this.initialize(bodyInit);
    }

    clone() {
        return new Response(this._bodyInit, {
            status: this.status,
            statusText: this.statusText,
            headers: new Headers(this.headers),
            url: this.url
        });
    }

    static error() {
        let response = new Response(null, {status: 0, statusText: ""});
        response.type = "error";
        return response;
    }
    static redirectStatuses = [301, 302, 303, 307, 308];
    static redirect(url, status) {
        if (this.redirectStatuses.indexOf(status) === -1) {
            throw new RangeError("Invalid status code");
        }
        return new Response(null, {status: status, headers: {location: url}});
    }
}

function polyfillResponse(global) {
    global.Response = global.Response || Response;
}

export {Response, polyfillResponse};