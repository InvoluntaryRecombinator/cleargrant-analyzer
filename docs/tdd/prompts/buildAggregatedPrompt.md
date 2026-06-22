# buildAggregatedPrompt TDD Intent

`buildAggregatedPrompt` should combine text extracted from multiple documents into one prompt body while preserving each document's text exactly and separating adjacent documents with:

```txt

--- NEXT DOCUMENT ---

```

The red test verifies that two or more document strings are joined with that exact separator, while a single document is returned unchanged.

The refactor coverage verifies that empty, whitespace-only, null, undefined, and other non-string values are ignored so a pasted-text-only flow or malformed input can still produce a safe prompt string.
