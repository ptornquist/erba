-- Sport History Clue
-- Run in the Supabase SQL editor. RLS is on from the start.

-- Hidden answer sheet. The Next.js validation route reads this with the
-- service_role key (bypasses RLS). Anon and authenticated have no SELECT.
create table if not exists public.puzzles (
  id text primary key,
  target_year integer not null check (target_year between 1800 and 2035),
  target_subject text not null,
  accepted_aliases text[] not null default '{}'::text[],
  created_at timestamptz not null default now()
);

alter table public.puzzles enable row level security;

revoke all on table public.puzzles from anon, authenticated;
grant select, insert, update, delete on table public.puzzles to service_role;

create table if not exists public.score_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  puzzle_id text not null,
  mode text not null check (mode in ('daily', 'expedition')),
  date_key date,
  expedition_slug text,
  clues_revealed integer not null check (clues_revealed between 0 and 6),
  wrong_event_guesses integer not null default 0 check (wrong_event_guesses >= 0),
  year_delta integer not null default 0 check (year_delta >= 0),
  score integer not null check (score >= 0 and score <= 10000),
  solved boolean not null,
  perfect boolean not null default false,
  client_fingerprint text
);

create index if not exists score_submissions_daily_idx
  on public.score_submissions (date_key, score desc)
  where mode = 'daily' and solved = true;

alter table public.score_submissions enable row level security;

-- Anyone may insert a validated row posted by the Next.js score route using the anon key.
-- Reads are public so a simple daily board can be shown without auth.
drop policy if exists "public can insert scores" on public.score_submissions;
create policy "public can insert scores"
  on public.score_submissions
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "public can read scores" on public.score_submissions;
create policy "public can read scores"
  on public.score_submissions
  for select
  to anon, authenticated
  using (true);

-- After this file, run supabase/seed.sql to load catalog answer sheets.
