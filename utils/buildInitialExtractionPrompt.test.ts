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
      "You extract explicit grant requirements from one or more evidence sources describing one grant opportunity.",
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

  it("defines strict UI-safe requirement value formatting rules", () => {
    const prompt = buildInitialExtractionPrompt({
      opportunityName: "Zendesk Impact Awards",
      sourceBlocks:
        "--- SOURCE 1: zendesk.txt ---\nOrganizations based in Belarus, Cuba, Iran, and Russia are not eligible.",
      extractionNotes: [],
    });

    expect(prompt.systemPrompt).toContain(
      "Extract for grant triage, matrix comparison, and grant detail review.",
    );
    expect(prompt.systemPrompt).toContain(
      "requirements[].value is displayed directly in the matrix and grant detail UI.",
    );
    expect(prompt.systemPrompt).toContain(
      "Write requirements[].value as a short, user-facing requirement label.",
    );
    expect(prompt.systemPrompt).toContain(
      "Never write vague phrases like \"certain countries\"",
    );
    expect(prompt.systemPrompt).toContain(
      "If the source lists places, statuses, documents, populations, or exclusions, include the named items in requirements[].value.",
    );
    expect(prompt.systemPrompt).toContain(
      "Use plain English; do not expose internal category names, JSON terms, matcher logic, confidence, or normalization language.",
    );
    expect(prompt.systemPrompt).toContain(
      "Keep requirements[].value under 10 words when possible.",
    );
    expect(prompt.systemPrompt).toContain(
      "Do not omit critical named exclusions just to stay short.",
    );
    expect(prompt.systemPrompt).toContain(
      "metadata: opportunity facts used for matrix columns.",
    );
    expect(prompt.systemPrompt).toContain(
      "requirements[].normalizedValues: lowercase comparable atoms for deterministic matching.",
    );
    expect(prompt.systemPrompt).toContain(
      "requirements[].sourceQuote: exact source evidence; this may be longer.",
    );
    expect(prompt.systemPrompt).toContain(
      "extractionNotes: extraction warnings only, not eligibility requirements.",
    );
    expect(prompt.systemPrompt).toContain(
      "applicant_type: say who may apply.",
    );
    expect(prompt.systemPrompt).toContain(
      "legal_status/tax_status: translate into plain English.",
    );
    expect(prompt.systemPrompt).toContain(
      "location: include allowed or excluded places.",
    );
    expect(prompt.systemPrompt).toContain(
      "funding_constraint: distinguish award amount from match/cost-share requirements.",
    );
    expect(prompt.systemPrompt).toContain("Good values:");
    expect(prompt.systemPrompt).toContain("Must be a registered nonprofit");
    expect(prompt.systemPrompt).toContain("Excludes Belarus, Cuba, Iran, Russia");
    expect(prompt.systemPrompt).toContain("Awards range from $10K to $50K");
    expect(prompt.systemPrompt).toContain("Bad values:");
    expect(prompt.systemPrompt).toContain("not based in certain countries");
    expect(prompt.systemPrompt).toContain(
      "The requirement is explicit but not normalized",
    );
    expect(prompt.systemPrompt).toContain("legal_status: 501(c)(3)");
  });
});
