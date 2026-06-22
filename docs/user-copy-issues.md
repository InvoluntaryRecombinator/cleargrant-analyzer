# ClearGrant Copy and UI Language Audit

## Purpose

ClearGrant is a utility app for uploading grant opportunity source material, extracting eligibility requirements, comparing them to an applicant profile, and reviewing the result. The UI should feel like a precise work tool: clear labels, low ceremony, no internal implementation language, and no unexplained analysis jargon.

Current broad problem: the app frequently speaks in internal model terms such as `evidence`, `dossier`, `matrix`, `extraction`, `queue`, `staging area`, and `bucket`. Users are trying to add documents, name a grant opportunity, run analysis, and review results. The product should use those task words first.

## Preferred Vocabulary

Use these terms across the app:

| Current term | Prefer |
| --- | --- |
| Evidence | Source documents, source text, uploaded files |
| Dossier | Grant opportunity, grant record, opportunity file |
| Dropzone | Upload files |
| Staging area | Added sources, documents to analyze |
| Evidence queue | Sources to analyze |
| Display name | Document name |
| Stored as | Saved privately, Source type |
| Extraction | Analysis, extracted requirements when technical detail is needed |
| Matrix | Comparison table, eligibility table |
| Hard no / hard requirements | Blocking requirements, likely conflicts |
| Raw JSON | Developer data, extracted JSON, hide by default |
| Needs Review | Needs a closer read, review needed, unclear source |
| High Match / Low Match | Likely fit / likely conflict, no obvious conflicts / conflicts found |
| Extraction Confidence | Source quality, analysis confidence, hide from default table |

## Egregious UI Issues

1. **Upload page is visually bloated**
   - Issue: each added document occupies too much vertical space and repeats labels that do not help the user scan.
   - Option A: make each source a compact row with icon, editable name, type/size, source URL if relevant, and remove action.
   - Option B: use a two-column layout with a compact "Sources to analyze" list on the right and the upload/paste controls on the left.

2. **Cream/off-white is overused**
   - Issue: `#faf8f3`, `#fffdf8`, and cream panel headers make the app feel muddy and reduce contrast between important zones.
   - Option A: use white panels on a cool slate background, with teal only for actions/status.
   - Option B: keep the warm page background but make data surfaces white/slate and reserve cream for empty states only.

3. **Panel headers look decorative instead of useful**
   - Issue: many panels have the same cream gradient header regardless of importance.
   - Option A: make primary workflow sections use slate/white headers with stronger typography and clear counts.
   - Option B: remove most panel headers and use compact section labels above the controls.

4. **Top page headers waste prime workspace**
   - Issue: dashboard, matrix, and detail pages spend the best real estate on generic page title copy instead of controls and status.
   - Option A: compress headers into a single toolbar row with page title, primary action, and filters.
   - Option B: keep page titles but move explanatory copy into tooltips/help text.

5. **Primary actions repeat in too many places**
   - Issue: "Upload grants" appears in header navigation and page headers, making the screen feel like a marketing page.
   - Option A: keep primary action in the page toolbar only where useful.
   - Option B: make nav purely navigational and reserve filled buttons for the current page's next action.

6. **Added document cards do not look obviously editable**
   - Issue: "Display name" inputs blend into static content and read as accidental form fields.
   - Option A: show document name as text with a pencil/edit icon.
   - Option B: keep inputs, but label the section "Rename source" and use tighter row styling.

7. **Upload error exposes backend storage**
   - Issue: "Evidence storage is unavailable. Confirm the private grant-evidence bucket exists." is not actionable for normal users.
   - Option A: "Files could not be saved. Try again or contact support."
   - Option B: "Upload storage is not configured. Admin setup required."

8. **Individual grant page fetches uploaded documents but does not show them**
   - Issue: users expect to reopen PDFs/TXT sources from the grant page.
   - Option A: add a "Source documents" section with file rows and open/download actions.
   - Option B: add a right-side source drawer with original file names, pasted text, and source URL.

9. **Raw JSON is exposed as a main user section**
   - Issue: this is useful for developers but noisy for grant reviewers.
   - Option A: hide it behind "Developer details."
   - Option B: replace it with a structured "Extracted data" view and put JSON behind a small secondary action.

10. **Matrix table columns are too implementation-heavy**
    - Issue: "Primary Reason," "Hard Requirements," and "Extraction Confidence" are internal analysis labels.
    - Option A: use "Why this rating," "Likely conflicts," and "Analysis confidence."
    - Option B: use "Summary," "Conflicts," and "Source quality."

## Page-by-Page Copy Issues and Rewrite Options

### Landing Page (`app/page.tsx`)

11. **Headline: "Eligibility triage for grant documents."**
    - Issue: accurate but cold; "documents" is the object, not the user job.
    - Option A: "Check grant fit before you apply."
    - Option B: "Find eligibility issues in grant opportunities."

12. **Body: "Upload grant requirements..."**
    - Issue: users upload documents, not requirements.
    - Option A: "Upload grant guidelines, extract eligibility requirements, and compare them to your applicant profile before committing to an application."
    - Option B: "Add a grant notice or guideline document and see whether the opportunity fits your organization."

13. **CTA: "Create workspace"**
    - Issue: workspace is abstract for a single-user utility.
    - Option A: "Create account"
    - Option B: "Start checking grants"

14. **Panel title: "First-pass review"**
    - Issue: reasonable but vague.
    - Option A: "What ClearGrant checks"
    - Option B: "Fast eligibility review"

15. **Panel body: "Built for fast disqualification checks..."**
    - Issue: "disqualification" sounds punitive.
    - Option A: "Built to catch obvious fit issues before you spend time on an application."
    - Option B: "Designed for early eligibility review, not grant tracking."

16. **Mini-step: "Profile"**
    - Issue: too generic.
    - Option A: "Applicant profile"
    - Option B: "Your eligibility baseline"

17. **Mini-step: "Extraction"**
    - Issue: technical/internal.
    - Option A: "Requirement review"
    - Option B: "Eligibility details"

18. **Mini-step: "Matrix"**
    - Issue: product jargon unless the user already knows the app.
    - Option A: "Comparison table"
    - Option B: "Grant fit table"

### Auth Pages (`login`, `signup`, `AuthForm`)

19. **"Log in to your workspace"**
    - Issue: workspace is fine for SaaS, but not specific.
    - Option A: "Log in to ClearGrant"
    - Option B: "Open your grant review workspace"

20. **"Access your applicant profile and eligibility triage workspace."**
    - Issue: repeats "workspace" and "triage."
    - Option A: "Review saved grant analyses and update your applicant profile."
    - Option B: "Continue reviewing grant opportunities against your profile."

21. **"Create your workspace"**
    - Issue: again too abstract.
    - Option A: "Create your ClearGrant account"
    - Option B: "Start your grant review workspace"

22. **"Set up a private triage workspace..."**
    - Issue: "triage workspace" is internal positioning, not user language.
    - Option A: "Create a private place to review grant documents against your profile."
    - Option B: "Save your profile and analyze grant opportunities privately."

23. **Button pending state: "Working..."**
    - Issue: vague.
    - Option A: "Signing in..."
    - Option B: "Creating account..." depending on page context.

24. **"New workspace?"**
    - Issue: unnatural phrasing.
    - Option A: "New to ClearGrant?"
    - Option B: "Need an account?"

### Navigation and Shell

25. **Nav label: "Upload Grants"**
    - Issue: with grouped intake, users are creating an opportunity and adding sources, not uploading multiple grant records.
    - Option A: "Add grant"
    - Option B: "New opportunity"

