import { randomUUID } from "crypto";

import { NextResponse } from "next/server";

import { ensureAppUser, getProfileForUser } from "@/lib/auth";
import { extractGroupedGrantRequirements } from "@/lib/extraction/openai";
import { extractTextFromFile } from "@/lib/extraction/text";
import { resolveOpenAiApiKeyForUser } from "@/lib/openaiKeyVault";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { buildEvidenceSourceBlocks } from "@/utils/buildEvidenceSourceBlocks";
import { extractReadableEvidence } from "@/utils/extractReadableEvidence";
import {
  matchGrantToProfile,
  type ExtractedGrant,
  type MatchProfile,
} from "@/utils/matchGrantToProfile";
import { normalizePastedEvidence } from "@/utils/normalizePastedEvidence";
import { extractionErrorMessageForOpenAiKey } from "@/utils/openAiError";
import { parseGrantDeadline } from "@/utils/parseGrantDeadline";
import {
  validateCreateOpportunityIntake,
  type CreateOpportunityFileInput,
} from "@/utils/validateCreateOpportunityIntake";

export const runtime = "nodejs";

const storageBucket = "grant-evidence";

type StoredEvidenceDocument = {
  id: string;
  fileName: string;
  displayName: string;
  fileType: string;
  fileUrl: string | null;
  sourceKind: "file" | "pasted_text";
  sourceUrl: string | null;
  sourceOrder: number;
  extractedText: string | null;
  extractionStatus: "completed" | "failed";
  extractionError: string | null;
  fileSize: number | null;
};

function isUploadedFile(value: FormDataEntryValue): value is File {
  return value instanceof File && value.size > 0;
}

function stringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function parseOptionalNumber(value: FormDataEntryValue | undefined, fallback: number) {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function safeStorageFileName(fileName: string) {
  return (
    fileName
      .trim()
      .replace(/[/\\]+/g, "-")
      .replace(/[^a-zA-Z0-9._ -]+/g, "")
      .replace(/\s+/g, "-") || "evidence-file"
  );
}

function extractionErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  if (message.includes("Unsupported file type")) {
    return "Unsupported file type.";
  }

  if (message.includes("No usable text") || message.includes("unreadable")) {
    return "Document unreadable or unsupported.";
  }

  return message || "Document unreadable or unsupported.";
}

function apiErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  if (
    message.includes("Bucket not found") ||
    message.includes("bucket") ||
    message.includes("storage")
  ) {
    return "Files could not be saved. Try again or contact support.";
  }

  return "Unable to create the grant opportunity.";
}

function toMatchProfile(
  profile: NonNullable<Awaited<ReturnType<typeof getProfileForUser>>>,
): MatchProfile {
  return {
    applicantType: profile.applicantType,
    legalStatus: profile.legalStatus,
    taxStatus: profile.taxStatus,
    country: profile.country,
    state: profile.state,
    city: profile.city,
    focusAreas: profile.focusAreas,
    populationsServed: profile.populationsServed,
    projectTypes: profile.projectTypes,
    hasFiscalSponsor: profile.hasFiscalSponsor,
    hasEin: profile.hasEin,
    hasSamRegistration: profile.hasSamRegistration,
    hasUei: profile.hasUei,
    canProvideMatchFunds: profile.canProvideMatchFunds,
    minimumUsefulAward: profile.minimumUsefulAward,
  };
}

async function cleanupStoredFiles(
  supabase: Awaited<ReturnType<typeof createClient>>,
  paths: string[],
) {
  if (paths.length === 0) {
    return;
  }

  const { error } = await supabase.storage.from(storageBucket).remove(paths);

  if (error) {
    console.error("Failed to clean up uploaded evidence files", error);
  }
}

function failureExtractionSnapshot({
  grantName,
  notes,
}: {
  grantName: string;
  notes: string[];
}): ExtractedGrant {
  return {
    metadata: {
      grantTitle: grantName,
      funderName: "",
      deadline: "",
      awardText: "",
    },
    requirements: [],
    extractionNotes: notes,
    extractionConfidence: "low",
  };
}

