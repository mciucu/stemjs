import {toArray} from "../../base/Utils";

// TODO: rename to arrayable or something better?
// When passed in a function, it will normalize the first argument to an array
// And will call the original function on each element in that array
// TODO Also make sure it works for methods
export function unarray<T, R>(originalFunc: (item: T, ...args: any[]) => R): (items: T | T[], ...args: any[]) => R | R[] {
    return (items: T | T[], ...args: any[]) => {
        const firstArgWasArray = Array.isArray(items);
        const itemsArray = toArray(items);
        const results = itemsArray.map((item: T) => originalFunc(item, ...args));
        return (firstArgWasArray || results.length > 1) ? results : results[0];
    };
}
