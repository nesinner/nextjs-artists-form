-- Core schema for Artist Submissions Portal
create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists submissions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles (id) on delete set null,
  track_name text not null,
  artists_display text not null,
  cover_option text not null,
  cover_link text,
  cover_file_path text,
  cover_brief text,
  cover_reference_link text,
  cover_label_discretion boolean default false,
  audio_link text,
  audio_file_paths text,
  spotify_link text not null,
  tiktok_link text,
  artist_email text not null,
  artist_legal_name text not null,
  artist_country text not null,
  artist_city text not null,
  artists_count text not null,
  bulk_artist_list text,
  status text not null default 'NEW',
  admin_note text,
  public_token text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists artist_participants (
  id uuid primary key default uuid_generate_v4(),
  submission_id uuid not null references submissions (id) on delete cascade,
  role text not null,
  fullname text not null,
  country text not null,
  city text not null,
  email text not null,
  spotify text not null
);

create table if not exists drafts (
  id uuid primary key default uuid_generate_v4(),
  token text not null unique,
  user_id uuid references profiles (id) on delete cascade,
  data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists releases (
  id uuid primary key default uuid_generate_v4(),
  submission_id uuid not null unique references submissions (id) on delete cascade,
  status text not null default 'IN_PREP',
  release_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists planned_catalog (
  id uuid primary key default uuid_generate_v4(),
  release_id uuid not null unique references releases (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at
before update on profiles
for each row execute function set_updated_at();

drop trigger if exists submissions_updated_at on submissions;
create trigger submissions_updated_at
before update on submissions
for each row execute function set_updated_at();

drop trigger if exists releases_updated_at on releases;
create trigger releases_updated_at
before update on releases
for each row execute function set_updated_at();

drop trigger if exists drafts_updated_at on drafts;
create trigger drafts_updated_at
before update on drafts
for each row execute function set_updated_at();

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public as $$
begin
  insert into profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do update
  set email = excluded.email,
      display_name = excluded.display_name;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

create or replace function is_admin()
returns boolean language sql stable as $$
  select exists(
    select 1 from profiles
    where id = auth.uid() and is_admin = true
  );
$$;
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
