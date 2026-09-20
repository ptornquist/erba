# Sport History Clue

A daily sports-history guessing game. You are given progressive archival clues — a cropped image plate, a redacted box score, a line of period copy — and you name the moment and the year.

## Modes

- **Daily Brief** (`/daily`) — one UTC puzzle for everyone
- **Expeditions** (`/expeditions`) — time-travel campaigns through five eras

Scoring starts at 1000. Clue 1 is free. Later clues, wrong event names, and year distance all deduct. The Next.js `/api/score` route is the authority; answers never ship to the client.

## Stack

- Next.js App Router (`src/`) · TypeScript · Tailwind CSS v4
- shadcn-style primitives in `src/components/ui`
- Framer Motion for clue-reveal transitions
- Optional Supabase persistence for validated scores
- No geographical map libraries (plates are SVG, not maps)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test      # scoring formulas
npm run build
```

## Supabase (optional)

The game runs from the local catalog with no backend. To store a public scoreboard, create a project, copy `.env.example` to `.env.local`, and run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor.

## Layout

```
.cursorrules
src/app/page.tsx                 landing + mode selector
src/app/daily/page.tsx
src/app/expeditions/[slug]/page.tsx
src/app/api/                     scoring validation
src/components/game/ClueCard.tsx
src/components/game/InputBar.tsx
src/components/game/ScoreCard.tsx
src/lib/scoring.ts
src/lib/supabase/
```
