-- Rozgar Radar — schema, RLS policies, triggers
-- Run in Supabase SQL Editor (or `supabase db push`) before seeding.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user, holds the candidate's academic profile
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  degree text,
  branch text,
  graduation_year integer,
  min_percentage numeric(4,2),
  skills text[] not null default '{}',
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- jobs: mock job postings (no scraping, seeded via supabase/seed.sql)
-- ---------------------------------------------------------------------------
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  description text not null default '',
  location text not null default 'India',
  min_degree text,
  allowed_branches text[] not null default '{}',
  grad_year_min integer,
  grad_year_max integer,
  min_percentage numeric(4,2),
  skills text[] not null default '{}',
  apply_url text not null default '#',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- job_matches: AI eligibility verdict per (user, job)
-- ---------------------------------------------------------------------------
create table if not exists public.job_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  status text not null check (status in ('confirmed','likely','not_eligible','needs_review')),
  reasons jsonb not null default '[]'::jsonb,
  explanation text not null default '',
  score integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, job_id)
);

-- ---------------------------------------------------------------------------
-- saved_jobs: bookmarks from the 3D board
-- ---------------------------------------------------------------------------
create table if not exists public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, job_id)
);

-- ---------------------------------------------------------------------------
-- alert_log: one row per user per day, keeps the cron idempotent
-- ---------------------------------------------------------------------------
create table if not exists public.alert_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  sent_on date not null default current_date,
  job_count integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, sent_on)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists jobs_company_idx on public.jobs (company);
create index if not exists job_matches_user_idx on public.job_matches (user_id);
create index if not exists saved_jobs_user_idx on public.saved_jobs (user_id);

-- ---------------------------------------------------------------------------
-- Triggers: keep updated_at fresh, auto-create a profile on signup
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists job_matches_set_updated_at on public.job_matches;
create trigger job_matches_set_updated_at
  before update on public.job_matches
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.job_matches enable row level security;
alter table public.saved_jobs enable row level security;
alter table public.alert_log enable row level security;

-- profiles: owner only
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- jobs: world readable, writes restricted to service role
drop policy if exists "jobs_select_all" on public.jobs;
create policy "jobs_select_all" on public.jobs
  for select using (true);

-- job_matches: owner only
drop policy if exists "job_matches_select_own" on public.job_matches;
create policy "job_matches_select_own" on public.job_matches
  for select using (auth.uid() = user_id);

drop policy if exists "job_matches_insert_own" on public.job_matches;
create policy "job_matches_insert_own" on public.job_matches
  for insert with check (auth.uid() = user_id);

drop policy if exists "job_matches_update_own" on public.job_matches;
create policy "job_matches_update_own" on public.job_matches
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "job_matches_delete_own" on public.job_matches;
create policy "job_matches_delete_own" on public.job_matches
  for delete using (auth.uid() = user_id);

-- saved_jobs: owner only
drop policy if exists "saved_jobs_select_own" on public.saved_jobs;
create policy "saved_jobs_select_own" on public.saved_jobs
  for select using (auth.uid() = user_id);

drop policy if exists "saved_jobs_insert_own" on public.saved_jobs;
create policy "saved_jobs_insert_own" on public.saved_jobs
  for insert with check (auth.uid() = user_id);

drop policy if exists "saved_jobs_delete_own" on public.saved_jobs;
create policy "saved_jobs_delete_own" on public.saved_jobs
  for delete using (auth.uid() = user_id);

-- alert_log: owner only
drop policy if exists "alert_log_select_own" on public.alert_log;
create policy "alert_log_select_own" on public.alert_log
  for select using (auth.uid() = user_id);

drop policy if exists "alert_log_insert_own" on public.alert_log;
create policy "alert_log_insert_own" on public.alert_log
  for insert with check (auth.uid() = user_id);
