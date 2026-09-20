-- Sport History Clue
-- Run in the Supabase SQL editor. RLS is on from the start.
-- Puzzle answers stay in the local catalog / this table is for validated scores only.

create table if not exists public.score_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  puzzle_id text not null,
  mode text not null check (mode in ('daily', 'expedition')),
  date_key date,
  expedition_slug text,
  clues_revealed integer not null check (clues_revealed between 1 and 6),
  wrong_event_guesses integer not null check (wrong_event_guesses >= 0),
  year_delta integer not null check (year_delta >= 0),
  score integer not null check (score >= 0),
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
create policy "public can insert scores"
  on public.score_submissions
  for insert
  to anon, authenticated
  with check (true);

create policy "public can read scores"
  on public.score_submissions
  for select
  to anon, authenticated
  using (true);
