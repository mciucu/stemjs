// TypeScript type definitions
type UnwrapFunc<T = any> = (element: T) => T | undefined;
type VersioningFunc = (str: string, index: number | string) => string;
type FilterFunc = (key: string, value: any) => boolean;

interface CleanObjectOptions {
    skipEmptyString?: boolean;
    filterFunc?: FilterFunc | null;
    emptyAsNull?: boolean;
}

interface Base64Options {
    jsonFormat?: boolean;
}

interface ResolveFuncValueOptions {
    maxIter?: number;
    args?: any[] | null;
    allowUnresolved?: boolean;
}

// TODO @cleanup merge with unwrapArray
export function toArray<T>(objOrArray: T | T[] | null | undefined): T[] {
    if (objOrArray == null) {
        return [];
    }
    return Array.isArray(objOrArray) ? objOrArray : [objOrArray];
}

export function unwrapElementPlain<T>(element: T): T | undefined {
    if (element == null || element === false) {
        return undefined;
    }
    return element;
}

export function unwrapElementWithFunc<T>(element: T | (() => T)): T | undefined {
    while (isFunction(element)) {
        element = (element as () => T)();
    }
    return unwrapElementPlain(element);
}

export function unwrapArray<T>(elements: any, unwrapFunc: UnwrapFunc<T> = unwrapElementPlain): T[] {
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

    let result: T[] = [];
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

export function areSetsEqual<T>(a: Set<T>, b: Set<T>): boolean {
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

export function haveSameElements<T>(a: T | T[], b: T | T[]): boolean {
    const setA = new Set(toArray(a));
    const setB = new Set(toArray(b));
    return areSetsEqual(setA, setB);
}

export function isLocalUrl(url: string, host: string = self.location.host, origin: string = self.location.origin): boolean {
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
export function trimLocalUrl(url: string, host: string = self.location.host, origin: string = self.location.origin): string {
    if (!isLocalUrl(url, host, origin)) {
        throw new Error("Trying to trim non-local url!");
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
export function splitInChunks<T>(array: T[], maxChunkSize: number): T[][] {
    let chunks: T[][] = [];
    while (array.length > 0) {
        chunks.push(array.splice(0, maxChunkSize));
    }
    return chunks;
}

export function isIterable(obj: any): obj is Iterable<any> {
    if (obj == null) {
        return false;
    }
    return obj[Symbol.iterator] !== undefined;
}

export function defaultComparator(a: any, b: any): number {
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

export function slugify(string: string): string {
    string = string.trim();

    string = string.replace((/[^a-zA-Z0-9-\s]/g), ""); // remove anything non-latin alphanumeric
    string = string.replace((/\s+/g), "-"); // replace whitespace with dashes
    string = string.replace((/-{2,}/g), "-"); // remove consecutive dashes
    string = string.toLowerCase();

    return string;
}

// If the first argument is a number, it's returned concatenated with the suffix, otherwise it's returned unchanged
export function suffixNumber(value: any, suffix: string): any {
    return isNumber(value) ? value + suffix : value;
}

export function capitalize(text: string): string {
    return text && (text.charAt(0).toUpperCase() + text.slice(1));
}

export function decapitalize(text: string): string {
    return text && (text.charAt(0).toLowerCase() + text.slice(1));
}

export function pluralize(count: number, text: string): string {
    return `${count} ${text}${count > 1 ? "s" : ""}`;
}

export function titleCase(text: string): string {
     return text.toLowerCase().split(" ").map(word => capitalize(word)).join(" ");
}

// Cap a string (when sending to DB for instance), and also add a total length info
// Don't use this in the frontend, use ellipsis css
// Length is exceeded a bit by the extra description
export function limitString(str: string, maxLength: number): string {
    if (str.length > maxLength) {
        const newStr = str.substring(0, maxLength) + `...[${str.length} initial chr.]`;
        // Even if we're a bit over the length limit, let's not be stupid and bloat the input
        if (newStr.length < str.length) {
            str = newStr;
        }
    }
    return str;
}

export function setObjectPrototype<T>(obj: any, Class: new (...args: any[]) => T): T {
    (obj as any).__proto__ = Class.prototype;
    return obj;
}

export function isFunction(obj: any): obj is Function {
    return typeof obj === "function";
}

export function isBoolean(obj: any): obj is boolean {
    return obj === true || obj === false;
}

export function isNumber(obj: any): obj is number {
    return (typeof obj === "number") || (obj instanceof Number);
}

export function isString(obj: any): obj is string {
    return (typeof obj === "string") || (obj instanceof String);
}

export function isNumericString(str: any, acceptPadding: boolean = false): boolean {
    if (!isString(str)) {
        return false;
    }
    if (!acceptPadding && str.trim() !== str) {
        return false;
    }
    // Both of these are needed to cover all cases
    return !isNaN(str as any) && !isNaN(parseFloat(str));
}

export function isPlainObject(obj: any): obj is Record<string, any> {
    if (!obj || typeof obj !== "object") {
        return false;
    }
    if (obj.constructor && obj.constructor != Object) {
        return false;
    }
    return true;
}

function FILTER_NULLS(key: string, value: any): boolean {
    return value != null;
}

function FILTER_NULLS_AND_EMPTY_STR(key: string, value: any): boolean {
    return value != null && value !== "";
}

export function cleanObject(obj: Record<string, any>, options: CleanObjectOptions = {}): Record<string, any> | null {
    const {skipEmptyString = true, filterFunc = null, emptyAsNull = false} = options;
    const cleanedObject: Record<string, any> = {};
    const filterFunction = filterFunc || (skipEmptyString ? FILTER_NULLS_AND_EMPTY_STR : FILTER_NULLS);
    
    for (const [key, value] of Object.entries(obj)) {
        if (filterFunction(key, value)) {
            cleanedObject[key] = value;
        }
    }
    if (emptyAsNull && Object.keys(cleanedObject).length === 0) {
        return null;
    }
    return cleanedObject;
}

export function deepSetAttr(obj: Record<string, any>, keys: string[], value: any): void {
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

export function deepGetAttr(obj: any, keys: string[]): any {
    for (const key of keys) {
        obj = obj && obj[key];
    }
    return obj;
}

export function deepCopy<T = any>(...sources: any[]): T {
	let target = sources[0] || {};
	// Handle case when target is a string or something (possible in deep copy)
	if (typeof target !== "object" && typeof target !== "function") {
		target = {};
	}

	for (let i = 1; i < sources.length; i += 1) {
        let obj = sources[i];
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

export function dashCase(str: string): string {
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
export function getCookie(name: string): string {
    let cookies = (document.cookie || "").split(";");
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(name + "=")) {
            return cookie.substring(name.length + 1);
        }
    }
    return "";
}

export function setCookie(name: string, value: string, maxAge: number = 60*60*4 /* 4 hours */, domain?: string): void {
    let cookie = `${name}=${value}; path=/; max-age=${maxAge}; ${window.location.protocol === "http:" ? "" : "SameSite=None; Secure; "}`;
    if (domain && domain.trim().length) {
        cookie += `domain=${domain};`
    }
    document.cookie = cookie;
}

export function serializeCookie(name: string, value: any, maxAge: number = 60*60*4): void {
    setCookie(name, encodeURIComponent(JSON.stringify(value)), maxAge);
}

export function deserializeCookie(name: string): any {
    const value = getCookie(name);
    if (!value) {
        return value;
    }
    return JSON.parse(decodeURIComponent(value));
}

export function uniqueId(obj: object): string {
    if (!(uniqueId as any).objectWeakMap) {
        (uniqueId as any).objectWeakMap = new WeakMap();
        (uniqueId as any).constructorWeakMap = new WeakMap();
        (uniqueId as any).totalObjectCount = 0;
    }
    let objectWeakMap = (uniqueId as any).objectWeakMap;
    let constructorWeakMap = (uniqueId as any).constructorWeakMap;
    if (!objectWeakMap.has(obj)) {
        const objConstructor = (obj as any).constructor || (obj as any).__proto__ || Object;
        // Increment the object count
        const objIndex = (constructorWeakMap.get(objConstructor) || 0) + 1;
        constructorWeakMap.set(objConstructor, objIndex);

        const objUniqueId = objIndex + "-" + (++(uniqueId as any).totalObjectCount);
        objectWeakMap.set(obj, objUniqueId);
    }
    return objectWeakMap.get(obj);
}

// args[0] is a string where the "%[number]" block will be replaced by the args[number]
export function evaluateSprintf(...args: any[]): string {
    let str = args[0];

    for (let index = 1; index < args.length; index += 1) {
        str = str.replaceAll("%" + index, args[index]);
    }

    return str;
}

// TODO: should be done with String.padLeft
export function padNumber(num: number, minLength: number): string {
    let strNum = String(num);
    while (strNum.length < minLength) {
        strNum = "0" + strNum;
    }
    return strNum;
}

// Returns the english ordinal suffix of a number
export function getOrdinalSuffix(num: number): string {
    let suffixes = ["th", "st", "nd", "rd"];
    let lastDigit = num % 10;
    let isTeen = Math.floor(num / 10) % 10 === 1;
    return (!isTeen && suffixes[lastDigit]) || suffixes[0];
}

export function suffixWithOrdinal(num: number): string {
    return num + getOrdinalSuffix(num);
}

function appendNumberInParanthesis(str: string, index: number | string): string {
    if (!index) {
        return str;
    }
    return str + " (" + index + ")";
}

// Starting from the suggestion, tries a bunch of versioning values until one is free (passes checkFunc)
export function findFirstFreeVersion(suggestion: string, checkFunc: (str: string) => boolean, versioning: VersioningFunc = appendNumberInParanthesis): string {
    for (let index = 0; index < 100; index++) {
        const str = versioning(suggestion, index);
        if (!checkFunc(str)) {
            return str;
        }
    }
    // Hail Mary
    return versioning(suggestion, Math.random().toString().substring(2));
}

export function base64Encode(value: any, options: Base64Options = {}): string {
    const {jsonFormat = true} = options;
    if (jsonFormat) {
        value = JSON.stringify(value);
    }
    return btoa(value);
}

export function base64Decode(value: string, options: Base64Options = {}): any {
    const {jsonFormat = true} = options;
    let decoded = atob(value);
    if (jsonFormat) {
        decoded = JSON.parse(decoded);
    }
    return decoded;
}

// Erase the first instance of the value from the given array. In-place, returns the array
export function eraseFirst<T>(array: T[], value: T): T[] {
    const index = array.indexOf(value);
    if (index >= 0) {
        array.splice(index, 1);
    }
    return array;
}

export const UNICODE_BOM_CHARACTER = 0xFEFF;
export const NOOP_FUNCTION = () => undefined;

export function isFirefox(): boolean {
    return (navigator.userAgent.indexOf("Firefox") !== -1
        || navigator.userAgent.indexOf("FxiOS") !== -1) && navigator.userAgent.indexOf("Chrome") === -1;
}

export function isSafari(): boolean {
    let firefox = isFirefox();
    let safari = navigator.userAgent.indexOf("Safari") > -1;
    let chrome = navigator.userAgent.indexOf("Chrome") > -1;
    if (chrome || firefox) {
        safari = false;
    }
    return safari;
}

// Helpers to wrap iterators, to wrap all values in a function or to filter them
export function* mapIterator<T, U>(iter: Iterable<T>, func: (value: T) => U): Generator<U, void, unknown> {
    for (let value of iter) {
        yield func(value);
    }
}

export function* filterIterator<T>(iter: Iterable<T>, func: (value: T) => boolean): Generator<T, void, unknown> {
    for (let value of iter) {
        if (func(value)) {
            yield value;
        }
    }
}

// Used so that a value or a function can be used anywhere
// If the value is a function, it will call it at most maxIter (default 32) times
export function resolveFuncValue<T>(value: T | (() => T), options: ResolveFuncValueOptions = {}): T {
    const {maxIter = 32, args = null, allowUnresolved = false} = options;
    let currentValue = value;
    let iterations = maxIter;
    
    while (iterations > 0 && isFunction(currentValue)) {
        currentValue = (currentValue as any)(...(args || []));
        iterations -= 1;
    }
    if (!allowUnresolved && iterations === 0) {
        console.error("Failed to resolve value to a non-function");
    }
    return currentValue as T;
}