26. **Nav label: "Matrix"**
    - Issue: acceptable for internal shorthand but not self-explanatory.
    - Option A: "Compare"
    - Option B: "Grant table"

27. **Brand sublabel: "Analyzer"**
    - Issue: harmless but generic; could be more product-specific.
    - Option A: remove the sublabel and let "ClearGrant" stand alone.
    - Option B: "Eligibility review"

28. **"Logout"**
    - Issue: fine, but app uses "Log in" elsewhere.
    - Option A: "Log out"
    - Option B: icon + "Sign out"

### Dashboard Home

29. **Eyebrow: "Workspace home"**
    - Issue: not useful; user already knows they are home.
    - Option A: "Overview"
    - Option B: "Grant review"

30. **Title: "Ready to triage grants"**
    - Issue: sounds like a system state, not a useful dashboard title.
    - Option A: "Your grant review dashboard"
    - Option B: "Review grant opportunities"

31. **Description: "which opportunities deserve a closer read"**
    - Issue: good idea, but buried under generic language.
    - Option A: "See which opportunities look promising, which need review, and which have likely conflicts."
    - Option B: "Use extracted requirements to decide what to read next."

32. **Top buttons: "Manage profile" and "Upload grants"**
    - Issue: duplicates nav and pulls focus from dashboard status.
    - Option A: keep only "Add grant opportunity."
    - Option B: move profile link into a smaller profile completeness card.

33. **Metric: "Applicant type" as first card**
    - Issue: applicant type is static profile data, not dashboard performance.
    - Option A: "Profile baseline" with compact applicant/location detail.
    - Option B: move profile data to a small sidebar or header badge.

34. **Metric: "Documents analyzed"**
    - Issue: the product is moving from document rows to grant opportunity rows.
    - Option A: "Opportunities analyzed"
    - Option B: "Grant reviews completed"

35. **Metric note: "{grants.length} total uploaded"**
    - Issue: after grouped intake this count may mean opportunities, not files.
    - Option A: "{count} total opportunities"
    - Option B: "{count} grant records saved"

36. **Metric: "Extraction issues"**
    - Issue: user cannot fix "extraction"; they can replace source files.
    - Option A: "Unreadable sources"
    - Option B: "Files to replace"

37. **Panel: "Workflow" / "Triage path"**
    - Issue: feels like a process diagram sitting in the middle of a product dashboard.
    - Option A: "Next steps"
    - Option B: remove this panel and rely on nav plus empty states.

38. **Workflow item: "Refine"**
    - Issue: unclear without reading description.
    - Option A: "Update profile"
    - Option B: "Check profile"

39. **Recent activity title: "Latest documents"**
    - Issue: the record is now a grant opportunity, not a document.
    - Option A: "Recent grant reviews"
    - Option B: "Latest opportunities"

40. **Empty state: "No grant documents yet"**
    - Issue: outdated for grouped intake.
    - Option A: "No grant opportunities yet"
    - Option B: "No analyses yet"

### Upload / Intake Page

41. **Page eyebrow: "Upload Grants"**
    - Issue: users upload documents, not grants.
    - Option A: "New grant opportunity"
    - Option B: "Add source materials"

42. **Title: "Create a grant dossier"**
    - Issue: "dossier" feels ornate and unclear for a utility app.
    - Option A: "Add a grant opportunity"
    - Option B: "Create a grant review"

43. **Description: "stage multiple files..."**
    - Issue: "stage" is implementation language.
    - Option A: "Name the opportunity, add files or pasted text, then run one analysis."
    - Option B: "Add all source materials for one opportunity before analyzing."

44. **Panel eyebrow: "New opportunity"**
    - Issue: good direction; could be enough without "Dossier setup."
    - Option A: keep "New opportunity" and title "Name this grant."
    - Option B: use "Grant details" and title "Opportunity name."

45. **Title: "Dossier setup"**
    - Issue: unclear and conflicts with utility tone.
    - Option A: "Grant details"
    - Option B: "Name the opportunity"

46. **Badge: "Create only"**
    - Issue: unclear; does it mean not editing, not submitting, not analyzing?
    - Option A: remove it.
    - Option B: replace with "New review."

47. **Label: "Opportunity Name"**
    - Issue: capitalization inconsistent; okay conceptually.
    - Option A: "Grant opportunity name"
    - Option B: "Name this grant"

48. **Placeholder: "California Dream Fund"**
    - Issue: placeholder looks like real data and does not guide structure.
    - Option A: "Example: 2025 California Tech Grant"
    - Option B: "Enter the name you want to see in the table"

49. **Eyebrow: "File evidence"**
    - Issue: evidence is not a user-facing term here.
    - Option A: "Upload files"
    - Option B: "Source documents"

50. **Title: "Dropzone"**
    - Issue: developer/UI component term.
    - Option A: "Add files"
    - Option B: "Upload documents"

51. **Drop text: "Drop PDF, DOCX, or TXT files"**
    - Issue: okay, but could be more task-oriented.
    - Option A: "Drop files here or click to upload"
    - Option B: "Add grant guidelines, notices, or attachments"

52. **Helper: "Original files are saved into the private evidence bucket."**
    - Issue: exposes storage implementation and uses evidence/bucket terminology.
    - Option A: "Original files are saved privately."
    - Option B: "We keep the original file with this grant record."

53. **Eyebrow: "Pasted evidence"**
    - Issue: same evidence problem.
    - Option A: "Paste text"
    - Option B: "Source text"

54. **Title: "Text shoebox"**
    - Issue: deeply unclear; sounds casual and not useful.
    - Option A: "Add pasted text"
    - Option B: "Paste source text"

55. **Label: "Optional source URL"**
    - Issue: good, but should explain what it attaches to.
    - Option A: "Source URL (optional)"
    - Option B: "Link to the source page"

56. **Placeholder: `https://funder.org/grants/guidelines`**
    - Issue: okay as URL example, but generic.
    - Option A: "https://example.org/grant-guidelines"
    - Option B: "Paste the page URL, if you have one"

57. **Label: "Source text"**
    - Issue: good, but help text can be tighter.
    - Option A: "Text to analyze"
    - Option B: "Paste text from the grant page"

58. **Placeholder: "Paste eligibility guidelines, FAQ copy, or notes..."**
    - Issue: "FAQ copy" and notes are slightly informal/mixed.
    - Option A: "Paste guidelines, eligibility rules, or funder instructions."
    - Option B: "Paste text from a grant notice, FAQ, or funder page."

59. **Button: "Add Text to Queue"**
    - Issue: queue is internal; capitalization inconsistent.
    - Option A: "Add text"
    - Option B: "Add to sources"

60. **Eyebrow: "Staging area"**
    - Issue: internal workflow term.
    - Option A: "Added sources"
    - Option B: "Ready to analyze"

61. **Title: "Evidence queue"**
    - Issue: combines two internal terms.
    - Option A: "Sources to analyze"
    - Option B: "Documents and text"

62. **Empty state: "Add files or pasted source text before analyzing this opportunity."**
    - Issue: generally good; can be simpler.
    - Option A: "Add at least one file or pasted text source."
    - Option B: "Add the documents or text you want analyzed."

63. **Queue item label: "Display name"**
    - Issue: sounds like a database/display field.
    - Option A: "Document name"
    - Option B: "Name in this grant"

64. **Source line: "Source 1: filename · size"**
    - Issue: "Source" is okay but may be too abstract.
    - Option A: "File 1: filename · size"
    - Option B: "Added file: filename · size"

