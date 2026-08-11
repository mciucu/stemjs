// A field written `foo?` keeps its question mark, and the null it can load travels to its raw id too.
import {BaseStore, globalStore} from "@stemjs/state/Store";
import {field} from "@stemjs/state/StoreField";
import {StoreId} from "@stemjs/state/State";
import {StemDate} from "@stemjs/time/Date";

@globalStore
export class Thread extends BaseStore("Thread") {
    declare title: string;
}

@globalStore
export class Session extends BaseStore("Session") {
    @field(Date) startedAt;
    @field(Date) completedAt?;
    @field(Thread) thread?;
}

const session = Session.get("s-1")!;
export const started: StemDate = session.startedAt;
export const completed: StemDate | null | undefined = session.completedAt;
export const threadId: StoreId | null = session.threadId;
export const guarded: number = session.completedAt ? session.completedAt.toUnix() : 0;

// An optional field is not simply the value type...
// @ts-expect-error
export const unguarded: StemDate = session.completedAt;
// ...and can't be dereferenced without a check
// @ts-expect-error
export const boom: number = session.completedAt.toUnix();
// An optional foreign key's raw id is nullable with it
// @ts-expect-error
export const notNullable: StoreId = session.threadId;
// A required field stays required
// @ts-expect-error
export const wrongRequired: undefined = session.startedAt;
