# Handoff

<!-- Keep under 50 lines. Replace, never append. Written at the end of a work session so the next one starts without re-deriving state. -->

## Current state

Updated 2026-09-25 (night). 2.0.0-beta.1 is live under `next` and verified from the registry (verify-published run 36217617146). **2.0.0 is staged** under `latest`: release run 36217701865, stage id 102e8d6b-9cb7-4076-b7fc-3611afdc4191, provenance signed; the GitHub Release v2.0.0 exists. npm `latest` stays 1.0.4 until the approval.

- Plan and evidence: [plans/2026-09-25-modernization-and-v2-release.md](plans/2026-09-25-modernization-and-v2-release.md), [log.md](log.md).
- The merged branch `v2` still exists on GitHub; delete it with the maintainer's OK.

## In progress

- Waiting for the maintainer to approve the staged 2.0.0 on npmjs.com.

## Decisions made this session

- The maintainer merged without ruling on the table: D3c (throw past the end) and D4 (2.0.0 only) stand.

## Dead ends hit

- Rolldown `outputOptions.exports: 'default'` fails tsdown's declaration build.
- A `# zizmor: ignore[...]` comment inside a `run: |` block is shell text; zizmor needs `.github/zizmor.yml`.
- Node 20 and 22 print TAP (`# pass`) when piped.

## Next single action

After the approval: `npm view replace-string-at-position dist-tags` (latest = 2.0.0), `gh workflow run verify-published.yml -R m4bwav/replace-string-at-position -f version=2.0.0`, `npm audit signatures` in a scratch project, `npm view replace-string-at-position dist.attestations`. Then Phase 7: inventory row, kickoff prompt corrections, lessons into the skill, and the heads-up for markdown-plain-link-replacer (it can move to ^2.0.0, plan D15).
