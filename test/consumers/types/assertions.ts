/*
Compile-time checks on the published declaration files. The runner copies this file into each TypeScript fixture as index.ts, so
it is checked under that fixture's module and resolution settings (ESM and CommonJS under nodenext, bundler, node10).
Under nodenext CommonJS and node10 the declaration is the `export =` form; the default import then relies on esModuleInterop,
which those fixtures leave to TypeScript's default for their module setting.
*/
import replaceStringAtPosition, {replaceStringAtPosition as named} from 'replace-string-at-position';

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;

type Signature = (originalString: string, sourceString: string, newString: string, position: number) => string;

// Compiles only when the argument is assignable to T.
declare function expectType<T>(value: T): void;

expectType<Signature>(replaceStringAtPosition);
expectType<Signature>(named);

export type Checks = [
  Expect<Equal<ReturnType<typeof replaceStringAtPosition>, string>>,
  Expect<Equal<Parameters<typeof named>, [originalString: string, sourceString: string, newString: string, position: number]>>,
];

export const result: string = replaceStringAtPosition('abc', 'b', 'X', 1);

// @ts-expect-error -- a position must be a number
replaceStringAtPosition('abc', 'b', 'X', '1');

// @ts-expect-error -- all four arguments are required
named('abc', 'b', 'X');
