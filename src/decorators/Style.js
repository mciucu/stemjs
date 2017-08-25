import {deepCopy} from "../base/Utils";
import {decorate} from "./Utils";
import {lazyInit} from "./LazyInitialize";

function evaluateStyleRuleObject(target, initializer, value, options) {
    let result = initializer ? initializer.call(target) : value;
    if (typeof result === "function") {
        result = result();
    }
    if (Array.isArray(result)) {
        result = Object.assign({}, ...result);
    }
    return result;
}

function getStyleRuleKey(key) {
    return "__style__" + key;
}

function getKeyframesRuleKey(key) {
    return "__keyframes__" + key;
}

// TODO: this function can be made a lot more generic, to wrap plain object initializer with inheritance support
function styleRuleWithOptions() {
    let options = Object.assign({}, ...arguments); //Simpler notation?
    // TODO: Remove this if you don't think it's appropiate, I thought a warning would do no harm
    if (!options.targetMethodName) {
        console.error("WARNING: targetMethodName not specified in the options (default is \"css\")");
    }
    let targetMethodName = options.targetMethodName || "css";

    function styleRuleDecorator(target, key, descriptor) {
        const {initializer, value} = descriptor;

        descriptor.objInitializer = function () {
            let style = evaluateStyleRuleObject(this, initializer, value, options);

            // TODO: a bit of a hack, clean this up
            style["prefferedClassName"] = key;

            if (options.selector) {
                style["selectorName"] = options.selector;
            }

            if (options.inherit) {
                // Get the value we set in the prototype of the parent class
                let parentDesc = Object.getPrototypeOf(target)[getStyleRuleKey(key)];
                if (!parentDesc) {
                    console.error("You're trying to inherit a rule that isn't implemented in the parent: " + key);
                }
                let parentStyle = evaluateStyleRuleObject(this, parentDesc.objInitializer, parentDesc.value, options);
                style = deepCopy({}, parentStyle, style);
                return style;
            }

            return style;
        };

        // Change the prototype of this object to be able to access the old descriptor/value
        target[options.getKey(key)] = Object.assign({}, descriptor);

        descriptor.initializer = function () {
            let style = descriptor.objInitializer.call(this);
            return this[targetMethodName](style);
        };

        delete descriptor.value;

        return lazyInit(target, key, descriptor);
    }

    return styleRuleDecorator;
}

// TODO: Second argument is mostly useless (implied from targetMethodName)
let styleRule = styleRuleWithOptions({
    targetMethodName: "css",
    getKey: getStyleRuleKey,
    inherit: false,
});

let styleRuleInherit = styleRuleWithOptions({
    targetMethodName: "css",
    getKey: getStyleRuleKey,
    inherit: true,
});

export function styleRuleCustom(options) {
    return styleRuleWithOptions(Object.assign({
        targetMethodName: "css",
        getKey: getStyleRuleKey,
        inherit: false,
    }, options));
}

let keyframesRule = styleRuleWithOptions({
    targetMethodName: "keyframes",
    getKey: getKeyframesRuleKey,
    inherit: false,
});

// TODO: This is currently not working (I think)
let keyframesRuleInherit = styleRuleWithOptions({
    targetMethodName: "keyframes",
    getKey: getKeyframesRuleKey,
    inherit: true,
});

export {styleRule, styleRuleInherit, keyframesRule, keyframesRuleInherit, styleRuleWithOptions}

