import { describe, expect, it } from "vitest";

import { generateDocumentTitle } from "./documentNaming";

describe("generateDocumentTitle", () => {
  it("returns the custom name when one is provided", () => {
    expect(generateDocumentTitle("CA Tech Grant", "pdf", 1)).toBe(
      "CA Tech Grant",
    );
  });

  it("uses a pasted text fallback when no custom name is provided for text", () => {
    expect(generateDocumentTitle(null, "txt", 1)).toBe("Pasted_Text_1");
  });

  it("uses an uploaded file fallback when no custom name is provided for PDFs", () => {
    expect(generateDocumentTitle(null, "pdf", 2)).toBe("Uploaded_PDF_2");
  });

  it("uses the uppercased file type in uploaded file fallbacks", () => {
    expect(generateDocumentTitle(null, "docx", 3)).toBe("Uploaded_DOCX_3");
  });
});