65. **File metadata label: "Stored as"**
    - Issue: unclear and points at implementation.
    - Option A: "Saved privately"
    - Option B: "Source type"

66. **File metadata value: "Private file evidence"**
    - Issue: confusing and unnatural.
    - Option A: "Original file saved"
    - Option B: "Uploaded file"

67. **Analyze button: "Analyze new opportunity"**
    - Issue: good but could be shorter.
    - Option A: "Analyze opportunity"
    - Option B: "Run analysis"

68. **Message: "Paste source text before adding it to the queue."**
    - Issue: queue term again.
    - Option A: "Paste text before adding it."
    - Option B: "Add text in the box first."

69. **Message: "Only 10 files can be queued."**
    - Issue: queue term and passive.
    - Option A: "You can add up to 10 files."
    - Option B: "Remove a file before adding another."

70. **Message: "Only 10 pasted text snippets can be queued."**
    - Issue: verbose and queue-based.
    - Option A: "You can add up to 10 pasted text entries."
    - Option B: "Remove a text source before adding another."

71. **Backend validation: "Combined evidence exceeds..."**
    - Issue: user did not add evidence; they added source material.
    - Option A: "The combined source text is too long to analyze at once."
    - Option B: "This grant has too much text for one analysis. Remove or shorten a source."

72. **Backend save error: "Unable to save the grant dossier."**
    - Issue: dossier again; not actionable.
    - Option A: "Unable to save this grant opportunity."
    - Option B: "We could not save the grant review. Try again."

### Matrix / Comparison Page

73. **Eyebrow: "Matrix Dashboard"**
    - Issue: redundant and jargon-heavy.
    - Option A: "Compare"
    - Option B: "Grant reviews"

74. **Title: "Grant eligibility matrix"**
    - Issue: acceptable but a little heavy.
    - Option A: "Grant comparison table"
    - Option B: "Eligibility comparison"

75. **Description: "deterministic triage signals..."**
    - Issue: too technical for the main page.
    - Option A: "Ratings are a first-pass guide, not an official eligibility decision."
    - Option B: "Use these ratings to decide what needs a closer read."

76. **Metric: "High match"**
    - Issue: okay, but "match" can overclaim.
    - Option A: "Strong fit"
    - Option B: "Likely fit"

77. **Metric note: "Strong first-pass fit"**
    - Issue: good but can be cleaner.
    - Option A: "No obvious conflicts found"
    - Option B: "Looks promising based on extracted rules"

78. **Metric note: "Ambiguous or incomplete evidence"**
    - Issue: evidence term again.
    - Option A: "Missing or unclear source details"
    - Option B: "Needs a human read"

79. **Metric: "Extraction failed"**
    - Issue: internal technical state.
    - Option A: "Unreadable sources"
    - Option B: "Analysis failed"

80. **Panel eyebrow: "Portfolio"**
    - Issue: sounds like a grant CRM/tracker, which the product is not.
    - Option A: "Saved reviews"
    - Option B: "Grant opportunities"

81. **Panel title: "Analyzed grants"**
    - Issue: after grouped intake, each row is an opportunity analysis.
    - Option A: "Analyzed opportunities"
    - Option B: "Grant reviews"

82. **Count: "{grants.length} documents"**
    - Issue: wrong abstraction once multiple documents feed one grant.
    - Option A: "{count} opportunities"
    - Option B: "{count} grant reviews"

83. **Column: "Grant Name"**
    - Issue: okay, but "Opportunity" may be clearer.
    - Option A: "Grant opportunity"
    - Option B: "Name"

84. **Column: "Match Label"**
    - Issue: internal label.
    - Option A: "Fit"
    - Option B: "Review status"

85. **Column: "Primary Reason"**
    - Issue: awkward.
    - Option A: "Why"
    - Option B: "Reason"

86. **Column: "Applicant Requirement"**
    - Issue: could mean requirement of the user rather than grant.
    - Option A: "Eligible applicants"
    - Option B: "Applicant rules"

87. **Column: "Location / Legal"**
    - Issue: crams two concepts into one.
    - Option A: "Location and status"
    - Option B: split into "Location" and "Legal/tax status."

88. **Column: "Hard Requirements"**
    - Issue: "hard" is jargon and may sound definitive.
    - Option A: "Blocking rules"
    - Option B: "Likely conflicts"

89. **Column: "Extraction Confidence"**
    - Issue: useful but technical.
    - Option A: "Analysis confidence"
    - Option B: "Source confidence"

90. **Expandable text link: "Expand"**
    - Issue: generic; not clear what expands.
    - Option A: "Show full reason"
    - Option B: "Read more"

91. **Empty table: "Upload grant documents to populate the matrix."**
    - Issue: old model and matrix jargon.
    - Option A: "Add a grant opportunity to start comparing results."
    - Option B: "Run your first analysis to fill this table."

### Grant Detail Page

92. **Eyebrow: "Grant Detail"**
    - Issue: generic and title case inconsistent.
    - Option A: "Grant review"
    - Option B: "Opportunity details"

93. **Description: "triage evidence"**
    - Issue: evidence again; sounds legalistic.
    - Option A: "Extracted requirements are shown with source quotes. This is a review aid, not an official eligibility decision."
    - Option B: "Review the requirements ClearGrant found and the source text behind each one."

94. **Card label: "Match label"**
    - Issue: internal.
    - Option A: "Fit rating"
    - Option B: "Review result"

95. **Card label: "Extraction"**
    - Issue: too technical.
    - Option A: "Analysis confidence"
    - Option B: "Source quality"

96. **Failure heading: "Document could not be analyzed"**
    - Issue: if one grant has multiple sources, this may be inaccurate.
    - Option A: "This grant could not be analyzed"
    - Option B: "No readable source text found"

97. **Failure text: "Upload a clearer file or a text-based copy..."**
    - Issue: good intent, but should mention multiple sources.
    - Option A: "Add a readable PDF, DOCX, TXT, or pasted text source and run analysis again."
    - Option B: "Replace the unreadable source or paste the grant text directly."

98. **Section: "Match Result"**
    - Issue: title case and internal word.
    - Option A: "Fit summary"
    - Option B: "Why this rating"

99. **Fallback: "No match result saved."**
    - Issue: database-oriented.
    - Option A: "No fit summary is available yet."
    - Option B: "This review has not finished."

100. **Requirement group: "Other Hard Requirements"**
    - Issue: "hard" overclaims.
    - Option A: "Other blocking requirements"
    - Option B: "Other required conditions"

101. **Requirement group: "Other Eligibility Notes"**
    - Issue: okay, but vague.
    - Option A: "Other eligibility notes"
    - Option B: "Additional notes"

102. **Source quotes shown without source document context**
    - Issue: after grouped intake, users need to know which file/text each quote came from.
    - Option A: show source document name next to every quote.
    - Option B: group requirements by source first, then category.

103. **Missing "Source documents" section**
    - Issue: user cannot inspect uploaded PDFs/TXT from the grant page even though the backend stores them.
    - Option A: add "Source documents" above analysis, with file open/download and pasted text preview.
    - Option B: add a collapsible source list beside the extracted requirements.

### Profile / Onboarding

104. **Onboarding eyebrow: "Onboarding"**
    - Issue: software process word, not user task.
    - Option A: "Applicant profile"
    - Option B: "Before you analyze"

105. **Title: "Build your applicant profile"**
    - Issue: good, but "build" may feel heavy.
    - Option A: "Set up your applicant profile"
    - Option B: "Tell us who is applying"

106. **Description: "comparison baseline..."**
    - Issue: baseline is technical.
    - Option A: "ClearGrant compares each opportunity against these details."
    - Option B: "These answers help flag eligibility conflicts in grant documents."

