import { describe, expect, it } from "vitest";

import { validateIntakeQueue } from "./intakeValidation";

describe("validateIntakeQueue", () => {
  it("passes when the opportunity has a name and at least one evidence item", () => {
    expect(validateIntakeQueue("CA Tech Grant", [{ id: "source-1" }])).toEqual({
      isValid: true,
    });
  });

  it("fails when the opportunity name is empty or whitespace", () => {
    expect(validateIntakeQueue("", [{ id: "source-1" }])).toEqual({
      isValid: false,
      error: "Name the grant opportunity before analyzing.",
    });

    expect(validateIntakeQueue("   ", [{ id: "source-1" }])).toEqual({
      isValid: false,
      error: "Name the grant opportunity before analyzing.",
    });
  });

  it("fails when the opportunity name is missing", () => {
    expect(validateIntakeQueue(null, [{ id: "source-1" }])).toEqual({
      isValid: false,
      error: "Name the grant opportunity before analyzing.",
    });

    expect(validateIntakeQueue(undefined, [{ id: "source-1" }])).toEqual({
      isValid: false,
      error: "Name the grant opportunity before analyzing.",
    });
  });

  it("fails when no evidence items are queued", () => {
    expect(validateIntakeQueue("CA Tech Grant", [])).toEqual({
      isValid: false,
      error: "Add at least one document or pasted text source before analyzing.",
    });
  });

  it("fails when the queue is missing", () => {
    expect(validateIntakeQueue("CA Tech Grant", null)).toEqual({
      isValid: false,
      error: "Add at least one document or pasted text source before analyzing.",
    });

    expect(validateIntakeQueue("CA Tech Grant", undefined)).toEqual({
      isValid: false,
      error: "Add at least one document or pasted text source before analyzing.",
    });
  });

  it("prioritizes the missing opportunity name over missing evidence", () => {
    expect(validateIntakeQueue("", [])).toEqual({
      isValid: false,
      error: "Name the grant opportunity before analyzing.",
    });
  });
});
