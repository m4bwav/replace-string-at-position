// A consumer written in CommonJS: require() of the installed package, used exactly as 1.0.4's README showed it.
// This fixture proves the require() promise of plan D2: the module is the function, with .default and the named property.
'use strict';

const assert = require('node:assert/strict');
const replaceStringAtPosition = require('replace-string-at-position');
// Destructuring, the named-import habit in CommonJS.
const {replaceStringAtPosition: named} = require('replace-string-at-position');

assert.match(require.resolve('replace-string-at-position'), /[/\\]dist[/\\]index\.cjs$/u, 'require resolves to the CommonJS build');

assert.equal(typeof replaceStringAtPosition, 'function');
assert.equal(replaceStringAtPosition('222', '2', '3', 1), '232');
assert.equal(replaceStringAtPosition.default, replaceStringAtPosition);
assert.equal(replaceStringAtPosition.replaceStringAtPosition, replaceStringAtPosition);

assert.equal(named('hello world', 'world', 'there', 6), 'hello there');

assert.throws(() => replaceStringAtPosition('abc', 'b', 'X'), TypeError);

console.log('cjs-node ok');
