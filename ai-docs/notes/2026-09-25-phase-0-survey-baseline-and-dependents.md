---
title: "Phase 0 survey: registry, repository, baseline and dependents of 1.0.4"
kind: note
status: active
date: 2026-09-25
verified: 2026-09-25
stale_after: 2027-03-25
tags: [survey, baseline, v2, dependents, dead-services, tarball, golden]
aliases: [survey, baseline, strip-mentions, markdown-plain-link-replacer, cli.js, webhooks]
summary: "read before the plan or the cleanup: what 1.0.4 is and ships, the old test suite's three failures on Node 24, the two dependents and how they call it, the dead services with their webhook ids, and the raw survey-npm.sh output"
---

# Phase 0 survey: replace-string-at-position 1.0.4

## Summary

One ES5 function, published 2016, no dependencies, 19 downloads a month, two dependents found that call it with strings and an in-text index. The old tests cannot run on Node 24. Six dead services, three dead webhooks, no leaked credentials. The CLI in the README was never installable.

Surveyed on 2026-09-25 (the script stamps UTC, 2026-09-26T03:08Z) with the package-modernize skill's `scripts/survey-npm.sh replace-string-at-position m4bwav/replace-string-at-position`, Node 24.18.0 and npm 11.16.0. The raw output is at the end. The behaviour of 1.0.4 is in [../../test/golden/1.0.4.json](../../test/golden/1.0.4.json); what it means is in the plan.

## The package

- Five versions, all published on 2016-05-22 within ten hours (1.0.0 to 1.0.4); `latest` is 1.0.4; one maintainer, `markrogers`. One registry signature (the 2022 re-signing), no attestation.
- Downloads: 19 in the last month, 0 to 43 a month over the past year.
- `index.js` (11 lines): `module.exports = replaceStringAtPosition`, a function of `(originalString, sourceString, newString, position)` that returns `originalString.substring(0, position) + newString + originalString.substring(position + sourceString.length, originalString.length)`. It reads only `sourceString.length`; the text at the position is never compared with it.
- No runtime dependencies. devDependencies: `ava *`, `codecov.io`, `coveralls`, `execa`, `nyc 6`, `snyk`, `xo 0.15`. No `engines`, `files`, `bin`, `types` or `exports`.
- The README documents a global CLI (`npm install --global`, `replace-string-at-position 222 2 3 1`), but `package.json` has no `bin`: `npm exec -- replace-string-at-position 222 2 3 1` in a project with 1.0.4 installed answers "could not determine executable to run". `cli.js` exists and works only as `node cli.js`. The README's usage line is `require('./index.js')`, which works only inside the repository.
- The tarball (3,039 bytes, 9 files) ships `.npmignore` (not in git), `.travis.yml`, `.vscode/launch.json`, `cli.js` and `test.js` beside `index.js`, `LICENSE`, `README.md` and `package.json`.

## The repository

- `master`, created 2016-05-22, last push 2016-05-22; 11 commits, no tags, no releases, no workflows, no rulesets, no secrets, no environments.
- Issues: none ever. Pull requests: #1, closed 2016-05-22, from gitter-badger (a Gitter badge). Fork: `gitter-badger/replace-string-at-position`, which only carried that pull request.
- Dependabot alerts: 0 open. Secret scanning, push protection and Dependabot security updates: off. Default workflow permissions: write, and Actions may approve pull requests. Wiki and projects on; delete-branch-on-merge off; homepage empty.
- Leaked credentials: none. `.travis.yml` holds no token and history has no token string (`git log -S token` is empty); coverage uploads never had a token here.

## Dead services

