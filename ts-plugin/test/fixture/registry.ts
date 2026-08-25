// @globalStore is what puts a class in GlobalState, so it is exactly the set getStore() can find. The name
// it registers under is the first argument of whatever it extends, and is not always the class name.

import {GlobalState} from "@stemjs/state/State";
import {BaseStore, globalStore} from "@stemjs/state/Store";

@globalStore
export class Planet extends BaseStore("Planet") {
    declare radius: number;

    describe(): string {
        return this.radius + "km";
    }
}

// The store name and the class name differ, which is what the registry key has to follow
@globalStore
export class MoonObject extends BaseStore("Moon") {
    declare orbits: number;
}

// No decorator, so nothing registers it and getStore() could never return it
export class Unregistered extends BaseStore("Unregistered") {
    declare ignored: number;
}

// The point of the whole thing: no type argument, no cast, no wrapper
export const planets: Planet[] = GlobalState.getStore("Planet")!.all();
export const described: string = GlobalState.getStore("Planet")!.findBy({radius: 1})!.describe();
export const moons: MoonObject[] = GlobalState.getStore("Moon")!.all();

// getObjects() carries the store's own type through a `this` parameter; the property it wraps cannot, since a
// static property is resolved where it is written rather than per subclass
export const byId: Map<string, Planet> = Planet.getObjects();
export const viaStore: Map<string, Planet> = GlobalState.getStore("Planet")!.getObjects();
// @ts-expect-error
export const rawProperty: Map<string, Planet> = Planet.objects;

// A name nothing registered still resolves, just at base precision
export const unknown = GlobalState.getStore("NotAStore")!.all();
// @ts-expect-error
export const unknownNarrowed: Planet[] = GlobalState.getStore("NotAStore")!.all();
// The class name is not the key - "MoonObject" was never registered
// @ts-expect-error
export const wrongKey: MoonObject[] = GlobalState.getStore("MoonObject")!.all();