107. **Profile page eyebrow: "Manage Profile"**
    - Issue: title case inconsistent.
    - Option A: "Profile"
    - Option B: "Applicant profile"

108. **Profile description: "deterministic matching..."**
    - Issue: too technical.
    - Option A: "Keep this current so grant reviews use the right applicant details."
    - Option B: "ClearGrant uses these details when checking grant requirements."

109. **Step labels: "Step 1" through "Step 4"**
    - Issue: okay for onboarding, but unnecessary in edit mode.
    - Option A: hide step labels in edit mode.
    - Option B: replace with section numbers only in onboarding.

110. **Section: "Program fit"**
    - Issue: okay but slightly abstract.
    - Option A: "Program areas"
    - Option B: "What you fund or deliver"

111. **Section: "Operational capacity"**
    - Issue: jargon-heavy.
    - Option A: "Registrations and funding requirements"
    - Option B: "Documents and funding readiness"

112. **Label: "Minimum useful award"**
    - Issue: unclear; user may not know useful for what.
    - Option A: "Minimum award worth pursuing"
    - Option B: "Smallest grant amount to consider"

113. **Checkbox: "EIN available"**
    - Issue: okay for nonprofits but terse.
    - Option A: "Has an EIN"
    - Option B: "EIN is available"

114. **Checkbox: "UEI available"**
    - Issue: may need expansion.
    - Option A: "Has a UEI"
    - Option B: "Unique Entity ID is available"

115. **Message: "Profile saved."**
    - Issue: fine but bare.
    - Option A: "Profile saved."
    - Option B: "Applicant profile updated."

### Error and System Messages

116. **Global error: "This page could not load."**
    - Issue: okay, but generic.
    - Option A: "We could not load this page."
    - Option B: "Something interrupted this page."

117. **Global error body: "Retry the page or return to your workspace."**
    - Issue: okay but workspace again.
    - Option A: "Try again, or go back to your dashboard."
    - Option B: "Refresh this view or return home."

118. **Dashboard error: "Retry the view or return to the matrix..."**
    - Issue: says uploaded docs/profile remain, but does not explain what happened.
    - Option A: "Try again. Your saved profile and grant reviews are not affected."
    - Option B: "Reload this page or return to your comparison table."

119. **Auth error surfaces Supabase messages directly**
    - Issue: raw provider messages can be inconsistent.
    - Option A: map common failures to "Email or password is incorrect."
    - Option B: show "We could not sign you in. Check your email and password."

120. **Storage setup error is shown to end users**
    - Issue: normal users cannot confirm a bucket exists.
    - Option A: show user-safe message and log technical message server-side.
    - Option B: gate the upload UI if storage is not configured and show admin setup instructions only in dev/admin mode.

## Matrix and Architecture Addendum

The matrix is currently trying to be a database viewer, an onboarding prompt, and an action center. That is why the page feels confusing even when individual strings are technically accurate. The table is displaying raw extraction/matcher concepts directly instead of using a product translation layer.

121. **"Needs Review" has no explanation**
     - Issue: users cannot tell whether the grant needs review, the source document needs review, or the AI failed.
     - Option A: rename to "Needs a closer read" and add a small legend explaining why.
     - Option B: keep "Needs review" but show a tooltip: "ClearGrant found unclear or unnormalized requirements."

122. **"Low Match" and "High Match" sound official**
     - Issue: match labels sound like a decision, despite the disclaimer.
     - Option A: rename to "Likely fit," "Possible fit," and "Likely conflict."
     - Option B: use neutral labels: "No obvious conflicts," "Review needed," "Conflicts found."

123. **No visible status legend**
     - Issue: status pills appear without definitions, so users must infer the system.
     - Option A: add a compact legend above the table.
     - Option B: add hover tooltips to each status pill.

124. **"Needs Review" is too broad for one bucket**
     - Issue: it can mean missing normalized values, ambiguity, source conflict, low confidence, or incomplete extraction.
     - Option A: split into reason-coded states such as "Unclear requirement," "Source conflict," and "Missing profile data."
     - Option B: keep one status but add a visible "Reason" chip beside it.

125. **Location column mixes applicant location and project location**
     - Issue: grants often distinguish where the applicant is located from where funds must be used.
     - Option A: split into "Applicant location" and "Project/service area."
     - Option B: label the combined column "Location rules" and show sublabels from the extracted requirement.

126. **"Legal" is ambiguous**
     - Issue: users may read it as legal standing, legal risk, legal structure, or tax status.
     - Option A: use "Entity type / tax status."
     - Option B: split into "Eligible entity types" and "Tax status."

127. **"Applicant Requirement" collides with varied source text**
     - Issue: the column may contain nonprofit, small business, fiscal sponsor, individual, or agency language.
     - Option A: rename to "Eligible applicants."
     - Option B: rename to "Who can apply."

128. **"Hard Requirements" as a number is meaningless**
     - Issue: a raw count like `5` does not say if those are conflicts, total extracted rules, or blocking conditions.
     - Option A: show "5 extracted rules" or "2 likely conflicts."
     - Option B: replace the number with chips for "Conflicts," "Unclear," and "Passed."

129. **"Extraction Confidence" is developer data**
     - Issue: `HIGH` and `NOT STATED` do not help the user decide what to do.
     - Option A: move it to a details drawer or developer section.
     - Option B: convert it to user language: "Source quality: Good / Limited / Poor."

130. **"NOT STATED" is overloaded**
     - Issue: it can mean the source did not say it, the AI missed it, or the field is not applicable.
     - Option A: use context-specific empty states such as "No deadline found."
     - Option B: add "Not found in sources" when the absence comes from extraction.

131. **Matrix identity is unclear**
     - Issue: if this is where grant opportunities live, "Matrix" undersells the page and sounds like an internal model.
     - Option A: rename the nav/page to "Grant reviews."
     - Option B: rename to "Compare grants" and use "matrix" only in help copy.

132. **Home and Matrix overlap**
     - Issue: Home has recent activity and workflow; Matrix has the actual records. Their roles are not distinct.
     - Option A: make Home a command center with search, recents, docs, and next actions.
     - Option B: remove Home from primary nav and make the grant table the logged-in landing page.

133. **The matrix lacks delete**
     - Issue: users cannot remove a mistaken or test grant from the table.
     - Option A: add row action `Delete` with a confirmation modal and cascade cleanup.
     - Option B: add an overflow menu with `Delete grant review`.

134. **The matrix lacks rename/edit**
     - Issue: AI-generated titles can be wrong, and users need control over the row name.
     - Option A: add inline rename from the row action menu.
     - Option B: add an editable title on the grant detail page.

135. **No "reanalyze" action**
     - Issue: after replacing documents or editing the profile, users need a clear way to refresh analysis.
     - Option A: add `Re-run analysis` on the detail page.
     - Option B: add a matrix row action for `Analyze again`.

136. **No row-level source count**
     - Issue: grouped intake means one row can have many source files/text entries, but the table still presents it like one document.
     - Option A: show "3 sources" under the grant name.
     - Option B: add a "Sources" column with count and failed-source warning.

137. **No visible failed-source warning at row level**
     - Issue: one source may fail while the overall grant analysis succeeds, but the matrix does not communicate that nuance.
     - Option A: show a small "1 source unreadable" chip.
     - Option B: show source health in the detail page summary and a row warning icon.

138. **Clickability is weak**
     - Issue: only the title and small Review button are obvious links; rows do not look navigable.
     - Option A: make the whole row clickable with a clear hover state and focus state.
     - Option B: keep explicit buttons but make the `Review` action more prominent and consistent.

