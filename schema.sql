-- ERBA — Supabase PostgreSQL schema
-- Apply in the Supabase SQL editor or via the CLI.
-- public.users is the application profile table (distinct from auth.users).
-- Pain submissions follow EU Better Regulation Toolbox Tool #58 (Standard Cost Model).

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'turnover_band'
      and n.nspname = 'public'
  ) then
    create type public.turnover_band as enum (
      'under_2m',
      'from_2m_to_10m',
      'from_10m_to_50m',
      'over_50m'
    );
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'verification_status'
      and n.nspname = 'public'
  ) then
    create type public.verification_status as enum (
      'self_reported',
      'evidence_supplied',
      'verified'
    );
  end if;
end
$$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now(),
  referral_code text not null unique,
  referred_by text,
  constraint users_referred_by_fkey
    foreign key (referred_by) references public.users (referral_code)
    on update cascade
    on delete set null,
  constraint users_no_self_referral
    check (referred_by is distinct from referral_code)
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  turnover_band public.turnover_band not null,
  industry text not null,
  is_anonymous boolean not null default false,
  constraint companies_user_id_fkey
    foreign key (user_id) references public.users (id)
    on delete cascade
);

create table if not exists public.pain_submissions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  regulation_name text not null,
  description text not null,
  internal_admin_cost_eur numeric(14, 2) not null default 0,
  external_compliance_cost_eur numeric(14, 2) not null default 0,
  estimated_cost_eur numeric(14, 2) not null,
  verification_status public.verification_status not null default 'self_reported',
  evidence_path text,
  evidence_file_name text,
  scm_tool_reference text not null default 'EU Better Regulation Toolbox — Tool #58',
  constraint pain_submissions_company_id_fkey
    foreign key (company_id) references public.companies (id)
    on delete cascade,
  constraint pain_submissions_internal_cost_non_negative
    check (internal_admin_cost_eur >= 0),
  constraint pain_submissions_external_cost_non_negative
    check (external_compliance_cost_eur >= 0),
  constraint pain_submissions_estimated_cost_non_negative
    check (estimated_cost_eur >= 0),
  constraint pain_submissions_scm_total_matches
    check (
      estimated_cost_eur = internal_admin_cost_eur + external_compliance_cost_eur
    )
);

alter table public.pain_submissions
  add column if not exists internal_admin_cost_eur numeric(14, 2) not null default 0,
  add column if not exists external_compliance_cost_eur numeric(14, 2) not null default 0,
  add column if not exists verification_status public.verification_status not null default 'self_reported',
  add column if not exists scm_tool_reference text not null default 'EU Better Regulation Toolbox — Tool #58';

create index if not exists companies_user_id_idx
  on public.companies (user_id);

create index if not exists pain_submissions_company_id_idx
  on public.pain_submissions (company_id);

create index if not exists pain_submissions_verification_status_idx
  on public.pain_submissions (verification_status);

create index if not exists users_referred_by_idx
  on public.users (referred_by);

comment on table public.users is 'Application user profiles and referral graph.';
comment on column public.users.referred_by is 'referral_code of the inviting user, if any.';
comment on table public.companies is 'Companies linked to an ERBA user.';
comment on column public.companies.is_anonymous is 'When true, company identity must not be shown in public ledger views.';
comment on table public.pain_submissions is 'SCM-aligned regulatory cost submissions (EU Better Regulation Toolbox Tool #58).';
comment on column public.pain_submissions.internal_admin_cost_eur is 'Internal administrative labour: staff hours, paperwork, internal reporting.';
comment on column public.pain_submissions.external_compliance_cost_eur is 'External legal counsel, auditors, consultants, dedicated compliance software.';
comment on column public.pain_submissions.estimated_cost_eur is 'Combined SCM burden: internal administrative + external compliance costs.';
comment on column public.pain_submissions.verification_status is 'Three-tier verification: self_reported, evidence_supplied, verified.';
comment on column public.pain_submissions.scm_tool_reference is 'Canonical methodology citation, typically EU Better Regulation Toolbox — Tool #58.';

