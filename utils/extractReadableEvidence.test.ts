import { describe, expect, it } from "vitest";

import { extractReadableEvidence } from "./extractReadableEvidence";

describe("extractReadableEvidence", () => {
  it("returns readable evidence ordered by sourceOrder", () => {
    const result = extractReadableEvidence([
      {
        sourceName: "second.pdf",
        sourceOrder: 2,
        extractionStatus: "completed",
        extractedText: "Second source text.",
      },
      {
        sourceName: "first.pdf",
        sourceOrder: 1,
        extractionStatus: "completed",
        extractedText: " First source text. ",
      },
    ]);

    expect(result.readableEvidence).toEqual([
      {
        sourceName: "first.pdf",
        text: "First source text.",
        sourceOrder: 1,
      },
      {
        sourceName: "second.pdf",
        text: "Second source text.",
        sourceOrder: 2,
      },
    ]);
    expect(result.failedEvidence).toEqual([]);
  });

  it("moves failed and blank evidence into warning metadata", () => {
    const result = extractReadableEvidence([
      {
        sourceName: "corrupt.pdf",
        sourceOrder: 1,
        extractionStatus: "failed",
        extractionError: "PDF text extraction failed.",
        extractedText: null,
      },
      {
        sourceName: "image-scan.pdf",
        sourceOrder: 2,
        extractionStatus: "completed",
        extractedText: "   ",
      },
    ]);

    expect(result.readableEvidence).toEqual([]);
    expect(result.failedEvidence).toEqual([
      {
        sourceName: "corrupt.pdf",
        reason: "PDF text extraction failed.",
      },
      {
        sourceName: "image-scan.pdf",
        reason: "Document unreadable or unsupported.",
      },
    ]);
    expect(result.extractionNotes).toEqual([
      "Warning: Could not read evidence source corrupt.pdf: PDF text extraction failed.",
      "Warning: Could not read evidence source image-scan.pdf: Document unreadable or unsupported.",
    ]);
  });
});
