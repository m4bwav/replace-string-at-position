---
title: Modernization and v2 release
kind: plan
status: active
date: 2026-09-25
verified: 2026-09-25
stale_after: never
tags: [v2, plan, npm, github-actions, tests, release, golden]
summary: "the living plan for replace-string-at-position 2.0.0: survey, what 1.0.4 gets wrong, decisions D1-D15, the v2 API, build and test strategy, phases 0-7 with checkboxes, dispositions, security, verification checklist"
---

# Modernization and v2.0.0 release plan: replace-string-at-position

The first run of the package-modernize skill (github.com/m4bwav/package-modernize, skills/package-modernize/SKILL.md and references/npm.md), on the smallest of the maintainer's packages. It follows the two finished npm runs, get-title-at-url 3.0.0 and seeded-random-utilities 2.0.0, whose plans are the models. Evidence goes to [../log.md](../log.md); the survey is [../notes/2026-09-25-phase-0-survey-baseline-and-dependents.md](../notes/2026-09-25-phase-0-survey-baseline-and-dependents.md); the capture of the published 1.0.4 is `test/golden/1.0.4.json` (71 cases). Where the skill was silent or wrong, the fix went into the skill the same day and a line into the log.

## Status

Active. Phases 0 and 1 done on 2026-09-25; waiting at the plan review.

## Goal

- `require('replace-string-at-position')` still returns the function, and `import` works too, with types for both.
- Every well-formed call (three strings and an integer position from 0 to the text's length) returns exactly what 1.0.4 returned, proven by the golden suite against both builds on every Node line.
- Calls that 1.0.4 answered with corrupted text (an undefined, string, negative or fractional position, a non-string argument) throw a TypeError or RangeError instead, each listed in the changelog.
- Zero runtime dependencies, Node 20 and up, no Node or DOM APIs, so it runs in browsers, Bun, Deno and workers.
- Released through npm trusted publishing in staged mode, approved by the maintainer, verified from the registry.

## Where it stands (survey 2026-09-25)

| Fact | Value | Evidence |
|---|---|---|
| Published version, date, downloads a month, dependents | 1.0.4, 2016-05-22 (five versions that day); 19 last month; 4 dependents by the registry's count, 2 found: markdown-plain-link-replacer (the maintainer's) and strip-mentions (Truemedia), both `^1.0.4` | survey note |
| Source, build, tests, language level | `index.js`, 11 lines of ES5, no build; one ava test; xo 0.15, nyc 6, snyk and coveralls in the scripts | survey note |
| Entry points and how the old README says to call it | `main: index.js`, `module.exports = replaceStringAtPosition`; the README says `require('./index.js')` and documents a global CLI that was never registered (`bin` is missing) | survey note, capture quirks |
| Runtime dependencies and distance from current | none | survey |
| Issues, pull requests (by author and kind), forks | 0 issues; #1 closed 2016 (gitter-badger); 1 fork (gitter-badger, only that pull request) | survey |
| Dependabot alerts, webhooks, secrets, security features | 0 alerts; 3 webhooks (Snyk 14564189 and 278473357, Travis 83049528); no secrets; scanning, push protection off; workflow permissions write | survey |
| Dead services (badge, config, webhook, app for each) | Travis, Snyk, Coveralls, David, Gitter, nodei.co; table in the survey note | survey note |
| Leaked credentials | none in files or history | survey note |
| Baseline: old build and tests as they are | cannot run: `snyk test` 401, xo 0.15 crashes on Node 24, ava 8 refuses the directory import | survey note |
| Golden capture: cases, quirks, claims confirmed or refuted | 71 cases from the published 1.0.4 on Node 24.18.0; the inventory's "one known dependent" refuted (two); "about 15 downloads" is 19; the rest confirmed | `test/golden/1.0.4.json` |

## What the old version gets wrong, confirmed, and what v2 does

Case numbers are indexes into `test/golden/1.0.4.json`.

