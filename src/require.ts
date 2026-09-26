// The CommonJS entry. 1.0.4 did `module.exports = replaceStringAtPosition`, so require() still returns the function. It also
// carries `.default` and `.replaceStringAtPosition`, the two shapes transpiled callers and named-import habits reach for.
// A default export is this entry's only export, so the build writes it as `module.exports =` (tsdown's cjsDefault).
import {replaceStringAtPosition} from './replace-string-at-position.js';

type ReplaceStringAtPosition = typeof replaceStringAtPosition & {
  default: typeof replaceStringAtPosition;
  replaceStringAtPosition: typeof replaceStringAtPosition;
};

const callable: ReplaceStringAtPosition = Object.assign(replaceStringAtPosition, {
  default: replaceStringAtPosition,
  replaceStringAtPosition,
});

export default callable;