139. **Hover state is too subtle**
     - Issue: slight grey/teal background change does not communicate action.
     - Option A: add stronger row highlight plus right-arrow affordance.
     - Option B: expose row actions on hover.

140. **"Expand" link is too small**
     - Issue: the important reason text is hidden behind a tiny link.
     - Option A: replace with a larger "Show full reason" button.
     - Option B: use a details drawer for the whole row.

141. **Horizontal scrolling is a design failure here**
     - Issue: the table uses a fixed `minWidth: 2020px`, which creates a clunky browser-default horizontal scroll.
     - Option A: reduce columns to a decision-first table and move details into expandable rows.
     - Option B: use a split table with sticky first column and row detail panel.

142. **Too many columns are shown at once**
     - Issue: the table tries to display summary, source metadata, eligibility, counts, confidence, and actions together.
     - Option A: default columns: opportunity, fit, why, deadline, award, actions.
     - Option B: add configurable columns later, but ship a compact default now.

143. **Cell/header alignment feels disconnected**
     - Issue: the hybrid open table/cell-border style makes it hard to associate dense text with headers.
     - Option A: use full table grid lines for dense data.
     - Option B: use card-like rows with labeled fields instead of traditional columns.

144. **Typography is monotonous**
     - Issue: names, reasons, subtitles, dates, and counts use similar weights/sizes, producing a wall of text.
     - Option A: create a hierarchy: name, status, reason excerpt, metadata.
     - Option B: use compact chips for categorical values and smaller muted metadata.

145. **Monospace dates and counts feel out of place**
     - Issue: monospace is useful for IDs/code, but dates and small counts look technical.
     - Option A: use normal UI font for dates.
     - Option B: reserve monospace only for raw values in developer/debug sections.

146. **Primary reason is a matcher implementation sentence**
     - Issue: text like "The extracted applicant_type requirement..." exposes internal category names.
     - Option A: add a presentation helper that rewrites matcher output into user-facing prose.
     - Option B: store structured reason codes and render them with human copy.

147. **Underscored categories leak into prose**
     - Issue: replacing underscores with spaces is not enough for terms like `applicant_type`.
     - Option A: create a category display map: "Applicant type," "Location," "Entity/tax status."
     - Option B: create a full requirement summary renderer per category.

148. **JSON schema bleed is the root matrix problem**
     - Issue: the UI prints extracted JSON concepts directly instead of translating them into task decisions.
     - Option A: add a `GrantReviewRowViewModel` builder between Prisma and UI.
     - Option B: add presentation utilities that convert extraction/match results into table-ready fields.

149. **No data confidence hierarchy**
     - Issue: source confidence, match confidence, and extraction status are mixed together.
     - Option A: define separate concepts: `fitRating`, `sourceQuality`, `analysisStatus`.
     - Option B: show only `fitRating` in the matrix and push the rest to details.

150. **Matrix is missing filters**
     - Issue: once a user has many grants, they need to find by fit/status/funder/deadline.
     - Option A: add filters for fit rating, analysis status, and deadline.
     - Option B: add search plus quick tabs: All, Likely fit, Needs review, Conflicts, Failed.

151. **Matrix is missing sorting**
     - Issue: no way to prioritize by deadline, fit, created date, or funder.
     - Option A: make Deadline, Fit, and Updated sortable.
     - Option B: add a sort dropdown above the table.

152. **No bulk cleanup path**
     - Issue: test uploads and bad analyses will accumulate.
     - Option A: add checkboxes and bulk delete later.
     - Option B: start with per-row delete and add bulk once table grows.

153. **No empty-state path for "failed analysis"**
     - Issue: failed rows show generic extraction failure but not a direct next action.
     - Option A: add "Replace sources" / "Add readable text" action.
     - Option B: link to the detail page source section with failed items expanded.

154. **Detail page does not show `sourceName` beside quotes**
     - Issue: the extraction schema now requires `sourceName`, but the UI only shows quote text.
     - Option A: show a source pill above every quote.
     - Option B: show source name and link/open action inline with quote.

155. **Detail page does not show match reason source provenance**
     - Issue: matcher reasons carry `sourceName`/`sourceQuote`, but the summary does not expose them.
     - Option A: show "Based on: {sourceName}" under the fit summary.
     - Option B: add a "Why this rating" section that lists conflict/review/pass items with source names.

156. **Requirement categories are too model-shaped**
     - Issue: categories like `funding_constraint` and `other_hard_requirement` map poorly to user scanning.
     - Option A: group as "Who can apply," "Where," "Registrations," "Funding rules," "Documents required."
     - Option B: keep current categories internally and render simpler section titles.

157. **No conflict-resolution UI**
     - Issue: backend prompt asks the model to log conflicting sources, but the UI has no first-class conflict display.
     - Option A: add a "Source conflicts" card on detail pages.
     - Option B: show conflicts as a special `Needs review` reason with both source names.

158. **No source-management model in UI**
     - Issue: backend supports `uploadedDocuments.isActive`, source order, source kind, and storage URLs, but the UI cannot manage them after creation.
     - Option A: add source list with remove/deactivate actions.
     - Option B: allow add/replace source, then rerun analysis.

159. **No distinction between uploaded `.txt` and pasted text in UI language**
     - Issue: both become text sources, but users may care whether it was a file or pasted page text.
     - Option A: label source kind as "Uploaded TXT" vs "Pasted text."
     - Option B: show icons and source metadata instead of naming both text.

160. **Home should become a command center, not a workflow tutorial**
     - Issue: the current dashboard workflow panel explains the app instead of helping repeat users work.
     - Option A: show recent reviews, profile completeness, storage/source warnings, and quick add.
     - Option B: add future sections for external opportunity search and saved help docs.

161. **Onboarding content should not leak into matrix**
     - Issue: matrix currently carries too much explanatory/onboarding burden.
     - Option A: move education into first-run empty states and help drawer.
     - Option B: keep table clean and add a "How ratings work" link.

162. **Action center duties should not live inside the table**
     - Issue: row actions, analysis status, and detailed reasoning need a consistent action model.
     - Option A: use row overflow menus for actions and detail page for deeper tasks.
     - Option B: add a side panel that opens from a selected row.

163. **No audit trail is visible**
     - Issue: backend has `ExtractionRevision`, but users cannot tell when analysis last ran or why it changed.
     - Option A: show "Last analyzed {date}" on detail and matrix rows.
     - Option B: add an "Analysis history" section on detail pages later.

164. **No source-count relationship in grant name subtitle**
     - Issue: `sourceFileName` may become "3 evidence items," which is awkward and user-hostile.
     - Option A: subtitle should be "3 sources: 2 files, 1 pasted text."
     - Option B: subtitle should show the most important source name plus "+2 more."

165. **Table should wait for schema/view-model stabilization**
     - Issue: styling the current table before the grouped-source data model settles risks polishing the wrong abstraction.
     - Option A: finish backend/source schema and then redesign around a view model.
     - Option B: implement only low-risk copy fixes now, leaving table layout until source and status semantics are stable.

## Egregious Data and Table Weirdness

This section is for symptoms that are worse than awkward copy. These are places where backend matching, extraction, or table structure produces information that looks broken to a user. These should be treated as product quality issues, not just wording issues.

166. **Normalization failure is shown as a user-facing reason**
     - Issue: "The requirement is explicit, but it was not normalized enough for deterministic comparison" exposes backend string-matching limitations and makes the user responsible for an internal failure.
     - Option A: never show this sentence; convert it to "ClearGrant found a requirement that needs a closer read."
     - Option B: add an internal reason code such as `unnormalized_requirement` and render user copy: "We found a requirement but could not compare it safely."

