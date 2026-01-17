# PLAN.md - Next.js Artist Submissions Portal (Vercel + Supabase + shadcn/ui)

## 0) Goal
Build a Next.js app that matches the functionality of `artists-form-to-sheets`, but using:
- Next.js (App Router) + TypeScript
- Supabase (Auth + Postgres + Storage)
- Vercel hosting
- shadcn/ui for the interface

The portal supports artist submissions, admin review, release pipeline, planned catalog,
status tracking by token, draft persistence, and CSV export.

## 1) Definition of Done
- [ ] Auth: sign up / sign in / sign out using Supabase Auth.
- [ ] Admin bootstrap: admin role assigned via env list or script.
- [ ] Artist Submit: form with conditional fields and validation; creates submission + token.
- [ ] Drafts: partial form data saved and restored by draft token.
- [ ] My Submissions: list of user submissions with status details.
- [ ] Status page: public token lookup; if logged in, enforce ownership unless admin.
- [ ] Admin Applications: filter/search, update status + note, CSV export.
- [ ] Releases pipeline: create release for OK submissions, update status, CSV export.
- [ ] Planned Catalog: move approved releases, CSV export.
- [ ] RLS + security: no data leaks; service role only on server.
- [ ] README with setup, env, dev, test, deploy.
- [ ] Tests for validators and core flow.

## 2) Stack
- Next.js 14+ (App Router), TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Postgres, Storage optional)
- Zod (validation) + React Hook Form (forms)
- csv-stringify or papaparse (server CSV generation)
- Vitest + Testing Library (unit/integration)

## 3) Project Structure
- `app/`
  - `(public)/status/page.tsx`
  - `(app)/submit/page.tsx`
  - `(app)/submissions/page.tsx`
  - `(admin)/admin/applications/page.tsx`
  - `(admin)/admin/releases/page.tsx`
  - `(admin)/admin/planned/page.tsx`
  - `api/` (route handlers)
- `components/` (forms, tables, filters)
- `lib/` (supabase clients, auth helpers, validation, csv)
- `db/` (sql schema + seed/admin scripts)
- `tests/`

## 4) Data Model (Supabase/Postgres)
Use `uuid` ids where possible and store timestamps as `timestamptz`.

### 4.1 users / profiles
- Supabase Auth table `auth.users`
- `profiles` table:
  - `id uuid` (PK, FK to auth.users)
  - `email text`
  - `display_name text`
  - `is_admin boolean`
  - `created_at`, `updated_at`

### 4.2 submissions
- `id uuid` (PK)
- `user_id uuid` (FK profiles.id)
- `track_name text` (required)
- `artists_display text` (required)
- `cover_option text` (LINK | LABEL_DESIGN)
- `cover_link text`
- `cover_brief text`
- `cover_reference_link text`
- `cover_label_discretion boolean`
- `audio_link text`
- `spotify_link text`
- `tiktok_link text`
- `artist_email text`
- `artist_legal_name text`
- `artist_country text`
- `artist_city text`
- `artists_count text` (1/2/3/4/5+)
- `bulk_artist_list text`
- `status text` (NEW/OK/NEEDS_FIX/DESIGN_REQUESTED/REJECTED)
- `admin_note text`
- `public_token text` (unique)
- `created_at`, `updated_at`

### 4.3 artist_participants
- `id uuid` (PK)
- `submission_id uuid` (FK)
- `role text`, `fullname text`, `country text`, `city text`, `email text`, `spotify text`

### 4.4 drafts
- `id uuid` (PK)
- `token text` (unique)
- `user_id uuid` (nullable)
- `data jsonb`
- `created_at`, `updated_at`

### 4.5 releases
- `id uuid` (PK)
- `submission_id uuid` (unique FK)
- `status text` (IN_PREP/APPROVED/SCHEDULED/REJECTED)
- `release_note text`
- `created_at`, `updated_at`

### 4.6 planned_catalog
- `id uuid` (PK)
- `release_id uuid` (unique FK)
- `created_at`

## 5) Security + RLS
- Enable RLS on all tables.
- Policies:
  - `profiles`: user can select/update own row.
  - `submissions`: user can insert/select/update own rows; admin can read/update all.
  - `artist_participants`: same as submissions via FK join.
  - `drafts`: user can read/write by token or own user_id (server route enforces).
  - `releases` + `planned_catalog`: admin only.
- Public status lookup: implement via server route using service role key
  so anon users cannot bypass RLS.

## 6) API Routes / Server Actions
Use server route handlers with `@supabase/supabase-js`:
- `POST /api/drafts` save draft by token
- `GET /api/drafts?token=...` load draft
- `POST /api/submissions` create submission + participants
- `GET /api/submissions` list own submissions
- `GET /api/status?token=...` token lookup (server role)
- `PATCH /api/admin/submissions/:id` update status/note
- `POST /api/admin/releases` create release from submission
- `PATCH /api/admin/releases/:id` update status/note
- `POST /api/admin/planned` create planned catalog entry
- `GET /api/admin/export?type=submissions|releases|planned`

## 7) UI/UX Flows
- Public status page:
  - Input token, show submission + release status + admin note.
- Artist Submit:
  - Conditional fields for cover option and artists count.
  - Participants block for 2-4 artists.
  - Bulk field for 5+.
  - Save draft on change or interval.
- My Submissions:
  - Table with status, updated date, quick status link.
- Admin Applications:
  - Filter by status, search by track/artist/email.
  - Detail panel with update controls and "Move to Releases".
- Releases:
  - Table + detail editor + "Move to Planned Catalog".
- Planned Catalog:
  - Table + CSV export.

