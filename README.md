## Artist Submissions Portal

Next.js + Supabase portal for artist submissions, admin review, releases, and planned catalog.

### Features
- Artist submit flow with conditional fields + draft autosave
- My submissions list + public token status page
- Admin applications review and status updates
- Releases + planned catalog pipeline
- CSV export for submissions, releases, planned catalog

### Stack
- Next.js App Router + TypeScript
- Supabase (Auth + Postgres)
- Tailwind + shadcn-style UI components
- Zod + React Hook Form

### Local setup
1) Install deps
```bash
npm install
```

2) Create `.env.local`
```bash
cp .env.example .env.local
```

3) Fill env values:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAILS` (comma-separated list of admin emails)
- `APP_BASE_URL` (optional; used in emails/links)

4) Apply database schema + policies
```bash
supabase db push
```
or run the SQL in `db/schema.sql` and `db/policies.sql`.

5) Start dev server
```bash
npm run dev
```

### Scripts
- `npm run dev` - local dev
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - lint

### Database schema
SQL sources:
- `db/schema.sql`
- `db/policies.sql`
- `db/seed.sql` (optional)

### No-UI deploy automation (Vercel + Supabase)
The project is intended to deploy without manual UI interaction.

Example steps (CLI):
```bash
supabase init
supabase link --project-ref <project-ref>
supabase db push

vercel link --project <project-name> --scope <team-or-user>
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add ADMIN_EMAILS production
vercel deploy --prod
```

Helper scripts:
- `scripts/setup-supabase.sh`
- `scripts/deploy-vercel.sh`

### Notes
- `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never expose it to the client.
- Admin role is set by `ADMIN_EMAILS` on sign-in/sign-up via `/api/admin/bootstrap`.
