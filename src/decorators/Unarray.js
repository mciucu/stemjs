import {toArray} from "../base/Utils.js";

// When passed in a function, it will normalize the first argument to an array
// And will call the original function on each element in that array
// TODO Also make sure it works for methods
export function unarray(originalFunc) {
    return (...args) => {
        const firstArgWasArray = Array.isArray(args[0]);
        const firstArg = toArray(args[0]);
        const result = firstArg.map((obj) => {
            args[0] = obj;
            return originalFunc(...args);
        });
        return (firstArgWasArray || result.length > 1) ? result : result[0];
    }
}
