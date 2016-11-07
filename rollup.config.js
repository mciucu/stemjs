import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import includePaths from "rollup-plugin-includepaths";

let includePathOptions = {
    extensions: [".es6.js", ".jsx"],
};

export default {
    entry: "js/Stem.es6.js",
    format: "umd",
    // moduleId: "stem",
    moduleName: "stem",
    plugins: [
        includePaths(includePathOptions),
        babel(),
        // uglify(),
    ],
    dest: "stem.js"
};
