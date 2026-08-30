import {SVGPrimitive, SVGUIElement, type SVGPrimitiveOptions} from "./SVGBase";
import {DOMAttributesMap, NodeAttributes} from "../NodeAttributes";
import {UI, TextUIElement, type ExtendedOptions} from "../UIBase";
import {type Point} from "../../numerics/StemMath";

interface SVGTextOptions {
    // Stringified on render, so a number is as good as the string it becomes
    text?: string | number;
    fontFamily?: string;
    fontSize?: string | number;
    fontStyle?: string;
    color?: string;
    textAnchor?: string;
    selectable?: boolean;
    x?: number;
    y?: number;
}

export class SVGText extends SVGPrimitive("text") {
    declare options: SVGPrimitiveOptions<"text"> & SVGTextOptions;

    declare textElement: TextUIElement;
    static domAttributesMap = new DOMAttributesMap(SVGUIElement.domAttributesMap, [
        ["dx"],
        ["dy"],
        ["fontFamily", {domName: "font-family"}],
        ["fontSize", {domName: "font-size"}],
        ["fontStyle", {domName: "font-style"}],
        ["textAnchor", {domName: "text-anchor"}]
    ]);

    getDefaultOptions(options?: any): Partial<any> {
        return {
            text: "",
            fontSize: "15px",
            color: "black",
            dy: "0.35em",
            textAnchor: "middle",
            selectable: false
        };
    }

    extraNodeAttributes(attr: NodeAttributes): void {
        // TODO: For some reason, still selectable in mozilla...
        if (!this.options.selectable) {
            attr.setStyle("userSelect", "none");
        }
    }

    render() {
        return [UI.createElement(UI.TextElement, {ref: "textElement", value: this.options.text + ""})];
    }

    getX(): number | undefined {
        return this.options.x;
    }

    setX(x: number): void {
        this.options.x = x;
        this.node.setAttribute("x", String(this.options.x));
    }

    getY(): number | undefined {
        return this.options.y;
    }

    setY(y: number): void {
        this.options.y = y;
        this.node.setAttribute("y", String(this.options.y));
    }

    setText(text: string | number): void {
        this.options.text = text;
        this.textElement.setValue(text + "");
    }

    getText(): string | number | undefined {
        return this.options.text;
    }

    setPosition(p: Point): void {
        this.setX(p.x);
        this.setY(p.y);
    }

    getColor(): string | undefined {
        return this.options.color;
    }

    setColor(color: string, fillOnly: boolean = false): void {
        this.options.color = color;
        if (this.node) {
            this.node.setAttribute("fill", color);
            if (!fillOnly) {
                this.node.setAttribute("stroke", color);
            }
        }
    }
}
