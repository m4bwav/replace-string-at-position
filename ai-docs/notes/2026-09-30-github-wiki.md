---
title: GitHub wiki written for 2.0.0
kind: note
date: 2026-09-30
verified: 2026-09-30
stale_after: 2027-03-30
tags: [wiki, docs, 2.0.0, github]
summary: "the wiki's pages, where their git working copy is, how every example was verified against the published 2.0.0 package (Node 24 and 20, TypeScript 7.0.2, 6.0.3 and 5.9.3, Bun, Deno, the 1.0.4 golden replay), the facts found on the way, the inaccuracies in the shipped docs, and how to update the wiki; read before touching the wiki or the README sentences listed under inaccuracies"
---

# GitHub wiki for 2.0.0

## Summary

The maintainer asked for the GitHub wiki, written with the wikiwright skill (0.7.2) from this repository and the published 2.0.0. Nine pages plus a sidebar and a footer, written from the README, CHANGELOG, AGENTS.md, ai-docs, `src/`, the tests (golden, unit, property, shape, consumers), `ci.yml`, the npm registry and GitHub's issues, pull requests and releases. Every example is a `snippet()` in [2026-09-30-wiki-verify.mjs](2026-09-30-wiki-verify.mjs), run against replace-string-at-position 2.0.0 installed from npm into a scratch folder, on Node 24.18.0 and Node 20.20.2. The wiki commit is 21af852 in the working copy, **not pushed** (the maintainer asked for a local commit only). `wikiwright.py check`: 9 pages, 0 errors. `outputs`: 48 checked, 0 missing. `snippets`: 34 blocks checked, 0 missing, 1 skipped (the published declaration), 3 commands. everwrite `tells.py`: 0 strong, 9 weak (long sentences, "realm" as the JavaScript term).

Pages: Home, Getting-Started, API-Reference, How-Text-Is-Replaced (the behaviour page), Edge-Cases-and-Errors, Recipes, Versions-and-Upgrading, FAQ, Development, _Sidebar, _Footer.

## Where the pages are

`D:\m4bwa\Claude\Projects\Ai\replace-string-at-position.wiki` (a sibling of this clone, outside this repository), branch `master`, remote `origin` = `https://github.com/m4bwav/replace-string-at-position.wiki.git`. Files: the eleven above as `.md`. Plain markdown links between pages (`[Recipes](Recipes)`), no wikilinks, LF line endings.

## How it was published

Preflight on 2026-09-30: `placeholder` (the maintainer had saved the first page; ls-remote 6720f4f, one file, Home.md), cloned into the working copy. The pages were committed on top of the placeholder as 21af852 (a plain fast-forward when pushed). Not pushed and not live-checked yet: the next step is `git -C <wiki dir> push`, then `python <wikiwright>/scripts/wikiwright.py live m4bwav/replace-string-at-position <wiki dir>`.

## Updating the wiki later

1. `git -C <wiki dir> pull --ff-only`, then edit the pages. Page names are the file names with hyphens; links are `[Text](Page-Name)`.
2. Re-verify: bump `VERSION` in [2026-09-30-wiki-verify.mjs](2026-09-30-wiki-verify.mjs), and run it from a scratch folder outside the repository. The folder needs `package.json` written with an editor (`{"private": true}`) and `npm install replace-string-at-position@<new> typescript@latest typescript6@npm:typescript@6.0.3 typescript5@npm:typescript@5.9.3`; a second folder with `replace-string-at-position@1.0.4` (`OLD`); a third with `npm install deno bun` (`RT`). Then `GOLDEN=<clone>/test/golden OLD=<old folder> RT=<rt folder> node wiki-verify.mjs > wiki-verify.out.txt`, and again with `OLDEST_NODE=20` (writes `wiki-verify.node20.out.txt`). `python <wikiwright>/scripts/wikiwright.py diffout 2026-09-30-wiki-verify.out.txt <new output>` lists every changed section (exit 1 means differences); do the same for the Node 20 output. Print each tool's version: the script prints TypeScript's, Bun's and Deno's.
3. `wikiwright.py outputs <wiki dir> <new outputs>`, `wikiwright.py snippets <wiki dir> <the script>`, `wikiwright.py check <wiki dir> --version <new>` and the everwrite checker.
4. Commit, `git push`, then `wikiwright.py live`. The pages that name the version: Home (current version and date), API-Reference ("This page describes 2.0.0", the package facts table), Versions-and-Upgrading (the releases table, downloads, the golden numbers), Getting-Started (TypeScript versions, Bun and Deno versions), Development (the test counts, commit 33b97b5), _Footer.

