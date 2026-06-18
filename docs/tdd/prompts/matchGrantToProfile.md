# matchGrantToProfile TDD Intent

Build the deterministic grant-to-profile matching engine against the requirement-array extraction model.

The test anticipates the final production logic:

- Profile attributes normalize into arrays for applicant type, tax status, geography, registrations, and funding capacity.
- Extracted requirements are filtered by category and compared with array intersection.
- Explicit normalized requirements with no overlap become `Low Match`.
- Explicit requirements without usable normalized values become `Needs Review`.
- Missing requirement categories are neutral and must not become hard failures.
- The result includes a match label, score, primary reason, hard no reasons, needs review items, and passed items.

The red run should fail because `utils/matchGrantToProfile.ts` exists but exports no implementation.
