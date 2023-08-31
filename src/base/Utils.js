// TODO @cleanup merge with unwrapArray
export function toArray(objOrArray) {
    if (objOrArray == null) {
        return [];
    }
    return Array.isArray(objOrArray) ? objOrArray : [objOrArray];
}

export function unwrapElementPlain(element) {
    if (element == null || element === false) {
        return undefined;
    }
    return element;
}

export function unwrapElementWithFunc(element) {
    while (isFunction(element)) {
        element = element();
    }
    return unwrapElementPlain(element);
}

export function unwrapArray(elements, unwrapFunc = unwrapElementPlain) {
    if (elements == null || elements === false) {
        return [];
    }

    if (!Array.isArray(elements)) {
        // Convert to an array
        if (elements[Symbol.iterator] && !isString(elements)) {
            elements = Array.from(elements);
        } else {
            elements = [elements];
        }
    }

    let result = [];
    for (const rawElement of elements) {
        if (rawElement == null) {
            continue;
        }
        const element = Array.isArray(rawElement) ? rawElement : unwrapFunc(rawElement); // First unwrap the element
        if (element == null) {
            continue;
        }
        if (Array.isArray(element)) {
            const subelements = unwrapArray(element, unwrapFunc);
            for (const subelement of subelements) {
                result.push(subelement);
            }
        } else {
            result.push(element);
        }
    }

    let sameAsInput = (result.length === elements.length);

    for (let index = 0; sameAsInput && index < result.length; index += 1) {
        if (result[index] !== elements[index]) {
            sameAsInput = false;
        }
    }

    return sameAsInput ? elements : result;
}

export function areSetsEqual(a, b) {
    if (a.size !== b.size) {
        return false;
    }
    for (const element of a) {
        if (!b.has(element)) {
            return false;
        }
    }
    return true;
}

export function isLocalUrl(url, host=self.location.host, origin=self.location.origin) {
    // Empty url is considered local
    if (!url) {
        return true;
    }
    // Protocol-relative url is local if the host matches
    if (url.startsWith("//")) {
        return url.startsWith("//" + host);
    }
    // Absolute url is local if the origin matches
    let r = new RegExp("^(?:[a-z]+:)?//", "i");
    if (r.test(url)) {
        return url.startsWith(origin);
    }
    // Root-relative and document-relative urls are always local
    return true;
}

// Trims a local url to root-relative or document-relative url.
// If the url is protocol-relative, removes the starting "//"+host, transforming it in a root-relative url.
// If the url is absolute, removes the origin, transforming it in a root-relative url.
// If the url is root-relative or document-relative, leaves it as is.
export function trimLocalUrl(url, host=self.location.host, origin=self.location.origin) {
    if (!isLocalUrl(url, host, origin)) {
        throw Error("Trying to trim non-local url!");
    }
    if (!url) {
        return url;
    }
    if (url.startsWith("//" + host)) {
        return url.slice(("//" + host).length);
    }
    if (url.startsWith(origin)) {
        return url.slice(origin.length);
    }
    return url;
}

// Split the passed in array into arrays with at most maxChunkSize elements
export function splitInChunks(array, maxChunkSize) {
    let chunks = [];
    while (array.length > 0) {
        chunks.push(array.splice(0, maxChunkSize));
    }
    return chunks;
}

export function isIterable(obj) {
    if (obj == null) {
        return false;
    }
    return obj[Symbol.iterator] !== undefined;
}

export function defaultComparator(a, b) {
    if (a == null && b == null) {
        return 0;
    }

    if (b == null) {
        return 1;
    }

    if (a == null) {
        return -1;
    }

    // TODO: might want to use valueof here
    if (isNumber(a) && isNumber(b)) {
        return a - b;
    }

    let aStr = a.toString();
    let bStr = b.toString();

    if (aStr === bStr) {
        return 0;
    }
    return aStr < bStr ? -1 : 1;
}

export function slugify(string) {
    string = string.trim();

    string = string.replace((/[^a-zA-Z0-9-\s]/g), ""); // remove anything non-latin alphanumeric
    string = string.replace((/\s+/g), "-"); // replace whitespace with dashes
    string = string.replace((/-{2,}/g), "-"); // remove consecutive dashes
    string = string.toLowerCase();

    return string;
}

// If the first argument is a number, it's returned concatenated with the suffix, otherwise it's returned unchanged
export function suffixNumber(value, suffix) {
    return isNumber(value) ? value + suffix : value;
}

export function capitalize(text) {
    return text && (text.charAt(0).toUpperCase() + text.slice(1));
}

export function decapitalize(text) {
    return text && (text.charAt(0).toLowerCase() + text.slice(1));
}

export function pluralize(count, text) {
    return `${count} ${text}${count > 1 ? "s" : ""}`;
}

