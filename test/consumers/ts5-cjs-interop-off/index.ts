// A TypeScript 5 consumer with an old CommonJS config: esModuleInterop off, node10 resolution. It type-checks the three import
// forms such projects write against the published declaration, then runs the compiled JavaScript.
import assert = require('node:assert/strict');
import replaceStringAtPosition = require('replace-string-at-position');
import * as namespace from 'replace-string-at-position';
import defaultImport, {replaceStringAtPosition as named} from 'replace-string-at-position';

const results: string[] = [
  replaceStringAtPosition('222', '2', '3', 1),
  replaceStringAtPosition.default('222', '2', '3', 1),
  replaceStringAtPosition.replaceStringAtPosition('222', '2', '3', 1),
  namespace('222', '2', '3', 1),
  namespace.default('222', '2', '3', 1),
  defaultImport('222', '2', '3', 1),
  named('222', '2', '3', 1),
];

assert.deepEqual(results, Array.from({length: 7}, () => '232'));
console.log('ts5-cjs-interop-off ok');
