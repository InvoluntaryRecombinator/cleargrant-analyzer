# Full ClearGrant Analyzer PRD

## 1. Product Overview

**Product Name:** ClearGrant Analyzer
**Project Type:** Phase 2 Full-Stack Bootcamp Project
**Primary User:** Small nonprofit / grassroots organization
**Core Value:** Speed-to-no grant triage

ClearGrant Analyzer is a document ingestion and eligibility triage web application. It helps small grant applicants quickly evaluate whether uploaded grant documents are worth pursuing by extracting buried eligibility requirements into structured JSON and displaying them in a comparison matrix.

This is **not** a grant CRM, application tracker, grant-writing tool, or lifecycle management system. The product does not manage submitted applications, team workflows, reporting calendars, or grant writing. The MVP focuses only on the first-pass evaluation problem: turning long grant requirement documents into a structured dashboard that helps users quickly identify likely mismatches, hidden hard requirements, and grants that need deeper review.

## 2. Problem Statement

Small nonprofits and grassroots organizations often find grants that appear relevant based on title, category, or basic search filters, but the true eligibility requirements are buried deep inside long PDFs, DOCX files, or text documents. These documents may contain hard disqualifiers such as location restrictions, tax-status requirements, required registrations, matching funds, prior experience, or applicant-type limitations.

Reading each document manually takes too much time. A small organization may have 10 possible grants but only enough time to seriously pursue 1–3. They need a tool that helps them quickly answer:

> “Which of these are probably not worth pursuing, and why?”

ClearGrant Analyzer solves this by extracting grant requirements into a structured format, comparing them against a saved applicant profile, and displaying the results in a sortable matrix.

## 3. Goals and Background Context

### Product Goals

1. Allow a user to create an account and maintain one personal workspace.
2. Guide the user through a branching onboarding questionnaire that creates an editable applicant profile.
3. Allow the user to upload 1–10 grant documents through a drag-and-drop interface.
4. Extract key eligibility and requirement data from each uploaded document into a strict JSON structure.
5. Store uploaded grant records and extracted JSON in the database.
6. Compare extracted grant requirements against the user profile.
7. Display all analyzed grants in a desktop-first matrix dashboard.
8. Allow users to click into any grant for a detailed human-readable breakdown.
9. Support a mock-first build path so the UI, database, and matching logic can be built before the real LLM extraction pipeline is complete.

### Product Non-Goals

ClearGrant Analyzer will **not** include the following in MVP:

1. Application status tracking such as Submitted, Pending, Accepted, or Rejected.
2. Team collaboration, shared organizations, permissions, or role management.
3. Grant-writing assistance.
4. Compliance calendars or reporting reminders.
5. Application submission.
6. Public grant API search.
7. Multi-workspace organization management.
8. Mobile-first UX.
9. Legal/official eligibility certification.

## 4. MVP Scope

### In Scope

The MVP includes:

1. User authentication.
2. One personal workspace per user.
3. Branching onboarding/profile questionnaire.
4. Editable user profile page.
5. Drag-and-drop upload for PDF, DOCX, and TXT documents.
6. Upload queue showing selected files before analysis.
7. Analyze button that processes each uploaded document separately.
8. Mock extraction mode using seeded/sample JSON.
9. Real extraction route using an LLM API.
10. Database persistence for uploaded grants and extracted JSON.
11. Deterministic matching logic where possible.
12. Match labels:

* High Match
* Medium Match
* Low Match
* Needs Review

13. Matrix dashboard showing all uploaded/analyzed grants.
14. Grant detail page showing the extracted requirements in readable sections.
15. Basic delete/prune functionality for uploaded grants.
16. Vitest tests for matching logic and schema/data transformations.

### Stretch / Post-MVP

1. Public grant API search using saved profile.
2. DOCX formatting-aware extraction improvements.
3. CSV export.
4. Saved/pinned/favorite grants.
5. AI-generated match summaries.
6. Better evidence citation with page numbers.
7. Batch re-analysis after profile edits.
8. User-controlled column customization.

## 5. User Personas

### Primary Persona: Small Nonprofit Operator

A founder, executive director, program manager, or volunteer at a small nonprofit or grassroots organization. They do not have a dedicated grant professional and need to quickly decide which grants are worth spending time on.

**Needs:**

1. Quickly compare multiple grants.
2. Avoid wasting time on grants they are clearly disqualified from.
3. Understand why a grant may be a poor fit.
4. Keep eligibility information visible without reading every document.
5. Save their organization profile once and reuse it across uploaded grants.

