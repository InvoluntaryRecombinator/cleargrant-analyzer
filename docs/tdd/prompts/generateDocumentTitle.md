# generateDocumentTitle TDD Intent

`generateDocumentTitle` should choose a user-facing document title for grouped grant inputs.

When a custom name is supplied, it should be returned unchanged. When no custom name is supplied, the function should generate deterministic fallback names using the file type and 1-based index, such as `Pasted_Text_1` for pasted text and `Uploaded_PDF_2` for uploaded PDFs.

Refactor coverage should keep the existing simple behavior while making malformed intake safer: missing file types should fall back to `Unknown_Format`, negative indexes should be normalized with `Math.abs`, and explicit uploaded text markers or text MIME types should not be mislabeled as pasted text.
