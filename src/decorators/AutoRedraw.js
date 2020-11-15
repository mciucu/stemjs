import {StoreObject} from "../state/Store";

class WeakMapMemo extends WeakMap {
    constructor(generator) {
        super();
        this.generator = generator;
    }

    get(key, generator = this.generator) {
        let value = super.get(key);
        if (!value) {
            value = generator(key);
            this.set(key, value);
        }
        return value;
    }
}

export const redrawHandlerWeakMap = new WeakMapMemo((uiElement) => {
    return () => uiElement.node && uiElement.redraw();
});

// Return a memoized function that redraws this object
export function getUniqueRedrawHandler(uiElement) {
    return redrawHandlerWeakMap.get(uiElement);
}

// Decorator that attaches an update listener on all store objects in options
// The logic is very crude, but works in most cases
export function autoredrawDecorator(Cls, ...args) {
    const listenersForElement = new WeakMapMemo((uiElement) => {
        let listenersMap = new Map();
        for (let obj of args) {
            listenersMap.set(obj, obj); // We're not yet mounted, this is in setOptions
        }
        return listenersMap;
    });

    const oldSetOptions = Cls.prototype.setOptions;

    // TODO: optimize to only attach after onMount
    Cls.prototype.setOptions = function setOptions(options) {
        oldSetOptions.call(this, options);

        let listenersMap = listenersForElement.get(this);

        const objArray = Object.values(options || {}).filter(obj => {
            return (obj instanceof StoreObject) && !listenersMap.has(obj);
        });

        // TODO: we don't remove listeners here, just results in some extra redraws when reassigning options

        // Add the new extra ones, and attach the lister if mounted
        for (let obj of objArray) {
            const handler = this.node ? this.attachUpdateListener(obj, getUniqueRedrawHandler(this)) : obj;
            listenersMap.set(obj, handler);
        }
    }

    const oldOnMount = Cls.prototype.onMount;
    Cls.prototype.onMount = function onMount() {
        oldOnMount.call(this);
        let listenersMap = listenersForElement.get(this);
        for (let obj of listenersMap.keys()) {
            const handler = this.attachUpdateListener(obj, getUniqueRedrawHandler(this));
            listenersMap.set(obj, handler);
        }
    }
    return Cls;
}

// Can be called decorated as @autoredraw or @autoredraw(Watch1, Watch2, ...)
export function autoredraw(...args) {
    if (args[0]?.prototype?.attachUpdateListener) {
        return autoredrawDecorator(args[0]);
    } else {
        return (Cls) => autoredrawDecorator(Cls, ...args);
    }
}