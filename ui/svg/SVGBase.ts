import {SVGTagType, UI, UIElement} from "../UIBase";
import {DOMAttributesMap} from "../NodeAttributes";
import {setObjectPrototype} from "../../base/Utils";
import {SVGNodeAttributes} from "./SVGNodeAttributes";
import {Device} from "../../base/Device";
import {applyDebugFlags} from "../UIBase";
import {Point} from "../../numerics/StemMath";


interface BoundingRect {
    top: number;
    left: number;
    width: number;
    bottom: number;
    height: number;
    right: number;
}

// Mirrors the attributes registered in SVGUIElement.domAttributesMap below
// What an svg node may hold: svg nodes, foreignObject aside. Shaped like UIChild so that nesting an
// array of children still works - intersecting with a flat array collapses the iterable arm
export type SVGChild = Iterable<SVGChild> | SVGUIElement | string | number | null | undefined | false;

export interface SVGOptions {
    children?: SVGChild;
    fill?: string;
    stroke?: string;
    strokeWidth?: number | string;
    strokeDasharray?: number | string;
    strokeLinecap?: string;
    stopColor?: string;
    clipPath?: string;
    opacity?: number | string;
    transform?: string;
    viewBox?: string;
    offset?: number | string;
    dx?: number | string;
    dy?: number | string;
    // Every one of these reaches the node through setAttribute, which takes either spelling
    width?: number | string;
    height?: number | string;
    x?: number | string;
    y?: number | string;
    x1?: number | string;
    y1?: number | string;
    x2?: number | string;
    y2?: number | string;
    cx?: number | string;
    cy?: number | string;
    rx?: number | string;
    ry?: number | string;
    // Written by translate() and setColor(), which have no attribute of their own
    translate?: string;
    color?: string;
}

// TODO Simplify this class
export class SVGUIElement<
    ExtraOptions = {},
    SVGNodeType extends SVGElement = SVGElement
> extends UIElement<ExtraOptions & SVGOptions, SVGNodeType, SVGTagType> {
    declare children: SVGUIElement<any, any>[];

    createNode(): SVGNodeType {
        this.node = document.createElementNS("http://www.w3.org/2000/svg", this.getNodeType()) as SVGNodeType;
        applyDebugFlags(this);
        return this.node;
    }

    getNodeType(): SVGTagType {
        // TODO "div" is not an SVG tag, and createElementNS renders nothing for it
        return this.options?.nodeType || "div" as SVGTagType;
    }


    getScreenCoordinatedForPoint(point: Point): Point {
        const {node} = this;
        // TODO: this is a good argument to always keep a reference to the Stem element in the nodes
        const svgNode = node.ownerSVGElement || node as unknown as SVGSVGElement;

        if (svgNode.createSVGPoint) {
            // Using native SVG transformations
            // See https://msdn.microsoft.com/en-us/library/hh535760(v=vs.85).aspx
            let svgPoint = svgNode.createSVGPoint();
            svgPoint.x = point.x;
            svgPoint.y = point.y;
            return svgPoint.matrixTransform((node as unknown as SVGGraphicsElement).getScreenCTM().inverse());
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
        let state: any = {};
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
        let element: Element | null = this.node;
        let x = 0;
        let y = 0;
        while (element && element !== document.body) {
            x -= element.scrollLeft;
            y -= element.scrollTop;
            element = (element as HTMLElement).offsetParent || element.parentNode as Element;
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
        return (this.node as unknown as SVGGraphicsElement).getBBox();
    }

    getHeight(): number {
        return this.getBoundingClientRect().height;
    }

    getWidth(): number {
        return this.getBoundingClientRect().width;
    }

    toFront(): void {
        const parentNode = this.node?.parentElement;
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
            this.node.setAttribute("opacity", String(newOpacity));
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
        return (this.parent as unknown as SVGUIElement).getSvg();
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

// The members SVGOptions replaces, the same ones NodeOptions keeps out - a node's own style or
// children would intersect with the option's rather than replace it
type SVGNodeOptions<T extends keyof SVGElementTagNameMap> =
    Omit<Partial<SVGElementTagNameMap[T]>, keyof SVGOptions | "children" | "style" | "title" | "nodeType">;

// The options a primitive on this tag ends up with, before its own are added: what a class that lets
// SVGPrimitive infer the tag cannot reach back for - see Backlog item 5
export type SVGPrimitiveOptions<T extends keyof SVGElementTagNameMap> =
    NonNullable<SVGUIElement<SVGNodeOptions<T>, SVGElementTagNameMap[T]>["options"]>;

// Keep a map for every base class, and for each base class keep a map for each nodeType, to cache classes
const svgPrimitiveMap: WeakMap<typeof SVGUIElement, Map<string, typeof SVGUIElement<any>>> = new WeakMap();

export function SVGPrimitive<ExtraOptions = {}, T extends keyof SVGElementTagNameMap = keyof SVGElementTagNameMap>(nodeType: T, BaseClass: typeof SVGUIElement = SVGUIElement): typeof SVGUIElement<ExtraOptions & SVGNodeOptions<T>, SVGElementTagNameMap[T]> {
    let baseClassPrimitiveMap = svgPrimitiveMap.get(BaseClass);
    if (!baseClassPrimitiveMap) {
        baseClassPrimitiveMap = new Map();
        svgPrimitiveMap.set(BaseClass, baseClassPrimitiveMap);
    }
    let resultClass = baseClassPrimitiveMap.get(nodeType);
    if (resultClass) {
        return resultClass as any;
    }
    resultClass = class SVGPrimitive extends BaseClass<ExtraOptions & Omit<Partial<SVGElementTagNameMap[T]>, keyof SVGOptions | "children" | "style" | "title" | "nodeType">, SVGElementTagNameMap[T]> {
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

UI.SVGElement = SVGUIElement;
