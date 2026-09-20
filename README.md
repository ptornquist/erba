# Sport History Clue

A daily sports-history guessing game. You are given progressive archival clues — a cropped image plate, a redacted box score, a line of period copy — and you name the **subject** and the **year**.

## Modes

- **Play** (`/play`) — random plate from the archive, next file after you score
- **Daily Brief** (`/daily`) — one UTC puzzle for everyone
- **Expeditions** (`/expeditions`) — time-travel campaigns through five eras

Scoring starts at **10 000**. Clue 1 is free. Each extra clue costs **2 000**. A fully correct year + subject never drops below **1 000**; anything else scores 0. `POST /api/validate` and `POST /api/score` are the authority. Answers never ship to the client unless both fields match.

Subject matching is exact after `normalizeText` (lowercase, NFD, strip combining marks). Autocomplete may still be fuzzy; the archive only awards points for an accepted name or alias.

## Stack

- Next.js App Router (`src/`) · TypeScript · Tailwind CSS v4
- shadcn-style primitives in `src/components/ui`
- Framer Motion for clue-reveal transitions
- Optional Supabase: `puzzles` (service role) + `score_submissions`
- No geographical map libraries (plates are SVG, not maps)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test      # scoring + normalization
npm run build
```

## Supabase (optional)

The game runs from the local catalog with no backend. To store answers and a public scoreboard, create a project, copy `.env.example` to `.env.local` (including `SUPABASE_SERVICE_ROLE_KEY`), and run [`supabase/schema.sql`](supabase/schema.sql) plus [`supabase/seed.sql`](supabase/seed.sql) in the SQL editor.

`public.puzzles` has RLS enabled and **no anon SELECT**. Only the service-role key used in `src/lib/supabase/admin.ts` can read facit.

`/login` uses the anon/publishable browser client for email + password. `/profile` is protected with `getClaims()`. Confirm sign-ups land on `/auth/callback`.

## Layout

```
.cursorrules
src/app/page.tsx                 landing + mode selector
src/app/login/page.tsx           email + password (Logga in / Skapa konto)
src/app/profile/page.tsx
src/app/daily/page.tsx
src/app/expeditions/[slug]/page.tsx
src/app/api/score/route.ts       game scoring
src/app/api/validate/route.ts    year + subject validator
src/components/game/ClueCard.tsx
src/components/game/InputBar.tsx
src/components/game/ScoreCard.tsx
src/lib/grade.ts
src/lib/scoring.ts
src/lib/supabase/admin.ts
```