167. **Normalization failure can incorrectly produce "Needs Review"**
     - Issue: if the source says "Nonprofit" and the profile says "nonprofit organization," the app should not make the user manually resolve basic wording overlap.
     - Option A: strengthen deterministic normalization before assigning "Needs review."
     - Option B: run a second semantic comparison pass for common entity/location/tax status synonyms before surfacing ambiguity.

168. **The app core promise is damaged by matcher excuses**
     - Issue: users expect the app to compare requirements, not report that the comparison logic could not normalize text.
     - Option A: hide algorithm limitations and show the actual source requirement plus a clear next action.
     - Option B: classify these as "Review needed" internally, but explain the user-facing reason in plain language.

169. **Negative constraints are extracted without useful specifics**
     - Issue: "Location: not based in certain countries" tells the user nothing if the countries are not listed.
     - Option A: require extracted negative constraints to include the actual excluded countries/regions.
     - Option B: if the model cannot extract specifics, render "Restriction found; open source quote" instead of vague summary text.

170. **AI summaries can be too lossy**
     - Issue: summaries that omit the key noun or list make the table useless and force the user back into the PDF.
     - Option A: table summary fields should preserve named entities, amounts, dates, locations, and excluded groups.
     - Option B: use shorter table text only when a "show source quote" affordance is adjacent.

171. **Duplicate grant rows are a visible architecture smell**
     - Issue: old one-file-to-one-grant uploads create repeated rows such as the same program appearing multiple times with slightly different data.
     - Option A: grouped intake should merge all sources for one opportunity into one row.
     - Option B: add duplicate detection/migration later for legacy rows.

172. **Duplicate rows make trust worse**
     - Issue: users cannot tell which duplicate is canonical, newer, or more complete.
     - Option A: show "possible duplicate" warnings until legacy data is cleaned.
     - Option B: add a merge flow after the grouped-source model stabilizes.

173. **Legacy rows need a transition plan**
     - Issue: even if new uploads are grouped, existing duplicate records will remain in the table.
     - Option A: add a one-time migration or manual merge tool.
     - Option B: mark old single-file analyses as "legacy single-source review."

174. **Expand duplicates the same sentence**
     - Issue: current matrix `details` shows a clipped sentence, then opening it repeats the same sentence below. It feels broken rather than expanded.
     - Option A: closed state should show truncated text; open state should replace it with full text, not duplicate it.
     - Option B: use a row detail drawer instead of inline duplicated copy.

175. **No clear collapse affordance**
     - Issue: users can technically click the summary again, but the UI does not show "Collapse" or "Show less."
     - Option A: toggle the link between "Show full reason" and "Show less."
     - Option B: use a disclosure icon that rotates and a clear expanded state.

176. **Expandable content is too small to notice**
     - Issue: the small green "Expand" text is easy to miss, especially inside a dense table.
     - Option A: make it an icon+text button inside the reason cell.
     - Option B: make the whole reason cell open the row details.

177. **Complex headers need explanations**
     - Issue: columns like "Hard Requirements," "Needs Review," and "Extraction Confidence" require context.
     - Option A: add small help icons with tooltip definitions.
     - Option B: rename columns so tooltips are optional, not required.

178. **Tooltip content should explain measurement, not implementation**
     - Issue: a tooltip that says "length of hardNoReasons array" would still be useless.
     - Option A: "Likely conflicts: requirements that do not match your saved profile."
     - Option B: "Review needed: requirements ClearGrant found but could not compare safely."

179. **"Not stated" creates visual noise**
     - Issue: repeated "Not stated" strings make the table look broken and cluttered.
     - Option A: use a muted centered em dash (`—`) for empty table cells.
     - Option B: leave low-importance missing cells blank and explain missing data only in detail view.

180. **Missing-value copy needs a policy**
     - Issue: the app uses "Not stated," "Not available," "Uploaded document," and empty strings inconsistently.
     - Option A: define one table policy: `—` means no value found in sources.
     - Option B: define context labels: "No deadline found," "No funder found," "No award amount found."

181. **"Primary Reason" lacks an object**
     - Issue: users ask "primary reason for what?"
     - Option A: rename to "Why this rating."
     - Option B: rename to "Fit rationale."

182. **"Disqualifying Factors" may be too strong**
     - Issue: "Disqualifying" can overclaim official eligibility.
     - Option A: use "Likely conflicts."
     - Option B: use "Potential blockers."

183. **Raw count columns leak JSON array lengths**
     - Issue: columns showing `5` or `2` are probably counts of requirement arrays, not meaningful user copy.
     - Option A: render as "5 rules found" / "2 need review."
     - Option B: remove count columns from the default table and show counts in detail.

184. **Hard requirement count should not imply conflict count**
     - Issue: "5 hard requirements" may mean five extracted requirements, not five reasons to avoid applying.
     - Option A: separate "requirements found" from "likely conflicts."
     - Option B: show only conflict count in the matrix.

185. **Needs-review count needs labels**
     - Issue: a bare `2` does not say what action is required.
     - Option A: display "2 unclear rules."
     - Option B: display "2 to review."

186. **Extraction confidence should be removed from default matrix**
     - Issue: if every row says `HIGH`, the column wastes space; if it says low, that is better represented as a warning.
     - Option A: remove the column and show low-confidence warnings only.
     - Option B: move confidence into row details or a source quality section.

187. **All-caps confidence values feel like debug output**
     - Issue: `HIGH` and `LOW` in uppercase look machine-generated.
     - Option A: use "Good," "Limited," "Poor."
     - Option B: use warning chips only when confidence is limited/poor.

188. **The table has too many columns**
     - Issue: 12 columns is too many for a standard laptop screen, especially with prose cells.
     - Option A: default to 6 columns: Opportunity, Fit, Why, Deadline, Award, Actions.
     - Option B: default to 5 columns: Opportunity, Fit, Details, Sources, Actions.

189. **Funder and grant name should be stacked**
     - Issue: funder consumes a full column even though it belongs naturally under the opportunity name.
     - Option A: bold grant name with funder in muted text below.
     - Option B: show grant name, funder, and source count together in the first sticky column.

190. **Deadline and award can share a details column**
     - Issue: deadline and award amount are compact metadata; separate columns inflate width.
     - Option A: combine into "Grant details" with two stacked lines.
     - Option B: show deadline as the main value and award as muted secondary text.

191. **Default table should be decision-first**
     - Issue: current table is source/debug-first; users need to decide whether to inspect/apply.
     - Option A: prioritize Fit, Why, Deadline, Award, Source health.
     - Option B: hide extracted requirement categories until the detail page.

192. **Dense prose inside cells needs line clamping strategy**
     - Issue: long reasons in a table become unreadable.
     - Option A: clamp to two lines with a reliable detail drawer.
     - Option B: generate a short user-facing summary specifically for table display.

193. **Source quotes should not be the table summary**
     - Issue: quotes are useful evidence, but table cells need interpreted summaries.
     - Option A: table shows human summary; detail page shows quote.
     - Option B: table shows summary plus a source icon that opens quote preview.

194. **The table needs a stable row action model**
     - Issue: Review, delete, rename, replace sources, and re-run analysis cannot all be random buttons.
     - Option A: primary row action is "Open"; secondary actions live in an overflow menu.
     - Option B: row click opens details; actions live in a right-side contextual panel.

