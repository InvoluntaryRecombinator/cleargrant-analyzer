"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Loader2, Send, X } from "lucide-react";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";

export type GrantChatbotGrant = {
  title: string;
  funder: string | null;
  matchLabel: string;
  primaryReason: string | null;
  extractedRequirements?: unknown;
  content?: unknown;
  sourceDocuments: Array<{
    displayName: string | null;
    fileName: string;
    sourceKind: string;
    extractionStatus: string;
  }>;
};

type GrantChatbotProps = {
  grant: GrantChatbotGrant;
  onClose: () => void;
};

function messageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function GrantChatbot({ grant, onClose }: GrantChatbotProps) {
  const [input, setInput] = useState("");
  const grantContext = useMemo(
    () =>
      JSON.stringify(
        grant.extractedRequirements ?? grant.content ?? grant,
        null,
        2,
      ),
    [grant],
  );
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: {
          grantContext,
        },
      }),
    [grantContext],
  );
  const { messages, sendMessage, status, error } = useChat({ transport });
  const isBusy = status === "submitted" || status === "streaming";

  async function submitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = input.trim();

    if (!trimmed || isBusy) {
      return;
    }

    setInput("");
    await sendMessage({ text: trimmed });
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex h-[650px] max-h-[90vh] w-[500px] max-w-[90vw] resize flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between gap-3 border-b border-stone-200 bg-slate-100 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-950">
            Grant AI assistant
          </p>
          <p className="truncate text-xs text-slate-500">{grant.title}</p>
        </div>
        <button
          aria-label="Close chat"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-stone-300 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden size={16} />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
        {messages.length === 0 ? (
          <div className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm leading-6 text-slate-600">
            Ask about eligibility requirements, source quotes, deadlines, or
            the current match label.
          </div>
        ) : null}

        {messages.map((message) => {
          const text = messageText(message);

          if (!text) {
            return null;
          }

          const isUser = message.role === "user";

          return (
            <div
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              key={message.id}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-6 ${
                  isUser
                    ? "bg-teal-700 text-white"
                    : "border border-stone-200 bg-white text-slate-700"
                }`}
              >
                <div className="space-y-3 text-sm [&>h3]:mt-4 [&>h3]:font-semibold [&>p]:mb-3 [&>strong]:font-bold [&>ul]:list-disc [&>ul]:pl-5">
                  <ReactMarkdown>{text}</ReactMarkdown>
                </div>
              </div>
            </div>
          );
        })}

        {isBusy ? (
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Loader2 aria-hidden className="animate-spin" size={14} />
            Thinking
          </div>
        ) : null}

        {error ? (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-900">
            The assistant could not respond. Try again.
          </p>
        ) : null}
      </div>

      <form
        className="flex items-center gap-2 border-t border-stone-200 bg-white p-3"
        onSubmit={submitMessage}
      >
        <input
          className="min-h-10 flex-1 rounded-md border border-stone-300 px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about this opportunity"
          value={input}
        />
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-teal-700 bg-teal-700 px-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!input.trim() || isBusy}
          type="submit"
        >
          <Send aria-hidden size={16} />
        </button>
      </form>
    </div>
  );
}
