import type {
  ExtractedGrant,
  ExtractedRequirement,
  ExtractedRequirementCategory,
} from "./matchGrantToProfile";
import { formatGrantDeadlineLabel } from "./parseGrantDeadline";
import { readableGrantStatus } from "./presentation";

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

export const extractionFailedText =
  "Extraction Failed: Document unreadable or unsupported.";

const missingLabel = "Not stated";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function textValue(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function asExtractedRequirement(value: unknown): ExtractedRequirement | null {
  if (!isRecord(value)) {
    return null;
  }

  const category = textValue(value.category);
  const requirementValue = textValue(value.value);
  const sourceName = textValue(value.sourceName);
  const sourceQuote = textValue(value.sourceQuote);
  const confidence = textValue(value.confidence);

  if (
    !category ||
    !requirementValue ||
    !sourceName ||
    !sourceQuote ||
    !["high", "medium", "low"].includes(confidence ?? "")
  ) {
    return null;
  }

  return {
    category: category as ExtractedRequirementCategory,
    value: requirementValue,
    sourceName,
    sourceQuote,
    normalizedValues: Array.isArray(value.normalizedValues)
      ? value.normalizedValues.filter(
          (item): item is string => typeof item === "string",
        )
      : [],
    confidence: confidence as ExtractedRequirement["confidence"],
  };
}

function asExtractedGrant(value: unknown): ExtractedGrant | null {
  if (!isRecord(value) || !isRecord(value.metadata) || !Array.isArray(value.requirements)) {
    return null;
  }

  const extractionConfidence = textValue(value.extractionConfidence);

  if (!["high", "medium", "low"].includes(extractionConfidence ?? "")) {
    return null;
  }

  return {
    metadata: {
      grantTitle: textValue(value.metadata.grantTitle) ?? "",
      funderName: textValue(value.metadata.funderName) ?? "",
      deadline: textValue(value.metadata.deadline) ?? "",
      awardText: textValue(value.metadata.awardText) ?? "",
    },
    requirements: value.requirements
      .map(asExtractedRequirement)
      .filter((item): item is ExtractedRequirement => Boolean(item)),
    extractionNotes: Array.isArray(value.extractionNotes)
      ? value.extractionNotes.filter((item): item is string => typeof item === "string")
      : [],
    extractionConfidence: extractionConfidence as ExtractedGrant["extractionConfidence"],
  };
}

function firstRequirement(
  extractedGrant: ExtractedGrant | null,
  categories: ExtractedRequirementCategory[],
) {
  const requirement = extractedGrant?.requirements.find((item) =>
    categories.includes(item.category),
  );

  return requirement?.value ?? missingLabel;
}

function countNeedsReview(value: unknown) {
  return Array.isArray(value) ? value.length : 0;
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function databaseAwardLabel(awardMin?: number | null, awardMax?: number | null) {
  if (awardMin && awardMax) {
    return awardMin === awardMax
      ? formatUsd(awardMin)
      : `${formatUsd(awardMin)}-${formatUsd(awardMax)}`;
  }

  if (awardMin) {
    return `${formatUsd(awardMin)}+`;
  }

  if (awardMax) {
    return `Up to ${formatUsd(awardMax)}`;
  }

  return null;
}

function isAwardLikeFundingRequirement(requirement: ExtractedRequirement) {
  if (requirement.category !== "funding_constraint") {
    return false;
  }

  const text = `${requirement.value} ${requirement.sourceQuote}`.toLowerCase();
  const hasAmount = /(?:\$|usd|dollars?\b|\b\d+\s?(?:k|m)\b)/i.test(text);
  const hasAwardLanguage =
    /\b(award|awards|grant|grants|funding|receive|available|range|between|up to)\b/i.test(
      text,
    );
  const isMatchRequirement =
    /\b(match|matching|cost share|cost-share|cash match)\b/i.test(text);

  return hasAmount && hasAwardLanguage && !isMatchRequirement;
}

function awardAmountLabel(record: GrantMatrixRecord, extractedGrant: ExtractedGrant | null) {
  const metadataAward = textValue(extractedGrant?.metadata.awardText);

  if (metadataAward) {
    return metadataAward;
  }

  const parsedAward = databaseAwardLabel(record.awardMin, record.awardMax);

  if (parsedAward) {
    return parsedAward;
  }

  const fundingAward = extractedGrant?.requirements.find(
    isAwardLikeFundingRequirement,
  );

  return fundingAward?.value ?? missingLabel;
}

export function buildGrantMatrixRow(record: GrantMatrixRecord): GrantMatrixRow {
  const extractedGrant = asExtractedGrant(record.extractionResult?.extractedJson);
  const titleLabel =
    textValue(record.title) ??
    textValue(extractedGrant?.metadata.grantTitle) ??
    textValue(record.sourceFileName) ??
    "Untitled grant";
  const sourceLabel = textValue(record.sourceFileName) ?? "Uploaded document";
  const statusLabel = readableGrantStatus(
    record.processingStatus,
    record.matchResult?.matchLabel,
  );
  const primaryReason =
    record.processingStatus === "failed"
      ? extractionFailedText
      : textValue(record.matchResult?.primaryReason) ?? "Analysis is not complete.";
  const funderLabel =
    textValue(record.funder) ??
    textValue(extractedGrant?.metadata.funderName) ??
    missingLabel;

  return {
    id: record.id,
    extractedGrant,
    titleLabel,
    sourceLabel,
    statusLabel,
    primaryReason,
    funderLabel,
    deadlineLabel: formatGrantDeadlineLabel(
      record.deadline,
      extractedGrant?.metadata.deadline,
    ),
    awardAmountLabel: awardAmountLabel(record, extractedGrant),
    applicantRequirementLabel: firstRequirement(extractedGrant, ["applicant_type"]),
    locationRequirementLabel: firstRequirement(extractedGrant, ["location"]),
    legalTaxRequirementLabel: firstRequirement(extractedGrant, [
      "legal_status",
      "tax_status",
    ]),
    hardRequirementCount:
      extractedGrant?.requirements.filter(
        (requirement) => requirement.category !== "other_eligibility_note",
      ).length ?? 0,
    needsReviewCount: countNeedsReview(record.matchResult?.needsReviewItems),
    extractionConfidenceLabel:
      extractedGrant?.extractionConfidence ?? "Not available",
  };
}
