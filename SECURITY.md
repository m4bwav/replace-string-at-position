# Security policy

## Reporting a problem

Open an issue or a pull request and I'll take a look. You can also report privately: open the repository's **Security** tab and choose **Report a vulnerability**.

A confirmed problem is fixed in a new release, and the advisory is published once the fix is on npm.

## Supported versions

Only the latest major version (2.x) gets security fixes.

## What this package is not

It splices text and nothing more: it does not escape or sanitize what it inserts, so text going into HTML, SQL or a shell command must be escaped by the caller. It does not check that the text at the position is the text being replaced; only the length of `sourceString` counts.
