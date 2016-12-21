import {decorate} from './Utils';

function handleDescriptor(target, key, descriptor) {
    descriptor.writable = false;
    return descriptor;
}

export function readOnly(...args) {
    return decorate(handleDescriptor, args);
}
