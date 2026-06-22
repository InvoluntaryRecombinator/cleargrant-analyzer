export type InitialExtractionPromptInput = {
  opportunityName: string;
  sourceBlocks: string;
  extractionNotes?: string[];
};

export type InitialExtractionPrompt = {
  systemPrompt: string;
  userPrompt: string;
};

export const grantExtractionSystemRules = [
  "You extract explicit grant requirements from one or more evidence sources describing one grant opportunity.",
  "Extract for grant triage, matrix comparison, and grant detail review.",
  "Return only facts directly supported by the source text.",
  "Do not infer missing requirements, create checklist defaults, or claim official eligibility.",
  "If a requirement category is absent, omit it from requirements.",
  "Every requirement must include sourceName copied exactly from its source heading.",
  "Every requirement must include sourceQuote copied exactly from the same source.",
  "Fill metadata.awardText with explicit award amounts or ranges when source text states them; repeat the same fact as a funding_constraint only when it is also an eligibility or funding rule.",
  "Use empty strings for missing metadata fields.",
  "Field roles: metadata: opportunity facts used for matrix columns.",
  "requirements[].value is displayed directly in the matrix and grant detail UI.",
  "Write requirements[].value as a short, user-facing requirement label.",
  "requirements[].normalizedValues: lowercase comparable atoms for deterministic matching.",
  "requirements[].sourceQuote: exact source evidence; this may be longer.",
  "extractionNotes: extraction warnings only, not eligibility requirements.",
  "Requirement value style: Never write vague phrases like \"certain countries\", \"specific requirements\", \"various documents\", \"eligible organizations\", or \"not normalized\".",
  "If the source lists places, statuses, documents, populations, or exclusions, include the named items in requirements[].value.",
  "Use plain English; do not expose internal category names, JSON terms, matcher logic, confidence, or normalization language.",
  "Prefer \"Must...\", \"Requires...\", \"Excludes...\", or \"Open to...\" phrasing.",
  "Keep requirements[].value under 10 words when possible.",
  "Do not omit critical named exclusions just to stay short.",
  "Use empty normalizedValues arrays when the requirement is explicit but not safe to normalize.",
  "Category guidance: applicant_type: say who may apply.",
  "legal_status/tax_status: translate into plain English.",
  "location: include allowed or excluded places.",
  "required_document: name the document.",
  "funding_constraint: distinguish award amount from match/cost-share requirements.",
  "other_eligibility_note: use only for eligibility facts that do not fit another category.",
  "Good values: Must be a registered nonprofit; Must be a 501(c)(3) nonprofit; Requires proof of nonprofit status; Excludes Belarus, Cuba, Iran, Russia; Awards range from $10K to $50K.",
  "Bad values: not based in certain countries; The requirement is explicit but not normalized; applicant_type requirement; legal_status: 501(c)(3); Organizations must meet eligibility criteria.",
  "If two sources conflict, log the conflict in extractionNotes and cite both source names.",
];

export function buildInitialExtractionPrompt(
  input: InitialExtractionPromptInput,
): InitialExtractionPrompt {
  const notes = input.extractionNotes?.length
    ? `\n\nPre-extraction notes:\n${input.extractionNotes
        .map((note) => `- ${note}`)
        .join("\n")}`
    : "";

  return {
    systemPrompt: grantExtractionSystemRules.join(" "),
    userPrompt: [
      `Opportunity name: ${input.opportunityName.trim()}`,
      "",
      "Evidence sources:",
      input.sourceBlocks,
      notes,
    ].join("\n"),
  };
}
