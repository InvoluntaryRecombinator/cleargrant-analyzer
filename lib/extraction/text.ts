import "server-only";

import mammoth from "mammoth";
import PDFParser from "pdf2json";

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
  return new Promise<string>((resolve, reject) => {
    const parser = new PDFParser(null, true);
    let settled = false;

    const finish = (callback: () => void) => {
      if (settled) {
        return;
      }

      settled = true;
      callback();
      parser.destroy();
    };

    parser.on("pdfParser_dataError", () => {
      finish(() => reject(new Error("Document unreadable. PDF text could not be extracted.")));
    });

    parser.on("pdfParser_dataReady", () => {
      finish(() => resolve(parser.getRawTextContent()));
    });

    try {
      parser.parseBuffer(buffer, 0);
    } catch {
      finish(() => reject(new Error("Document unreadable. PDF text could not be extracted.")));
    }
  });
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
