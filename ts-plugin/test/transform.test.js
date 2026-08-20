// What the compiler is handed: the file with its @field members renamed in place, and the declarations that
// replace them appended past the end.

const fs = require("fs");
const path = require("path");
const {getAugmentedSource} = require("../transform");

const FIXTURE = path.join(__dirname, "fixture");
const OPTIONS = {styleModule: "@stemjs/ui/Style", stateModule: "@stemjs/state/StoreField"};
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

    // The invariant the whole approach rests on: a position means the same thing to the editor and to us
    check("the source half is byte-identical in length", result.originalLength, text.length);
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

    const STYLE_OBJECT = 'import("@stemjs/ui/Style").StyleObject';
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

    check("a file with neither decorator is not touched at all",
        getAugmentedSource(ts, "/x/plain.ts", "export const value = 1;\n", OPTIONS), null);
};
