import {polyfillRequest} from "./Request";
import {polyfillResponse} from "./Response";
import {polyfillHeaders} from "./Headers";
import {polyfillURLSearchParams} from "./URLSearchParams";
import {polyfillBody} from "./Body";

let polyfillFunctions = [
    polyfillRequest,
    polyfillResponse,
    polyfillHeaders,
    polyfillURLSearchParams,
    polyfillBody
];

function polyfill(global) {
    for (let func of polyfillFunctions) {
        func(global);
    }
}

export {polyfill, polyfillFunctions};