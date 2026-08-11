# ts-plugin-registered-styles

Teaches TypeScript what Stem's decorators do, so the types you'd have to write by hand come from the decorator
you already wrote.

TypeScript can't do this on its own. A decorator is not allowed to change the type of what it decorates - not a
class ([microsoft/TypeScript#4881](https://github.com/Microsoft/TypeScript/issues/4881)), and not a property
either. Even if the class proposal ever lands it wouldn't help: it would retype the class *binding*, while `this`
inside the class body is typed from the class declaration. The annotation has to come from somewhere else, and
this plugin is that somewhere.

## `@registerStyle(X)`

`this.styleSheet` resolves to the style sheet registered for the class instead of the base `StyleSheet`. For every
decorated class, a merged interface is appended to the text the compiler sees - never to the file on disk:

```ts
@registerStyle(DashboardTitleStyle)
export class DashboardTitle extends UI.Element<DashboardTitleOptions> {
    render() {
        return <div className={this.styleSheet.title}/>;   // title is known, and is a class name
    }
}
// appended in memory:
export interface DashboardTitle {get styleSheet(): StyleRules<InstanceType<typeof DashboardTitleStyle>>;}
```

`StyleRules` (in `stem-core/ui/Style.ts`) corrects the second half of the problem: a `@styleRule` field is declared
with an object literal but holds the generated class name at runtime, and a property decorator can't retype it
either.

## `@field(X)`

A field with no type annotation gets the type its spec loads, plus the raw id that comes with a foreign key:

```ts
export class ChatMessage extends BaseStore("ChatMessage") {
    @field(MessageThread) messageThread;   // messageThread: MessageThread, messageThreadId: StoreId
    @field(Date) createdAt;                // createdAt: StemDate, and no raw id - Date isn't a foreign key
}
```

A class and a merged interface can't both declare the same member (TS2300), so before the interface can declare
`messageThread`, the class has to stop declaring it. Its *name* is replaced, in the text the compiler sees, by a
placeholder of exactly the same length:

```ts
    @field(MessageThread) messageThre$1;
// appended in memory:
type $StemRawIds$ChatMessage = FieldRawIds<{messageThread: typeof MessageThread; createdAt: typeof Date}>;
export interface ChatMessage extends $StemRawIds$ChatMessage {
    messageThread: FieldValue<typeof MessageThread>;
}
```

Equal length is the point. The language service has no source map: the editor asks about offsets in the document
you have open, and the compiler answers from this text, so the two only agree if every offset means the same thing
in both. Renaming a member to a name of the same length is the one edit that satisfies that - the file keeps its
exact shape. It also leaves the decorator completely alone, so `MessageThread` there is still type-checked,
navigable, renameable, and counts as a used import.

`FieldValue` and `FieldRawIds` (in `stem-core/state/StoreField.ts`) hold the semantics - that `Date` loads a
`StemDate`, that only a foreign key has a raw id. The plugin only decides which member is declared where.

**A field that already has an annotation is left alone**, and only gains its `<name>Id`; so is one whose name is
shorter than its placeholder would be, or whose spec isn't a plain name or string. Same for a member the class
body or a hand-written merged interface already declares - the plugin never fights an existing declaration.

## What it costs

Because the declarations are appended and the rename is length-neutral, every offset in the original file stays
valid, and the editor keeps working against the text you actually have. Everything downstream is ordinary type
resolution: completion, hover, go-to-definition and real errors for members that don't exist - it doesn't suppress
anything except what it generated itself. Three things are the plugin's own to clean up, all of them against spans
it created: the implicit `any` on a placeholder, placeholders offered in completions, and a result that lands on a
relocated member, which is mapped back to where that member is written.

The one real cost is that **an un-annotated `@field` only has a type when the plugin is running**. Plain `tsc`
reports it as an implicit `any`, so command-line checking has to go through `typecheck.js` (below).

## Install in another project

1. Add the dependency, pointing at wherever stem lives:

```json
"devDependencies": {
    "ts-plugin-registered-styles": "file:./stem-core/ts-plugin"
}
```

2. Register it in `tsconfig.json`:

```json
"compilerOptions": {
    "plugins": [
        {"name": "ts-plugin-registered-styles"}
    ]
}
```

If `StyleRules` and the field types aren't importable as `stem-core/ui/Style` and `stem-core/state/StoreField` from
your files, say where they are:
`{"name": "ts-plugin-registered-styles", "styleModule": "your/path/to/Style", "stateModule": "your/path/to/StoreField"}`.

3. Make sure the editor uses the project's TypeScript, not its own bundled copy - a language service plugin is
   loaded by the `tsserver` that's running. In VS Code that's *TypeScript: Select TypeScript Version → Use
   Workspace Version*; WebStorm and PyCharm use the project's copy by default.

## Command line

The plugin only affects editors. `typecheck.js` runs the same transform through a normal `tsc` program, and is what
`npm run typecheck` should call:

```sh
node stem-core/ts-plugin/typecheck.js [--filter <path substring>]
NO_STEM_PLUGIN=1 node stem-core/ts-plugin/typecheck.js      # same run without the augmentation, to compare
STEM_PLUGIN_DEBUG=1 node stem-core/ts-plugin/typecheck.js   # report errors in what we generate, instead of hiding them
```

`STEM_PLUGIN_DEBUG` is worth knowing about: a mistake in a generated declaration otherwise shows up as a member
missing at the *call site*, with the error that would explain it suppressed for being ours.

## Files

- `transform.js` - decides what to declare and what to rename for a file. The only part with any real logic.
- `index.js` - the language service plugin: feeds the augmented text to the compiler, hides the appended region
  from anything the editor might display or apply as an edit (diagnostics, renames, formatting, code fixes), and
  maps results on a relocated member back to the member itself.
- `typecheck.js` - the command-line counterpart.
