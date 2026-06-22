import { describe, expect, it } from "vitest";

import { generateVirtualEvidenceFileName } from "./generateVirtualEvidenceFileName";

describe("generateVirtualEvidenceFileName", () => {
  it("generates deterministic pasted text filenames", () => {
    expect(generateVirtualEvidenceFileName(1)).toBe(
      "pasted-text-snippet-1.txt",
    );
    expect(generateVirtualEvidenceFileName(12)).toBe(
      "pasted-text-snippet-12.txt",
    );
  });

  it("normalizes invalid and fractional indexes to a safe positive integer", () => {
    expect(generateVirtualEvidenceFileName(0)).toBe(
      "pasted-text-snippet-1.txt",
    );
    expect(generateVirtualEvidenceFileName(-4)).toBe(
      "pasted-text-snippet-1.txt",
    );
    expect(generateVirtualEvidenceFileName(2.9)).toBe(
      "pasted-text-snippet-2.txt",
    );
  });
});
