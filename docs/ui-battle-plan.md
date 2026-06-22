# ClearGrant UI Battle Plan

## Goal

Move ClearGrant from "data model views" to user workflows.

The current UI often displays backend concepts directly: `matrix`, `evidence`, `dossier`, `extraction`, `hard requirements`, `Needs Review`, raw counts, and vague model summaries. The refactor should make the product feel like a dense, serious SaaS utility for reviewing grant opportunities.

This plan is intentionally split into phases so we do not paint over unstable data structures.

## Stable Product Language

Use these terms consistently:

| Use | Avoid |
| --- | --- |
| Grant opportunity | Grant dossier |
| Source documents | Evidence, file evidence |
| Source text | Pasted evidence, text shoebox |
| Sources to analyze | Queue, staging area |
| Comparison table | Matrix, portfolio |
| Fit rating | Match label |
| Likely conflicts | Hard requirements |
| Needs a closer read | Needs Review without explanation |
| Source quality | Extraction confidence |
| Applicant profile | Workspace profile / deterministic profile data |

## Phase 1: Global Copy and Navigation Refactor

### Objective

Clean up the product language and top-level navigation before changing deeper UI structure. This phase should be safe because it does not depend on the backend refactor.

### Scope

Target files:

- `components/DashboardNav.tsx`
- `components/DashboardShell.tsx`
- `app/page.tsx`
- `app/(auth)/login/page.tsx`
- `app/(auth)/signup/page.tsx`
- `app/(dashboard)/dashboard/page.tsx`
- `app/(dashboard)/upload/page.tsx`
- global user-facing error copy in `app/error.tsx` and `app/(dashboard)/error.tsx`

### Navigation Changes

Current nav:

- Home
- Upload Grants
- Matrix
- Profile

Proposed nav:

- Add opportunity
- Compare
- Profile

Remove `Home` from primary navigation for now. The current Home page is not a command center yet; it duplicates navigation and creates an unclear identity split with the Matrix page. Keep the route temporarily if needed, but stop making it a primary destination.

Implementation options:

1. Redirect `/dashboard` to `/matrix` after login until a real command center exists.
2. Keep `/dashboard` reachable but remove it from nav and demote it to a future command-center backlog item.

Preferred short-term choice: option 1. A user logging in should land where their grant reviews live.

### Global Copy Replacements

Replace:

- "Upload Grants" -> "Add opportunity"
- "Matrix" -> "Compare" in nav
- "Grant eligibility matrix" -> "Grant comparison table"
- "Create a grant dossier" -> "Add a grant opportunity"
- "stage multiple files" -> "add source documents"
- "workspace" where vague -> "ClearGrant" or "grant review workspace"
- "deterministic triage signals" -> "first-pass review signals"
- "official eligibility decisions" -> "not an official eligibility decision"

### Landing Page Copy

Current headline:

> Eligibility triage for grant documents.

Proposed:

> Check grant fit before you apply.

Supporting copy:

> Add grant guidelines, notices, PDFs, DOCX files, or pasted source text. ClearGrant extracts eligibility requirements and compares them against your applicant profile.

CTA:

- "Create account"
- "Log in"

Replace the feature card labels:

- "Profile" -> "Applicant profile"
- "Extraction" -> "Requirement review"
- "Matrix" -> "Comparison table"

### Auth Copy

Login title:

> Log in to ClearGrant

Login description:

> Review saved grant analyses and update your applicant profile.

Signup title:

> Create your ClearGrant account

Signup description:

> Save your applicant profile and analyze grant opportunities privately.

Pending button copy should be contextual:

- Login: "Signing in..."
- Signup: "Creating account..."

### Upload/Intake Copy

Current terms to eliminate:

- File evidence
- Pasted evidence
- Text shoebox
- Dropzone
- Staging area
- Evidence queue
- Display name
- Stored as
- Private file evidence

Replace with:

- "Upload files"
- "Paste source text"
- "Add files"
- "Sources to analyze"
- "Document name"
- "Saved privately"
- "Uploaded file"

Recommended intake page structure:

1. Header: "Add a grant opportunity"
2. Opportunity name panel: "Name this grant"
3. Add sources panel:
   - "Upload files"
   - "Paste source text"
4. Source list panel:
   - "Sources to analyze"
   - compact rows
5. Submit action:
   - "Run analysis"

### Error Copy

Replace storage implementation errors:

Current:

> Evidence storage is unavailable. Confirm the private grant-evidence bucket exists.

User-safe replacement:

> Files could not be saved. Try again or contact support.

Admin/dev detail can stay in logs, not in normal UI.

### Phase 1 Acceptance Criteria

- Primary nav no longer says "Home," "Upload Grants," or "Matrix."
- User-facing copy no longer says "dossier," "evidence," "dropzone," "staging area," or "queue."
- Upload page uses "grant opportunity," "source documents," and "source text."
- Storage bucket errors are not shown to normal users.
- Login/signup copy uses product/task language, not vague workspace language.

## Phase 2: Settings/Profile Overhaul

### Objective

Convert `/profile` from a generic form page into a dense SaaS-style settings screen. This can be done before the matrix redesign because it mostly affects local layout and copy.

### Scope

Target files:

- `app/(dashboard)/profile/page.tsx`
- `app/(dashboard)/onboarding/page.tsx`
- `components/ProfileForm.tsx`
- `app/globals.css`

### Core Problem

The profile page currently looks like a generic web page with form fields. It has:

- large low-value whitespace
- cream background blending into white panels
- weak input borders
- step labels on an edit screen
- oversized checkbox pills
- no sticky save affordance
- backend copy in the header

### Page Framing

Current:

> Manage Profile  
> Edit applicant profile  
> Keep applicant attributes current so deterministic matching can compare requirements against reliable profile data.

Replace with:

> Applicant profile  
> ClearGrant uses this profile to check each grant opportunity against the applicant.

Alternative:

> Applicant profile  
> Update the details used in every grant review.

### Layout Change

Replace current large page-header + giant single form card with a settings layout:

```txt
┌─────────────────────────────────────────────────────────────┐
│ Applicant profile                              Save profile │
│ Used to compare grant requirements against this applicant.  │
├───────────────┬─────────────────────────────────────────────┤
│ Sections      │ Applicant                                   │
│ Applicant     │ [Applicant type] [Organization name]         │
│ Location      │                                             │
│ Program areas │ Location                                    │
│ Registrations │ [Country] [State] [City]                    │
│               │                                             │
│               │ Program areas                               │
│               │ compact checkbox grid                       │
└───────────────┴─────────────────────────────────────────────┘
```

Desktop:

- left section rail or compact section list
- right dense settings form
- sticky save footer or top-right save button

Mobile:

- no side rail
- section headers remain stacked
- sticky bottom save bar

### Kill Step Labels in Edit Mode

Current:

- Step 1
- Step 2
- Step 3
- Step 4

Edit mode replacement:

- Applicant
- Location
- Program areas
- Registrations and funding

Onboarding can keep steps if needed, but edit mode should never look like a wizard.

### Section Copy

Applicant section:

- "Applicant type"
- "Organization name" only when applicable
- Helper if individual applicant hides organization fields:
  - "Organization fields are hidden for individual applicants."

Location section:

- Rename "Location and mission" -> "Applicant location"
- Helper:
  - "Use the applicant's primary location. Project service areas can be handled separately later."

Mission field:

Current:

> Mission or project focus

Replace:

> Brief description of applicant work

Helper:

> One or two sentences about the work this applicant does.

Better placeholder:

> Example: Provides after-school STEM programs for middle-school students in San Luis Obispo County.

Program section:

Current:

> Program fit

Replace:

> Program areas

Subsections:

- Focus areas
- Populations served
- Project types

Registrations section:

Current:

> Operational capacity

Replace:

> Registrations and funding

Label changes:

- "Fiscal sponsor available" -> "Has fiscal sponsor"
- "EIN available" -> "Has an EIN"
- "SAM registration available" -> "Has SAM.gov registration"
- "UEI available" -> "Has a UEI"
- "Can provide matching funds" stays acceptable
- "Minimum useful award" -> "Minimum award amount to consider"

### Visual System Changes

Profile page should become denser and sharper:

- reduce section padding
- darken borders on inputs
- increase input focus visibility
- reduce checkbox row height
- avoid full-row teal fill for every selected checkbox
- use white/slate contrast instead of cream-on-white softness
- add stronger panel containment

Checkboxes:

Current problem: selected rows are large teal slabs.

Preferred:

- compact rows
- checkbox/check icon carries selected state
- subtle selected border/background
- 2 columns at medium width, 3 columns at large width
- selected count in group header if useful

### Save Behavior

Add a sticky save control:

Option A: sticky bottom bar:

```txt
Profile changes stay local until saved.                 Save profile
```

Option B: sticky page toolbar:

```txt
Applicant profile                         Saved / Unsaved     Save profile
```

Preferred: sticky bottom bar on profile edit, because users may be far down the form.

### Phase 2 Acceptance Criteria

- `/profile` no longer uses Step labels in edit mode.
- Header copy no longer says "deterministic matching."
- Form reads as a settings page, not a landing-page form.
- Inputs have clear affordance and focus states.
- Checkbox groups are compact and scannable.
- Save action is visible without scrolling to the bottom.
- Required vs optional fields are clearer.

## Phase 3: Data Views

Status: **BLOCKED PENDING BACKEND**

Do not do the full Matrix or Grant Detail redesign until the backend data schema and OpenAI prompt/refactor are stable. The matrix depends on source grouping, source names, better conflict handling, reason codes, and improved extracted requirement shape.

Low-risk copy fixes may happen earlier, but table structure should wait.

### Why Blocked

The Matrix currently displays raw backend symptoms:

- one-file-to-one-grant duplicate rows
- raw matcher sentences
- raw array counts
- extracted JSON categories
- no source count relationship
- no source provenance beside reasons
- missing edit/delete/re-run actions

If we restyle this now, we polish the wrong abstraction.

### Required Backend/View-Model Prerequisites

Before Matrix redesign:

1. One grant opportunity can have many source documents.
2. Each requirement includes source name and source quote.
3. Match results include structured reason codes, not only prose.
4. Negative constraints preserve concrete values.
5. Source failures are stored separately from total grant failure.
6. Matrix has a view model layer, not direct Prisma/JSON display.

Suggested view model:

```ts
type GrantReviewRowViewModel = {
  id: string;
  opportunityName: string;
  funderLabel: string | null;
  sourceSummary: string;
  fitRating: "likely_fit" | "review_needed" | "likely_conflict" | "analysis_failed";
  fitLabel: string;
  fitHelpText: string;
  primarySummary: string;
  deadlineLabel: string | null;
  awardLabel: string | null;
  sourceHealthLabel: string | null;
  warnings: string[];
  actions: Array<"open" | "rename" | "reanalyze" | "delete">;
};
```

### Matrix: New Default Columns

The current table has 12 columns. That is too many.

Current columns to remove from default view:

- Extraction Confidence
- Hard Requirements raw count
- Needs Review raw count
- separate Funder column
- separate Award Amount column if space is tight

Recommended default table:

1. **Opportunity**
   - grant name bold
   - funder below in muted text
   - source count below: `3 sources: 2 files, 1 pasted text`
2. **Fit**
   - fit rating chip
   - not "High Match / Low Match" if that overclaims
3. **Why**
   - short user-facing reason
   - no normalization/debug language
4. **Grant details**
   - deadline
   - award amount
5. **Sources**
   - source health, e.g. `3 readable`, `1 unreadable`
6. **Actions**
   - Open
   - overflow menu: Rename, Re-run analysis, Delete

Alternative tighter version:

1. Opportunity
2. Fit
3. Key issue
4. Details
5. Actions

### Matrix: Tooltip Policy

Do **not** put a `?` tooltip on every column. That creates clutter and admits the labels are bad.

Use tooltips only for concepts that remain inherently complex:

- Fit rating
- Source health
- Review needed, if kept

Avoid tooltip-dependent columns like "Hard Requirements." If a column requires a paragraph to understand, rename or remove it.

Example tooltip copy:

- Fit rating:
  - "A first-pass signal based on extracted requirements and your applicant profile. Not an official eligibility decision."
- Review needed:
  - "ClearGrant found a requirement that needs a human read, usually because the source was unclear or could not be compared safely."
- Source health:
  - "Shows whether ClearGrant could read the source documents attached to this opportunity."

### Matrix: Missing-Value Policy

Current problem:

The table repeats "Not stated" everywhere, which makes the UI look broken.

Policy:

- In table cells, missing values display as a muted em dash: `—`
- In detail pages, use contextual language:
  - "No deadline found in sources."
  - "No award amount found in sources."
  - "No funder found in sources."

Do not use:

- "Not stated"
- "Not available"
- empty string
- "Uploaded document" as a fallback title

### Matrix: Expand Behavior

Current problem:

Clicking Expand duplicates the same sentence below the clipped sentence and provides no obvious Collapse affordance.

Fix:

Option A: remove inline expand and use a row detail drawer.

