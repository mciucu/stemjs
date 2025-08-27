import {SVGTagType, UI, UIElement} from "../UIBase";
import {DOMAttributesMap} from "../NodeAttributes";
import {setObjectPrototype} from "../../base/Utils";
import {SVGNodeAttributes} from "./SVGNodeAttributes";
import {Device} from "../../base/Device";
import {applyDebugFlags} from "../UIBase";

interface Point {
    x: number;
    y: number;
}

interface BoundingRect {
    top: number;
    left: number;
    width: number;
    bottom: number;
    height: number;
    right: number;
}

interface DefaultSVGOptions {

}

// TODO Simplify this class
export class SVGUIElement<
    ExtraOptions = DefaultSVGOptions,
    SVGNodeType extends SVGElement = SVGElement
> extends UIElement<ExtraOptions, SVGNodeType> {
    declare children?: SVGUIElement<any, any>[];

    createNode(): SVGNodeType {
        this.node = document.createElementNS("http://www.w3.org/2000/svg", this.getNodeType()) as SVGNodeType;
        applyDebugFlags(this);
        return this.node;
    }

    getNodeType(): SVGTagType {
        return this.options?.nodeType || "div";
    }

    getScreenCoordinatedForPoint(point: Point): Point {
        const {node} = this;
        // TODO: this is a good argument to always keep a reference to the Stem element in the nodes
        const svgNode = node.ownerSVGElement || node as SVGSVGElement;

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

    getMouseCoordinatesForEvent(event: Event = window.event): Point {
        return this.getScreenCoordinatedForPoint({x: Device.getEventX(event), y: Device.getEventY(event)});
    }

    saveState() {
        let state = {};
        state.options = Object.assign({}, this.options);
        return state;
    }

    setState(state: any): void {
        debugger;
        this.setOptions(state.options);
    }

    // TODO @cleanup deprecate
    getOptionsAsNodeAttributes(): SVGNodeAttributes {
        return setObjectPrototype(this.options, SVGNodeAttributes);
    }

    instantiateNodeAttributes(): SVGNodeAttributes {
        return new SVGNodeAttributes(this.options);
    }

    translate(x: number = 0, y: number = 0): void {
        this.options.translate = "translate(" + x + "," + y + ")";
    }

    //TODO(@all) : getBoundingClientRect is unreliable, reimplement it.
    getBoundingClientRect(): BoundingRect {
        let element = this.node;
        let x = 0;
        let y = 0;
        while (element && element !== document.body) {
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

    getBBox(): DOMRect {
        return this.node.getBBox();
    }

    getHeight(): number {
        return this.getBoundingClientRect().height;
    }

    getWidth(): number {
        return this.getBoundingClientRect().width;
    }

    toFront(): void {
        const parentNode = this.node && this.node.parentElement;
        if (parentNode) {
            parentNode.removeChild(this.node);
            parentNode.appendChild(this.node);
        }
    }

    toBack(): void {
    }

    setOpacity(newOpacity: number): void {
        this.options.opacity = newOpacity;
        if (this.node) {
            this.node.setAttribute("opacity", newOpacity);
        }
    }

    setColor(color: string): void {
        this.options.color = color;
        if (this.node) {
            this.node.setAttribute("stroke", color);
            this.node.setAttribute("fill", color)
        }
    }

    remove(): void {
    }

    getSvg(): SVGUIElement {
        if (this.getNodeType() == "svg") {
            return this;
        }
        return (this.parent as SVGUIElement).getSvg();
    }
}

SVGUIElement.domAttributesMap = new DOMAttributesMap(UI.Element.domAttributesMap, [
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

// Keep a map for every base class, and for each base class keep a map for each nodeType, to cache classes
const svgPrimitiveMap: WeakMap<typeof SVGUIElement, Map<string, typeof SVGUIElement<any>>> = new WeakMap();

export function SVGPrimitive<ExtraOptions = void, T extends keyof SVGElementTagNameMap = keyof SVGElementTagNameMap>(nodeType: T, BaseClass: typeof SVGUIElement = SVGUIElement): typeof SVGUIElement<ExtraOptions & Partial<SVGElementTagNameMap[T]>, SVGElementTagNameMap[T]> {
    let baseClassPrimitiveMap = svgPrimitiveMap.get(BaseClass);
    if (!baseClassPrimitiveMap) {
        baseClassPrimitiveMap = new Map();
        svgPrimitiveMap.set(BaseClass, baseClassPrimitiveMap);
    }
    let resultClass = baseClassPrimitiveMap.get(nodeType);
    if (resultClass) {
        return resultClass as any;
    }
    resultClass = class SVGPrimitive extends BaseClass<ExtraOptions & Partial<SVGElementTagNameMap[T]>, SVGElementTagNameMap[T]> {
        declare node?: SVGElementTagNameMap[T];
        
        getNodeType(): T {
            return nodeType;
        }
        
        createNode(): SVGElementTagNameMap[T] {
            this.node = document.createElementNS("http://www.w3.org/2000/svg", nodeType) as SVGElementTagNameMap[T];
            applyDebugFlags(this);
            return this.node;
        }
    };
    baseClassPrimitiveMap.set(nodeType, resultClass);
    return resultClass as any;
}

export const SVG = {
    Element: SVGUIElement,
    Primitive: SVGPrimitive,
};

UI.SVGElement = SVGUIElement;