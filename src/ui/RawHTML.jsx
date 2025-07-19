import {UI, UIElement} from "./UIBase.js";

// Beware coder: If you ever use this class, you should have a well documented reason
export class RawHTML extends UIElement {
    getInnerHTML() {
        return this.options.innerHTML || this.options.__innerHTML || "";
    }

    redraw() {
        this.node.innerHTML = this.getInnerHTML();
        this.applyNodeAttributes();
        this.applyRef();
    }
}