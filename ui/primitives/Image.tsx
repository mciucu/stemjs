import {UI} from "../UIBase";
import {sanitizeUrlFromOptions} from "./Link";
import {RemoveHandle} from "../../base/Dispatcher";

export class Image extends UI.Primitive<void, "img">("img") {
    setOptions(options: any): any {
        return super.setOptions(sanitizeUrlFromOptions(options, "src"));
    }

    addLoadListener(callback: EventListener): RemoveHandle {
        return this.addNodeListener("load", callback);
    }
}