// Computes the type declarations that Stem's decorators imply but that TypeScript can't infer.
//
// A decorator cannot change the type of what it decorates - not a class (microsoft/TypeScript#4881),
// and not a property either. The way around it is to declare the member somewhere else and append that
// declaration to the text the compiler is handed. Appending (rather than inserting) is what keeps every
// offset in the original file valid, which is what lets the editor keep working against the text you have.
//
// @registerStyle(SomeStyle) gives the class a styleSheet:
//
//     @registerStyle(DashboardTitleStyle)
//     export class DashboardTitle extends UI.Element {}
//     // appended: export interface DashboardTitle {get styleSheet(): StyleRules<...>;}
//
// @styleRule gives the property the object it is written with, rather than that object's exact literal type.
// The decorator swaps the literal for the class name it generates, so the literal type is never what anyone
// reads - and it makes a subclass's own literal a mismatched override.
//
//     @styleRule tab = {marginBottom: "-1px"};   on disk
//     @styleRule t$1 = {marginBottom: "-1px"};   what the compiler parses
//     // appended: interface TabAreaStyle {tab: StyleObject;}
//
// @field(SomeStore) gives the property the type its spec loads, plus the raw id that comes with a foreign
// key. A class and a merged interface can't both declare the same member (TS2300), so an un-annotated
// field first has to stop being a member: its *name* is replaced by an equal-length placeholder.
//
//     @field(MessageThread) messageThread;      on disk
//     @field(MessageThread) messageThre$1;      what the compiler parses
//     // appended: export interface ChatMessage extends FieldRawIds<{messageThread: typeof MessageThread}> {
//     //              messageThread: FieldValue<typeof MessageThread>;
//     //          }
//
// this.constructor is typed as Function by lib.es5.d.ts, which loses every static the class has. The
// declaration drops the class's own construct signature - keeping it would make a derived class's
// constructor an incompatible override of its base's - and adds one back that returns the instance:
//
//     class StemDate extends Date {
//         static toDate(date: DateInput): StemDate {...}
//         set(date: DateInput) {date = this.constructor.toDate(date); ...}
//         clone() {return new this.constructor(this.getTime());}
//     }
//     // appended: interface StemDate {
//     //              ["constructor"]: Omit<typeof StemDate, "prototype"> &
//     //                               (new (...args: any[]) => StemDate);
//     //          }
//
// Both halves are load-bearing there: Omit carries `toDate`, and the signature it adds back is what
// `new this.constructor(...)` needs - and it returns the instance, so a subclass's stays covariant.
//
// Only a class declared at the top level gets one, since a merged interface needs a name to attach to;
// a class declared inside a function - what the mixins return - still needs a cast.
//
// Equal length is the whole point of the placeholder: the file keeps its exact shape, so a position means
// the same thing to the editor and to the compiler. The decorator itself is untouched, so its argument
// keeps its type checking, its completion and its go-to-definition, and its import still counts as used.
// FieldValue and FieldRawIds hold the semantics (Date loads a StemDate, only foreign keys get a raw id);
// this file only decides which member goes where.

const STYLE_MEMBER = "styleSheet";
const CONSTRUCTOR_MEMBER = "constructor";
const STYLE_DECORATOR = "registerStyle";
const FIELD_DECORATOR = "field";
const STYLE_RULE_DECORATORS = ["styleRule", "styleRuleInherit", "styleRuleCustom"];
// Where StyleRules and the field types live. Configurable through the tsconfig plugin entry, for projects
// that place stem elsewhere
const DEFAULT_STYLE_MODULE = "stem-core/ui/Style";
const DEFAULT_STATE_MODULE = "stem-core/state/StoreField";

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

function getDecoratorCall(ts, node, decoratorName) {
    const decorators = ts.canHaveDecorators(node) ? ts.getDecorators(node) : null;
    for (const decorator of decorators || []) {
        const {expression} = decorator;
        if (!ts.isCallExpression(expression) || !ts.isIdentifier(expression.expression)) {
            continue;
        }
        if (expression.expression.escapedText === decoratorName) {
            return expression;
        }
    }
    return null;
}

// A rule decorator is used bare (@styleRule) or called (@styleRuleCustom({...}))
function hasStyleRuleDecorator(ts, node) {
    const decorators = ts.canHaveDecorators(node) ? ts.getDecorators(node) : null;
    for (const decorator of decorators || []) {
        let {expression} = decorator;
        if (ts.isCallExpression(expression)) {
            expression = expression.expression;
        }
        if (ts.isIdentifier(expression) && STYLE_RULE_DECORATORS.includes(expression.escapedText)) {
            return true;
        }
    }
    return false;
}

function collectStyleRules(ts, classNode, sourceFile) {
    const rules = [];
    for (const member of classNode.members) {
        if (!ts.isPropertyDeclaration(member) || !ts.isIdentifier(member.name) || member.type) {
            continue;
        }
        if (ts.getCombinedModifierFlags(member) & (ts.ModifierFlags.Static | ts.ModifierFlags.Ambient)) {
            continue;
        }
        if (hasStyleRuleDecorator(ts, member)) {
            rules.push({name: member.name.text, nameStart: member.name.getStart(sourceFile)});
        }
    }
    return rules;
}

