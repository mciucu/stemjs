import {UI} from "../UIBase";
import {CreateNodeAttributesMap} from "../NodeAttributes";
import {uniqueId} from "../../base/Utils";
import {SVGNodeAttributes} from "./SVGNodeAttributes";
import {Device} from "../../base/Device";

let SVG = {};

SVG.Element = class SVGElement extends UI.Element {
    createNode() {
        this.node = document.createElementNS("http://www.w3.org/2000/svg", this.getNodeType());
        if (document.STEM_DEBUG) {
            this.node.stemElement = this;
        }
        return this.node;
    }

    getScreenCoordinatedForPoint(point) {
        const node = this.node;
        // TODO: this is a good argument to always keep a reference to the Stem element in the nodes
        const svgNode = node.ownerSVGElement || node;

        if (svgNode.createSVGPoint) {
            // Using native SVG transformations
            // See https://msdn.microsoft.com/en-us/library/hh535760(v=vs.85).aspx
            let svgPoint = svgNode.createSVGPoint();
            svgPoint.x = point.x;
            svgPoint.y = point.y;
            return svgPoint.matrixTransform(node.getScreenCTM().inverse());
        }

        const rect = this.getBoundingClientRect();
        return {
        	x: point.x - rect.left - node.clientLeft,
        	y: point.y - rect.top - node.clientTop,
        };
    }

    getMouseCoordinatesForEvent(event=window.event) {
        return this.getScreenCoordinatedForPoint({x: Device.getEventX(event), y: Device.getEventY(event)});
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
        const parentNode = this.node && this.node.parentElement;
        if (parentNode) {
            parentNode.removeChild(this.node);
            parentNode.appendChild(this.node);
        }
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
    ["strokeLinecap", {domName: "stroke-linecap"}],
    ["viewBox", {domName: "viewBox"}],
]);

export {SVG};
