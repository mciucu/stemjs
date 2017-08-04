// TODO: this file should be refactored
// consider lazyCSS -> styleRule/styleRule(styleRule.INHERIT)
import {decorate, createDefaultSetter} from './Utils';
import {lazyInitialize} from './LazyInitialize'

function evaluateInitializer(target, initializer, value) {
    let result = initializer ? initializer.call(target) : value;
    if (typeof result === "function") {
        result = result();
    }
    return result;
}

function handleDescriptor(target, key, descriptor) {
    const {initializer, value} = descriptor;

    // Change the prototype of this object to keep the old initializer
    target["__style__" + key] = {initializer, value};

    descriptor.initializer = function () {
        let style = evaluateInitializer(this, initializer, value);
        return this.css(style);
    };
    delete descriptor.value;

    return lazyInitialize(target, key, descriptor);
}

export function lazyCSS(...args) {
    return decorate(handleDescriptor, args);
}

function handleInheritDescriptor(target, key, descriptor) {
    const {initializer, value} = descriptor;
    descriptor.initializer = function () {
        // Get the value we set in the prototype of the parent object
        let parentDesc = Object.getPrototypeOf(this.__proto__)["__style__" + key];
        let parentStyle = evaluateInitializer(this, parentDesc.initializer, parentDesc.value);

        let style = evaluateInitializer(this, initializer, value);
        style = Object.assign(parentStyle, style);

        return style;
    };
    delete descriptor.value;

    return lazyCSS(target, key, descriptor);
}

export function lazyInheritCSS(...args) {
    return decorate(handleInheritDescriptor, args);
}
