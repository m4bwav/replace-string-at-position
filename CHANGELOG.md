# Changelog

All notable changes to this package are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the package uses [Semantic Versioning](https://semver.org/).

## [2.0.0] - 2026-09-25

**The compatibility promise.** Every call with three strings (or `String` objects) and an integer position from 0 to the text's length returns exactly what 1.0.4 returned, and `require('replace-string-at-position')` still returns the function. The test suite checks this against 71 answers recorded from the published 1.0.4, on both builds and every supported Node line. Every other call now throws. Those calls are listed under Changed. Most of them returned damaged text, but a few happened to give a sensible answer, and those throw now too: a number as `newString` (`('item #0', '0', 5, 6)` gave `'item #5'`), a `Number` object or `true` as the position, an array such as `['b']` as `sourceString`. Convert such arguments with `String()` or `Number()` first. A `String` object is read by its own string value: an overridden `valueOf`, `Symbol.toPrimitive` or `substring` on it is ignored, and a `Proxy` is refused, where 1.0.4 called them.

### Changed (breaking)

- Needs Node 20 or later. The package has an `exports` map, so deep imports such as `replace-string-at-position/index.js` no longer resolve; import the package by its name.
- A missing or non-number `position` throws a `TypeError`. 1.0.4 returned the text twice for a missing position (`('abc', 'b', 'X')` gave `'abcXabc'`), and joined a string position as text (`'1'` gave `'aX'` for `'abcdef'`). Booleans, `null`, arrays, BigInts and `Number` objects are refused as well.
- A negative, `NaN` or fractional `position` throws a `RangeError`. 1.0.4 spliced negative and `NaN` positions at the start and removed the wrong number of characters, and it truncated fractions.
- A `position` greater than the text's length throws a `RangeError`. 1.0.4 appended the new text at the end.
- Every text argument must be a string or a `String` object, otherwise a `TypeError` names the argument. 1.0.4 put `null`, `undefined`, numbers and objects into the result as text (`'anullcdef'`), read the `length` of arrays and array-likes, and failed with the engine's own error for a `null` or non-string first argument.
- The command-line tool that the old README described is gone. It was never installed, because the package had no `bin` entry.

### Added

- ES module build with a default export and the named export `replaceStringAtPosition`.
- The CommonJS function also carries `.default` and `.replaceStringAtPosition`, both pointing to itself.
- TypeScript declarations for both builds.
- Runs in browsers, Bun, Deno and workers: the package uses no Node or DOM APIs.
- Published from GitHub Actions through npm trusted publishing, with provenance.

### Kept

- The text at the position is not compared with `sourceString`; only its length counts, and a `sourceString` that runs past the end removes the rest of the text.
- Positions and lengths count UTF-16 code units, as `String.prototype.slice` does, so a position inside an emoji splits it.
- Extra arguments are ignored.

## [1.0.4] - 2016-05-22

The last 1.x release: `module.exports = replaceStringAtPosition`, one ES5 file, no dependencies.

[2.0.0]: https://github.com/m4bwav/replace-string-at-position/releases/tag/v2.0.0
[1.0.4]: https://www.npmjs.com/package/replace-string-at-position/v/1.0.4
