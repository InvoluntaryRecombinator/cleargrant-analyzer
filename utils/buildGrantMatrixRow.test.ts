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
};

describe("buildGrantMatrixRow", () => {
  it("uses extracted JSON metadata when database snapshot fields are absent", () => {
    const row = buildGrantMatrixRow(baseGrantRecord);

    expect(row.titleLabel).toBe("Zendesk Impact Awards");
    expect(row.sourceLabel).toBe("ZENDESK grant.txt");
    expect(row.funderLabel).toBe("Zendesk");
    expect(row.deadlineLabel).toBe("July 15, 2026, at 11:59 pm ET");
    expect(row.statusLabel).toBe("Low Match");
    expect(row.needsReviewCount).toBe(1);
  });

  it("falls back to award-like funding constraints when metadata award text is empty", () => {
    const row = buildGrantMatrixRow(baseGrantRecord);

    expect(row.awardAmountLabel).toBe("awards range from $10K to $50K");
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

    expect(row.awardAmountLabel).toBe("$25,000 implementation grant");
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

    expect(row.awardAmountLabel).toBe("Not stated");
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

    expect(row.awardAmountLabel).toBe("$10,000-$50,000");
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

    expect(row.titleLabel).toBe("old-row.txt");
    expect(row.funderLabel).toBe("Not stated");
    expect(row.awardAmountLabel).toBe("Not stated");
    expect(row.needsReviewCount).toBe(0);
  });
});
