// wiki-verify for replace-string-at-position@2.0.0: runs every example on the wiki against the
// PUBLISHED package, never the working tree. Keep the filled-in copy in the repository
// as ai-docs/notes/<date>-wiki-verify.mjs so the next release can run it again.
//
// Run it from a scratch folder outside the repository (package.json written with an editor as {"private": true}):
//   npm install replace-string-at-position@2.0.0 typescript@7.0.2 typescript6@npm:typescript@6.0.3 typescript5@npm:typescript@5.9.3
//   in a second folder OLD: npm install replace-string-at-position@1.0.4
//   in a third folder RT: npm install deno bun (the binaries come from npm)
//   GOLDEN=<clone>/test/golden OLD=<OLD> RT=<RT> node wiki-verify.mjs > wiki-verify.out.txt
//   the same with OLDEST_NODE=20 for the Node 20 run (wiki-verify.node20.out.txt)
//
// Every case prints "## <label>" and then its output. Paste outputs into the pages
// exactly as printed; a page never shows output this script did not produce, and never
// one converted by hand (a JSON value retyped as console.log shows it): add a case that
// prints the page's form instead (L-008, L-019). Save the output beside this file as
// ai-docs/notes/<date>-wiki-verify.out.txt with 127.0.0.1:<digits> replaced by
// 127.0.0.1:<port>, and check the pages with `wikiwright.py outputs <wiki dir> <that file>`. Each code block on
// a page is here as the page shows it, in a snippet(): check with `wikiwright.py snippets <wiki dir> <this file>`.
// Keep time zones, absolute paths and timings out of the output (L-022).
// OLDEST_NODE=<major> reruns everything under the oldest Node in engines (the last section, L-106); compare
// the two outputs, and a new release's output with the saved one, with `wikiwright.py diffout OLD NEW`.

import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import path from 'node:path';
import {chmodSync, copyFileSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

// Everything runs in this file's folder, so no shell needs to change directory first.
process.chdir(path.dirname(fileURLToPath(import.meta.url)));

const PACKAGE = 'replace-string-at-position';
const VERSION = '2.0.0';
const require = createRequire(import.meta.url);

function show(label, value) {
	console.log(`## ${label}`);
	console.log(typeof value === 'string' ? value : inspect(value));
	console.log();
}

function inspect(value) {
	// JSON with the cases JSON loses kept visible: undefined, errors, NaN.
	return JSON.stringify(value, (key, v) => {
		if (v === undefined) {
			return '<undefined>';
		}

		if (v instanceof Error) {
			return {name: v.name, message: v.message, ...v};
		}

		if (typeof v === 'number' && !Number.isFinite(v)) {
			return String(v);
		}

		return v;
	}, 2);
}

// Any other program (a runtime from npm, a package manager, bash, the golden capture), asynchronously,
// with LF line endings. On Windows spawn .cmd shims with shell: true. Standard input is closed (or gets
// `input`): a CLI that reads stdin when it has no argument would otherwise wait for ever (L-007).
function run(file, args, {cwd = process.cwd(), env = {}, shell = false, input = ''} = {}) {
	return new Promise(resolve => {
		const child = spawn(file, args, {cwd, env: {...process.env, ...env}, shell});
		child.stdin.end(input);
		let stdout = '';
		let stderr = '';
		child.stdout.on('data', chunk => {
			stdout += chunk;
		});
		child.stderr.on('data', chunk => {
			stderr += chunk;
		});
		child.on('close', code => {
			resolve({code, stdout: stdout.replaceAll('\r\n', '\n'), stderr: stderr.replaceAll('\r\n', '\n')});
		});
	});
}

// A shell snippet as a page shows it (BASH=<Git Bash's bash.exe> on Windows), printing first the Node it ran on,
// so an OLDEST_NODE rerun that picked up the system Node shows it (L-118).
function shell(script, options = {}) {
	return run(process.env.BASH || 'bash', ['-c', `echo "shell node: $(node --version)"; ${script}`], options);
}

async function capture(label, fn) {
	try {
		show(label, await fn());
	} catch (error) {
		show(`${label} (threw)`, `${error?.name}: ${error?.message}`);
	}
}

// ----- page examples, held as the text the page shows -----
// snippet() writes a page's code block to ./snippets/<label>.mjs (.cjs, .mts), runs it as a child with this Node
// (so OLDEST_NODE covers it) and prints what it printed: stdout, then stderr, then a non-zero exit code. The
// program holds every block as the page shows it, so `wikiwright.py snippets` finds each one. Start the template
// literal with a newline and close it on a line of its own. Inside it write each \ as \\, each ` as \` and each
// ${ as \${ (snippets reads the program with those three undone). Not String.raw: it keeps the \ before ` and ${.
// A //=> line prints the statement just above it as the REPL does (console.log('%O', ...)); a statement over
// several lines ends with its closing bracket at its first line's indent.
// Options: type 'module', 'commonjs' or 'typescript' (compiled by the scratch project's tsc, npm install
// typescript; `tsc` holds the flags, and its exit code prints first); before and after, code around the page's
// (the import the page left out, a call to the function it only defines); runtime and args (another program, or
// Node flags such as ['--import', path.resolve('route.mjs')]); env; cwd (a file-tree root: the file stays in
// ./snippets so its import resolves); replace, text swapped in the written file only. SNIPPET holds defaults the
// fixture sections set. runSnippet() returns the text instead of printing it, for inTree().
const SNIPPET = {replace: {}, env: {}};
const lead = line => line.match(/^\s*/)[0];
function prints(code) {
	const lines = code.split('\n');
	for (let end = 0; end < lines.length - 1; end++) {
		if (!/^\s*\/\/ ?=>/.test(lines[end + 1]) || !lines[end].trimEnd().endsWith(';')) {
			continue;
		}

		const indent = lead(lines[end]);
		let start = end;
		while (/^[)\]}]/.test(lines[end].trim()) && start > 0 && (start === end || !lines[start].trim() || lead(lines[start]) !== indent)) {
			start--;
		}

		if (!/^(const|let|var|import|export|return|if|for|while)\b/.test(lines[start].trim())) {
			lines[start] = `${indent}console.log('%O', ${lines[start].slice(indent.length)}`;
			lines[end] = lines[end].replace(/;\s*$/, ');');
		}
	}

	return lines.join('\n');
}

