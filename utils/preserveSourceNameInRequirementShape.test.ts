import { describe, expect, it } from "vitest";

import {
  preserveSourceNameInRequirementShape,
  type ExtractedGrantWithSourceNames,
} from "./preserveSourceNameInRequirementShape";

describe("preserveSourceNameInRequirementShape", () => {
  it("returns the extraction unchanged when every requirement has sourceName", () => {
    const extraction: ExtractedGrantWithSourceNames = {
      metadata: {
        grantTitle: "CA Dream Fund",
      },
      requirements: [
        {
          category: "location",
          value: "Applicants must operate in California.",
          sourceName: "guidelines.pdf",
          sourceQuote: "Applicants must operate in California.",
          normalizedValues: ["california"],
          confidence: "high",
        },
      ],
      extractionNotes: [],
      extractionConfidence: "high",
    };

    expect(preserveSourceNameInRequirementShape(extraction)).toEqual(extraction);
  });

  it("rejects requirements with missing sourceName", () => {
    expect(() =>
      preserveSourceNameInRequirementShape({
        metadata: {},
        requirements: [
          {
            category: "location",
            value: "Applicants must operate in California.",
            sourceQuote: "Applicants must operate in California.",
            normalizedValues: ["california"],
            confidence: "high",
          },
        ],
        extractionConfidence: "high",
      }),
    ).toThrow("Every extracted requirement must include a non-empty sourceName.");
  });

  it("rejects requirements with a blank sourceName", () => {
    expect(() =>
      preserveSourceNameInRequirementShape({
        metadata: {},
        requirements: [
          {
            category: "location",
            value: "Applicants must operate in California.",
            sourceName: "   ",
            sourceQuote: "Applicants must operate in California.",
            normalizedValues: ["california"],
            confidence: "high",
          },
        ],
        extractionConfidence: "high",
      }),
    ).toThrow("Every extracted requirement must include a non-empty sourceName.");
  });
});
