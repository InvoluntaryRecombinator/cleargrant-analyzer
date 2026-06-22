# Upload Transformation: Grouped Intake Desk

## Purpose

Refactor `/upload` from a one-file uploader into a create-only intake desk for new grant opportunities.

Target flow:

`New Grant Opportunity -> Many Evidence Items -> One OpenAI Extraction -> One Matrix Row`

Important scope boundary: `/upload` is only for creating new grant opportunities. Updating an existing grant dossier will be built later on `/grants/[id]`.

## Locked Product Decisions

1. `/upload` creates new grant opportunities only.
2. Existing-grant append flows are not part of `/upload`.
3. Uploaded PDF/DOCX/TXT files must be saved to Supabase Storage.
4. Supabase Storage bucket is private.
5. Supabase Storage bucket name is `grant-evidence`.
6. `UploadedDocument.fileUrl` stores the durable storage path, not a public URL.
7. Signed URLs are generated dynamically later when the user clicks `View Document`.
8. Pasted text is stored as a virtual evidence row, not as a physical dummy file.
9. Users can edit the display name of every queued file and pasted text snippet before analysis.
10. Pasted text supports an optional source URL.
11. `ExtractionRevision` must be implemented.
12. Every analyze operation creates a new extraction revision.
13. Later document deletion is soft delete only: `isActive = false`.
14. Soft deletion does not automatically alter the current extracted JSON.
15. Every extracted requirement must include `sourceName`.
16. Conflicting facts must be recorded in `extractionNotes`, citing both source names.
17. Failed evidence is shown in a collapsible warning panel.
18. Revision history UI shows metadata and raw JSON snapshots only. No JSON diff viewer in this phase.
19. Raw JSON on grant detail must be collapsed by default as a developer-oriented accordion near the bottom of the page.

## Non-Goals For This Phase

- No existing-grant dropdown on `/upload`.
- No append-to-existing route from `/upload`.
- No automatic JSON rewrite when a document is soft-deleted.
- No React/JSDOM test expansion unless explicitly approved.
- No hard delete of stored evidence files.

## Current Architectural Gaps

- `Grant.uploadedDocument` is currently one-to-one.
- `UploadedDocument.grantId` is currently `@unique`.
- `/api/analyze` currently creates one grant per file.
- `/grants/[id]` currently fetches `uploadedDocument: true`.
- OpenAI extraction currently assumes one document.
- The current JSON requirement shape lacks `sourceName`.
- The app currently stores extracted text but not original uploaded binaries.

## Prisma Schema Plan

### Grant

```prisma
model Grant {
  id               String @id @default(cuid())
  userId           String
  user             User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  title            String?
  funder           String?
  sourceFileName   String?
  fileType         String?
  deadline         DateTime?
  awardMin         Int?
  awardMax         Int?
  processingStatus String @default("uploaded")
  analysisVersion  Int    @default(1)
  lastAnalyzedAt   DateTime?

  uploadedDocuments UploadedDocument[]
  extractionResult   ExtractionResult?
  extractionRevisions ExtractionRevision[]
  matchResult        MatchResult?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}
```

### UploadedDocument

```prisma
model UploadedDocument {
  id      String @id @default(cuid())
  grantId String
  grant   Grant  @relation(fields: [grantId], references: [id], onDelete: Cascade)

  fileName         String
  displayName      String?
  fileType         String
  fileUrl          String?
  sourceKind       String @default("file") // file | pasted_text
  sourceUrl        String?
  sourceOrder      Int    @default(0)
  extractedText    String?
  extractionStatus String @default("completed") // completed | failed
  extractionError  String?
  contentHash      String?
  fileSize         Int?
  isActive         Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([grantId])
  @@index([grantId, isActive])
}
```

`grantId` must not be unique. Dropping `@unique` alone is not enough; `Grant.uploadedDocument` must become `Grant.uploadedDocuments UploadedDocument[]`.

### ExtractionRevision

```prisma
model ExtractionRevision {
  id            String @id @default(cuid())
  grantId       String
  grant         Grant  @relation(fields: [grantId], references: [id], onDelete: Cascade)

  revision      Int
  reason        String // initial_analysis | append_analysis | manual_rerun
  extractedJson Json
  inputSummary  Json?

  createdAt DateTime @default(now())

  @@index([grantId])
  @@unique([grantId, revision])
}
```

`ExtractionResult` remains the current snapshot. `ExtractionRevision` stores immutable historical snapshots.

## Evidence Storage Rules

### Uploaded Files

For every uploaded PDF/DOCX/TXT:

1. Save the original file to Supabase Storage.
2. Store the durable storage reference in `UploadedDocument.fileUrl`.
3. Extract text server-side.
4. Store extracted text in `UploadedDocument.extractedText`.
5. Use the queue-edited display name as `UploadedDocument.displayName`.