### Secondary Persona: Solo Applicant / Researcher

An individual applicant, researcher, artist, or independent project lead who wants to evaluate grants, fellowships, or funding opportunities.

**Needs:**

1. Upload requirements documents.
2. See whether individual applicants are allowed.
3. Identify location, affiliation, or institutional requirements.
4. Quickly detect hidden disqualifiers.

## 6. Core User Flows

### Flow 1: Sign Up and Onboard

1. User signs up or logs in.
2. User is redirected to onboarding if no profile exists.
3. User answers branching questions.
4. System saves structured profile data.
5. User lands on the dashboard or upload page.

### Flow 2: Edit Profile

1. User opens Manage Profile.
2. User edits organization/applicant information.
3. User saves profile.
4. System updates profile record.
5. Future matching uses updated profile data.

### Flow 3: Upload and Analyze Grants

1. User opens Upload Grants.
2. User drags or selects 1–10 PDF, DOCX, or TXT files.
3. User sees files in an upload queue.
4. User clicks Analyze.
5. Backend creates grant records.
6. Backend processes each document separately.
7. Extraction result JSON is saved to the database.
8. Match result is calculated against the user profile.
9. User is directed to Matrix Dashboard.

### Flow 4: Review Matrix Dashboard

1. User opens Matrix Dashboard.
2. System loads all analyzed grants for the logged-in user.
3. Grants appear in a table/matrix.
4. User can scan match label, primary reason, hard requirements, needs-review items, deadline, award amount, and funder.
5. User clicks a row to open the grant detail page.

### Flow 5: Review Grant Detail

1. User opens one grant detail page.
2. System displays extracted JSON as readable sections.
3. User sees eligibility requirements, hard constraints, required documents, obligations, extracted metadata, and match reasoning.
4. User can delete the grant or return to the matrix.

## 7. Functional Requirements

### Authentication

**FR1:** Users can sign up, log in, and log out.
**FR2:** All profile, upload, grant, and matrix pages require authentication.
**FR3:** Users can only access their own profile and grant records.

### Profile / Onboarding

**FR4:** The app must show a branching onboarding flow when a user has no saved profile.
**FR5:** The profile must support applicant type, legal/tax status, location, mission/focus areas, population served, project type, funding constraints, and operational capacity.
**FR6:** The user must be able to edit profile information after onboarding.
**FR7:** Profile fields should be structured enough to support matching logic.

### Upload

**FR8:** Users can upload 1–10 files at a time.
**FR9:** Supported MVP file types are PDF, DOCX, and TXT.
**FR10:** The upload page must use drag-and-drop and click-to-upload.
**FR11:** The UI must show selected files before analysis.
**FR12:** Upload errors must be shown clearly.

### Extraction

**FR13:** Each uploaded document must be processed separately.
**FR14:** The backend must extract text from each uploaded file.
**FR15:** The backend must call an LLM API server-side only.
**FR16:** The LLM must return a strict JSON object.
**FR17:** Extracted JSON must be saved to the database.
**FR18:** Failed extraction should not crash the entire batch.

### Matching

**FR19:** The system must compare extracted grant requirements against the user profile.
**FR20:** Deterministic matching should be used where possible.
**FR21:** Ambiguous requirements must be marked Needs Review.
**FR22:** The UI must show why a grant is Low Match or Needs Review.
**FR23:** The system should not claim official eligibility.

### Matrix Dashboard

**FR24:** Matrix Dashboard must show all analyzed grants for the current user.
**FR25:** Matrix rows must be clickable.
**FR26:** Dashboard must include match label, primary reason, funder, deadline, award amount, hard requirement summary, and needs-review count.
**FR27:** Dashboard must be desktop-first and horizontally scrollable if needed.
**FR28:** User can delete/prune grants from the matrix.

### Grant Detail View

**FR29:** Each grant must have a dedicated detail page.
**FR30:** Detail page must show extracted JSON in human-readable sections.
**FR31:** Detail page must show eligibility requirements, required documents, obligations, and match reasoning.
**FR32:** Detail page must provide a way back to the matrix.

## 8. Nonfunctional Requirements