## How the examples were verified

- The script: [2026-09-30-wiki-verify.mjs](2026-09-30-wiki-verify.mjs), scaffolded with `wikiwright.py scaffold npm replace-string-at-position 2.0.0 --golden 1.0.4`, with one `snippet()` per page code block. Its outputs: [2026-09-30-wiki-verify.out.txt](2026-09-30-wiki-verify.out.txt) (Node 24.18.0) and [2026-09-30-wiki-verify.node20.out.txt](2026-09-30-wiki-verify.node20.out.txt) (Node 20.20.2). No ports or local paths are in either. `diffout`: 50 sections, 49 same, 1 changed (the `installed` line naming the Node version).
- Installed from npm: replace-string-at-position 2.0.0 and 1.0.4; TypeScript 7.0.2 (npm `latest` on 2026-09-30), 6.0.3 (the repository's lock file) and 5.9.3 (the repository's interop-off fixture); Bun 1.4.2 and Deno 2.9.6 from npm's `bun` and `deno` packages.
- Consumer setups, from the published package: ESM and CommonJS on Node 24 and 20 and under Bun; ESM under Deno (no permissions needed); TypeScript `nodenext` ESM, `nodenext` CommonJS (`import = require` and default import), `bundler`, `node10`, and `node10` with `esModuleInterop` off, each compiled by 7.0.2, 6.0.3 and 5.9.3 and the output run; the repository's `test/consumers/types/assertions.ts` under `nodenext` ESM and CommonJS and `bundler` with all three TypeScripts (all exit 0). TypeScript 7.0.2 fails both `node10` setups with TS5108 (the options were removed), which Getting-Started shows.
- The repository's own consumer test (`npm run test:consumers`) with `CONSUMER_PACKAGE=replace-string-at-position@2.0.0 CONSUMER_RUNTIMES=bun,deno` from a scratch clone: 10 of 10 passed (TypeScript 6.0.3 and 5.9.3 only).
- Golden replay: `test/golden/capture-1.0.4.cjs` with `codec.cjs`, copied unchanged, run as a child process against 1.0.4 installed today and then against 2.0.0, on both Node lines. 1.0.4 today: 71 of 71 results identical, 8 of 8 quirks the same. 2.0.0: 26 identical, 45 differ (13 now throw `RangeError`, 32 `TypeError`; 34 of the 45 returned text in 1.0.4 and 11 threw an engine `TypeError`); quirks: `ownKeys` gained `default` and `replaceStringAtPosition`, the two symbol cases got the package's messages. Every difference is a CHANGELOG line. The comparison is by parsed value, never by bytes. The golden files were only read.
- Not tested (marked on the pages): pnpm, Yarn, `bun add`, browsers and workers, 1.0.0 to 1.0.3, a benchmark, `Intl.Segmenter` for graphemes.
- The repository's own tests, from a scratch clone of 33b97b5 on Windows, Node 24.18.0: `npm ci` 493 packages; `npm test` 177 tests, 177 passed; `npm run test:consumers` 10 tests, 7 passed, 3 skipped (Bun and Deno not asked for); the published-package run above 10 of 10.

## Facts verified while writing (not in the README)

