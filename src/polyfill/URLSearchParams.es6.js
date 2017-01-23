import {MultiMap} from "../data-structures/MultiMap";

class URLSearchParams extends MultiMap {
    static polyfill = true;

    constructor(obj="") {
        super(obj);
        let str = String(obj);
        if (str.indexOf("?") === 0) {
            str = str.slice(1);
        }
        for (let parameter of str.split("&")) {
            let index = parameter.indexOf("=");
            if (index !== -1) {
                let key = this.constructor.decode(parameter.slice(0, index));
                let value = this.constructor.decode(parameter.slice(index + 1));
                this.append(key, value);
            }
        }
    }

    normalizeKey(key) {
        return key.toString();
    }

    normalizeValue(value) {
        return value.toString();
    }

    static encode(str) {
        let replace = {
            '!': '%21',
            "'": '%27',
            '(': '%28',
            ')': '%29',
            '~': '%7E',
            '%20': '+',
            '%00': '\x00'
        };
        return encodeURIComponent(str).replace(/[!'\(\)~]|%20|%00/g, (match) => {
            return replace[match];
        });
    }

    static decode(str) {
        return decodeURIComponent(str.replace(/\+/g, ' '));
    }

    toString() {
        let query = [];
        for (let [key, values] of this.map.entries()) {
            let name = this.constructor.encode(key);
            for (let value of values) {
                query.push(name + "=" + this.constructor.encode(value));
            }
        }
        return query.join("&");
    }
}

function polyfillURLSearchParams(global) {
    global.URLSearchParams = global.URLSearchParams || URLSearchParams;
}

export {URLSearchParams, polyfillURLSearchParams};