// dir (added for this package): the folder the snippet file is written to; a folder under OLD makes it import the old version.
async function runSnippet(label, code, {type = 'module', before = '', after = '', runtime = process.execPath, args = [], env = {}, cwd = process.cwd(), replace = SNIPPET.replace, dir = 'snippets', tsc = ['--strict', '--module', 'nodenext', '--moduleResolution', 'nodenext', '--target', 'es2022']} = {}) {
	const name = label.toLowerCase().replaceAll(/[^a-z\d]+/g, '-');
	let file = path.resolve(dir, name + {module: '.mjs', commonjs: '.cjs', typescript: '.mts'}[type]);
	let text = before + prints(code.replace(/^\n/, '')) + after;
	for (const [from, to] of Object.entries(replace)) {
		text = text.replaceAll(from, to);
	}

	mkdirSync(path.dirname(file), {recursive: true});
	writeFileSync(file, text);
	let out = '';
	if (type === 'typescript' && runtime === process.execPath) {
		// By path: TypeScript 7's exports map hides ./bin/tsc from require.resolve (L-141).
		const built = await run(runtime, [path.resolve('node_modules', 'typescript', 'bin', 'tsc'), ...tsc, '--outDir', 'snippets/tsc', path.relative('.', file)]);
		out = `tsc: exit ${built.code}\n${built.stdout}`;
		file = path.resolve('snippets', 'tsc', `${name}.mjs`);
	}

	const result = await run(runtime, [...args, file], {cwd, env: {...SNIPPET.env, ...env}});
	return out + result.stdout.replace(/\n$/, '') + (result.stderr ? `\n--- stderr\n${result.stderr.replace(/\n$/, '')}` : '') + (result.code ? `\nexit ${result.code}` : '');
}

async function snippet(label, code, options) {
	show(label, await runSnippet(label, code, options));
}
// ----- end of page examples -----

// ----- the installed package: version, both module systems, the bin -----
const pkgDir = path.join(process.cwd(), 'node_modules', ...PACKAGE.split('/'));
const pkg = JSON.parse(readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));
if (pkg.version !== VERSION) {
	throw new Error(`installed ${pkg.version}, expected ${VERSION}`);
}

show('installed', `${PACKAGE}@${pkg.version} on Node ${process.version}`);
const esm = await import(PACKAGE);
const cjs = require(PACKAGE);
show('esm exports', Object.keys(esm).sort());
show('cjs exports', Object.keys(cjs).sort());

