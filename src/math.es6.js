// TODO: this whole file is mosly here to not break compatibility with pre-Stem code, need refactoring
export var EPS = 1e-6;

// Check if a value is equal to zero. Use epsilon check.
export var isZero = function (val, epsilon=EPS) {
    return (Math.abs(val) < epsilon);
};

// Simulate C/C++ rand() function
export var rand = function (mod) {
    return Math.floor(Math.random() * mod);
};

export var equal = function (val1, val2, epsilon=EPS) {
    return isZero(val1-val2, epsilon);
};

export var equalPoints = function (p1, p2, epsilon=EPS) {
    return isZero(p1.x - p2.x, epsilon) && isZero(p1.y - p2.y, epsilon);
};

// Compute square of a number
export var sqr = function (x) {
    return x * x;
};

// Compute the distance between 2 points
export var distance = function (p1, p2) {
    return Math.sqrt(sqr(p1.x - p2.x) + sqr(p1.y - p2.y));
};

export var signedDistancePointLine = function (point, line) {
    return (line.a * point.x + line.b * point.y + line.c) / Math.sqrt(sqr(line.a) + sqr(line.b));
};

export var distancePointLine = function (point, line) {
    return Math.abs(signedDistancePointLine(point, line));
};

export var pointOnSegment = function (point, segmentStart, segmentEnd, epsilon) {
    epsilon = epsilon || EPS;
    return Math.abs(distance(point, segmentStart) + distance(point, segmentEnd) -
        distance(segmentStart, segmentEnd)) <= epsilon;
};

export var perpendicularFoot = function (point, line) {
    var distance = (line.a * point.x + line.b * point.y + line.c) / (sqr(line.a) + sqr(line.b));
    return {
        x: point.x - line.a * distance,
        y: point.y - line.b * distance
    }
};

export var lineEquation = function (A, B) {
    return {
        a: B.y - A.y,
        b: A.x - B.x,
        c: A.y * B.x - A.x * B.y
    }
};

// Compute angle between 2 points in grad
export var angleGrad = function (p1, p2) {
    return gradian(angleRad(p1, p2));
};

// Transform gradian in radian
export var radian = function (angle) {
    return angle * Math.PI / 180;
};

// Transform radian in gradian
export var gradian = function (angle) {
    return angle * 180 / Math.PI;
};

// Compute angle between 2 points in rad
export var angleRad = function (p1, p2) {
    p2 = p2 || {'x': 0, 'y': 0};
    return Math.atan2(p1.y - p2.y, p1.x - p2.x);
};

// TODO: lots of these should be methods of the point class, not global functions
export var crossProduct = function (p1, p2, p0) {
    p0 = p0 || {x:0, y:0};
    return (p1.x - p0.x) * (p2.y - p0.y) - (p1.y - p0.y) * (p2.x - p0.x);
};

export var rotatePoint = function (point, orig, angle) {
    // TODO: WTF, default argument value in the middle of argument list?
    orig = orig || {x: 0, y: 0};
    return {
        x: Math.cos(angle) * (point.x - orig.x) - Math.sin(angle) * (point.y - orig.y) + orig.x,
        y: Math.sin(angle) * (point.x - orig.x) + Math.cos(angle) * (point.y - orig.y) + orig.y
    };
};

export var translatePoint = function (point, dx, dy) {
    return {
        x: point.x + dx,
        y: point.y + dy
    };
};

export var scalePoint = function (point, orig, sx, sy) {
    sy = sy || sx;
    return {
        x: (point.x - orig.x) * sx + orig.x,
        y: (point.y - orig.y) * sy + orig.y
    }
};

export var polarToCartesian = function (angle, radius, orig) {
    orig = orig || {x: 0, y: 0};
    return {
        x: radius * Math.cos(angle) + orig.x,
        y: radius * Math.sin(angle) + orig.y
    };
};

export var circlesIntersection = function (circle1, circle2) {
    var points;
    var centerDistance;
    // TODO(@all) These vars are magic. Find out what they do and add comments
    var l;
    var h;

    centerDistance = distance(circle1, circle2);
    if (centerDistance > circle1.r + circle2.r) {
        return [];
    }

    l = (sqr(circle1.r)- sqr(circle2.r) + sqr(centerDistance)) / (2 * centerDistance);
    if (sqr(circle1.r) - sqr(l) < 0) {
        return [];
    }

    h = Math.sqrt(sqr(circle1.r) - sqr(l));

    points = [];
    points.push({
        x: l / centerDistance * (circle2.x - circle1.x) + h / centerDistance * (circle2.y - circle1.y) + circle1.x,
        y: l / centerDistance * (circle2.y - circle1.y) - h / centerDistance * (circle2.x - circle1.x) + circle1.y
    });
    points.push({
        x: l / centerDistance * (circle2.x - circle1.x) - h / centerDistance * (circle2.y - circle1.y) + circle1.x,
        y: l / centerDistance * (circle2.y - circle1.y) + h / centerDistance * (circle2.x - circle1.x) + circle1.y
    });

    return points;
};

export var bound = function (value, minValue, maxValue) {
    if (value < minValue) {
        return minValue;
    }
    if (value > maxValue) {
        return maxValue;
    }
    return value;
};

export var getVector = function (startPoint, endPoint) {
    return {
        x: endPoint.x - startPoint.x,
        y: endPoint.y - startPoint.y
    };
};

export var vectorLength = function (vector) {
    return distance({x:0, y:0}, vector);
};

export var normalizeVector = function (vector) {
    let len = vectorLength(vector);
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
};

export var scaleVector = function (vector, scalar) {
    return {
        x: vector.x * scalar,
        y: vector.y * scalar
    };
};

export var addVectors = function (vector1, vector2) {
    return {
        x: vector1.x + vector2.x,
        y: vector1.y + vector2.y
    };
};

export var subtractVectors = function (vector1, vector2) {
    return {
        x: vector1.x - vector2.x,
        y: vector1.y - vector2.y
    };
};

export var triangleArea = function (point1, point2, point3) {
    return 0.5 * Math.abs(crossProduct(point1, point2, point3));
};

export var inRange = function (value, minValue, maxValue) {
    if (isNaN(value)) {
        return false;
    }
    return minValue <= value && value <= maxValue;
};

export var interpolationValue = function (interpolationArray, X) {
    var Y = 0;
    var aux;
    var i;
    var j;

    for (i = 0; i < interpolationArray.length; i += 1) {
        if (interpolationArray.x === X) {
           return interpolationArray.y;
        }
    }
    for (i = 0; i < interpolationArray.length; i += 1) {
        aux = interpolationArray[i].y;
        for (j = 0; j < interpolationArray.length; j += 1) {
            if (i !== j) {
                aux = aux * (X - interpolationArray[j].x) / (interpolationArray[i].x - interpolationArray[j].x);
            }
        }
        Y += aux;
    }

    return Y;
};
