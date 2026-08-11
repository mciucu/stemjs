#!/usr/bin/env node
// Runs the plugin's tests. Needs a TypeScript it can resolve, so run it from a project that has one:
//     cd web-admin && node ../stem-core/ts-plugin/test/run.js

const loadTypeScript = require("../loadTypeScript");
const {createChecker} = require("./check");

const SUITES = [
    ["transform", require("./transform.test")],
    ["compile", require("./compile.test")],
    ["language service", require("./languageservice.test")],
];

const ts = loadTypeScript();
let failures = 0;

for (const [name, runSuite] of SUITES) {
    console.log(`\n${name}`);
    const checker = createChecker();
    runSuite(ts, checker.check);
    failures += checker.failures.length;
}

console.log(failures === 0 ? "\nall checks passed" : `\n${failures} failed`);
process.exitCode = failures === 0 ? 0 : 1;