// A package with a bin needs cli(), which `wikiwright.py scaffold` keeps only with --bin.
if (pkg.bin && typeof cli === 'undefined') {
	throw new Error('the package has a bin: run wikiwright.py scaffold again with --bin');
}

// ----- the cases: one per example on the wiki, labelled by page -----
// Every code block a page shows is a snippet() holding it as the page shows it; capture() and show() are for checks
// no page shows (errors, membership, the golden replay).
const {RT, OLD: OLD_DIR} = process.env;
const DENO = RT && path.join(RT, 'node_modules', 'deno', 'deno.exe');
const BUN = RT && path.join(RT, 'node_modules', 'bun', 'bin', 'bun.exe');

// TypeScript: the page's file compiled by each TypeScript the pages name (typescript is `latest`, typescript6 and
// typescript5 are aliases), then the output run with this Node. The flags are printed with the result.
const TYPESCRIPTS = ['typescript', 'typescript6', 'typescript5'];
const tsVersion = ts => JSON.parse(readFileSync(path.join('node_modules', ts, 'package.json'), 'utf8')).version;
async function tsCase(label, code, {ts = 'typescript', ext = 'mts', flags = []} = {}) {
	const name = label.toLowerCase().replaceAll(/[^a-z\d]+/g, '-');
	const dir = path.resolve('snippets', 'ts', `${name}-${ts}`);
	mkdirSync(dir, {recursive: true});
	const file = `index.${ext}`;
	writeFileSync(path.join(dir, file), code.replace(/^\n/, ''));
	const emit = flags.includes('--noEmit') ? [] : ['--outDir', 'out'];
	const built = await run(process.execPath, [path.resolve('node_modules', ts, 'bin', 'tsc'), '--strict', '--target', 'es2022', ...flags, ...emit, file], {cwd: dir});
	let out = `TypeScript ${tsVersion(ts)}, ${flags.join(' ')}: tsc exit ${built.code}${built.stdout.trim() ? `\n${built.stdout.trim()}` : ''}`;
	if (built.code === 0 && emit.length > 0) {
		const ran = await run(process.execPath, [path.join(dir, 'out', `index.${{mts: 'mjs', cts: 'cjs', ts: 'js'}[ext]}`)], {cwd: dir});
		out += `\n${ran.stdout.trim()}${ran.stderr ? `\n--- stderr\n${ran.stderr.trim()}` : ''}${ran.code ? `\nexit ${ran.code}` : ''}`;
	}

	return out;
}

// Home
await snippet('Home: first call', `
import replaceStringAtPosition from 'replace-string-at-position';

console.log(replaceStringAtPosition('hello world', 'world', 'there', 6));
`);

// Getting started
const ESM_PAGE = `
import replaceStringAtPosition from 'replace-string-at-position';
import {replaceStringAtPosition as named} from 'replace-string-at-position';

console.log(replaceStringAtPosition('222', '2', '3', 1));
console.log(named === replaceStringAtPosition);
`;
const CJS_PAGE = `
const replaceStringAtPosition = require('replace-string-at-position');
const {replaceStringAtPosition: named} = require('replace-string-at-position');

console.log(replaceStringAtPosition('222', '2', '3', 1));
console.log(named === replaceStringAtPosition, replaceStringAtPosition.default === replaceStringAtPosition);
`;
await snippet('Getting started: ESM', ESM_PAGE);
await snippet('Getting started: CommonJS', CJS_PAGE, {type: 'commonjs'});

if (BUN) {
	show('bun version', (await run(BUN, ['--version'])).stdout.trim());
	await snippet('Getting started: ESM under Bun', ESM_PAGE, {runtime: BUN});
	await snippet('Getting started: CommonJS under Bun', CJS_PAGE, {type: 'commonjs', runtime: BUN});
}

if (DENO) {
	show('deno version', (await run(DENO, ['--version'])).stdout.split('\n')[0].trim());
	await snippet('Getting started: Deno', `
import replaceStringAtPosition from 'npm:replace-string-at-position';

console.log(replaceStringAtPosition('222', '2', '3', 1));
`, {runtime: DENO, args: ['run']});
}

