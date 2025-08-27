import {StoreObject} from "../state/Store";
import {PropertyCache} from "../data-structures/PropertyCache";
import {BaseUIElement} from "../ui/UIBase";

type Constructor<T = {}> = new (...args: any[]) => T;
type UIElementConstructor = Constructor<BaseUIElement>;
type RedrawHandler = (event: any) => void;

interface AutoRedrawableClass extends UIElementConstructor {
    autoRedrawImplemented?: boolean;
    prototype: BaseUIElement & {
        setOptions: (options: any) => void;
        onMount: () => void;
        enqueueRedraw: (event: any) => void;
        attachChangeListener: (obj: StoreObject, handler: RedrawHandler) => void;
        node?: any;
    };
}

// TODO: maybe have better names
const autoRedrawListenersLazy = new PropertyCache<any, Set<StoreObject>>("autoRedrawHandler", () => new Set());

const redrawHandlerLazy = new PropertyCache<BaseUIElement, RedrawHandler>("autoRedrawListener", (obj: BaseUIElement) => {
    return (event: any) => obj.enqueueRedraw(event);
});

// Decorator that attaches a change listener on all store objects in options
// The logic is very crude, but works in most cases
export function autoredrawDecorator<T extends AutoRedrawableClass>(Cls: T, ...args: StoreObject[]): T {
    const listenersDefault = () => new Set([...args]);
    // TODO: we only need to do this once, throw an error if applying multiple times to the same class

    if (Cls.autoRedrawImplemented) {
        console.error("Can't use autoredraw on a class that inherited another class using autoredraw");
        return Cls;
    }

    Cls.autoRedrawImplemented = true;
    const oldSetOptions = Cls.prototype.setOptions;
    // TODO: optimize to only attach after onMount
    Cls.prototype.setOptions = function setOptions(options: any) {
        oldSetOptions.call(this, options);

        let listenerTargetSet = autoRedrawListenersLazy.get(this, listenersDefault);

        const objArray = Object.values(options || {}).filter((obj: any): obj is StoreObject => {
            return (obj instanceof StoreObject) && !listenerTargetSet.has(obj);
        });

        // TODO: we don't remove listeners here, just results in some extra redraws when reassigning options

        // Add the new extra ones, and attach the lister if mounted
        for (let obj of objArray) {
            // Technically we could just add these listeners, but this would also leave us with listeners on temp ui elements
            // TODO: probably need to remove at cleanup
            if (this.node) {
                this.attachChangeListener(obj, redrawHandlerLazy.get(this));
            }

            listenerTargetSet.add(obj);
        }
    };

    // TODO @Mihai this should be a listener with @mounted
    const oldOnMount = Cls.prototype.onMount;
    Cls.prototype.onMount = function onMount() {
        oldOnMount.call(this);
        const listenerTargetSet = autoRedrawListenersLazy.get(this, listenersDefault);
        for (const obj of listenerTargetSet) {
            const redrawHandler = redrawHandlerLazy.get(this);
            this.attachChangeListener(obj, redrawHandler);
        }
    };

    return Cls;
}

// Can be called decorated as @autoredraw or @autoredraw(Watch1, Watch2, ...)
export function autoredraw<T extends AutoRedrawableClass>(...args: any[]): T | ((Cls: T) => T) {
    if (args[0]?.prototype instanceof BaseUIElement) {
        return autoredrawDecorator(args[0]);
    } else {
        return (Cls: T) => autoredrawDecorator(Cls, ...(args as StoreObject[]));
    }
}
