import {NodeAttributes} from "../NodeAttributes";

// Setting these attributes as styles in mozilla has no effect.
// To maintain compatibility between moz and webkit, whenever
// one of these attributes is set as a style, it is also set as a
// node attribute.
const MozStyleElements = new Set(["width", "height", "rx", "ry", "cx", "cy", "x", "y"]);

class SVGNodeAttributes extends NodeAttributes {
    constructor(obj) {
        super(obj);
        this.className = null;
    }

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

    apply(node, attributesMap) {
        this.transform = this.transform || this.translate;
        super.apply(node, attributesMap);
        this.fixMozAttributes(node);
    }
}

export {SVGNodeAttributes};