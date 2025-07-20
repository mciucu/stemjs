import {SVG, SVGPrimitive, SVGUIElement} from "./SVGBase";
import {DOMAttributesMap, NodeAttributes} from "../NodeAttributes";
import {UI, TextUIElement} from "../UIBase";

interface SVGTextOptions {
    text?: string;
    fontSize?: string;
    color?: string;
    dy?: string;
    textAnchor?: string;
    selectable?: boolean;
    x?: number;
    y?: number;
}

export class SVGText extends SVGPrimitive<SVGTextOptions>("text") {
    declare textElement: TextUIElement;
    static domAttributesMap = new DOMAttributesMap(SVG.Element.domAttributesMap, [
        ["dx"],
        ["dy"],
        ["fontFamily", {domName: "font-family"}],
        ["fontSize", {domName: "font-size"}],
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
            attr.setStyle("-webkit-user-select", "none");
            attr.setStyle("-khtml-user-select", "none");
            attr.setStyle("-moz-user-select", "none");
            attr.setStyle("-ms-user-select", "none");
            attr.setStyle("user-select", "none");
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

    setText(text: string): void {
        this.options.text = text;
        this.textElement.setValue(text + "");
    }

    getText(): string | undefined {
        return this.options.text;
    }

    setPosition(x: number, y: number): void {
        this.setX(x);
        this.setY(y);
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

SVG.Text = SVGText;