**NFR1:** API keys must only exist server-side.
**NFR2:** Users must not access another user’s grants or profile.
**NFR3:** The app should be desktop-first.
**NFR4:** Long-running extraction should show loading/progress states.
**NFR5:** The app should tolerate partial failure during batch analysis.
**NFR6:** Matching logic should be unit-testable.
**NFR7:** The first build should support seeded/mock extracted JSON.
**NFR8:** Database schema should allow extraction JSON to evolve over time.
**NFR9:** The UI should avoid overclaiming certainty.
**NFR10:** The app should be deployable with environment variables for Supabase, database, and LLM API keys.

## 9. Mock-First Implementation Strategy

The first implementation pass may use seeded/mock extracted grant JSON to build the database, dashboard, grant detail view, and matching display before the real LLM extraction pipeline is complete.

This allows the project to show visible progress quickly:

1. Build auth and profile storage.
2. Seed or mock extracted grant JSON.
3. Build matrix dashboard from stored JSON.
4. Build grant detail view from stored JSON.
5. Build deterministic matching against mock data.
6. Add real upload and extraction later.

This prevents the project from getting blocked by perfecting the extraction schema too early.

## 10. Data Model Requirements

Core data objects:

1. **User**
   Represents authenticated user.

2. **Profile**
   Stores structured applicant/organization information.

3. **Grant**
   Represents one uploaded/analyzed grant opportunity.

4. **UploadedDocument**
   Represents the uploaded source file.

5. **ExtractionResult**
   Stores the extracted JSON object and extraction status.

6. **MatchResult**
   Stores calculated match label, reasons, hard-no items, and needs-review items.

For MVP, these can be collapsed slightly if needed, but keeping them separate makes the app easier to reason about.

## 11. Suggested Prisma Models

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  profile   Profile?
  grants    Grant[]
}