195. **The matrix should not carry onboarding explanations**
     - Issue: explanatory disclaimers compete with table controls.
     - Option A: add a compact "How ratings work" link.
     - Option B: show detailed explanation only in first-run empty state.

196. **View model should own table wording**
     - Issue: pages are currently assembling copy directly from Prisma/extraction fields.
     - Option A: create a matrix row view model that outputs user-facing labels, summaries, missing values, warnings, and actions.
     - Option B: create separate view models for matrix row, grant detail summary, and source list.

197. **Backend matching should output reason codes**
     - Issue: raw prose from matcher logic is hard to rewrite safely in the UI.
     - Option A: match result includes `reasonCode`, `category`, `sourceName`, and display data; UI renders copy.
     - Option B: keep `primaryReason` for logs but add structured reasons for the product UI.

198. **Negative eligibility rules need their own display shape**
     - Issue: "not based in certain countries" is a different kind of rule than "must be in California."
     - Option A: extract `constraintDirection: include | exclude | unknown`.
     - Option B: render negative constraints as "Excluded: X, Y, Z" when possible.

199. **Requirement summary should preserve source specificity**
     - Issue: a summary that says "certain countries" or "eligible applicants" without the values is not useful.
     - Option A: require summaries to include concrete values or fallback to the quote.
     - Option B: detect vague summaries and render a warning: "Open quote for details."

200. **The matrix needs a ruthless default column cut**
     - Issue: visual polish will not fix the real estate crisis while all 12 columns remain.
     - Option A: delete `Extraction Confidence`, raw `Hard Requirements` count, and raw `Needs Review` count from default view.
     - Option B: move those into a details drawer and keep the table decision-focused.

## Workflow-Level Structural Audit

This section captures the higher-level design failure across pages: the app often renders database fields and AI output instead of guiding a user through a workflow. The profile page shows the same pattern as the matrix: generic page sections, weak affordance, low information density, and backend language where user guidance should be.

### Profile Page as a Settings Tool

201. **Profile page feels like a generic webpage, not a software tool**
     - Issue: the page uses large marketing-like spacing, a big title, a paragraph, and then a huge form card. It does not feel like a dense settings/profile editor.
     - Option A: redesign as a compact settings screen with section navigation, tighter controls, and a persistent save area.
     - Option B: split the profile into a summary sidebar plus dense editable sections.

202. **The profile page header is too large for the task**
     - Issue: "Edit applicant profile" consumes prime space without improving the form workflow.
     - Option A: compress the header into a toolbar: "Applicant profile" + last saved state + Save button.
     - Option B: keep the title but remove the long paragraph and move guidance into section helper text.

203. **Backend copy appears in the profile description**
     - Issue: "deterministic matching can compare requirements against reliable profile data" is internal system language.
     - Option A: "ClearGrant uses this profile to check grant requirements against the applicant."
     - Option B: "Update the details used in every grant review."

204. **"Manage Profile" is weak page framing**
     - Issue: it is generic and does not explain what profile controls.
     - Option A: "Applicant profile"
     - Option B: "Eligibility profile"

205. **The page background and form surface melt together**
     - Issue: cream background, white card, faint borders, and low shadows create poor containment.
     - Option A: use a cooler slate page background with white form panels and stronger borders.
     - Option B: keep the warm background but make the form a clearly contained white workspace with stronger elevation.

206. **Global navigation blends into the page**
     - Issue: the header border/contrast is too light, so the nav visually bleeds into the page title area.
     - Option A: add a stronger bottom border and white/slate header surface.
     - Option B: make the nav a more explicit application chrome with active page background, not just an underline.

207. **Form inputs lack strong affordance**
     - Issue: input borders are faint and fields do not feel tactile enough.
     - Option A: darken field borders, increase focus rings, and use clearer hover/focus states.
     - Option B: use filled input backgrounds with clear border/focus treatment.

208. **The page has too much low-value vertical whitespace**
     - Issue: users scroll through large blank zones and oversized sections to edit simple data.
     - Option A: reduce vertical padding between form sections and controls.
     - Option B: use a two-column settings layout where related controls stay above the fold.

209. **Step labels are wrong in edit mode**
     - Issue: "Step 1," "Step 2," etc. imply onboarding progress, but profile editing is not a step-by-step wizard.
     - Option A: in edit mode, rename sections to "Applicant," "Location," "Program areas," and "Registrations and funding."
     - Option B: use steps only on first-run onboarding; use settings sections after onboarding.

210. **Step hierarchy is typographically confused**
     - Issue: tiny "STEP 1," bold section title, bold field labels, and large controls create a ladder of competing text.
     - Option A: define one section heading style, one field label style, and one helper text style.
     - Option B: add a left section rail and make the section title the only major heading inside the form.

211. **The form lacks a clear save resolution**
     - Issue: on long forms, the save button can be far below the current scroll position.
     - Option A: add a sticky bottom save bar with "Save profile" and unsaved/saved state.
     - Option B: add a sticky top-right Save button in the page toolbar.

212. **Selected checkbox states overpower the rest of the page**
     - Issue: selected pills use large teal backgrounds across huge rows, making the page look visually noisy.
     - Option A: shrink checkbox rows and use a subtle checkmark/accent border instead of full-row teal fill.
     - Option B: use compact multi-select chips with selected state contained to the icon/left edge.

213. **Checkbox rows are too large**
     - Issue: "Program fit" and "Populations served" consume too much space for simple boolean choices.
     - Option A: reduce row padding and height.
     - Option B: use compact checkbox lists with 3 columns on desktop.

214. **Checkbox groups need better scanning**
     - Issue: selected and unselected choices are arranged in large blocks but do not create quick summary value.
     - Option A: show selected count in each group header.
     - Option B: put selected choices first or add quick filters only if the list grows.

215. **"Program fit" is vague**
     - Issue: the section title does not say whether these are the applicant's work areas, grant interests, or program categories.
     - Option A: "Program areas"
     - Option B: "Work areas and populations"

216. **"Operational capacity" sounds like consulting jargon**
     - Issue: the section is really about registrations and match-funding readiness.
     - Option A: "Registrations and funding"
     - Option B: "IDs, registrations, and match funds"

217. **"Mission or project focus" does not guide useful input**
     - Issue: users may write broad mission statements that do not help eligibility matching.
     - Option A: label it "Brief description of applicant work" and add helper text: "One or two sentences about the work this applicant does."
     - Option B: split into "Mission" and "Project focus" if both are truly needed.

218. **The current mission field encourages vague prose**
     - Issue: the example screenshot shows a broad personal/business statement that may be too vague for grant matching.
     - Option A: add placeholder guidance: "Example: Provides after-school STEM programs for middle-school students in San Luis Obispo County."
     - Option B: convert this into structured tags later if free text proves low-value.

219. **Location fields do not clarify matching semantics**
     - Issue: users do not know whether country/state/city represent applicant address, service area, project site, or all of the above.
     - Option A: rename section to "Applicant location" and add helper text.
     - Option B: add separate fields for applicant location and service/project area later.

220. **"Individual applicant" hides organization/legal fields without explanation**
     - Issue: when applicant type changes, fields disappear, but the UI does not explain why.
     - Option A: add small conditional copy: "Organization fields are hidden for individual applicants."
     - Option B: keep disabled/empty fields visible with explanatory labels if users need context.

221. **Profile screen lacks a compact summary**
     - Issue: users cannot quickly see the profile that future analyses will use.
     - Option A: add a right-side summary panel showing applicant type, location, selected focus areas, and registrations.
     - Option B: add a collapsible "Profile used for analysis" summary at the top.

