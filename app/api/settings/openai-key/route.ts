import { NextResponse } from "next/server";

import { ensureAppUser } from "@/lib/auth";
import {
  deleteOpenAiApiKey,
  getOpenAiKeyStatus,
  saveOpenAiApiKey,
} from "@/lib/openaiKeyVault";
import { createClient } from "@/lib/supabase/server";

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

function rawLabelFromBody(value: unknown) {
  if (!isRecord(value) || typeof value.label !== "string") {
    return null;
  }

  const label = value.label.trim();
  return label.length > 0 ? label : null;
}

async function requireAuthenticatedAppUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  await ensureAppUser(user);

  return user;
}

export async function GET() {
  const user = await requireAuthenticatedAppUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await getOpenAiKeyStatus(user.id));
}

export async function POST(request: Request) {
  const user = await requireAuthenticatedAppUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const apiKey = rawApiKeyFromBody(body);
  const label = rawLabelFromBody(body);

  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key is required." },
      { status: 400 },
    );
  }

  const status = await saveOpenAiApiKey({
    userId: user.id,
    apiKey,
    label,
  });

  return NextResponse.json(status);
}

export async function DELETE() {
  const user = await requireAuthenticatedAppUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await deleteOpenAiApiKey(user.id));
}
