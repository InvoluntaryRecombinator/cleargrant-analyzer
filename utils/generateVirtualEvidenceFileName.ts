export function generateVirtualEvidenceFileName(snippetIndex: number) {
  const normalizedIndex = Math.max(1, Math.floor(snippetIndex));
  return `pasted-text-snippet-${normalizedIndex}.txt`;
}
