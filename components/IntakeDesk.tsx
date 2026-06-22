"use client";

import {
  Clipboard,
  FileText,
  Loader2,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type FileSourceItem = {
  id: string;
  kind: "file";
  file: File;
  displayName: string;
};

type TextSourceItem = {
  id: string;
  kind: "text";
  text: string;
  displayName: string;
  sourceUrl: string;
};

type SourceItem = FileSourceItem | TextSourceItem;

const acceptedExtensions = [".pdf", ".docx", ".txt"];
const maxFiles = 10;
const maxFileBytes = 20 * 1024 * 1024;
const maxPastedSnippets = 10;
const maxPastedChars = 40_000;
const panelClass =
  "overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm";
const panelHeaderClass =
  "flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3";
const eyebrowClass =
  "text-xs font-bold uppercase tracking-normal text-slate-500";
const headingClass = "text-base font-semibold text-slate-950";
const labelClass = "block text-sm font-semibold leading-5 text-slate-700";
const inputClass =
  "w-full max-w-lg rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15";
const textareaClass =
  "w-full max-w-2xl rounded-md border border-gray-300 bg-white px-3 py-2 text-sm leading-6 text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15";
const secondaryButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";
const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-teal-700 bg-teal-700 px-5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60";

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function isAcceptedFile(file: File) {
  const lowerName = file.name.toLowerCase();
  return acceptedExtensions.some((extension) => lowerName.endsWith(extension));
}

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function wordCount(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

export function IntakeDesk() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [grantName, setGrantName] = useState("");
  const [sourceItems, setSourceItems] = useState<SourceItem[]>([]);
  const [pastedText, setPastedText] = useState("");
  const [pastedSourceUrl, setPastedSourceUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fileCount = sourceItems.filter((item) => item.kind === "file").length;
  const textCount = sourceItems.filter((item) => item.kind === "text").length;
  const canAnalyze = grantName.trim().length > 0 && sourceItems.length > 0 && !isSubmitting;

  function addFiles(nextFiles: FileList | File[]) {
    setMessage(null);

    const accepted: FileSourceItem[] = [];
    const rejected: string[] = [];
    let nextFileCount = fileCount;

    for (const file of Array.from(nextFiles)) {
      if (!isAcceptedFile(file)) {
        rejected.push(`${file.name} is not a supported file type.`);
        continue;
      }

      if (file.size > maxFileBytes) {
        rejected.push(`${file.name} is larger than 20MB.`);
        continue;
      }

      if (nextFileCount >= maxFiles) {
        rejected.push("Only 10 files can be added.");
        break;
      }

      accepted.push({
        id: createId(),
        kind: "file",
        file,
        displayName: file.name,
      });
      nextFileCount += 1;
    }

    if (accepted.length > 0) {
      setSourceItems((current) => [...current, ...accepted]);
    }

    if (rejected.length > 0) {
      setMessage(rejected.join(" "));
    }
  }

  function addPastedText() {
    const trimmedText = pastedText.trim();

    if (!trimmedText) {
      setMessage("Paste source text before adding it.");
      return;
    }

    if (trimmedText.length > maxPastedChars) {
      setMessage("Source text snippets must be 40,000 characters or fewer.");
      return;
    }

    if (textCount >= maxPastedSnippets) {
      setMessage("Only 10 source text snippets can be added.");
      return;
    }

    setSourceItems((current) => [
      ...current,
      {
        id: createId(),
        kind: "text",
        text: trimmedText,
        displayName: `Source Text Snippet ${textCount + 1}`,
        sourceUrl: pastedSourceUrl.trim(),
      },
    ]);
    setPastedText("");
    setPastedSourceUrl("");
    setMessage(null);
  }

  function updateDisplayName(itemId: string, displayName: string) {
    setSourceItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              displayName,
            }
          : item,
      ),
    );
  }

  function updateSourceUrl(itemId: string, sourceUrl: string) {
    setSourceItems((current) =>
      current.map((item) =>
        item.id === itemId && item.kind === "text"
          ? {
              ...item,
              sourceUrl,
            }
          : item,
      ),
    );
  }

  function removeItem(itemId: string) {
    setSourceItems((current) => current.filter((item) => item.id !== itemId));
  }

  async function analyzeOpportunity() {
    if (!canAnalyze) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("grantName", grantName.trim());

    sourceItems.forEach((item, sourceOrder) => {
      if (item.kind === "file") {
        formData.append("files", item.file);
        formData.append("fileDisplayNames", item.displayName.trim() || item.file.name);
        formData.append("fileSourceOrders", String(sourceOrder));
      } else {
        formData.append("pastedTexts", item.text);
        formData.append(
          "pastedDisplayNames",
          item.displayName.trim() || "Source Text Snippet",
        );
        formData.append("pastedSourceUrls", item.sourceUrl.trim());
        formData.append("pastedSourceOrders", String(sourceOrder));
      }
    });

    try {
      const response = await fetch("/api/intake/grants", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        grantId?: string;
        error?: string;
        errors?: string[];
      };

      if (!response.ok || !payload.grantId) {
        throw new Error(
          payload.errors?.join(" ") ??
            payload.error ??
            "Unable to analyze the opportunity.",
        );
      }

      router.push(`/grants/${payload.grantId}`);
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to analyze the opportunity.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className={panelClass}>
        <div className={panelHeaderClass}>
          <div>
            <p className={eyebrowClass}>New opportunity</p>
            <h2 className={headingClass}>Name this grant</h2>
          </div>
          <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold uppercase text-teal-900">
            Create only
          </span>
        </div>
        <div className="p-5">
          <label className={labelClass} htmlFor="grantName">
            Grant opportunity name
          </label>
          <input
            id="grantName"
            className={`${inputClass} mt-2`}
            value={grantName}
            onChange={(event) => setGrantName(event.target.value)}
            placeholder="California Dream Fund"
            type="text"
          />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className={panelClass}>
          <div className={panelHeaderClass}>
            <div>
              <p className={eyebrowClass}>Add sources</p>
              <h2 className={headingClass}>Upload files</h2>
            </div>
            <p className="text-xs font-semibold text-slate-500">
              {fileCount}/{maxFiles} files
            </p>
          </div>
          <div className="p-5">
            <input
              ref={inputRef}
              className="hidden"
              multiple
              accept=".pdf,.docx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              type="file"
              onChange={(event) => {
                if (event.currentTarget.files) {
                  addFiles(event.currentTarget.files);
                }
                event.currentTarget.value = "";
              }}
            />
            <button
              className={`flex min-h-64 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center transition focus:outline-none focus:ring-4 focus:ring-teal-600/15 ${
                isDragging
                  ? "border-teal-600 bg-slate-50 shadow-sm"
                  : "border-slate-300 bg-white hover:border-teal-600 hover:bg-slate-50"
              }`}
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                addFiles(event.dataTransfer.files);
              }}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-teal-200 bg-teal-50 text-teal-800">
                <UploadCloud aria-hidden size={22} />
              </span>
              <span>
                <span className="block text-base font-semibold text-slate-950">
                  Add PDF, DOCX, or TXT files
                </span>
                <span className="mt-1 block text-sm text-slate-500">
                  Source documents are saved privately.
                </span>
              </span>
            </button>
          </div>
        </div>

        <div className={panelClass}>
          <div className={panelHeaderClass}>
            <div>
              <p className={eyebrowClass}>Add sources</p>
              <h2 className={headingClass}>Paste source text</h2>
            </div>
            <p className="text-xs font-semibold text-slate-500">
              {textCount}/{maxPastedSnippets} snippets
            </p>
          </div>
          <div className="space-y-4 p-5">
            <div>
              <label className={labelClass} htmlFor="sourceUrl">
                Optional source URL
              </label>
              <input
                id="sourceUrl"
                className={`${inputClass} mt-2`}
                value={pastedSourceUrl}
                onChange={(event) => setPastedSourceUrl(event.target.value)}
                placeholder="https://funder.org/grants/guidelines"
                type="url"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="pastedText">
                Source text
              </label>
              <textarea
                id="pastedText"
                className={`${textareaClass} mt-2 min-h-52 resize-y`}
                value={pastedText}
                onChange={(event) => setPastedText(event.target.value)}
                placeholder="Paste eligibility guidelines, FAQ copy, or notes from a funder page."
              />
              <p className="mt-2 text-xs font-medium text-slate-500">
                {pastedText.length.toLocaleString()} /{" "}
                {maxPastedChars.toLocaleString()} characters
              </p>
            </div>
            <div className="flex justify-end">
              <button
                className={secondaryButtonClass}
                type="button"
                onClick={addPastedText}
                disabled={!pastedText.trim() || pastedText.length > maxPastedChars}
              >
                <Plus aria-hidden size={16} />
                Add source text
              </button>
            </div>
          </div>
        </div>
      </section>

      {message ? (
        <p
          className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-900"
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}

      <section className={panelClass}>
        <div className={panelHeaderClass}>
          <div>
            <p className={eyebrowClass}>Sources</p>
            <h2 className={headingClass}>Sources to analyze</h2>
          </div>
          <p className="text-sm font-semibold text-slate-500">
            {sourceItems.length} item{sourceItems.length === 1 ? "" : "s"}
          </p>
        </div>

        {sourceItems.length === 0 ? (
          <div className="p-5">
            <p className="text-sm leading-6 text-slate-500">
              Add files or pasted source text before analyzing this opportunity.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-200">
            {sourceItems.map((item, index) => (
              <div
                className="grid gap-4 px-5 py-4 lg:grid-cols-[2rem_minmax(0,1fr)_minmax(220px,0.45fr)_auto]"
                key={item.id}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 bg-[#fffdf8] text-slate-500">
                  {item.kind === "file" ? (
                    <FileText aria-hidden size={17} />
                  ) : (
                    <Clipboard aria-hidden size={17} />
                  )}
                </div>
                <div className="min-w-0">
                  <label className={labelClass} htmlFor={`display-${item.id}`}>
                    Document name
                  </label>
                  <input
                    id={`display-${item.id}`}
                    className={`${inputClass} mt-2`}
                    value={item.displayName}
                    onChange={(event) =>
                      updateDisplayName(item.id, event.target.value)
                    }
                  />
                  <p className="mt-2 truncate text-xs text-slate-500">
                    Source {index + 1}:{" "}
                    {item.kind === "file"
                      ? `${item.file.name} · ${formatFileSize(item.file.size)}`
                      : `${wordCount(item.text)} words · ${item.text.length.toLocaleString()} characters`}
                  </p>
                </div>
                <div className="min-w-0">
                  {item.kind === "text" ? (
                    <>
                      <label
                        className={labelClass}
                        htmlFor={`source-url-${item.id}`}
                      >
                        Source URL
                      </label>
                      <input
                        id={`source-url-${item.id}`}
                        className={`${inputClass} mt-2`}
                        value={item.sourceUrl}
                        onChange={(event) =>
                          updateSourceUrl(item.id, event.target.value)
                        }
                        placeholder="Optional"
                        type="url"
                      />
                    </>
                  ) : (
                    <div className="rounded-md border border-stone-200 bg-[#fffdf8] px-3 py-2">
                      <p className="text-xs font-bold uppercase text-slate-500">
                        Saved as
                      </p>
                      <p className="mt-1 truncate text-sm text-slate-700">
                        Uploaded file
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-end justify-end">
                  <button
                    className="inline-flex min-h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.displayName}`}
                  >
                    <Trash2 aria-hidden size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end border-t border-gray-200 bg-slate-50 px-5 py-4">
          <button
            className={primaryButtonClass}
            type="button"
            disabled={!canAnalyze}
            onClick={analyzeOpportunity}
          >
            {isSubmitting ? (
              <Loader2 aria-hidden className="animate-spin" size={16} />
            ) : (
              <UploadCloud aria-hidden size={16} />
            )}
            {isSubmitting ? "Analyzing..." : "Analyze new opportunity"}
          </button>
        </div>
      </section>
    </div>
  );
}
