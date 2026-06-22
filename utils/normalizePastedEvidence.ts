export function normalizePastedEvidence() {
  return {
    sourceKind: "pasted_text",
    fileName: "",
    displayName: "",
    fileType: "text/plain",
    fileUrl: null,
    sourceUrl: null,
    sourceOrder: 0,
    extractedText: "",
    extractionStatus: "completed",
    fileSize: 0,
    wasTruncated: false,
  };
}
