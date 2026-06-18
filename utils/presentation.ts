export function matchStatusClassName(label: string | null | undefined) {
  switch (label) {
    case "High Match":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "Medium Match":
      return "border-sky-200 bg-sky-50 text-sky-900";
    case "Low Match":
      return "border-rose-200 bg-rose-50 text-rose-800";
    case "Needs Review":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "Extraction Failed":
      return "border-rose-200 bg-rose-50 text-rose-800";
    default:
      return "border-stone-200 bg-stone-50 text-slate-700";
  }
}

export function readableGrantStatus(
  processingStatus: string | null | undefined,
  matchLabel: string | null | undefined,
) {
  if (processingStatus === "failed") {
    return "Extraction Failed";
  }

  if (matchLabel) {
    return matchLabel;
  }

  if (processingStatus === "processing") {
    return "Processing";
  }

  return "Uploaded";
}
