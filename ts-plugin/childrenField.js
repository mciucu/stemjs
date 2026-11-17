// A component that declares a field named `children` replaces the element's own child list, which redraw() keeps there:
// what it holds is then taken for the drawn children, or overwritten by the next redraw. TypeScript accepts it whenever the
// field's type fits the base's, so the plugin reports it, where the field is declared.

const path = require("path");

const CHILDREN_FIELD = 99002;

// Stem's own sources: the base class whose child list is at stake is declared there
const STEM_ROOT = path.resolve(__dirname, "..") + path.sep;

function isStemDeclaration(declaration) {
    return path.resolve(declaration.getSourceFile().fileName).startsWith(STEM_ROOT);
}

// The `children` of a class's base, when Stem declares it there
function basesStemChildren(ts, checker, classNode) {
    const type = checker.getTypeAtLocation(classNode);
    for (const base of checker.getBaseTypes(type) || []) {
        const member = base.getProperty("children");
        if (member && (member.declarations || []).some(isStemDeclaration)) {
            return true;
        }
    }
    return false;
}

function childrenFieldDiagnostics(ts, checker, sourceFile) {
    const found = [];
    const visit = node => {
        if ((ts.isClassDeclaration(node) || ts.isClassExpression(node)) && node.heritageClauses) {
            for (const member of node.members) {
                // `declare children: …` only narrows the type: it emits nothing, so it replaces nothing
                const declared = ts.isPropertyDeclaration(member) && (ts.getModifiers(member) || []).some(modifier => modifier.kind === ts.SyntaxKind.DeclareKeyword);
                const named = (ts.isPropertyDeclaration(member) || ts.isGetAccessorDeclaration(member) || ts.isSetAccessorDeclaration(member))
                    && !declared && member.name && ts.isIdentifier(member.name) && member.name.text === "children";
                if (named && basesStemChildren(ts, checker, node)) {
                    found.push({
                        category: ts.DiagnosticCategory.Error,
                        code: CHILDREN_FIELD,
                        file: sourceFile,
                        start: member.name.getStart(sourceFile),
                        length: member.name.getWidth(sourceFile),
                        messageText: "A field named children replaces the element's own child list, which redraw() keeps there: name it otherwise.",
                    });
                }
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(sourceFile);
    return found;
}

module.exports = {CHILDREN_FIELD, childrenFieldDiagnostics};
