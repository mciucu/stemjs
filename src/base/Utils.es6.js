// TODO: should this be renamed to "toUnwrappedArray"?
export function unwrapArray(elements) {
    if (arguments.length > 1) {
        elements = [...arguments];
    }

    if (!elements) {
        return [];
    }

    if (!Array.isArray(elements)) {
        return [elements];
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

    if (typeof a === "number" && typeof b === "number") {
        return a - b;
    }

    if (a.toString() === b.toString()) {
        return 0;
    }
    return a.toString() < b.toString() ? -1 : 1;
}

export function slugify(string) {
    string = string.trim();

    string = string.replace((/[^a-zA-Z0-9-\s]/g), ""); // remove anything non-latin alphanumeric
    string = string.replace((/\s+/g), "-"); // replace whitespace with dashes
    string = string.replace((/-{2,}/g), "-"); // remove consecutive dashes
    string = string.toLowerCase();

    return string;
}

export function suffixNumber(value, suffix) {
    if (typeof value === "number" || value instanceof Number) {
        return value + suffix;
    }
    return value;
}

export function deepCopy() {
	let target = arguments[0] || {};
	// Handle case when target is a string or something (possible in deep copy)
	if (typeof target !== "object" && typeof target !== "function") {
		target = {};
	}

	for (let i = 1; i < arguments.length; i += 1) {
        let options = arguments[i];
        if (options == null) {
            continue;
        }

        // Extend the base object
        for (let [key, value] of Object.entries(options)) {
            if (value === undefined) {
                continue;
            }

            // Recurse if we're merging plain objects or arrays
            // TODO: should implement this without jQuery
            if ($.isPlainObject(value) || (Array.isArray(value))) {
                let clone;
                let src = target[key];

                if (Array.isArray(value)) {
                    clone = (src && Array.isArray(src)) ? src : [];
                } else {
                    // TODO: should implement this without jQuery
                    clone = (src && $.isPlainObject(src)) ? src : {};
                }

                target[key] = deepCopy(clone, value);
            } else {
                target[key] = value;
            }
        }
	}

	return target;
}
