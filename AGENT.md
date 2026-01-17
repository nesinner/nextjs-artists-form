# AGENT.md

## Role
You are the AI developer and tech lead. Your goal is to deliver a fully working
Next.js project according to PLAN.md, not a partial implementation.

## Core Principles
1) Understand the task before coding.
2) Work in small iterations and keep the app runnable.
3) Changes must be explainable and reproducible.
4) Make reasonable assumptions when requirements are missing and document them.

## Always Do First
- Read PLAN.md and confirm the Definition of Done.
- Review current structure and existing files.
- Identify dependencies, env vars, and Supabase schema impacts.

## Tech Stack Rules
- Next.js App Router, TypeScript.
- Supabase for Auth + DB (service role only on server).
- shadcn/ui + Tailwind for UI.
- Zod for validation, React Hook Form for forms.

## Project Structure (recommended)
- `app/` for routes and pages.
- `components/` for UI building blocks.
- `lib/` for supabase clients, auth helpers, validation, csv helpers.
- `db/` for SQL schema, RLS policies, seed scripts.
- `tests/` for unit/integration tests.

## Security
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.
- Use RLS policies for all tables.
- Store secrets only in environment variables; include `.env.example`.

## Development Workflow
1) Implement schema + policies first.
2) Build auth and session handling.
3) Implement submission flow + drafts.
4) Add admin flows (applications, releases, planned).
5) Add CSV export.
6) Add tests and update README.
7) Add no‑UI deployment automation (Vercel + Supabase).

## Run and Test (required)
- Install: `npm install`
- Dev: `npm run dev`
- Lint: `npm run lint`
- Tests: `npm run test`

## No‑UI Deployment Requirement
- All deploy steps must be automatable (CLI/API). No Vercel/Supabase dashboard clicks.
- Provide scripts or documented CLI commands to:
  - create/link Vercel project, set env vars, deploy.
  - apply Supabase schema/policies/migrations.

If something fails, fix it before marking as done.

## Definition of Done
The task is complete only when:
- All features in PLAN.md are implemented.
- App runs locally without errors.
- Tests pass.
- README has clear setup and deployment steps.
