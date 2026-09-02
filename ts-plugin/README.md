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

A class declared inside a function - a mixin, or one built per call - is in that function's declaration space,
where an interface appended at the end of the file would merge with nothing. Its interface is inserted on one line
right after the class instead, and the positions after it are mapped back the same way a JSX assertion's are.

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

## `@makeEnum`

Every `SCREAMING_CASE` static holds an instance of the class once the decorator has run, not the config it is
written with. Statics merge through a namespace rather than an interface, and the entry's name is relocated
the same way a `@field`'s is:

```ts
@makeEnum
export class Timezone extends BaseEnum {
    static UTC: TimezoneConfig = {value: "UTC", name: "Universal Time, Coordinated"};
    static getFiltersTimezone(): Timezone {return this.US_EASTERN;}   // no cast
}
// appended in memory:
export declare namespace Timezone {
    const UTC: Timezone;
    const allEntries: Timezone[];
}
```

Unlike an annotated `@field`, an annotated entry is **not** left alone: the annotation is the config
`makeEnum` consumes, which is exactly what it replaces, so every entry is relocated regardless.

Only those two members are declared. `all()` and `fromValue()` already reach their own class through the
`this: EnumConstructor<T>` parameter, whose `NoInfer` leaves the construct signature as the single inference
site; `allEntries` is a property, so it has nothing to infer from, and an entry has no inference site at all.
Declaring the two methods here would be worse than useless - a namespace cannot narrow a generic static, and
TypeScript rejects the attempt with TS2417.

A generic enum class is left alone, since a namespace can't take type parameters, and so is one that already
has a hand-written namespace. The namespace is emitted `export`ed exactly when the class is, or TS2395.

## `@globalStore`

`GlobalState.getStore("Name")` finds a store by the name it was declared with, and a string carries no type.
The decorator is what puts the class in `GlobalState`, so it is exactly the set `getStore` can return - and
each one adds an entry to a registry interface in the global scope:

```ts
@globalStore
export class AceThemeObject extends BaseStore("AceTheme") {...}
// appended in memory:
declare global {interface StemStoreRegistry {AceTheme: AceThemeObject;}}
```

`getStore` is overloaded on `keyof StemStoreRegistry`, so `getStore("AceTheme")` resolves to
`StoreInterface<AceThemeObject>` with **nothing written at the call site** - no type argument, no cast. The
key is the store's declared name, which is often not the class name, as above. A name nothing registered
still resolves through the general signature, at `StoreObject` precision.

The global scope is what makes this work across files: a store module can add to the registry without
knowing any path back to stem. A class with type parameters, or a file that isn't a module, is skipped.

A store object's class is also its own store, which `obj.getStore()` returns. Each store gets a member of its
own naming that class, which `OwnStore` reads it back off. It isn't `constructor`: every object inherits one
of those as `Function`, so declaring the class there would stop `{isoCode: "EUR"}` being a `Partial<Currency>`.
A class that reads `this.constructor.something` gets `constructor` retyped as well:

```ts
@globalStore
export class Currency extends BaseStore("Currency") {
    sameAs(isoCode: string) {return this === this.getStore().getByIsoCode(isoCode);}   // no cast
    static getByIsoCode(isoCode: string): Currency | undefined {...}
}
// appended in memory:
export interface Currency {$stemOwnStore?: Omit<typeof Currency, "prototype"> & (new (...args: any[]) => Currency);}
```

A base that stores are built on top of extends `StoreObject` directly and carries no decorator, since nothing
registers it - it gets the declaration for extending `StoreObject`. Anything else the plugin doesn't recognize
as a store falls back to `StoreObject`'s own statics, which is what `getStore()` was before.

## Operands with a numeric `valueOf`

An operator reads its operands through `valueOf` at runtime; TypeScript consults neither `valueOf` nor
`Symbol.toPrimitive` and offers no way to say a class coerces. `StemDate`, `Duration` and `TimeUnit` all answer
with a number, so `duration >= 2 * TimeUnit.DAY` runs correctly and reports three errors.

