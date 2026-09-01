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
//     // appended: interface TabAreaStyle {tab: StyleRuleObject;}
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
// @makeEnum turns every SCREAMING_CASE static into an instance of the class. Statics merge through a
// namespace rather than an interface, and the entry is written as the config it is built from, so its name
// is relocated the same way a field's is:
//
//     @makeEnum class Timezone extends BaseEnum {
//         static UTC: TimezoneConfig = {value: "UTC", name: "..."};   on disk
//         static UT$1: TimezoneConfig = {value: "UTC", name: "..."};  what the compiler parses
//     }
//     // appended: export declare namespace Timezone {
//     //              const UTC: Timezone;
//     //              const allEntries: Timezone[];
//     //          }
//
// Only those two: BaseEnum's all() and fromValue() already reach their class through a `this` parameter,
// while an entry has no inference site at all and allEntries, being a property, has nothing to infer from.
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
// A store gets the same declaration whether or not it names this.constructor itself: a store object's
// class *is* its store, and getStore() hands it back as this["constructor"], so the declaration is what
// makes getStore() reach the statics that store declares.
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
// What OwnStore reads a store's own class off, kept off `constructor` since every object inherits one
const OWN_STORE_MEMBER = "$stemOwnStore";
const STYLE_DECORATOR = "registerStyle";
// The other way a sheet is attached, leaving nothing on the class for a decorator scan to find
const THEME_REGISTER = "Theme.register";
const FIELD_DECORATOR = "field";
const ENUM_DECORATOR = "makeEnum";
const STORE_DECORATOR = "globalStore";
// The root of the store hierarchy, in stem's Store.ts. A class extending it directly is a store base, which
// the decorator doesn't mark since only the classes registered in a state carry it.
const STORE_OBJECT_CLASS = "StoreObject";
const EXTENDS_STORE_OBJECT = new RegExp("extends\\s+" + STORE_OBJECT_CLASS + "\\b");
// Declared in stem's State.ts, in the global scope so a store file can add to it without knowing a path
const STORE_REGISTRY = "StemStoreRegistry";
// The one static BaseEnum can't narrow on its own: a property has no inference site, while all() and
// fromValue() reach their class through the `this` parameter and are better left alone
const ENUM_ENTRIES_MEMBER = "allEntries";
// @keyframesRule is here too: it swaps the literal for the animation name, exactly as @styleRule does.
// Matched by name rather than a fixed list, so a project's own wrapper - one that sanitizes before
// delegating to styleRule, say - is recognised as long as it is named after what it builds.
const STYLE_RULE_NAME = /styleRule|keyframesRule/i;
const isStyleRuleDecorator = (name) => STYLE_RULE_NAME.test(name);
// Reading a static off this.constructor is what needs the class behind Function
const THIS_CONSTRUCTOR_STATIC = "this." + CONSTRUCTOR_MEMBER + ".";
// Where stem itself lives, as this project's files import it. Set `stemRoot` in the tsconfig plugin entry
// for a project that places it elsewhere - the two modules below move together, so it is the only knob.
const DEFAULT_STEM_ROOT = "stem-core";
const STYLE_MODULE = "/ui/Style";
const STATE_MODULE = "/state/StoreField";

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