| Service | Badge | Config file | Webhook | App |
|---|---|---|---|---|
| Travis CI | travis-ci.org build badge | `.travis.yml` (node, 0.12, 0.10) | 83049528 `notify.travis-ci.org` | the maintainer's OAuth list |
| Snyk | snyk.io "Known Vulnerabilities" badge | `snyk test` in the test script | 14564189 and 278473357 | OAuth app revoked by the maintainer on 2026-09-25 |
| Coveralls | coveralls badge | `coverage` and `travis-after-success` scripts | none | the maintainer's OAuth list |
| David | david-dm.org badge (service gone) | none | none | none |
| Gitter | Gitter badge | none | none | none |
| nodei.co | the npm download-rank image (service gone; the survey's badge grep missed this host) | none | none | none |

`.vscode/launch.json` is an editor file, not a service; it goes with the rewrite.

## Baseline: the old build and tests as they are (Node 24.18.0, in a scratch clone)

- `npm install`: succeeds, 620 packages, 16 deprecation warnings, three install scripts npm 11 did not run (core-js 2, es5-ext, snyk). `ava: "*"` now resolves to ava 8.0.1.
- `npm --script-shell "C:/Program Files/Git/bin/bash.exe" test` (`snyk test && xo && nyc ava`): exit 2 at the first step; `snyk test` answers 401 SNYK-0005 without a Snyk login.
- `xo` 0.15 alone: crashes with `TypeError: util.isDate is not a function` inside eslint-plugin-ava (ESLint 2 on Node 24).
- `ava` 8 alone: the single test cannot load; `import replaceStringAtPosition from './'` is a directory import, `ERR_UNSUPPORTED_DIR_IMPORT`.
- The one assertion the old test makes (`('222', '2', '3', 1)` gives `'232'`) is case 0 of the golden capture, which passes against the published 1.0.4.

So the old suite cannot run at all today; the golden capture (71 cases) is the baseline.

## Dependents

The registry search reports 4 dependents. Two were found with `gh search code` and the npm registry on 2026-09-25; both use CommonJS `require` and a caret range, so neither receives a 2.0.0 without a change on its side:

- `markdown-plain-link-replacer` 1.1.16 (the maintainer's, 2022-06-19, `^1.0.4`): `replaceStringAtPosition(source, url, titleMarkdown, position)` in lib/replace-parsed-plain-links-with-titles.js in that repository; strings and a numeric position. It is modernized after this package.
- `strip-mentions` 1.0.0 (Truemedia, third party, 2022-05-18, `^1.0.4`, 19 downloads a month): `replaceStringAtPosition(msg, mention, '', openingMatch.index)`, where `mention` is the exact substring at that index. Its download count equals this package's, so it probably accounts for most of them.

## Raw survey output

```text
# npm survey: replace-string-at-position (2026-09-26T03:08Z)

## Registry metadata
$ npm view replace-string-at-position name version dist-tags time.created time.modified license author repository.url homepage main module types exports bin engines dependencies peerDependencies deprecated
name = 'replace-string-at-position'
version = '1.0.4'
dist-tags = { latest: '1.0.4' }
time.created = '2016-05-22T04:36:02.668Z'
time.modified = '2022-06-26T11:20:39.160Z'
license = 'MIT'
author = 'Mark Rogers'
repository.url = 'git+https://github.com/m4bwav/replace-string-at-position.git'
homepage = 'https://github.com/m4bwav/replace-string-at-position#readme'
main = 'index.js'

## All published versions with dates
$ npm view replace-string-at-position time --json
{
  "modified": "2022-06-26T11:20:39.160Z",
  "created": "2016-05-22T04:36:02.668Z",
  "1.0.0": "2016-05-22T04:36:02.668Z",
  "1.0.1": "2016-05-22T04:45:43.853Z",
  "1.0.2": "2016-05-22T04:51:53.194Z",
  "1.0.3": "2016-05-22T05:03:41.300Z",
  "1.0.4": "2016-05-22T14:03:34.163Z"
}

## Attestations and signatures on the latest version
$ npm view replace-string-at-position dist.attestations dist.signatures --json
[
  {
    "keyid": "SHA256:jl3bwswu80PjjokCgh0o2w5c2U4LhQAE57gj9cz1kzA",
    "sig": "MEYCIQDaXHhmTvhVssSlqoRy5rGwo+j9yqWIPZdqKvFX5BLWqwIhAOtYNGVWHcM9elJVWiKteZGIFTALEtSN9C1WrumlYC5b"
  }
]

## Maintainers
$ npm view replace-string-at-position maintainers --json
[
  "markrogers <(email redacted)>"
]

## Downloads, last month
$ curl -s https://api.npmjs.org/downloads/point/last-month/replace-string-at-position
{"downloads":19,"start":"2026-08-26","end":"2026-09-24","package":"replace-string-at-position"}
## Downloads, last year by month
$ curl -s "https://api.npmjs.org/downloads/range/last-year/replace-string-at-position" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const m={};for(const {day,downloads} of JSON.parse(s).downloads){const k=day.slice(0,7);m[k]=(m[k]||0)+downloads}console.log(m)})'
{
  '2025-09': 0,
  '2025-10': 17,
  '2025-11': 15,
  '2025-12': 10,
  '2026-01': 9,
  '2026-02': 20,
  '2026-03': 27,
  '2026-04': 14,
  '2026-05': 43,
  '2026-06': 38,
  '2026-07': 25,
  '2026-08': 19,
  '2026-09': 14
}

## Dependents (registry search; npmjs.com shows the list)
$ curl -s "https://registry.npmjs.org/-/v1/search?text=replace-string-at-position&size=1" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const r=JSON.parse(s);console.log(JSON.stringify({total:r.total, first:r.objects[0]?.package?.name, dependents: r.objects[0]?.dependents ?? "(see https://www.npmjs.com/browse/depended/replace-string-at-position)"}))})'
{"total":872020,"first":"replace-string-at-position","dependents":"4"}

## Tarball file list of the published version
$ npm pack replace-string-at-position --dry-run --json 2>/dev/null | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const [p]=JSON.parse(s);console.log(p.size+" bytes, "+p.entryCount+" files");for(const f of p.files)console.log(" "+f.path+" "+f.size)})'
3039 bytes, 9 files
 .npmignore 576
 .travis.yml 109
 .vscode/launch.json 997
 LICENSE 1099
 README.md 1872
 cli.js 227
 index.js 451
 package.json 1169
 test.js 201

## Runtime dependencies: how far behind
$ npm view <dep> version time.modified deprecated
(no runtime dependencies)

# GitHub side (m4bwav/replace-string-at-position)
# GitHub survey: m4bwav/replace-string-at-position (2026-09-26T03:08Z)

## Repository
$ gh repo view m4bwav/replace-string-at-position --json name,description,defaultBranchRef,pushedAt,createdAt,licenseInfo,stargazerCount,forkCount,isArchived,homepageUrl --jq '{name,description,defaultBranch:.defaultBranchRef.name,pushedAt,createdAt,license:.licenseInfo.key,stars:.stargazerCount,forks:.forkCount,archived:.isArchived,homepage:.homepageUrl}'
{"archived":false,"createdAt":"2016-05-22T03:05:32Z","defaultBranch":"master","description":"Simple lite string replacer when you only want to replace a substring at a particular position.","forks":1,"homepage":"","license":"mit","name":"replace-string-at-position","pushedAt":"2016-05-22T14:00:49Z","stars":0}

## Settings and security features
$ gh api repos/m4bwav/replace-string-at-position --jq '{delete_branch_on_merge, has_wiki, has_projects, allow_squash_merge, web_commit_signoff_required, security_and_analysis}'
{"allow_squash_merge":true,"delete_branch_on_merge":false,"has_projects":true,"has_wiki":true,"security_and_analysis":{"dependabot_security_updates":{"status":"disabled"},"secret_scanning":{"status":"disabled"},"secret_scanning_non_provider_patterns":{"status":"disabled"},"secret_scanning_push_protection":{"status":"disabled"},"secret_scanning_validity_checks":{"status":"disabled"}},"web_commit_signoff_required":false}

## Default workflow permissions
$ gh api repos/m4bwav/replace-string-at-position/actions/permissions/workflow
{"default_workflow_permissions":"write","can_approve_pull_request_reviews":true}
## Branches
$ gh api repos/m4bwav/replace-string-at-position/branches --paginate --jq '.[].name'
master

## Rulesets and branch protection
$ gh api repos/m4bwav/replace-string-at-position/rulesets --jq '.[] | "\(.id) \(.name) \(.enforcement)"'; gh api repos/m4bwav/replace-string-at-position/branches/$(gh repo view m4bwav/replace-string-at-position --json defaultBranchRef --jq .defaultBranchRef.name)/protection --jq . 2>/dev/null || echo '(no classic branch protection)'
{"message":"Branch not protected","documentation_url":"https://docs.github.com/rest/branches/branch-protection#get-branch-protection","status":"404"}(no classic branch protection)

## Issues (all states)
$ gh issue list -R m4bwav/replace-string-at-position --state all --limit 100 --json number,title,state,author,createdAt,closedAt --jq '.[] | "#\(.number) \(.state) \(.createdAt[:10]) \(.author.login): \(.title)"'

## Pull requests (all states)
$ gh pr list -R m4bwav/replace-string-at-position --state all --limit 100 --json number,title,state,author,headRefName,createdAt --jq '.[] | "#\(.number) \(.state) \(.createdAt[:10]) \(.author.login) [\(.headRefName)]: \(.title)"'
#1 CLOSED 2016-05-22 gitter-badger [gitter-badge]: Add a Gitter chat badge to README.md

## Open Dependabot alerts by severity, package and scope
$ gh api "repos/m4bwav/replace-string-at-position/dependabot/alerts?state=open&per_page=100" --paginate --jq '.[] | "\(.security_advisory.severity) \(.dependency.package.name) \(.dependency.scope)"' | sort | uniq -c | sort -rn

## Open Dependabot alerts, count
$ gh api "repos/m4bwav/replace-string-at-position/dependabot/alerts?state=open&per_page=100" --paginate --jq length
0

## Webhooks (dead services leave these)
$ gh api repos/m4bwav/replace-string-at-position/hooks --jq '.[] | "\(.id) \(.config.url) active=\(.active) events=\(.events|join(","))"'
14564189 https://snyk.io/webhook/github active=true events=pull_request,push
83049528 https://notify.travis-ci.org active=true events=create,delete,issue_comment,member,public,pull_request,push,repository
278473357 https://snyk.io/webhook/github/836a153a-c58b-4b55-8d7b-2e98c2cd2a04 active=true events=pull_request,push

## Actions secrets (count) and variables
$ gh api repos/m4bwav/replace-string-at-position/actions/secrets --jq '{total_count, names:[.secrets[].name]}'; gh api repos/m4bwav/replace-string-at-position/actions/variables --jq '{total_count, names:[.variables[].name]}'
{"names":[],"total_count":0}
{"names":[],"total_count":0}

## Environments
$ gh api repos/m4bwav/replace-string-at-position/environments --jq '.environments[]? | "\(.name) reviewers=\([.protection_rules[]? | select(.type=="required_reviewers") | .reviewers[]?.reviewer.login] | join(","))"'

## Workflows
$ gh api repos/m4bwav/replace-string-at-position/actions/workflows --jq '.workflows[] | "\(.name) \(.path) \(.state)"'

## Forks
$ gh api repos/m4bwav/replace-string-at-position/forks --jq '.[] | "\(.full_name) pushed=\(.pushed_at[:10])"'
gitter-badger/replace-string-at-position pushed=2016-05-22

## Releases and tags
$ gh release list -R m4bwav/replace-string-at-position --limit 20; gh api repos/m4bwav/replace-string-at-position/tags --jq '.[].name' | head -30

## Dead-service files in the default branch
$ gh api repos/m4bwav/replace-string-at-position/git/trees/HEAD?recursive=1 --jq '.tree[].path' | grep -Ei '^(\.travis\.yml|\.snyk|\.sonarcloud\.properties|sonar-project\.properties|\.coveralls\.yml|codecov\.yml|\.codecov\.yml|appveyor\.yml|\.circleci/|\.npmignore|\.nuspec|\.vscode/)' || echo '(none)'
.travis.yml
.vscode/launch.json

## Badges in the README
$ gh api repos/m4bwav/replace-string-at-position/readme --jq .content | base64 -d 2>/dev/null | grep -Eo 'https?://[^ )]*(shields\.io|travis-ci|david-dm|snyk\.io|coveralls|codecov|gitter|sonarcloud|badge)[^ )]*' | sort -u || echo '(none)'
https://badges.gitter.im/m4bwav/replace-string-at-position.svg
https://coveralls.io/github/m4bwav/replace-string-at-position?branch=master
https://david-dm.org/m4bwav/replace-string-at-position
https://gitter.im/m4bwav/replace-string-at-position?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge
https://img.shields.io/badge/code_style-XO-5ed9c7.svg
https://img.shields.io/coveralls/m4bwav/replace-string-at-position/master.svg
https://img.shields.io/david/m4bwav/replace-string-at-position.svg
https://img.shields.io/travis/m4bwav/replace-string-at-position/master.svg
https://snyk.io/test/npm/replace-string-at-position
https://snyk.io/test/npm/replace-string-at-position/badge.svg?style=flat-square
https://travis-ci.org/m4bwav/replace-string-at-position

## Things only the maintainer can see
- Installed GitHub Apps and authorized OAuth apps: github.com/settings/installations and github.com/settings/applications (the API refuses the gh token).
- Whether a token in history is still live: revoke it at the provider regardless.

## Next: in the clone
- Read every source and test file, package.json, the build config, the README and every dotfile.
- Leaked credentials: .travis.yml, .npmrc, .env, workflows, and history (git log -S TOKEN_NAME).
- Run the old build and tests as they are (Windows: npm --script-shell "C:/Program Files/Git/bin/bash.exe" test for ./node_modules/.bin scripts).
- Then the golden capture from the PUBLISHED version in a scratch project (scripts/golden-capture-npm.template.cjs).
```

Related: see also [../../test/golden/1.0.4.json](../../test/golden/1.0.4.json).
