import {polyfillHeaders} from "./Headers";
import {polyfillURLSearchParams} from "./URLSearchParams";

function fileReaderReady(reader) {
    return new Promise((resolve, reject) => {
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = () => {
            reject(reader.error);
        };
    });
}

function readBlobAsArrayBuffer(blob) {
    let reader = new FileReader();
    let promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise;
}

function readBlobAsText(blob) {
    let reader = new FileReader();
    let promise = fileReaderReady(reader);
    reader.readAsText(blob);
    return promise;
}

class Body {
    constructor() {
        this.bodyUsed = false;
    }

    setBodyUsed() {
        if (this.bodyUsed) {
            return Promise.reject(new TypeError("Already read"));
        }
        this.bodyUsed = true;
    }

    static decode(body) {
        let form = new FormData();
        for (let bytes of body.trim().split('&')) {
            if (bytes) {
                let split = bytes.split('=');
                let name = split.shift().replace(/\+/g, ' ');
                let value = split.join('=').replace(/\+/g, ' ');
                form.append(decodeURIComponent(name), decodeURIComponent(value));
            }
        }
        return form;
    }

    static cloneBuffer(buffer) {
        if (buffer.slice) {
            return buffer.slice();
        } else {
            let view = new Uint8Array(buffer.byteLength);
            view.set(new Uint8Array(buffer));
            return view.buffer;
        }
    }

    initialize(bodyInit) {
        this._bodyInit = bodyInit;
        if (!bodyInit) {
            this._bodyText = "";
        } else if ((typeof bodyInit === "string") || (bodyInit instanceof String)) {
            this._bodyText = bodyInit;
        } else if (Blob.prototype.isPrototypeOf(bodyInit)) {
            this._bodyBlob = bodyInit;
        } else if (FormData.prototype.isPrototypeOf(bodyInit)) {
            this._bodyFormData = bodyInit;
        } else if (URLSearchParams.prototype.isPrototypeOf(bodyInit)) {
            this._bodyText = bodyInit.toString();
        } else if (DataView.prototype.isPrototypeOf(bodyInit)) {
            this._bodyArrayBuffer = this.constructor.cloneBuffer(bodyInit.buffer);
            this._bodyInit = new Blob([this._bodyArrayBuffer]);
        } else if (ArrayBuffer.prototype.isPrototypeOf(bodyInit) || ArrayBuffer.isView(bodyInit)) {
            this._bodyArrayBuffer = this.constructor.cloneBuffer(bodyInit);
        } else {
            throw new Error("unsupported BodyInit type");
        }

        if (!this.headers.get("content-type")) {
            if ((typeof bodyInit === "string") || (bodyInit instanceof String)) {
                this.headers.set("content-type", "text/plain;charset=UTF-8");
            } else if (this._bodyBlob && this._bodyBlob.type) {
                this.headers.set("content-type", this._bodyBlob.type);
            } else if (URLSearchParams.prototype.isPrototypeOf(bodyInit)) {
                this.headers.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8");
            }
        }
    }

    blob() {
        let rejected = this.setBodyUsed();
        if (rejected) {
            return rejected;
        }

        if (this._bodyBlob) {
            return Promise.resolve(this._bodyBlob);
        }
        if (this._bodyArrayBuffer) {
            return Promise.resolve(new Blob([this._bodyArrayBuffer]));
        }
        if (this._bodyFormData) {
            // I know this is technically wrong, but only we can create this scenario
            return Promise.resolve(this._bodyFormData);
        }
        return Promise.resolve(new Blob([this._bodyText]));
    }

    arrayBuffer() {
        if (this._bodyArrayBuffer) {
            return this.setBodyUsed() || Promise.resolve(this._bodyArrayBuffer);
        } else {
            return this.blob().then(readBlobAsArrayBuffer);
        }
    }

    readArrayBufferAsText() {
        let view = new Uint8Array(this._bodyArrayBuffer);
        let chars = new Array(view.length);

        for (let i = 0; i < view.length; i++) {
            chars[i] = String.fromCharCode(view[i]);
        }
        return chars.join("");
    }

    text() {
        let rejected = this.setBodyUsed();
        if (rejected) {
            return rejected;
        }

        if (this._bodyBlob) {
            return readBlobAsText(this._bodyBlob);
        }
        if (this._bodyArrayBuffer) {
            return Promise.resolve(this.readArrayBufferAsText());
        }
        if (this._bodyFormData) {
            throw new Error("could not read FormData body as text");
        }
        return Promise.resolve(this._bodyText);
    }

    formData() {
        return this.text().then(this.constructor.decode);
    }

    json() {
        return this.text().then(JSON.parse);
    }
}

function polyfillBody(global) {
    // TODO: Might want to polyfill other stuff
    polyfillURLSearchParams(global);
    polyfillHeaders(global);
    global.Body = global.Body || Body;
}

export {Body, polyfillBody};