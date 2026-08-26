// @globalStore is what puts a class in GlobalState, so it is exactly the set getStore() can find. The name
// it registers under is the first argument of whatever it extends, and is not always the class name.
// A store object's class is also its own store, which getStore() hands back with the statics it declares.

import {GlobalState} from "@stemjs/state/State";
import {BaseStore, globalStore, StoreObject} from "@stemjs/state/Store";

@globalStore
export class Planet extends BaseStore("Planet") {
    declare radius: number;

    describe(): string {
        return this.radius + "km";
    }

    // No annotation of its own: getStore() is the class this instance belongs to, statics included
    twin(): Planet | undefined {
        return this.getStore().withRadius(this.radius);
    }

    static withRadius(radius: number): Planet | undefined {
        return this.findBy({radius});
    }
}

// The store name and the class name differ, which is what the registry key has to follow
@globalStore
export class MoonObject extends BaseStore("Moon") {
    declare orbits: number;
}

// A base others are built on carries no decorator, since nothing registers it under a name of its own
export class CelestialBody extends StoreObject {
    declare name: string;

    namesake(): CelestialBody | undefined {
        return this.getStore().named(this.name);
    }

    static named(name: string): CelestialBody | undefined {
        return this.findBy({name});
    }
}

// Built on that base, so its own store is the one that answers - with everything the base declares
@globalStore
export class Star extends BaseStore("Star", {}, CelestialBody) {
    declare temperature: number;

    sameName(): CelestialBody | undefined {
        return this.getStore().named(this.name);
    }
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

// The own store is the class itself, so it holds this store's objects and this store's statics
const planet = Planet.get("earth")!;
export const ownObjects: Planet[] = planet.getStore().all();
export const ownStatic: Planet | undefined = planet.getStore().withRadius(1);
export const ownStaticIndirect: Planet | undefined = planet.twin();
export const inheritedStatic: CelestialBody | undefined = Star.get("sun")!.getStore().named("sun");
// A static of another store is not one of ours
// @ts-expect-error
planet.getStore().named("earth");
// @ts-expect-error
export const wrongOwnObjects: MoonObject[] = planet.getStore().all();