function mergeExtractionNotes(
  extractedGrant: ExtractedGrant,
  deterministicNotes: string[],
): ExtractedGrant {
  return {
    ...extractedGrant,
    extractionNotes: [
      ...deterministicNotes,
      ...(extractedGrant.extractionNotes ?? []),
    ],
  };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureAppUser(user);

  const profile = await getProfileForUser(user.id);

  if (!profile) {
    return NextResponse.json(
      { error: "Complete your applicant profile before analyzing grants." },
      { status: 409 },
    );
  }

  const formData = await request.formData();
  const grantName = stringValue(formData.get("grantName"));
  const files = [...formData.getAll("files"), ...formData.getAll("files[]")].filter(
    isUploadedFile,
  );
  const fileDisplayNames = formData.getAll("fileDisplayNames").map(stringValue);
  const fileSourceOrders = formData.getAll("fileSourceOrders");
  const pastedTexts = formData.getAll("pastedTexts").map(stringValue);
  const pastedDisplayNames = formData.getAll("pastedDisplayNames").map(stringValue);
  const pastedSourceUrls = formData.getAll("pastedSourceUrls").map(stringValue);
  const pastedSourceOrders = formData.getAll("pastedSourceOrders");
  const trimmedPastedTexts = pastedTexts
    .map((text, index) => ({
      text,
      displayName: pastedDisplayNames[index],
      sourceUrl: pastedSourceUrls[index],
      sourceOrder: parseOptionalNumber(pastedSourceOrders[index], index),
    }))
    .filter((snippet) => snippet.text.trim().length > 0);
  const validation = validateCreateOpportunityIntake({
    opportunityName: grantName,
    files: files.map<CreateOpportunityFileInput>((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
    })),
    pastedTexts: trimmedPastedTexts.map((snippet) => ({
      text: snippet.text,
    })),
    aggregateTextChars: trimmedPastedTexts.reduce(
      (sum, snippet) => sum + snippet.text.length,
      0,
    ),
  });

  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  const grantId = randomUUID();
  const uploadedPaths: string[] = [];
  const storedDocuments: StoredEvidenceDocument[] = [];
  const deterministicNotes: string[] = [];

  try {
    for (const [index, file] of files.entries()) {
      const documentId = randomUUID();
      const displayName = fileDisplayNames[index]?.trim() || file.name;
      const sourceOrder = parseOptionalNumber(fileSourceOrders[index], index);
      const storagePath = `${user.id}/${grantId}/${documentId}/${safeStorageFileName(
        file.name,
      )}`;
      const upload = await supabase.storage.from(storageBucket).upload(
        storagePath,
        file,
        {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        },
      );

      if (upload.error) {
        throw new Error(`Supabase storage upload failed: ${upload.error.message}`);
      }

      uploadedPaths.push(storagePath);

      try {
        const extracted = await extractTextFromFile(file);

        storedDocuments.push({
          id: documentId,
          fileName: file.name,
          displayName,
          fileType: extracted.fileType,
          fileUrl: storagePath,
          sourceKind: "file",
          sourceUrl: null,
          sourceOrder,
          extractedText: extracted.text,
          extractionStatus: "completed",
          extractionError: null,
          fileSize: file.size,
        });
      } catch (error) {
        storedDocuments.push({
          id: documentId,
          fileName: file.name,
          displayName,
          fileType: file.type || "unknown",
          fileUrl: storagePath,
          sourceKind: "file",
          sourceUrl: null,
          sourceOrder,
          extractedText: null,
          extractionStatus: "failed",
          extractionError: extractionErrorMessage(error),
          fileSize: file.size,
        });
      }
    }

    for (const [index, snippet] of trimmedPastedTexts.entries()) {
      const normalized = normalizePastedEvidence({
        text: snippet.text,
        displayName: snippet.displayName,
        sourceUrl: snippet.sourceUrl,
        sourceOrder: snippet.sourceOrder,
        snippetIndex: index + 1,
      });

      if (normalized.wasTruncated) {
        deterministicNotes.push(
          `Truncated pasted text source after per-snippet cap: ${normalized.displayName}.`,
        );
      }

      storedDocuments.push({
        id: randomUUID(),
        fileName: normalized.fileName,
        displayName: normalized.displayName,
        fileType: normalized.fileType,
        fileUrl: normalized.fileUrl,
        sourceKind: normalized.sourceKind,
        sourceUrl: normalized.sourceUrl,
        sourceOrder: normalized.sourceOrder,
        extractedText: normalized.extractedText,
        extractionStatus: normalized.extractionStatus,
        extractionError: null,
        fileSize: normalized.fileSize,
      });
    }

    const readableResult = extractReadableEvidence(
      storedDocuments.map((document) => ({
        sourceName: document.displayName,
        sourceOrder: document.sourceOrder,
        extractionStatus: document.extractionStatus,
        extractionError: document.extractionError,
        extractedText: document.extractedText,
      })),
    );
    const sourceBlockResult = buildEvidenceSourceBlocks(
      readableResult.readableEvidence,
    );
    const analysisNotes = [
      ...deterministicNotes,
      ...readableResult.extractionNotes,
      ...sourceBlockResult.extractionNotes,
    ];
    const evidenceSummary =
      storedDocuments.length === 1
        ? storedDocuments[0]?.displayName
        : `${storedDocuments.length} source items`;

    let extractedGrant: ExtractedGrant;
    let status: "analyzed" | "failed" = "analyzed";
    let errorMessage: string | null = null;
    let openAiKey: Awaited<ReturnType<typeof resolveOpenAiApiKeyForUser>> | null =
      null;

    if (!sourceBlockResult.promptText) {
      status = "failed";
      errorMessage = "Extraction Failed: Document unreadable or unsupported.";
      extractedGrant = failureExtractionSnapshot({
        grantName: validation.normalizedName,
        notes: analysisNotes.length > 0 ? analysisNotes : [errorMessage],
      });
    } else {
      try {
        openAiKey = await resolveOpenAiApiKeyForUser(user.id);
        const openAiExtraction = await extractGroupedGrantRequirements({
          apiKey: openAiKey.apiKey,
          opportunityName: validation.normalizedName,
          sourceBlocks: sourceBlockResult.promptText,
          extractionNotes: analysisNotes,
        });
        extractedGrant = mergeExtractionNotes(openAiExtraction, analysisNotes);
      } catch (error) {
        status = "failed";
        errorMessage =
          openAiKey
            ? extractionErrorMessageForOpenAiKey({
                error,
                keySource: openAiKey.source,
                keyLabel: openAiKey.keyLabel,
              })
            : null;
        errorMessage ??= "Extraction Failed: Document unreadable or unsupported.";
        extractedGrant = failureExtractionSnapshot({
          grantName: validation.normalizedName,
          notes: [
            ...analysisNotes,
            error instanceof Error ? error.message : errorMessage,
          ],
        });
      }
    }

    const matchProfile = toMatchProfile(profile);
    const matchResult =
      status === "analyzed"
        ? matchGrantToProfile(matchProfile, extractedGrant)
        : null;
    const title =
      status === "analyzed"
        ? extractedGrant.metadata.grantTitle || validation.normalizedName
        : validation.normalizedName;
    const funder =
      status === "analyzed" && extractedGrant.metadata.funderName
        ? extractedGrant.metadata.funderName
        : null;
    const deadline =
      status === "analyzed"
        ? parseGrantDeadline(extractedGrant.metadata.deadline)
        : null;
    const inputSummary = {
      evidenceCount: storedDocuments.length,
      includedSources: sourceBlockResult.includedSources,
      failedEvidence: readableResult.failedEvidence,
      wasTruncated: sourceBlockResult.wasTruncated,
      notes: analysisNotes,
    };

    try {
      await prisma.$transaction(async (transaction) => {
        await transaction.grant.create({
          data: {
            id: grantId,
            userId: user.id,
            title,
            funder,
            sourceFileName: evidenceSummary,
            fileType: "grouped",
            deadline,
            processingStatus: status,
            analysisVersion: 1,
            lastAnalyzedAt: new Date(),
            uploadedDocuments: {
              create: storedDocuments.map((document) => ({
                id: document.id,
                fileName: document.fileName,
                displayName: document.displayName,
                fileType: document.fileType,
                fileUrl: document.fileUrl,
                sourceKind: document.sourceKind,
                sourceUrl: document.sourceUrl,
                sourceOrder: document.sourceOrder,
                extractedText: document.extractedText,
                extractionStatus: document.extractionStatus,
                extractionError: document.extractionError,
                fileSize: document.fileSize,
                isActive: true,
              })),
            },
          },
        });

        await transaction.extractionResult.create({
          data: {
            grantId,
            status: status === "analyzed" ? "completed" : "failed",
            extractedJson: extractedGrant,
            errorMessage,
          },
        });

        await transaction.extractionRevision.create({
          data: {
            grantId,
            revision: 1,
            reason: "initial_analysis",
            extractedJson: extractedGrant,
            inputSummary,
          },
        });

        if (matchResult) {
          await transaction.matchResult.create({
            data: {
              grantId,
              matchLabel: matchResult.matchLabel,
              score: matchResult.score,
              primaryReason: matchResult.primaryReason,
              hardNoReasons: matchResult.hardNoReasons,
              needsReviewItems: matchResult.needsReviewItems,
              passedItems: matchResult.passedItems,
            },
          });
        }
      });
    } catch (error) {
      await cleanupStoredFiles(supabase, uploadedPaths);
      console.error("Grouped intake database transaction failed", error);
      return NextResponse.json(
        { error: "Unable to save the grant opportunity." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        grantId,
        status,
        title,
        matchLabel: matchResult?.matchLabel ?? null,
        failedEvidence: readableResult.failedEvidence,
      },
      { status: 201 },
    );
  } catch (error) {
    await cleanupStoredFiles(supabase, uploadedPaths);

    return NextResponse.json(
      {
        error: apiErrorMessage(error),
      },
      { status: 500 },
    );
  }
}
