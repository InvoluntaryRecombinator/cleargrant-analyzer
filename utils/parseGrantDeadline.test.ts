import { describe, expect, it } from "vitest";

import {
  formatGrantDeadlineLabel,
  parseGrantDeadline,
} from "./parseGrantDeadline";

describe("parseGrantDeadline", () => {
  it("parses natural-language grant deadlines with time and ET timezone text", () => {
    const result = parseGrantDeadline("July 15, 2026, at 11:59 pm ET");

    expect(result?.toISOString()).toBe("2026-07-15T12:00:00.000Z");
  });

  it("parses month-name, ISO, and slash date formats as calendar dates", () => {
    expect(parseGrantDeadline("Deadline: June 1, 2026")?.toISOString()).toBe(
      "2026-06-01T12:00:00.000Z",
    );
    expect(parseGrantDeadline("2026-07-15")?.toISOString()).toBe(
      "2026-07-15T12:00:00.000Z",
    );
    expect(parseGrantDeadline("Apply by 07/15/2026")?.toISOString()).toBe(
      "2026-07-15T12:00:00.000Z",
    );
  });

  it("returns null for absent, rolling, or invalid deadline values", () => {
    expect(parseGrantDeadline(undefined)).toBeNull();
    expect(parseGrantDeadline("")).toBeNull();
    expect(parseGrantDeadline("Rolling deadline")).toBeNull();
    expect(parseGrantDeadline("February 31, 2026")).toBeNull();
  });
});

describe("formatGrantDeadlineLabel", () => {
  it("formats parsed dates with a compact calendar label", () => {
    expect(
      formatGrantDeadlineLabel(new Date("2026-07-15T12:00:00.000Z")),
    ).toBe("Jul 15, 2026");
  });

  it("uses raw extracted metadata when no parsed database date is available", () => {
    expect(
      formatGrantDeadlineLabel(null, "July 15, 2026, at 11:59 pm ET"),
    ).toBe("July 15, 2026, at 11:59 pm ET");
  });

  it("returns a missing-value label only when both parsed and raw values are absent", () => {
    expect(formatGrantDeadlineLabel(null, " ")).toBe("Not stated");
    expect(formatGrantDeadlineLabel(null)).toBe("Not stated");
  });
});
