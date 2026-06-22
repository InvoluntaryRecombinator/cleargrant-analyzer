import "server-only";

import OpenAI from "openai";

import {
  buildInitialExtractionPrompt,
  grantExtractionSystemRules,
} from "@/utils/buildInitialExtractionPrompt";
import type {
  ExtractedGrant,
  ExtractedRequirementCategory,
} from "@/utils/matchGrantToProfile";

const requirementCategories: ExtractedRequirementCategory[] = [
  "applicant_type",
  "legal_status",
  "tax_status",
  "location",
  "registration",
  "funding_constraint",
  "required_document",
  "ongoing_requirement",
  "other_hard_requirement",
  "other_eligibility_note",
];

const categorySet = new Set(requirementCategories);

const extractionSchema = {
  type: "object",
  additionalProperties: false,
  required: ["metadata", "requirements", "extractionNotes", "extractionConfidence"],
  properties: {
    metadata: {
      type: "object",
      additionalProperties: false,
      required: ["grantTitle", "funderName", "deadline", "awardText"],
      properties: {
        grantTitle: { type: "string" },
        funderName: { type: "string" },
        deadline: { type: "string" },
        awardText: { type: "string" },
      },
    },
    requirements: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "category",
          "value",
          "sourceName",
          "sourceQuote",
          "normalizedValues",
          "confidence",
        ],
        properties: {
          category: {
            type: "string",
            enum: requirementCategories,
          },
          value: {
            type: "string",
          },
          sourceName: {
            type: "string",
          },
          sourceQuote: {
            type: "string",
          },
          normalizedValues: {
            type: "array",
            items: {
              type: "string",
            },
          },
          confidence: {
            type: "string",
            enum: ["high", "medium", "low"],
          },
        },
      },
    },
    extractionNotes: {
      type: "array",
      items: {
        type: "string",
      },
    },
    extractionConfidence: {
      type: "string",
      enum: ["high", "medium", "low"],
    },
  },
} as const;

function extractionPrompt(fileName: string, text: string) {
  return `Source heading: ${fileName}

Extract grant eligibility and compliance requirements from the evidence text below.

Evidence text:
--- SOURCE 1: ${fileName} ---
${text}`;
}

async function requestStructuredExtraction({
  apiKey,
  systemPrompt,
  userPrompt,
}: {
  apiKey: string;
  systemPrompt: string;
  userPrompt: string;
}) {
  const openai = new OpenAI({
    apiKey,
  });

  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    input: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "grant_requirement_array_extraction",
        description:
          "Explicit grant metadata and requirements extracted only from source text.",
        strict: true,
        schema: extractionSchema,
      },
    },
  });

  if (!response.output_text) {
    throw new Error("OpenAI returned no structured output text.");
  }

  const parsed = JSON.parse(response.output_text) as unknown;
  assertExtractedGrant(parsed);

  return parsed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertExtractedGrant(value: unknown): asserts value is ExtractedGrant {
  if (!isRecord(value)) {
    throw new Error("Extraction result was not an object.");
  }

  if (!isRecord(value.metadata)) {
    throw new Error("Extraction result did not include metadata.");
  }

  if (!Array.isArray(value.requirements)) {
    throw new Error("Extraction result did not include a requirements array.");
  }

  for (const requirement of value.requirements) {
    if (!isRecord(requirement)) {
      throw new Error("Extraction requirement was not an object.");
    }

    if (
      typeof requirement.category !== "string" ||
      !categorySet.has(requirement.category as ExtractedRequirementCategory)
    ) {
      throw new Error("Extraction requirement had an invalid category.");
    }

    if (
      typeof requirement.value !== "string" ||
      typeof requirement.sourceName !== "string" ||
      typeof requirement.sourceQuote !== "string" ||
      !Array.isArray(requirement.normalizedValues) ||
      !["high", "medium", "low"].includes(String(requirement.confidence))
    ) {
      throw new Error("Extraction requirement had an invalid shape.");
    }
  }

  if (!["high", "medium", "low"].includes(String(value.extractionConfidence))) {
    throw new Error("Extraction result had an invalid confidence value.");
  }
}

export async function extractGrantRequirements({
  apiKey,
  fileName,
  text,
}: {
  apiKey: string;
  fileName: string;
  text: string;
}) {
  return requestStructuredExtraction({
    apiKey,
    systemPrompt: grantExtractionSystemRules.join(" "),
    userPrompt: extractionPrompt(fileName, text),
  });
}

export async function extractGroupedGrantRequirements({
  apiKey,
  opportunityName,
  sourceBlocks,
  extractionNotes,
}: {
  apiKey: string;
  opportunityName: string;
  sourceBlocks: string;
  extractionNotes?: string[];
}) {
  const prompt = buildInitialExtractionPrompt({
    opportunityName,
    sourceBlocks,
    extractionNotes,
  });

  return requestStructuredExtraction({
    apiKey,
    ...prompt,
  });
}