- The ES module's function has no `.default`; only the CommonJS function carries `.default` and `.replaceStringAtPosition`.
- The two builds are two function objects: `require()` and `import` in one program give different functions (`false` on identity).
- TypeScript 7.0.2, npm's `latest`, refuses `moduleResolution: node10` and `esModuleInterop: false` (TS5108) even with `ignoreDeprecations`; the package's types pass under `nodenext` and `bundler` with 7.0.2, 6.0.3 and 5.9.3. The repository's `ts-node10` and `ts5-cjs-interop-off` fixtures will fail the day the repository moves to TypeScript 7.
- The exact error messages: a string is quoted and cut at 20 code points with `...`; a BigInt is `a bigint`; a `Number` object, a `Proxy` and a revoked `Proxy` are `an object`; the checks run in the order originalString, sourceString, newString, position type, position range, and only the first problem is reported.
- The errors are plain `TypeError` and `RangeError` with no `code` and no own properties besides `message` and `stack`.
- `-0` is accepted as position 0; `2 ** 53` is refused (the rule is `Number.isSafeInteger`); `('', 'b', 'X', 1)` gives "from 0 to 0".
- `indexOf`'s `-1` gives a `RangeError`, where 1.0.4 put `newString` at the start and cut `sourceString.length - 1` units.
- Deno 2.9.6 runs it with no permissions, reading the package from `node_modules`; Bun 1.4.2 runs both builds.
- No text normalisation: composed and decomposed `é` count 1 and 2 units.
- 11 of the 45 calls 2.0.0 refuses already threw in 1.0.4 (engine `TypeError`s); 34 returned text.
- Registry on 2026-09-30: dist-tags `latest` 2.0.0 only (no `next`); last week's downloads 518, of which 2.0.0 301, 2.0.0-beta.1 120, 1.0.4 70; 2.0.0 has 10 files, 29,643 bytes unpacked, provenance.
- On Windows, `CONSUMER_RUNTIMES=bun,deno` needs the folders holding `bun.exe` and `deno.exe` on `PATH`: the test starts them with `execFile`, which cannot run npm's `.cmd` shims.

## Inaccuracies found in the shipped docs

None fixed here; the README and CHANGELOG ship in the package, so they wait for the next release. The ai-docs ones are for the next session.

1. README, "Migrating from 1.x", third bullet: "Calls that 1.0.4 answered with damaged text now throw: ... a text argument that is not a string (1.0.4 wrote `null` or `[object Object]` into the result)". 11 of those calls did not return damaged text; 1.0.4 threw an engine `TypeError` for them (a `null`, `undefined` or non-string `originalString`, a `null` or `undefined` `sourceString`, no arguments or one, a BigInt position). Evidence: golden cases 37, 44 to 48, 50 to 52, 66 and 67 in the replay. The CHANGELOG mentions the engine error for the first argument only.
2. CHANGELOG, `## [2.0.0] - 2026-09-25`: npm published 2.0.0 at 2026-09-26T04:25:42Z, and the tag and GitHub Release are 2026-09-26 UTC; the heading uses the maintainer's local date. Not wrong locally, but it disagrees with the registry and GitHub.
3. CHANGELOG, 2.0.0 compatibility paragraph: "The test suite checks this against 71 answers recorded from the published 1.0.4". The promise (well-formed calls keep their answer) is checked against 26 of the 71; the other 45 are asserted to throw.
4. README line 10 and CHANGELOG "Added" ("Runs in browsers, Bun, Deno and workers"): Bun and Deno are tested in CI; browsers and workers are not run anywhere. The shape test only greps the builds for globals and runs the CommonJS build in a `vm` context. An untested claim rather than a wrong one.
5. `dist/index.d.mts` and `dist/index.d.cts` JSDoc (from `src/replace-string-at-position.ts`): `@throws {TypeError} When a text argument is not a string (or a `String` object)` reads as if a `String` object were refused; it means "neither a string nor a `String` object".
6. AGENTS.md, "What this is": "1.0.4 ... is the published version until 2.0.0 ships". 2.0.0 is `latest` since 2026-09-26.
7. ai-docs/HANDOFF.md (before this change): "2.0.0-beta.1 is live under `next`"; npm has no `next` tag on 2026-09-30. Its "Next single action" names the markdown-plain-link-replacer heads-up, which is done (that package's 2.0.0 depends on `^2.0.0`). log.md line 25 ("next 2.0.0-beta.1") was true when written.

## Gotchas

- TypeScript 7's `tsc` is launched by path (`node_modules/typescript/bin/tsc`); it ran under Node 20.20.2 too.
- Node's `console.log` prints the lone surrogate as `'\ud83d...'` (lower case) on Node 24 and 20; the README writes `'\uD83D...'`. Both are the same string.
- The golden file holds raw UTF-8; package-modernize's current capture template writes ASCII escapes. Compare parsed values, never bytes.

Related: see also [../HANDOFF.md](../HANDOFF.md), [../log.md](../log.md), [2026-09-25-phase-0-survey-baseline-and-dependents.md](2026-09-25-phase-0-survey-baseline-and-dependents.md).
