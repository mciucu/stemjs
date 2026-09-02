// createElement collects a tag's children into an array whatever spelling they arrive in - none, one, several,
// or an array already - so options.children always holds an array, and an element that mutates it in place is
// right to declare it as one. TypeScript counts the children written in the tag instead, from React's
// convention that a lone child is passed through as itself, and so checks a single child against the whole
// prop rather than against one of its entries. How many children are written says nothing about what the prop
// ends up holding, which is the rule stated here. The child is still checked - against the entry type, which
// is what it becomes - so a child the prop can't hold reports as it did.

const {usesStemJsx} = require("./transform");

// The same mismatch, reported differently depending on where it is caught: on the tag when the prop is a plain
// array type, on the child when strictNullChecks leaves an optional prop a union, and 2747 when it is text
const SINGLE_CHILD_AGAINST_WHOLE_PROP = new Set([2322, 2745, 2747]);

// JSX.ElementChildrenAttribute, which stem declares as `children`
const CHILDREN_PROP = "children";

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

// The element a children diagnostic is about: it is anchored either on the opening tag's name or on the child
function elementFromAnchor(ts, sourceFile, position) {
    for (let node = innermostNodeAt(ts, sourceFile, position); node && node.parent; node = node.parent) {
        const {parent} = node;
        if (ts.isJsxOpeningElement(parent) && parent.tagName === node && ts.isJsxElement(parent.parent)) {
            return parent.parent;
        }
        if (ts.isJsxElement(parent) && parent.children.indexOf(node) >= 0) {
            return parent;
        }
    }
    return null;
}

// The children the tag actually writes: JSX text that is only line breaks and indentation is not one
function writtenChildren(ts, element) {
    return element.children.filter(child => !(ts.isJsxText(child) && child.containsOnlyTriviaWhiteSpaces));
}

function getChildrenPropType(ts, checker, element) {
    const attributes = checker.getContextualType(element.openingElement.attributes);
    const children = attributes && checker.getPropertyOfType(attributes, CHILDREN_PROP);
    if (!children) {
        return null;
    }
    // An optional prop is a union with undefined, which no array's entry type survives
    return checker.getNonNullableType(checker.getTypeOfSymbolAtLocation(children, element));
}

// Whether the one child written fits the prop - as one of its entries, or as the whole of it if it is a list
function childFits(ts, checker, child, propType) {
    // An empty {} or a lone comment carries no expression, so there is nothing to check
    const expression = ts.isJsxExpression(child) ? child.expression : child;
    if (!expression) {
        return false;
    }
    const entryType = checker.getIndexTypeOfType(propType, ts.IndexKind.Number);
    if (!entryType) {
        return false;
    }
    const childType = checker.getTypeAtLocation(expression);
    return checker.isTypeAssignableTo(childType, entryType) || checker.isTypeAssignableTo(childType, propType);
}

// Whether this diagnostic is TypeScript counting children where createElement collects them anyway
function isCollectedChild(ts, checker, diagnostic, options) {
    if (!SINGLE_CHILD_AGAINST_WHOLE_PROP.has(diagnostic.code) || !diagnostic.file || !usesStemJsx(options)) {
        return false;
    }
    const element = elementFromAnchor(ts, diagnostic.file, diagnostic.start);
    if (!element) {
        return false;
    }
    const children = writtenChildren(ts, element);
    if (children.length !== 1) {
        return false;
    }
    const propType = getChildrenPropType(ts, checker, element);
    return Boolean(propType) && childFits(ts, checker, children[0], propType);
}

module.exports = {isCollectedChild};
