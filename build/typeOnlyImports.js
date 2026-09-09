// An import carrying only types is erased, but babel runs with onlyRemoveTypeImports, which strips the
// specifiers and leaves the statement. What survives is a bindingless import: an edge rollup counts,
// reports cycles through, and orders the bundle by, while nothing actually depends on it. Dropping the
// statement here, before babel, makes the two spellings of a type-only import equivalent, so neither can
// move the bundle.
//
// Without this, marking the types on the specifiers rather than on the statement is enough to close a
// runtime cycle and put a module ahead of its own base class, which surfaces in the browser as
// "Cannot access 'X' before initialization" on the extends clause.
//
// Build-time module, so it stays .js: build-server/ imports it through Node.

const TYPE_ONLY_IMPORT = /^import\s+(type\s+)?\{([^}]*)\}\s*from\s*["']([^"']+)["']/gm;

// Every import statement that carries no runtime binding, in either spelling
export function typeOnlyImports(code) {
    const found = [];
    for (const match of code.matchAll(TYPE_ONLY_IMPORT)) {
        const [statement, typeKeyword, specifiers, source] = match;
        const names = specifiers.split(",").map(name => name.trim()).filter(Boolean);
        if (typeKeyword || (names.length > 0 && names.every(name => name.startsWith("type ")))) {
            found.push({statement, source});
        }
    }
    return found;
}

export function dropTypeOnlyImports(code) {
    let out = code;
    for (const {statement} of typeOnlyImports(code)) {
        out = out.replace(statement, "");
    }
    return out;
}

// The plugin, plus the edges it dropped so an onwarn handler can tell a real cycle from an erased one
export function makeTypeOnlyEdgeTracker() {
    const edges = new Set();

    const plugin = {
        name: "type-only-edge-tracker",
        // Ordered before babel, so the code here is still the TypeScript the type markers were written in
        async transform(code, id) {
            const dropped = typeOnlyImports(code);
            for (const {source} of dropped) {
                const resolved = await this.resolve(source, id);
                if (resolved) {
                    edges.add(id + "\0" + resolved.id);
                }
            }
            if (dropped.length === 0) {
                return null;
            }
            return {code: dropTypeOnlyImports(code), map: null};
        },
    };

    // True for a CIRCULAR_DEPENDENCY warning whose cycle only closes through an edge we erased
    const isErasedCycle = (warning) =>
        warning.code === "CIRCULAR_DEPENDENCY" &&
        warning.ids?.some((id, i) => i > 0 && edges.has(warning.ids[i - 1] + "\0" + id));

    return {plugin, edges, isErasedCycle};
}
