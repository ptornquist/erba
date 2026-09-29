-- Regulatory intelligence feed. Apply in the Supabase SQL editor if missing.

create table if not exists public.regulatory_policies (
  id uuid primary key default gen_random_uuid(),
  framework_name text not null,
  description text not null,
  deadline date not null,
  impact_level text not null,
  industry_tags text[] not null default '{}'
);

create index if not exists regulatory_policies_deadline_idx
  on public.regulatory_policies (deadline asc);

alter table public.regulatory_policies enable row level security;

grant select on table public.regulatory_policies to anon, authenticated;

drop policy if exists regulatory_policies_select_public on public.regulatory_policies;
create policy regulatory_policies_select_public
  on public.regulatory_policies
  for select
  to anon, authenticated
  using (true);
