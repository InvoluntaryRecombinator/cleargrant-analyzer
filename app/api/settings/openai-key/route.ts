import { NextResponse } from "next/server";

import { ensureAppUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { encryptApiKey } from "@/utils/encryption";

export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function rawApiKeyFromBody(value: unknown) {
  if (!isRecord(value) || typeof value.apiKey !== "string") {
    return null;
  }

  const apiKey = value.apiKey.trim();
  return apiKey.length > 0 ? apiKey : null;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const apiKey = rawApiKeyFromBody(body);

  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key is required." },
      { status: 400 },
    );
  }

  await ensureAppUser(user);

  const encrypted = encryptApiKey(apiKey);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      encryptedOpenAiKey: encrypted.encryptedText,
      openAiKeyIv: encrypted.iv,
    },
  });

  return NextResponse.json({ hasCustomKey: true });
}
