"use client";

import { useState } from "react";

type SaveState = "idle" | "saving" | "saved" | "error";

export function SettingsForm() {
  const [apiKey, setApiKey] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedApiKey = apiKey.trim();

    if (!trimmedApiKey) {
      setSaveState("error");
      setMessage("Enter an OpenAI API key.");
      return;
    }

    setSaveState("saving");
    setMessage("");

    try {
      const response = await fetch("/api/settings/openai-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey: trimmedApiKey }),
      });
      const result = (await response.json().catch(() => null)) as
        | { hasCustomKey?: boolean; error?: string }
        | null;

      if (!response.ok || !result?.hasCustomKey) {
        throw new Error(result?.error ?? "Unable to save the key.");
      }

      setApiKey("");
      setSaveState("saved");
      setMessage("Key securely saved");
    } catch (error) {
      setSaveState("error");
      setMessage(
        error instanceof Error ? error.message : "Unable to save the key.",
      );
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="form-label" htmlFor="openAiApiKey">
          API key
        </label>
        <input
          autoComplete="off"
          className="form-input"
          id="openAiApiKey"
          name="openAiApiKey"
          onChange={(event) => {
            setApiKey(event.target.value);
            if (saveState !== "saving") {
              setSaveState("idle");
              setMessage("");
            }
          }}
          placeholder="sk-proj-..."
          type="password"
          value={apiKey}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          className="primary-button"
          disabled={saveState === "saving"}
          type="submit"
        >
          {saveState === "saving" ? "Saving..." : "Save Key"}
        </button>

        {message ? (
          <p
            className={`text-sm font-semibold ${
              saveState === "saved" ? "text-teal-800" : "text-rose-700"
            }`}
            role="status"
          >
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
