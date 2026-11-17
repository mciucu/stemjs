// Stem is a submodule and generally has no node_modules of its own, so the compiler comes from wherever we're
// run - which is also the TypeScript the project itself is checked with.
function resolveTypeScript() {
    return require.resolve("typescript", {paths: [process.cwd(), __dirname, ...module.paths]});
}

module.exports = function loadTypeScript() {
    return require(resolveTypeScript());
};
module.exports.resolveTypeScript = resolveTypeScript;
