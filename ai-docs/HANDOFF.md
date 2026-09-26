# Handoff

<!-- Keep under 50 lines. Replace, never append. Written at the end of a work session so the next one starts without re-deriving state. -->

## Current state

Updated 2026-09-25 (night). 2.0.0-beta.1 is live under `next` and verified from the registry (verify-published run 36217617146). **2.0.0 is released** under `latest` and verified from the registry (verify-published run 36217874285, signatures and attestation verified).

- Plan and evidence: [plans/2026-09-25-modernization-and-v2-release.md](plans/2026-09-25-modernization-and-v2-release.md), [log.md](log.md).
- The merged branch `v2` still exists on GitHub; delete it with the maintainer's OK.

## In progress

- Phase 7 wrap-up is left (below). npmjs.com's main page may still show 1.0.4's README from its cache; the registry serves the new one.

## Decisions made this session

- The maintainer merged without ruling on the table: D3c (throw past the end) and D4 (2.0.0 only) stand.

## Dead ends hit

- Rolldown `outputOptions.exports: 'default'` fails tsdown's declaration build.
- A `# zizmor: ignore[...]` comment inside a `run: |` block is shell text; zizmor needs `.github/zizmor.yml`.
- Node 20 and 22 print TAP (`# pass`) when piped.

## Next single action

Phase 7: the inventory row, the kickoff prompt's corrections, lessons into the skill, and the heads-up for markdown-plain-link-replacer (it can move to ^2.0.0, plan D15). Check that https://www.npmjs.com/package/replace-string-at-position shows the 2.0.0 README.
