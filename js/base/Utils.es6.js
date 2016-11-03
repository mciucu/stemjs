// TODO: should this be renamed to "toUnwrappedArray"?
export function unwrapArray(elements) {
    if (!elements) {
        return [];
    }

    if (!Array.isArray(elements)) {
        return [elements];
    }

    let allProperElements = true;
    for (let i = 0; i < elements.length; i++) {
        if (Array.isArray(elements[i]) || !elements[i]) {
            allProperElements = false;
            break;
        }
    }

    if (allProperElements) {
        // return the exact same array as was passed in
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
