// Names too short for a placeholder of their own length: each gets a longer one, so everything after the first sits
// further along in the text the compiler sees than in the file. Compiled by compile.test.js.
import {BaseStore, globalStore} from "@stemjs/state/Store";
import {field} from "@stemjs/state/StoreField";
import {StemDate} from "@stemjs/time/Date";

@globalStore
export class Interval extends BaseStore("Interval") {
    @field(Date) a;
    @field(Date) b;
}

const interval = Interval.get(1)!;
export const from: StemDate = interval.a;
export const to: StemDate = interval.b;
// @ts-expect-error a short field is what its spec loads, not any
export const notADate: number = interval.b;
