# ClearGrant Analyzer Architecture

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase PostgreSQL
- Prisma ORM
- LLM API through server-side route
- Vitest for unit tests

## Major Modules

- Auth
- Profile/onboarding
- File upload
- Document text extraction
- LLM extraction
- Matching logic
- Matrix dashboard
- Grant detail view

## Security

- API keys only in server environment variables.
- Users can only access their own grants/profile.
- Never call LLM API from client components.

