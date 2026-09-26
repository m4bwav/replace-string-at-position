# Handoff

<!-- Keep under 50 lines. Replace, never append. Written at the end of a work session so the next one starts without re-deriving state. -->

## Current state

Updated 2026-09-25. Phases 0 and 1 of the package-modernize skill are done; the run is at the plan-review stop. No package code has changed and nothing is published.

- Survey, baseline and dependents: [notes/2026-09-25-phase-0-survey-baseline-and-dependents.md](notes/2026-09-25-phase-0-survey-baseline-and-dependents.md). The old test suite cannot run on Node 24; the golden capture is the baseline.
- Golden capture of the published 1.0.4: `test/golden/1.0.4.json` (71 cases) with `capture-1.0.4.cjs` and `codec.cjs`.
- The plan: [plans/2026-09-25-modernization-and-v2-release.md](plans/2026-09-25-modernization-and-v2-release.md), decisions D1 to D15; the proposed decision record is under decisions/.

## In progress

Waiting for the maintainer's rulings on the decisions table. The calls that most need a human: D3c (throw or clamp for positions past the end), D4 (2.0.0 only, no 1.0.5), and the OKs in D11 (delete the three webhooks) and D14 (apply repository settings, secret scanning, push protection).

## Decisions made this session

- Proposed, not yet accepted: keep the 26 well-formed cases exact, throw on the 45 calls 1.0.4 corrupted or crashed on, keep `require()` callable with `.default` and the named property, drop the never-installable CLI, release 2.0.0 only.

## Dead ends hit

- The skill's `survey-npm.sh` died on an unbound variable whenever OWNER/REPO was given; fixed in the skill the same day.
- The skill's golden-capture template lost NaN, Infinity and -0 arguments through a JSON round trip; the capture here uses the new `codec.cjs`.
- GNU tar in Git Bash reads `C:/...` as a remote host; extract with a relative path or `--force-local`.

## Next single action

After the maintainer's rulings: record them in the plan and the decision record, create branch `v2` from `master`, and write `test/golden/golden.test.js` from the skill's template with the 45 named exceptions before any `src/` code.