1. **A missing position duplicates the text.** `('abc', 'b', 'X')` gives `'abcXabc'` (cases 30, 68, 69): `substring(0, undefined)` is the whole string. v2: TypeError. Changelog: "Changed: a missing or non-number position throws a TypeError; 1.0.4 returned the text twice."
2. **A string position concatenates.** `('abcdef', 'b', 'X', '1')` gives `'aX'` (case 32): `'1' + 1` is `'11'`, so the tail is lost. Booleans, arrays, `null` and `''` are coerced too (31, 33 to 36, 38). v2: TypeError for anything that is not a number primitive. Same changelog line.
3. **Negative and NaN positions splice from the start.** `-1` with a two-character source gives `'Xbcdef'`, removing one character, not two (21 to 25, 29). v2: RangeError. Changelog: "Changed: a position that is negative, NaN or not an integer throws a RangeError."
4. **Fractional positions truncate.** `1.5` and `1.9` act as `1` (27, 28). v2: RangeError, same line.
5. **Positions past the end append.** `('abc', 'x', 'Y', 10)` gives `'abcY'` (13, 16, 18 to 20). This is clamping, as `slice` does, not corruption. v2: RangeError, recommended in D3c; the alternative keeps it.
6. **Non-string text is coerced or crashes.** A null or number `originalString` throws V8's own TypeError (44 to 48, 50); a null `sourceString` too (51, 52); a number `sourceString` has no length and inserts without removing (53, 58); an array or `{length}` object uses its length (54 to 56, `{length: '2'}` concatenates again); `newString` of `null`, `undefined`, a number, an object or an array is stringified into the text (59 to 63, 65). v2: TypeError naming the argument, with the package's own message. Changelog: "Changed: every text argument must be a string; 1.0.4 stringified `null` into the result or failed with the engine's error."
7. **Kept, and documented:** the source text is never compared with the text at the position; only its length counts (cases 8 to 10). A source that runs past the end removes to the end (10). Positions and lengths count UTF-16 code units, so a position inside an emoji splits it (40), as `slice` and the indexes from `RegExp.exec` do, which is what both dependents pass. `String` wrapper objects keep working (49, 57, 64). Extra arguments are ignored (70).

## Decisions (recommendation first; the maintainer rules in the plan review, silence means the recommendation stands)

