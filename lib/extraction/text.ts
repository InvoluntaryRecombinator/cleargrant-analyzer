import "server-only";

import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

const maxExtractedChars = 120_000;

export type ExtractedTextResult = {
  text: string;
  fileType: "pdf" | "docx" | "txt";
};

function extensionFor(fileName: string) {
  return fileName.toLowerCase().split(".").pop() ?? "";
}

function normalizeWhitespace(text: string) {
  return text.replace(/\r/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

async function extractPdfText(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

export async function extractTextFromFile(file: File): Promise<ExtractedTextResult> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = extensionFor(file.name);
  const mimeType = file.type.toLowerCase();

  let text = "";
  let fileType: ExtractedTextResult["fileType"];

  if (extension === "txt" || mimeType.startsWith("text/")) {
    fileType = "txt";
    text = buffer.toString("utf8");
  } else if (
    extension === "docx" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    fileType = "docx";
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else if (extension === "pdf" || mimeType === "application/pdf") {
    fileType = "pdf";
    text = await extractPdfText(buffer);
  } else {
    throw new Error("Unsupported file type. Upload PDF, DOCX, or TXT files.");
  }

  const normalized = normalizeWhitespace(text).slice(0, maxExtractedChars);

  if (normalized.length < 20) {
    throw new Error("No usable text could be extracted from this document.");
  }

  return {
    text: normalized,
    fileType,
  };
}
