import "server-only";

import OpenAI from "openai";

import { getRequiredEnv } from "@/lib/env";
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
  return `Document filename: ${fileName}

Extract grant eligibility and compliance requirements from the document text below.

Rules:
- Extract only requirements explicitly stated in the document.
- Do not infer missing requirements.
- Do not create booleans or checklist defaults.
- If a requirement category is absent, omit it from requirements.
- Every requirement must include a short exact sourceQuote from the text.
- normalizedValues should contain lowercase comparable values only when directly supported by the source text.
- Use an empty normalizedValues array when the requirement is explicit but not safe to normalize.
- Use empty strings for missing metadata fields.
- Do not claim official eligibility.

Document text:
${text}`;
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
  fileName,
  text,
}: {
  fileName: string;
  text: string;
}) {
  const openai = new OpenAI({
    apiKey: getRequiredEnv("OPENAI_API_KEY"),
  });

  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    input: [
      {
        role: "system",
        content:
          "You extract explicit grant document requirements into a strict JSON requirement-array schema.",
      },
      {
        role: "user",
        content: extractionPrompt(fileName, text),
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
