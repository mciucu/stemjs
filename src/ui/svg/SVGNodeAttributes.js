import {NodeAttributes} from "../NodeAttributes";

// Setting these attributes as styles in mozilla has no effect.
// To maintain compatibility between moz and webkit, whenever
// one of these attributes is set as a style, it is also set as a
// node attribute.
const MozStyleElements = new Set(["width", "height", "rx", "ry", "cx", "cy", "x", "y"]);

export class SVGNodeAttributes extends NodeAttributes {
    fixMozAttributes(node) {
        if (this.hasOwnProperty("style")) {
            for (let attributeName of MozStyleElements.values()) {
                if (this.style.hasOwnProperty(attributeName) && !this.hasOwnProperty(attributeName)) {
                    this.setAttribute(attributeName, this.style[attributeName], node);
                }
            }
        }
    }

    setStyle(attributeName, value, node) {
        super.setStyle(attributeName, value, node);
        if (MozStyleElements.has(attributeName)) {
            this.setAttribute(attributeName, value, node);
        }
    }

    applyClassName(node) {
        // SVG elements have a different API for setting the className than regular DOM nodes
        if (this.className) {
            node.setAttribute("class", String(this.className));
        } else {
            node.removeAttribute("class");
        }
    }

    apply(node, attributesMap) {
        this.transform = this.transform || this.translate;
        super.apply(node, attributesMap);
        this.fixMozAttributes(node);
    }
}
