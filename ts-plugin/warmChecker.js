// A checker kept running in the background for one project, so a one-shot run (typecheck.js --warm) asks it instead of
// parsing and binding every file again. The first run that finds none starts it. It ends after IDLE_MS with no run,
// and as soon as a run comes from other code (the plugin's, TypeScript, Node) or asks for another check; that run then
// starts the next one. Each run is answered in turn, from the files as they are on disk when its check starts.

const {spawn} = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const net = require("net");
const os = require("os");
const path = require("path");
const {resolveTypeScript} = require("./loadTypeScript");

// Long enough for a stretch of edits and the checks between them, short enough not to hold the memory all day
const IDLE_MS = 20 * 60 * 1000;
// How long a run waits for the checker it started to listen: Node and TypeScript load first
const START_WAIT_MS = 20 * 1000;
const START_POLL_MS = 100;

function hashOf(text) {
    return crypto.createHash("sha256").update(text).digest("hex");
}

// What an answer depends on besides the project's files: the check asked for, and the code that does it
function warmFingerprint(check) {
    const sources = fs.readdirSync(__dirname).filter(name => name.endsWith(".js")).map(name => path.join(__dirname, name));
    const code = [...sources, resolveTypeScript()].map(fileName => {
        const stat = fs.statSync(fileName);
        return [fileName, stat.size, stat.mtimeMs];
    });
    const environment = {NO_STEM_PLUGIN: process.env.NO_STEM_PLUGIN, STEM_PLUGIN_DEBUG: process.env.STEM_PLUGIN_DEBUG};
    return hashOf(JSON.stringify({check, code, environment, node: process.version}));
}

// Where the checker for a build info file listens: a socket beside it, or a pipe named after it on Windows. A socket's
// path has a short limit (about 100 bytes), so a longer one goes to the temporary folder under the same name.
function warmAddress(buildInfoPath) {
    const name = `stem-typecheck-${hashOf(buildInfoPath).slice(0, 24)}`;
    if (process.platform === "win32") {
        return `\\\\.\\pipe\\${name}`;
    }
    const beside = `${buildInfoPath}.sock`;
    return Buffer.byteLength(beside) <= 100 ? beside : path.join(os.tmpdir(), `${name}.sock`);
}

// One exchange: a line out, a line back. Resolves {answer}, {unreachable} when nothing listens, or {lost} when the
// checker went away before answering.
function exchange(address, message) {
    return new Promise(resolve => {
        let connected = false;
        let received = "";
        const socket = net.connect(address, () => {
            connected = true;
            // The checker ends the connection once it has answered
            socket.write(JSON.stringify(message) + "\n");
        });
        socket.setEncoding("utf8");
        socket.on("data", chunk => {
            received += chunk;
        });
        socket.on("error", () => {
            // "close" follows and settles it
        });
        socket.on("close", () => {
            if (!connected) {
                resolve({unreachable: true});
                return;
            }
            try {
                resolve({answer: JSON.parse(received)});
            } catch {
                resolve({lost: true});
            }
        });
    });
}

function startChecker(serveArguments, projectRoot) {
    const child = spawn(process.execPath, serveArguments, {cwd: projectRoot, detached: true, stdio: "ignore", windowsHide: true});
    child.unref();
}

// Asks the warm checker, starting it if none answers or the one that does is out of date. Resolves its answer, or
// {failed: <why>} when no checker could answer, for the caller to check by itself.
async function askWarmChecker({address, fingerprint, request, serveArguments, projectRoot}) {
    const message = {...request, fingerprint};
    let result = await exchange(address, message);
    if (result.answer && !result.answer.stale) {
        return result.answer;
    }
    if (result.lost) {
        return {failed: "the warm checker stopped before it answered"};
    }
    startChecker(serveArguments, projectRoot);
    const deadline = Date.now() + START_WAIT_MS;
    for (;;) {
        result = await exchange(address, message);
        if (result.answer && !result.answer.stale) {
            return result.answer;
        }
        if (result.lost) {
            return {failed: "the warm checker stopped before it answered"};
        }
        // Unreachable while it starts, or stale while the old one closes
        if (Date.now() > deadline) {
            return {failed: `no warm checker answered at ${address}`};
        }
        await new Promise(resolve => setTimeout(resolve, START_POLL_MS));
    }
}

// Listens at address, taking over a socket file a checker that crashed left behind, and leaves quietly if another
// checker already listens there
function listen(server, address, onListening) {
    server.once("error", error => {
        if (error.code !== "EADDRINUSE" || process.platform === "win32") {
            process.exitCode = 1;
            return;
        }
        const probe = net.connect(address, () => {
            probe.end();
        });
        probe.on("error", () => {
            fs.rmSync(address, {force: true});
            server.listen(address, onListening);
        });
    });
    server.listen(address, onListening);
}

// Answers each run with answer(request): what it should print, and its exit code
function serveWarmChecker({address, fingerprint, answer}) {
    let idleTimer = null;
    const server = net.createServer(socket => {
        let received = "";
        socket.setEncoding("utf8");
        socket.on("error", () => {
            // A run that went away before its answer: nothing to tell it
        });
        socket.on("data", chunk => {
            received += chunk;
            const end = received.indexOf("\n");
            if (end === -1) {
                return;
            }
            const request = JSON.parse(received.slice(0, end));
            received = "";
            if (request.fingerprint !== fingerprint) {
                // Make way for a checker of the run's own code: it starts once this one stops listening
                server.close();
                clearTimeout(idleTimer);
                socket.end(JSON.stringify({stale: true}) + "\n");
                return;
            }
            clearTimeout(idleTimer);
            socket.end(JSON.stringify(answer(request)) + "\n");
            idleTimer = setTimeout(() => server.close(), IDLE_MS);
        });
    });
    listen(server, address, () => {
        idleTimer = setTimeout(() => server.close(), IDLE_MS);
    });
}

module.exports = {askWarmChecker, serveWarmChecker, warmAddress, warmFingerprint};