// The consumer setups the pages name, each compiled by every TypeScript in TYPESCRIPTS.
const TS_ESM = `
import replaceStringAtPosition, {replaceStringAtPosition as named} from 'replace-string-at-position';

const result: string = replaceStringAtPosition('abc', 'b', 'X', 1);
console.log(result, named === replaceStringAtPosition);
`;
const TS_REQUIRE = `
import replaceStringAtPosition = require('replace-string-at-position');

console.log(replaceStringAtPosition('abc', 'b', 'X', 1), replaceStringAtPosition.default('abc', 'b', 'Y', 1));
`;
const TS_DEFAULT = `
import replaceStringAtPosition from 'replace-string-at-position';

console.log(replaceStringAtPosition('abc', 'b', 'X', 1));
`;
const TS_INTEROP_OFF = `
import replaceStringAtPosition = require('replace-string-at-position');
import * as namespace from 'replace-string-at-position';

console.log(replaceStringAtPosition('abc', 'b', 'X', 1), namespace('abc', 'b', 'Y', 1));
`;
const NODENEXT = ['--module', 'nodenext', '--moduleResolution', 'nodenext'];
const deprecated = ts => (Number(tsVersion(ts).split('.')[0]) >= 6 ? ['--ignoreDeprecations', '6.0'] : []);
const SETUPS = [
	['nodenext ESM', TS_ESM, 'mts', () => NODENEXT],
	['nodenext CommonJS, import = require', TS_REQUIRE, 'cts', () => NODENEXT],
	['nodenext CommonJS, default import', TS_DEFAULT, 'cts', () => NODENEXT],
	['bundler', TS_ESM, 'ts', () => ['--module', 'esnext', '--moduleResolution', 'bundler', '--noEmit']],
	['node10', TS_DEFAULT, 'ts', ts => ['--module', 'commonjs', '--moduleResolution', 'node10', ...deprecated(ts)]],
	['node10, esModuleInterop off', TS_INTEROP_OFF, 'ts', ts => ['--module', 'commonjs', '--moduleResolution', 'node10', '--esModuleInterop', 'false', ...deprecated(ts)]],
];
for (const [setup, code, ext, flags] of SETUPS) {
	const results = [];
	for (const ts of TYPESCRIPTS) {
		results.push(await tsCase(`Getting started: TypeScript ${setup}`, code, {ts, ext, flags: flags(ts)}));
	}

	show(`Getting started: TypeScript ${setup}`, results.join('\n'));
}

// The repository's type assertions (test/consumers/types/assertions.ts, read only) under every TypeScript, against the
// published declarations: the "types" consumer setup, which the repository runs with its own TypeScript 6 only.
if (process.env.GOLDEN) {
	const assertions = readFileSync(path.join(process.env.GOLDEN, '..', 'consumers', 'types', 'assertions.ts'), 'utf8');
	const results = [];
	for (const [setup, ext, flags] of [['nodenext ESM', 'mts', NODENEXT], ['nodenext CommonJS', 'cts', NODENEXT], ['bundler', 'ts', ['--module', 'esnext', '--moduleResolution', 'bundler']]]) {
		for (const ts of TYPESCRIPTS) {
			results.push(`${setup}: ${(await tsCase(`types ${setup}`, assertions, {ts, ext, flags: [...flags, '--noEmit']})).split('\n').join(' | ')}`);
		}
	}

	show('Consumers: the type assertions', results.join('\n'));
}

show('Getting started: TypeScript type error',await tsCase('Getting started: TypeScript type error', `
import replaceStringAtPosition from 'replace-string-at-position';

replaceStringAtPosition('abc', 'b', 'X', '1');
`, {ext: 'mts', flags: NODENEXT}));

// API reference
await snippet('API reference: CommonJS shape', `
const replaceStringAtPosition = require('replace-string-at-position');

console.log(typeof replaceStringAtPosition, replaceStringAtPosition.name, replaceStringAtPosition.length);
console.log(Object.keys(replaceStringAtPosition));
`, {type: 'commonjs'});
await snippet('API reference: ESM shape', `
import * as module from 'replace-string-at-position';

console.log(Object.keys(module));
console.log(module.default === module.replaceStringAtPosition, module.default.default);
`);
await snippet('API reference: two copies', `
import {createRequire} from 'node:module';
import replaceStringAtPosition from 'replace-string-at-position';

const require = createRequire(import.meta.url);
console.log(require('replace-string-at-position') === replaceStringAtPosition);
`);

