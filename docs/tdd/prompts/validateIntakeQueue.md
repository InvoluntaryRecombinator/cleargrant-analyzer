# validateIntakeQueue TDD Intent

`validateIntakeQueue` should guard the future intake flow before any OpenAI-backed analysis starts.

It takes an opportunity name and a queued evidence array, then returns `{ isValid: boolean; error?: string }`.

The first validation error should be actionable for the intake UI:
- Missing or whitespace-only opportunity names are invalid.
- A zero-length or missing evidence queue is invalid.
- A non-empty opportunity name and at least one queued item is valid.
