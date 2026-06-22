export const createOpportunityIntakeLimits = {
  maxFiles: 10,
  maxFileBytes: 20 * 1024 * 1024,
  maxPastedSnippets: 10,
  maxPastedCharsPerSnippet: 40_000,
  maxAggregateTextChars: 180_000,
} as const;

export type CreateOpportunityFileInput = {
  name: string;
  size: number;
  type?: string | null;
};

export type CreateOpportunityPastedTextInput = {
  text: string;
};

export type CreateOpportunityIntakeInput = {
  opportunityName?: string | null;
  files?: CreateOpportunityFileInput[] | null;
  pastedTexts?: CreateOpportunityPastedTextInput[] | null;
  aggregateTextChars?: number | null;
};

export type CreateOpportunityIntakeResult =
  | {
      isValid: true;
      normalizedName: string;
    }
  | {
      isValid: false;
      errors: string[];
    };

const supportedMimeTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

const supportedExtensions = [".pdf", ".docx", ".txt"];

function hasSupportedFileType(file: CreateOpportunityFileInput) {
  const lowerName = file.name.toLowerCase();

  return (
    supportedMimeTypes.has(file.type ?? "") ||
    supportedExtensions.some((extension) => lowerName.endsWith(extension))
  );
}

export function validateCreateOpportunityIntake(
  input: CreateOpportunityIntakeInput,
): CreateOpportunityIntakeResult {
  const files = input.files ?? [];
  const pastedTexts = input.pastedTexts ?? [];
  const normalizedName = input.opportunityName?.trim() ?? "";
  const errors: string[] = [];

  if (!normalizedName) {
    errors.push("Opportunity name is required.");
  }

  if (files.length + pastedTexts.length === 0) {
    errors.push("Add at least one file or pasted text snippet.");
  }

  if (files.length > createOpportunityIntakeLimits.maxFiles) {
    errors.push("Upload no more than 10 files.");
  }

  for (const file of files) {
    if (file.size > createOpportunityIntakeLimits.maxFileBytes) {
      errors.push(`File exceeds the 20MB limit: ${file.name}.`);
    }

    if (!hasSupportedFileType(file)) {
      errors.push(`Unsupported file type: ${file.name}.`);
    }
  }

  if (pastedTexts.length > createOpportunityIntakeLimits.maxPastedSnippets) {
    errors.push("Add no more than 10 pasted text snippets.");
  }

  if (
    pastedTexts.some(
      (snippet) =>
        snippet.text.length >
        createOpportunityIntakeLimits.maxPastedCharsPerSnippet,
    )
  ) {
    errors.push("Pasted text snippet exceeds the 40,000 character limit.");
  }

  if (
    (input.aggregateTextChars ?? 0) >
    createOpportunityIntakeLimits.maxAggregateTextChars
  ) {
    errors.push("Combined evidence exceeds the 180,000 character analysis limit.");
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
    };
  }

  return {
    isValid: true,
    normalizedName,
  };
}