// A decorator is used bare (@styleRule, @makeEnum) or called (@styleRuleCustom({...}))
// decoratorNames is either the names to accept or a predicate over the name
function hasDecorator(ts, node, decoratorNames) {
    const matchesName = typeof decoratorNames === "function"
        ? decoratorNames
        : (name) => decoratorNames.includes(name);
    const decorators = ts.canHaveDecorators(node) ? ts.getDecorators(node) : null;
    for (const decorator of decorators || []) {
        let {expression} = decorator;
        if (ts.isCallExpression(expression)) {
            expression = expression.expression;
        }
        if (ts.isIdentifier(expression) && matchesName(expression.escapedText)) {
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
        if (hasDecorator(ts, member, isStyleRuleDecorator)) {
            rules.push({name: member.name.text, nameStart: member.name.getStart(sourceFile)});
        }
    }
    return rules;
}

// Every `Theme.register(SomeClass, SomeStyle)` in the file, by the class it names
function getThemeRegistrations(ts, sourceFile) {
    if (!sourceFile.stemThemeRegistrations) {
        const registrations = new Map();
        (function walk(node) {
            if (ts.isCallExpression(node) && node.arguments.length >= 2 &&
                    node.expression.getText(sourceFile) === THEME_REGISTER &&
                    isEntityName(ts, node.arguments[0]) && isEntityName(ts, node.arguments[1])) {
                registrations.set(node.arguments[0].getText(sourceFile), node.arguments[1].getText(sourceFile));
            }
            node.forEachChild(walk);
        })(sourceFile);
        sourceFile.stemThemeRegistrations = registrations;
    }
    return sourceFile.stemThemeRegistrations;
}

function getRegisteredStyle(ts, classNode, sourceFile) {
    const call = getDecoratorCall(ts, classNode, STYLE_DECORATOR);
    const styleArg = call && call.arguments[0];
    if (styleArg && isEntityName(ts, styleArg)) {
        return styleArg.getText(sourceFile);
    }
    return classNode.name ? getThemeRegistrations(ts, sourceFile).get(classNode.name.text) || null : null;
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

// makeEnum walks the class's own statics and replaces every SCREAMING_CASE one with an instance built from
// it, so what an entry is written as is never what anyone reads back. Same rule the runtime applies, and
// only property declarations - a static method isn't enumerable, so makeEnum never reaches one.
function collectEnumEntries(ts, classNode, sourceFile) {
    const entries = [];
    for (const member of classNode.members) {
        if (!ts.isPropertyDeclaration(member) || !ts.isIdentifier(member.name)) {
            continue;
        }
        const modifiers = ts.getCombinedModifierFlags(member);
        if (!(modifiers & ts.ModifierFlags.Static) || (modifiers & ts.ModifierFlags.Ambient)) {
            continue;
        }
        const name = member.name.text;
        if (name === name.toUpperCase()) {
            entries.push({name, nameStart: member.name.getStart(sourceFile)});
        }
    }
    return entries;
}

function getBaseExpression(classNode) {
    const heritage = (classNode.heritageClauses || [])[0];
    return (heritage && heritage.types[0] && heritage.types[0].expression) || null;
}

// A store declares the name it is registered under as the first argument of whatever it extends -
// BaseStore("EvalTask", ...), FetchStoreMixin("EvalTask", ...). That name is what getStore() is called with,
// and it is not always the class name: AceThemeObject registers as "AceTheme".
function getStoreName(ts, classNode) {
    const base = getBaseExpression(classNode);
    if (!base || !ts.isCallExpression(base)) {
        return null;
    }
    const nameArg = base.arguments[0];
    return nameArg && ts.isStringLiteralLike(nameArg) ? nameArg.text : null;
}

// A store object's class is its own store, which is what getStore() returns. @globalStore marks the ones a
// state registers; a base that others are built on top of extends StoreObject directly and carries neither
// the decorator nor a name of its own.
function isStoreClass(ts, classNode) {
    if (hasDecorator(ts, classNode, [STORE_DECORATOR])) {
        return true;
    }
    const base = getBaseExpression(classNode);
    return base != null && ts.isIdentifier(base) && base.escapedText === STORE_OBJECT_CLASS;
}

// A hand-written namespace is the only other thing that can declare a static, so one means the entries are
// already spoken for and we stay out entirely
function hasMergedNamespace(ts, sourceFile, className) {
    return sourceFile.statements.some(
        statement => ts.isModuleDeclaration(statement) && statement.name.text === className
    );
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

// TypeScript types every JSX expression as JSX.Element, whatever the tag, and jsxFactory drives emit
// rather than inference, so UI.createElement's overloads are never consulted. The element itself is left
// exactly as written and a type assertion is appended after it, which is enough to make the type real.
// The helper falls back to JSX.Element for a tag that isn't constructable, so nothing new can break.
const JSX_HELPER_NAME = "__stemJsxInstance";
// `0 extends 1 & T` is the standard test for any: an untyped tag has to stay any rather than collapse to
// unknown, which is what the conditional would otherwise give for both of its branches.
const JSX_HELPER = `type ${JSX_HELPER_NAME}<T> = 0 extends 1 & T ? any :`
    + ` T extends abstract new (...args: any[]) => infer R ? R : JSX.Element;`;
// A capitalised tag somewhere in the file. Generic arguments match too; they simply yield no insertions.
const HAS_COMPONENT_TAG = /<[A-Z][\w.]*[\s/>]/;

// A Stem JSX element is an instance of its tag's class; under React's own runtime it is an element, and the
// assertion would retype every component that returns one. Redirecting JSX is how a project says which it is.
function usesStemJsx(options) {
    return Boolean(options.jsxFactory || options.jsxImportSource);
}

// Where the assertion goes, for every JSX element in expression position. A direct JSX child is skipped:
// appending there would turn the assertion into JSX text rather than an expression.
function collectJsxAssertions(ts, sourceFile) {
    const insertions = [];
    const visit = (node) => {
        if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
            const tagName = ts.isJsxElement(node) ? node.openingElement.tagName : node.tagName;
            const isChild = node.parent && (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent));
            if (!isChild && ts.isIdentifier(tagName) && /^[A-Z]/.test(tagName.text)) {
                insertions.push({offset: node.end, text: ` as ${JSX_HELPER_NAME}<typeof ${tagName.text}>`});
            }
        }
        ts.forEachChild(node, visit);
    };
    ts.forEachChild(sourceFile, visit);
    return insertions;
}

// Returns {text, originalLength, fields, insertions} for the augmented file, or null when there's nothing to do.
// `fields` pairs each renamed member with the declaration that replaced it, for the plugin to map between.
function getAugmentedSource(ts, fileName, text, options = {}) {
    const hasStyleRule = /@\w*(?:styleRule|keyframesRule)/i.test(text);
    const usesThisConstructor = text.includes(THIS_CONSTRUCTOR_STATIC);
    const hasEnum = text.includes("@" + ENUM_DECORATOR);
    const hasStore = text.includes("@" + STORE_DECORATOR) || EXTENDS_STORE_OBJECT.test(text);
    const hasComponentTag = usesStemJsx(options) && HAS_COMPONENT_TAG.test(text);
    if (!text.includes(STYLE_DECORATOR) && !text.includes(THEME_REGISTER) && !text.includes("@" + FIELD_DECORATOR) &&
            !hasStyleRule && !usesThisConstructor && !hasEnum && !hasStore && !hasComponentTag) {
        return null;
    }

    const stemRoot = options.stemRoot || DEFAULT_STEM_ROOT;
    const styleModule = stemRoot + STYLE_MODULE;
    const stateModule = stemRoot + STATE_MODULE;
    const sourceFile = ts.createSourceFile(fileName, text, ts.ScriptTarget.ESNext, true, getScriptKind(ts, fileName));

    // Only a module can carry a `declare global` block, so a plain script gets no registry entry
    const isModule = ts.isExternalModule(sourceFile);
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
        const usesConstructorStatic = statement.getText(sourceFile).includes(THIS_CONSTRUCTOR_STATIC);
        const isStore = isStoreClass(ts, statement);
        if (usesConstructorStatic || isStore) {
            const instance = className + getTypeArgumentText(statement);
            const classType = `Omit<typeof ${className}, "prototype"> & (new (...args: any[]) => ${instance})`;
            if (usesConstructorStatic && !alreadyDeclares(CONSTRUCTOR_MEMBER)) {
                appended += `${prefix}interface ${className}${typeParams} {["${CONSTRUCTOR_MEMBER}"]: ${classType};}\n`;
            }
            // A store never has to name this.constructor to need its class: getStore() is typed off this member
            if (isStore && !alreadyDeclares(OWN_STORE_MEMBER)) {
                appended += `${prefix}interface ${className}${typeParams} {${OWN_STORE_MEMBER}?: ${classType};}\n`;
            }
        }

        // @globalStore is what puts the class in GlobalState, so it is exactly the set getStore() can find.
        // Nothing is redeclared here, so no name has to move - the entry only adds what the name maps to.
        if (isModule && hasDecorator(ts, statement, [STORE_DECORATOR]) && !typeParams) {
            const storeName = getStoreName(ts, statement);
            if (storeName) {
                // A store registers under its lowercased name and getStore() lowercases what it is called with,
                // so both spellings reach it - and both have to be keys, or the canonical one misses the registry
                // and falls through to the untyped signature. Deduped, since a name can already be lowercase.
                const members = [...new Set([storeName, storeName.toLowerCase()])]
                    .map(name => `${name}: ${className};`).join(" ");
                appended += `declare global {interface ${STORE_REGISTRY} {${members}}}\n`;
            }
        }

        // Every SCREAMING_CASE static holds an instance once makeEnum has run, not the config it is written
        // with, and that config is not the author's answer the way an annotated @field is - so every entry is
        // relocated. A namespace is what merges onto the class object, and it can't take type parameters,
        // so a generic enum class is left alone.
        if (hasDecorator(ts, statement, [ENUM_DECORATOR]) && !typeParams &&
                !hasMergedNamespace(ts, sourceFile, className)) {
            let entryDeclarations = "";
            for (const entry of collectEnumEntries(ts, statement, sourceFile)) {
                const placeholder = makePlaceholder(entry.name, impliedFields.length + 1);
                if (!placeholder) {
                    continue;
                }
                entryDeclarations += "    const ";
                impliedFields.push({
                    name: entry.name,
                    placeholder,
                    sourceStart: entry.nameStart,
                    appendedStart: 0, // filled in once the namespace it lands in has a known offset
                    pendingOffset: entryDeclarations.length,
                });
                entryDeclarations += `${entry.name}: ${className};\n`;
            }
            if (entryDeclarations !== "") {
                if (!alreadyDeclares(ENUM_ENTRIES_MEMBER)) {
                    entryDeclarations += `    const ${ENUM_ENTRIES_MEMBER}: ${className}[];\n`;
                }
                // Ambient, so every member is exported without saying so and nothing is emitted for it.
                // TS2395: it has to be exported exactly when the class it merges with is.
                const header = `${prefix}declare namespace ${className} {\n`;
                for (const fieldInfo of impliedFields) {
                    if (fieldInfo.pendingOffset != null) {
                        fieldInfo.appendedStart = appended.length + header.length + fieldInfo.pendingOffset;
                        delete fieldInfo.pendingOffset;
                    }
                }
                appended += header + entryDeclarations + "}\n";
            }
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
            ruleDeclarations += `${rule.name}: import("${styleModule}").StyleRuleObject;\n`;
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

    const insertions = hasComponentTag ? collectJsxAssertions(ts, sourceFile) : [];
    if (insertions.length > 0) {
        appended = JSX_HELPER + "\n" + appended;
    }
    if (appended === "") {
        return null;
    }

    impliedFields.sort((left, right) => left.sourceStart - right.sourceStart);

    let rewritten = "";
    let cursor = 0;
    // A field placeholder is the same length as the name it stands in for; a JSX assertion is inserted.
    // Both are applied in one pass, in source order, so the shift each one contributes stays accountable.
    const edits = [
        ...impliedFields.map(field => ({offset: field.sourceStart, skip: field.name.length, text: field.placeholder, field})),
        ...insertions.map(insertion => ({offset: insertion.offset, skip: 0, text: insertion.text})),
    ].sort((a, b) => a.offset - b.offset);

    let shift = 0;
    for (const edit of edits) {
        rewritten += text.slice(cursor, edit.offset) + edit.text;
        cursor = edit.offset + edit.skip;
        if (edit.field) {
            edit.field.sourceStart += 0; // the name stays where the user wrote it
        }
        shift += edit.text.length - edit.skip;
        edit.shiftAfter = shift;
    }
    rewritten += text.slice(cursor);

    const originalLength = text.length + shift;
    for (const fieldInfo of impliedFields) {
        fieldInfo.appendedStart += originalLength + 1; // +1 for the newline that separates the two halves
    }

    return {
        text: rewritten + "\n" + appended,
        originalLength,
        fields: impliedFields,
        // Sorted; each entry says how much the augmented side has grown by that point in the source
        shifts: edits.filter(edit => edit.text.length !== edit.skip).map(edit => ({offset: edit.offset, shiftAfter: edit.shiftAfter})),
    };
}

// An insertion has no counterpart in the source, so a position landing inside one answers with the point
// it was inserted at. Insertions never contain a newline, so only columns move, never lines.
function toSourceOffset(shifts, position) {
    let previous = 0;
    for (const {offset, shiftAfter} of shifts || []) {
        if (position < offset + previous) {
            return position - previous;
        }
        if (position < offset + shiftAfter) {
            return offset;
        }
        previous = shiftAfter;
    }
    return position - previous;
}

// A position at the insertion point itself stays before the text that was inserted there
function toAugmentedOffset(shifts, position) {
    let shift = 0;
    for (const {offset, shiftAfter} of shifts || []) {
        if (position <= offset) {
            break;
        }
        shift = shiftAfter;
    }
    return position + shift;
}

module.exports = {getAugmentedSource, toSourceOffset, toAugmentedOffset};
