"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  GrantChatbot,
  type GrantChatbotGrant,
} from "@/components/GrantChatbot";

type GrantDetailHeaderActionsProps = {
  grant: GrantChatbotGrant;
};

export function GrantDetailHeaderActions({
  grant,
}: GrantDetailHeaderActionsProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="flex shrink-0 flex-col items-end">
      <Link
        className="inline-flex items-center justify-center rounded-md border border-teal-700 bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
        href="/matrix"
      >
        Back to comparison matrix
      </Link>
      <button
        className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-800"
        onClick={() => setIsChatOpen(true)}
        type="button"
      >
        <Sparkles className="h-4 w-4" />
        Chat with AI about this opportunity
      </button>

      {isChatOpen ? (
        <GrantChatbot grant={grant} onClose={() => setIsChatOpen(false)} />
      ) : null}
    </div>
  );
}
