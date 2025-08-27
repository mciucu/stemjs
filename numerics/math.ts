// TODO: this whole file is mostly here to not break compatibility with pre-Stem code, need refactoring

export interface Point {
    x: number;
    y: number;
}

export interface Line {
    a: number;
    b: number;
    c: number;
}

export interface Circle extends Point {
    r: number;
}

export type Vector = Point;

export const EPS = 1e-6;

// Check if a value is equal to zero. Use epsilon check.
export function isZero(val: number, epsilon: number = EPS): boolean {
    return (Math.abs(val) < epsilon);
}

// Simulate C/C++ rand() function
export function rand(mod: number): number {
    return Math.floor(Math.random() * mod);
}

export function equal(val1: number, val2: number, epsilon: number = EPS): boolean {
    return isZero(val1 - val2, epsilon);
}

export function equalPoints(p1: Point, p2: Point, epsilon: number = EPS): boolean {
    return isZero(p1.x - p2.x, epsilon) && isZero(p1.y - p2.y, epsilon);
}

// Compute square of a number
export function sqr(x: number): number {
    return x * x;
}

// Compute the distance between 2 points
export function distance(p1: Point, p2: Point): number {
    return Math.sqrt(sqr(p1.x - p2.x) + sqr(p1.y - p2.y));
}

export function signedDistancePointLine(point: Point, line: Line): number {
    return (line.a * point.x + line.b * point.y + line.c) / Math.sqrt(sqr(line.a) + sqr(line.b));
}

export function distancePointLine(point: Point, line: Line): number {
    return Math.abs(signedDistancePointLine(point, line));
}

export function pointOnSegment(point: Point, segmentStart: Point, segmentEnd: Point, epsilon?: number): boolean {
    epsilon = epsilon || EPS;
    return Math.abs(distance(point, segmentStart) + distance(point, segmentEnd) -
        distance(segmentStart, segmentEnd)) <= epsilon;
}

export function perpendicularFoot(point: Point, line: Line): Point {
    const dist = (line.a * point.x + line.b * point.y + line.c) / (sqr(line.a) + sqr(line.b));
    return {
        x: point.x - line.a * dist,
        y: point.y - line.b * dist
    };
}

export function lineEquation(A: Point, B: Point): Line {
    return {
        a: B.y - A.y,
        b: A.x - B.x,
        c: A.y * B.x - A.x * B.y
    };
}

// Compute angle between 2 points in grad
export function angleGrad(p1: Point, p2: Point): number {
    return gradian(angleRad(p1, p2));
}

// Transform gradian in radian
export function radian(angle: number): number {
    return angle * Math.PI / 180;
}

// Transform radian in gradian
export function gradian(angle: number): number {
    return angle * 180 / Math.PI;
}

// Compute angle between 2 points in rad
export function angleRad(p1: Point, p2: Point = { x: 0, y: 0 }): number {
    return Math.atan2(p1.y - p2.y, p1.x - p2.x);
}

// TODO: lots of these should be methods of the point class, not global functions
export function crossProduct(p1: Point, p2: Point, p0: Point = { x: 0, y: 0 }): number {
    return (p1.x - p0.x) * (p2.y - p0.y) - (p1.y - p0.y) * (p2.x - p0.x);
}

export function rotatePoint(point: Point, angle: number, orig: Point = { x: 0, y: 0 }): Point {
    return {
        x: Math.cos(angle) * (point.x - orig.x) - Math.sin(angle) * (point.y - orig.y) + orig.x,
        y: Math.sin(angle) * (point.x - orig.x) + Math.cos(angle) * (point.y - orig.y) + orig.y
    };
}

export function translatePoint(point: Point, dx: number, dy: number): Point {
    return {
        x: point.x + dx,
        y: point.y + dy
    };
}

export function scalePoint(point: Point, orig: Point, sx: number, sy?: number): Point {
    sy = sy || sx;
    return {
        x: (point.x - orig.x) * sx + orig.x,
        y: (point.y - orig.y) * sy + orig.y
    };
}

export function polarToCartesian(angle: number, radius: number, orig: Point = { x: 0, y: 0 }): Point {
    return {
        x: radius * Math.cos(angle) + orig.x,
        y: radius * Math.sin(angle) + orig.y
    };
}

export function circlesIntersection(circle1: Circle, circle2: Circle): Point[] {
    const centerDistance = distance(circle1, circle2);
    if (centerDistance > circle1.r + circle2.r) {
        return [];
    }

    // TODO(@all) These vars are magic. Find out what they do and add comments
    const l = (sqr(circle1.r) - sqr(circle2.r) + sqr(centerDistance)) / (2 * centerDistance);
    if (sqr(circle1.r) - sqr(l) < 0) {
        return [];
    }

    const h = Math.sqrt(sqr(circle1.r) - sqr(l));

    return [{
        x: l / centerDistance * (circle2.x - circle1.x) + h / centerDistance * (circle2.y - circle1.y) + circle1.x,
        y: l / centerDistance * (circle2.y - circle1.y) - h / centerDistance * (circle2.x - circle1.x) + circle1.y
    }, {
        x: l / centerDistance * (circle2.x - circle1.x) - h / centerDistance * (circle2.y - circle1.y) + circle1.x,
        y: l / centerDistance * (circle2.y - circle1.y) + h / centerDistance * (circle2.x - circle1.x) + circle1.y
    }];
}

export function bound(value: number, minValue: number, maxValue: number): number {
    if (value < minValue) {
        return minValue;
    }
    if (value > maxValue) {
        return maxValue;
    }
    return value;
}

export function getVector(startPoint: Point, endPoint: Point): Vector {
    return {
        x: endPoint.x - startPoint.x,
        y: endPoint.y - startPoint.y
    };
}

export function vectorLength(vector: Vector): number {
    return distance({ x: 0, y: 0 }, vector);
}

export function normalizeVector(vector: Vector): Vector {
    const len = vectorLength(vector);
    if (Math.abs(len) < EPS) {
        return {
            x: 0,
            y: 0
        };
    }
    return {
        x: vector.x / len,
        y: vector.y / len
    };
}

export function scaleVector(vector: Vector, scalar: number): Vector {
    return {
        x: vector.x * scalar,
        y: vector.y * scalar
    };
}

export function addVectors(vector1: Vector, vector2: Vector): Vector {
    return {
        x: vector1.x + vector2.x,
        y: vector1.y + vector2.y
    };
}

export function subtractVectors(vector1: Vector, vector2: Vector): Vector {
    return {
        x: vector1.x - vector2.x,
        y: vector1.y - vector2.y
    };
}

export function triangleArea(point1: Point, point2: Point, point3: Point): number {
    return 0.5 * Math.abs(crossProduct(point1, point2, point3));
}

export function inRange(value: number, minValue: number, maxValue: number): boolean {
    if (isNaN(value)) {
        return false;
    }
    return minValue <= value && value <= maxValue;
}

export function interpolationValue(interpolationArray: Point[], X: number): number {
    let Y = 0;

    for (let i = 0; i < interpolationArray.length; i += 1) {
        if (interpolationArray[i].x === X) {
           return interpolationArray[i].y;
        }
    }
    for (let i = 0; i < interpolationArray.length; i += 1) {
        let aux = interpolationArray[i].y;
        for (let j = 0; j < interpolationArray.length; j += 1) {
            if (i !== j) {
                aux = aux * (X - interpolationArray[j].x) / (interpolationArray[i].x - interpolationArray[j].x);
            }
        }
        Y += aux;
    }

    return Y;
}