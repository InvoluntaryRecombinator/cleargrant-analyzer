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

  it("uses an unknown format fallback when file type is missing", () => {
    expect(generateDocumentTitle(null, undefined, 4)).toBe(
      "Uploaded_Unknown_Format_4",
    );
    expect(generateDocumentTitle(null, null, 5)).toBe(
      "Uploaded_Unknown_Format_5",
    );
    expect(generateDocumentTitle(null, "", 6)).toBe(
      "Uploaded_Unknown_Format_6",
    );
  });

  it("normalizes negative indexes to positive fallback numbers", () => {
    expect(generateDocumentTitle(null, "pdf", -2)).toBe("Uploaded_PDF_2");
    expect(generateDocumentTitle(null, "txt", -1)).toBe("Pasted_Text_1");
  });

  it("does not label explicit uploaded text inputs as pasted text", () => {
    expect(generateDocumentTitle(null, "text/plain", 7)).toBe(
      "Uploaded_TXT_7",
    );
    expect(generateDocumentTitle(null, "uploaded_txt", 8)).toBe(
      "Uploaded_TXT_8",
    );
  });
});
