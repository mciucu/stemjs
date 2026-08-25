// @makeEnum replaces every SCREAMING_CASE static with an instance built from it, so an entry is written as
// its config and read back as the class. Statics merge through a namespace, not an interface.

import {BaseEnum, makeEnum} from "@stemjs/state/BaseEnum";

interface PlanetConfig {
    value: string;
    name: string;
    mass: number;
}

@makeEnum
export class Planet extends BaseEnum {
    static EARTH: PlanetConfig = {value: "earth", name: "Earth", mass: 1};
    static MARS: PlanetConfig = {value: "mars", name: "Mars", mass: 0.107};
    // Long enough for a placeholder, and proves digits and underscores count as uppercase
    static ALPHA_CENTAURI_B: PlanetConfig = {value: "ac-b", name: "Alpha Centauri B", mass: 0.9};

    declare value: string;

    describe(): string {
        return this.name + " " + this.value;
    }

    // The case the casts used to be needed for
    static getDefault(): Planet {
        return this.EARTH;
    }
}

export const earth: Planet = Planet.EARTH;
export const described: string = Planet.MARS.describe();
export const far: Planet = Planet.ALPHA_CENTAURI_B;
export const every: Planet[] = Planet.all();
export const stored: Planet[] = Planet.allEntries;
export const found: Planet | null = Planet.fromValue("earth");
export const defaulted: Planet = Planet.getDefault();

// A lowercase static is not an entry, so it keeps the type it is written with
@makeEnum
export class Metal extends BaseEnum {
    static GOLD: {value: string} = {value: "gold"};
    static defaultSymbol = "Au";
}
export const symbol: string = Metal.defaultSymbol;
export const gold: Metal = Metal.GOLD;

// BaseEnum carries an index signature, so a negative assertion has to name something it can't answer for:
// a string is not an enum entry however permissive the members are
// @ts-expect-error
export const notAnEntry: Metal = Metal.defaultSymbol;

// An enum class no decorator touched reads at base precision. Declaring a member of its own is what makes
// that observable - a subclass that adds nothing is structurally its base.
export class Untouched extends BaseEnum {
    describeSelf(): string {
        return this.name;
    }
}
export const plain: BaseEnum[] = Untouched.all();
// @ts-expect-error
export const narrowed: Untouched[] = Untouched.allEntries;
