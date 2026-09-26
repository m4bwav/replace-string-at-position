# Handoff

<!-- Keep under 50 lines. Replace, never append. Written at the end of a work session so the next one starts without re-deriving state. -->

## Current state

Updated 2026-09-25 (night). v2 is on `master` (#2 as 1c96681, review fixes #3 as bbcb567, version commit 2fe188a). `2.0.0-beta.1` is **staged** on npm under `next`: release run 36217447038, stage id c836e796-b213-4fae-8f56-06789cb71e7b, provenance signed; GitHub prerelease v2.0.0-beta.1 exists. npm `latest` is still 1.0.4.

- Plan and evidence: [plans/2026-09-25-modernization-and-v2-release.md](plans/2026-09-25-modernization-and-v2-release.md), [log.md](log.md).
- Phase 4 is complete: webhooks deleted (0 left), 0 alerts, 0 open pull requests, settings, scanning, ruleset 24031520.
- The merged branch `v2` still exists on GitHub (it merged before delete-branch-on-merge was on); delete it with the maintainer's OK.

## In progress

- Waiting for the maintainer to approve the staged 2.0.0-beta.1 on npmjs.com (Staged Packages tab, 2FA).

## Decisions made this session

- The maintainer merged without ruling on the table: D3c (throw past the end) and D4 (2.0.0 only) stand.

## Dead ends hit

- Rolldown `outputOptions.exports: 'default'` fails tsdown's declaration build.
- A `# zizmor: ignore[...]` comment inside a `run: |` block is shell text; zizmor needs `.github/zizmor.yml`.
- Node 20 and 22 print TAP (`# pass`) when piped.

## Next single action

After the approval: `npm view replace-string-at-position dist-tags` (next = 2.0.0-beta.1, latest = 1.0.4), `gh workflow run verify-published.yml -R m4bwav/replace-string-at-position -f version=2.0.0-beta.1`, and `npm audit signatures` in a scratch project that installed `replace-string-at-position@next`. Then Phase 6: date the CHANGELOG heading (`## [2.0.0] - YYYY-MM-DD`), commit, `npm version 2.0.0`, `git push --follow-tags origin master`, stop for the approval, verify the same way plus `gh release view v2.0.0` and `npm view replace-string-at-position dist.attestations`.