The plugin states the rule instead of working around it: an operand coerces if it is number-like already, or if
its type declares a `valueOf` returning a number, and `TS2362`/`TS2363`/`TS2365` are dropped when every operand
does. Nothing is added to the code being typed — no cast, no explicit `.valueOf()`, no intersection with `number`.

It stays narrow deliberately:

- only `- * / % ** < > <= >=`. `+` concatenates as readily as it adds, so an object reaching it is worth
  reporting even when it would coerce
- a union coerces only if every constituent does, so a `string | number` id still reports
- a `valueOf` returning anything but a number does not count, which is what keeps `number * boolean` an error

`test/fixture/numeric.ts` asserts both directions: the coercing forms compile, and the four that must keep
reporting carry `@ts-expect-error`.

## What a tag takes, and what an element holds

`createElement` normalizes two options as it builds an element: the children are collected into a
`UICleanChild[]` whatever spelling they arrive in, and a string `ref` is resolved into the `RefLinkOptions` it
names. So `this.options` is narrower than a tag. `stem-core/ui/UIBase.ts` says what is held - `UIElementOptions`,
`UIOptions` - and derives what a tag takes from it: `WrittenUIElementOptions`, `WrittenUIOptions`. A constructor
takes what is held: only `createElement` normalizes, and it has by the time it constructs.

TypeScript reads a tag's attributes off one property, `JSX.ElementAttributesProperty`. Stem's source declares no
such property - it would be a field nothing reads. The plugin names it once, globally, in `UIBase.ts`'s augmented
text, and declares it for every class that declares `options`, from that annotation. **Without the plugin,
TypeScript falls back to the constructor's parameter**, which is what is held, so a string ref or a lone child
reports - like an un-annotated `@field`, JSX needs the plugin running:

```ts
class UIElement<..., OptionsType extends UIElementOptions<TagType> = UIOptions<NodeType, ExtraOptions, TagType>> {
    declare options: OptionsType;                     // a type parameter answers with its default, and
}                                                     // a held alias with its written twin:
// appended in memory:
interface UIElement<...> {$stemJsxOptions: import("stem-core/ui/UIBase").WrittenUIOptions<NodeType, ExtraOptions, TagType>;}

class Router extends Switcher {
    declare options: ExtendedOptions<Switcher, RouterOptions>;   // keeps the base's tag shape under its own
}
// appended in memory:
interface Router {$stemJsxOptions: NonNullable<Switcher["$stemJsxOptions"]> & RouterOptions;}

class Sheet extends UIElement {
    declare options: ElementOptions<SheetOptions>;    // anything else is mapped from what is held
}
// appended in memory:
interface Sheet {$stemJsxOptions: import("stem-core/ui/UIBase").WrittenOptions<NonNullable<Sheet["options"]>>;}
```

A mixin's class expression can't merge with an interface, so it gets the member inside its body instead,
written from its annotation. A class that inherits `options` needs nothing.

The twins matter for inference: `ExtraOptions` stays a bare constituent of `WrittenUIOptions`, so a generic
tag - `<Select options={…} onChange={value => …}>` - still infers from its attributes. A mapped type over the
same intersection hands everything to `ExtraOptions` and leaves the value type unknown, which is why the mapped
`WrittenOptions` is reserved for a respelling of the class's own shape, where the class is concrete. Two other
shapes were measured and are worth not repeating: deriving the property from `this["options"]` on the base
recurses in every mixin (TS2589), and an optional property reads as `T | undefined` under `strictNullChecks`.

One consequence in the source: an extra-options interface must not `extends UIElementOptions`. `UIOptions`
intersects the base in anyway, and restating it drags the held `ref` and `children` into the written
intersection, where they reject a string ref and a lone child.

`test/fixture/options.tsx` asserts a respelled option reaches its tag from a declaration, from a mixin and
through `ExtendedOptions`, that a string ref and a lone child are accepted as written, and that what is held is
the array. `test/transform.test.js` pins what `UIBase.ts` itself gets.

## A single JSX child against a list of children

An element that narrows its children - `Switcher` to elements, `SVGOptions` to SVG children - intersects that
with what a tag takes, and TypeScript, counting the children written in the tag from React's convention that a
lone child is passed through as itself, checks that one child against the list. It reports as TS2745 on the
tag, or, once `strictNullChecks` makes an optional prop a union, as TS2322 on the child, or TS2747 when the
child is text. All three are the same mistake about a convention stem does not follow, so all three are dropped.

