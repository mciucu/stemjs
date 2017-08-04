// THIS FILE IS WORK IN PROGRESS
import {UI} from "./UIBase";
import {Dispatchable} from "../base/Dispatcher";

export class Passthrough extends Dispatchable {
    toUI() {
        return this.options.children;
    }

    redraw() {
    }
}