// Compiles the fixture through the same path `npm run typecheck` uses. The fixture's @ts-expect-error
// directives are the real assertions: an implied type that came out as `any` leaves them unsatisfied, and
// TypeScript reports that as an error of its own.

const fs = require("fs");
const os = require("os");
const path = require("path");
const {createProjectCheck, getProjectDiagnostics} = require("../checker");
const {stemRootDiagnostic} = require("../stemSources");

const FIXTURE = path.join(__dirname, "fixture");

// The exports of numeric.ts that must still report, which only the plugin's own output can show
const NUMERIC_REPORTED = ["counted", "discounted", "looselyOrdered", "mislabelled", "overBudget", "scaled", "summed"];

module.exports = (ts, check) => {
    // Everything the fixture imports comes from stem itself, whose own diagnostics aren't what's under test
    const diagnostics = getProjectDiagnostics(ts, FIXTURE, path.join("test", "fixture"));
    const isNumeric = diagnostic => path.basename(diagnostic.file.fileName) === "numeric.ts";
    const isChildrenField = diagnostic => path.basename(diagnostic.file.fileName) === "childrenField.tsx";
    const fields = diagnostics.filter(isChildrenField).map(diagnostic => `${diagnostic.code} ${diagnostic.file.text.slice(diagnostic.start, diagnostic.start + diagnostic.length)} line ${diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1}`);
    check("a component's field named children reports, where it is declared", fields.join(" | "), "99002 children line 8");
    const messages = diagnostics.filter(diagnostic => !isNumeric(diagnostic) && !isChildrenField(diagnostic)).map(
        diagnostic => `${path.basename(diagnostic.file.fileName)}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`
    );

    check("the fixture compiles clean, so every @ts-expect-error held", messages.join(" | "), "");

    const exportAt = (diagnostic) => {
        const {line} = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        const text = diagnostic.file.text.split("\n")[line];
        return /export const (\w+)/.exec(text)?.[1] ?? `line ${line + 1}`;
    };
    const reported = [...new Set(diagnostics.filter(isNumeric).map(exportAt))].sort();
    check("numeric.ts reports exactly the operations it should", reported.join(", "), NUMERIC_REPORTED.join(", "));

    const configPath = ts.findConfigFile(FIXTURE, ts.sys.fileExists, "tsconfig.json");
    const {options} = ts.parseJsonConfigFileContent(ts.readConfigFile(configPath, ts.sys.readFile).config, ts.sys, FIXTURE);
    check("a stemRoot that resolves reports nothing", stemRootDiagnostic(ts, {stemRoot: "@stemjs"}, options, FIXTURE), "null");
    const unresolved = stemRootDiagnostic(ts, {}, options, FIXTURE);
    check("a stemRoot that doesn't resolve says so", unresolved && ts.flattenDiagnosticMessageText(unresolved.messageText, " ").split(",")[0],
        `Stem's ts-plugin can't find "stem-core/ui/UIBase"`);

    // An incremental check reports what a full one does, whether its diagnostics come from the checker, from the
    // build info a previous process left, or from files kept by the same process
    const described = list => list.map(diagnostic => [
        diagnostic.file ? path.relative(FIXTURE, diagnostic.file.fileName) : "",
        diagnostic.start,
        diagnostic.code,
        ts.flattenDiagnosticMessageText(diagnostic.messageText, " "),
    ].join(":")).join(" | ");
    const buildInfoFolder = fs.mkdtempSync(path.join(os.tmpdir(), "stem-typecheck-"));
    const buildInfoFile = path.join(buildInfoFolder, "fixture.tsbuildinfo");
    try {
        const incremental = () => createProjectCheck(ts, FIXTURE, {filter: path.join("test", "fixture"), buildInfoFile})().diagnostics;
        check("an incremental check reports what a full one does", described(incremental()), described(diagnostics));
        check("and leaves its build info", fs.existsSync(buildInfoFile), true);
        check("and so does one that starts from its build info", described(incremental()), described(diagnostics));
        const keeping = createProjectCheck(ts, FIXTURE, {filter: path.join("test", "fixture"), keepFiles: true});
        keeping();
        check("and one that runs again on the files it kept", described(keeping().diagnostics), described(diagnostics));
    } finally {
        fs.rmSync(buildInfoFolder, {recursive: true, force: true});
    }
};
