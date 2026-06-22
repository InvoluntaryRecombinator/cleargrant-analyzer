import { describe, expect, it } from "vitest";

import { buildInitialExtractionPrompt } from "./buildInitialExtractionPrompt";

describe("buildInitialExtractionPrompt", () => {
  it("builds system and user prompts for a new grouped opportunity", () => {
    const prompt = buildInitialExtractionPrompt({
      opportunityName: "CA Dream Fund",
      sourceBlocks:
        "--- SOURCE 1: guidelines.pdf ---\nEligible applicants are California nonprofits.",
      extractionNotes: [],
    });

    expect(prompt.systemPrompt).toContain(
      "You extract explicit grant requirements from multiple evidence sources describing one grant opportunity.",
    );
    expect(prompt.systemPrompt).toContain("sourceName");
    expect(prompt.systemPrompt).toContain("sourceQuote");
    expect(prompt.systemPrompt).toContain("metadata.awardText");
    expect(prompt.userPrompt).toContain("Opportunity name: CA Dream Fund");
    expect(prompt.userPrompt).toContain("--- SOURCE 1: guidelines.pdf ---");
  });

  it("includes conflict and failed-evidence instructions", () => {
    const prompt = buildInitialExtractionPrompt({
      opportunityName: "CA Dream Fund",
      sourceBlocks: "--- SOURCE 1: faq.pdf ---\nDeadline is May 1.",
      extractionNotes: [
        "Warning: Could not read evidence source scan.pdf: Document unreadable or unsupported.",
      ],
    });

    expect(prompt.systemPrompt).toContain(
      "If two sources conflict, log the conflict in extractionNotes and cite both source names.",
    );
    expect(prompt.userPrompt).toContain(
      "Warning: Could not read evidence source scan.pdf",
    );
  });
});
