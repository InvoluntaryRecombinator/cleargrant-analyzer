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

type FileQueueItem = {
  id: string;
  kind: "file";
  file: File;
  displayName: string;
};

type TextQueueItem = {
  id: string;
  kind: "text";
  text: string;
  displayName: string;
  sourceUrl: string;
};

type QueueItem = FileQueueItem | TextQueueItem;

const acceptedExtensions = [".pdf", ".docx", ".txt"];
const maxFiles = 10;
const maxFileBytes = 20 * 1024 * 1024;
const maxPastedSnippets = 10;
const maxPastedChars = 40_000;

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
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [pastedText, setPastedText] = useState("");
  const [pastedSourceUrl, setPastedSourceUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fileCount = queue.filter((item) => item.kind === "file").length;
  const textCount = queue.filter((item) => item.kind === "text").length;
  const canAnalyze = grantName.trim().length > 0 && queue.length > 0 && !isSubmitting;

  function addFiles(nextFiles: FileList | File[]) {
    setMessage(null);

    const accepted: FileQueueItem[] = [];
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
        rejected.push("Only 10 files can be queued.");
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
      setQueue((current) => [...current, ...accepted]);
    }

    if (rejected.length > 0) {
      setMessage(rejected.join(" "));
    }
  }

  function addPastedText() {
    const trimmedText = pastedText.trim();

    if (!trimmedText) {
      setMessage("Paste source text before adding it to the queue.");
      return;
    }

    if (trimmedText.length > maxPastedChars) {
      setMessage("Pasted text snippets must be 40,000 characters or fewer.");
      return;
    }

    if (textCount >= maxPastedSnippets) {
      setMessage("Only 10 pasted text snippets can be queued.");
      return;
    }

    setQueue((current) => [
      ...current,
      {
        id: createId(),
        kind: "text",
        text: trimmedText,
        displayName: `Pasted Text Snippet ${textCount + 1}`,
        sourceUrl: pastedSourceUrl.trim(),
      },
    ]);
    setPastedText("");
    setPastedSourceUrl("");
    setMessage(null);
  }

  function updateDisplayName(itemId: string, displayName: string) {
    setQueue((current) =>
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
    setQueue((current) =>
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
    setQueue((current) => current.filter((item) => item.id !== itemId));
  }

  async function analyzeOpportunity() {
    if (!canAnalyze) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("grantName", grantName.trim());

    queue.forEach((item, sourceOrder) => {
      if (item.kind === "file") {
        formData.append("files", item.file);
        formData.append("fileDisplayNames", item.displayName.trim() || item.file.name);
        formData.append("fileSourceOrders", String(sourceOrder));
      } else {
        formData.append("pastedTexts", item.text);
        formData.append(
          "pastedDisplayNames",
          item.displayName.trim() || "Pasted Text Snippet",
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
      <section className="content-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">New opportunity</p>
            <h2 className="section-heading">Dossier setup</h2>
          </div>
          <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold uppercase text-teal-900">
            Create only
          </span>
        </div>
        <div className="p-5">
          <label className="form-label" htmlFor="grantName">
            Opportunity Name
          </label>
          <input
            id="grantName"
            className="form-input mt-2"
            value={grantName}
            onChange={(event) => setGrantName(event.target.value)}
            placeholder="California Dream Fund"
            type="text"
          />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="content-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">File evidence</p>
              <h2 className="section-heading">Dropzone</h2>
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
              className={`upload-dropzone min-h-72 ${
                isDragging ? "upload-dropzone-active" : "upload-dropzone-idle"
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
              <span className="upload-icon">
                <UploadCloud aria-hidden size={22} />
              </span>
              <span>
                <span className="block text-base font-semibold text-slate-950">
                  Drop PDF, DOCX, or TXT files
                </span>
                <span className="mt-1 block text-sm text-slate-500">
                  Original files are saved into the private evidence bucket.
                </span>
              </span>
            </button>
          </div>
        </div>

        <div className="content-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Pasted evidence</p>
              <h2 className="section-heading">Text shoebox</h2>
            </div>
            <p className="text-xs font-semibold text-slate-500">
              {textCount}/{maxPastedSnippets} snippets
            </p>
          </div>
          <div className="space-y-4 p-5">
            <div>
              <label className="form-label" htmlFor="sourceUrl">
                Optional source URL
              </label>
              <input
                id="sourceUrl"
                className="form-input mt-2"
                value={pastedSourceUrl}
                onChange={(event) => setPastedSourceUrl(event.target.value)}
                placeholder="https://funder.org/grants/guidelines"
                type="url"
              />
            </div>
            <div>
              <label className="form-label" htmlFor="pastedText">
                Source text
              </label>
              <textarea
                id="pastedText"
                className="form-input mt-2 min-h-52 resize-y"
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
                className="secondary-button"
                type="button"
                onClick={addPastedText}
                disabled={!pastedText.trim() || pastedText.length > maxPastedChars}
              >
                <Plus aria-hidden size={16} />
                Add Text to Queue
              </button>
            </div>
          </div>
        </div>
      </section>

      {message ? (
        <p className="notice notice-warning" aria-live="polite">
          {message}
        </p>
      ) : null}

      <section className="content-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Staging area</p>
            <h2 className="section-heading">Evidence queue</h2>
          </div>
          <p className="text-sm font-semibold text-slate-500">
            {queue.length} item{queue.length === 1 ? "" : "s"}
          </p>
        </div>

        {queue.length === 0 ? (
          <div className="empty-state">
            <p className="text-sm leading-6 text-slate-500">
              Add files or pasted source text before analyzing this opportunity.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-200">
            {queue.map((item, index) => (
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
                  <label className="form-label" htmlFor={`display-${item.id}`}>
                    Display name
                  </label>
                  <input
                    id={`display-${item.id}`}
                    className="form-input mt-2"
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
                        className="form-label"
                        htmlFor={`source-url-${item.id}`}
                      >
                        Source URL
                      </label>
                      <input
                        id={`source-url-${item.id}`}
                        className="form-input mt-2"
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
                        Stored as
                      </p>
                      <p className="mt-1 truncate text-sm text-slate-700">
                        Private file evidence
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-end justify-end">
                  <button
                    className="secondary-button !min-h-10 !px-3"
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

        <div className="form-footer">
          <button
            className="primary-button"
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
