# Stem JS
[![npm package][npm-badge]][npm-url]
[Stem](https://stemjs.org) is somewhere between a framework and a library. It offers a set of classes and functions for all the standard scenarios you can encounter in modern web app developments, with design patterns designed to work together.

## Installation
You can either just download the source from git or from the npm repository as the `stem-core` [npm package](https://www.npmjs.com/package/stem-core):
```
npm install --save-dev stem-core
```

If you want to quickly set up a new demo app, you can try to use the `create-stem-app` [npm package](https://www.npmjs.com/package/create-stem-app):
```
npm install -g create-stem-app
create-stem-app your_app_name
```

## Using the library
The Stem code is designed to be used as ES6 modules. The code is meant to be included in the build path for whatever bundling tool you use (webpack, rollup).

## Build requirements
The source bundle is build with rollup, which you can install with:
`npm install -g rollup`
To call it, just run `rollup -c` in the root project folder.

## Why release another Javascript framework?
The world is full by them. Most of them are mediocre though, and I wanted to show some effort into another direction.
The architecture isn't optimized for cool one-liners, but for maintenance and flexibility, that keeps intentionally as much of the functionality in non-core code as possible.

Check out the docs at https://stemjs.org/docs/
This framework is being used for about a year at https://csacademy.com/, and it really works a lot better for use than any other solution out there.

This is the initial open-sourcing effort, it'll get more cleaned-up and documented in the next few weeks/months, with some concrete examples.

## Recommended parts
There's a lot of functionality implemented in Stem. The closer to the core code you go, the better is gets and will probably be clean-up and more commented in the future.
You can check out UIBase for the basics of the UI framework. It's an OOP based architecture that piggybacks on the jsx synthax (although you can use it with plain JS).
I also included the base state classes that we use to store instances of DB-backed objects in the browser. It's a simple alternative to Redux/Flux if you will.

## License
The license is the MIT one, except that I removed the pesky clause that forces people to include the licence if they copy/paste code.
So, pretty much an explicit public domain.

[npm-badge]: https://img.shields.io/npm/v/stem-core.svg?style=flat-square
[npm-url]: https://www.npmjs.org/package/stem-core