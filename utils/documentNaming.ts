export function generateDocumentTitle(
  customName: string | null,
  fileType: string,
  index: number,
) {
  if (customName) {
    return customName;
  }

  if (fileType === "txt") {
    return `Pasted_Text_${index}`;
  }

  return `Uploaded_${fileType.toUpperCase()}_${index}`;
}