222. **Profile screen should separate required and optional data**
     - Issue: users cannot tell which fields are necessary for matching and which improve quality.
     - Option A: mark required fields and create an "Optional details" section.
     - Option B: add a profile completeness indicator with missing high-value fields.

223. **Profile editing should not feel like onboarding**
     - Issue: current edit page uses the same step structure as first-run setup.
     - Option A: keep onboarding as a guided wizard, then use a settings layout for editing.
     - Option B: use one shared component but pass mode-specific section copy and layout density.

224. **Profile page lacks field-level explanations where they matter**
     - Issue: terms like SAM, UEI, match funds, and fiscal sponsor may be unfamiliar.
     - Option A: add small help text or tooltips only for specialized terms.
     - Option B: expand labels slightly: "Has SAM.gov registration," "Has Unique Entity ID (UEI)."

225. **"Minimum useful award" is not self-explanatory**
     - Issue: users may not know whether this is annual budget, minimum grant amount, or target award size.
     - Option A: "Smallest grant amount worth pursuing"
     - Option B: "Minimum award amount to consider"

### Cross-Page Design System Problems

226. **The app uses decorative spacing instead of workflow density**
     - Issue: large section gaps make simple tasks feel longer and less precise.
     - Option A: reduce vertical rhythm for tool pages while keeping more generous spacing on landing/auth.
     - Option B: define separate layout primitives for marketing pages, settings pages, data tables, and intake flows.

227. **White-on-cream is not enough contrast for data-heavy screens**
     - Issue: data pages need stronger boundaries than a landing page.
     - Option A: use slate backgrounds, white panels, and clearer borders for dashboard/table/profile.
     - Option B: keep warmth only in top-level background and use high-contrast surfaces for controls.

228. **Current styling reads as "AI-generated Tailwind blocks"**
     - Issue: repeated rounded panels, cream gradients, and generic spacing make pages feel assembled rather than designed.
     - Option A: create a stricter product design system with density, surface, and type rules.
     - Option B: define page-specific patterns: command center, settings form, intake desk, comparison table, detail page.

229. **Affordances are inconsistent**
     - Issue: some buttons look clickable, but row links, editable names, expandable reasons, and form inputs are weaker.
     - Option A: define interaction states for every clickable/editable element.
     - Option B: add icons and hover/focus states only where they clarify action.

230. **Important text often floats on the page**
     - Issue: descriptions under page titles sit directly on the cream background and do not connect to the tool below.
     - Option A: move task guidance into contained panels near the controls it explains.
     - Option B: convert page descriptions into short subheaders inside the active workspace.

231. **Page copy is too often explanatory instead of operational**
     - Issue: headings tell users what the system is doing, not what they can do.
     - Option A: rewrite page copy around user action: add, review, compare, update, replace.
     - Option B: keep technical explanations in help/drawer content, not primary headings.

232. **The same panel treatment is used for everything**
     - Issue: metrics, forms, source cards, workflow items, and tables all share similar rounded white panels.
     - Option A: define distinct surfaces for cards, forms, data tables, alerts, and empty states.
     - Option B: reduce panel nesting and use dividers/toolbars for dense tool areas.

233. **The active nav state is too weak**
     - Issue: a thin teal underline can be missed, especially with low-contrast chrome.
     - Option A: use a stronger active tab background/border.
     - Option B: make nav items real app tabs with a selected pill/rail treatment.

234. **The app lacks a clear "work area" concept**
     - Issue: pages feel like content sections rather than a workspace where a user manipulates records.
     - Option A: use a consistent toolbar + content pane model.
     - Option B: use master/detail patterns for data pages.

### Matrix Issues to Preserve in the Refactor Brief

235. **The matrix should not be restyled before it is rethought**
     - Issue: styling the current 12-column table will only make a broken information model prettier.
     - Option A: finish grouped-source backend and build a matrix view model first.
     - Option B: make only tiny copy fixes now and schedule full table redesign after schema stabilization.

236. **Matrix should become a decision table, not a database table**
     - Issue: current columns expose backend values instead of helping users decide what to inspect next.
     - Option A: default columns: Opportunity, Fit, Why, Deadline/Award, Sources, Actions.
     - Option B: default columns: Opportunity, Status, Key issue, Grant details, Actions.

237. **Edit/delete affordances are table fundamentals**
     - Issue: without rename/delete, users cannot manage mistakes, duplicates, or test records.
     - Option A: add an overflow menu per row with Rename, Re-run analysis, Delete.
     - Option B: put rename on detail page and delete in row overflow.

238. **Broken Expand behavior should be treated as a bug**
     - Issue: duplicated text and no clear collapse state make the interaction feel broken.
     - Option A: remove inline expand and use row detail drawer.
     - Option B: fix disclosure so closed state shows excerpt and open state shows one full version.

239. **Missing-value policy is required before table redesign**
     - Issue: `Not stated`, `Not available`, and blank values create clutter and inconsistency.
     - Option A: use `—` in table cells and fuller context only on detail page.
     - Option B: use field-specific missing messages in tooltips/details, not the matrix.

240. **Raw counts should be removed from the table**
     - Issue: Hard Requirements and Needs Review counts are not actionable as numbers.
     - Option A: remove both columns from default table.
     - Option B: replace with one compact "Issues" chip group: "2 conflicts," "1 unclear."

## Suggested Copy System

Adopt a small set of stable nouns:

- **Grant opportunity**: the thing represented by one matrix/detail row.
- **Source documents**: PDFs, DOCX files, TXT files, and pasted text attached to one opportunity.
- **Analysis**: the action that reads sources and produces requirements.
- **Fit rating**: the result shown to the user.
- **Comparison table**: the matrix view.
- **Applicant profile**: the saved user data used for comparisons.

Avoid exposing:

- Bucket names
- Raw JSON by default
- Queue/staging/dropzone terminology
- "Evidence" unless there is a legal/compliance context
- "Dossier" unless user testing proves it resonates
- Normalization failures
- Raw array counts without labels
- All-caps debug states such as `HIGH`
- Wizard/step language on settings pages
- Long backend explanations in page headers
- Oversized checkbox cards for simple boolean choices

## Highest Priority Fixes

1. Rewrite the upload/intake page terminology around "grant opportunity" and "source documents."
2. Replace storage/bucket errors with user-safe messages.
3. Compact the added-source list and make document names clearly editable.
4. Define a matrix/detail view model before restyling the table, so raw extraction JSON stops leaking into UI copy.
5. Rename matrix copy to "comparison table" or make "Matrix" a secondary shorthand.
6. Add delete, rename, and re-run analysis actions for grant opportunity rows.
7. Add a source document section on the grant detail page.
8. Show source provenance beside quotes and match reasons.
9. Hide or demote raw JSON.
10. Reduce cream surfaces and increase white/slate contrast for data-heavy views.
11. Replace dashboard workflow copy with action/status-oriented cards.
12. Add a status legend or tooltip system for fit ratings and review states.
13. Remove `Extraction Confidence`, raw `Hard Requirements`, and raw `Needs Review` counts from the default matrix.
14. Combine grant name/funder and deadline/award to reduce table width.
15. Replace repeated "Not stated" table values with a consistent missing-value policy.
16. Fix the expand/disclosure behavior so it does not duplicate the same text.
17. Redesign profile edit as a dense settings screen, not an onboarding-style form.
18. Kill step labels on edit-mode profile pages.
19. Add a sticky save footer or persistent save control for long forms.
20. Tighten profile checkbox groups and reduce selected-state visual weight.
21. Replace profile header copy that mentions deterministic matching with plain user-task copy.
