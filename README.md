# replace-string-at-position

![Tweezers placing a gold block into a row of blank metal type blocks in a wooden composing stick](https://raw.githubusercontent.com/m4bwav/replace-string-at-position/master/.github/images/banner.jpg)

[![npm version](https://img.shields.io/npm/v/replace-string-at-position.svg)](https://www.npmjs.com/package/replace-string-at-position)
[![CI](https://github.com/m4bwav/replace-string-at-position/actions/workflows/ci.yml/badge.svg)](https://github.com/m4bwav/replace-string-at-position/actions/workflows/ci.yml)
[![npm downloads](https://img.shields.io/npm/dm/replace-string-at-position.svg)](https://www.npmjs.com/package/replace-string-at-position)

Replace a substring at a known position: give it the text, the part being replaced, its replacement and the index where it starts, and it splices the replacement in. Use it when you already know where the match is, for example from `RegExp.prototype.exec` or `String.prototype.indexOf`, and want to replace that one occurrence rather than the first or every one.

- TypeScript types, ES module and CommonJS builds, no dependencies.
- Node 20 and later, browsers, Bun, Deno and workers: the package uses nothing but plain JavaScript.

## Install

```sh
npm install replace-string-at-position
```

## Usage

```js
import replaceStringAtPosition from 'replace-string-at-position';

replaceStringAtPosition('222', '2', '3', 1);
//=> '232'

const text = 'See https://example.com and https://example.com/docs.';
const match = /https:\/\/example\.com\/docs/u.exec(text);
replaceStringAtPosition(text, match[0], '<link>', match.index);
//=> 'See https://example.com and <link>.'
```

The named export works too: `import {replaceStringAtPosition} from 'replace-string-at-position'`.

**CommonJS:** `require()` returns the function, as it did in 1.x.

```js
const replaceStringAtPosition = require('replace-string-at-position');
```

**Deno:** `import replaceStringAtPosition from 'npm:replace-string-at-position';`

## API

### replaceStringAtPosition(originalString, sourceString, newString, position)

Returns `originalString` with the part that starts at `position` and is as long as `sourceString` replaced by `newString`.

| Parameter | Type | Meaning |
|---|---|---|
| `originalString` | `string` | The text to change. |
| `sourceString` | `string` | The text being replaced. Only its length is used. |
| `newString` | `string` | The text to put in its place. |
| `position` | `number` | Where the replaced text starts: an integer from 0 to `originalString.length`. |

Throws a `TypeError` when a text argument is not a string (a `String` object is fine and is read by its own value, ignoring any overridden `valueOf`) or `position` is not a number, and a `RangeError` when `position` is not an integer from 0 to `originalString.length`. Each message names the argument and what it got.

## Behaviour at the edges

| Call | Result |
|---|---|
| `('hello', 'xyz', 'abc', 0)` | `'abclo'`: the text at the position is not compared with `sourceString`; only its length counts |
| `('abc', 'bcdef', 'X', 1)` | `'aX'`: a `sourceString` that runs past the end removes the rest |
| `('abc', 'x', 'Y', 3)` | `'abcY'`: the position may equal the length, which appends |
| `('abc', '', 'X', 1)` | `'aXbc'`: an empty `sourceString` inserts |
| `('😀b', 'b', 'X', 1)` | `'\uD83DXb'`: positions count UTF-16 code units, as `slice` does, so a position inside an emoji splits it |
| `('abc', 'x', 'Y', 10)` | `RangeError`: past the end |
| `('abc', 'b', 'X', -1)`, `1.5`, `NaN` | `RangeError` |
| `('abc', 'b', 'X')`, `'1'`, `null` | `TypeError`: the position must be a number |
| `('abc', 'b', null, 1)` | `TypeError`: every text argument must be a string |

## Migrating from 1.x

Every call with three strings and an integer position from 0 to the text's length returns what 1.0.4 returned; the tests check it against answers recorded from the published 1.0.4. The changes:

- Node 20 or later, and only the package name can be imported (no `replace-string-at-position/index.js`).
- A number as `newString` (1.0.4 turned `5` into `'5'`) now throws; pass `String(value)`.
- Calls that 1.0.4 answered with damaged text now throw: a missing or non-number position (1.0.4 returned the text twice or joined the position as text), a negative, `NaN` or fractional position, a position past the end (1.0.4 appended), and a text argument that is not a string (1.0.4 wrote `null` or `[object Object]` into the result). The full list is in [CHANGELOG.md](CHANGELOG.md).
- The command-line tool described in the old README is gone; it was never installable.

## Limits and what it is not

It does not search: it replaces at the position you give, whatever is there. It has no regular expressions, no "replace all" and no Unicode-aware positions (grapheme clusters or code points); use `String.prototype.replace` or `replaceAll` for those. It runs in time linear in the length of the text.

## Package page

- npm: [replace-string-at-position](https://www.npmjs.com/package/replace-string-at-position)

## License

MIT, see [LICENSE](LICENSE).