## 8) Validation Rules
- Cover option:
  - LINK => cover_link required and must be http(s)
  - LABEL_DESIGN => cover_brief required; reference link optional unless label_discretion
- Audio link required (http/https).
- Spotify required (http/https).
- TikTok optional (http/https).
- Artist contact fields required.
- Participants: all fields required for 2-4.
- Bulk list required for 5+.

## 9) Draft Persistence
- Generate a `draft_token` on first load, store in localStorage + URL param.
- Auto-save to `drafts` table via API.
- On submission success, clear draft.

## 10) CSV Export
- Admin-only server route that joins related tables and builds CSV.
- Use `application/csv` with proper headers for download.

## 11) Tests
- Unit tests for validation schema.
- Integration tests for submission -> release -> planned flow using Supabase test DB.
- Optional Playwright smoke: sign in, submit, admin updates.

## 12) Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAILS` (comma-separated)
- `APP_BASE_URL` (for status links)

## 13) Deployment (Vercel)
Goal: zero manual UI interaction. Use CLI/API automation.
- Use Vercel CLI to create project, link repo, set env vars, and deploy.
- Use Supabase CLI/SQL to create schema + RLS without Console.
- Ensure service role key is server-only (never in client bundle).
### 13.1 Vercel automation (no UI)
- `vercel link` or `vercel project add` for project creation/linking.
- `vercel env add` for all env vars (scripted, from `.env.production` or CI secrets).
- `vercel deploy --prod` for production deploy.
- Optional: GitHub integration for auto‑deploy on push (configured via API/CLI if available).
### 13.2 Supabase automation (no UI)
- `supabase init` and `supabase link` to a project.
- `supabase db push` or `supabase migration` to apply schema/policies.
- Use `supabase secrets set` (or env files in CI) for keys where applicable.

## 14) Step-by-step Implementation Plan
1) Initialize Next.js + Tailwind + shadcn/ui.
2) Configure Supabase client (browser + server).
3) Create SQL schema + RLS policies + seed admin role.
4) Implement auth pages and session management.
5) Build submission form + draft save/load.
6) Build My Submissions page.
7) Build Status page (token lookup via server route).
8) Admin Applications page (filter/search/edit + CSV).
9) Releases page + planned catalog page.
10) Add tests + README + deployment notes.
11) Add automated deploy scripts (Vercel + Supabase) with zero UI.

## 15) Auth (missing details)
### 15.1 Routes
- `/auth/sign-up`
- `/auth/sign-in`
- `/auth/sign-out` (server action or route handler)

### 15.2 Session handling
- Use Supabase Auth helpers in server components/actions to read session.
- Client uses `NEXT_PUBLIC_SUPABASE_*` keys only.
- Server uses `SUPABASE_SERVICE_ROLE_KEY` only in route handlers (never in client).

### 15.3 Admin bootstrap
- `ADMIN_EMAILS` env (comma-separated).
- On first sign-in, server action checks email and sets `profiles.is_admin = true`.
- Optional SQL seed script for manual bootstrap.

## 16) Profiles (missing details)
### 16.1 Creation strategy (choose one)
- Option A (recommended): `AFTER INSERT ON auth.users` trigger inserts into `profiles`.
- Option B: server action on sign-up creates profile row.

### 16.2 Fields
- `id`, `email`, `display_name`, `is_admin`, `created_at`, `updated_at`.
- Keep `email` in sync with auth email where possible.

### 16.3 RLS for profiles
- Select/update own row.
- Admin can select/update all.

## 17) Migrations (missing details)
### 17.1 Structure
- `db/schema.sql` for baseline schema + RLS.
- `db/policies.sql` for RLS policies.
- `db/seed.sql` for admin bootstrap helpers (optional).

### 17.2 Execution
- Apply in order:
  1) schema
  2) policies
  3) seed (if used)
- Keep scripts idempotent where possible.

## 18) Implementation Checklist (by phase)
### Phase 1: Foundation
- [ ] Create Next.js app, Tailwind, shadcn/ui.
- [ ] Add env template `.env.example`.
- [ ] Add Supabase clients (browser + server).

### Phase 2: Database + RLS
- [ ] Create `profiles`, `submissions`, `artist_participants`, `drafts`, `releases`, `planned_catalog`.
- [ ] Enable RLS + policies for each table.
- [ ] Add trigger or server flow to create `profiles`.
- [ ] Add admin bootstrap (env + optional seed).

### Phase 3: Auth
- [ ] Sign up / sign in / sign out routes.
- [ ] Session-aware layout and guards (admin vs user).
- [ ] Profile creation verified on sign-up.

### Phase 4: Artist Submission Flow
- [ ] Submission form with conditional fields + RHF.
- [ ] Draft token creation + autosave.
- [ ] POST submission + participants.
- [ ] Clear draft on success.

### Phase 5: User Pages
- [ ] My Submissions list.
- [ ] Status lookup page (public token).

### Phase 6: Admin Pages
- [ ] Admin Applications list + filter/search.
- [ ] Update status + admin note.
- [ ] Create release from submission.
- [ ] Releases page + update status.
- [ ] Planned Catalog page.
- [ ] CSV export for submissions/releases/planned.

### Phase 7: Tests + Docs
- [ ] Zod schema unit tests.
- [ ] Integration flow tests (submission -> release -> planned).
- [ ] README: setup, env, schema, deploy.
### Phase 8: No‑UI Deploy Automation
- [ ] Script: create/link Vercel project and set env via CLI.
- [ ] Script: apply Supabase schema + policies via CLI.
- [ ] One‑command production deploy (no prompts).
