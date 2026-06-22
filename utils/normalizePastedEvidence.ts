export type PastedEvidenceInput = {
  text: string;
  displayName?: string | null;
  sourceUrl?: string | null;
  sourceOrder: number;
  snippetIndex: number;
};

export type PastedEvidenceOptions = {
  maxCharsPerSnippet?: number;
};

export type NormalizedPastedEvidence = {
  sourceKind: "pasted_text";
  fileName: string;
  displayName: string;
  fileType: "text/plain";
  fileUrl: null;
  sourceUrl: string | null;
  sourceOrder: number;
  extractedText: string;
  extractionStatus: "completed";
  fileSize: number;
  wasTruncated: boolean;
};

const defaultMaxCharsPerSnippet = 40_000;

function normalizeSnippetIndex(snippetIndex: number) {
  return Math.max(1, Math.floor(snippetIndex));
}

export function normalizePastedEvidence(
  input: PastedEvidenceInput,
  options: PastedEvidenceOptions = {},
): NormalizedPastedEvidence {
  const snippetIndex = normalizeSnippetIndex(input.snippetIndex);
  const maxCharsPerSnippet =
    options.maxCharsPerSnippet ?? defaultMaxCharsPerSnippet;
  const trimmedText = input.text.trim();
  const extractedText = trimmedText.slice(0, Math.max(0, maxCharsPerSnippet));
  const displayName =
    input.displayName?.trim() || `Pasted Text Snippet ${snippetIndex}`;
  const sourceUrl = input.sourceUrl?.trim() || null;

  return {
    sourceKind: "pasted_text",
    fileName: `pasted-text-snippet-${snippetIndex}.txt`,
    displayName,
    fileType: "text/plain",
    fileUrl: null,
    sourceUrl,
    sourceOrder: input.sourceOrder,
    extractedText,
    extractionStatus: "completed",
    fileSize: extractedText.length,
    wasTruncated: extractedText.length < trimmedText.length,
  };
}