Option B: keep disclosure but:

- closed state shows only clipped excerpt
- open state replaces excerpt with full text
- toggle text changes to "Show less"
- add chevron icon
- do not duplicate the sentence

Preferred: row detail drawer after backend/view-model stabilization.

### Matrix: Raw Counts

Current problem:

Columns like "Hard Requirements" and "Needs Review" show numbers like `5` and `2`. These are hostile without context.

Do not show raw counts by default.

If retained in a detail drawer:

- "5 requirements found"
- "2 unclear rules"
- "1 likely conflict"

If shown in the table, use chips:

```txt
2 conflicts
1 unclear
```

Never show a bare number.

### Matrix: Location and Legal

Current problem:

"Location / Legal" is ambiguous. Location could mean applicant location, project location, service area, excluded countries, or funder jurisdiction. Legal could mean legal entity type, tax status, legal standing, or registration.

Do not keep this as one column.

Options:

1. Remove it from default table and show it in details.
2. Replace with clearer fields in detail view:
   - Applicant location rules
   - Project/service area rules
   - Entity type / tax status
   - Required registrations

If a location rule is negative, render it explicitly:

```txt
Excluded locations: Country A, Country B
```

If specific values cannot be extracted:

```txt
Location restriction found. Open source quote.
```

Do not render:

```txt
not based in certain countries
```

### Matrix: Applicant Requirement

Current problem:

"Applicant Requirement" is vague and often prints values like "Nonprofit" or "registered nonprofit organizations" without context.

Preferred:

- remove from default table, or
- rename to "Who can apply"

Detail page should show structured values:

```txt
Who can apply
- Eligible: registered nonprofit organizations
- Source: Appendix A, page/source name
```

### Matrix: Row Actions

Required actions:

- Open
- Rename
- Re-run analysis
- Delete

Delete must include a confirmation modal:

```txt
Delete this grant review?
This removes the opportunity, source documents, extracted requirements, and fit results from your account.
[Cancel] [Delete]
```

Rename should support bad AI-generated names.

Re-run analysis should be available after profile/source changes.

### Grant Detail Page: New Structure

The grant detail page should be **more detailed than the matrix**, not just a larger version of the same vague data.

Recommended sections:

1. **Header**
   - grant opportunity name
   - fit rating
   - funder
   - last analyzed date
   - actions: Rename, Re-run analysis, Delete

2. **Fit summary**
   - plain-language reason
   - likely conflicts
   - review-needed items
   - passed checks

3. **Source documents**
   - uploaded PDF/DOCX/TXT files
   - pasted text entries
   - source URL
   - open/download action
   - unreadable-source warnings

4. **Requirements**
   - organized by user meaning, not backend category:
     - Who can apply
     - Location rules
     - Entity type / tax status
     - Registrations
     - Funding/match rules
     - Required documents
     - Ongoing requirements

5. **Source conflicts**
   - only shown when conflicts exist
   - cite both source names

6. **Developer details**
   - collapsed raw JSON
   - analysis revision history

### Detail Page: Requirement Display

Example:

```txt
Who can apply

Eligible applicant types
- Registered nonprofit organizations
- Public agencies

Source
Appendix D - Scoring Factors.pdf
"Eligible applicants include registered nonprofit organizations..."
```

Location example:

```txt
Location rules

Applicant location
- Must be based in California

Project/service area
- Must serve San Luis Obispo County

Excluded locations
- Not available
```

If unknown:

```txt
No location rule found in sources.
```

Do not use:

```txt
Location: not based in certain countries
```

### Phase 3 Acceptance Criteria

- Matrix no longer has 12 default columns.
- Matrix no longer shows raw `Hard Requirements`, raw `Needs Review`, or `Extraction Confidence` columns.
- Missing values use `—` in table cells.
- Grant name and funder are combined.
- Deadline and award are combined.
- Rows have clear open/edit/delete/re-run affordances.
- Expand behavior is removed or fixed.
- Detail page shows source documents.
- Detail page shows requirements in organized user-facing sections.
- Source names appear beside source quotes.
- Backend/debug strings never appear as primary user copy.

## Execution Order

1. Phase 1: global copy/nav cleanup.
2. Phase 2: profile/settings overhaul.
3. Backend/source schema and OpenAI prompt stabilization.
4. Build matrix/detail view models.
5. Phase 3: matrix and detail redesign.

Do not start Phase 3 before step 3 is complete.

