<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md

## Project

ClearGrant Analyzer is a full-stack Next.js app for grant document ingestion and eligibility triage.

It is NOT:
- a grant CRM
- an application tracker
- a grant-writing assistant
- a team collaboration platform

Do not add lifecycle statuses like Submitted, Pending, Accepted, Rejected.

## Core Goal

Help a logged-in user upload grant documents, extract eligibility requirements into JSON, compare those requirements against the saved user profile, and display results in a matrix dashboard.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase PostgreSQL
- Prisma ORM
- LLM API through server-side routes only
- Vitest for unit tests
## Build Rules

1. Go for gold: Build the full vertical slice including the real OpenAI LLM extraction route.
2. Keep API keys server-side only.
3. Do not expose user data across accounts.
4. Matching logic should be deterministic where possible.
5. Ambiguous eligibility should be marked Needs Review, not Hard No.
6. Do not overclaim official eligibility.

## TDD Protocol (CRITICAL)

You must execute a strict, headless TDD loop for all pure data transformation functions (e.g., `matchGrantToProfile`, schema validation). Do not use Playwright.

**The Autonomous TDD Execution Loop:**
1. Create `docs/tdd/prompts/[function-name].md` detailing the test intent.
2. Write the Vitest test file anticipating the correct production logic, and create the empty implementation file.
3. Run the test to fail: `npx vitest run > docs/tdd/logs/[function-name]-red.txt 2>&1`.
4. Write the full production implementation to pass the test.
5. Run the test to pass: `npx vitest run > docs/tdd/logs/[function-name]-green.txt 2>&1`.
6. **COMMIT THE PROOF:** You must immediately run `git add .` followed by `git commit -m "test(tdd): implement [function-name] with red/green logs"`.

## Important Docs

Read these before making major changes:

- `docs/prd.md`
- `docs/build-plan.md`
- `docs/front-end-spec.md`
- `docs/architecture.md`

## First Build Target

A logged-in user can:
1. Complete an onboarding profile.
2. Drag and drop or click to upload a document (PDF, DOCX, TXT) ((There should be built in tools/libraries for this you can leverage))
3. Have the backend extract the text, send it to OpenAI, and save the extracted JSON to Prisma.
4. View the matrix dashboard populated by the real JSON.
5. Click into a grant detail page.