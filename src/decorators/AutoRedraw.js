import {StoreObject} from "../state/Store";

class WeakMapMemo extends WeakMap {
    constructor(generator) {
        super();
        this.generator = generator;
    }

    get(key, generator = this.generator) {
        let value = this.get(key);
        if (!value) {
            value = generator(key);
            this.set(key, value);
        }
        return value;
    }
}

export const redrawHandlerWeakMap = new WeakMapMemo((uiElement) => {
    if (uiElement.node) {
        uiElement.redraw();
    }
});

// Return a memo'd function that redraws this object
export function getUniqueRedrawHandler(uiElement) {
    return redrawHandlerWeakMap.get(uiElement);
}

// Decorator that attaches an update listener on all store objects in options
// The logic is very crude, but works in most cases
export function autoredraw(Cls, ...args) {
    const oldSetOptions = Cls.prototype.setOptions;

    const listenersForElement = new WeakMapMemo((uiElement) => {
        let listenersMap = new Map();
        for (let obj of args) {
            const handler = uiElement.attachUpdateListener(obj, getUniqueRedrawHandler(this));
            listenersMap.set(obj, handler);
        }
        return listenersMap;
    });

    // TODO: optimize to only attach after onMount
    Cls.prototype.setOptions = function setOptions(options) {
        oldSetOptions.call(this, options);

        let listenersMap = listenersForElement.get(this);

        const objArray = Object.values(options || {}).filter(obj => obj instanceof StoreObject);
        const objSet = new Set(objArray);

        // Remove old objects, in case they're no longer in options
        for (let [obj, handler] of Array.from(listenersMap.entries())) {
            if (!objSet.has(obj)) {
                // TODO: implement this.removeCleanupJob(handler);
                handler.remove();
                listenersMap.remove(obj);
            }
        }

        // Add the new extra ones
        for (let obj of objArray) {
            if (!listenersMap.has(obj)) {
                const handler = this.attachUpdateListener(obj, getUniqueRedrawHandler(this));
                listenersMap.set(obj, handler);
            }
        }
    }
    return Cls;
}
