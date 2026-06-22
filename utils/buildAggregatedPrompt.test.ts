import { describe, expect, it } from "vitest";

import { buildAggregatedPrompt } from "./buildAggregatedPrompt";

describe("buildAggregatedPrompt", () => {
  it("joins multiple document texts with the document separator", () => {
    expect(
      buildAggregatedPrompt([
        "First document text.",
        "Second document text.",
        "Third document text.",
      ]),
    ).toBe(
      "First document text.\n\n--- NEXT DOCUMENT ---\n\nSecond document text.\n\n--- NEXT DOCUMENT ---\n\nThird document text.",
    );
  });

  it("returns a single document unchanged", () => {
    expect(buildAggregatedPrompt(["Only document text."])).toBe(
      "Only document text.",
    );
  });

  it("filters out empty and invalid document values before joining", () => {
    expect(
      buildAggregatedPrompt([
        "Uploaded PDF text.",
        "",
        null,
        "   ",
        undefined,
        42,
        "Pasted text.",
      ]),
    ).toBe("Uploaded PDF text.\n\n--- NEXT DOCUMENT ---\n\nPasted text.");
  });

  it("returns an empty string when no valid document text is present", () => {
    expect(buildAggregatedPrompt([])).toBe("");
    expect(buildAggregatedPrompt(null)).toBe("");
    expect(buildAggregatedPrompt(undefined)).toBe("");
  });
});
