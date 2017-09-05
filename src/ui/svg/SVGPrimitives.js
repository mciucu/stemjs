import {SVG} from "./SVGBase";
import * as math from "../../math";

SVG.SVGRoot = class SVGRoot extends SVG.Element {
    getNodeType() {
        return "svg";
    }

    getSvg() {
        return this;
    }
};

SVG.RawSVG = class RawSVG extends SVG.SVGRoot {
    redraw() {
        super.redraw();
        this.node.innerHTML = this.options.innerHTML;
    }
};

SVG.Group = class SVGGroup extends SVG.Element {
    getNodeType() {
        return "g";
    }

    setColor(color) {
        for (let i = 0; i < this.children.length; i += 1) {
            this.children[i].setColor(color);
        }
    }
};

SVG.Defs = class SVGDefs extends SVG.Element {
    getNodeType() {
        return "defs";
    }
};

SVG.ClipPath = class ClipPath extends SVG.Element {
    getNodeType() {
        return "clipPath";
    }
};

SVG.Path = class SVGPath extends SVG.Element {
    getNodeType() {
        return "path";
    }

    getDefaultOptions() {
        return {
            d: ""
        }
    }

    getNodeAttributes() {
        let attr = super.getNodeAttributes();
        attr.setAttribute("d", this.getPath());
        return attr;
    }

    getPath() {
        return this.options.d;
    }

    setPath(newPath) {
        this.options.d = newPath;
        this.node.setAttribute("d", this.options.d);
    }

    getLength() {
        return this.node.getTotalLength();
    }

    getPointAtLength(len) {
        return this.node.getPointAtLength(len);
    }

    getPointAtLengthWithAngle(len) {
        let totalLength = this.getLength();
        let epsilon;
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
};

SVG.Circle = class SVGCircle extends SVG.Element {
    getNodeType() {
        return "circle";
    }

    getDefaultOptions() {
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

    getRadius() {
        return this.options.radius;
    }

    setRadius(radius) {
        this.options.radius = radius;

        this.setAttribute("r", radius);
    }

    setCenter(x, y) {
        this.options.center.x = x;
        this.options.center.y = y;

        this.setAttribute("cx", x);
        this.setAttribute("cy", y);
    }

    getCenter() {
        return this.options.center;
    }

    toPath() {
        let r = this.options.radius;
        let cx = this.options.center.x;
        let cy = this.options.center.y;
        let pathString = "M" + (cx - r) + " " + cy +            // Starting point is W
                "a" + r + " " + r + " 0 0 1 " + r + " " + (-r) +    // Move to N
                "a" + r + " " + r + " 0 0 1 " + r + " " + r +       // Move to E
                "a" + r + " " + r + " 0 0 1 " + (-r) + " " + r +    // Move to S
                "a" + r + " " + r + " 0 0 1 " + (-r) + " " + (-r);  // Finally, move back to W
        return new SVG.Path({d: pathString});
    }
};

SVG.Stop = class SVGStop extends SVG.Element {
    getNodeType() {
        return "stop";
    }
};

SVG.RadialGradient = class SVGRadialGradient extends SVG.Element {
    getNodeType() {
        return "radialGradient";
    }
};

//TODO Complete this class
SVG.Ellipse = class SVGEllipse extends SVG.Element {
    getNodeType() {
        return "ellipse";
    }
};

SVG.CircleArc = class SVGCircleArc extends SVG.Path {
    getPath() {
        let startAngle = this.options.startAngle;
        let endAngle = this.options.endAngle;
        let radius = this.options.radius;
        let center = this.options.center;

        var angleDiff = endAngle - startAngle + (endAngle < startAngle ? (2 * Math.PI) : 0);
        var startPoint = math.polarToCartesian(startAngle, radius, center);
        var endPoint = math.polarToCartesian(endAngle, radius, center);
        var sweepFlag;
        var largeArcFlag;

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
};

SVG.Rect = class SVGRect extends SVG.Element {
    getNodeType() {
        return "rect";
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

    getWidth() {
        return this.options.width;
    }

    setWidth(width) {
        this.options.width = width;
        this.node.setAttribute("width", this.options.width);
    }

    getHeight() {
        return this.options.height;
    }

    setHeight(height) {
        this.options.height = height;
        this.node.setAttribute("height", this.options.height);
    }
};

SVG.Line = class SVGLine extends SVG.Element {
    getNodeType() {
        return "line";
    }

    getDefaultOptions() {
        return {
            fill: "black",
            stroke: "black"
        };
    }

    //TODO(@all): Make the getters for x1, y1, x2, y2

    setLine(x1, y1, x2, y2) {
        this.options.x1 = x1;
        this.options.y1 = y1;
        this.options.x2 = x2;
        this.options.y2 = y2;

        this.setAttribute("x1", x1);
        this.setAttribute("y1", y1);
        this.setAttribute("x2", x2);
        this.setAttribute("y2", y2);
    }
};

SVG.Polygon = class Polygon extends SVG.Path {
    getDefaultOptions() {
        return {
            points: []
        };
    }

    getNodeAttributes() {
        let attr = super.getNodeAttributes();
        attr.setAttribute("d", this.getPolygonPath());
        return attr;
    }

    getPolygonPath() {
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

    setPoints(points) {
        this.options.points = points;
        this.setPath(this.getPolygonPath());
    }
};