export function titleCase(text) {
     return text.toLowerCase().split(" ").map(word => capitalize(word)).join(" ");
}

// Cap a string (when sending to DB for instance), and also add a total length info
// Don't use this in the frontend, use ellipsis css
// Length is exceeded a bit by the extra description
export function limitString(str, maxLength) {
    if (str.length > maxLength) {
        const newStr = str.substring(0, maxLength) + `...[${str.length} initial chr.]`;
        // Even if we're a bit over the length limit, let's not be stupid and bloat the input
        if (newStr.length < str.length) {
            str = newStr;
        }
    }
    return str;
}

export function setObjectPrototype(obj, Class) {
    obj.__proto__ = Class.prototype;
    return obj;
}

export function isFunction(obj) {
    return typeof obj === "function";
}

export function isBoolean(obj) {
    return obj === true || obj === false;
}

export function isNumber(obj) {
    return (typeof obj === "number") || (obj instanceof Number);
}

export function isString(obj) {
    return (typeof obj === "string") || (obj instanceof String);
}

export function isPlainObject(obj) {
    if (!obj || typeof obj !== "object") {
        return false;
    }
    if (obj.constructor && obj.constructor != Object) {
        return false;
    }
    return true;
}

function FILTER_NULLS(key, value) {
    return value != null;
}

function FILTER_NULLS_AND_EMPTY_STR(key, value) {
    return value != null && value !== "";
}

export function cleanObject(obj, {skipEmptyString = true, filterFunc = null, emptyAsNull = false} = {}) {
    const cleanObject = {};
    if (!filterFunc) {
        filterFunc = skipEmptyString ? FILTER_NULLS_AND_EMPTY_STR : FILTER_NULLS;
    }
    for (const [key, value] of Object.entries(obj)) {
        if (filterFunc(key, value)) {
            cleanObject[key] = value;
        }
    }
    if (emptyAsNull && Object.keys(cleanObject).length === 0) {
        return null;
    }
    return cleanObject;
}

export function deepSetAttr(obj, keys, value) {
    keys.forEach((key, index) => {
        if (index + 1 < keys.length) {
            if (!obj[key]) {
                obj[key] = {};
            }
            obj = obj[key];
        } else {
            obj[key] = value;
        }
    });
}

export function deepGetAttr(obj, keys) {
    for (const key of keys) {
        obj = obj && obj[key];
    }
    return obj;
}

export function deepCopy() {
	let target = arguments[0] || {};
	// Handle case when target is a string or something (possible in deep copy)
	if (typeof target !== "object" && typeof target !== "function") {
		target = {};
	}

	for (let i = 1; i < arguments.length; i += 1) {
        let obj = arguments[i];
        if (obj == null) {
            continue;
        }

        // Extend the base object
        for (let [key, value] of Object.entries(obj)) {
            // Recurse if we're merging plain objects or arrays
            if (value && isPlainObject(value) || Array.isArray(value)) {
                let clone;
                let src = target[key];

                if (Array.isArray(value)) {
                    clone = (src && Array.isArray(src)) ? src : [];
                } else {
                    clone = (src && isPlainObject(src)) ? src : {};
                }

                target[key] = deepCopy(clone, value);
            } else {
                // TODO: if value has .clone() method, use that?
                target[key] = value;
            }
        }
	}

	return target;
}

export function dashCase(str) {
    let rez = "";
    for (let i = 0; i < str.length; i++) {
        if ("A" <= str[i] && str[i] <= "Z") {
            if (i > 0) {
                rez += "-";
            }
            rez += str[i].toLowerCase();
        } else {
            rez += str[i];
        }
    }
    return (rez == str) ? str : rez;
}

// TODO: have a Cookie helper file
export function getCookie(name) {
    let cookies = (document.cookie || "").split(";");
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(name + "=")) {
            return cookie.substring(name.length + 1);
        }
    }
    return "";
}

export function setCookie(name, value, maxAge=60*60*4 /* 4 hours */, domain) {
    let cookie = `${name}=${value}; path=/; max-age=${maxAge}; ${window.location.protocol === "http:" ? "" : "SameSite=None; Secure; "}`;
    if (domain && domain.trim().length) {
        cookie += `domain=${domain};`
    }
    document.cookie = cookie;
}

export function serializeCookie(name, value, maxAge=60*60*4) {
    setCookie(name, encodeURIComponent(JSON.stringify(value)), maxAge);
}

export function deserializeCookie(name) {
    const value = getCookie(name);
    if (!value) {
        return value;
    }
    return JSON.parse(decodeURIComponent(value));
}

