## Why release another Javascript UI framework?
The world is full by them. Most of them are mediocre though, and I wanted to show some effort into another direction.
The architecture isn't optimized for cool one-liners, but for maintenance and flexibility, that keeps intentionally as much of the functionality in non-core code as possible.

This isn't really a framework in the take-over-your-codebase sense of the word, but rather a collection of libraries and design patterns that were designed to work together.

Check out the docs at https://stemjs.org/docs/
This framework is being used for about a year at csacademy.com, and it really works a lot better for use than any other solution out there.

## Recommended bits
There's a lot of functionality implemented in Stem. The closer to the core code you go, the better is gets and will probably be clean-up and more commented in the future.
You can check out UIBase for the basics of the UI framework. It's an OOP based architecture that piggybacks on the jsx synthax (although you can use it with plain JS).
I also included the base state classes that we use to store instances of DB-backed objects in the browser. It's a simple alternative to Redux/Flux if you will.

This is the initial open-sourcing effort, it'll get more cleaned-up and documented in the next few weeks/months, with some concrete examples.

## Build requirements
The source bundle is build with rollup, which you can install with:
`npm install --global rollup`
To call it, just run `rollup -c` in the root project folder.

## License
The license is the MIT one, except that I removed the pesky clause that forces people to include the licence if they copy/paste code.
So, pretty much an explicit public domain.
