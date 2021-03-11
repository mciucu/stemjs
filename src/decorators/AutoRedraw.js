import {GenericObjectStore, StoreObject} from "../state/Store";

export const autoRedrawHandlerSymbol = Symbol("autoRedrawHandler");
export const autoRedrawListenersSymbol = Symbol("autoRedrawListener");

// Decorator that attaches an update listener on all store objects in options
// The logic is very crude, but works in most cases
export function autoredrawDecorator(Cls, ...args) {
    const oldSetOptions = Cls.prototype.setOptions;
    // TODO: optimize to only attach after onMount
    Cls.prototype.setOptions = function setOptions(options) {
        oldSetOptions.call(this, options);

        let listenerTargetSet = this[autoRedrawListenersSymbol];
        if (!listenerTargetSet) {
            this[autoRedrawListenersSymbol] = listenerTargetSet = new Set(args);
            this[autoRedrawHandlerSymbol] = () => this.node && this.redraw();
        }

        const objArray = Object.values(options || {}).filter(obj => {
            return (obj instanceof StoreObject) && !listenerTargetSet.has(obj);
        });

        // TODO: we don't remove listeners here, just results in some extra redraws when reassigning options

        // Add the new extra ones, and attach the lister if mounted
        for (let obj of objArray) {
            if (this.node) {
                this.attachUpdateListener(obj, this[autoRedrawHandlerSymbol]);
            }
            listenerTargetSet.add(obj);
        }
    };

    const oldOnMount = Cls.prototype.onMount;
    Cls.prototype.onMount = function onMount() {
        oldOnMount.call(this);
        let listenerTargetSet = this[autoRedrawListenersSymbol];
        for (let obj of listenerTargetSet) {
            const redrawHandler = this[autoRedrawHandlerSymbol];
            this.attachUpdateListener(obj, redrawHandler);
            if (obj instanceof GenericObjectStore) {
                this.attachCreateListener(obj, redrawHandler);
                this.attachDeleteListener(obj, redrawHandler);
            }
        }
    };
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
