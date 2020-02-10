import {isPlainObject} from "./Utils";

//region toSnakeCasePreprocessor
// Request preprocessor for converting object keys to snake case

// Helper functions
function _firstToUpper(word) {
    return word[1].toUpperCase();
}

function _concatSnakeCase(word) {
    return word[0] + "_" + word[1];
}

/**
 * Converts a given string from snake case to camel case
 * @param {string} key -> String to be converted
 * @returns string
 */
function snakeToCamel(key) {
    return key.replace(/(_\w)/g, _firstToUpper);
}

/**
 * Converts a given string from camel case to snake case
 * @param {string} key -> String to be converted
 * @returns string
 */
function camelToSnakeCase(key) {
    return key.replace(/[\w]([A-Z])/g, _concatSnakeCase).toLowerCase();
}


/**
 * Updates all the keys of an object to snake_case.
 * @param {Object} data
 * @returns {*}
 */
function makeKeysSnakeCase(data) {
    for (let key of Objects.keys(data)) {
        // check if the current key is a nested object
        const newKey = camelToSnakeCase(key);
        if (typeof data[key] === "object" && data[key] !== null) {
            // Move nested key body only if the key has changed
            if (newKey !== key){
                data[newKey] = data[key];
                delete data[key];
            }
            // Updated the keys of the nested object
            makeKeysSnakeCase(data[newKey]);
        } else {
            // Simple key value pair
            if (newKey !== key) {
                // Move the existing data to the new key
                data[newKey] = data[key];
                delete data[key];
            }
        }
    }
    return data;
}

/**
 * Updates the keys of the `.data` field of an object to snake_case.
 * The method updates the object only if the method is "POST".
 * @param {Object} options -> Request object containing .data
 * @returns options
 */
function toSnakeCasePreprocessor(options) {
    if (options.method.toUpperCase() !== "POST") {
        return options;
    }
    makeKeysSnakeCase(options.data);
    return options;
}
//endregion


/***
 * JSON Preprocessor that adds the "application/json" content-type.
 * The XHRPromise will serialize the options.body using JSON.stringify.
 * @param options
 * @returns {*}
 */
function jsonRequestPreprocessor(options) {
    if (options.type) {
        options.method = options.type.toUpperCase();
    }

    options.headers.set("X-Requested-With", "XMLHttpRequest");

    if (isPlainObject(options.data)) {
        const method = options.method.toUpperCase();
        if (method === "GET" || method === "HEAD") {
            options.urlParams = options.urlParams || options.data;
        } else {
            //Add aplication json header
            options.headers.set("Content-Type", "application/json");
            // move data to body
            options.body = options.data;
        }
    } else {
        options.body = options.body || options.data;
    }
    return options;
}

export {toSnakeCasePreprocessor, jsonRequestPreprocessor};