define(["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.unwrapArray = unwrapArray;
    exports.splitInChunks = splitInChunks;
    exports.isIterable = isIterable;
    exports.defaultComparator = defaultComparator;
    // TODO: should this be renamed to "toUnwrappedArray"?
    function unwrapArray(elements) {
        if (!elements) {
            return [];
        }

        if (!Array.isArray(elements)) {
            return [elements];
        }

        var allProperElements = true;
        for (var i = 0; i < elements.length; i++) {
            if (Array.isArray(elements[i]) || !elements[i]) {
                allProperElements = false;
                break;
            }
        }

        if (allProperElements) {
            // return the exact same array as was passed in
            return elements;
        }

        var result = [];
        for (var _i = 0; _i < elements.length; _i++) {
            if (Array.isArray(elements[_i])) {
                var unwrappedElement = unwrapArray(elements[_i]);
                for (var j = 0; j < unwrappedElement.length; j += 1) {
                    result.push(unwrappedElement[j]);
                }
            } else {
                if (elements[_i] != null) {
                    result.push(elements[_i]);
                }
            }
        }
        return result;
    }

    function splitInChunks(array, maxChunkSize) {
        var chunks = [];
        while (array.length > 0) {
            chunks.push(array.splice(0, maxChunkSize));
        }
        return chunks;
    }

    function isIterable(obj) {
        if (obj == null) {
            return false;
        }
        return obj[Symbol.iterator] !== undefined;
    }

    function defaultComparator(a, b) {
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
});
