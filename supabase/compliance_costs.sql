-- EU Standard Cost Model table. Apply in the Supabase SQL editor after schema.sql.

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
