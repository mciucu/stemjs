#!/usr/bin/env node
// Command-line counterpart of the editor plugin: type-checks the project with the same awareness of
// @registerStyle and @field. An un-annotated @field only has a type because of this, so this is what
// `npm run typecheck` should run - plain `tsc` sees the field as an implicit any.
// Usage: node stem-core/ts-plugin/typecheck.js [--filter <substring>] [--preview] [--verbose]
// --preview reports what the project would say with every @ts-nocheck lifted, without touching a file.
// One line per diagnostic by default; --verbose prints TypeScript's full message chains.

const path = require("path");
const loadTypeScript = require("./loadTypeScript");
const {getProjectDiagnostics} = require("./checker");

const ts = loadTypeScript();
// The project being checked is the one we're run from
const projectRoot = process.cwd();

// The file, position and first line of the message: the type dumps TypeScript appends are what --verbose is for
function formatOneLine(diagnostic) {
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n").split("\n")[0];
    if (!diagnostic.file) {
        return `TS${diagnostic.code}: ${message}`;
    }
    const {line, character} = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
    const fileName = path.relative(projectRoot, diagnostic.file.fileName);
    return `${fileName}(${line + 1},${character + 1}): TS${diagnostic.code}: ${message}`;
}

function main() {
    const filterIndex = process.argv.indexOf("--filter");
    const filter = filterIndex === -1 ? null : process.argv[filterIndex + 1];

    const diagnostics = getProjectDiagnostics(ts, projectRoot, filter, process.argv.includes("--preview"));

    const formatHost = {
        getCanonicalFileName: fileName => fileName,
        getCurrentDirectory: () => projectRoot,
        getNewLine: () => ts.sys.newLine,
    };
    if (diagnostics.length === 0) {
        // Nothing to print
    } else if (process.argv.includes("--verbose")) {
        process.stdout.write(ts.formatDiagnostics(diagnostics, formatHost));
    } else {
        process.stdout.write(diagnostics.map(formatOneLine).join("\n") + "\n");
    }
    console.error(`${diagnostics.length} errors`);
    process.exitCode = diagnostics.length > 0 ? 1 : 0;
}

main();
