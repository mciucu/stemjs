// What a store looks like when the plugin is supplying the types. Compiled by compile.test.js, where each
// expect-error directive below asserts that the implied types are real and not a blanket any.
import {BaseStore, globalStore} from "@stemjs/state/Store";
import {field} from "@stemjs/state/StoreField";
import {StoreId, type StoreObjectType} from "@stemjs/state/State";
import {StemDate} from "@stemjs/time/Date";

@globalStore
export class MessageThread extends BaseStore("MessageThread") {
    declare title: string;
    @field(Date) createdAt;
}

@globalStore
export class ChatMessage extends BaseStore("ChatMessage", {dependencies: [MessageThread]}) {
    @field(MessageThread) messageThread;
    @field(Date) createdAt;
    // An annotated field keeps the type it was given, and is left where it is
    @field(Date) editedAt: StemDate | null;
    declare content: string;

    describe(): string {
        return `${this.createdAt.toUnix()} ${this.messageThread.title} ${this.messageThreadId} ${this.content}`;
    }
}

// A class that still declares its raw id by hand keeps it, without a duplicate
@globalStore
export class Reaction extends BaseStore("Reaction") {
    declare messageId: StoreId;
    @field(ChatMessage) message;
}

// "self" points back into the store the field is on, which no spec can name as a value
@globalStore
export class Category extends BaseStore("Category") {
    declare id: number;
    @field("self") parent?: Category;
}

// A dependency is another store, as the name it registered under or as the class itself
export class Mention extends BaseStore("Mention", {dependencies: ["chatmessage", MessageThread]}) {}
// A name nothing registered is a typo, and reports as one
// @ts-expect-error
export class Mistyped extends BaseStore("Mistyped", {dependencies: ["ChatMesage"]}) {}
// What a store answers with is the names, the classes among them resolved
export const mentionDependencies: StoreObjectType[] = Mention.dependencies;

const category = Category.get(1)!;
export const categoryParent: Category | undefined = category.parent;
// A self key keeps the open id: the raw ids reach the class through its extends clause, where naming the
// class they belong to would be circular. `parent?` carries the null through to the key, as any spec does
export const categoryParentId: StoreId | null = category.parentId;
// @ts-expect-error a self field is the class, not the bare StoreObject every string spec answers with
export const notSelf: {nonsense: number} = category.parent;

// The key into a store is as narrow as the id that store declares
export const categoryId: number = category.id;

const message = ChatMessage.get("msg-1")!;
export const at: StemDate = message.createdAt;
export const thread: MessageThread = message.messageThread;
export const threadId: StoreId = message.messageThreadId;
export const threadCreated: StemDate = message.messageThread.createdAt;
export const edited: StemDate | null = message.editedAt;
export const reactionMessageId: StoreId = Reaction.get("r-1")!.messageId;

// A Date field has no raw id companion - only a foreign key keeps one
// @ts-expect-error
message.createdAtId;
// The implied type is the real one, so a wrong use is still an error
// @ts-expect-error
export const wrong: number = message.messageThread;
// And an unknown member is still unknown
// @ts-expect-error
message.notAField;
