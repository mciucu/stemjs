// Computes the type declarations that `@registerStyle(SomeStyle)` implies but that TypeScript can't infer.
//
// A class decorator is not allowed to change the type of the class it decorates (microsoft/TypeScript#4881), and
// even if it were, `this` inside the decorated body is typed from the class declaration itself, so `this.styleSheet`
// would still be the base `StyleSheet`. We work around it by appending a merged interface to the end of the file:
//
//     @registerStyle(DashboardTitleStyle)
//     export class DashboardTitle extends UI.Element {}
//     // appended, in memory only:
//     export interface DashboardTitle {get styleSheet(): InstanceType<typeof DashboardTitleStyle>;}
//
// The declaration is appended rather than inserted so that every offset in the original file stays valid, which is
// what lets the editor keep working against the unmodified text.

const STYLE_MEMBER = "styleSheet";
const DECORATOR_NAME = "registerStyle";
// Where StyleRules lives. Configurable through the tsconfig plugin entry, for projects that place stem elsewhere
const DEFAULT_STYLE_MODULE = "stem-core/ui/Style";

function getScriptKind(ts, fileName) {
    if (fileName.endsWith(".tsx")) {
        return ts.ScriptKind.TSX;
    }
    if (fileName.endsWith(".jsx")) {
        return ts.ScriptKind.JSX;
    }
    if (fileName.endsWith(".js")) {
        return ts.ScriptKind.JS;
    }
    return ts.ScriptKind.TS;
}

// Only an entity name can appear after `typeof`, so anything fancier than Foo or Foo.Bar is left alone
function isEntityName(ts, node) {
    if (ts.isIdentifier(node)) {
        return true;
    }
    return ts.isPropertyAccessExpression(node) && isEntityName(ts, node.expression) && ts.isIdentifier(node.name);
}

function getRegisteredStyle(ts, classNode, sourceFile) {
    const decorators = ts.canHaveDecorators(classNode) ? ts.getDecorators(classNode) : null;
    for (const decorator of decorators || []) {
        const {expression} = decorator;
        if (!ts.isCallExpression(expression) || !ts.isIdentifier(expression.expression)) {
            continue;
        }
        if (expression.expression.escapedText !== DECORATOR_NAME) {
            continue;
        }
        const styleArg = expression.arguments[0];
        if (styleArg && isEntityName(ts, styleArg)) {
            return styleArg.getText(sourceFile);
        }
    }
    return null;
}

// Skip classes that already say what their style sheet is, either in the class body or through a hand-written
// merged interface, so we never fight an existing annotation.
function alreadyDeclaresStyleSheet(ts, sourceFile, className, classNode) {
    const declaresMember = (members) => members.some(member => member.name && member.name.escapedText === STYLE_MEMBER);

    if (declaresMember(classNode.members)) {
        return true;
    }
    return sourceFile.statements.some(
        statement => ts.isInterfaceDeclaration(statement) &&
            statement.name.escapedText === className &&
            declaresMember(statement.members)
    );
}

function isExported(ts, node) {
    return (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0;
}

// A merged interface has to repeat the class's type parameters verbatim, or TS2428 kicks in
function getTypeParameterText(classNode, sourceFile) {
    if (!classNode.typeParameters || classNode.typeParameters.length === 0) {
        return "";
    }
    return "<" + classNode.typeParameters.map(param => param.getText(sourceFile)).join(", ") + ">";
}

// Returns the text to append to the file, or "" when there's nothing to declare
function getStyleAugmentations(ts, fileName, text, styleModule = DEFAULT_STYLE_MODULE) {
    if (!text.includes(DECORATOR_NAME)) {
        return "";
    }

    const sourceFile = ts.createSourceFile(fileName, text, ts.ScriptTarget.ESNext, true, getScriptKind(ts, fileName));
    const declarations = [];

    for (const statement of sourceFile.statements) {
        if (!ts.isClassDeclaration(statement) || !statement.name) {
            continue;
        }
        const className = statement.name.escapedText;
        const styleName = getRegisteredStyle(ts, statement, sourceFile);
        if (!styleName || alreadyDeclaresStyleSheet(ts, sourceFile, className, statement)) {
            continue;
        }
        const prefix = isExported(ts, statement) ? "export " : "";
        const typeParams = getTypeParameterText(statement, sourceFile);
        // StyleRules is what corrects each rule from the object literal it's declared with to the class name it is
        const styleType = `import("${styleModule}").StyleRules<InstanceType<typeof ${styleName}>>`;
        declarations.push(`${prefix}interface ${className}${typeParams} {get ${STYLE_MEMBER}(): ${styleType};}`);
    }

    if (declarations.length === 0) {
        return "";
    }
    return "\n" + declarations.join("\n") + "\n";
}

module.exports = {getStyleAugmentations};
