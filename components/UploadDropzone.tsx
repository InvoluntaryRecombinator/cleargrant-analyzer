"use client";

import { FileText, Loader2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type UploadResult = {
  grantId: string;
  fileName: string;
  status: "analyzed" | "failed";
  title?: string;
  matchLabel?: string;
  error?: string;
};

const acceptedTypes = [".pdf", ".docx", ".txt"];

function isAcceptedFile(file: File) {
  const lowerName = file.name.toLowerCase();
  return acceptedTypes.some((extension) => lowerName.endsWith(extension));
}

export function UploadDropzone() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [results, setResults] = useState<UploadResult[]>([]);

  function addFiles(nextFiles: FileList | File[]) {
    setMessage(null);
    setResults([]);

    const accepted = Array.from(nextFiles).filter(isAcceptedFile);
    const combined = [...files, ...accepted].slice(0, 10);

    if (accepted.length !== nextFiles.length) {
      setMessage("Only PDF, DOCX, and TXT files can be analyzed.");
    }

    if (files.length + accepted.length > 10) {
      setMessage("Only the first 10 supported files were added.");
    }

    setFiles(combined);
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  async function analyzeFiles() {
    if (files.length === 0) {
      setMessage("Add at least one file before analyzing.");
      return;
    }

    setIsUploading(true);
    setMessage(null);
    setResults([]);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        error?: string;
        results?: UploadResult[];
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to analyze files.");
      }

      const nextResults = payload.results ?? [];
      setResults(nextResults);
      setFiles([]);

      if (nextResults.some((result) => result.status === "analyzed")) {
        router.push("/matrix");
      } else {
        router.refresh();
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to analyze files.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-5">
      <input
        ref={inputRef}
        className="hidden"
        multiple
        accept=".pdf,.docx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        type="file"
        onChange={(event) => {
          if (event.target.files) {
            addFiles(event.target.files);
          }
        }}
      />

      <button
        className={`flex min-h-64 w-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed px-6 text-center transition ${
          isDragging
            ? "border-slate-600 bg-stone-100"
            : "border-stone-300 bg-white hover:bg-stone-50"
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
        <span className="flex h-12 w-12 items-center justify-center rounded-md border border-stone-200 bg-stone-50 text-slate-700">
          <Upload aria-hidden size={22} />
        </span>
        <span>
          <span className="block text-base font-semibold text-slate-950">
            Drop grant documents here
          </span>
          <span className="mt-1 block text-sm text-slate-500">
            PDF, DOCX, or TXT. Up to 10 files.
          </span>
        </span>
      </button>

      {message ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {message}
        </p>
      ) : null}

      {files.length > 0 ? (
        <section className="rounded-lg border border-stone-200 bg-white">
          <div className="border-b border-stone-200 px-4 py-3">
            <h2 className="section-heading">File queue</h2>
          </div>
          <div className="divide-y divide-stone-200">
            {files.map((file, index) => (
              <div
                className="flex items-center justify-between gap-4 px-4 py-3"
                key={`${file.name}-${file.lastModified}`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <FileText className="shrink-0 text-slate-500" size={18} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-950">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  className="secondary-button !min-h-9 !px-3"
                  type="button"
                  onClick={() => removeFile(index)}
                  aria-label={`Remove ${file.name}`}
                >
                  <X aria-hidden size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="flex justify-end">
        <button
          className="primary-button"
          type="button"
          disabled={isUploading || files.length === 0}
          onClick={analyzeFiles}
        >
          {isUploading ? (
            <Loader2 aria-hidden className="animate-spin" size={16} />
          ) : (
            <Upload aria-hidden size={16} />
          )}
          {isUploading ? "Analyzing..." : "Analyze files"}
        </button>
      </div>

      {results.length > 0 ? (
        <section className="rounded-lg border border-stone-200 bg-white">
          <div className="border-b border-stone-200 px-4 py-3">
            <h2 className="section-heading">Analysis results</h2>
          </div>
          <div className="divide-y divide-stone-200">
            {results.map((result) => (
              <div className="px-4 py-3" key={result.grantId}>
                <p className="text-sm font-medium text-slate-950">
                  {result.title ?? result.fileName}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {result.status === "analyzed"
                    ? `Saved with ${result.matchLabel}.`
                    : result.error}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
