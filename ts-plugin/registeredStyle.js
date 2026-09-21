// registerStyle replaces the sheet a class reads, it doesn't extend the one its base registered. So a
// subclass that registers a sheet of its own has a styleSheet of an unrelated type, and TypeScript reports
// the class as an incompatible override - the one thing a subclass doing exactly what the decorator is for
// always trips over. The rule is stated here instead: a sheet that doesn't extend the base's is a
// replacement, and replacing it is not overriding it.
//
// A sheet that *does* extend the base's is a genuine override, and then the check is the one that catches a
// rule redeclared with the wrong shape - `clickable = {}` over an inherited `StyleRuleObject` - so it is left
// to report. Only the styleSheet member is answered for either way: a class that also disagrees about
// something else reports as it did.

const {getRegisteredStyle} = require("./transform");

// Class '{0}' incorrectly extends base class '{1}'., and the single reason we answer for
const CLASS_EXTENDS_ERROR = 2415;
const PROPERTY_TYPES_ERROR = 2326;
const STYLE_MEMBER = "styleSheet";

function classDeclaredAt(ts, sourceFile, position) {
    let found = null;
    const visit = (node) => {
        if (found) {
            return;
        }
        if (ts.isClassLike(node) && node.name && node.name.getStart(sourceFile) === position) {
            found = node;
            return;
        }
        ts.forEachChild(node, visit);
    };
    ts.forEachChild(sourceFile, visit);
    return found;
}

// The one property the two classes disagree about, or null when there is more than one. The name is read
// back out of the message rather than off a node: it is the only place TypeScript says which one it picked,
// and it stays quoted in every locale
function soleIncompatibleProperty(chain) {
    if (typeof chain === "string" || !chain.next || chain.next.length !== 1) {
        return null;
    }
    const [incompatible] = chain.next;
    if (incompatible.code !== PROPERTY_TYPES_ERROR) {
        return null;
    }
    const quoted = /'([^']+)'/.exec(String(incompatible.messageText));
    return quoted && quoted[1];
}

// The sheet a styleSheet member stands for: StyleRules<T> keeps T as its alias argument, which is the class
// the sheet was registered from
function sheetOf(checker, type) {
    const property = type && checker.getPropertyOfType(type, STYLE_MEMBER);
    const declaration = property && (property.valueDeclaration || (property.declarations || [])[0]);
    if (!declaration) {
        return null;
    }
    const {aliasTypeArguments} = checker.getTypeOfSymbolAtLocation(property, declaration);
    return aliasTypeArguments && aliasTypeArguments.length === 1 ? aliasTypeArguments[0] : null;
}

function extendsSheet(type, target) {
    if (type === target) {
        return true;
    }
    return (type.getBaseTypes ? type.getBaseTypes() || [] : []).some(base => extendsSheet(base, target));
}

// Whether this diagnostic is TypeScript objecting to a class registering a sheet of its own
function isRegisteredStyleReplacement(ts, checker, diagnostic) {
    if (diagnostic.code !== CLASS_EXTENDS_ERROR || !diagnostic.file) {
        return false;
    }
    if (soleIncompatibleProperty(diagnostic.messageText) !== STYLE_MEMBER) {
        return false;
    }
    const classNode = classDeclaredAt(ts, diagnostic.file, diagnostic.start);
    // Only a member we declared from a decorator is ours to answer for
    if (!classNode || !getRegisteredStyle(ts, classNode, diagnostic.file)) {
        return false;
    }
    const instanceType = checker.getDeclaredTypeOfSymbol(checker.getSymbolAtLocation(classNode.name));
    const sheet = sheetOf(checker, instanceType);
    const baseSheets = (instanceType.getBaseTypes() || []).map(base => sheetOf(checker, base));
    if (!sheet || baseSheets.some(baseSheet => !baseSheet)) {
        return false;
    }
    return !baseSheets.some(baseSheet => extendsSheet(sheet, baseSheet));
}

module.exports = {isRegisteredStyleReplacement};
