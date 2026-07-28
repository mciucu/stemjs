# ts-plugin-registered-styles

Teaches TypeScript what `@registerStyle(SomeStyle)` does, so `this.styleSheet` inside a Stem UI class resolves to
the style sheet that was registered for it instead of the base `StyleSheet`.

TypeScript can't do this on its own. A class decorator is not allowed to change the type of the class it decorates
([microsoft/TypeScript#4881](https://github.com/Microsoft/TypeScript/issues/4881)), and even if that proposal ever
lands it wouldn't help here: it would retype the class *binding*, while `this` inside the class body is typed from
the class declaration. The annotation has to come from somewhere else, and this plugin is that somewhere.

## What it does

For every class in a file decorated with `@registerStyle(X)`, it appends a merged interface to the text the
compiler sees - never to the file on disk:

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

Because the declaration is *appended*, every offset in the original file stays valid, and the editor keeps working
against the text you actually have. Everything downstream is ordinary type resolution: completion, hover,
go-to-definition on a rule, and real errors for rules that don't exist - it doesn't suppress anything.

`StyleRules` (in `stem-core/ui/Style.ts`) corrects the second half of the problem: a `@styleRule` field is declared
with an object literal but holds the generated class name at runtime, and a property decorator can't retype it
either.

Classes that already declare `styleSheet`, in the class body or through a hand-written merged interface, are left
alone.

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

If `StyleRules` isn't importable as `stem-core/ui/Style` from your files, say where it is:
`{"name": "ts-plugin-registered-styles", "styleModule": "your/path/to/Style"}`.

3. Make sure the editor uses the project's TypeScript, not its own bundled copy - a language service plugin is
   loaded by the `tsserver` that's running. In VS Code that's *TypeScript: Select TypeScript Version → Use
   Workspace Version*; WebStorm and PyCharm use the project's copy by default.

## Command line

The plugin only affects editors. `typecheck.js` runs the same transform through a normal `tsc` program so that
command-line checking agrees with what you see in the editor:

```sh
node stem-core/ts-plugin/typecheck.js [--filter <path substring>]
NO_STYLE_PLUGIN=1 node stem-core/ts-plugin/typecheck.js   # same run, without the augmentation, to compare
```

## Files

- `transform.js` - decides what to declare for a file. The only part with any real logic.
- `index.js` - the language service plugin: feeds the augmented text to the compiler and hides the appended region
  from anything the editor might display or apply as an edit (diagnostics, renames, formatting, code fixes).
- `typecheck.js` - the command-line counterpart.
