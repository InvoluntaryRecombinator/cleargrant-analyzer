export type ExtractedGrantWithSourceNames = {
  metadata: Record<string, unknown>;
  requirements: unknown[];
  extractionNotes?: string[];
  extractionConfidence: string;
};

export function preserveSourceNameInRequirementShape() {
  return {
    metadata: {},
    requirements: [],
    extractionConfidence: "low",
  };
}
