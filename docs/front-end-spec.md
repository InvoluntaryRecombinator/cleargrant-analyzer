# ClearGrant Analyzer Front-End Spec

## App Style

Desktop-first SaaS dashboard. Clean, practical, data-heavy. Avoid playful or marketing-heavy UI. The app should feel like a lightweight internal analysis tool.

## Global Layout

Top navigation:
- Home
- Upload Grants
- Matrix Dashboard
- Manage Profile
- Logout

Authenticated pages use a shared dashboard shell.

## Core Views

### Home

Purpose:
- Explain what the app does.
- Direct user to onboarding/profile if profile is missing.
- Direct user to upload if profile exists.

### Onboarding / Manage Profile

Purpose:
- Create and edit applicant profile.

UX:
- Branching form.
- Start with applicant type.
- Show conditional questions based on applicant type.
- Use selects/checkboxes where possible.
- Use textareas only for mission/focus descriptions.

### Upload Grants

Purpose:
- Upload 1–10 PDF/DOCX/TXT files.

UX:
- Drag-and-drop zone.
- File queue.
- Analyze button.
- Processing/loading state.
- Error state per file.

### Matrix Dashboard

Purpose:
- Main product view.
- Compare analyzed grants.

UX:
- Wide scrollable table.
- Each row is clickable.
- Match label is visually prominent.
- Primary reason appears near the match label.
- No CRM status column.

Default columns:
- Grant Name
- Match Label
- Primary Reason
- Funder
- Deadline
- Award Amount
- Applicant Requirement
- Location Requirement
- Legal/Tax Requirement
- Hard Requirements Count
- Needs Review Count
- Extraction Confidence
- Actions

### Grant Detail View

Purpose:
- Show one grant’s extracted information in a readable format.

Sections:
- Summary
- Match Result
- Applicant Eligibility
- Location Eligibility
- Required Registrations
- Funding Constraints
- Required Documents
- Ongoing Requirements
- Other Hard Requirements
- Raw JSON