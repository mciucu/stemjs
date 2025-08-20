import {UI, UIElement} from "./UIBase";

interface RawHTMLOptions {
    innerHTML?: string;
    __innerHTML?: string;
}

// Beware coder: If you ever use this class, you should have a well documented reason
export class RawHTML extends UIElement<RawHTMLOptions> {
    getInnerHTML(): string {
        return this.options.innerHTML || this.options.__innerHTML || "";
    }

    redraw(): boolean {
        if (!this.node) {
            return false;
        }
        this.node.innerHTML = this.getInnerHTML();
        this.applyNodeAttributes();
        this.applyRef();
        return true;
    }
}