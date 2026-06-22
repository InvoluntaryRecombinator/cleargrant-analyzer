# parseGrantDeadline TDD Intent

## Purpose

Verify that extracted grant deadline metadata is converted into stable calendar
dates for database storage and user-facing labels.

## Cases

- Parse natural-language dates that include time and timezone words, such as
  `July 15, 2026, at 11:59 pm ET`.
- Parse common grant date formats without relying on JavaScript's ambiguous
  `Date` string parser.
- Return `null` for absent, rolling, or invalid dates.
- Format parsed dates as compact labels.
- Fall back to the raw extracted deadline string when a parsed database date is
  unavailable, so previously analyzed grants do not display as missing metadata.

## Expected Red Run

The red run should fail because `utils/parseGrantDeadline.ts` starts with stub
implementations that do not parse or format deadline values.
