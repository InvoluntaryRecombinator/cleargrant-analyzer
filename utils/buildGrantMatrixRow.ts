import type { ExtractedGrant } from "./matchGrantToProfile";

export type GrantMatrixRecord = {
  id: string;
  title: string | null;
  sourceFileName: string | null;
  funder: string | null;
  deadline: Date | null;
  awardMin?: number | null;
  awardMax?: number | null;
  processingStatus: string;
  extractionResult:
    | {
        extractedJson: unknown | null;
      }
    | null;
  matchResult:
    | {
        matchLabel: string | null;
        primaryReason: string | null;
        needsReviewItems: unknown | null;
      }
    | null;
};

export type GrantMatrixRow = {
  id: string;
  extractedGrant: ExtractedGrant | null;
  titleLabel: string;
  sourceLabel: string;
  statusLabel: string;
  primaryReason: string;
  funderLabel: string;
  deadlineLabel: string;
  awardAmountLabel: string;
  applicantRequirementLabel: string;
  locationRequirementLabel: string;
  legalTaxRequirementLabel: string;
  hardRequirementCount: number;
  needsReviewCount: number;
  extractionConfidenceLabel: string;
};

export function buildGrantMatrixRow(record: GrantMatrixRecord): GrantMatrixRow {
  return {
    id: record.id,
    extractedGrant: null,
    titleLabel: record.title ?? "Untitled grant",
    sourceLabel: record.sourceFileName ?? "Uploaded document",
    statusLabel: "Uploaded",
    primaryReason: "Analysis is not complete.",
    funderLabel: "Not stated",
    deadlineLabel: "Not stated",
    awardAmountLabel: "Not stated",
    applicantRequirementLabel: "Not stated",
    locationRequirementLabel: "Not stated",
    legalTaxRequirementLabel: "Not stated",
    hardRequirementCount: 0,
    needsReviewCount: 0,
    extractionConfidenceLabel: "Not available",
  };
}
