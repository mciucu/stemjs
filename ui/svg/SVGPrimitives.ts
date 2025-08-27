import {SVG, SVGPrimitive, SVGUIElement} from "./SVGBase";
import * as math from "../../numerics/math";

export class SVGRoot extends SVGPrimitive("svg") {
}

export class RawSVG extends SVGRoot {
    redraw(): boolean {
        super.redraw();
        this.node.innerHTML = this.options.innerHTML;
        return true;
    }
}

export class SVGGroup extends SVGPrimitive("g") {
    setColor(color: string): void {
        for (let i = 0; i < this.children.length; i += 1) {
            this.children[i].setColor(color);
        }
    }
}

export class SVGPath extends SVGPrimitive("path") {
    getDefaultOptions(options?: any): Partial<any> {
        return {
            d: ""
        }
    }

    getNodeAttributes() {
        let attr = super.getNodeAttributes();
        attr.setAttribute("d", this.getPath());
        return attr;
    }

    getPath(): string {
        return this.options.d;
    }

    setPath(newPath: string): void {
        this.options.d = newPath;
        this.node.setAttribute("d", this.options.d);
    }

    getLength(): number {
        return (this.node as SVGPathElement).getTotalLength();
    }

    getPointAtLength(len: number): DOMPoint {
        return (this.node as SVGPathElement).getPointAtLength(len);
    }

    getPointAtLengthWithAngle(len: number): {x: number, y: number, alpha: number} {
        let totalLength = this.getLength();
        let epsilon: number;
        if (totalLength <= 1) {
            epsilon = totalLength / 1000;
        } else {
            epsilon = Math.min(totalLength / 1000, Math.log(totalLength), 1);
        }
        let p1 = this.getPointAtLength(len);
        let p2 = this.getPointAtLength(Math.min(len + epsilon, totalLength));
        let p3 = this.getPointAtLength(Math.max(len - epsilon, 0));
        return {
            x: p1.x,
            y: p1.y,
            alpha: 180 * Math.atan2(p3.y - p2.y, p3.x - p2.x) / Math.PI
        };
    }
}

export class SVGCircle extends SVGPrimitive("circle") {
    getDefaultOptions(options?: any): Partial<any> {
        return {
            radius: 0,
            center: {x: 0, y: 0}
        };
    }

    getNodeAttributes() {
        let attr = super.getNodeAttributes();
        attr.setAttribute("r", this.options.radius);
        attr.setAttribute("cx", this.options.center.x);
        attr.setAttribute("cy", this.options.center.y);
        return attr;
    }

    getRadius(): number {
        return this.options.radius;
    }

    setRadius(radius: number): void {
        this.options.radius = radius;

        this.setAttribute("r", radius);
    }

    setCenter(x: number, y: number): void {
        this.options.center.x = x;
        this.options.center.y = y;

        this.setAttribute("cx", x);
        this.setAttribute("cy", y);
    }

    getCenter(): math.Point {
        return this.options.center;
    }

    toPath(): SVGPath {
        let r = this.options.radius;
        let cx = this.options.center.x;
        let cy = this.options.center.y;
        let pathString = "M" + (cx - r) + " " + cy +            // Starting point is W
                "a" + r + " " + r + " 0 0 1 " + r + " " + (-r) +    // Move to N
                "a" + r + " " + r + " 0 0 1 " + r + " " + r +       // Move to E
                "a" + r + " " + r + " 0 0 1 " + (-r) + " " + r +    // Move to S
                "a" + r + " " + r + " 0 0 1 " + (-r) + " " + (-r);  // Finally, move back to W
        return new SVGPath({d: pathString});
    }
}

export class SVGCircleArc extends SVGPath {
    getPath(): string {
        let startAngle = this.options.startAngle;
        let endAngle = this.options.endAngle;
        let radius = this.options.radius;
        let center = this.options.center;

        var angleDiff = endAngle - startAngle + (endAngle < startAngle ? (2 * Math.PI) : 0);
        var startPoint = math.polarToCartesian(startAngle, radius, center);
        var endPoint = math.polarToCartesian(endAngle, radius, center);
        var sweepFlag: number;
        var largeArcFlag: number;

        // Set largeArcFlag and sweepFlag
        if (angleDiff <= Math.PI) {
            largeArcFlag = 0;
            if (math.crossProduct(startPoint, endPoint, center) <= 0) {
                sweepFlag = 0;
            } else {
                sweepFlag = 1;
            }
        } else {
            largeArcFlag = 1;
            if (math.crossProduct(startPoint, endPoint, center) <= 0) {
                sweepFlag = 1;
            } else {
                sweepFlag = 0;
            }
        }

        return "M " + startPoint.x + " " + startPoint.y +
            " A " + radius + " " + radius + " 0 " + largeArcFlag + " " + sweepFlag + " " +
            endPoint.x + " " + endPoint.y;
    }
}

export class SVGRect extends SVGPrimitive("rect") {
    getX(): number {
        return this.options.x;
    }

    setX(x: number): void {
        this.options.x = x;
        this.node.setAttribute("x", this.options.x);
    }

    getY(): number {
        return this.options.y;
    }

    setY(y: number): void {
        this.options.y = y;
        this.node.setAttribute("y", this.options.y);
    }

    getWidth(): number {
        return this.options.width;
    }

    setWidth(width: number): void {
        this.options.width = width;
        this.node.setAttribute("width", this.options.width);
    }

    getHeight(): number {
        return this.options.height;
    }

    setHeight(height: number): void {
        this.options.height = height;
        this.node.setAttribute("height", this.options.height);
    }
}

export class SVGLine extends SVGPrimitive("line") {
    getDefaultOptions(options?: any): Partial<any> {
        return {
            fill: "black",
            stroke: "black"
        };
    }

    //TODO(@all): Make the getters for x1, y1, x2, y2

    setLine(x1: number, y1: number, x2: number, y2: number): void {
        this.options.x1 = x1;
        this.options.y1 = y1;
        this.options.x2 = x2;
        this.options.y2 = y2;

        this.setAttribute("x1", x1);
        this.setAttribute("y1", y1);
        this.setAttribute("x2", x2);
        this.setAttribute("y2", y2);
    }
}

export class Polygon extends SVGPath {
    getDefaultOptions(options?: any): Partial<any> {
        return {
            points: []
        };
    }

    getNodeAttributes() {
        let attr = super.getNodeAttributes();
        attr.setAttribute("d", this.getPolygonPath());
        return attr;
    }

    getPolygonPath(): string {
        let pathString = "";
        for (let i = 0; i < this.options.points.length; ++i) {
            if (i == 0) {
                pathString += "M ";
            }
            else {
                pathString += "L ";
            }
            pathString += this.options.points[i].x + " " + this.options.points[i].y + " ";
        }
        pathString += "Z";
        return pathString;
    }
}

SVG.Circle = SVGCircle;
SVG.Path = SVGPath;
SVG.Group = SVGGroup;
SVG.Line = SVGLine;
SVG.Rect = SVGRect;