import { describe, expect, it } from "vitest";

import { buildEvidenceSourceBlocks } from "./buildEvidenceSourceBlocks";

describe("buildEvidenceSourceBlocks", () => {
  it("wraps readable evidence in numbered source headings", () => {
    const result = buildEvidenceSourceBlocks([
      {
        sourceName: "guidelines.pdf",
        text: "Eligible applicants must be California nonprofits.",
      },
      {
        sourceName: "Pasted website text",
        text: "Applications are due May 1.",
      },
    ]);

    expect(result.promptText).toBe(
      [
        "--- SOURCE 1: guidelines.pdf ---",
        "Eligible applicants must be California nonprofits.",
        "",
        "--- SOURCE 2: Pasted website text ---",
        "Applications are due May 1.",
      ].join("\n"),
    );
    expect(result.includedSources).toEqual([
      "guidelines.pdf",
      "Pasted website text",
    ]);
    expect(result.extractionNotes).toEqual([]);
    expect(result.wasTruncated).toBe(false);
  });

  it("skips blank evidence without renumbering gaps", () => {
    const result = buildEvidenceSourceBlocks([
      { sourceName: "empty.pdf", text: "   " },
      { sourceName: "faq.pdf", text: "Grant awards are up to $50,000." },
    ]);

    expect(result.promptText).toBe(
      "--- SOURCE 1: faq.pdf ---\nGrant awards are up to $50,000.",
    );
    expect(result.includedSources).toEqual(["faq.pdf"]);
    expect(result.extractionNotes).toEqual([
      "Skipped empty evidence source: empty.pdf.",
    ]);
  });

  it("truncates body text at the aggregate character cap and records the source", () => {
    const result = buildEvidenceSourceBlocks(
      [
        {
          sourceName: "long-guidelines.pdf",
          text: "abcdefghijklmnopqrstuvwxyz",
        },
      ],
      { maxAggregateChars: 12 },
    );

    expect(result.promptText).toBe(
      "--- SOURCE 1: long-guidelines.pdf ---\nabcdefghijkl",
    );
    expect(result.wasTruncated).toBe(true);
    expect(result.extractionNotes).toEqual([
      "Truncated evidence source after aggregate cap: long-guidelines.pdf.",
    ]);
  });
});
