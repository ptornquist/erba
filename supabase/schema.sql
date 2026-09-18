-- ERBA platform schema + row-level security.
-- Run in the Supabase SQL editor (or `supabase db push`) on a fresh project,
-- then run supabase/onboarding_trigger.sql.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Core membership tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text not null,
  referral_code text not null unique,
  referred_by   text,
  created_at    timestamptz not null default now()
);

create table if not exists public.companies (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references public.profiles (id) on delete cascade,
  name          text not null,
  industry      text not null,
  turnover_band text not null,
  is_anonymous  boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists companies_profile_id_idx on public.companies (profile_id);

create table if not exists public.pain_submissions (
  id                 uuid primary key default gen_random_uuid(),
  company_id         uuid not null references public.companies (id) on delete cascade,
  regulation_name    text not null,
  estimated_cost_eur numeric not null check (estimated_cost_eur >= 0),
  description        text,
  created_at         timestamptz not null default now()
);
create index if not exists pain_submissions_company_id_idx on public.pain_submissions (company_id);

-- ---------------------------------------------------------------------------
-- Enterprise dashboard tables
-- ---------------------------------------------------------------------------

create table if not exists public.policy_updates (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  summary      text not null,
  impact_level text not null check (impact_level in ('High', 'Med', 'Low')),
  date_issued  date not null default current_date
);
create index if not exists policy_updates_date_issued_idx on public.policy_updates (date_issued desc);

create table if not exists public.compliance_tasks (
  id               uuid primary key default gen_random_uuid(),
  company_id       uuid not null references public.companies (id) on delete cascade,
  industry         text not null,
  task_description text not null,
  is_completed     boolean not null default false
);
create index if not exists compliance_tasks_company_id_idx on public.compliance_tasks (company_id);

create table if not exists public.document_vault (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies (id) on delete cascade,
  file_name   text not null,
  file_url    text not null,
  uploaded_at timestamptz not null default now()
);
create index if not exists document_vault_company_id_idx on public.document_vault (company_id);

create table if not exists public.forum_posts (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  content    text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists forum_posts_created_at_idx on public.forum_posts (created_at desc);

-- ---------------------------------------------------------------------------
-- Helper: does the current user own the given company?
-- Lives in a non-exposed schema so it cannot be invoked through the Data API;
-- RLS policies can still call it.
-- ---------------------------------------------------------------------------

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.owns_company(target_company uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.companies c
    where c.id = target_company and c.profile_id = auth.uid()
  );
$$;

revoke all on function private.owns_company(uuid) from public, anon;
grant execute on function private.owns_company(uuid) to authenticated;

-- Number of members who signed up with the caller's referral code.
-- Returns only an integer for the calling user, so nothing about other
-- profiles leaks even though it runs as definer.
create or replace function public.referral_count()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer
  from public.profiles referred
  join public.profiles me on me.id = auth.uid()
  where referred.referred_by = me.referral_code
    and referred.id <> me.id;
$$;

revoke all on function public.referral_count() from public, anon;
grant execute on function public.referral_count() to authenticated;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.profiles         enable row level security;
alter table public.companies        enable row level security;
alter table public.pain_submissions enable row level security;
alter table public.policy_updates   enable row level security;
alter table public.compliance_tasks enable row level security;
alter table public.document_vault   enable row level security;
alter table public.forum_posts      enable row level security;

-- profiles: owner read/write. Referral counts are exposed via the
-- referral_count() RPC below rather than by widening select access.
drop policy if exists "profiles: owner select" on public.profiles;
create policy "profiles: owner select" on public.profiles
  for select to authenticated using (id = auth.uid());

drop policy if exists "profiles: owner insert" on public.profiles;
create policy "profiles: owner insert" on public.profiles
  for insert to authenticated with check (id = auth.uid());

drop policy if exists "profiles: owner update" on public.profiles;
create policy "profiles: owner update" on public.profiles
  for update to authenticated using (id = auth.uid());

-- companies: owner full access; members can read non-anonymous names for the forum.
drop policy if exists "companies: owner all" on public.companies;
create policy "companies: owner all" on public.companies
  for all to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());

drop policy if exists "companies: member directory" on public.companies;
create policy "companies: member directory" on public.companies
  for select to authenticated using (true);

-- pain_submissions: public aggregate read, owner write.
drop policy if exists "pain_submissions: public read" on public.pain_submissions;
create policy "pain_submissions: public read" on public.pain_submissions
  for select to anon, authenticated using (true);

drop policy if exists "pain_submissions: owner insert" on public.pain_submissions;
create policy "pain_submissions: owner insert" on public.pain_submissions
  for insert to authenticated with check (private.owns_company(company_id));

-- policy_updates: read-only for members; written by service role / staff only.
drop policy if exists "policy_updates: member read" on public.policy_updates;
create policy "policy_updates: member read" on public.policy_updates
  for select to authenticated using (true);

-- compliance_tasks / document_vault: strictly company-scoped.
drop policy if exists "compliance_tasks: owner all" on public.compliance_tasks;
create policy "compliance_tasks: owner all" on public.compliance_tasks
  for all to authenticated
  using (private.owns_company(company_id)) with check (private.owns_company(company_id));

drop policy if exists "document_vault: owner all" on public.document_vault;
create policy "document_vault: owner all" on public.document_vault
  for all to authenticated
  using (private.owns_company(company_id)) with check (private.owns_company(company_id));

-- forum_posts: every member can read; only the owning company can post/delete.
drop policy if exists "forum_posts: member read" on public.forum_posts;
create policy "forum_posts: member read" on public.forum_posts
  for select to authenticated using (true);

drop policy if exists "forum_posts: owner insert" on public.forum_posts;
create policy "forum_posts: owner insert" on public.forum_posts
  for insert to authenticated with check (private.owns_company(company_id));

drop policy if exists "forum_posts: owner delete" on public.forum_posts;
create policy "forum_posts: owner delete" on public.forum_posts
  for delete to authenticated using (private.owns_company(company_id));

-- ---------------------------------------------------------------------------
-- Seed: initial policy intelligence feed
-- ---------------------------------------------------------------------------

insert into public.policy_updates (title, summary, impact_level, date_issued) values
  ('Omnibus I: CSRD scope cut to 1,000+ employees',
   'The Commission proposes removing ~80% of companies from CSRD scope and delaying wave-2 reporting by two years. Mid-caps between 250 and 1,000 employees should pause ESRS gap analyses pending the Parliament vote.',
   'High', '2026-09-02'),
  ('CSDDD transposition deadline pushed to July 2028',
   'Member States gain an additional year to transpose the Corporate Sustainability Due Diligence Directive. Supply-chain mapping obligations for tier-1 suppliers remain, but civil liability provisions are softened.',
   'High', '2026-08-19'),
  ('EUDR: simplified due diligence for low-risk countries',
   'Operators sourcing from countries benchmarked "low risk" may file simplified due diligence statements. Importers of timber, soy, cocoa, coffee, palm oil, rubber and cattle should re-check country benchmarks.',
   'Med', '2026-08-05'),
  ('CBAM definitive period: certificate purchases begin',
   'From 2026 importers of steel, aluminium, cement, fertilisers, electricity and hydrogen must surrender CBAM certificates. A 50-tonne de minimis threshold exempts most occasional importers.',
   'Med', '2026-07-22'),
  ('EU Taxonomy: reduced reporting templates adopted',
   'Delegated act cuts Taxonomy KPI data points by ~70% and introduces a 10% materiality threshold for non-eligible activities.',
   'Low', '2026-07-01')
on conflict do nothing;
