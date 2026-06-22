export type EvidenceSource = {
  sourceName: string;
  text: string | null | undefined;
};

export type EvidenceSourceBlocksResult = {
  promptText: string;
  includedSources: string[];
  extractionNotes: string[];
  wasTruncated: boolean;
};

export type EvidenceSourceBlockOptions = {
  maxAggregateChars?: number;
};

const defaultMaxAggregateChars = 180_000;

export function buildEvidenceSourceBlocks(
  sources: EvidenceSource[],
  options: EvidenceSourceBlockOptions = {},
): EvidenceSourceBlocksResult {
  const maxAggregateChars =
    options.maxAggregateChars ?? defaultMaxAggregateChars;
  const blocks: string[] = [];
  const includedSources: string[] = [];
  const extractionNotes: string[] = [];
  let remainingChars = Math.max(0, maxAggregateChars);
  let wasTruncated = false;

  for (const source of sources) {
    const sourceName = source.sourceName.trim();
    const text = source.text?.trim() ?? "";

    if (!text) {
      extractionNotes.push(`Skipped empty evidence source: ${sourceName}.`);
      continue;
    }

    if (remainingChars <= 0) {
      wasTruncated = true;
      extractionNotes.push(
        `Truncated evidence source after aggregate cap: ${sourceName}.`,
      );
      continue;
    }

    const bodyText = text.slice(0, remainingChars);
    blocks.push(`--- SOURCE ${blocks.length + 1}: ${sourceName} ---\n${bodyText}`);
    includedSources.push(sourceName);
    remainingChars -= bodyText.length;

    if (bodyText.length < text.length) {
      wasTruncated = true;
      extractionNotes.push(
        `Truncated evidence source after aggregate cap: ${sourceName}.`,
      );
    }
  }

  return {
    promptText: blocks.join("\n\n"),
    includedSources,
    extractionNotes,
    wasTruncated,
  };
}
