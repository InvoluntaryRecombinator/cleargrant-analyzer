import { describe, expect, it } from "vitest";

import { validateCreateOpportunityIntake } from "./validateCreateOpportunityIntake";

describe("validateCreateOpportunityIntake", () => {
  it("passes for a named opportunity with supported evidence", () => {
    const result = validateCreateOpportunityIntake({
      opportunityName: "  CA Dream Fund  ",
      files: [
        {
          name: "guidelines.pdf",
          size: 2_500_000,
          type: "application/pdf",
        },
      ],
      pastedTexts: [
        {
          text: "Eligibility copied from a webpage.",
        },
      ],
      aggregateTextChars: 10_000,
    });

    expect(result).toEqual({
      isValid: true,
      normalizedName: "CA Dream Fund",
    });
  });

  it("requires an opportunity name and at least one evidence item", () => {
    expect(
      validateCreateOpportunityIntake({
        opportunityName: " ",
        files: [],
        pastedTexts: [],
        aggregateTextChars: 0,
      }),
    ).toEqual({
      isValid: false,
      errors: [
        "Opportunity name is required.",
        "Add at least one file or pasted text snippet.",
      ],
    });
  });

  it("rejects unsupported files, too many files, and oversized files", () => {
    const result = validateCreateOpportunityIntake({
      opportunityName: "CA Dream Fund",
      files: [
        ...Array.from({ length: 10 }, (_, index) => ({
          name: `guidelines-${index}.pdf`,
          size: 1_000,
          type: "application/pdf",
        })),
        {
          name: "oversized.mov",
          size: 21 * 1024 * 1024,
          type: "video/quicktime",
        },
      ],
      pastedTexts: [],
      aggregateTextChars: 1_000,
    });

    expect(result).toEqual({
      isValid: false,
      errors: [
        "Upload no more than 10 files.",
        "File exceeds the 20MB limit: oversized.mov.",
        "Unsupported file type: oversized.mov.",
      ],
    });
  });

  it("rejects pasted text limit violations and aggregate OpenAI overflow", () => {
    const result = validateCreateOpportunityIntake({
      opportunityName: "CA Dream Fund",
      files: [],
      pastedTexts: [
        ...Array.from({ length: 10 }, () => ({ text: "short snippet" })),
        { text: "x".repeat(40_001) },
      ],
      aggregateTextChars: 180_001,
    });

    expect(result).toEqual({
      isValid: false,
      errors: [
        "Add no more than 10 pasted text snippets.",
        "Pasted text snippet exceeds the 40,000 character limit.",
        "Combined evidence exceeds the 180,000 character analysis limit.",
      ],
    });
  });
});
