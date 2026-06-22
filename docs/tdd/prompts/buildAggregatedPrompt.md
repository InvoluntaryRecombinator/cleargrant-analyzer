# buildAggregatedPrompt TDD Intent

`buildAggregatedPrompt` should combine text extracted from multiple documents into one prompt body while preserving each document's text exactly and separating adjacent documents with:

```txt

--- NEXT DOCUMENT ---

```

The red test verifies that two or more document strings are joined with that exact separator, while a single document is returned unchanged.
