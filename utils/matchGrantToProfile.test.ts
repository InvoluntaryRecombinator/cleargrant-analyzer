import { describe, expect, it } from "vitest";

import {
  matchGrantToProfile,
  type ExtractedGrant,
  type MatchProfile,
} from "./matchGrantToProfile";

const baseProfile: MatchProfile = {
  applicantType: "Nonprofit organization",
  legalStatus: "501(c)(3) nonprofit",
  taxStatus: "501(c)(3)",
  country: "United States",
  state: "California",
  city: "Oakland",
  focusAreas: ["Education", "Youth services"],
  populationsServed: ["Children and youth"],
  projectTypes: ["Program delivery"],
  hasFiscalSponsor: false,
  hasEin: true,
  hasSamRegistration: false,
  hasUei: true,
  canProvideMatchFunds: false,
  minimumUsefulAward: 25000,
};

const grant = (requirements: ExtractedGrant["requirements"]): ExtractedGrant => ({
  metadata: {
    grantTitle: "Neighborhood Learning Fund",
    funderName: "Example Foundation",
  },
  extractionConfidence: "high",
  requirements,
});

describe("matchGrantToProfile", () => {
  it("marks explicit applicant type mismatches as Low Match", () => {
    const result = matchGrantToProfile(
      baseProfile,
      grant([
        {
          category: "applicant_type",
          value: "Only public agencies may apply.",
          normalizedValues: ["public agency"],
          sourceName: "guidelines.pdf",
          sourceQuote: "Eligible applicants are public agencies.",
          confidence: "high",
        },
      ]),
    );

    expect(result.matchLabel).toBe("Low Match");
    expect(result.score).toBeLessThan(50);
    expect(result.hardNoReasons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "applicant_type",
          grantRequirement: "Only public agencies may apply.",
        }),
      ]),
    );
  });

  it("passes when location arrays intersect", () => {
    const result = matchGrantToProfile(
      baseProfile,
      grant([
        {
          category: "location",
          value: "Applicants must be based in California.",
          normalizedValues: ["california"],
          sourceName: "guidelines.pdf",
          sourceQuote: "Applicants must be based in California.",
          confidence: "high",
        },
      ]),
    );

    expect(result.matchLabel).toBe("High Match");
    expect(result.passedItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "location",
        }),
      ]),
    );
  });

  it("marks tax status mismatches as Low Match", () => {
    const result = matchGrantToProfile(
      {
        ...baseProfile,
        taxStatus: "No tax-exempt status",
        legalStatus: "Unincorporated association",
        hasFiscalSponsor: false,
      },
      grant([
        {
          category: "tax_status",
          value: "Applicant must be a 501(c)(3) nonprofit.",
          normalizedValues: ["501(c)(3)"],
          sourceName: "guidelines.pdf",
          sourceQuote: "Applicant must be a 501(c)(3) nonprofit.",
          confidence: "high",
        },
      ]),
    );

    expect(result.matchLabel).toBe("Low Match");
    expect(result.primaryReason).toContain("501(c)(3)");
  });

  it("marks explicit but unnormalized requirements as Needs Review", () => {
    const result = matchGrantToProfile(
      baseProfile,
      grant([
        {
          category: "registration",
          value: "Applicant must have active federal registration.",
          sourceName: "guidelines.pdf",
          sourceQuote: "Applicant must have active federal registration.",
          confidence: "medium",
        },
      ]),
    );

    expect(result.matchLabel).toBe("Needs Review");
    expect(result.needsReviewItems).toEqual([
      expect.objectContaining({
        category: "registration",
      }),
    ]);
  });

  it("does not punish absent requirement categories", () => {
    const result = matchGrantToProfile(baseProfile, grant([]));

    expect(result.matchLabel).toBe("Medium Match");
    expect(result.hardNoReasons).toHaveLength(0);
    expect(result.needsReviewItems).toHaveLength(0);
  });

  it("marks match fund conflicts as Low Match", () => {
    const result = matchGrantToProfile(
      baseProfile,
      grant([
        {
          category: "funding_constraint",
          value: "A 1:1 cash match is required.",
          normalizedValues: ["match funds required"],
          sourceName: "guidelines.pdf",
          sourceQuote: "A 1:1 cash match is required.",
          confidence: "high",
        },
      ]),
    );

    expect(result.matchLabel).toBe("Low Match");
    expect(result.hardNoReasons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "funding_constraint",
        }),
      ]),
    );
  });
});
