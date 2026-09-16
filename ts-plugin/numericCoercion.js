// TypeScript resolves an operator against its operands' declared types and never consults valueOf, so a class
// that answers with a number - StemDate, Duration, TimeUnit - cannot be compared or multiplied without a cast.
// What the runtime does is unambiguous, so the rule is ours to state rather than to work around: an operand
// coerces if it is number-like already, or if its type declares a valueOf that returns a number.

// The left operand, the right operand, and the operator as a whole
const OPERAND_ERRORS = new Set([2362, 2363, 2365]);

// Only the operators that read their operands as numbers. `+` is left out: it concatenates just as
// readily, so an object reaching it is worth reporting even when it would coerce
const NUMERIC_OPERATORS = new Set(["-", "*", "/", "%", "**", "<", ">", "<=", ">="]);

// Both sides must share a unit here, and a bare number names none: a date less a count of seconds is off by 1000
const SAME_UNIT_OPERATORS = new Set(["-", "<", ">", "<=", ">="]);

function innermostNodeAt(ts, sourceFile, position) {
    let found = null;
    const visit = (node) => {
        if (position < node.getStart(sourceFile) || position >= node.getEnd()) {
            return;
        }
        found = node;
        ts.forEachChild(node, visit);
    };
    ts.forEachChild(sourceFile, visit);
    return found;
}

function enclosingNumericOperation(ts, node) {
    for (let current = node; current; current = current.parent) {
        if (ts.isBinaryExpression(current)) {
            const operator = current.operatorToken.getText();
            return NUMERIC_OPERATORS.has(operator) ? current : null;
        }
    }
    return null;
}

// A type whose values every arithmetic and relational operator already accepts
function isNumberLike(ts, type) {
    return Boolean(type.flags & (ts.TypeFlags.NumberLike | ts.TypeFlags.BigIntLike | ts.TypeFlags.Any | ts.TypeFlags.Enum));
}

function declaresNumericValueOf(ts, checker, type) {
    const valueOf = checker.getPropertyOfType(type, "valueOf");
    if (!valueOf || !valueOf.valueDeclaration) {
        return false;
    }
    const signatures = checker.getTypeOfSymbolAtLocation(valueOf, valueOf.valueDeclaration).getCallSignatures();
    return signatures.length > 0 && signatures.every(
        signature => isNumberLike(ts, checker.getReturnTypeOfSignature(signature))
    );
}

function coercesToNumber(ts, checker, type) {
    if (type.isUnion()) {
        return type.types.every(constituent => coercesToNumber(ts, checker, constituent));
    }
    return isNumberLike(ts, type) || declaresNumericValueOf(ts, checker, type);
}

// A number with no unit of its own; zero reads the same in any unit, and nothing is known of `any`
function isBareNumber(ts, type, operand) {
    const isZero = ts.isNumericLiteral(operand) && Number(operand.text) === 0;
    return !isZero && Boolean(type.flags & (ts.TypeFlags.NumberLike | ts.TypeFlags.BigIntLike | ts.TypeFlags.Enum));
}

// Whether this diagnostic is TypeScript objecting to an operand that the runtime reads as a number anyway
function isNumericCoercion(ts, checker, diagnostic) {
    if (!OPERAND_ERRORS.has(diagnostic.code) || !diagnostic.file) {
        return false;
    }
    const node = innermostNodeAt(ts, diagnostic.file, diagnostic.start);
    const operation = node && enclosingNumericOperation(ts, node);
    if (!operation) {
        return false;
    }
    const operands = [operation.left, operation.right];
    const types = operands.map(operand => checker.getTypeAtLocation(operand));
    if (!types.every(type => coercesToNumber(ts, checker, type))) {
        return false;
    }
    if (!SAME_UNIT_OPERATORS.has(operation.operatorToken.getText())) {
        return true;
    }
    const [leftIsBare, rightIsBare] = operands.map((operand, index) => isBareNumber(ts, types[index], operand));
    return leftIsBare === rightIsBare;
}

module.exports = {isNumericCoercion};
