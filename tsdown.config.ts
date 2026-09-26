import {readFileSync, writeFileSync} from 'node:fs';
import {defineConfig, type UserConfig} from 'tsdown';

// With `sourcemap: true` the declaration files still end in a sourceMappingURL comment although no declaration map is written (tsdown 0.23.0); drop the dangling reference.
function dropDeclarationMapComment(file: string): () => void {
  return () => {
    writeFileSync(file, readFileSync(file, 'utf8').replace(/\n\/\/# sourceMappingURL=\S+$/u, '\n'));
  };
}

const shared: UserConfig = {
  platform: 'neutral',
  // No declaration maps: they would point into src/, which is not published.
  dts: {sourcemap: false},
  fixedExtension: true,
  sourcemap: true,
  // The package.json entry points are written by hand (test/package/shape.test.js pins them): two configs cannot share `exports: true`.
  exports: false,
};

// Two builds from two entries, because the module systems get different shapes (plan D2):
// ESM has a default and a named export; CommonJS is the function itself, as 1.0.4 was, carrying `.default` and the named property.
export default defineConfig([
  {
    ...shared,
    entry: {index: 'src/index.ts'},
    format: 'esm',
    // The JSDoc lives in the declaration files, where editors read it; dropping it from the JavaScript keeps the tarball small.
    outputOptions: {comments: {jsdoc: false}},
    hooks: {'build:done': dropDeclarationMapComment('dist/index.d.mts')},
  },
  {
    ...shared,
    entry: {index: 'src/require.ts'},
    format: 'cjs',
    // The entry's only export is its default, so tsdown's cjsDefault (on by default) writes it as `module.exports = ...` and the
    // declaration as `export = ...`. Setting rolldown's `exports: 'default'` instead fails the declaration build (tsdown 0.23.0).
    cjsDefault: true,
    outputOptions: {comments: {jsdoc: false}},
    hooks: {'build:done': dropDeclarationMapComment('dist/index.d.cts')},
  },
]);
