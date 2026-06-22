function fallbackFormat(fileType: string | null | undefined) {
  const normalized = fileType?.trim().toLowerCase();

  if (!normalized) {
    return "Unknown_Format";
  }

  if (normalized === "text/plain" || normalized === "uploaded_txt") {
    return "TXT";
  }

  return normalized.toUpperCase();
}

export function generateDocumentTitle(
  customName: string | null,
  fileType: string | null | undefined,
  index: number,
) {
  const safeIndex = Math.abs(index);

  if (customName) {
    return customName;
  }

  if (fileType === "txt") {
    return `Pasted_Text_${safeIndex}`;
  }

  return `Uploaded_${fallbackFormat(fileType)}_${safeIndex}`;
}
