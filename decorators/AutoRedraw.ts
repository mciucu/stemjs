import {StoreObject, type StoreClass} from "../state/Store";
import {PropertyCache} from "../data-structures/PropertyCache";
import {BaseUIElement} from "../ui/UIBase";
import {type Constructor} from "../base/Utils";
import {type Dispatchable, type ListenerHandle} from "../base/Dispatcher";

type UIElementConstructor = Constructor<BaseUIElement>;
type RedrawHandler = (event?: unknown) => void;
// The decorator is handed store classes, while the scan over options finds store objects. Both end up
// in the same set, and addChangeListener takes either - or any other Dispatchable, which is how
// services like iFrameUserDataService and serverStatisticsManager are passed here.
type ChangeSource = Dispatchable | StoreClass<StoreObject>;

interface AutoRedrawableClass extends UIElementConstructor {
    autoRedrawImplemented?: boolean;
    prototype: BaseUIElement & {
        // Left open: this constrains the classes the decorator accepts, and every narrowing of it rejects
        // one - an options interface has no implicit index signature, so bivariance fails both ways
        setOptions: (options: any) => void;
        onMount: () => void;
        enqueueRedraw: RedrawHandler;
    };
}

// Per element, while it is mounted: the listener on each source it redraws on
const listenersLazy = new PropertyCache<BaseUIElement, Map<ChangeSource, ListenerHandle | undefined>>("autoRedrawListeners", () => new Map());

const redrawHandlerLazy = new PropertyCache<BaseUIElement, RedrawHandler>("autoRedrawListener", (obj: BaseUIElement) => {
    return (event?: unknown) => obj.enqueueRedraw(event);
});

// Makes the element listen to exactly these sources: the new ones are attached, the ones left out removed
function listenTo(element: BaseUIElement, wantedSources: Set<ChangeSource>): void {
    const listenerBySource = listenersLazy.get(element);
    for (const [source, handle] of listenerBySource) {
        if (!wantedSources.has(source)) {
            handle?.cleanup();
            listenerBySource.delete(source);
        }
    }
    for (const source of wantedSources) {
        if (!listenerBySource.has(source)) {
            const handle = source.addChangeListener(redrawHandlerLazy.get(element));
            listenerBySource.set(source, handle);
        }
    }
}

// Decorator that redraws an element when the stores passed to it, or the store objects in its options, change.
// The objects are the ones its current options hold, and only while it is mounted.
export function autoredrawDecorator<T extends AutoRedrawableClass>(Cls: T, ...args: ChangeSource[]): T {
    // TODO: we only need to do this once, throw an error if applying multiple times to the same class
    if (Cls.autoRedrawImplemented) {
        console.error("Can't use autoredraw on a class that inherited another class using autoredraw");
        return Cls;
    }
    Cls.autoRedrawImplemented = true;

    const changeSourcesOf = (options: object | undefined) => {
        const storeObjects = Object.values(options || {}).filter((value): value is StoreObject => value instanceof StoreObject);
        return new Set<ChangeSource>([...args, ...storeObjects]);
    };

    const oldSetOptions = Cls.prototype.setOptions;
    Cls.prototype.setOptions = function setOptions(options: any) {
        oldSetOptions.call(this, options);
        if (this.node) {
            listenTo(this, changeSourcesOf(this.options));
        }
    };

    // TODO @Mihai this should be a listener with @mounted
    const oldOnMount = Cls.prototype.onMount;
    Cls.prototype.onMount = function onMount() {
        oldOnMount.call(this);
        listenTo(this, changeSourcesOf(this.options));
        this.addCleanupJob(() => listenTo(this, new Set()));
    };

    return Cls;
}

// Can be called decorated as @autoredraw or @autoredraw(Watch1, Watch2, ...)
// The curried form infers on the class it is applied to, not on the stores - a T declared out here has
// nothing to be inferred from and collapses to its constraint, taking the class's own type with it
export function autoredraw<T extends AutoRedrawableClass>(Cls: T): T;
export function autoredraw(...stores: ChangeSource[]): <T extends AutoRedrawableClass>(Cls: T) => T;
export function autoredraw(...args: any[]): any {
    if (args[0]?.prototype instanceof BaseUIElement) {
        return autoredrawDecorator(args[0]);
    } else {
        return <T extends AutoRedrawableClass>(Cls: T) => autoredrawDecorator(Cls, ...(args as ChangeSource[]));
    }
}
