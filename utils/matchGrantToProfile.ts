export type ExtractedRequirementCategory =
  | "applicant_type"
  | "legal_status"
  | "tax_status"
  | "location"
  | "registration"
  | "funding_constraint"
  | "required_document"
  | "ongoing_requirement"
  | "other_hard_requirement"
  | "other_eligibility_note";

export type ExtractedRequirement = {
  category: ExtractedRequirementCategory;
  value: string;
  sourceQuote: string;
  normalizedValues?: string[];
  confidence: "high" | "medium" | "low";
};

export type ExtractedGrant = {
  metadata: {
    grantTitle?: string;
    funderName?: string;
    deadline?: string;
    awardText?: string;
  };
  requirements: ExtractedRequirement[];
  extractionNotes?: string[];
  extractionConfidence: "high" | "medium" | "low";
};

export type MatchProfile = {
  applicantType: string;
  legalStatus?: string | null;
  taxStatus?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  focusAreas: string[];
  populationsServed: string[];
  projectTypes: string[];
  hasFiscalSponsor?: boolean | null;
  hasEin?: boolean | null;
  hasSamRegistration?: boolean | null;
  hasUei?: boolean | null;
  canProvideMatchFunds?: boolean | null;
  minimumUsefulAward?: number | null;
};

export type MatchReason = {
  category: ExtractedRequirementCategory;
  grantRequirement: string;
  profileValue?: string;
  sourceQuote?: string;
};

export type NeedsReviewItem = {
  category: ExtractedRequirementCategory;
  requirement: string;
  reason: string;
  sourceQuote?: string;
};

export type PassedItem = {
  category: ExtractedRequirementCategory;
  reason: string;
  sourceQuote?: string;
};

export type MatchResult = {
  matchLabel: "High Match" | "Medium Match" | "Low Match" | "Needs Review";
  score: number;
  primaryReason: string;
  hardNoReasons: MatchReason[];
  needsReviewItems: NeedsReviewItem[];
  passedItems: PassedItem[];
};

type ComparableCategory =
  | "applicant_type"
  | "legal_status"
  | "tax_status"
  | "location"
  | "registration"
  | "funding_constraint";

const comparableCategories = new Set<ExtractedRequirementCategory>([
  "applicant_type",
  "legal_status",
  "tax_status",
  "location",
  "registration",
  "funding_constraint",
]);

function normalize(value: string | null | undefined) {
  return value
    ?.trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9()]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compact(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => normalize(value))
        .filter((value): value is string => Boolean(value)),
    ),
  );
}

function expandProfileValues(values: string[]) {
  const expanded = new Set(values);

  values.forEach((value) => {
    if (value.includes("501") || value.includes("c 3") || value.includes("c)(3")) {
      expanded.add("501(c)(3)");
      expanded.add("501 c 3");
      expanded.add("nonprofit");
    }

    if (value.includes("nonprofit")) {
      expanded.add("nonprofit organization");
    }

    if (value.includes("public agency") || value.includes("government")) {
      expanded.add("public agency");
      expanded.add("government entity");
    }

    if (value.includes("individual")) {
      expanded.add("individual applicant");
      expanded.add("individual");
    }
  });

  return Array.from(expanded)
    .map((value) => normalize(value))
    .filter((value): value is string => Boolean(value));
}

function valuesForCategory(
  profile: MatchProfile,
  category: ComparableCategory,
) {
  switch (category) {
    case "applicant_type":
      return expandProfileValues(
        compact([profile.applicantType, profile.legalStatus]),
      );
    case "legal_status":
      return expandProfileValues(
        compact([profile.legalStatus, profile.applicantType]),
      );
    case "tax_status": {
      const values = compact([profile.taxStatus, profile.legalStatus]);
      if (profile.hasFiscalSponsor) {
        values.push("fiscal sponsor", "501(c)(3)");
      }
      return expandProfileValues(values);
    }
    case "location":
      return compact([profile.country, profile.state, profile.city]);
    case "registration": {
      const values: string[] = [];
      if (profile.hasEin) values.push("ein");
      if (profile.hasSamRegistration) values.push("sam", "sam registration");
      if (profile.hasUei) values.push("uei");
      return compact(values);
    }
    case "funding_constraint": {
      const values: string[] = [];
      if (profile.canProvideMatchFunds) {
        values.push("match funds required", "matching funds", "cash match");
      }
      return compact(values);
    }
  }
}

function getRequirementValues(requirement: ExtractedRequirement) {
  return compact(requirement.normalizedValues ?? []);
}

function intersects(profileValues: string[], requirementValues: string[]) {
  return requirementValues.some((requirementValue) =>
    profileValues.some(
      (profileValue) =>
        profileValue === requirementValue ||
        profileValue.includes(requirementValue) ||
        requirementValue.includes(profileValue),
    ),
  );
}

function profileValueText(profileValues: string[]) {
  return profileValues.length > 0 ? profileValues.join(", ") : "Not indicated";
}

function passReason(requirement: ExtractedRequirement) {
  return `Profile overlaps with extracted ${requirement.category.replaceAll("_", " ")} requirement.`;
}

function isComparableCategory(
  category: ExtractedRequirementCategory,
): category is ComparableCategory {
  return comparableCategories.has(category);
}

export function matchGrantToProfile(
  profile: MatchProfile,
  grant: ExtractedGrant,
): MatchResult {
  const hardNoReasons: MatchReason[] = [];
  const needsReviewItems: NeedsReviewItem[] = [];
  const passedItems: PassedItem[] = [];

  for (const requirement of grant.requirements ?? []) {
    if (!isComparableCategory(requirement.category)) {
      continue;
    }

    const requirementValues = getRequirementValues(requirement);

    if (requirementValues.length === 0) {
      needsReviewItems.push({
        category: requirement.category,
        requirement: requirement.value,
        reason:
          "The requirement is explicit, but it was not normalized enough for deterministic comparison.",
        sourceQuote: requirement.sourceQuote,
      });
      continue;
    }

    const profileValues = valuesForCategory(profile, requirement.category);

    if (intersects(profileValues, requirementValues)) {
      passedItems.push({
        category: requirement.category,
        reason: passReason(requirement),
        sourceQuote: requirement.sourceQuote,
      });
      continue;
    }

    hardNoReasons.push({
      category: requirement.category,
      grantRequirement: requirement.value,
      profileValue: profileValueText(profileValues),
      sourceQuote: requirement.sourceQuote,
    });
  }

  if (hardNoReasons.length > 0) {
    return {
      matchLabel: "Low Match",
      score: Math.max(20, 45 - hardNoReasons.length * 10),
      primaryReason: `The extracted ${hardNoReasons[0].category.replaceAll("_", " ")} requirement does not overlap with the saved profile: ${hardNoReasons[0].grantRequirement}`,
      hardNoReasons,
      needsReviewItems,
      passedItems,
    };
  }

  if (needsReviewItems.length > 0) {
    return {
      matchLabel: "Needs Review",
      score: 55,
      primaryReason: needsReviewItems[0].reason,
      hardNoReasons,
      needsReviewItems,
      passedItems,
    };
  }

  if (passedItems.length > 0) {
    return {
      matchLabel: "High Match",
      score: 85,
      primaryReason:
        "No deterministic conflicts were found, and at least one extracted requirement overlaps with the saved profile.",
      hardNoReasons,
      needsReviewItems,
      passedItems,
    };
  }

  return {
    matchLabel: "Medium Match",
    score: 70,
    primaryReason:
      "No deterministic conflicts were found in the extracted requirements.",
    hardNoReasons,
    needsReviewItems,
    passedItems,
  };
}
