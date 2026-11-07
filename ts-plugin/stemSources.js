// skipStemCheck: Stem's own sources answer to Stem's settings. A project stricter than Stem (strict: true, say)
// sets it to see only its own errors, the way skipLibCheck spares it the errors inside .d.ts files.

const path = require("path");

// This plugin lives in Stem's ts-plugin folder, so Stem is the folder above it
const STEM_ROOT = path.resolve(__dirname, "..") + path.sep;

function isSkippedStemSource(config, fileName) {
    return !!(config && config.skipStemCheck) && path.resolve(fileName).startsWith(STEM_ROOT);
}

module.exports = {isSkippedStemSource};
