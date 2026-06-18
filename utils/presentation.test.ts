import { describe, expect, it } from "vitest";

import { matchStatusClassName, readableGrantStatus } from "./presentation";

describe("presentation helpers", () => {
  it("maps match statuses to semantic badge classes", () => {
    expect(matchStatusClassName("High Match")).toContain("bg-emerald-50");
    expect(matchStatusClassName("Needs Review")).toContain("text-amber-900");
    expect(matchStatusClassName("Extraction Failed")).toContain("text-rose-800");
  });

  it("converts processing states into readable labels", () => {
    expect(readableGrantStatus("failed", null)).toBe("Extraction Failed");
    expect(readableGrantStatus("processing", null)).toBe("Processing");
    expect(readableGrantStatus("uploaded", null)).toBe("Uploaded");
    expect(readableGrantStatus("analyzed", "Needs Review")).toBe("Needs Review");
  });
});
