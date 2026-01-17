-- Enable RLS
alter table profiles enable row level security;
alter table submissions enable row level security;
alter table artist_participants enable row level security;
alter table drafts enable row level security;
alter table releases enable row level security;
alter table planned_catalog enable row level security;

-- Profiles
create policy "profiles_select_own" on profiles
for select using (auth.uid() = id or is_admin());

create policy "profiles_insert_own" on profiles
for insert with check (auth.uid() = id);

create policy "profiles_update_own" on profiles
for update using (auth.uid() = id or is_admin());

-- Submissions
create policy "submissions_insert_own" on submissions
for insert with check (auth.uid() = user_id);

create policy "submissions_select_own" on submissions
for select using (auth.uid() = user_id or is_admin());

create policy "submissions_update_own" on submissions
for update using (auth.uid() = user_id or is_admin());

-- Participants
create policy "participants_insert_own" on artist_participants
for insert with check (
  exists (
    select 1 from submissions
    where submissions.id = artist_participants.submission_id
      and submissions.user_id = auth.uid()
  )
);

create policy "participants_select_own" on artist_participants
for select using (
  exists (
    select 1 from submissions
    where submissions.id = artist_participants.submission_id
      and (submissions.user_id = auth.uid() or is_admin())
  )
);

create policy "participants_update_own" on artist_participants
for update using (
  exists (
    select 1 from submissions
    where submissions.id = artist_participants.submission_id
      and (submissions.user_id = auth.uid() or is_admin())
  )
);

-- Drafts
create policy "drafts_owner_access" on drafts
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Releases (admin only)
create policy "releases_admin_only" on releases
for all using (is_admin())
with check (is_admin());

-- Planned catalog (admin only)
create policy "planned_admin_only" on planned_catalog
for all using (is_admin())
with check (is_admin());
