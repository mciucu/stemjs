import {UI} from "./UIBase";
import {NodeAttributes} from "./NodeAttributes";

export interface ViewportMetaOptions {
    scale: number;
    initialScale: number;
    maximumScale: number;
    minDeviceWidth?: number;
}

export class ViewportMeta extends UI.Primitive<ViewportMetaOptions, "meta">("meta") {
    getDefaultOptions(): ViewportMetaOptions {
        return {
            scale: this.getDesiredScale(),
            initialScale: 1,
            maximumScale: 1,
        }
    }

    getDesiredScale(): number {
        const MIN_WIDTH = this.options.minDeviceWidth;
        return (MIN_WIDTH) ? Math.min(window.screen.availWidth, MIN_WIDTH) / MIN_WIDTH : 1;
    }

    getContent(): string {
        let rez = "width=device-width";
        rez += ",initial-scale=" + this.options.scale;
        rez += ",maximum-scale=" + this.options.scale;
        rez += ",user-scalable=no";
        return rez;
    }

    extraNodeAttributes(attr: NodeAttributes): void {
        attr.setAttribute("name", "viewport");
        attr.setAttribute("content", this.getContent());
    }

    maybeUpdate(): void {
        const desiredScale = this.getDesiredScale();
        if (desiredScale != this.options.scale) {
            this.updateOptions({scale: desiredScale});
        }
    }

    onMount(): void {
        window.addEventListener("resize", () => this.maybeUpdate());
    }
}