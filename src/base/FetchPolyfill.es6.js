/**
 This code was in part copied from the fetch polyfill, to polyfill the Headers, Request and Response, URLSearchParams classes
Partial copyright for copied bits:
  * @author Jerry Bendy <jerry@icewingcc.com>
 * @licence MIT

 Copyright (c) 2014-2016 GitHub, Inc.

 Permission is hereby granted, free of charge, to any person obtaining
 a copy of this software and associated documentation files (the
 "Software"), to deal in the Software without restriction, including
 without limitation the rights to use, copy, modify, merge, publish,
 distribute, sublicense, and/or sell copies of the Software, and to
 permit persons to whom the Software is furnished to do so, subject to
 the following conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// TODO: this should only be executed if fetch is not included
var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function () {
        try {
            new Blob()
            return true
        } catch (e) {
            return false
        }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
}

if (support.arrayBuffer) {
    var viewClasses = [
        '[object Int8Array]',
        '[object Uint8Array]',
        '[object Uint8ClampedArray]',
        '[object Int16Array]',
        '[object Uint16Array]',
        '[object Int32Array]',
        '[object Uint32Array]',
        '[object Float32Array]',
        '[object Float64Array]'
    ]

    var isDataView = function (obj) {
        return obj && DataView.prototype.isPrototypeOf(obj)
    }

    var isArrayBufferView = ArrayBuffer.isView || function (obj) {
            return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
        }
}

function normalizeName(name) {
    if (typeof name !== 'string') {
        name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
        throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
}

function normalizeValue(value) {
    if (typeof value !== 'string') {
        value = String(value)
    }
    return value
}

// Build a destructive iterator for the value list
function iteratorFor(items) {
    var iterator = {
        next: function () {
            var value = items.shift()
            return {done: value === undefined, value: value}
        }
    }

    if (support.iterable) {
        iterator[Symbol.iterator] = function () {
            return iterator
        }
    }

    return iterator
}

function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
        headers.forEach(function (value, name) {
            this.append(name, value)
        }, this)

    } else if (headers) {
        Object.getOwnPropertyNames(headers).forEach(function (name) {
            this.append(name, headers[name])
        }, this)
    }
}

Headers.prototype.append = function (name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var oldValue = this.map[name]
    this.map[name] = oldValue ? oldValue + ',' + value : value
}

Headers.prototype['delete'] = function (name) {
    delete this.map[normalizeName(name)]
}

Headers.prototype.get = function (name) {
    name = normalizeName(name)
    return this.has(name) ? this.map[name] : null
}

Headers.prototype.has = function (name) {
    return this.map.hasOwnProperty(normalizeName(name))
}

Headers.prototype.set = function (name, value) {
    this.map[normalizeName(name)] = normalizeValue(value)
}

Headers.prototype.forEach = function (callback, thisArg) {
    for (var name in this.map) {
        if (this.map.hasOwnProperty(name)) {
            callback.call(thisArg, this.map[name], name, this)
        }
    }
}

Headers.prototype.keys = function () {
    var items = []
    this.forEach(function (value, name) {
        items.push(name)
    })
    return iteratorFor(items)
}

Headers.prototype.values = function () {
    var items = []
    this.forEach(function (value) {
        items.push(value)
    })
    return iteratorFor(items)
}

Headers.prototype.entries = function () {
    var items = []
    this.forEach(function (value, name) {
        items.push([name, value])
    })
    return iteratorFor(items)
}

if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
}

function consumed(body) {
    if (body.bodyUsed) {
        return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
}

function fileReaderReady(reader) {
    return new Promise(function (resolve, reject) {
        reader.onload = function () {
            resolve(reader.result)
        }
        reader.onerror = function () {
            reject(reader.error)
        }
    })
}

function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsArrayBuffer(blob)
    return promise
}

function readBlobAsText(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsText(blob)
    return promise
}

function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf)
    var chars = new Array(view.length)

    for (var i = 0; i < view.length; i++) {
        chars[i] = String.fromCharCode(view[i])
    }
    return chars.join('')
}

function bufferClone(buf) {
    if (buf.slice) {
        return buf.slice(0)
    } else {
        var view = new Uint8Array(buf.byteLength)
        view.set(new Uint8Array(buf))
        return view.buffer
    }
}

function Body() {
    this.bodyUsed = false

    this._initBody = function (body) {
        this._bodyInit = body
        if (!body) {
            this._bodyText = ''
        } else if (typeof body === 'string') {
            this._bodyText = body
        } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
            this._bodyBlob = body
        } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
            this._bodyFormData = body
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
            this._bodyText = body.toString()
        } else if (support.arrayBuffer && support.blob && isDataView(body)) {
            this._bodyArrayBuffer = bufferClone(body.buffer)
            // IE 10-11 can't handle a DataView body.
            this._bodyInit = new Blob([this._bodyArrayBuffer])
        } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
            this._bodyArrayBuffer = bufferClone(body)
        } else {
            throw new Error('unsupported BodyInit type')
        }

        if (!this.headers.get('content-type')) {
            if (typeof body === 'string') {
                this.headers.set('content-type', 'text/plain;charset=UTF-8')
            } else if (this._bodyBlob && this._bodyBlob.type) {
                this.headers.set('content-type', this._bodyBlob.type)
            } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
                this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
            }
        }
    }

    if (support.blob) {
        this.blob = function () {
            var rejected = consumed(this)
            if (rejected) {
                return rejected
            }

            if (this._bodyBlob) {
                return Promise.resolve(this._bodyBlob)
            } else if (this._bodyArrayBuffer) {
                return Promise.resolve(new Blob([this._bodyArrayBuffer]))
            } else if (this._bodyFormData) {
                throw new Error('could not read FormData body as blob')
            } else {
                return Promise.resolve(new Blob([this._bodyText]))
            }
        }

        this.arrayBuffer = function () {
            if (this._bodyArrayBuffer) {
                return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
            } else {
                return this.blob().then(readBlobAsArrayBuffer)
            }
        }
    }

    this.text = function () {
        var rejected = consumed(this)
        if (rejected) {
            return rejected
        }

        if (this._bodyBlob) {
            return readBlobAsText(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
            return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
        } else if (this._bodyFormData) {
            throw new Error('could not read FormData body as text')
        } else {
            return Promise.resolve(this._bodyText)
        }
    }

    if (support.formData) {
        this.formData = function () {
            return this.text().then(decode)
        }
    }

    this.json = function () {
        return this.text().then(JSON.parse)
    }

    return this
}

// HTTP methods whose capitalization should be normalized
var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
}

function Request(input, options) {
    options = options || {}
    var body = options.body

    if (typeof input === 'string') {
        this.url = input
    } else {
        if (input.bodyUsed) {
            throw new TypeError('Already read')
        }
        this.url = input.url
        this.credentials = input.credentials
        if (!options.headers) {
            this.headers = new Headers(input.headers)
        }
        this.method = input.method
        this.mode = input.mode
        if (!body && input._bodyInit != null) {
            body = input._bodyInit
            input.bodyUsed = true
        }
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
        this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
        throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
}

Request.prototype.clone = function () {
    return new Request(this, {body: this._bodyInit})
}

function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function (bytes) {
        if (bytes) {
            var split = bytes.split('=')
            var name = split.shift().replace(/\+/g, ' ')
            var value = split.join('=').replace(/\+/g, ' ')
            form.append(decodeURIComponent(name), decodeURIComponent(value))
        }
    })
    return form
}

function parseHeaders(rawHeaders) {
    var headers = new Headers()
    rawHeaders.split(/\r?\n/).forEach(function (line) {
        var parts = line.split(':')
        var key = parts.shift().trim()
        if (key) {
            var value = parts.join(':').trim()
            headers.append(key, value)
        }
    })
    return headers
}

Body.call(Request.prototype)

function Response(bodyInit, options) {
    if (!options) {
        options = {}
    }

    this.type = 'default'
    this.status = 'status' in options ? options.status : 200
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = 'statusText' in options ? options.statusText : 'OK'
    this.headers = new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
}

Body.call(Response.prototype)

Response.prototype.clone = function () {
    return new Response(this._bodyInit, {
        status: this.status,
        statusText: this.statusText,
        headers: new Headers(this.headers),
        url: this.url
    })
}

Response.error = function () {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
}

var redirectStatuses = [301, 302, 303, 307, 308]

Response.redirect = function (url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
        throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
}

window.Headers = window.Headers || Headers
window.Request = window.Request || Request
window.Response = window.Response || Response


// if (!window.URLSearchParams) {
    function polyfillURLSearchParams(self) {
        if (self.URLSearchParams) {
            return;
        }

        var __URLSearchParams__ = "__URLSearchParams__";


        function URLSearchParams(search) {
            search = search || "";

            this [__URLSearchParams__] = {};

            if (typeof search === "object") {
                for (var i in search) {
                    if (search.hasOwnProperty(i)) {
                        var str = typeof search [i] === 'string' ? search [i] : JSON.stringify(search [i]);
                        this.append(i, str);
                    }
                }

            } else {

                // remove first '?'
                if (search.indexOf("?") === 0) {
                    search = search.slice(1);
                }

                var pairs = search.split("&");
                for (var j = 0; j < pairs.length; j++) {
                    var value = pairs [j],
                        index = value.indexOf('=');

                    if (-1 < index) {
                        this.append(
                            decode(value.slice(0, index)),
                            decode(value.slice(index + 1))
                        );
                    }
                }
            }

        }

        URLSearchParams.prototype.append = function (name, value) {
            var dict = this [__URLSearchParams__];
            if (name in dict) {
                dict[name].push('' + value);
            } else {
                dict[name] = ['' + value];
            }
        };

        URLSearchParams.prototype.delete = function (name) {
            delete this [__URLSearchParams__] [name];
        };

        URLSearchParams.prototype.get = function (name) {
            var dict = this [__URLSearchParams__];
            return name in dict ? dict[name][0] : null;
        };

        URLSearchParams.prototype.getAll = function (name) {
            var dict = this [__URLSearchParams__];
            return name in dict ? dict [name].slice(0) : [];
        };

        URLSearchParams.prototype.has = function (name) {
            return name in this [__URLSearchParams__];
        };

        URLSearchParams.prototype.set = function set(name, value) {
            this [__URLSearchParams__][name] = ['' + value];
        };

        URLSearchParams.prototype.forEach = function (callback, thisArg) {
            var dict = this [__URLSearchParams__];
            Object.getOwnPropertyNames(dict).forEach(function (name) {
                dict[name].forEach(function (value) {
                    callback.call(thisArg, value, name, this);
                }, this);
            }, this);
        };

        URLSearchParams.prototype.toString = function () {
            var dict = this[__URLSearchParams__], query = [], i, key, name, value;
            for (key in dict) {
                name = encode(key);
                for (i = 0, value = dict[key]; i < value.length; i++) {
                    query.push(name + '=' + encode(value[i]));
                }
            }
            return query.join('&');
        };


        function encode(str) {
            var replace = {
                '!': '%21',
                "'": '%27',
                '(': '%28',
                ')': '%29',
                '~': '%7E',
                '%20': '+',
                '%00': '\x00'
            };
            return encodeURIComponent(str).replace(/[!'\(\)~]|%20|%00/g, function (match) {
                return replace[match];
            });
        }

        function decode(str) {
            return decodeURIComponent(str.replace(/\+/g, ' '));
        }

        self.URLSearchParams = URLSearchParams;

        self.URLSearchParams.polyfill = true;


    }

    polyfillURLSearchParams(window);
//     window.URLSearchParams = class URLSearchParams {
//         constructor() {
//             this.map = new Map();
//         }
//
//         set(key, value) {
//             this.map.set(key, value);
//         }
//
//         append(key, value) {
//             if (!this.map.has(key)) {
//                 this.map.set(key, []);
//             }
//             this.map.get(key).push(value);
//         }
//
//         toString() {
//
//         }
//     }
// }