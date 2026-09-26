'use strict';
// Records what the PUBLISHED replace-string-at-position 1.0.4 returns, so 2.0.0 can prove what it kept and list what it changed.
// From the package-modernize skill's scripts/golden-capture-npm.template.cjs. Run on 2026-09-25 local time (the header's date
// is UTC, 2026-09-26) with Node 24.18.0, in a scratch project, never in the repository:
//   npm init -y && npm install replace-string-at-position@1.0.4
//   copy codec.cjs (templates/npm/test/golden/codec.cjs in the skill) next to this file
//   node capture-1.0.4.cjs > 1.0.4.json
// Cases are JavaScript values; codec.cjs keeps NaN, -0, Infinity, undefined and wrapper objects through JSON.

const {encode, decode, capture} = require('./codec.cjs');

const library = require('replace-string-at-position');
const packageVersion = require('replace-string-at-position/package.json').version;

// 1.0.4 does `module.exports = replaceStringAtPosition`.
const target = typeof library === 'function' ? {[library.name || 'default']: library} : library;

function runCase(method, args, calls = 1) {
  const encoded = encode(args);
  const results = [];
  for (let index = 0; index < calls; index++) {
    results.push(capture(() => target[method](...decode(encoded))));
  }

  return {method, args: encoded, calls, results};
}

const m = 'replaceStringAtPosition';
const methodCases = [
  // The README's example and ordinary use.
  [m, ['222', '2', '3', 1]],
  [m, ['hello world', 'world', 'there', 6]],
  [m, ['abc', 'a', 'X', 0]],
  [m, ['abc', 'c', 'X', 2]],
  [m, ['abc', 'bc', 'XYZ', 1]],
  [m, ['abc', 'b', '', 1]],
  [m, ['abc', '', 'X', 1]],
  [m, ['a.b.c', '.', '-', 3]],
  // The source text is never compared with what is at the position; only its length is used.
  [m, ['hello', 'xyz', 'abc', 0]],
  [m, ['hello', 'zz', 'L', 2]],
  [m, ['abc', 'bcdef', 'X', 1]],
  // Empty strings.
  [m, ['', 'a', 'X', 0]],
  [m, ['', '', '', 0]],
  [m, ['', '', 'X', 5]],
  [m, ['abc', '', '', 1]],
  // Positions at and past the ends.
  [m, ['abc', 'x', 'Y', 3]],
  [m, ['abc', 'x', 'Y', 10]],
  [m, ['abc', 'xy', 'Y', 2]],
  [m, ['abc', 'x', 'Y', 2 ** 53]],
  [m, ['abc', 'x', 'Y', Number.MAX_VALUE]],
  [m, ['abc', 'x', 'Y', Infinity]],
  // Negative positions.
  [m, ['abcdef', 'b', 'X', -1]],
  [m, ['abcdef', 'bc', 'X', -1]],
  [m, ['abcdef', 'bcd', 'X', -1]],
  [m, ['abcdef', 'b', 'X', -5]],
  [m, ['abcdef', 'b', 'X', -Infinity]],
  [m, ['abcdef', 'b', 'X', -0]],
  // Non-integer and non-number positions.
  [m, ['abcdef', 'b', 'X', 1.5]],
  [m, ['abcdef', 'b', 'X', 1.9]],
  [m, ['abcdef', 'b', 'X', NaN]],
  [m, ['abcdef', 'b', 'X', undefined]],
  [m, ['abcdef', 'b', 'X', null]],
  [m, ['abcdef', 'b', 'X', '1']],
  [m, ['abcdef', 'b', 'X', '']],
  [m, ['abcdef', 'b', 'X', 'x']],
  [m, ['abcdef', 'b', 'X', true]],
  [m, ['abcdef', 'b', 'X', [2]]],
  [m, ['abcdef', 'b', 'X', 1n]],
  [m, ['abcdef', 'b', 'X', new Number(2)]],
  // Characters outside the Basic Multilingual Plane: positions and lengths count UTF-16 code units.
  [m, ['a😀b', '😀', 'X', 1]],
  [m, ['😀b', 'b', 'X', 1]],
  [m, ['a😀b', 'a', '😎', 0]],
  [m, ['😀😀', '😀', 'x', 2]],
  [m, ['été', 'é', 'E', 0]],
  // Non-string original text.
  [m, [null, 'a', 'X', 0]],
  [m, [undefined, 'a', 'X', 0]],
  [m, [12_345, '3', 'X', 2]],
  [m, [['a', 'b', 'c'], 'b', 'X', 1]],
  [m, [{}, 'a', 'X', 0]],
  [m, [new String('abc'), 'b', 'X', 1]],
  [m, [true, 'r', 'X', 1]],
  // Non-string source text: only .length is read.
  [m, ['abcdef', null, 'X', 1]],
  [m, ['abcdef', undefined, 'X', 1]],
  [m, ['abcdef', 5, 'X', 1]],
  [m, ['abcdef', ['q', 'r'], 'X', 1]],
  [m, ['abcdef', {length: 3}, 'X', 1]],
  [m, ['abcdef', {length: '2'}, 'X', 1]],
  [m, ['abcdef', new String('bc'), 'X', 1]],
  [m, ['abcdef', {}, 'X', 1]],
  // Non-string replacement text: string concatenation coerces it.
  [m, ['abcdef', 'b', null, 1]],
  [m, ['abcdef', 'b', undefined, 1]],
  [m, ['abcdef', 'b', 42, 1]],
  [m, ['abcdef', 'b', {}, 1]],
  [m, ['abcdef', 'b', ['x', 'y'], 1]],
  [m, ['abcdef', 'b', new String('Z'), 1]],
  [m, ['abcdef', 'b', 1n, 1]],
  // Missing and extra arguments.
  [m, []],
  [m, ['abc']],
  [m, ['abc', 'b']],
  [m, ['abc', 'b', 'X']],
  [m, ['abc', 'b', 'X', 1, 'extra']],
];

const cases = methodCases.map(([method, args, calls]) => runCase(method, args, calls));

// Evidence, not asserted as golden values: the module's shape and the calls the codec cannot store.
const quirks = {
  requireResult: typeof library,
  functionName: library.name,
  functionLength: library.length,
  ownKeys: Reflect.ownKeys(library).map(String),
  symbolReplacement: capture(() => library('abc', 'b', Symbol('s'), 1)),
  symbolPosition: capture(() => library('abc', 'b', 'X', Symbol('s'))),
  // `this` is never read, so calling it detached or on another receiver changes nothing.
  detachedCall: capture(() => library.call({}, 'abc', 'b', 'X', 1)),
  // The documented CLI: cli.js is in the tarball but package.json has no "bin", so installing gives no command.
  binField: require('replace-string-at-position/package.json').bin ?? null,
};

const header = {
  package: `replace-string-at-position@${packageVersion}`,
  dependencies: {},
  node: process.version,
  captured: new Date().toISOString().slice(0, 10),
  note: 'Golden outputs of the published 1.0.4; see test/golden/capture-1.0.4.cjs and codec.cjs for the format.',
  quirks,
};

// One case per line keeps the file diffable.
const lines = cases.map(entry => JSON.stringify(entry));
process.stdout.write(`${JSON.stringify(header, null, '\t').slice(0, -2)},\n\t"cases": [\n\t\t${lines.join(',\n\t\t')}\n\t]\n}\n`);
