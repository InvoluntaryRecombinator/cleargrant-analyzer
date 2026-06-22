import { describe, expect, it } from "vitest";

import { normalizePastedEvidence } from "./normalizePastedEvidence";

describe("normalizePastedEvidence", () => {
  it("creates a virtual evidence row from pasted text", () => {
    const evidence = normalizePastedEvidence({
      text: "  Eligibility rules from a grant webpage.  ",
      displayName: "  Website FAQ  ",
      sourceUrl: "  https://example.org/grants  ",
      sourceOrder: 3,
      snippetIndex: 2,
    });

    expect(evidence).toMatchObject({
      sourceKind: "pasted_text",
      fileName: "pasted-text-snippet-2.txt",
      displayName: "Website FAQ",
      fileType: "text/plain",
      fileUrl: null,
      sourceUrl: "https://example.org/grants",
      sourceOrder: 3,
      extractedText: "Eligibility rules from a grant webpage.",
      extractionStatus: "completed",
      wasTruncated: false,
    });
  });

  it("uses a deterministic display name when the user leaves it blank", () => {
    const evidence = normalizePastedEvidence({
      text: "Grant page copy",
      displayName: " ",
      sourceOrder: 0,
      snippetIndex: 1,
    });

    expect(evidence.displayName).toBe("Pasted Text Snippet 1");
    expect(evidence.sourceUrl).toBeNull();
  });

  it("truncates pasted text at the per-snippet character cap", () => {
    const evidence = normalizePastedEvidence(
      {
        text: "abcdefghijklmnopqrstuvwxyz",
        sourceOrder: 0,
        snippetIndex: 1,
      },
      { maxCharsPerSnippet: 12 },
    );

    expect(evidence.extractedText).toBe("abcdefghijkl");
    expect(evidence.fileSize).toBe(12);
    expect(evidence.wasTruncated).toBe(true);
  });
});
