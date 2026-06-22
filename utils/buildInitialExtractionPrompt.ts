export type InitialExtractionPromptInput = {
  opportunityName: string;
  sourceBlocks: string;
  extractionNotes?: string[];
};

export type InitialExtractionPrompt = {
  systemPrompt: string;
  userPrompt: string;
};

export function buildInitialExtractionPrompt(
  input: InitialExtractionPromptInput,
): InitialExtractionPrompt {
  const notes = input.extractionNotes?.length
    ? `\n\nPre-extraction notes:\n${input.extractionNotes
        .map((note) => `- ${note}`)
        .join("\n")}`
    : "";

  return {
    systemPrompt:
      [
        "You extract explicit grant requirements from multiple evidence sources describing one grant opportunity.",
        "Return only facts directly supported by the source text.",
        "Do not infer missing requirements, create checklist defaults, or claim official eligibility.",
        "Every requirement must include sourceName copied exactly from its source heading.",
        "Every requirement must include sourceQuote copied exactly from the same source.",
        "If two sources conflict, log the conflict in extractionNotes and cite both source names.",
      ].join(" "),
    userPrompt: [
      `Opportunity name: ${input.opportunityName.trim()}`,
      "",
      "Evidence sources:",
      input.sourceBlocks,
      notes,
    ].join("\n"),
  };
}
