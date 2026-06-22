export function buildAggregatedPrompt(_documents: string[]) {
  return _documents.join("\n\n--- NEXT DOCUMENT ---\n\n");
}
