// Stem is a submodule and generally has no node_modules of its own, so the compiler comes from wherever we're
// run - which is also the TypeScript the project itself is checked with.
module.exports = function loadTypeScript() {
    return require(require.resolve("typescript", {paths: [process.cwd(), __dirname, ...module.paths]}));
};