Recommended storage path:

```txt
grant-evidence/{userId}/{grantId}/{uploadedDocumentId}/{safeFileName}
```

The bucket is private and named `grant-evidence`.

`fileUrl` stores a durable storage path/object key, not a public URL and not a short-lived signed URL. Signed URLs are generated dynamically when a user later requests to view or download the document.

### Storage Cleanup On Failure

Supabase Storage writes are outside the Prisma transaction boundary. The implementation must track every storage path uploaded during a request.

If a Prisma write or transaction fails after one or more files have already been uploaded:

1. catch the database error
2. call Supabase Storage `remove` for all uploaded paths from that request
3. return a controlled 500 response to the client

This best-effort cleanup prevents orphaned private grant files.

### Pasted Text

Pasted text does not create a physical `.txt` file.

It creates a virtual `UploadedDocument` row:

```ts
{
  sourceKind: "pasted_text",
  fileName: "pasted-text-snippet-1.txt",
  displayName: userEditedDisplayName,
  fileType: "text/plain",
  fileUrl: null,
  sourceUrl: optionalUserProvidedUrl,
  extractedText: pastedText,
  sourceOrder: queueIndex,
  extractionStatus: "completed",
}
```

The generated `fileName` is deterministic. The editable user-facing name is `displayName`.

## `/upload` UI Requirements

### Page Scope

The page title and copy should make clear that the user is creating a new opportunity.

No mode switch. No existing grant selector. No append UX.

### Required Input

- `Opportunity Name` is required.
- At least one evidence item is required.

### Dual Input Zone

The UI must include:

1. File dropzone for PDF/DOCX/TXT.
2. Pasted text area.
3. Optional pasted source URL input.
4. `Add Text to Queue` button.

Pasting into the text area should not automatically queue text. The user must click `Add Text to Queue`.

### Evidence Queue

The queue must show both file and pasted-text evidence.

Each queued item must include:

- source kind icon
- editable display name
- original file name or generated text filename
- file size or pasted character count
- optional source URL
- remove button

The user must be able to delete a queued item before analysis to avoid spending API credits on the wrong evidence.

### Submit State

The analyze button is disabled until:

- `Opportunity Name` is non-empty
- queue has at least one evidence item
- request is not already in progress

Button label:

```txt
Analyze new opportunity
```

On success, navigate to `/grants/[id]` for the newly created grant.

## Create API Route

Route:

```txt
POST /api/intake/grants
```

`/api/analyze` should be replaced or become a compatibility wrapper only if necessary.

Input:

- `grantName`
- `files[]`
- `fileDisplayNames[]`
- `pastedTexts[]`
- `pastedDisplayNames[]`
- `pastedSourceUrls[]`

Execution:

1. Authenticate user.
2. Ensure user owns a profile.
3. Validate `grantName`.
4. Validate at least one evidence item.
5. Validate max file count, max file size, pasted text length, and aggregate text length.
6. Create one `Grant` with:
   - `title = grantName`
   - `processingStatus = "processing"`
   - `fileType = "grouped"`
   - `sourceFileName = null`
7. Persist uploaded files to Supabase Storage.
8. Extract text from files.
9. Create virtual rows for pasted text.
10. Insert many `UploadedDocument` rows.
11. Build labeled source blocks from readable evidence.
12. Call OpenAI once.
13. Create or update `ExtractionResult` as the current snapshot.
14. Create `ExtractionRevision` revision `1`.
15. Run deterministic matching.
16. Create `MatchResult`.
17. Update `Grant`:
   - `processingStatus = "analyzed"`
   - `analysisVersion = 1`
   - `lastAnalyzedAt = now`
   - metadata fields from extraction
18. Return `{ grantId }`.

If steps 11-17 fail after file storage succeeds, remove uploaded paths from Supabase Storage before returning an error.

### Tolerant Extraction

If at least one evidence item is readable, proceed.

Unreadable evidence:

- gets an `UploadedDocument` row
- stores `extractionStatus = "failed"`
- stores a safe `extractionError`
- is omitted from source blocks
- is mentioned in `extractionNotes`

If zero evidence items are readable, mark the grant failed.

## Source Block Format

Use source-labeled blocks. The source label must match the user-editable `displayName` when present.

```txt
--- SOURCE 1: Guidelines PDF ---
[text]

--- SOURCE 2: Eligibility Webpage Paste ---
[text]
```

The model must be able to copy `sourceName` exactly from these labels.

## JSON Schema Changes

Every requirement must include `sourceName`.

```ts
type ExtractedRequirement = {
  category: ExtractedRequirementCategory;
  value: string;
  sourceName: string;
  sourceQuote: string;
  normalizedValues?: string[];
  confidence: "high" | "medium" | "low";
};
```

Structured output schema must add `sourceName` to the required fields for every requirement item.

