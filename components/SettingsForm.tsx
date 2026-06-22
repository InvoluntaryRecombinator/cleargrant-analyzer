"use client";

import type { FormEvent } from "react";
import { useState } from "react";

type SaveState = "idle" | "saving" | "saved" | "error";

type KeyStatus = {
  hasCustomKey: boolean;
  keyLabel: string | null;
  keyUpdatedAt: string | null;
};

type SettingsFormProps = {
  initialStatus: KeyStatus;
};

function formatUpdatedAt(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function SettingsForm({ initialStatus }: SettingsFormProps) {
  const [apiKey, setApiKey] = useState("");
  const [label, setLabel] = useState(initialStatus.keyLabel ?? "");
  const [keyStatus, setKeyStatus] = useState(initialStatus);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");
  const updatedAtLabel = formatUpdatedAt(keyStatus.keyUpdatedAt);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
        body: JSON.stringify({
          apiKey: trimmedApiKey,
          label: label.trim(),
        }),
      });
      const result = (await response.json().catch(() => null)) as
        | (Partial<KeyStatus> & { error?: string })
        | null;

      if (!response.ok || !result?.hasCustomKey) {
        throw new Error(result?.error ?? "Unable to save the key.");
      }

      const savedLabel = (result.keyLabel ?? label.trim()) || "OpenAI API key";

      setApiKey("");
      setLabel(savedLabel);
      setKeyStatus({
        hasCustomKey: true,
        keyLabel: savedLabel,
        keyUpdatedAt: result.keyUpdatedAt ?? new Date().toISOString(),
      });
      setSaveState("saved");
      setMessage("Key securely saved");
    } catch (error) {
      setSaveState("error");
      setMessage(
        error instanceof Error ? error.message : "Unable to save the key.",
      );
    }
  }

  async function handleDelete() {
    setSaveState("saving");
    setMessage("");

    try {
      const response = await fetch("/api/settings/openai-key", {
        method: "DELETE",
      });
      const result = (await response.json().catch(() => null)) as
        | (Partial<KeyStatus> & { error?: string })
        | null;

      if (!response.ok || result?.hasCustomKey) {
        throw new Error(result?.error ?? "Unable to remove the key.");
      }

      setApiKey("");
      setLabel("");
      setKeyStatus({
        hasCustomKey: false,
        keyLabel: null,
        keyUpdatedAt: null,
      });
      setSaveState("saved");
      setMessage("Key removed. The analyzer will use the platform key.");
    } catch (error) {
      setSaveState("error");
      setMessage(
        error instanceof Error ? error.message : "Unable to remove the key.",
      );
    }
  }

  return (
    <div className="grid gap-5">
      <div className="rounded-md border border-stone-200 bg-slate-50 px-4 py-3">
        <p className="text-sm font-semibold text-slate-950">
          {keyStatus.hasCustomKey
            ? `Custom key configured: ${keyStatus.keyLabel}`
            : "No custom key configured"}
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          {keyStatus.hasCustomKey
            ? `The saved key is encrypted and cannot be viewed here.${
                updatedAtLabel ? ` Last updated ${updatedAtLabel}.` : ""
              }`
            : "The analyzer will use the platform key until you save a custom key."}
        </p>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="form-label" htmlFor="openAiKeyLabel">
            Key name
          </label>
          <input
            autoComplete="off"
            className="form-input"
            id="openAiKeyLabel"
            name="openAiKeyLabel"
            onChange={(event) => {
              setLabel(event.target.value);
              if (saveState !== "saving") {
                setSaveState("idle");
                setMessage("");
              }
            }}
            placeholder="Organization OpenAI key"
            type="text"
            value={label}
          />
        </div>

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

      {keyStatus.hasCustomKey ? (
        <div className="border-t border-stone-200 pt-4">
          <button
            className="inline-flex min-h-9 items-center justify-center rounded-md border border-rose-200 bg-white px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
            disabled={saveState === "saving"}
            onClick={handleDelete}
            type="button"
          >
            Remove Key
          </button>
        </div>
      ) : null}
    </div>
  );
}
