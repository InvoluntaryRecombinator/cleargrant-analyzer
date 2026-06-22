export const intakeValidationErrors = {
  nameRequired: "Name required.",
  evidenceRequired: "Add a document or pasted text.",
} as const;

export function validateIntakeQueue(
  opportunityName: string | null | undefined,
  queuedItems: unknown[] | null | undefined,
) {
  if (!opportunityName?.trim()) {
    return {
      isValid: false,
      error: intakeValidationErrors.nameRequired,
    };
  }

  if (!queuedItems?.length) {
    return {
      isValid: false,
      error: intakeValidationErrors.evidenceRequired,
    };
  }

  return {
    isValid: true,
  };
}
