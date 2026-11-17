#!/usr/bin/env node
// Command-line counterpart of the editor plugin: type-checks the project with the same awareness of
// @registerStyle and @field. An un-annotated @field only has a type because of this, so this is what
// `npm run typecheck` should run - plain `tsc` sees the field as an implicit any.
// Usage: node stem-core/ts-plugin/typecheck.js [--project <tsconfig>] [--filter <substring>] [--preview] [--verbose | --quiet]
//                                              [--incremental <file>] [--watch | --warm]
// --project checks a tsconfig other than the project's tsconfig.json (e.g. one that covers only the Stem code).
// --preview reports what the project would say with every @ts-nocheck lifted, without touching a file.
// --incremental keeps what a run learns in <file> (a .tsbuildinfo, outside the sources), so the next run rechecks only
// the files an edit can affect. The report is the same as a full run's.
// --watch stays running and reports again each time a file the project reads changes.
// --warm (with --incremental) asks a checker kept running in the background, which keeps the files it parsed, and starts
// one if none answers (warmChecker.js). The report is the same.
// One line per diagnostic by default; --verbose prints the full message chains, --quiet only counts per file.

const fs = require("fs");
const path = require("path");
const loadTypeScript = require("./loadTypeScript");
const {createProjectCheck} = require("./checker");
const {askWarmChecker, serveWarmChecker, warmAddress, warmFingerprint} = require("./warmChecker");

const ts = loadTypeScript();
// The project being checked is the one we're run from
const projectRoot = process.cwd();

// How long a burst of changes (a save that writes several files, a branch switch) is given to settle
const WATCH_SETTLE_MS = 150;

function argument(name) {
    const index = process.argv.indexOf(name);
    return index === -1 ? null : process.argv[index + 1];
}

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

// "verbose", "quiet" or "lines", as the command line asks
function reportFormat() {
    if (process.argv.includes("--verbose")) {
        return "verbose";
    }
    return process.argv.includes("--quiet") ? "quiet" : "lines";
}

// What a run prints: the diagnostics on stdout, their count on stderr
function formatReport(diagnostics, format) {
    const formatHost = {
        getCanonicalFileName: fileName => fileName,
        getCurrentDirectory: () => projectRoot,
        getNewLine: () => ts.sys.newLine,
    };
    let stdout = "";
    if (diagnostics.length === 0) {
        // Nothing to print
    } else if (format === "verbose") {
        stdout = ts.formatDiagnostics(diagnostics, formatHost);
    } else if (format === "quiet") {
        const perFile = new Map();
        for (const diagnostic of diagnostics) {
            const fileName = diagnostic.file ? path.relative(projectRoot, diagnostic.file.fileName) : "";
            perFile.set(fileName, (perFile.get(fileName) || 0) + 1);
        }
        stdout = [...perFile].sort((a, b) => b[1] - a[1]).map(([fileName, count]) => `${String(count).padStart(4)}  ${fileName}\n`).join("");
    } else {
        stdout = diagnostics.map(formatOneLine).join("\n") + "\n";
    }
    return {stdout, stderr: `${diagnostics.length} errors\n`, exitCode: diagnostics.length > 0 ? 1 : 0};
}

function print({stdout, stderr, exitCode}) {
    process.stdout.write(stdout);
    process.stderr.write(stderr);
    process.exitCode = exitCode;
}

function report(diagnostics) {
    const {stdout, stderr} = formatReport(diagnostics, reportFormat());
    process.stdout.write(stdout);
    process.stderr.write(stderr);
}

// The folders a change could come from: those the tsconfig includes, as deep as it does, the tsconfig's own, and the
// folder of every other file the program reads outside node_modules (a sibling package reached through paths, say)
function foldersToWatch(program, config) {
    const folders = new Map();
    for (const [folder, flags] of Object.entries(config.wildcardDirectories || {})) {
        folders.set(path.resolve(folder), (flags & ts.WatchDirectoryFlags.Recursive) !== 0);
    }
    const configFolder = path.dirname(config.configPath);
    const isCovered = folder => [...folders].some(([watched, recursive]) => folder === watched || (recursive && folder.startsWith(watched + path.sep)));
    for (const folder of [configFolder, ...program.getSourceFiles().map(file => path.dirname(path.resolve(file.fileName)))]) {
        if (!folder.split(path.sep).includes("node_modules") && !isCovered(folder)) {
            folders.set(folder, false);
        }
    }
    return folders;
}

