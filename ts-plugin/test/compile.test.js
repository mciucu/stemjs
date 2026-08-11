// Compiles the fixture through the same path `npm run typecheck` uses. The fixture's @ts-expect-error
// directives are the real assertions: an implied type that came out as `any` leaves them unsatisfied, and
// TypeScript reports that as an error of its own.

const path = require("path");
const {getProjectDiagnostics} = require("../checker");

const FIXTURE = path.join(__dirname, "fixture");

module.exports = (ts, check) => {
    // Everything the fixture imports comes from stem itself, whose own diagnostics aren't what's under test
    const diagnostics = getProjectDiagnostics(ts, FIXTURE, path.join("test", "fixture"));
    const messages = diagnostics.map(
        diagnostic => `${path.basename(diagnostic.file.fileName)}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`
    );

    check("the fixture compiles clean, so every @ts-expect-error held", messages.join(" | "), "");
};
