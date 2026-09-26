// The API of both builds: the export shapes, each refusal's class and message (plan D3 and D7), and the boundaries.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {describe, test} from 'node:test';
import vm from 'node:vm';
import {builds} from '../helpers/builds.js';

const require = createRequire(import.meta.url);

describe('export shapes (plan D2)', () => {
  test('require() returns the function itself, as 1.0.4 did, with .default and the named property pointing to it', () => {
    const library = require('../../dist/index.cjs');
    assert.equal(typeof library, 'function');
    assert.equal(library.name, 'replaceStringAtPosition');
    assert.equal(library.length, 4);
    assert.equal(library.default, library);
    assert.equal(library.replaceStringAtPosition, library);
    // The old README's example.
    assert.equal(library('222', '2', '3', 1), '232');
  });

  test('the ES module has the function as its default export and under its name', async () => {
    const module = await import('../../dist/index.mjs');
    assert.deepEqual(Object.keys(module).toSorted((a, b) => a.localeCompare(b)), ['default', 'replaceStringAtPosition']);
    assert.equal(module.default, module.replaceStringAtPosition);
    assert.equal(module.default.length, 4);
  });

  test('the CommonJS build is strict, as 1.0.4 was: the function has no own caller or arguments', () => {
    const library = require('../../dist/index.cjs');
    assert.equal(Object.hasOwn(library, 'caller'), false);
    assert.equal(Object.hasOwn(library, 'arguments'), false);
  });

  test('a detached call works (the function uses no `this`)', () => {
    const {replaceStringAtPosition: detached} = require('../../dist/index.cjs');
    assert.equal(detached('abc', 'b', 'X', 1), 'aXc');
  });
});

