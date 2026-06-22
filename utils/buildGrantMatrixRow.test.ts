import { describe, expect, it } from "vitest";

import { buildGrantMatrixRow } from "./buildGrantMatrixRow";
import type { ExtractedGrant } from "./matchGrantToProfile";

const zendeskExtraction: ExtractedGrant = {
  metadata: {
    deadline: "July 15, 2026, at 11:59 pm ET",
    awardText: "",
    funderName: "Zendesk",
    grantTitle: "Zendesk Impact Awards",
  },
  requirements: [
    {
      value: "awards range from $10K to $50K",
      category: "funding_constraint",
      confidence: "high",
      sourceName: "ZENDESK grant.txt",
      sourceQuote:
        "Applicants are eligible to receive financial awards between $10K-$50K.",
      normalizedValues: [],
    },
  ],
  extractionNotes: [],
  extractionConfidence: "high",
};

const baseGrantRecord = {
  id: "grant-1",
  title: null,
  sourceFileName: "ZENDESK grant.txt",
  funder: null,
  deadline: null,
  awardMin: null,
  awardMax: null,
  processingStatus: "analyzed",
  extractionResult: {
    extractedJson: zendeskExtraction,
  },
  matchResult: {
    matchLabel: "Low Match",
    primaryReason: "Saved profile does not overlap.",
    needsReviewItems: [{ requirement: "Location unclear" }],
  },
  uploadedDocuments: [
    {
      sourceKind: "file",
      extractionStatus: "completed",
    },
    {
      sourceKind: "pasted_text",
      extractionStatus: "completed",
    },
  ],
};

describe("buildGrantMatrixRow", () => {
  it("uses extracted JSON metadata when database snapshot fields are absent", () => {
    const row = buildGrantMatrixRow(baseGrantRecord);

    expect(row.opportunityName).toBe("Zendesk Impact Awards");
    expect(row.sourceSummary).toBe("2 sources: 1 file, 1 source text");
    expect(row.funderLabel).toBe("Zendesk");
    expect(row.deadlineLabel).toBe("July 15, 2026, at 11:59 pm ET");
    expect(row.fitLabel).toBe("Likely conflict");
    expect(row.sourceHealthLabel).toBe("2 readable");
  });

  it("falls back to award-like funding constraints when metadata award text is empty", () => {
    const row = buildGrantMatrixRow(baseGrantRecord);

    expect(row.awardLabel).toBe("awards range from $10K to $50K");
  });

  it("prefers metadata award text over funding constraint fallback", () => {
    const row = buildGrantMatrixRow({
      ...baseGrantRecord,
      extractionResult: {
        extractedJson: {
          ...zendeskExtraction,
          metadata: {
            ...zendeskExtraction.metadata,
            awardText: "$25,000 implementation grant",
          },
        },
      },
    });

    expect(row.awardLabel).toBe("$25,000 implementation grant");
  });

  it("does not show matching fund requirements as award amounts", () => {
    const row = buildGrantMatrixRow({
      ...baseGrantRecord,
      extractionResult: {
        extractedJson: {
          ...zendeskExtraction,
          metadata: {
            ...zendeskExtraction.metadata,
            awardText: "",
          },
          requirements: [
            {
              value: "A $10,000 cash match is required.",
              category: "funding_constraint",
              confidence: "high",
              sourceName: "guidelines.pdf",
              sourceQuote: "A $10,000 cash match is required.",
              normalizedValues: [],
            },
          ],
        },
      },
    });

    expect(row.awardLabel).toBe("—");
  });

  it("formats parsed database awards when extraction award text is absent", () => {
    const row = buildGrantMatrixRow({
      ...baseGrantRecord,
      awardMin: 10000,
      awardMax: 50000,
      extractionResult: {
        extractedJson: {
          ...zendeskExtraction,
          metadata: {
            ...zendeskExtraction.metadata,
            awardText: "",
          },
          requirements: [],
        },
      },
    });

    expect(row.awardLabel).toBe("$10,000-$50,000");
  });

  it("ignores malformed extracted JSON instead of throwing during row mapping", () => {
    const row = buildGrantMatrixRow({
      ...baseGrantRecord,
      title: null,
      sourceFileName: "old-row.txt",
      extractionResult: {
        extractedJson: {
          requirements: [],
        },
      },
      matchResult: {
        matchLabel: null,
        primaryReason: null,
        needsReviewItems: "not-json-array",
      },
    });

    expect(row.opportunityName).toBe("old-row.txt");
    expect(row.funderLabel).toBe("—");
    expect(row.awardLabel).toBe("—");
    expect(row.fitLabel).toBe("Review needed");
  });

  it("reports unreadable source health without raw extraction columns", () => {
    const row = buildGrantMatrixRow({
      ...baseGrantRecord,
      uploadedDocuments: [
        {
          sourceKind: "file",
          extractionStatus: "completed",
        },
        {
          sourceKind: "file",
          extractionStatus: "failed",
        },
      ],
    });

    expect(row.sourceSummary).toBe("2 sources: 2 files");
    expect(row.sourceHealthLabel).toBe("1 readable, 1 unreadable");
  });
});