`extractionNotes` remains an array of strings, but conflict notes must cite source names.

Example conflict note:

```txt
Conflict: Guidelines PDF states the deadline is June 1, 2026, while FAQ Paste states the deadline is June 15, 2026. No superseding source was provided.
```

## OpenAI Creation Prompt Requirements

System prompt must include:

```txt
You extract explicit grant requirements from multiple evidence sources describing ONE grant opportunity.

Rules:
- Return one consolidated JSON object.
- Do not create separate grant records for separate sources.
- Extract only facts explicitly present in the evidence.
- Every requirement must include sourceName copied exactly from the source heading.
- Every requirement must include an exact sourceQuote from the same source.
- If sources conflict, do not silently guess.
- Record conflicts in extractionNotes and cite all conflicting source names.
- If metadata conflicts and no source explicitly supersedes another, leave the metadata field empty or conservative, and record the conflict in extractionNotes.
- Do not infer eligibility.
- Do not create booleans or checklist defaults.
- Omit absent requirement categories.
```

## Downstream Page Changes

### Matrix

Matrix remains one row per `Grant`.

Required updates:

- replace file subtitle with evidence count or grouped source summary
- continue reading `ExtractionResult` and `MatchResult`
- do not show inactive evidence as active source count

### Grant Detail

Change query from:

```ts
include: {
  uploadedDocument: true,
}
```

To:

```ts
include: {
  uploadedDocuments: {
    where: { isActive: true },
    orderBy: { sourceOrder: "asc" },
  },
  extractionRevisions: {
    orderBy: { revision: "desc" },
  },
}
```

Grant detail should show:

- active evidence list
- failed evidence in a collapsed warning panel
- current extraction snapshot
- revision history metadata and raw JSON snapshots
- source names beside extracted requirements
- raw JSON accordion collapsed by default near the bottom of the page

## Future Append Flow On `/grants/[id]`

Appending evidence will be designed later on the grant detail page, not `/upload`.

Expected future flow:

1. User opens `/grants/[id]`.
2. User adds new evidence to that specific dossier.
3. Backend fetches current JSON and active evidence.
4. Backend sends current JSON plus new source blocks to a delta prompt.
5. Backend creates a new `ExtractionRevision`.
6. Backend updates current `ExtractionResult`.
7. Backend reruns matching.

Future delta prompt must preserve existing facts unless new evidence explicitly contradicts them.

Soft-deleted evidence must not automatically rewrite JSON. A future explicit re-analysis action can create a new revision from active evidence only.

## Safety Limits

Approved limits:

- max files per new opportunity: `10`
- max individual file size: `20 MB`
- max pasted snippets: `10`
- max pasted characters per snippet: `40,000`
- max extracted characters per evidence item: current `120,000`
- max aggregate characters sent to OpenAI: `180,000`

If text is truncated, add an extraction note that names the truncated source.

## TDD Requirements

Use Vitest for deterministic logic.

Required red/green logged test modules:

- `buildEvidenceSourceBlocks`
- `normalizePastedEvidence`
- `validateCreateOpportunityIntake`
- `generateVirtualEvidenceFileName`
- `extractReadableEvidence`
- `buildInitialExtractionPrompt`
- `preserveSourceNameInRequirementShape`

Logs must follow:

```txt
docs/tdd/logs/[module]-red.txt
docs/tdd/logs/[module]-green.txt
```

Do not add React/JSDOM UI tests unless explicitly approved.

## Phase 1 Execution Order

1. Update Prisma schema.
2. Run Prisma generate and database push.
3. Update relation references from `uploadedDocument` to `uploadedDocuments`.
4. Update `ExtractedRequirement` type and OpenAI schema with `sourceName`.
5. Add Supabase Storage helper.
6. TDD source block and pasted evidence helpers.
7. TDD create-intake validation.
8. Replace `/api/analyze` with create-only grouped route.
9. Update `/upload` UI for create-only intake desk.
10. Update matrix evidence summary.
11. Update grant detail evidence and revision display.
12. Run Vitest, lint, build.

## Finalized Implementation Decisions

- Supabase Storage bucket is private.
- Bucket name is `grant-evidence`.
- `UploadedDocument.fileUrl` stores durable storage paths only.
- Signed URLs are generated on demand later.
- Limits are approved: `10` files, `20 MB` per file, `10` pasted snippets, `40,000` chars per pasted snippet, `180,000` aggregate chars sent to OpenAI.
- Pasted text includes optional source URL support in Phase 1.
- Failed evidence appears in a collapsible warning panel.
- Revision history shows metadata and raw JSON snapshots only.
- Raw JSON on grant detail is collapsed by default as a developer-oriented section.
- If file storage succeeds but Prisma fails, uploaded storage paths are removed in a catch block before the API returns an error.