alter table public.users enable row level security;
alter table public.companies enable row level security;
alter table public.pain_submissions enable row level security;

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on table public.users to anon, authenticated;
grant select, insert, update, delete on table public.companies to anon, authenticated;
grant select, insert, update, delete on table public.pain_submissions to anon, authenticated;

drop policy if exists users_insert_public on public.users;
create policy users_insert_public
  on public.users
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists companies_insert_public on public.companies;
create policy companies_insert_public
  on public.companies
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists pain_submissions_insert_public on public.pain_submissions;
create policy pain_submissions_insert_public
  on public.pain_submissions
  for insert
  to anon, authenticated
  with check (verification_status = 'self_reported');

drop policy if exists companies_select_public on public.companies;
create policy companies_select_public
  on public.companies
  for select
  to anon, authenticated
  using (true);

drop policy if exists pain_submissions_select_public on public.pain_submissions;
create policy pain_submissions_select_public
  on public.pain_submissions
  for select
  to anon, authenticated
  using (true);

drop policy if exists pain_submissions_update_evidence on public.pain_submissions;
create policy pain_submissions_update_evidence
  on public.pain_submissions
  for update
  to anon, authenticated
  using (verification_status = 'self_reported')
  with check (verification_status = 'evidence_supplied');

-- Authorization lives on profiles.is_admin, not in user-editable JWT metadata.
-- Clients may read their own flag. They cannot insert or update it.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  is_admin boolean not null default false
);

comment on table public.profiles is 'Auth profile. is_admin is granted only by a privileged SQL or service-role write.';
comment on column public.profiles.is_admin is 'Strict admin gate for /admin. Default false.';

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

-- Compliance files. Authenticated owners may insert their own evidence.
-- Admins read files through the service-role evidence route after is_admin is confirmed.
create table if not exists public.document_vault (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  pain_submission_id uuid,
  file_name text not null,
  storage_path text not null,
  created_at timestamptz not null default now(),
  constraint document_vault_company_id_fkey
    foreign key (company_id) references public.companies (id)
    on delete cascade,
  constraint document_vault_pain_submission_id_fkey
    foreign key (pain_submission_id) references public.pain_submissions (id)
    on delete cascade
);

create index if not exists document_vault_company_id_idx
  on public.document_vault (company_id);

create index if not exists document_vault_pain_submission_id_idx
  on public.document_vault (pain_submission_id);

comment on table public.document_vault is 'Private compliance evidence. Readable only through the admin server path.';

alter table public.document_vault enable row level security;

alter table public.document_vault
  add column if not exists file_url text,
  add column if not exists storage_path text,
  add column if not exists pain_submission_id uuid;

alter table public.pain_submissions
  add column if not exists evidence_path text,
  add column if not exists evidence_file_name text;

comment on column public.pain_submissions.evidence_path is 'Object path in the evidence-vault storage bucket.';
comment on column public.pain_submissions.evidence_file_name is 'Original filename for the attached compliance evidence.';

drop policy if exists document_vault_owner_insert on public.document_vault;
create policy document_vault_owner_insert
  on public.document_vault
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.companies c
      where c.id = company_id
        and c.profile_id = (select auth.uid())
    )
  );

drop policy if exists document_vault_owner_select on public.document_vault;
create policy document_vault_owner_select
  on public.document_vault
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.companies c
      where c.id = company_id
        and c.profile_id = (select auth.uid())
    )
  );

grant insert, select on table public.document_vault to authenticated;

insert into storage.buckets (id, name, public)
values ('evidence-vault', 'evidence-vault', false)
on conflict (id) do nothing;

drop policy if exists "evidence-vault: owner insert" on storage.objects;
create policy "evidence-vault: owner insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'evidence-vault'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );

drop policy if exists "evidence-vault: owner select" on storage.objects;
create policy "evidence-vault: owner select"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'evidence-vault'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );

drop policy if exists "evidence-vault: owner update" on storage.objects;
create policy "evidence-vault: owner update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'evidence-vault'
    and split_part(name, '/', 1) = (select auth.uid())::text
  )
  with check (
    bucket_id = 'evidence-vault'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );

