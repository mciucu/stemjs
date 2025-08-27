import {UI} from "../UIBase.js";
import {sanitizeUrlFromOptions} from "./Link.jsx";

export class Image extends UI.Primitive("img") {
    setOptions(options) {
        return super.setOptions(sanitizeUrlFromOptions(options, "src"));
    }

    addLoadListener(callback) {
        return this.addNodeListener("load", callback);
    }
}
