---
title: "v2 shape: keep well-formed calls exact, refuse corrupting calls, keep require()"
kind: decision
status: proposed
date: 2026-09-25
verified: 2026-09-25
stale_after: never
tags: [v2, api, errors, esm, cjs, golden, compatibility]
summary: "read before changing what the function accepts or how it is exported: why 2.0.0 keeps 1.0.4's answer for three strings and an in-range integer position, throws on everything 1.0.4 corrupted, keeps require() callable, drops the CLI and releases no 1.x"
---

# Decision: v2 keeps every well-formed call exact, refuses the calls 1.0.4 corrupted, and keeps require() callable

Date: 2026-09-25. Status: proposed, waiting for the maintainer's plan review. Each point maps to a row of the plan's decisions table in [../plans/2026-09-25-modernization-and-v2-release.md](../plans/2026-09-25-modernization-and-v2-release.md).

## Context

replace-string-at-position 1.0.4 (2016-05-22) is one ES5 function, `module.exports = function (originalString, sourceString, newString, position)`, built on `substring` and string concatenation with no argument checks. The capture of the published version (`test/golden/1.0.4.json`, 71 cases) shows it returns the right text for three strings and an integer position inside the text, and corrupted text for most other calls: a missing position returns the text twice, a string position `'1'` becomes `'11'` and drops the tail, negative and NaN positions splice from the start, and `null` replacement text is written in as `'null'`. Its two known dependents call it only with strings and an index found in the same text. The survey is [../notes/2026-09-25-phase-0-survey-baseline-and-dependents.md](../notes/2026-09-25-phase-0-survey-baseline-and-dependents.md).

## Decision

1. **Well-formed calls stay exact (D1).** Three strings (or `String` objects) and an integer position from 0 to the text's length: the 26 such cases in the capture are asserted exactly on both builds.
2. **Corrupting calls throw (D3, D7).** A missing or non-number position, or a non-string text argument: TypeError. A negative, NaN, fractional or past-the-end position: RangeError (past the end is the one judgement call, D3c). Messages name the argument. The 45 other captured cases are named exceptions in the golden test that assert the error class.
3. **Kept on purpose:** the source text is not compared with the text at the position; a source running past the end removes to the end; positions are UTF-16 code units.
4. **`require()` returns the function (D2)**, which also carries `.default` and `.replaceStringAtPosition`; ESM has a default and a named export; attw proves the types.
5. **2.0.0 only (D4).** No 1.0.5 and no deprecation of 1.0.4. The CLI, which was never installable, is dropped (D6).

## Reasons

- Nobody can depend on the corrupted results on purpose, and a thrown error finds the caller's bug where the old output hid it.
- The major is needed anyway for the `exports` map and the Node floor, so the refusals cost no extra break.
- Both dependents are pinned to `^1.0.4`; a 1.x release would reach them but the package already works for them, and deprecating it would only add warnings.

## Rejected alternatives

- A packaging-only 2.0.0 that keeps all 71 cases exact: safe, but carries the duplicated-text and dropped-tail bugs into a new major.
- Checking that `sourceString` is at the position: changes the answer for well-formed calls (cases 8 and 9) and is a new feature nobody asked for.
- Clamping positions past the end (D3c alternative): matches `slice`, and is the maintainer's to choose.

Related: builds on [../plans/2026-09-25-modernization-and-v2-release.md](../plans/2026-09-25-modernization-and-v2-release.md); see also [../notes/2026-09-25-phase-0-survey-baseline-and-dependents.md](../notes/2026-09-25-phase-0-survey-baseline-and-dependents.md).
