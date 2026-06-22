# buildInitialExtractionPrompt Requirement Value Style TDD Intent

## Purpose

Verify that extraction prompts define UI-safe requirement values before the
OpenAI JSON extraction step runs.

## Cases

- Explain that extracted data is for grant triage, matrix comparison, and grant
  detail review.
- Define `requirements[].value` as a short user-facing label shown directly in
  the UI.
- Ban vague summaries such as "certain countries" and matcher/internal logic.
- Require plain-English translations for legal, tax, location, document, and
  funding requirements.
- Keep requirement values concise for dense dashboard cells while preserving
  named exclusions and critical specifics.
- Clarify field roles for `metadata`, `requirements[].value`,
  `normalizedValues`, `sourceQuote`, and `extractionNotes`.
- Include category guidance and good/bad examples.

## Expected Red Run

The red run should fail because the current prompt does not define strict
dashboard-safe formatting rules for `requirements[].value`.
