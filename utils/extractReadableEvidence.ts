export type EvidenceExtractionStatus = "completed" | "failed";

export type EvidenceExtractionInput = {
  sourceName: string;
  sourceOrder?: number | null;
  extractionStatus?: EvidenceExtractionStatus | null;
  extractionError?: string | null;
  extractedText?: string | null;
};

export type ReadableEvidence = {
  sourceName: string;
  text: string;
  sourceOrder: number;
};

export type FailedEvidence = {
  sourceName: string;
  reason: string;
};

export type ReadableEvidenceResult = {
  readableEvidence: ReadableEvidence[];
  failedEvidence: FailedEvidence[];
  extractionNotes: string[];
};

const unreadableReason = "Document unreadable or unsupported.";

export function extractReadableEvidence(
  evidenceItems: EvidenceExtractionInput[],
): ReadableEvidenceResult {
  const readableEvidence: ReadableEvidence[] = [];
  const failedEvidence: FailedEvidence[] = [];

  for (const item of evidenceItems) {
    const sourceOrder = item.sourceOrder ?? 0;
    const text = item.extractedText?.trim() ?? "";
    const failed = item.extractionStatus === "failed" || !text;

    if (failed) {
      failedEvidence.push({
        sourceName: item.sourceName,
        reason: item.extractionError?.trim() || unreadableReason,
      });
      continue;
    }

    readableEvidence.push({
      sourceName: item.sourceName,
      text,
      sourceOrder,
    });
  }

  readableEvidence.sort((left, right) => left.sourceOrder - right.sourceOrder);

  return {
    readableEvidence,
    failedEvidence,
    extractionNotes: failedEvidence.map(
      (item) =>
        `Warning: Could not read evidence source ${item.sourceName}: ${item.reason}`,
    ),
  };
}