// How text is replaced (the behaviour page)
await snippet('Behaviour: the formula', `
import replaceStringAtPosition from 'replace-string-at-position';

const text = 'abcdef';
console.log(text.slice(0, 2) + 'X' + text.slice(2 + 'cd'.length));
console.log(replaceStringAtPosition(text, 'cd', 'X', 2));
`);
await snippet('Behaviour: only the length counts', `
import replaceStringAtPosition from 'replace-string-at-position';

replaceStringAtPosition('hello', 'xyz', 'abc', 0);
//=> 'abclo'
replaceStringAtPosition('abcdef', 'zz', 'X', 1);
//=> 'aXdef'
replaceStringAtPosition('abc', 'bcdef', 'X', 1);
//=> 'aX'
`);
await snippet('Behaviour: insert, delete, append', `
import replaceStringAtPosition from 'replace-string-at-position';

replaceStringAtPosition('abc', '', 'X', 1);
//=> 'aXbc'
replaceStringAtPosition('abc', 'b', '', 1);
//=> 'ac'
replaceStringAtPosition('abc', 'x', 'Y', 3);
//=> 'abcY'
replaceStringAtPosition('', 'a', 'X', 0);
//=> 'X'
replaceStringAtPosition('abc', 'a', 'X', -0);
//=> 'Xbc'
`);
await snippet('Behaviour: UTF-16 code units', `
import replaceStringAtPosition from 'replace-string-at-position';

'😀'.length;
//=> 2
replaceStringAtPosition('a😀b', '😀', 'X', 1);
//=> 'aXb'
replaceStringAtPosition('😀😀', '😀', 'x', 2);
//=> '😀x'
replaceStringAtPosition('😀b', 'b', 'X', 1);
//=> '\\uD83DXb'
`);
await snippet('Behaviour: combining marks', `
import replaceStringAtPosition from 'replace-string-at-position';

const composed = 'été'.normalize('NFC');
const decomposed = 'été'.normalize('NFD');
console.log(composed.length, decomposed.length);
console.log(replaceStringAtPosition(composed, 'é', 'E', 0));
console.log(replaceStringAtPosition(decomposed, 'e', 'E', 0).normalize('NFC'));
`);
await snippet('Behaviour: String objects', `
import replaceStringAtPosition from 'replace-string-at-position';

const wrapped = new String('X');
wrapped.valueOf = () => 'Z';
wrapped.toString = () => 'Z';
console.log(replaceStringAtPosition(new String('abc'), 'b', wrapped, 1));
`);
await snippet('Behaviour: extra arguments', `
import replaceStringAtPosition from 'replace-string-at-position';

replaceStringAtPosition('abc', 'b', 'X', 1, 'ignored');
//=> 'aXc'
`);

