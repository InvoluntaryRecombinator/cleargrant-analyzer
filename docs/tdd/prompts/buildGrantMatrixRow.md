# buildGrantMatrixRow TDD Intent

## Purpose

Verify that Prisma grant rows, extracted JSON, and match results are converted
into one stable matrix row view model before rendering.

## Cases

- Prefer extracted metadata for title and funder when database snapshot fields
  are absent.
- Display raw extracted deadline text when the stored parsed date is absent.
- Display `metadata.awardText` when available.
- Fall back from an empty `metadata.awardText` to an award-like
  `funding_constraint` requirement, such as `$10K-$50K`.
- Do not treat matching-fund requirements as award amounts.
- Ignore malformed extracted JSON instead of letting the matrix render crash.
- Count needs-review items only when the saved match payload is an array.

## Expected Red Run

The red run should fail because `utils/buildGrantMatrixRow.ts` starts with a
stub implementation that does not map grant JSON into display labels.
