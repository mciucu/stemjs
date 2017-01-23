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

// TODO: this function can be made a lot more generic, to wrap plain object initializer with inheritance support
function styleRuleWithOptions() {
    let options = Object.assign({}, ...arguments); //Simpler notation?
    let targetMethodName = options.targetMethodName || "css";

    function styleRuleDecorator(target, key, descriptor) {
        const {initializer, value} = descriptor;

        descriptor.objInitializer = function () {
            let style = evaluateStyleRuleObject(this, initializer, value, options);

            if (options.inherit) {
                // Get the value we set in the prototype of the parent class
                let parentDesc = Object.getPrototypeOf(target)[getStyleRuleKey(key)];
                let parentStyle = evaluateStyleRuleObject(this, parentDesc.objInitializer, parentDesc.value, options);
                style = deepCopy({}, parentStyle, style);
                return style;
            }

            return style;
        };

        // Change the prototype of this object to be able to access the old descriptor/value
        target[getStyleRuleKey(key)] = Object.assign({}, descriptor);

        descriptor.initializer = function () {
            let style = descriptor.objInitializer.call(this);
            return this[targetMethodName](style);
        };

        delete descriptor.value;

        return lazyInit(target, key, descriptor);
    }

    return styleRuleDecorator;
}

let styleRule = styleRuleWithOptions();
let styleRuleInherit = styleRuleWithOptions({inherit: true});

export {styleRule, styleRuleInherit, styleRuleWithOptions}