// Errors and edge cases
const ATTEMPT = `
function attempt(...args) {
	try {
		return JSON.stringify(replaceStringAtPosition(...args));
	} catch (error) {
		return \`\${error.name}: \${error.message}\`;
	}
}
`;
const IMPORT_LINE = `import replaceStringAtPosition from 'replace-string-at-position';\n`;
await snippet('Errors: text arguments', `
console.log(attempt(null, 'a', 'X', 0));
console.log(attempt(undefined, 'a', 'X', 0));
console.log(attempt(12345, '3', 'X', 2));
console.log(attempt(['a', 'b', 'c'], 'b', 'X', 1));
console.log(attempt('abcdef', {length: 3}, 'X', 1));
console.log(attempt('abcdef', ['b'], 'X', 1));
console.log(attempt('abcdef', 'b', 5, 1));
console.log(attempt('abcdef', 'b', null, 1));
console.log(attempt('abcdef', 'b', true, 1));
console.log(attempt('abcdef', 'b', 1n, 1));
console.log(attempt('abcdef', 'b', Symbol('x'), 1));
console.log(attempt('abcdef', 'b', () => 'x', 1));
`, {before: IMPORT_LINE + ATTEMPT});
await snippet('Errors: the attempt helper', `
import replaceStringAtPosition from 'replace-string-at-position';

function attempt(...args) {
	try {
		return JSON.stringify(replaceStringAtPosition(...args));
	} catch (error) {
		return \`\${error.name}: \${error.message}\`;
	}
}

console.log(attempt('abc', 'b', 'X', 1));
`);
await snippet('Errors: position type', `
console.log(attempt('abcdef', 'b', 'X'));
console.log(attempt('abcdef', 'b', 'X', null));
console.log(attempt('abcdef', 'b', 'X', '1'));
console.log(attempt('abcdef', 'b', 'X', 'a very long position string indeed'));
console.log(attempt('abcdef', 'b', 'X', true));
console.log(attempt('abcdef', 'b', 'X', [2]));
console.log(attempt('abcdef', 'b', 'X', 1n));
console.log(attempt('abcdef', 'b', 'X', new Number(2)));
`, {before: IMPORT_LINE + ATTEMPT});
await snippet('Errors: position range', `
console.log(attempt('abc', 'b', 'X', -1));
console.log(attempt('abc', 'b', 'X', 1.5));
console.log(attempt('abc', 'b', 'X', NaN));
console.log(attempt('abc', 'b', 'X', 4));
console.log(attempt('abc', 'b', 'X', Infinity));
console.log(attempt('abc', 'b', 'X', 2 ** 53));
console.log(attempt('', 'b', 'X', 1));
`, {before: IMPORT_LINE + ATTEMPT});
await snippet('Errors: order of checks', `
console.log(attempt(null, 'b', 'X', 'x'));
console.log(attempt('abc', null, 5, 1));
console.log(attempt('abc', 'b', 5, -1));
`, {before: IMPORT_LINE + ATTEMPT});
await snippet('Errors: proxies and wrappers', `
console.log(attempt('abc', new Proxy(new String('b'), {}), 'X', 1));
console.log(attempt('abc', 'b', Object('X'), 1));
`, {before: IMPORT_LINE + ATTEMPT});
await snippet('Errors: indexOf found nothing', `
import replaceStringAtPosition from 'replace-string-at-position';

const message = 'hi @bot please help';
const at = message.indexOf('@nobody');
console.log(at);
try {
	replaceStringAtPosition(message, '@nobody', '', at);
} catch (error) {
	console.log(error instanceof RangeError, error.message);
}
`);
capture('Errors: error objects have no code or extra fields', () => {
	try {
		cjs('abc', 'b', 'X');
	} catch (error) {
		return {name: error.name, ownKeys: Reflect.ownKeys(error), code: error.code, isTypeError: error instanceof TypeError};
	}
});

// Recipes
await snippet('Recipes: one match by its index', `
import replaceStringAtPosition from 'replace-string-at-position';

const text = 'See https://example.com and https://example.com/docs.';
const match = /https:\\/\\/example\\.com\\/docs/u.exec(text);
console.log(replaceStringAtPosition(text, match[0], '<link>', match.index));
`);
await snippet('Recipes: every match, right to left', `
import replaceStringAtPosition from 'replace-string-at-position';

const text = 'Call @ana, then @bo.';
const matches = [...text.matchAll(/@[a-z]+/gu)];

let result = text;
for (const match of matches.toReversed()) {
	result = replaceStringAtPosition(result, match[0], \`<\${match[0].slice(1)}>\`, match.index);
}

console.log(result);

let wrong = text;
for (const match of matches) {
	wrong = replaceStringAtPosition(wrong, match[0], \`<\${match[0].slice(1)}>\`, match.index);
}

console.log(wrong);
`);
await snippet('Recipes: remove a mention', `
import replaceStringAtPosition from 'replace-string-at-position';

const message = 'hi @bot please help';
const mention = '@bot ';
const at = message.indexOf(mention);
if (at !== -1) {
	console.log(replaceStringAtPosition(message, mention, '', at));
}
`);
await snippet('Recipes: replace only when the text is there', `
import replaceStringAtPosition from 'replace-string-at-position';

function replaceIfPresent(text, expected, replacement, position) {
	if (!text.startsWith(expected, position)) {
		return text;
	}

	return replaceStringAtPosition(text, expected, replacement, position);
}

console.log(replaceIfPresent('hello world', 'world', 'there', 6));
console.log(replaceIfPresent('hello world', 'earth', 'there', 6));
`);
await snippet('Recipes: code point positions', `
import replaceStringAtPosition from 'replace-string-at-position';

const text = '😀😀ab';
const codePointIndex = 2;
const position = [...text].slice(0, codePointIndex).join('').length;
console.log(position);
console.log(replaceStringAtPosition(text, 'a', 'A', position));
`);
await snippet('Recipes: several edits at known positions', `
import replaceStringAtPosition from 'replace-string-at-position';

const text = 'The quick fox';
const edits = [
	{position: 0, source: 'The', replacement: 'A'},
	{position: 10, source: 'fox', replacement: 'brown dog'},
];

let result = text;
for (const edit of edits.toSorted((a, b) => b.position - a.position)) {
	result = replaceStringAtPosition(result, edit.source, edit.replacement, edit.position);
}

console.log(result);
`);

