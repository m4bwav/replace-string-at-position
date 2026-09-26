// A consumer written as an ES module: default and named imports of the installed package. Runs under Node, Bun and Deno.
// With the path of the 1.0.4 golden file as its argument, it replays every case: well-formed calls must give 1.0.4's answer,
// every other call must throw a TypeError or RangeError (plan D1 and D3).
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import process from 'node:process';
import replaceStringAtPosition, {replaceStringAtPosition as named} from 'replace-string-at-position';

assert.equal(typeof replaceStringAtPosition, 'function');
assert.equal(replaceStringAtPosition, named);
if (typeof import.meta.resolve === 'function') {
  assert.match(import.meta.resolve('replace-string-at-position'), /\/dist\/index\.mjs$/u, 'import resolves to the ESM build');
}

// The old README's example, golden case #0.
assert.equal(replaceStringAtPosition('222', '2', '3', 1), '232');

// The subset of test/golden/codec.cjs the 1.0.4 capture uses, so the fixture needs nothing but the JSON.
function decode(value) {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(item => decode(item));
  }

  if (value.$undefined === true) {
    return undefined;
  }

  if ('$number' in value) {
    return value.$number === '-0' ? -0 : Number(value.$number);
  }

  if ('$bigint' in value) {
    return BigInt(value.$bigint);
  }

  if ('$new' in value) {
    const Wrapper = value.$new === 'String' ? String : Number;
    // eslint-disable-next-line unicorn/new-for-builtins -- the capture recorded String and Number objects as arguments
    return new Wrapper(value.value);
  }

  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, decode(item)]));
}

const isText = value => typeof value === 'string' || Object.prototype.toString.call(value) === '[object String]';
const wellFormed = args => args.length >= 4 && args.slice(0, 3).every(value => isText(value))
  && Number.isSafeInteger(args[3]) && args[3] >= 0 && args[3] <= String(args[0]).length;

const [goldenFile] = process.argv.slice(2);
if (goldenFile) {
  const golden = JSON.parse(readFileSync(goldenFile, 'utf8'));
  let exact = 0;
  for (const [index, entry] of golden.cases.entries()) {
    const args = decode(entry.args);
    if (wellFormed(args)) {
      assert.equal(replaceStringAtPosition(...args), entry.results[0], `case ${index}`);
      exact++;
    } else {
      assert.throws(() => replaceStringAtPosition(...args), error => error instanceof TypeError || error instanceof RangeError, `case ${index}`);
    }
  }

  assert.equal(exact, 26);
}

console.log('esm-node ok');
