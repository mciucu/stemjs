#!/usr/bin/env node
// Command-line counterpart of the editor plugin: type-checks the project with the same awareness of
// @registerStyle and @field. An un-annotated @field only has a type because of this, so this is what
// `npm run typecheck` should run - plain `tsc` sees the field as an implicit any.
// Usage: node stem-core/ts-plugin/typecheck.js [--filter <substring>]

const loadTypeScript = require("./loadTypeScript");
const {getProjectDiagnostics} = require("./checker");

const ts = loadTypeScript();
// The project being checked is the one we're run from
const projectRoot = process.cwd();

function main() {
    const filterIndex = process.argv.indexOf("--filter");
    const filter = filterIndex === -1 ? null : process.argv[filterIndex + 1];

    const diagnostics = getProjectDiagnostics(ts, projectRoot, filter);

    const formatHost = {
        getCanonicalFileName: fileName => fileName,
        getCurrentDirectory: () => projectRoot,
        getNewLine: () => ts.sys.newLine,
    };
    if (diagnostics.length > 0) {
        process.stdout.write(ts.formatDiagnostics(diagnostics, formatHost));
    }
    console.error(`${diagnostics.length} errors`);
    process.exitCode = diagnostics.length > 0 ? 1 : 0;
}

main();