// Versions and upgrading: the same CommonJS file against 1.0.4 (installed in OLD) and 2.0.0.
const UPGRADE_PAGE = `
const replaceStringAtPosition = require('replace-string-at-position');

function attempt(...args) {
	try {
		return JSON.stringify(replaceStringAtPosition(...args));
	} catch (error) {
		return \`\${error.name}: \${error.message}\`;
	}
}

console.log(attempt('222', '2', '3', 1));
console.log(attempt('hello world', 'world', 'there', 6));
console.log(attempt('abc', 'b', 'X'));
console.log(attempt('abcdef', 'b', 'X', '1'));
console.log(attempt('abcdef', 'b', 'X', -1));
console.log(attempt('abcdef', 'b', 'X', 1.5));
console.log(attempt('abc', 'x', 'Y', 10));
console.log(attempt('abcdef', 'b', null, 1));
console.log(attempt('item #0', '0', 5, 6));
console.log(attempt('abcdef', 'b', 'X', true));
console.log(attempt(null, 'a', 'X', 0));
`;
const DEEP_PAGE = `
try {
	require('replace-string-at-position/index.js');
	console.log('loaded');
} catch (error) {
	console.log(error.code);
}
`;
if (OLD_DIR) {
	const oldVersion = JSON.parse(readFileSync(path.join(OLD_DIR, 'node_modules', PACKAGE, 'package.json'), 'utf8')).version;
	show('Versions: old version installed', `${PACKAGE}@${oldVersion}`);
	await snippet('Versions: 1.0.4', UPGRADE_PAGE, {type: 'commonjs', dir: path.join(OLD_DIR, 'snippets')});
	await snippet('Versions: deep import on 1.0.4', DEEP_PAGE, {type: 'commonjs', dir: path.join(OLD_DIR, 'snippets')});
}

await snippet('Versions: 2.0.0', UPGRADE_PAGE, {type: 'commonjs'});
await snippet('Versions: deep import on 2.0.0', DEEP_PAGE, {type: 'commonjs'});

// ----- golden captures, replayed today (L-020, L-113) -----
// When the repository keeps test/golden/capture-<old>.cjs and <old>.json: set GOLDEN=<the clone's test/golden>
// and OLD=<a folder with PACKAGE@<old> and whatever the capture requires installed>. The capture runs as a
// child process, once against the old version (unchanged) and once here against VERSION (patch only the
// lines the new layout breaks, such as the bin's path, and name them on the page), one after the other.
// Compare the answers, the timing and the request lines apart. The golden file is only read. A capture that writes
// files needs TEMP, TMP and TMPDIR pointed into scratch and views for files instead (references/npm.md, "Packages
// that write files").
// A capture that records through its own proxy with TLS, replayed against a fetch-based major, also needs
// undici's EnvHttpProxyAgent after it sets the proxy variables and a fixture copy that serves CONNECT to
// port 80 in plain HTTP (references/npm.md, "Golden captures that record through a proxy with TLS").
const {GOLDEN, OLD} = process.env;
if (GOLDEN && OLD) {
	const CAPTURE = 'capture-1.0.4.cjs';
	const HELPERS = ['codec.cjs'];
	for (const file of [CAPTURE, ...HELPERS]) {
		copyFileSync(path.join(GOLDEN, file), path.join(OLD, file));
		copyFileSync(path.join(GOLDEN, file), file);
	}

	const patched = readFileSync(CAPTURE, 'utf8'); // .replaceAll(<old layout>, <new layout>)
	writeFileSync(`now-${CAPTURE}`, patched);
	const want = JSON.parse(readFileSync(path.join(GOLDEN, '1.0.4.json'), 'utf8'));
	for (const [label, result] of [
		['golden: 1.0.4 today', await run(process.execPath, [CAPTURE], {cwd: OLD})],
		[`golden: ${VERSION}`, await run(process.execPath, [`now-${CAPTURE}`])],
	]) {
		if (result.code !== 0) {
			show(label, `capture failed, exit ${result.code}\n${result.stderr.split('\n').slice(0, 5).join('\n')}`);
			continue;
		}

		// This capture is synchronous and makes no requests: one view, the encoded results, compared by parsed value
		// (never by bytes: the golden file holds raw UTF-8, a newer capture template writes ASCII escapes). Cases have
		// no names; they are matched by index and their encoded arguments. The quirks are compared one by one.
		const got = JSON.parse(result.stdout);
		const lines = [`${got.package}: ${want.cases.length} cases in the golden file, ${got.cases.length} replayed`];
		const differing = [];
		const kinds = new Map();
		for (const [index, entry] of want.cases.entries()) {
			const now = got.cases[index];
			if (JSON.stringify(now?.args) !== JSON.stringify(entry.args)) {
				differing.push(`#${index}: the arguments differ`);
				continue;
			}

			if (JSON.stringify(now.results) !== JSON.stringify(entry.results)) {
				const kind = now.results[0]?.$error ? `now throws ${now.results[0].$error}` : 'now returns another value';
				kinds.set(kind, (kinds.get(kind) ?? 0) + 1);
				differing.push(`#${index} (${JSON.stringify(entry.args).slice(1, -1)}): ${JSON.stringify(entry.results[0])} -> ${JSON.stringify(now.results[0])}`);
			}
		}

		lines.push(`results: ${want.cases.length - differing.length} identical, ${differing.length} differ`, ...[...kinds].map(([kind, count]) => `  ${kind}: ${count}`), ...differing);
		for (const key of Object.keys(want.quirks)) {
			const same = JSON.stringify(want.quirks[key]) === JSON.stringify(got.quirks[key]);
			lines.push(`quirk ${key}: ${same ? 'same' : `${JSON.stringify(want.quirks[key])} -> ${JSON.stringify(got.quirks[key])}`}`);
		}

		show(label, lines.join('\n'));
	}
}