export function uniqueId(obj) {
    if (!uniqueId.objectWeakMap) {
        uniqueId.objectWeakMap = new WeakMap();
        uniqueId.constructorWeakMap = new WeakMap();
        uniqueId.totalObjectCount = 0;
    }
    let objectWeakMap = uniqueId.objectWeakMap;
    let constructorWeakMap = uniqueId.constructorWeakMap;
    if (!objectWeakMap.has(obj)) {
        const objConstructor = obj.constructor || obj.__proto__ || Object;
        // Increment the object count
        const objIndex = (constructorWeakMap.get(objConstructor) || 0) + 1;
        constructorWeakMap.set(objConstructor, objIndex);

        const objUniqueId = objIndex + "-" + (++uniqueId.totalObjectCount);
        objectWeakMap.set(obj, objUniqueId);
    }
    return objectWeakMap.get(obj);
}

// args[0] is a string where the "%[number]" block will be replaced by the args[number]
export function evaluateSprintf(...args) {
    let str = args[0];

    for (let index = 1; index < args.length; index += 1) {
        str = str.replaceAll("%" + index, args[index]);
    }

    return str;
}

// TODO: should be done with String.padLeft
export function padNumber(num, minLength) {
    let strNum = String(num);
    while (strNum.length < minLength) {
        strNum = "0" + strNum;
    }
    return strNum;
}

// Returns the english ordinal suffix of a number
export function getOrdinalSuffix(num) {
    let suffixes = ["th", "st", "nd", "rd"];
    let lastDigit = num % 10;
    let isTeen = Math.floor(num / 10) % 10 === 1;
    return (!isTeen && suffixes[lastDigit]) || suffixes[0];
}

export function suffixWithOrdinal(num) {
    return num + getOrdinalSuffix(num);
}

function appendNumberInParanthesis(str, index) {
    if (!index) {
        return str;
    }
    return str + " (" + index + ")";
}

// Starting from the suggestion, tries a bunch of versioning values until one is free (passes checkFunc)
export function findFirstFreeVersion(suggestion, checkFunc, versioning=appendNumberInParanthesis) {
    for (let index = 0; index < 100; index++) {
        const str = versioning(suggestion, index);
        if (!checkFunc(str)) {
            return str;
        }
    }
    // Hail Mary
    return versioning(suggestion, Math.random().toString().substring(2));
}

export function base64Encode(value, {jsonFormat = true} = {}) {
    if (jsonFormat) {
        value = JSON.stringify(value);
    }
    return btoa(value);
}

export function base64Decode(value, {jsonFormat = true} = {}) {
    value = atob(value);
    if (jsonFormat) {
        value = JSON.parse(value);
    }
    return value;
}

// Erase the first instance of the value from the given array. In-place, returns the array
export function eraseFirst(array, value) {
    const index = array.indexOf(value);
    if (index >= 0) {
        array.splice(index, 1);
    }
    return array;
}

export const UNICODE_BOM_CHARACTER = 0xFEFF;
export const NOOP_FUNCTION = () => undefined;

export function isFirefox() {
    return (navigator.userAgent.indexOf("Firefox") !== -1
        || navigator.userAgent.indexOf("FxiOS") !== -1) && navigator.userAgent.indexOf("Chrome") === -1;
}

export function isSafari() {
    let firefox = isFirefox();
    let safari = navigator.userAgent.indexOf("Safari") > -1;
    let chrome = navigator.userAgent.indexOf("Chrome") > -1;
    if (chrome || firefox) {
        safari = false;
    }
    return safari;
}

// Helpers to wrap iterators, to wrap all values in a function or to filter them
export function* mapIterator(iter, func) {
    for (let value of iter) {
        yield func(value);
    }
}

export function* filterIterator(iter, func) {
    for (let value of iter) {
        if (func(value)) {
            yield value;
        }
    }
}

// Used so that a value or a function can be used anywhere
// If the value is a function, it will call it at most maxIter (default 32) times
export function resolveFuncValue(value, {maxIter = 32, args = null, allowUnresolved = false} = {}) {
    while (maxIter > 0 && isFunction(value)) {
        value = value(...args);
        maxIter -= 1;
    }
    if (!allowUnresolved && maxIter === 0) {
        console.error("Failed to resolve value to a non-function");
    }
    return value;
}

export class CallModifier {
    wrap(func) {
        throw Error("Implement wrap method");
    }

    call(func) {
        return this.wrap(func)();
    }

    toFunction() {
        return (func) => this.wrap(func);
    }
}

export class UnorderedCallDropper extends CallModifier {
    index = 1;
    lastExecuted = 0;

    wrap(callback) {
        const currentIndex = this.index++;
        return (...args) => {
            if (currentIndex > this.lastExecuted) {
                this.lastExecuted = currentIndex;
                return callback(...args);
            }
        }
    }
}

