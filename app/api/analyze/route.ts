import { NextResponse } from "next/server";

import { ensureAppUser, getProfileForUser } from "@/lib/auth";
import { extractGrantRequirements } from "@/lib/extraction/openai";
import { extractTextFromFile } from "@/lib/extraction/text";
import { resolveOpenAiApiKeyForUser } from "@/lib/openaiKeyVault";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import {
  matchGrantToProfile,
  type MatchProfile,
} from "@/utils/matchGrantToProfile";
import { extractionErrorMessageForOpenAiKey } from "@/utils/openAiError";
import { parseGrantDeadline } from "@/utils/parseGrantDeadline";

export const runtime = "nodejs";

const maxFiles = 10;
const maxFileBytes = 20 * 1024 * 1024;

function isUploadedFile(value: FormDataEntryValue): value is File {
  return value instanceof File && value.size > 0;
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

function errorMessage(
  error: unknown,
  openAiKey?: Awaited<ReturnType<typeof resolveOpenAiApiKeyForUser>>,
) {
  const keyError = openAiKey
    ? extractionErrorMessageForOpenAiKey({
        error,
        keySource: openAiKey.source,
        keyLabel: openAiKey.keyLabel,
      })
    : null;

  if (keyError) {
    return keyError;
  }

  const message = error instanceof Error ? error.message : "";

  if (message.includes("20 MB limit")) {
    return "File is larger than the 20 MB limit.";
  }

  if (message.includes("Unsupported file type")) {
    return "Unsupported file type. Upload PDF, DOCX, or TXT files.";
  }

  return "Extraction Failed: Document unreadable or unsupported.";
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
  const files = formData.getAll("files").filter(isUploadedFile);

  if (files.length === 0) {
    return NextResponse.json(
      { error: "Upload at least one PDF, DOCX, or TXT file." },
      { status: 400 },
    );
  }

  if (files.length > maxFiles) {
    return NextResponse.json(
      { error: `Upload ${maxFiles} files or fewer at a time.` },
      { status: 400 },
    );
  }

  const results = [];
  const matchProfile = toMatchProfile(profile);
  const openAiKey = await resolveOpenAiApiKeyForUser(user.id);

  for (const file of files) {
    const grant = await prisma.grant.create({
      data: {
        userId: user.id,
        sourceFileName: file.name,
        fileType: file.type || null,
        processingStatus: "processing",
      },
    });

    try {
      if (file.size > maxFileBytes) {
        throw new Error("File is larger than the 20 MB limit.");
      }

      const extractedText = await extractTextFromFile(file);

      await prisma.uploadedDocument.create({
        data: {
          grantId: grant.id,
          fileName: file.name,
          fileType: extractedText.fileType,
          extractedText: extractedText.text,
        },
      });

      const extractedGrant = await extractGrantRequirements({
        apiKey: openAiKey.apiKey,
        fileName: file.name,
        text: extractedText.text,
      });
      const matchResult = matchGrantToProfile(matchProfile, extractedGrant);
      const title = extractedGrant.metadata.grantTitle || file.name;
      const funder = extractedGrant.metadata.funderName || null;
      const deadline = parseGrantDeadline(extractedGrant.metadata.deadline);

      await prisma.$transaction([
        prisma.extractionResult.create({
          data: {
            grantId: grant.id,
            status: "completed",
            extractedJson: extractedGrant,
          },
        }),
        prisma.matchResult.create({
          data: {
            grantId: grant.id,
            matchLabel: matchResult.matchLabel,
            score: matchResult.score,
            primaryReason: matchResult.primaryReason,
            hardNoReasons: matchResult.hardNoReasons,
            needsReviewItems: matchResult.needsReviewItems,
            passedItems: matchResult.passedItems,
          },
        }),
        prisma.grant.update({
          where: {
            id: grant.id,
          },
          data: {
            title,
            funder,
            deadline,
            fileType: extractedText.fileType,
            processingStatus: "analyzed",
          },
        }),
      ]);

      results.push({
        grantId: grant.id,
        fileName: file.name,
        status: "analyzed",
        title,
        matchLabel: matchResult.matchLabel,
      });
    } catch (error) {
      const message = errorMessage(error, openAiKey);

      await prisma.$transaction([
        prisma.extractionResult.create({
          data: {
            grantId: grant.id,
            status: "failed",
            errorMessage: message,
          },
        }),
        prisma.grant.update({
          where: {
            id: grant.id,
          },
          data: {
            processingStatus: "failed",
          },
        }),
      ]);

      results.push({
        grantId: grant.id,
        fileName: file.name,
        status: "failed",
        error: message,
      });
    }
  }

  return NextResponse.json({ results });
}
