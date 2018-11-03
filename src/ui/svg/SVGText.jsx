import {SVG} from "./SVGBase";
import {CreateNodeAttributesMap} from "../NodeAttributes";
import {UI} from "../UIBase";

SVG.Text = class SVGText extends SVG.Element {
    getNodeType() {
        return "text";
    }

    getDefaultOptions() {
        return {
            text: "",
            fontSize: "15px",
            color: "black",
            dy: "0.35em",
            textAnchor: "middle",
            selectable: false
        };
    }

    extraNodeAttributes(attr) {
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
        return [<UI.TextElement ref="textElement" value={this.options.text + ""} />];
    }

    getX() {
        return this.options.x;
    }

    setX(x) {
        this.options.x = x;
        this.node.setAttribute("x", this.options.x);
    }

    getY() {
        return this.options.y;
    }

    setY(y) {
        this.options.y = y;
        this.node.setAttribute("y", this.options.y);
    }

    setText(text) {
        this.options.text = text;
        this.textElement.setValue(text + "");
    }

    getText() {
        return this.options.text;
    }

    setPosition(x, y) {
        this.setX(x);
        this.setY(y);
    }

    getColor() {
        return this.options.color;
    }

    setColor(color, fillOnly=false) {
        this.options.color = color;
        if (this.node) {
            this.node.setAttribute("fill", color);
            if (!fillOnly) {
                this.node.setAttribute("stroke", color);
            }
        }
    }
};

SVG.Text.domAttributesMap = CreateNodeAttributesMap(SVG.Element.domAttributesMap, [
    ["dx"],
    ["dy"],
    ["fontFamily", {domName: "font-family"}],
    ["fontSize", {domName: "font-size"}],
    ["textAnchor", {domName: "text-anchor"}]
]);