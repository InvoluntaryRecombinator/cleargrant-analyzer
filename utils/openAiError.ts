export type OpenAiKeySource = "custom" | "platform";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function errorStatus(error: unknown) {
  if (!isRecord(error)) {
    return null;
  }

  return typeof error.status === "number" ? error.status : null;
}

function errorCode(error: unknown) {
  if (!isRecord(error)) {
    return "";
  }

  return typeof error.code === "string" ? error.code.toLowerCase() : "";
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message.toLowerCase() : "";
}

export function isOpenAiKeyFailure(error: unknown) {
  const status = errorStatus(error);
  const code = errorCode(error);
  const message = errorMessage(error);

  return (
    status === 401 ||
    status === 403 ||
    code === "invalid_api_key" ||
    code === "insufficient_quota" ||
    message.includes("incorrect api key") ||
    message.includes("invalid api key") ||
    message.includes("insufficient quota") ||
    message.includes("billing") ||
    message.includes("quota")
  );
}

export function extractionErrorMessageForOpenAiKey({
  error,
  keySource,
  keyLabel,
}: {
  error: unknown;
  keySource: OpenAiKeySource;
  keyLabel?: string | null;
}) {
  if (keySource === "custom" && isOpenAiKeyFailure(error)) {
    const label = keyLabel ? ` "${keyLabel}"` : "";
    return `Custom OpenAI key${label} failed. Replace or remove it in Settings.`;
  }

  return null;
}