model Profile {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  applicantType     String
  organizationName  String?
  legalStatus       String?
  taxStatus         String?
  country           String?
  state             String?
  city              String?
  missionStatement  String?
  focusAreas        String[]
  populationsServed String[]
  projectTypes      String[]

  hasFiscalSponsor  Boolean?
  hasEin            Boolean?
  hasSamRegistration Boolean?
  hasUei            Boolean?
  canProvideMatchFunds Boolean?
  minimumUsefulAward Int?

  rawProfileJson Json?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Grant {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  title     String?
  funder    String?
  sourceFileName String?
  fileType  String?
  deadline  DateTime?
  awardMin  Int?
  awardMax  Int?

  processingStatus String @default("uploaded")

  uploadedDocument UploadedDocument?
  extractionResult ExtractionResult?
  matchResult      MatchResult?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model UploadedDocument {
  id        String   @id @default(cuid())
  grantId   String   @unique
  grant     Grant    @relation(fields: [grantId], references: [id], onDelete: Cascade)

  fileName  String
  fileType  String
  fileUrl   String?
  extractedText String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ExtractionResult {
  id        String   @id @default(cuid())
  grantId   String   @unique
  grant     Grant    @relation(fields: [grantId], references: [id], onDelete: Cascade)

  status    String   @default("pending")
  extractedJson Json
  errorMessage String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model MatchResult {
  id        String   @id @default(cuid())
  grantId   String   @unique
  grant     Grant    @relation(fields: [grantId], references: [id], onDelete: Cascade)

  matchLabel String
  score      Int?
  primaryReason String?
  hardNoReasons Json?
  needsReviewItems Json?
  passedItems Json?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 12. API Routes / Server Actions Needed

### Auth

Handled by Supabase Auth or chosen auth provider.

### Profile Routes

```text
GET /api/profile
POST /api/profile
PATCH /api/profile
```

### Grant Routes

```text
GET /api/grants
GET /api/grants/:id
DELETE /api/grants/:id
```

### Upload / Analysis Routes

```text
POST /api/grants/upload
POST /api/grants/analyze
POST /api/grants/analyze/:id
```

### Mock Data Route for Early Build

```text
POST /api/dev/seed-mock-grants
```

Only available in development.

### Matching Route

```text
POST /api/grants/:id/match
POST /api/grants/rematch-all
```

For MVP, matching can also happen inside the analyze route.

## 13. Extraction JSON Schema Draft

This schema is intentionally practical, not perfect. It should evolve after testing real grant documents.

The extraction model must be evidence-first. Do not use a rigid checklist of nullable booleans for eligibility requirements, because that encourages inferred fields and hallucinated negatives. The LLM should only extract requirements that explicitly exist in the source text. If a requirement is not present, omit it from the requirements array instead of representing it as `false` or `null`.

```ts
export type ExtractedRequirementCategory =
  | "applicant_type"
  | "legal_status"
  | "tax_status"
  | "location"
  | "registration"
  | "funding_constraint"
  | "required_document"
  | "ongoing_requirement"
  | "other_hard_requirement"
  | "other_eligibility_note";

export type ExtractedRequirement = {
  category: ExtractedRequirementCategory;
  value: string;
  sourceQuote: string;
  normalizedValues?: string[];
  confidence: "high" | "medium" | "low";
};

export type ExtractedGrant = {
  metadata: {
    grantTitle?: string;
    funderName?: string;
    deadline?: string;
    awardText?: string;
  };
  requirements: ExtractedRequirement[];
  extractionNotes?: string[];
  extractionConfidence: "high" | "medium" | "low";
};
```

The OpenAI extraction prompt should instruct the model to:

1. Extract only requirements explicitly stated in the document.
2. Include a `sourceQuote` for every extracted requirement.
3. Use `normalizedValues` only when the source text clearly supports a normalized value.
4. Leave missing requirement categories out of the array.
5. Avoid filling inferred booleans, default values, or speculative eligibility conclusions.

## 14. Matching Logic Requirements

The matching engine should compare the user profile against the extracted requirement array. Matching should use category filtering and array intersection logic, not direct 1:1 nullable boolean checks.

### Matching Rules

1. Normalize profile attributes into arrays such as applicant types, legal statuses, tax statuses, locations, registrations, and funding capabilities.
2. Group extracted requirements by category and compare each category against the relevant profile arrays.
3. If an explicit requirement has normalized values and none intersect with the user's matching profile values, mark Low Match.
4. If a requirement is explicit but cannot be confidently normalized or compared, mark Needs Review.
5. If a requirement category is absent from the extracted array, do not treat it as a failure.
6. If no major conflicts are found, mark Medium or High Match depending on positive alignment.
7. Never claim official eligibility; present results as triage guidance based on extracted text.

### Match Labels

```text
High Match
Medium Match
Low Match
Needs Review
```

### Example Match Result

```json
{
  "matchLabel": "Low Match",
  "score": 35,
  "primaryReason": "The grant appears to require 501(c)(3) status, but the saved profile does not indicate nonprofit tax status.",
  "hardNoReasons": [
    {
      "category": "tax_status",
      "grantRequirement": "Applicant must be a 501(c)(3) nonprofit.",
      "profileValue": "Individual / no nonprofit status"
    }
  ],
  "needsReviewItems": [
    {
      "category": "registration",
      "reason": "The extracted requirement mentions active federal registration, but the source text does not clearly specify whether SAM, UEI, or another registration is required."
    }
  ],
  "passedItems": [
    {
      "category": "location",
      "reason": "Grant allows applicants in the United States and profile is located in the United States."
    }
  ]
}
```

## 15. Matrix Dashboard Requirements

The Matrix Dashboard is the main product surface.

### Required Columns

1. Grant Name
2. Match Label
3. Primary Reason
4. Funder
5. Deadline
6. Award Amount
7. Applicant Type Requirement
8. Location Requirement
9. Legal/Tax Requirement
10. Hard Requirements Count
11. Needs Review Count
12. Extraction Confidence
13. Actions

### UX Behavior

1. Dashboard is desktop-first.
2. Table can be horizontally scrollable.
3. Rows are clickable.
4. Match label should be visually prominent.
5. Low Match / Needs Review rows should clearly show why.
6. User can delete a grant.
7. Empty state should tell users to upload grants first.
8. Loading state should appear while analysis is running.

## 16. Grant Detail Page Requirements

The Grant Detail page shows one uploaded grant in a clean readable format.

### Required Sections

1. Summary
2. Match Result
3. Primary Reasons
4. Applicant Eligibility
5. Location Eligibility
6. Required Registrations
7. Funding Constraints
8. Required Documents
9. Ongoing Requirements
10. Other Hard Requirements
11. Raw Extracted JSON View

The raw JSON view can be collapsed by default.

## 17. Epics and Stories in Build Order

## Epic 1: Project Setup and Auth

### Goal

Create the base application, configure the stack, and support authenticated users.

### Stories

**Story 1.1: Initialize Next.js App**

As a developer, I want a Next.js App Router project with TypeScript and Tailwind so that the product has a working foundation.

Acceptance Criteria:

1. Next.js app runs locally.
2. Tailwind is configured.
3. Basic layout exists.
4. Environment variable structure exists.

**Story 1.2: Configure Supabase and Prisma**

As a developer, I want Supabase/PostgreSQL and Prisma configured so that app data can be persisted.

Acceptance Criteria:

1. Prisma connects to the database.
2. Initial schema exists.
3. Migrations can run.
4. Prisma client can query the database.

**Story 1.3: Add Authentication**

As a user, I want to sign up, log in, and log out so that my profile and grants are private.

Acceptance Criteria:

1. User can sign up.
2. User can log in.
3. User can log out.
4. Protected pages redirect unauthenticated users.

## Epic 2: Onboarding and Profile

### Goal

Create an editable structured applicant profile used for matching.

### Stories

**Story 2.1: Build Branching Onboarding Form**

As a user, I want to answer a branching questionnaire so that the app can create my applicant profile.

Acceptance Criteria:

1. User can complete onboarding.
2. Form includes applicant type, legal status, location, mission, focus areas, and constraints.
3. Branching questions appear based on applicant type.
4. Submitted data saves to database.

**Story 2.2: Build Manage Profile Page**

As a user, I want to edit my saved profile so that matching stays accurate.

Acceptance Criteria:

1. User can view saved profile.
2. User can edit profile.
3. User can save changes.
4. Updated profile persists.

## Epic 3: Mock Grant Data and Matrix UI

### Goal

Build the matrix and detail UI before real extraction is complete.

### Stories

**Story 3.1: Add Mock Extracted Grant JSON**

As a developer, I want seeded/mock grant extraction records so that I can build the dashboard without waiting for the LLM pipeline.

Acceptance Criteria:

1. Mock grant records can be seeded.
2. Mock extracted JSON matches the draft schema.
3. Mock grants are linked to the current user.

**Story 3.2: Build Matrix Dashboard**

As a user, I want to see all analyzed grants in a matrix so that I can compare opportunities quickly.

Acceptance Criteria:

1. Dashboard loads user grants.
2. Grants display in table rows.
3. Match label appears.
4. Key requirement fields appear.
5. Rows link to detail pages.

**Story 3.3: Build Grant Detail Page**

As a user, I want to click a grant and see the full extracted breakdown so that I can inspect details outside the matrix.

Acceptance Criteria:

1. Grant detail page loads by ID.
2. Page displays extracted sections.
3. Page displays match result.
4. Page includes raw JSON section.
5. User can return to matrix.

## Epic 4: Matching Logic

### Goal

Compare profile data against extracted grant JSON.

### Stories

**Story 4.1: Build Deterministic Match Function**

As a developer, I want a match function that compares profile and grant JSON so that each grant receives a useful match label.

Acceptance Criteria:

1. Function accepts profile and extracted grant JSON.
2. Function returns match label, score, primary reason, hard no reasons, needs-review items, and passed items.
3. Function handles absent requirement categories, empty requirement arrays, and missing normalized values.
4. Function never crashes on incomplete extraction data.
5. Function uses array intersection logic rather than direct nullable boolean checks.

**Story 4.2: Save Match Results**

As a user, I want match results saved with each grant so that the dashboard loads quickly.

Acceptance Criteria:

1. Match result is saved to database.
2. Matrix uses saved match result.
3. Detail page uses saved match result.

**Story 4.3: Add Vitest Tests for Matching**

As a developer, I want tests around matching logic so that hard-no and needs-review behavior is reliable.

Acceptance Criteria:

1. Test location match.
2. Test applicant type mismatch.
3. Test 501(c)(3) requirement mismatch.
4. Test absent requirement categories and ambiguous extracted requirements.
5. Test High/Medium/Low/Needs Review output.

## Epic 5: Upload and Document Processing

### Goal

Allow users to upload grant documents and prepare them for extraction.

### Stories

**Story 5.1: Build Upload Page**

As a user, I want to drag and drop grant documents so that I can analyze multiple grants at once.

Acceptance Criteria:

1. User can drag/drop files.
2. User can click to open file picker.
3. PDF, DOCX, and TXT files are accepted.
4. Unsupported files show error.
5. User can upload 1–10 files.

**Story 5.2: Store Uploaded Documents**

As a user, I want uploaded files saved so that they can be analyzed and associated with grant records.

Acceptance Criteria:

1. Uploaded file creates a Grant record.
2. Uploaded file creates an UploadedDocument record.
3. File metadata is saved.
4. Processing status updates.

**Story 5.3: Extract Text From Files**

As a developer, I want to extract text from PDF, DOCX, and TXT files so that the LLM can analyze the content.

Acceptance Criteria:

1. TXT text can be read.
2. DOCX text can be extracted.
3. PDF text can be extracted.
4. Extraction failure is handled gracefully.

## Epic 6: LLM Extraction Pipeline

### Goal

Use an LLM API to convert document text into strict extracted grant JSON.

### Stories

**Story 6.1: Create Server-Side LLM Extraction Route**

As a developer, I want a backend route that sends document text to the LLM so that API keys stay secure.

Acceptance Criteria:

1. API key is server-side only.
2. Route accepts grant/document ID.
3. Route retrieves extracted text.
4. Route calls LLM.
5. Route saves extraction JSON.

**Story 6.2: Validate Extraction Output**

As a developer, I want extracted JSON validated before saving so that malformed data does not break the dashboard.

Acceptance Criteria:

1. Extracted JSON is checked against expected shape.
2. Missing optional fields are allowed.
3. Invalid extraction marks record as failed.
4. UI shows failed status.

**Story 6.3: Run Matching After Extraction**

As a user, I want the app to calculate match results after extraction so that the dashboard is ready after analysis.

Acceptance Criteria:

1. After extraction, matching function runs.
2. MatchResult is saved.
3. Grant processing status changes to analyzed.
4. Matrix shows analyzed grant.

## Epic 7: Polish and Deployment

### Goal

Make the MVP usable, presentable, and deployable.

### Stories

**Story 7.1: Add Loading, Empty, and Error States**

Acceptance Criteria:

1. Upload page has loading state.
2. Matrix has empty state.
3. Detail page handles missing grants.
4. Extraction failures are visible.

**Story 7.2: Add Delete Grant Functionality**

Acceptance Criteria:

1. User can delete a grant.
2. Deleted grant disappears from matrix.
3. Related document/extraction/match records are deleted.

**Story 7.3: Prepare Deployment**

Acceptance Criteria:

1. Environment variables documented.
2. Database migration works in deployed environment.
3. App can deploy.
4. Auth works in deployed environment.
5. LLM API key is not exposed client-side.

## 18. Testing / TDD Notes

Use Vitest where it provides clear value.

### High-Value Tests

1. `matchGrantToProfile.test.ts`

   * Applicant type mismatch.
   * Location pass.
   * Location mismatch.
   * 501(c)(3) mismatch.
   * Ambiguous extracted requirement returns Needs Review.
   * Missing requirement category does not create a hard no.
   * Match funds requirement mismatch.

2. `normalizeProfile.test.ts`

   * Form data becomes structured profile object.
   * Empty optional values do not crash.

3. `extractGrantSchema.test.ts`

   * Mock extraction JSON with requirement arrays passes validation.
   * Each requirement includes category, value, and sourceQuote.
   * Missing requirement categories are allowed.
   * Invalid requirement objects are rejected.

4. `grantDisplayMapping.test.ts`

   * Extracted JSON maps to matrix row.
   * Extracted JSON maps to detail sections.

### Tests Not Needed for MVP

1. Full browser E2E tests.
2. LLM response quality tests.
3. Pixel-perfect UI tests.
4. Public grant API tests.

## 19. Initial Build Plan for Tomorrow

Recommended order:

1. Create repo and install stack.
2. Configure Supabase/PostgreSQL and Prisma.
3. Add User/Profile/Grant/Extraction/Match schema.
4. Build auth.
5. Build shell layout/nav.
6. Build onboarding/profile page.
7. Seed mock extracted grants.
8. Build matrix dashboard from mock grants.
9. Build grant detail page.
10. Add deterministic matching function and Vitest tests.
11. Build upload page.
12. Add real extraction route.

## 20. Success Criteria

The MVP is successful when:

1. A user can sign up and log in.
2. A user can complete and edit a structured profile.
3. A user can upload multiple grant documents.
4. The system can store uploaded grants.
5. The system can display mock or real extracted grant JSON in a matrix.
6. The matrix shows match labels and primary reasons.
7. A user can click into a grant detail view.
8. The app can calculate deterministic match results from profile + extracted grant JSON.
9. The app has at least a few Vitest tests showing matching logic.
10. The app is deployable with server-side API key protection.

---
