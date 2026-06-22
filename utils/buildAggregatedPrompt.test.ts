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
});
