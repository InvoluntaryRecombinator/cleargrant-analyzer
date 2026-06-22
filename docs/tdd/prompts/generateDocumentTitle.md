# generateDocumentTitle TDD Intent

`generateDocumentTitle` should choose a user-facing document title for grouped grant inputs.

When a custom name is supplied, it should be returned unchanged. When no custom name is supplied, the function should generate deterministic fallback names using the file type and 1-based index, such as `Pasted_Text_1` for pasted text and `Uploaded_PDF_2` for uploaded PDFs.
