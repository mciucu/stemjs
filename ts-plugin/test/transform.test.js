// What the compiler is handed: the file with its @field members renamed in place, and the declarations that
// replace them appended past the end.

const fs = require("fs");
const path = require("path");
const {getAugmentedSource, toSourceOffset, toAugmentedOffset} = require("../transform");

const FIXTURE = path.join(__dirname, "fixture");
const OPTIONS = {stemRoot: "@stemjs"};
const FIELD_VALUE = 'import("@stemjs/state/StoreField").FieldValue';
const FIELD_RAW_IDS = 'import("@stemjs/state/StoreField").FieldRawIds';

function augment(ts, name) {
    const filePath = path.join(FIXTURE, name);
    const text = fs.readFileSync(filePath, "utf8");
    const result = getAugmentedSource(ts, filePath, text, OPTIONS);
    return {text, result, appended: result.text.slice(result.originalLength)};
}

module.exports = (ts, check) => {
    const {text, result, appended} = augment(ts, "stores.ts");

    // A file with nothing inserted keeps the original invariant: a position means the same thing to the
    // editor and to us. A JSX assertion breaks it on purpose, and `shifts` is what maps across - asserted
    // at the end of this file.
    check("the source half is byte-identical in length", result.originalLength, text.length);
    check("a file with no insertions needs no mapping", result.shifts.length, 0);
    // Putting each name back where its placeholder sits has to reproduce the file exactly - proof that the
    // rewrite touched the member names and nothing else
    let restored = result.text.slice(0, result.originalLength);
    for (const field of result.fields) {
        restored = restored.slice(0, field.sourceStart) + field.name + restored.slice(field.sourceStart + field.name.length);
    }
    check("the source half differs only at the renamed members", restored, text);
    check("every placeholder is the length of the name it replaced",
        result.fields.every(field => field.placeholder.length === field.name.length), true);
    check("placeholders are unique", new Set(result.fields.map(field => field.placeholder)).size, result.fields.length);
    check("each placeholder sits where its name was",
        result.fields.every(field => result.text.substr(field.sourceStart, field.name.length) === field.placeholder), true);
    check("each appendedStart lands on the member name",
        result.fields.every(field => result.text.substr(field.appendedStart, field.name.length) === field.name), true);
    check("the relocated members", result.fields.map(field => field.name).join(","),
        "createdAt,messageThread,createdAt,message");

    check("a foreign key declares its value",
        appended.includes(`messageThread: ${FIELD_VALUE}<typeof MessageThread>;`), true);
    check("the spec map drives the raw ids",
        appended.includes(`${FIELD_RAW_IDS}<{messageThread: typeof MessageThread; createdAt: typeof Date; editedAt: typeof Date}>`), true);
    // It still appears in the spec map, since its raw id is ours to declare - just not as a member
    check("an annotated field is not re-declared",
        appended.includes(`editedAt: ${FIELD_VALUE}`), false);
    check("a hand-declared raw id is omitted",
        appended.includes(`${FIELD_RAW_IDS}<{message: typeof ChatMessage}, "messageId">`), true);
    // An interface may only extend a name (TS2499), and the error would land in the region we suppress
    check("the raw ids are extended through an alias, not an import type",
        /interface ChatMessage extends \$StemRawIds\$ChatMessage \{/.test(appended), true);

    const optional = augment(ts, "optional.ts");
    check("an optional field keeps its question mark",
        optional.appended.includes(`completedAt?: ${FIELD_VALUE}<typeof Date | null>;`), true);
    check("an optional spec carries the null on to its raw id",
        optional.appended.includes("thread: typeof Thread | null"), true);
    check("a required field stays required",
        optional.appended.includes(`startedAt: ${FIELD_VALUE}<typeof Date>;`), true);

    const styles = augment(ts, "styles.tsx");
    let restoredStyles = styles.result.text.slice(0, styles.result.originalLength);
    for (const field of styles.result.fields) {
        restoredStyles = restoredStyles.slice(0, field.sourceStart) + field.name +
            restoredStyles.slice(field.sourceStart + field.name.length);
    }
    check("a .tsx source half differs only at the renamed members", restoredStyles, styles.text);
    check("@registerStyle declares the style sheet",
        styles.appended.includes('export interface DashboardTitle {get styleSheet(): import("@stemjs/ui/Style").StyleRules<InstanceType<typeof DashboardTitleStyle>>;}'), true);
    check("a class that declares styleSheet is left alone",
        styles.appended.includes("AnnotatedTitle"), false);

    const STYLE_OBJECT = 'import("@stemjs/ui/Style").StyleRuleObject';
    check("@styleRule declares the rule as the object it is written with",
        styles.appended.includes(`title: ${STYLE_OBJECT};`), true);
    check("@styleRuleInherit is a rule too",
        styles.appended.includes(`heading: ${STYLE_OBJECT};`), true);
    check("an annotated rule is left alone",
        styles.appended.includes("annotated:"), false);
    check("a plain field is not a rule",
        styles.appended.includes("plainField"), false);
    check("every rule name is renamed in the source half",
        ["title", "heading"].every(name => styles.result.fields.some(field => field.name === name)), true);

    const enums = augment(ts, "enums.ts");
    let restoredEnums = enums.result.text.slice(0, enums.result.originalLength);
    for (const field of enums.result.fields) {
        restoredEnums = restoredEnums.slice(0, field.sourceStart) + field.name +
            restoredEnums.slice(field.sourceStart + field.name.length);
    }
    check("an enum source half differs only at the relocated entries", restoredEnums, enums.text);
    check("statics merge through a namespace, not an interface",
        enums.appended.includes("export declare namespace Planet {"), true);
    check("an entry is declared as the class it becomes",
        enums.appended.includes("const EARTH: Planet;"), true);
    // The annotation is the config makeEnum consumes, not the author's answer, so it is not a reason to skip
    check("an annotated entry is relocated all the same",
        enums.result.fields.some(field => field.name === "ALPHA_CENTAURI_B"), true);
    check("allEntries is restated, since a property has nothing to infer from",
        enums.appended.includes("const allEntries: Planet[];"), true);
    // Both reach their class through the `this` parameter, so declaring them would only lose precision
    check("all() and fromValue() are left to BaseEnum",
        /function (all|fromValue)\(/.test(enums.appended), false);
    check("a lowercase static is not an entry",
        enums.appended.includes("defaultSymbol"), false);
    check("a class without @makeEnum gets no namespace",
        enums.appended.includes("namespace Untouched"), false);

    const registry = augment(ts, "registry.ts");
    // A store registers lowercased and getStore() lowercases what it is called with, so both spellings are keys
    check("a @globalStore class is registered under the name its store was declared with",
        registry.appended.includes("declare global {interface StemStoreRegistry {Planet: Planet; planet: Planet;}}"), true);
    // AceThemeObject registers as "AceTheme" in the real codebase, so the key can't be the class name
    check("the key is the store name, not the class name",
        registry.appended.includes("{Moon: MoonObject; moon: MoonObject;}"), true);
    check("a class without @globalStore is not registered",
        registry.appended.includes("Unregistered:"), false);
    // Nothing is redeclared, so unlike an entry or a field no name has to move
    check("registering renames nothing",
        registry.result.fields.length, 0);

    // getStore() is typed off this member, so a store needs it without ever naming this.constructor - that is
    // what makes it the store's own statics rather than StoreObject's
    check("a store declares its own store member",
        registry.appended.includes('export interface Planet {$stemOwnStore?: Omit<typeof Planet, "prototype"> & (new (...args: any[]) => Planet);}'), true);
    check("a base extending StoreObject declares one too, since nothing registers it",
        registry.appended.includes("export interface CelestialBody {$stemOwnStore?:"), true);
    check("a store built on that base declares its own",
        registry.appended.includes("export interface Star {$stemOwnStore?:"), true);
    check("a store that never names this.constructor leaves constructor alone",
        registry.appended.includes('["constructor"]'), false);

    check("a file with neither decorator is not touched at all",
        getAugmentedSource(ts, "/x/plain.ts", "export const value = 1;\n", OPTIONS), null);


    // A JSX assertion is inserted rather than substituted, so the source half grows and every position after
    // it moves. Removing what we inserted has to give the file back exactly, and the two mappings have to be
    // inverses of each other - that is what lets a diagnostic, a hover or a definition land where it was written.
    const jsx = augment(ts, "jsx.tsx");

    check("a JSX file records one shift per assertion", jsx.result.shifts.length > 0, true);

    let stripped = jsx.result.text.slice(0, jsx.result.originalLength);
    for (const {offset, shiftAfter} of [...jsx.result.shifts].reverse()) {
        const previous = jsx.result.shifts.filter(entry => entry.offset < offset).pop();
        const start = offset + (previous ? previous.shiftAfter : 0);
        stripped = stripped.slice(0, start) + stripped.slice(start + shiftAfter - (previous ? previous.shiftAfter : 0));
    }
    check("removing the assertions gives the file back", stripped, jsx.text);

    check("the JSX itself is never rewritten", jsx.result.text.includes("<Panel/> as __stemJsxInstance<typeof Panel>"), true);

    const roundTrips = [];
    for (let position = 0; position <= jsx.text.length; position += 1) {
        roundTrips.push(toSourceOffset(jsx.result.shifts, toAugmentedOffset(jsx.result.shifts, position)));
    }
    check("every source position survives the round trip",
        roundTrips.findIndex((value, index) => value !== index), -1);

    // An offset inside inserted text has no counterpart, so it answers with the point it was inserted at
    const firstShift = jsx.result.shifts[0];
    check("a position inside an assertion maps to where it was inserted",
        toSourceOffset(jsx.result.shifts, firstShift.offset + 1), firstShift.offset);
};
