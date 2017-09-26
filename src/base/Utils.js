// TODO: should this be renamed to "toUnwrappedArray"?
export function unwrapArray(elements) {
    if (!elements) {
        return [];
    }

    if (!Array.isArray(elements)) {
        // In case this is an iterable, convert to array
        if (elements[Symbol.iterator]) {
            return unwrapArray(Array.from(elements));
        } else {
            return [elements];
        }
    }

    // Check if the passed in array is valid, and try to return it if possible to preserve references
    let allProperElements = true;
    for (let i = 0; i < elements.length; i++) {
        if (Array.isArray(elements[i]) || elements[i] == null) {
            allProperElements = false;
            break;
        }
    }

    if (allProperElements) {
        // Return the exact same array as was passed in
        return elements;
    }

    let result = [];
    for (let i = 0; i < elements.length; i++) {
        if (Array.isArray(elements[i])) {
            let unwrappedElement = unwrapArray(elements[i]);
            for (let j = 0; j < unwrappedElement.length; j += 1) {
                result.push(unwrappedElement[j]);
            }
        } else {
            if (elements[i] != null) {
                result.push(elements[i]);
            }
        }
    }
    return result;
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
    if (typeof value === "number" || value instanceof Number) {
        return value + suffix;
    }
    return value;
}

export function setObjectPrototype(obj, Class) {
    obj.__proto__ = Class.prototype;
    return obj;
}

export function isNumber(obj) {
    return (typeof obj === "number") || (obj instanceof Number);
}

export function isString(obj) {
    return (typeof obj === "string") || (obj instanceof String);
}

export function isPlainObject(obj) {
    if (!obj || typeof obj !== "object" || obj.nodeType) {
        return false;
    }
    if (obj.constructor && obj.constructor != Object) {
        return false;
    }
    return true;
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

export function objectFromKeyValue(key, value) {
    return {
        [key]: value,
    }
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
            return decodeURIComponent(cookie.substring(name.length + 1));
        }
    }
    return null;
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

export function instantiateNative(BaseClass, NewClass, ...args) {
    let obj = new BaseClass(...args);
    obj.__proto__ = NewClass.prototype;
    return obj;
}

// This function can be used as a decorator in case we're extending native classes (Map/Set/Date)
// and we want to fix the way babel breaks this scenario
// WARNING: it destroys the code in constructor
// If you want a custom constructor, you need to implement a static create method that generates new objects
// Check the default constructor this code, or an example where this is done.
export function extendsNative(targetClass) {
    if (targetClass.toString().includes(" extends ")) {
        // Native extended classes are cool, leave them as they are
        return;
    }
    let BaseClass = targetClass.__proto__;
    let allKeys = Object.getOwnPropertySymbols(targetClass).concat(Object.getOwnPropertyNames(targetClass));

    // Fill in the default constructor
    let newClass = targetClass.create || function create() {
        return instantiateNative(BaseClass, newClass, ...arguments);
        };
    for (const key of allKeys) {
        let property = Object.getOwnPropertyDescriptor(targetClass, key);
        Object.defineProperty(newClass, key, property);
    }
    newClass.prototype = targetClass.prototype;
    newClass.__proto__ = targetClass.__proto__;

    newClass.prototype.constructor = newClass;

    return newClass;
}

export const NOOP_FUNCTION = () => undefined;

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