| # | Question | Recommendation | Why | Alternative |
|---|---|---|---|---|
| D1 | The compatibility promise | Every call with three strings (or `String` objects) and an integer position from 0 to the text's length returns exactly what 1.0.4 returned. The golden suite checks all 26 such cases on both builds; the other 45 are named exceptions that assert the error class. | The two dependents only make such calls; everything outside it returned text no caller could want. | Keep all 71 cases exact (a packaging-only major); then D3 and D7 fall away. |
| D2 | Export shape | CommonJS: `require()` returns the function, which also carries `.default` and `.replaceStringAtPosition` pointing to itself. ESM: a default export and the named export. Types: `.d.cts` with `export =` a function-and-namespace, `.d.mts` with both exports. Proven with attw (node10, node16-cjs, node16-esm, bundler) and the consumer fixtures, including `require()` without `.default`. How tsdown produces it is settled in Phase 2 (`outputOptions.exports: 'default'` on the CommonJS entry first). | Keeps the 2016 call pattern, and covers the two shapes transpiled callers use. | Named export only in ESM, CommonJS function only: smaller, but `import x from` users of a bundler would still work while `.default` users would not. |
| D3 | Behaviour at the edges, per case | a) Missing or non-number position: TypeError. b) Negative, NaN, fractional: RangeError. c) Past the end (`position > text.length`): RangeError. d) Non-string text arguments: TypeError, `String` objects accepted. e) Kept: source compared by length only, source overrunning the end, UTF-16 positions, extra arguments. | a, b and d are the corrupted results above. c is a judgement: clamping hides a caller's bug, and both dependents pass indexes inside the text. | c: keep clamping integer positions past the end (4 more cases stay exact, matching `slice`; `Infinity` still throws). d: keep coercing `newString` as `String.prototype.replace` does. |
| D4 | Whether a major is warranted, and what a patch could do instead | 2.0.0. The package shape changes (an `exports` map closes deep imports, `engines` gains a floor, ESM appears) and D3 refuses calls 1.0.4 accepted. No 1.x release, and 1.0.4 is not deprecated. | A patch, 1.0.5, could ship the same `index.js` with a `files` allowlist, a hand-written `index.d.ts`, the README fixed and provenance, and both dependents would receive it through `^1.0.4`. That buys a cleaner tarball for strip-mentions' users and costs a second release pipeline on a branch; the package works as it is. Deprecating 1.0.4 would warn every strip-mentions install for no safety gain. | Also release 1.0.5 from a `v1` branch before 2.0.0 (one more rehearsal, one more stop). |
| D5 | Runtime dependencies | None. | The function is three string operations. | |
| D6 | Names | Keep the one name, `replaceStringAtPosition`, and its four parameters `(originalString, sourceString, newString, position)`. Add nothing. Drop the CLI: remove `cli.js` and the README's CLI section. | Nobody could ever install the CLI (no `bin`); a string-splicing command line has no use a shell does not already cover. | Register a `bin` (a new feature, with its own tests and Node-only entry). |
| D7 | Errors | Never throw for a D1 call. TypeError for a wrong type, RangeError for a position out of range, each message naming the argument and what it got. | Callers can tell a bad type from a bad index. | |
| D8 | Node floor and the CI matrix | `engines.node >=20`; Node 20, 22, 24, 26 on Linux, Node 24 on Windows and macOS, Bun, Deno. | The skill's default until Node 22 reaches end of life (2027-04-30). | |
| D9 | Language, build, lint, tests, coverage | The npm defaults: TypeScript ~6.0.3, tsdown 0.23.0 pinned, xo ^5.0.1, node:test against `dist/`, c8 95 and 90, publint, attw, consumer fixtures (all verified 2026-09-25 in the skill's npm reference). | Same toolchain as the two finished runs; nothing here argues otherwise. | |
| D10 | Lockfile and the old bot pull requests | A new `package-lock.json` (lockfileVersion 3); the repository never had one. No bot pull requests exist. | | |
| D11 | Dead services | Remove the Travis, Snyk, Coveralls, David, Gitter and nodei.co badges; `.travis.yml`; the snyk, coveralls and codecov scripts and devDependencies. Delete webhooks 14564189, 278473357 and 83049528 (**needs your OK**). You check github.com/settings/applications for Travis CI and Coveralls OAuth grants (Snyk's was revoked on 2026-09-25). | The services are gone or unused; each hook fires on every push. | |
| D12 | Old files to remove | `index.js`, `cli.js`, `test.js`, `.travis.yml`, `.vscode/`; `.gitignore` replaced by the template's. | Replaced by `src/`, `test/` and the templates. | |
| D13 | Release and version, rehearsal | `2.0.0-beta.1` under `next` through `release.yml`, you approve, verify-published; then `2.0.0` under `latest` the same way. Trusted publisher: owner `m4bwav`, repository `replace-string-at-position`, workflow `release.yml`, no environment, "Allow npm publish" unticked, publishing access "Require two-factor authentication and disallow bypass 2fa tokens". | The standing ritual. | |
| D14 | Default branch and optional extras | Keep `master`. Ruleset (deletion and non-fast-forward blocked, required check `ci`, admin bypass). Repository settings through `gh`: description, homepage to the npm page, topics, wiki and projects off, delete-branch-on-merge, secret scanning, push protection, private vulnerability reporting, workflow permissions read (**your OK for applying them**). No JSR. | The overlay's standing decisions. | |
| D15 | Dependents: what the next run can rely on | markdown-plain-link-replacer's run can move to `^2.0.0` and rely on: `require()` returns the function; string arguments with an index inside the text give 1.0.4's answer; a bad index now throws instead of corrupting the output. Its call passes the index where it found the URL in the same text, so it stays within D1. strip-mentions stays on 1.0.4, which keeps working. | | |

## Proposed public API (v2)

```ts
/*
Replaces the part of `originalString` that starts at `position` and is as long as `sourceString` with `newString`.
The text at the position is not compared with `sourceString`; only its length counts. Positions and lengths are UTF-16 code units.
Throws a TypeError when a text argument is not a string, or `position` is not a number.
Throws a RangeError when `position` is not an integer from 0 to `originalString.length`.
*/
export default function replaceStringAtPosition(originalString: string, sourceString: string, newString: string, position: number): string;
export {replaceStringAtPosition};
```

CommonJS: `module.exports = replaceStringAtPosition`, with `replaceStringAtPosition.default` and `replaceStringAtPosition.replaceStringAtPosition` set to itself. Old name to v2 name: unchanged.

## Build and package specifics

- src/index.ts (the function and its checks); tsdown builds dist/index.mjs, dist/index.cjs, dist/index.d.mts, dist/index.d.cts and source maps, `platform: 'neutral'`.
- `package.json` from the template: `type: module`, the `exports` map with `import` and `require`, `main`, `module`, `types`, `sideEffects: false`, `files: [CHANGELOG.md, dist]`, `engines >=20`, the author line from the overlay, homepage the npm page.
- The template's test/helpers/builds.js gives each build as a module namespace; the golden suite reads the function as the default export (ESM) or the module itself (CommonJS), so the helper exposes both as `lib.replaceStringAtPosition`.

## Phases

### Phase 0: survey and baseline (2026-09-25, no package code changed)
- [x] Cloned to `D:\m4bwa\Claude\Projects\Ai\replace-string-at-position`; survey output in the survey note
- [x] Old build and tests run as they are: cannot run (snyk 401, xo 0.15 crash, ava 8 directory import); logged
- [x] Golden capture from the published 1.0.4 committed under `test/golden/` with its script and `codec.cjs`
- [x] everlast registered (mode repo, sync push); AGENTS.md, CLAUDE.md (import line first), Copilot pointer
### Phase 1: plan
- [x] This plan and the decision record [../decisions/2026-09-25-v2-shape-refuse-corrupting-calls-keep-require.md](../decisions/2026-09-25-v2-shape-refuse-corrupting-calls-keep-require.md). **Stop**: the maintainer rules on the table; questions: D3c, D4, D11 webhook deletion, D14 settings.
### Phase 2: rewrite on branch v2
- [ ] Remove the D12 files; add the templates; deny dev-only install scripts
- [ ] Golden test first, green on the first build; then `src/`, the rest of `test/`, README, CHANGELOG, SECURITY.md, AGENTS.md
- [ ] Verified on Node 20, 22, 24, 26 and from a fresh clone (log)
- [ ] Workflows and Dependabot added, actionlint clean
- [ ] Pushed; pull request opened with a "For review" list. **Stop.**
### Phase 3: review
- [ ] Independent read-only review (prompts/review-subagent.md in the skill); findings fixed or answered; summary on the pull request
### Phase 4: CI, settings, merge, cleanup
- [ ] CI green (run id); ruleset on master; squash-merge after the maintainer's review (SHA)
- [ ] Alerts 0; webhooks removed (with the OK); repository settings; secret scanning and push protection; private vulnerability reporting; workflow permissions read
### Phase 5: release rehearsal
- [ ] The maintainer adds the trusted publisher (fields in D13). **Stop.**
- [ ] 2.0.0-beta.1 tagged and staged; **stop** for the approval; verified from the registry (run id)
### Phase 6: release
- [ ] Changelog dated; 2.0.0 tagged and staged; **stop** for the approval; verified from the registry; GitHub Release; provenance
### Phase 7: wrap-up
- [ ] HANDOFF.md around standing work; inventory row; lessons into the skill; what the kickoff prompt got wrong

## Test strategy: every artifact, every runtime, and the behaviour itself

| Layer | What it proves | How | Runs where |
|---|---|---|---|
| Golden | D1: the 26 well-formed cases exact; the 45 others throw the class D3 names | test/golden/golden.test.js over `1.0.4.json`, both builds, exceptions named in one list | Node 20 to 26, three OSes |
| Unit | D3 and D7: each refusal's class and message; boundaries 0 and `length`; empty strings; emoji; `String` objects | test/unit/api.test.js, table-driven | same |
| Property | For random strings and every position 0 to length, the result equals `text.slice(0, p) + replacement + text.slice(p + source.length)` and equals 1.0.4's formula | seeded loop, no dependency | same |
| Package shape | exports map, pack list exactly `CHANGELOG.md`, `LICENSE`, `README.md`, `package.json` and `dist/` files; no Node or DOM references; the CommonJS build runs in a bare `node:vm` context | test/package/shape.test.js, publint, attw | Node 24 |
| Consumers | `require()` returns the function; `.default` and the named export; `import` default and named; the four TypeScript resolution modes compile | `test/consumers/` from the tarball | Node 24; Bun and Deno in CI |
| From the registry | the published version, the same fixtures, signatures and attestation | `verify-published.yml` | after each approval |

| Artifact | Runtime lines | Other OSes | Other runtimes | Bare engine |
|---|---|---|---|---|
| dist/index.mjs | Node 20, 22, 24, 26 | Windows, macOS on 24 | Bun, Deno | |
| dist/index.cjs | Node 20, 22, 24, 26 | Windows, macOS on 24 | Bun | `node:vm` |
| dist/index.d.mts, `.d.cts` | TypeScript node10, node16 (cjs and esm), bundler | | | |

## Pull requests, issues and forks: disposition

| Item | What it is | Disposition | Comment to post |
|---|---|---|---|
| #1 | gitter-badger, Gitter badge, closed 2016-05-22 | nothing | none |
| fork gitter-badger/replace-string-at-position | carried #1 only | nothing | none |

## Security

- No tokens leaked, in files or history; nothing to revoke.
- Webhooks: three dead ones, deleted with the OK (D11). OAuth apps of Travis CI and Coveralls: the maintainer checks and revokes.
- Alerts 0 now and after the rewrite; `npm audit signatures` and `npm audit --omit=dev` in CI.
- Workflows from the templates: `permissions: contents: read`, id-token set to write only in the publish job, `persist-credentials: false`, actions pinned to SHAs, actionlint and zizmor clean. Default workflow permissions set to read.
- Publishing: npm 2FA with no bypass tokens (on since 2026-09-25), trusted publishing bound to `release.yml`, staged mode, the maintainer approves.
- The library: no network, filesystem, `eval` or loops; runs in time and memory linear in its input. README says what the package is not (no search, no regex, no Unicode-aware positions).
- SECURITY.md with private vulnerability reporting, which is switched on.

## Verification checklist (what "done" means)

| Claim | Command or place | Expected |
|---|---|---|
| Installs clean | `npm ci` in a fresh clone | no deprecation warnings, 0 vulnerabilities |
| Zero runtime dependencies | `npm ls --omit=dev --all` | nothing under the package |
| Old behaviour kept | `npm test`, CI, verify-published | 26 golden cases exact, 45 named exceptions, on both builds, every Node line |
| Old call pattern works | `node -e "console.log(require('replace-string-at-position')('222', '2', '3', 1))"` against the tarball | `232` |
| Dual output is correct | `npx publint`, `npx attw --pack .` | no errors in any mode |
| Portable | the shape test | no Node or DOM references in `dist/index.*`; the bare-engine run passes |
| Published with provenance | `npm view replace-string-at-position dist.attestations`; `npm audit signatures` in a project that installed it | present and verified |
| Release exists | `gh release view v2.0.0` | notes from the changelog |
| Repo tidy | `gh pr list`, `git ls-remote --heads origin`, `gh api repos/m4bwav/replace-string-at-position/hooks --jq length` | no open pull requests, only `master`, 0 webhooks |
| Scanning on | `gh api repos/m4bwav/replace-string-at-position --jq .security_and_analysis` | secret scanning and push protection enabled |

## Risks and open points

- D2's CommonJS shape with a default export plus properties is the one build question; if tsdown cannot emit it cleanly, the fallback is a tiny hand-written src/index.cts entry compiled for CommonJS only, still checked by attw.
- The registry counts 4 dependents; two were found. The other two may be private or unindexed, and 2.0.0 reaches none of them without a change on their side.

## Appendix: cleanup commands (all paths absolute)

```bash
# After the OK in the plan review:
gh api -X DELETE repos/m4bwav/replace-string-at-position/hooks/14564189
gh api -X DELETE repos/m4bwav/replace-string-at-position/hooks/278473357
gh api -X DELETE repos/m4bwav/replace-string-at-position/hooks/83049528
gh repo edit m4bwav/replace-string-at-position --homepage https://www.npmjs.com/package/replace-string-at-position --enable-wiki=false --enable-projects=false --delete-branch-on-merge --add-topic string,replace,substring,splice,typescript,esm,commonjs
gh api -X PATCH repos/m4bwav/replace-string-at-position -f 'security_and_analysis[secret_scanning][status]=enabled' -f 'security_and_analysis[secret_scanning_push_protection][status]=enabled'
gh api -X PUT repos/m4bwav/replace-string-at-position/private-vulnerability-reporting
gh api -X PUT repos/m4bwav/replace-string-at-position/actions/permissions/workflow -f default_workflow_permissions=read -F can_approve_pull_request_reviews=false
```

## Next single action

The maintainer rules on the decisions table (at least D3c, D4, and the OKs in D11 and D14); then create branch `v2` and write the golden test first.
