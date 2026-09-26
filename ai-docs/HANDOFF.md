# Handoff

<!-- Keep under 50 lines. Replace, never append. Written at the end of a work session so the next one starts without re-deriving state. -->

## Current state

Updated 2026-09-25. The v2 rewrite is on `master` (pull request #2, merge commit 1c96681); the Phase 3 review fixes are in pull request #3 (branch `review-fixes`). Nothing is published; `package.json` still says 1.0.4 until `npm version` runs in Phase 5.

- Plan and evidence: [plans/2026-09-25-modernization-and-v2-release.md](plans/2026-09-25-modernization-and-v2-release.md) (checkboxes current), [log.md](log.md).
- The maintainer merged #2 without ruling on the decisions table, so the recommendations stand: D3c (a position past the end throws) and D4 (2.0.0 only).
- Phase 4 settings applied: secret scanning, push protection, private vulnerability reporting, workflow permissions read, ruleset 24031520 requiring `ci`.

## In progress

- Pull request #3 waits for CI and the maintainer's merge.
- The three dead webhooks (Snyk 14564189 and 278473357, Travis 83049528) wait for the maintainer's OK to delete (plan appendix has the commands).

## Decisions made this session

- CommonJS shape: two tsdown configs; the CommonJS entry's lone default export becomes `module.exports` (cjsDefault) with a `'use strict'` banner. Entry points in `package.json` are written by hand.
- `String` objects are read by their internal value (no caller code runs); overrides and Proxies are not honoured. Documented in CHANGELOG and README.

## Dead ends hit

- Rolldown `outputOptions.exports: 'default'` fails tsdown's declaration build ("entry module has the following exports: .").
- A `# zizmor: ignore[...]` comment inside a `run: |` block is shell text; zizmor needs `.github/zizmor.yml`.
- Node 20 and 22 print TAP (`# pass`) when piped; grepping for `ℹ pass` finds nothing and looks like a pass.

## Next single action

After #3 merges and `ci` is green on master: with the OK, delete the three webhooks; then ask the maintainer to add the trusted publisher on npmjs.com (fields in plan D13) and stop. After that: `npm version 2.0.0-beta.1`, `git push --follow-tags`, stop for the staged approval.