for (const {name, lib} of builds) {
  const replace = lib.replaceStringAtPosition;

  describe(`replaceStringAtPosition (${name} build)`, () => {
    test('replaces by the length of the source text, without comparing it', () => {
      const rows = [
        [['hello world', 'world', 'there', 6], 'hello there'],
        [['hello', 'xyz', 'abc', 0], 'abclo'],
        [['abc', 'bcdef', 'X', 1], 'aX'],
        [['abc', '', 'X', 1], 'aXbc'],
        [['abc', 'b', '', 1], 'ac'],
        [['', '', '', 0], ''],
      ];
      for (const [args, expected] of rows) {
        assert.equal(replace(...args), expected, JSON.stringify(args));
      }
    });

    test('positions 0 and the text\'s length are both allowed; -0 counts as 0', () => {
      assert.equal(replace('abc', 'a', 'X', 0), 'Xbc');
      assert.equal(replace('abc', 'x', 'Y', 3), 'abcY');
      assert.equal(replace('', 'a', 'X', 0), 'X');
      assert.equal(replace('abc', 'a', 'X', -0), 'Xbc');
    });

    test('positions count UTF-16 code units, as String.prototype.slice does', () => {
      assert.equal(replace('a😀b', '😀', 'X', 1), 'aXb');
      assert.equal(replace('😀b', 'b', 'X', 1), '\u{D83D}Xb');
      assert.equal(replace('😀😀', '😀', 'x', 2), '😀x');
    });

    test('String objects are accepted for every text argument, from this realm and from another', () => {
      /* eslint-disable no-new-wrappers, unicorn/new-for-builtins -- 1.0.4 accepted String objects, so v2 is tested with them */
      assert.equal(replace(new String('abc'), new String('b'), new String('X'), 1), 'aXc');
      /* eslint-enable no-new-wrappers, unicorn/new-for-builtins -- end of the String objects */
      const foreign = vm.runInNewContext('new String("abc")');
      assert.equal(replace(foreign, 'b', 'X', 1), 'aXc');
    });

    test('extra arguments are ignored, and the arguments are not changed', () => {
      assert.equal(replace('abc', 'b', 'X', 1, 'extra'), 'aXc');
      const args = ['abc', 'b', 'X', 1];
      replace(...args);
      assert.deepEqual(args, ['abc', 'b', 'X', 1]);
    });

    test('a text argument that is not a string throws a TypeError naming it', () => {
      const rows = [
        [[null, 'a', 'X', 0], 'Expected `originalString` to be a string, got null'],
        [[undefined, 'a', 'X', 0], 'Expected `originalString` to be a string, got undefined'],
        [[12_345, '3', 'X', 2], 'Expected `originalString` to be a string, got 12345'],
        [[['a', 'b'], 'b', 'X', 1], 'Expected `originalString` to be a string, got an array'],
        [['abcdef', {length: 3}, 'X', 1], 'Expected `sourceString` to be a string, got an object'],
        [['abcdef', 5, 'X', 1], 'Expected `sourceString` to be a string, got 5'],
        [['abcdef', 'b', null, 1], 'Expected `newString` to be a string, got null'],
        [['abcdef', 'b', 1n, 1], 'Expected `newString` to be a string, got a bigint'],
        [['abcdef', 'b', Symbol('x'), 1], 'Expected `newString` to be a string, got a symbol'],
        [['abcdef', 'b', () => 'x', 1], 'Expected `newString` to be a string, got a function'],
      ];
      for (const [args, message] of rows) {
        assert.throws(() => replace(...args), {name: 'TypeError', message}, String(message));
      }
    });

    test('a position that is not a number throws a TypeError, checked after the text arguments', () => {
      const rows = [
        [undefined, 'undefined'],
        [null, 'null'],
        ['1', 'the string "1"'],
        ['a very long position string indeed', 'the string "a very long position..."'],
        [true, 'a boolean'],
        [[2], 'an array'],
        [1n, 'a bigint'],
        // eslint-disable-next-line no-new-wrappers, unicorn/new-for-builtins
        [new Number(2), 'an object'],
      ];
      for (const [position, got] of rows) {
        assert.throws(() => replace('abcdef', 'b', 'X', position), {name: 'TypeError', message: `Expected \`position\` to be a number, got ${got}`});
      }

      assert.throws(() => replace(null, 'b', 'X', 'x'), {name: 'TypeError', message: /`originalString`/u});
    });

    test('a position outside 0 to the text\'s length, or not an integer, throws a RangeError', () => {
      for (const position of [-1, -5, -Infinity, NaN, 1.5, 0.1, 4, 10, 2 ** 53, Number.MAX_VALUE, Infinity]) {
        assert.throws(() => replace('abc', 'b', 'X', position), {name: 'RangeError', message: `Expected \`position\` to be an integer from 0 to 3, got ${position}`}, String(position));
      }
    });

    test('an argument\'s own toString and valueOf are never called', () => {
      const trap = {
        toString() {
          throw new Error('toString called');
        },
        valueOf() {
          throw new Error('valueOf called');
        },
      };
      for (const args of [[trap, 'b', 'X', 1], ['abc', trap, 'X', 1], ['abc', 'b', trap, 1], ['abc', 'b', 'X', trap]]) {
        assert.throws(() => replace(...args), TypeError);
      }
    });

    test('a String object is read by its internal value: overrides are ignored and a Proxy is refused (1.0.4 called them)', () => {
      /* eslint-disable no-new-wrappers, unicorn/new-for-builtins -- the String objects under test */
      const overridden = Object.assign(new String('X'), {valueOf: () => 'Z', toString: () => 'Z', substring: () => 'Q'});
      assert.equal(replace('abc', 'b', overridden, 1), 'aXc');
      const ownSubstring = Object.assign(new String('abc'), {substring: () => 'Q'});
      assert.equal(replace(ownSubstring, 'b', 'X', 1), 'aXc');
      assert.throws(() => replace('abc', new Proxy(new String('b'), {}), 'X', 1), {name: 'TypeError', message: 'Expected `sourceString` to be a string, got an object'});
      /* eslint-enable no-new-wrappers, unicorn/new-for-builtins -- end of the String objects */
    });

    test('error messages stay short and well-formed for odd values', () => {
      // A long string is cut at 20 code points, never inside a surrogate pair.
      assert.throws(() => replace('abc', 'b', 'X', 'a😀'.repeat(20)), {message: `Expected \`position\` to be a number, got the string "${'a😀'.repeat(10)}..."`});
      // A huge BigInt is not printed.
      assert.throws(() => replace('abc', 'b', 'X', 2n ** 4096n), {message: 'Expected `position` to be a number, got a bigint'});
      // A revoked Proxy gets the package's own message, not the engine's.
      const {proxy, revoke} = Proxy.revocable({}, {});
      revoke();
      assert.throws(() => replace('abc', 'b', proxy, 1), {name: 'TypeError', message: 'Expected `newString` to be a string, got an object'});
    });
  });
}