function watch(check) {
    const watchers = new Map();
    let previousFiles = null;
    let timer = null;

    const run = () => {
        timer = null;
        let result;
        try {
            result = check();
        } catch (error) {
            console.error(error.message);
            // The check that works again reports, whatever it finds changed
            previousFiles = null;
            if (watchers.size === 0) {
                // The first check: there is nothing to watch yet, so the process ends here
                process.exitCode = 1;
            }
            return;
        }
        // A program built entirely from the files the last one had changed nothing: nothing new to say
        const files = result.program.getSourceFiles();
        const unchanged = previousFiles && files.length === previousFiles.length && files.every((file, index) => file === previousFiles[index]);
        previousFiles = files;
        if (!unchanged) {
            report(result.diagnostics);
        }
        const folders = foldersToWatch(result.program, result.config);
        for (const [key, watcher] of watchers) {
            if (!folders.has(key)) {
                watcher.close();
                watchers.delete(key);
            }
        }
        for (const [folder, recursive] of folders) {
            if (!watchers.has(folder) && fs.existsSync(folder)) {
                watchers.set(folder, fs.watch(folder, {recursive}, onChange));
            }
        }
    };
    const onChange = (event, fileName) => {
        // Our own build info, and the temporary file it's written through
        if (fileName && /\.tsbuildinfo(\.\d+\.tmp)?$/.test(fileName)) {
            return;
        }
        clearTimeout(timer);
        timer = setTimeout(run, WATCH_SETTLE_MS);
    };
    run();
}

// The warm checker's side: one check kept for every run that asks, each with its own filter and format
function serve(warm, check) {
    serveWarmChecker({
        ...warm,
        answer: request => {
            try {
                return formatReport(check(request.filter).diagnostics, request.format);
            } catch (error) {
                return {stdout: "", stderr: `${error.message}\n`, exitCode: 1};
            }
        },
    });
}

// A run's side: what the warm checker answers, or a check of its own when none can
async function askWarm(warm, checkHere) {
    const answer = await askWarmChecker({
        ...warm,
        request: {filter: argument("--filter"), format: reportFormat()},
        serveArguments: [__filename, ...process.argv.slice(2).filter(argument => argument !== "--warm"), "--serve"],
        projectRoot,
    });
    if (answer.failed) {
        process.stderr.write(`Checking here: ${answer.failed}.\n`);
        print(formatReport(checkHere().diagnostics, reportFormat()));
        return;
    }
    print(answer);
}

function main() {
    const keepWatching = process.argv.includes("--watch");
    const serving = process.argv.includes("--serve");
    const buildInfoFile = argument("--incremental");
    const checkOptions = {
        previewNoCheck: process.argv.includes("--preview"),
        configFile: argument("--project"),
        buildInfoFile,
    };
    const check = createProjectCheck(ts, projectRoot, {...checkOptions, filter: argument("--filter"), keepFiles: keepWatching || serving});
    if (keepWatching) {
        watch(check);
        return;
    }
    if (serving || process.argv.includes("--warm")) {
        if (!buildInfoFile) {
            console.error("--warm keeps its checker's address beside the build info: give it --incremental <file> too");
            process.exitCode = 1;
            return;
        }
        const buildInfoPath = path.resolve(projectRoot, buildInfoFile);
        const warm = {address: warmAddress(buildInfoPath), fingerprint: warmFingerprint({...checkOptions, buildInfoPath, projectRoot})};
        if (serving) {
            serve(warm, check);
        } else {
            askWarm(warm, check);
        }
        return;
    }
    const {diagnostics} = check();
    report(diagnostics);
    process.exitCode = diagnostics.length > 0 ? 1 : 0;
}

main();