The child is not left unchecked: it is checked against the prop's **entry** type, which is what it becomes. A
child the list can't hold reports exactly as before, and so does a bad child among several - the rule only
applies where TypeScript's count is what made the difference. `test/fixture/children.tsx` asserts both
directions.

## What it costs

Because the declarations are appended and the rename is length-neutral, every offset in the original file stays
valid, and the editor keeps working against the text you actually have. Everything downstream is ordinary type
resolution: completion, hover, go-to-definition and real errors for members that don't exist - it doesn't suppress
anything except what it generated itself. Three things are the plugin's own to clean up, all of them against spans
it created: the implicit `any` on a placeholder, placeholders offered in completions, and a result that lands on a
relocated member, which is mapped back to where that member is written.

The one real cost is that **an un-annotated `@field` only has a type when the plugin is running**. Plain `tsc`
reports it as an implicit `any`, so command-line checking has to go through `typecheck.js` (below).

**Stem's own source relies on this**: `MoneyObject.currency` in `stem-core/localization/Money.ts` is un-annotated,
so a project that consumes stem without registering the plugin reads it as `any` (or fails with TS7008 under
`noImplicitAny`). Register the plugin, or annotate that field locally.

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

If stem isn't importable as `stem-core` from your files, say where it is - the modules the plugin references
all move together, so the directory is the only thing to set:
`{"name": "ts-plugin-registered-styles", "stemRoot": "your/path/to/stem"}`.

3. Make sure the editor uses the project's TypeScript, not its own bundled copy - a language service plugin is
   loaded by the `tsserver` that's running. In VS Code that's *TypeScript: Select TypeScript Version → Use
   Workspace Version*; WebStorm and PyCharm use the project's copy by default.

## Command line

The plugin only affects editors. `typecheck.js` runs the same transform through a normal `tsc` program, and is what
`npm run typecheck` should call:

```sh
node stem-core/ts-plugin/typecheck.js [--filter <path substring>] [--verbose]
NO_STEM_PLUGIN=1 node stem-core/ts-plugin/typecheck.js      # same run without the augmentation, to compare
```

It prints one line per diagnostic - file, position and the first line of the message. The type dumps
TypeScript appends to an assignability error are behind `--verbose`.

```sh
STEM_PLUGIN_DEBUG=1 node stem-core/ts-plugin/typecheck.js   # report errors in what we generate, instead of hiding them
```

`STEM_PLUGIN_DEBUG` is worth knowing about: a mistake in a generated declaration otherwise shows up as a member
missing at the *call site*, with the error that would explain it suppressed for being ours.

## Tests

Run them from a project that has TypeScript installed - stem is a submodule and generally has none of its own:

```sh
cd web-admin && node ../stem-core/ts-plugin/test/run.js
```

Three suites over one fixture: what the transform emits (including the invariant that putting each name back
where its placeholder sits reproduces the file exactly), what the fixture compiles to (its `ts-expect-error`
directives are the assertions - an implied type that came out `any` leaves them unsatisfied, which is itself an
error), and what a real language service answers through the plugin (hover, go-to-definition, rename,
completions, diagnostics, outline).

## Files

- `transform.js` - decides what to declare and what to rename for a file. The only part with any real logic.
- `index.js` - the language service plugin: feeds the augmented text to the compiler, hides the appended region
  from anything the editor might display or apply as an edit (diagnostics, renames, formatting, code fixes), and
  maps results on a relocated member back to the member itself.
- `checker.js` - builds a program over the augmented text and drops our own noise from the diagnostics. Shared
  by the command line and the tests, so the two can't disagree about what counts as an error.
- `numericCoercion.js`, `jsxChildren.js` - the two diagnostic rules above, shared by `checker.js` and `index.js`
  so the editor and the command line agree about what counts.
- `typecheck.js` - the command-line counterpart, a CLI over `checker.js`.
- `loadTypeScript.js` - finds the project's TypeScript from wherever we're run.
- `test/` - see above.
