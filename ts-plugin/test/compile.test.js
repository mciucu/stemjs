// Compiles the fixture through the same path `npm run typecheck` uses. The fixture's @ts-expect-error
// directives are the real assertions: an implied type that came out as `any` leaves them unsatisfied, and
// TypeScript reports that as an error of its own.

const path = require("path");
const {getProjectDiagnostics} = require("../checker");
const {stemRootDiagnostic} = require("../stemSources");

const FIXTURE = path.join(__dirname, "fixture");

// The exports of numeric.ts that must still report, which only the plugin's own output can show
const NUMERIC_REPORTED = ["counted", "discounted", "looselyOrdered", "mislabelled", "overBudget", "scaled", "summed"];

module.exports = (ts, check) => {
    // Everything the fixture imports comes from stem itself, whose own diagnostics aren't what's under test
    const diagnostics = getProjectDiagnostics(ts, FIXTURE, path.join("test", "fixture"));
    const isNumeric = diagnostic => path.basename(diagnostic.file.fileName) === "numeric.ts";
    const messages = diagnostics.filter(diagnostic => !isNumeric(diagnostic)).map(
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
};
