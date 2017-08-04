import {MultiMap} from "../data-structures/MultiMap";

// This class currently mirrors the functionality of Headers on Chrome at the time of implementation
// TODO: It is specified that the function get() should return the result of getAll() and getAll() deprecated
class Headers extends MultiMap {
    static polyfill = true;

    constructor(obj) {
        super();
        if (obj instanceof Headers) {
            for (let [key, value] of obj) {
                this.append(key, value);
            }
        } else if (obj) {
            for (let key of Object.keys(obj)) {
                this.append(key, obj[key]);
            }
        }
    }

    normalizeKey(key) {
        if (typeof key !== 'string') {
            key = String(key);
        }
        if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(key)) {
            throw new TypeError('Invalid character in header field name');
        }
        return key.toLowerCase();
    }

    normalizeValue(value) {
        if (typeof value !== "string") {
            value = String(value);
        }
        return value;
    }
}

function polyfillHeaders(global) {
    global.Headers = global.Headers || Headers;
}

export {Headers, polyfillHeaders};