function getRegisteredStyle(ts, classNode, sourceFile) {
    const call = getDecoratorCall(ts, classNode, STYLE_DECORATOR);
    const styleArg = call && call.arguments[0];
    if (styleArg && isEntityName(ts, styleArg)) {
        return styleArg.getText(sourceFile);
    }
    return null;
}

// The type of a field spec: a class reference is used as `typeof User`, a store name stays the string it is
function getSpecType(ts, specArg, sourceFile) {
    if (!specArg) {
        return null;
    }
    if (isEntityName(ts, specArg)) {
        return "typeof " + specArg.getText(sourceFile);
    }
    if (ts.isStringLiteralLike(specArg)) {
        return JSON.stringify(specArg.text);
    }
    return null;
}

function declaresMember(members, memberName) {
    return members.some(member => member.name && member.name.escapedText === memberName);
}

// A hand-written merged interface wins over anything we'd say about the same member
function interfaceDeclaresMember(ts, sourceFile, className, memberName) {
    return sourceFile.statements.some(
        statement => ts.isInterfaceDeclaration(statement) &&
            statement.name.escapedText === className &&
            declaresMember(statement.members, memberName)
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

// The instance type refers to its own parameters by name, without constraints or defaults
function getTypeArgumentText(classNode) {
    if (!classNode.typeParameters || classNode.typeParameters.length === 0) {
        return "";
    }
    return "<" + classNode.typeParameters.map(param => param.name.text).join(", ") + ">";
}

function collectFields(ts, classNode, sourceFile) {
    const fields = [];
    for (const member of classNode.members) {
        if (!ts.isPropertyDeclaration(member) || !ts.isIdentifier(member.name)) {
            continue;
        }
        const modifiers = ts.getCombinedModifierFlags(member);
        if (modifiers & (ts.ModifierFlags.Static | ts.ModifierFlags.Ambient)) {
            continue;
        }
        const call = getDecoratorCall(ts, member, FIELD_DECORATOR);
        const specType = call && getSpecType(ts, call.arguments[0], sourceFile);
        if (!specType) {
            continue;
        }
        // `foo?` keeps its question mark; the spec carries the null so the raw id turns nullable with it
        const isOptional = Boolean(member.questionToken);
        fields.push({
            name: member.name.text,
            nameStart: member.name.getStart(sourceFile),
            specType: isOptional ? specType + " | null" : specType,
            isOptional,
            isAnnotated: Boolean(member.type),
        });
    }
    return fields;
}

// A same-length stand-in for a member name: staying the same length is what keeps the substitution
// invisible to every offset in the file. It keeps as much of the real name as the `$<counter>` suffix
// leaves room for, so the rare placeholder that reaches the screen still reads as the field it stands in
// for. Nothing real ends in `$<digits>`, so it can't collide with a name the file already uses.
function makePlaceholder(name, index) {
    const suffix = "$" + index;
    if (name.length < suffix.length) {
        return null;
    }
    return name.slice(0, name.length - suffix.length) + suffix;
}

// Returns {text, originalLength, fields} for the augmented file, or null when there's nothing to declare.
// `fields` pairs each renamed member with the declaration that replaced it, for the plugin to map between.
function getAugmentedSource(ts, fileName, text, options = {}) {
    const hasStyleRule = STYLE_RULE_DECORATORS.some(name => text.includes("@" + name));
    const usesThisConstructor = text.includes("this." + CONSTRUCTOR_MEMBER + ".");
    if (!text.includes(STYLE_DECORATOR) && !text.includes("@" + FIELD_DECORATOR) && !hasStyleRule && !usesThisConstructor) {
        return null;
    }

    const styleModule = options.styleModule || DEFAULT_STYLE_MODULE;
    const stateModule = options.stateModule || DEFAULT_STATE_MODULE;
    const sourceFile = ts.createSourceFile(fileName, text, ts.ScriptTarget.ESNext, true, getScriptKind(ts, fileName));

    const impliedFields = [];
    let appended = "";

    for (const statement of sourceFile.statements) {
        if (!ts.isClassDeclaration(statement) || !statement.name) {
            continue;
        }
        const className = statement.name.text;
        const prefix = isExported(ts, statement) ? "export " : "";
        const typeParams = getTypeParameterText(statement, sourceFile);
        const alreadyDeclares = (memberName) => declaresMember(statement.members, memberName) ||
            interfaceDeclaresMember(ts, sourceFile, className, memberName);

        // lib.es5.d.ts types Object.constructor as Function, so every static is lost. Omit drops the
        // construct signature the class carries - keeping it would make a subclass's own constructor an
        // incompatible override - and the signature added back returns the instance, which stays covariant.
        if (statement.getText(sourceFile).includes("this." + CONSTRUCTOR_MEMBER + ".") &&
                !alreadyDeclares(CONSTRUCTOR_MEMBER)) {
            const instance = className + getTypeArgumentText(statement);
            const constructorType = `Omit<typeof ${className}, "prototype"> & (new (...args: any[]) => ${instance})`;
            appended += `${prefix}interface ${className}${typeParams} {["${CONSTRUCTOR_MEMBER}"]: ${constructorType};}\n`;
        }

        const styleName = getRegisteredStyle(ts, statement, sourceFile);
        if (styleName && !alreadyDeclares(STYLE_MEMBER)) {
            // StyleRules is what corrects each rule from the object literal it's declared with to the class name it is
            const styleType = `import("${styleModule}").StyleRules<InstanceType<typeof ${styleName}>>`;
            appended += `${prefix}interface ${className}${typeParams} {get ${STYLE_MEMBER}(): ${styleType};}\n`;
        }

        // The decorator swaps the object literal for the class name it generates, so the literal type it was
        // written with is never what anyone reads - and it makes a subclass's own literal a mismatched override
        const styleRules = collectStyleRules(ts, statement, sourceFile).filter(
            rule => !interfaceDeclaresMember(ts, sourceFile, className, rule.name));
        let ruleDeclarations = "";
        for (const rule of styleRules) {
            const placeholder = makePlaceholder(rule.name, impliedFields.length + 1);
            if (!placeholder) {
                continue;
            }
            ruleDeclarations += "    ";
            impliedFields.push({
                name: rule.name,
                placeholder,
                sourceStart: rule.nameStart,
                appendedStart: 0, // filled in once the interface it lands in has a known offset
                pendingOffset: ruleDeclarations.length,
            });
            ruleDeclarations += `${rule.name}: import("${styleModule}").StyleObject;\n`;
        }
        if (ruleDeclarations !== "") {
            const header = `${prefix}interface ${className}${typeParams} {\n`;
            for (const fieldInfo of impliedFields) {
                if (fieldInfo.pendingOffset != null) {
                    fieldInfo.appendedStart = appended.length + header.length + fieldInfo.pendingOffset;
                    delete fieldInfo.pendingOffset;
                }
            }
            appended += header + ruleDeclarations + "}\n";
        }

        const fields = collectFields(ts, statement, sourceFile);
        if (fields.length === 0) {
            continue;
        }

        const specs = [];
        const omittedRawIds = [];
        const relocated = [];
        for (const fieldInfo of fields) {
            specs.push(`${fieldInfo.name}: ${fieldInfo.specType}`);
            if (alreadyDeclares(fieldInfo.name + "Id")) {
                omittedRawIds.push(JSON.stringify(fieldInfo.name + "Id"));
            }
            // An annotated field keeps the type it was given; only its raw id is ours to declare
            if (fieldInfo.isAnnotated || interfaceDeclaresMember(ts, sourceFile, className, fieldInfo.name)) {
                continue;
            }
            const placeholder = makePlaceholder(fieldInfo.name, impliedFields.length + relocated.length + 1);
            if (placeholder) {
                relocated.push({...fieldInfo, placeholder});
            }
        }

        const omitArgument = omittedRawIds.length > 0 ? `, ${omittedRawIds.join(" | ")}` : "";
        const rawIds = `import("${stateModule}").FieldRawIds<{${specs.join("; ")}}${omitArgument}>`;
        // An interface can only extend a name (TS2499), so the raw ids need one. The class's own type
        // parameters never reach it - a spec is a value, so it can't mention them.
        const rawIdsAlias = `$StemRawIds$${className}`;
        appended += `type ${rawIdsAlias} = ${rawIds};\n`;
        appended += `${prefix}interface ${className}${typeParams} extends ${rawIdsAlias} {\n`;
        for (const fieldInfo of relocated) {
            appended += "    ";
            impliedFields.push({
                name: fieldInfo.name,
                placeholder: fieldInfo.placeholder,
                sourceStart: fieldInfo.nameStart,
                appendedStart: appended.length,
            });
            const optional = fieldInfo.isOptional ? "?" : "";
            appended += `${fieldInfo.name}${optional}: import("${stateModule}").FieldValue<${fieldInfo.specType}>;\n`;
        }
        appended += "}\n";
    }

    if (appended === "") {
        return null;
    }

    impliedFields.sort((left, right) => left.sourceStart - right.sourceStart);

    let rewritten = "";
    let cursor = 0;
    for (const fieldInfo of impliedFields) {
        rewritten += text.slice(cursor, fieldInfo.sourceStart) + fieldInfo.placeholder;
        cursor = fieldInfo.sourceStart + fieldInfo.name.length;
        fieldInfo.appendedStart += text.length + 1; // +1 for the newline that separates the two halves
    }
    rewritten += text.slice(cursor);

    return {
        text: rewritten + "\n" + appended,
        originalLength: text.length,
        fields: impliedFields,
    };
}

module.exports = {getAugmentedSource};
