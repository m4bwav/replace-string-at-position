// For random texts and every allowed position, both builds return what 1.0.4's formula returned and what slice() describes.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {builds} from '../helpers/builds.js';

// 1.0.4's index.js, with const for var: the oracle for well-formed calls.
function oldReplace(originalString, sourceString, newString, position) {
  // eslint-disable-next-line unicorn/prefer-string-slice -- the old code, as published
  const prefix = originalString.substring(0, position);
  // eslint-disable-next-line unicorn/prefer-string-slice -- the old code, as published
  const postfix = originalString.substring(position + sourceString.length, originalString.length);
  return prefix + newString + postfix;
}

// Mulberry32: a small seeded generator, so a failure prints a seed that reproduces it. It is 32-bit integer arithmetic by design.
/* eslint-disable no-bitwise -- mulberry32 is defined in bitwise operations */
function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D_2B_79_F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/* eslint-enable no-bitwise -- end of mulberry32 */

// Letters, a combining mark, a BMP symbol and an astral emoji, so positions can fall inside a surrogate pair.
const ALPHABET = ['a', 'b', 'Z', ' ', '́', 'é', '€', '😀', '\n'];

function randomText(random, maxParts) {
  let text = '';
  const parts = Math.floor(random() * (maxParts + 1));
  for (let index = 0; index < parts; index++) {
    text += ALPHABET[Math.floor(random() * ALPHABET.length)];
  }

  return text;
}

const SEED = 20_260_925;
const ROUNDS = 400;

for (const {name, lib} of builds) {
  test(`${name} build: ${ROUNDS} random texts, every position, the old formula (seed ${SEED})`, () => {
    const random = mulberry32(SEED);
    let checked = 0;
    for (let round = 0; round < ROUNDS; round++) {
      const text = randomText(random, 12);
      const source = randomText(random, 4);
      const replacement = randomText(random, 4);
      for (let position = 0; position <= text.length; position++) {
        const got = lib.replaceStringAtPosition(text, source, replacement, position);
        const context = JSON.stringify({
          round, text, source, replacement, position,
        });
        assert.equal(got, oldReplace(text, source, replacement, position), context);
        assert.equal(got, text.slice(0, position) + replacement + text.slice(position + source.length), context);
        checked++;
      }
    }

    assert.ok(checked > ROUNDS, `only ${checked} calls were checked`);
  });
}
