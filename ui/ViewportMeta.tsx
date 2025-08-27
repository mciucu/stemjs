import {UI} from "./UIBase.js";

export class ViewportMeta extends UI.Primitive("meta") {
    getDefaultOptions() {
        return {
            scale: this.getDesiredScale(),
            initialScale: 1,
            maximumScale: 1,
        }
    }

    getDesiredScale() {
        const MIN_WIDTH = this.options.minDeviceWidth;
        return (MIN_WIDTH) ? Math.min(window.screen.availWidth, MIN_WIDTH) / MIN_WIDTH : 1;
    }

    getContent() {
        let rez = "width=device-width";
        rez += ",initial-scale=" + this.options.scale;
        rez += ",maximum-scale=" + this.options.scale;
        rez += ",user-scalable=no";
        return rez;
    }

    extraNodeAttributes(attr) {
        attr.setAttribute("name", "viewport");
        attr.setAttribute("content", this.getContent());
    }

    maybeUpdate() {
        const desiredScale = this.getDesiredScale();
        if (desiredScale != this.options.scale) {
            this.updateOptions({scale: desiredScale});
        }
    }

    onMount() {
        window.addEventListener("resize", () => this.maybeUpdate());
    }
}
