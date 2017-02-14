import {UI} from "../UIBase";
import {CreateNodeAttributesMap} from "../NodeAttributes";
import {deepCopy, uniqueId} from "../../base/Utils";
import {SVGNodeAttributes} from "./SVGNodeAttributes";

let SVG = {};

SVG.Element = class SVGElement extends UI.Element {
    createNode() {
        this.node = document.createElementNS("http://www.w3.org/2000/svg", this.getNodeType());
        return this.node;
    }

    getDefaultOptions() {
        return {};
    }

    setOptions(options) {
        if (typeof this.getDefaultOptions === "function") {
            let defaultOptions = this.getDefaultOptions();
            options = deepCopy({}, defaultOptions, options);
        }
        super.setOptions(options);
    }

    saveState() {
        let state = {};
        state.options = Object.assign({}, this.options);
        return state;
    }

    setState(state) {
        this.setOptions(state.options);
    }

    getOptionsAsNodeAttributes() {
        let attr = this.options;
        attr.__proto__ = SVGNodeAttributes.prototype;
        return attr;
    }

    getNodeAttributes(returnCopy=true) {
        if (returnCopy) {
            return new SVGNodeAttributes(this.options);
        } else {
            return this.getOptionsAsNodeAttributes();
        }
    }

    translate(x=0, y=0) {
        this.options.translate = "translate(" + x + "," + y + ")";
    }

    getHashCode() {
        return uniqueId(this);
    }

    //TODO(@all) : getBoundingClientRect is unreliable, reimplement it.
    getBoundingClientRect() {
        let element = this.node;
        let x = 0;
        let y = 0;
        while(element && element !== document.body) {
            x -= element.scrollLeft;
            y -= element.scrollTop;
            element = element.offsetParent || element.parentNode;
        }
        if (element) {
            x -= element.scrollLeft;
            y -= element.scrollTop;
        }
        let pos = this.node.getBoundingClientRect();
        return {
            top: pos.top - y,
            left: pos.left - x,
            width: pos.width,
            bottom: pos.bottom - y,
            height: pos.height,
            right: pos.right - x
        };
    }

    getBBox() {
        return this.node.getBBox();
    }

    getHeight() {
        return this.getBoundingClientRect().height;
    }

    getWidth() {
        return this.getBoundingClientRect().width;
    }

    toFront() {
    }

    toBack() {
    }

    setOpacity(newOpacity) {
        this.options.opacity = newOpacity;
        if (this.node) {
            this.node.setAttribute("opacity", newOpacity);
        }
    }

    setColor(color) {
        this.options.color = color;
        if (this.node) {
            this.node.setAttribute("stroke", color);
            this.node.setAttribute("fill", color)
        }
    }

    remove() {
    }

    getSvg() {
        return this.parent.getSvg();
    }
};

SVG.Element.domAttributesMap = CreateNodeAttributesMap(UI.Element.domAttributesMap, [
    ["fill"],
    ["height"],
    ["opacity"],
    ["stroke"],
    ["strokeWidth", {domName: "stroke-width"}],
    ["clipPath", {domName: "clip-path"}],
    ["transform"],
    ["width"],
    ["cx"],
    ["cy"],
    ["rx"],
    ["ry"],
    ["x"],
    ["y"],
    ["x1"],
    ["y1"],
    ["x2"],
    ["y2"],
    ["offset"],
    ["stopColor", {domName: "stop-color"}],
    ["strokeDasharray", {domName: "stroke-dasharray"}],
    ["strokeLinecap", {domName: "stroke-linecap"}]
]);

export {SVG};
