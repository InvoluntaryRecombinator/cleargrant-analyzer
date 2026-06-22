const missingDeadlineValues = new Set([
  "n/a",
  "na",
  "none",
  "not applicable",
  "not stated",
  "rolling",
  "rolling deadline",
  "tbd",
  "to be determined",
]);

const monthNumbers: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

const monthNamePattern =
  /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,)?\s+(\d{4})\b/i;
const isoDatePattern = /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/;
const slashDatePattern = /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/;

function calendarDate(year: number, monthIndex: number, day: number) {
  const date = new Date(Date.UTC(year, monthIndex, day, 12, 0, 0));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== monthIndex ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

export function parseGrantDeadline(value: string | null | undefined) {
  const normalized = value?.trim();

  if (!normalized || missingDeadlineValues.has(normalized.toLowerCase())) {
    return null;
  }

  const monthMatch = normalized.match(monthNamePattern);

  if (monthMatch) {
    const month = monthNumbers[monthMatch[1].replace(".", "").toLowerCase()];
    const day = Number.parseInt(monthMatch[2], 10);
    const year = Number.parseInt(monthMatch[3], 10);

    if (month !== undefined) {
      return calendarDate(year, month, day);
    }
  }

  const isoMatch = normalized.match(isoDatePattern);

  if (isoMatch) {
    const year = Number.parseInt(isoMatch[1], 10);
    const month = Number.parseInt(isoMatch[2], 10) - 1;
    const day = Number.parseInt(isoMatch[3], 10);

    return calendarDate(year, month, day);
  }

  const slashMatch = normalized.match(slashDatePattern);

  if (slashMatch) {
    const month = Number.parseInt(slashMatch[1], 10) - 1;
    const day = Number.parseInt(slashMatch[2], 10);
    const year = Number.parseInt(slashMatch[3], 10);

    return calendarDate(year, month, day);
  }

  return null;
}

export function formatGrantDeadlineLabel(
  date: Date | null,
  rawValue?: string | null,
) {
  if (date) {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  }

  const rawDeadline = rawValue?.trim();
  return rawDeadline || "Not stated";
}
