export function validateIntakeQueue(
  opportunityName: string | null | undefined,
  queuedItems: unknown[] | null | undefined,
) {
  if (!opportunityName?.trim()) {
    return {
      isValid: false,
      error: "Name the grant opportunity before analyzing.",
    };
  }

  if (!queuedItems?.length) {
    return {
      isValid: false,
      error: "Add at least one document or pasted text source before analyzing.",
    };
  }

  return {
    isValid: true,
  };
}