-- EU Standard Cost Model cost records (Tool #58). ERBA writes
-- erba_normalised_cost in a trigger; clients must not set it.
create table if not exists public.compliance_costs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  pain_submission_id uuid,
  framework_name text not null,
  internal_admin_hours numeric(14, 2) not null default 0,
  average_hourly_wage numeric(14, 2) not null default 0,
  external_consulting_cost numeric(14, 2) not null default 0,
  it_and_system_cost numeric(14, 2) not null default 0,
  capital_cost numeric(14, 2) not null default 0,
  total_reported_cost numeric(14, 2) not null,
  erba_normalised_cost numeric(14, 2),
  verification_tier smallint not null default 1,
  evidence_documents text[] not null default '{}',
  created_at timestamptz not null default now(),
  constraint compliance_costs_company_id_fkey
    foreign key (company_id) references public.companies (id)
    on delete cascade,
  constraint compliance_costs_pain_submission_id_fkey
    foreign key (pain_submission_id) references public.pain_submissions (id)
    on delete set null,
  constraint compliance_costs_hours_non_negative
    check (internal_admin_hours >= 0),
  constraint compliance_costs_wage_non_negative
    check (average_hourly_wage >= 0),
  constraint compliance_costs_consulting_non_negative
    check (external_consulting_cost >= 0),
  constraint compliance_costs_it_non_negative
    check (it_and_system_cost >= 0),
  constraint compliance_costs_capital_non_negative
    check (capital_cost >= 0),
  constraint compliance_costs_total_non_negative
    check (total_reported_cost >= 0),
  constraint compliance_costs_tier_valid
    check (verification_tier in (1, 2, 3))
);

create index if not exists compliance_costs_company_id_idx
  on public.compliance_costs (company_id);

create index if not exists compliance_costs_verification_tier_idx
  on public.compliance_costs (verification_tier);

comment on table public.compliance_costs is 'EU Standard Cost Model inputs. erba_normalised_cost is computed server-side.';
comment on column public.compliance_costs.verification_tier is '1 = Self-reported, 2 = Evidence supplied, 3 = Independently verified.';
comment on column public.compliance_costs.erba_normalised_cost is 'hours × wage + consulting + IT + capital, written by trigger.';

create or replace function public.compute_erba_normalised_cost()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.erba_normalised_cost :=
    coalesce(new.internal_admin_hours, 0) * coalesce(new.average_hourly_wage, 0)
    + coalesce(new.external_consulting_cost, 0)
    + coalesce(new.it_and_system_cost, 0)
    + coalesce(new.capital_cost, 0);
  return new;
end;
$$;

drop trigger if exists compliance_costs_normalise on public.compliance_costs;
create trigger compliance_costs_normalise
  before insert or update of
    internal_admin_hours,
    average_hourly_wage,
    external_consulting_cost,
    it_and_system_cost,
    capital_cost
  on public.compliance_costs
  for each row
  execute function public.compute_erba_normalised_cost();

alter table public.compliance_costs enable row level security;

grant select, insert, update on table public.compliance_costs to anon, authenticated;

drop policy if exists compliance_costs_select_public on public.compliance_costs;
create policy compliance_costs_select_public
  on public.compliance_costs
  for select
  to anon, authenticated
  using (true);

drop policy if exists compliance_costs_insert_self_reported on public.compliance_costs;
create policy compliance_costs_insert_self_reported
  on public.compliance_costs
  for insert
  to authenticated
  with check (
    verification_tier in (1, 2)
    and (
      verification_tier = 1
      or cardinality(coalesce(evidence_documents, '{}'::text[])) > 0
    )
    and exists (
      select 1
      from public.companies c
      where c.id = company_id
        and c.profile_id = (select auth.uid())
    )
  );

drop policy if exists compliance_costs_update_evidence on public.compliance_costs;
create policy compliance_costs_update_evidence
  on public.compliance_costs
  for update
  to authenticated
  using (verification_tier = 1)
  with check (verification_tier = 2);

