const documentSeparator = "\n\n--- NEXT DOCUMENT ---\n\n";

export function buildAggregatedPrompt(
  documents: unknown[] | null | undefined,
) {
  return (documents ?? [])
    .filter(
      (documentText): documentText is string =>
        typeof documentText === "string" && documentText.trim().length > 0,
    )
    .join(documentSeparator);
}
