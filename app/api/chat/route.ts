import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function stringContext(value: unknown) {
  if (typeof value === "string") {
    return value.slice(0, 30_000);
  }

  return JSON.stringify(value ?? {}, null, 2).slice(0, 30_000);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    messages?: UIMessage[];
    grantContext?: unknown;
  } | null;

  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const grantContext = stringContext(body?.grantContext);

  const result = streamText({
    model: openai(process.env.OPENAI_MODEL ?? "gpt-4o-mini"),
    system: `You are a Grant Analysis Assistant. Use this context to answer the user: ${grantContext}. Format your responses cleanly using Markdown. Use short paragraphs, bullet points for lists, and bold text for emphasis. Do NOT output massive walls of text.`,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