/*
CallThrottler acts both as a throttler and a debouncer, allowing you to combine both types of functionality.
Available options:
    - debounce (ms): delays the function call by x ms, each call extending the delay
    - throttle (ms): keeps calls from happening with at most x ms between them. If debounce is also set, will make sure to
    fire a debounced even if over x ms have passed. If equal to CallTimer.ON_ANIMATION_FRAME, means that we want to use
    requestAnimationFrame instead of setTimeout, to execute before next frame redraw()
    - dropThrottled (boolean, default false): any throttled function call is not delayed, but dropped
 */
export class CallThrottler extends CallModifier {
    static ON_ANIMATION_FRAME = Symbol();
    static AUTOMATIC = Symbol();

    lastCallTime = 0;
    pendingCall = null;
    pendingCallArgs = [];
    pendingCallExpectedTime = 0;
    numCalls = 0;
    totalCallDuration = 0;

    constructor(options={}) {
        super();
        Object.assign(this, options);
    }

    isThrottleOnAnimationFrame() {
        return this.throttle === this.constructor.ON_ANIMATION_FRAME;
    }

    clearPendingCall() {
        this.pendingCall = null;
        this.pendingCallArgs = [];
        this.pendingCallExpectedTime = 0;
    }

    cancel() {
        this.pendingCall && this.pendingCall.cancel();
        this.clearPendingCall();
    }

    flush() {
        this.pendingCall && this.pendingCall.flush();
        this.clearPendingCall();
    }

    // API compatibility with cleanup jobs
    cleanup() {
        this.cancel();
    }

    computeExecutionDelay(timeNow) {
        let executionDelay = null;
        if (this.throttle != null) {
            executionDelay = Math.max(this.lastCallTime + this.throttle - timeNow, 0);
        }
        if (this.debounce != null) {
            executionDelay = Math.min(executionDelay != null ? executionDelay : this.debounce, this.debounce);
        }
        return executionDelay;
    }

    replacePendingCall(wrappedFunc, funcCall, funcCallArgs) {
        this.cancel();
        if (this.isThrottleOnAnimationFrame()) {
            const cancelHandler = requestAnimationFrame(funcCall);
            wrappedFunc.cancel = () => cancelAnimationFrame(cancelHandler);
            return;
        }

        const timeNow = Date.now();
        let executionDelay = this.computeExecutionDelay(timeNow);

        if (this.dropThrottled) {
            return executionDelay == 0 && funcCall();
        }

        const cancelHandler = setTimeout(funcCall, executionDelay);
        wrappedFunc.cancel = () => clearTimeout(cancelHandler);
        this.pendingCall = wrappedFunc;
        this.pendingCallArgs = funcCallArgs;
        this.pendingCallExpectedTime = timeNow + executionDelay;
    }

    updatePendingCall(args) {
        this.pendingCallArgs = args;
        if (!this.isThrottleOnAnimationFrame()) {
            const timeNow = Date.now();
            this.pendingCallExpectedTime = timeNow + this.computeExecutionDelay(timeNow);
        }
    }

    wrap(func) {
        const funcCall = () => {
            const timeNow = Date.now();
            // The expected time when the function should be executed next might have been changed
            // Check if that's the case, while allowing a 1ms error for time measurement
            if (!this.isThrottleOnAnimationFrame() &&
                timeNow + 1 < this.pendingCallExpectedTime) {
                this.replacePendingCall(wrappedFunc, funcCall, this.pendingCallArgs);
            } else {
                this.lastCallTime = timeNow;
                this.clearPendingCall();
                func(...this.pendingCallArgs);
            }
        };

        const wrappedFunc = (...args) => {
            // Check if it's our function, and update the arguments and next execution time only
            if (this.pendingCall && func === this.pendingCall.originalFunc) {
                // We only need to update the arguments, and maybe mark that we want to executed later than scheduled
                // It's an optimization to not invoke too many setTimeout/clearTimeout pairs
                return this.updatePendingCall(args);
            }
            return this.replacePendingCall(wrappedFunc, funcCall, args);
        };

        wrappedFunc.originalFunc = func;
        wrappedFunc.cancel = NOOP_FUNCTION;
        wrappedFunc.flush = () => {
            if (wrappedFunc === this.pendingCall) {
                this.cancel();
                wrappedFunc();
            }
        };
        return wrappedFunc;
    }
}

// export function benchmarkThrottle(options={}) {
//     const startTime = performance.now();
//     const calls = options.calls || 100000;
//
//     const throttler = new CallThrottler({throttle: options.throttle || 300, debounce: options.debounce || 100});
//
//     const func = options.func || NOOP_FUNCTION;
//
//     const wrappedFunc = throttler.wrap(func);
//
//     for (let i = 0; i < calls; i += 1) {
//         wrappedFunc();
//     }
//     console.warn("Throttle benchmark:", performance.now() - startTime, "for", calls, "calls");
// }
