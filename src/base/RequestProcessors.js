import {isPlainObject} from "./Utils";
//region toSnakeCasePreprocessor
// Request preprocessor for converting object keys to snake case

// helper functions
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
function camelToSnake(key) {
    return key.replace(/[\w]([A-Z])/g, _concatSnakeCase).toLowerCase();
}


/**
 * Updates all the keys of an object to snake_case.
 * @param {Object} data
 * @returns {*}
 */
function updateObjectKeys(data) {
    for (let key in data) {
        if (!data.hasOwnProperty(key)) {
            continue;
        }
        // check if the current key is a nested object
        if (typeof data[key] == "object" && data[key] !== null) {
            let new_key = camelToSnake(key);
            // move nested key body only if the key has changed
            if(new_key !== key){
                data[new_key] = data[key];
                delete data[key];
            }
            // updated the keys of the nested object
            updateObjectKeys(data[new_key]);
        } else {
            // simple key value pair

            // compute new object key
            let new_key = camelToSnake(key);
            if (new_key === key) {
                continue;
            }

            // move the existing data to the new key
            data[new_key] = data[key];
            delete data[key];
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
    updateObjectKeys(options.data);
    return options;
}
//endregion

//region jsonBodyRequestPreprocessor
function jsonBodyRequestPreprocessor(options) {
    if (options.type) {
        options.method = options.type.toUpperCase();
    }

    //Add aplication json header
    options.headers.set("Content-Type", "application/json");
    options.headers.set("X-Requested-With", "XMLHttpRequest");

    if (isPlainObject(options.data)) {
        let method = options.method.toUpperCase();
        if (method === "GET" || method === "HEAD") {
            options.urlParams = options.urlParams || options.data;
        } else {
            // move data to body
            options.body = options.data;
        }
    } else {
        options.body = options.body || options.data;
    }
    return options
}
//endregion

export {toSnakeCasePreprocessor, jsonBodyRequestPreprocessor};