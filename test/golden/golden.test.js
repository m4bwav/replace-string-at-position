/*
The golden suite: the contract with the published 1.0.4. test/golden/1.0.4.json was captured from the published 1.0.4 by
capture-1.0.4.cjs in a scratch project, with codec.cjs; never regenerate it from this repository's code, and never loosen a comparison.

Every well-formed call (three strings or String objects and an integer position from 0 to the text's length) returns exactly
what 1.0.4 returned, from both builds. The other calls are the named exceptions below, one per changelog line (plan D1 and D3):
each asserts the error class and that the message names the argument.
*/
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {describe, test} from 'node:test';
import {builds} from '../helpers/builds.js';

// The encoding the capture used: arguments decoded fresh per call, results and thrown errors encoded (see codec.cjs).
const {decode, capture} = createRequire(import.meta.url)('./codec.cjs');

const golden = JSON.parse(readFileSync(new URL('1.0.4.json', import.meta.url), 'utf8'));

// A string or a String object (the codec decodes `$new: 'String'` to one).
const isText = value => typeof value === 'string' || Object.prototype.toString.call(value) === '[object String]';
const textsAreStrings = args => args.length >= 3 && args.slice(0, 3).every(value => isText(value));
const length = text => String(text).length;

// Cases 2.0.0 answers differently on purpose, each with the changelog line that documents it. The order matters: a case
// takes the first exception it matches, so a bad text argument is reported before a bad position, as the function checks them.
const EXCEPTIONS = [
  {
    name: 'every text argument must be a string (CHANGELOG: Changed, a non-string text argument throws a TypeError)',
    matches: args => !textsAreStrings(args),
    check: call => assert.throws(call, {name: 'TypeError', message: /^Expected `(?:originalString|sourceString|newString)` to be a string, got /u}),
  },
  {
    name: 'a missing or non-number position throws a TypeError (CHANGELOG: Changed)',
    matches: args => typeof args[3] !== 'number',
    check: call => assert.throws(call, {name: 'TypeError', message: /^Expected `position` to be a number, got /u}),
  },
  {
    name: 'a negative, NaN or fractional position throws a RangeError (CHANGELOG: Changed)',
    matches: args => args[3] < 0 || Number.isNaN(args[3]) || (Number.isFinite(args[3]) && args[3] % 1 !== 0),
    check: call => assert.throws(call, {name: 'RangeError', message: /^Expected `position` to be an integer from 0 to \d+, got /u}),
  },
  {
    name: 'a position past the end of the text throws a RangeError (CHANGELOG: Changed; plan D3c)',
    matches: args => args[3] > length(args[0]),
    check: call => assert.throws(call, {name: 'RangeError', message: /^Expected `position` to be an integer from 0 to \d+, got /u}),
  },
];

const label = (index, entry) => `#${index} ${entry.method}(${JSON.stringify(entry.args).slice(1, -1).slice(0, 60)})`;

test('the capture holds 26 well-formed cases kept exactly and 45 named exceptions (plan D1)', () => {
  const counts = new Map();
  for (const entry of golden.cases) {
    const exception = EXCEPTIONS.find(candidate => candidate.matches(decode(entry.args)));
    counts.set(exception?.name ?? 'exact', (counts.get(exception?.name ?? 'exact') ?? 0) + 1);
  }

  assert.equal(golden.cases.length, 71);
  assert.equal(counts.size, EXCEPTIONS.length + 1);
  assert.equal(counts.get('exact'), 26);
  assert.deepEqual(EXCEPTIONS.map(exception => counts.get(exception.name)), [22, 10, 8, 5]);
});

for (const {name, lib} of builds) {
  describe(`1.0.4 golden cases (${name} build)`, () => {
    for (const [index, entry] of golden.cases.entries()) {
      test(label(index, entry), () => {
        const exception = EXCEPTIONS.find(candidate => candidate.matches(decode(entry.args)));
        if (exception) {
          exception.check(() => lib[entry.method](...decode(entry.args)), entry);
          return;
        }

        const results = Array.from({length: entry.calls ?? 1}, () => capture(() => lib[entry.method](...decode(entry.args))));
        assert.deepEqual(results, entry.results);
      });
    }
  });
}
