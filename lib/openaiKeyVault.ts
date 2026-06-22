import "server-only";

import { getRequiredEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { decryptApiKey, encryptApiKey } from "@/utils/encryption";

export type OpenAiKeyStatus = {
  hasCustomKey: boolean;
  keyLabel: string | null;
  keyUpdatedAt: string | null;
};

export type OpenAiKeyResolution = {
  apiKey: string;
  source: "custom" | "platform";
  keyLabel: string | null;
};

function normalizeLabel(label: string | null | undefined) {
  const trimmed = label?.trim();
  return trimmed || "OpenAI API key";
}

function statusFromUser(user: {
  encryptedOpenAiKey: string | null;
  openAiKeyIv: string | null;
  openAiKeyLabel: string | null;
  openAiKeyUpdatedAt: Date | null;
}): OpenAiKeyStatus {
  const hasCustomKey = Boolean(user.encryptedOpenAiKey && user.openAiKeyIv);

  return {
    hasCustomKey,
    keyLabel: hasCustomKey ? normalizeLabel(user.openAiKeyLabel) : null,
    keyUpdatedAt:
      hasCustomKey && user.openAiKeyUpdatedAt
        ? user.openAiKeyUpdatedAt.toISOString()
        : null,
  };
}

export async function getOpenAiKeyStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      encryptedOpenAiKey: true,
      openAiKeyIv: true,
      openAiKeyLabel: true,
      openAiKeyUpdatedAt: true,
    },
  });

  if (!user) {
    return {
      hasCustomKey: false,
      keyLabel: null,
      keyUpdatedAt: null,
    };
  }

  return statusFromUser(user);
}

export async function saveOpenAiApiKey({
  userId,
  apiKey,
  label,
}: {
  userId: string;
  apiKey: string;
  label?: string | null;
}) {
  const encrypted = encryptApiKey(apiKey);
  const keyLabel = normalizeLabel(label);
  const updatedAt = new Date();

  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      encryptedOpenAiKey: encrypted.encryptedText,
      openAiKeyIv: encrypted.iv,
      openAiKeyLabel: keyLabel,
      openAiKeyUpdatedAt: updatedAt,
    },
    select: {
      encryptedOpenAiKey: true,
      openAiKeyIv: true,
      openAiKeyLabel: true,
      openAiKeyUpdatedAt: true,
    },
  });

  return statusFromUser(user);
}

export async function deleteOpenAiApiKey(userId: string) {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      encryptedOpenAiKey: null,
      openAiKeyIv: null,
      openAiKeyLabel: null,
      openAiKeyUpdatedAt: null,
    },
  });

  return {
    hasCustomKey: false,
    keyLabel: null,
    keyUpdatedAt: null,
  };
}

export async function resolveOpenAiApiKeyForUser(
  userId: string,
): Promise<OpenAiKeyResolution> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      encryptedOpenAiKey: true,
      openAiKeyIv: true,
      openAiKeyLabel: true,
    },
  });

  if (user?.encryptedOpenAiKey && user.openAiKeyIv) {
    return {
      apiKey: decryptApiKey(user.encryptedOpenAiKey, user.openAiKeyIv),
      source: "custom",
      keyLabel: normalizeLabel(user.openAiKeyLabel),
    };
  }

  return {
    apiKey: getRequiredEnv("OPENAI_API_KEY"),
    source: "platform",
    keyLabel: null,
  };
}
