import {MultiMap} from "../data-structures/MultiMap";

export class FormData extends MultiMap {
    static polyfill = true;

    constructor(obj) {
        throw Error("FormData polyfill is not yet implemented");
    }
}

export function polyfillFormData(global) {
    global.FormDate = global.FormData || FormData;
}
