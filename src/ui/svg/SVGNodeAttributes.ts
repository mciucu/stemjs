import {NodeAttributes, DOMAttributesMap} from "../NodeAttributes";

// Setting these attributes as styles in mozilla has no effect.
// To maintain compatibility between moz and webkit, whenever
// one of these attributes is set as a style, it is also set as a
// node attribute.
const MozStyleElements = new Set(["width", "height", "rx", "ry", "cx", "cy", "x", "y"]);

export class SVGNodeAttributes extends NodeAttributes {
    // SVG-specific attributes that may be set
    declare transform?: string;
    declare translate?: string;

    fixMozAttributes(node: SVGElement): void {
        if (this.hasOwnProperty("style")) {
            for (let attributeName of MozStyleElements.values()) {
                if (this.style && typeof this.style === "object" && this.style.hasOwnProperty(attributeName) && !this.hasOwnProperty(attributeName)) {
                    this.setAttribute(attributeName, this.style[attributeName], node);
                }
            }
        }
    }

    setStyle(attributeName: string | Record<string, any>, value?: any, node?: SVGElement): void {
        super.setStyle(attributeName, value, node);
        if (typeof attributeName === "string" && MozStyleElements.has(attributeName)) {
            this.setAttribute(attributeName, value, node);
        }
    }

    // SVG elements have a different API for setting the className than regular DOM nodes
    applyClassName(node: SVGElement): void {
        if (this.className) {
            const className = String(this.className);
            node.setAttribute("class", className);
        } else {
            node.removeAttribute("class");
        }
    }

    apply(node: SVGElement, attributesMap: DOMAttributesMap): void {
        this.transform = this.transform || this.translate;
        super.apply(node, attributesMap);
        this.fixMozAttributes(node);
    }
}
