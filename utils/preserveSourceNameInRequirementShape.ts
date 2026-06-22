export type ExtractedGrantWithSourceNames = {
  metadata: Record<string, unknown>;
  requirements: Array<Record<string, unknown>>;
  extractionNotes?: string[];
  extractionConfidence: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function preserveSourceNameInRequirementShape(
  extraction: unknown,
): ExtractedGrantWithSourceNames {
  if (!isRecord(extraction)) {
    throw new Error("Extraction result must be an object.");
  }

  if (!Array.isArray(extraction.requirements)) {
    throw new Error("Extraction result must include a requirements array.");
  }

  for (const requirement of extraction.requirements) {
    if (!isRecord(requirement)) {
      throw new Error("Every extracted requirement must be an object.");
    }

    if (
      typeof requirement.sourceName !== "string" ||
      requirement.sourceName.trim().length === 0
    ) {
      throw new Error(
        "Every extracted requirement must include a non-empty sourceName.",
      );
    }
  }

  return extraction as ExtractedGrantWithSourceNames;
}