// ----- the oldest Node line in engines (L-106) -----
// OLDEST_NODE=<major> reruns this whole script under that Node (downloaded by npx) and saves that run as
// wiki-verify.node<major>.out.txt. The Node binary is copied alone into its own folder, which goes first on PATH
// so the shells and bins the cases spawn use it too: the npm node package's bin folder also holds a text file
// named `node`, and Git Bash skips that folder and runs the system Node without a word (L-118). Every shell case
// prints the Node it ran (`node --version` inside the shell). On Windows `npx.cmd` runs the node.exe installed
// beside it, whatever PATH says: run a page's `npx <bin>` case once more as `cli()` does, with process.execPath. Compare with `wikiwright.py diffout <this run's
// output> wiki-verify.node<major>.out.txt`: every difference is a page claim to scope by version, and a block
// true on one line only gets <!-- outputs: node>=N --> on the page. Save both outputs in the repository.
// OLDEST_NODE_BIN=<a node binary> uses that binary instead of npx (a Linux run with Node from the registry and no npm).
// The folder is named per platform: a Windows run and a WSL run in one scratch folder once shared it, and the Linux
// `node` beside node.exe made Git Bash skip it and run the system Node in every shell case (L-118, a second way in).
const {OLDEST_NODE, OLDEST_NODE_BIN, WIKI_VERIFY_CHILD} = process.env;
if (OLDEST_NODE && !WIKI_VERIFY_CHILD) {
	const found = OLDEST_NODE_BIN || (await run('npx', ['-y', '-p', `node@${OLDEST_NODE}`, 'node', '-p', 'process.execPath'], {shell: process.platform === 'win32', env: {NODE_OPTIONS: ''}})).stdout.trim().split('\n').at(-1);
	const alone = path.resolve(`node${OLDEST_NODE}-alone-${process.platform}`);
	mkdirSync(alone, {recursive: true});
	const oldNode = path.join(alone, path.basename(found));
	copyFileSync(found, oldNode);
	chmodSync(oldNode, 0o755);
	const outName = `wiki-verify.${process.platform === 'win32' ? '' : 'linux.'}node${OLDEST_NODE}.out.txt`;
	const rerun = await run(oldNode, [fileURLToPath(import.meta.url)], {env: {WIKI_VERIFY_CHILD: '1', PATH: `${alone}${path.delimiter}${process.env.PATH}`}});
	writeFileSync(outName, rerun.stdout + (rerun.stderr ? `## stderr of the run\n${rerun.stderr}\n` : ''));
	show(`oldest node: node@${OLDEST_NODE}`, `${(await run(oldNode, ['--version'])).stdout.trim()}, exit ${rerun.code}, output saved as ${outName}`);
}
