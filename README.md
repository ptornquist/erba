# ERBA – European Regulatory Burden Alliance

High-velocity advocacy platform for mid-cap CEOs documenting the cumulative cost of EU regulation.

## Stack

- Next.js (App Router) · TypeScript (strict) · Tailwind CSS v4
- Shadcn-style primitives implemented directly in `components/ui`
- Supabase (Auth + Postgres) via `@supabase/supabase-js` and `@supabase/ssr`
- `react-hook-form` + `zod` for validation · `lucide-react` icons

## Getting started

```bash
cp .env.example .env.local   # add your Supabase URL + anon key
npm install
npm run dev
```

## Routes

| Route         | Description                                                                 |
| ------------- | --------------------------------------------------------------------------- |
| `/`           | Landing page: hero, momentum bar, "Why Now" columns                         |
| `/join`       | 3-step onboarding wizard (Account → Company → Pain Index); `?ref=CODE` supported; `?mode=signin` for returning members |
| `/dashboard`  | Member War Room + Referral Tracker (auth required, redirects to `/join`)    |
| `/pain-index` | Public data viz: total documented cost + leaderboard by regulation          |

## Database

The app expects these tables (see `types/database.ts`):

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  referral_code text not null unique,
  referred_by text,
  created_at timestamptz not null default now()
);

create table companies (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  turnover_band text not null,
  industry text not null,
  is_anonymous boolean not null default false,
  created_at timestamptz not null default now()
);

create table pain_submissions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  regulation_name text not null,
  estimated_cost_eur numeric not null,
  description text,
  created_at timestamptz not null default now()
);
```

Suggested RLS policies: authenticated users can insert/select their own `profiles` and `companies` rows (and `pain_submissions` for their companies); `pain_submissions` is publicly readable (`select` for `anon`) so the Pain Index can aggregate it. Reading `profiles` filtered by `referred_by` requires a `select` policy for authenticated users on that column, or a security-definer RPC.

## Project layout

```
app/                 routes (page.tsx per route) + layout + globals.css
components/ui/       Button, Input, Label, Select, Switch, Card, Progress, Badge, Alert, Textarea
components/join/     onboarding wizard, sign-in form
components/dashboard Burden Alert card, Referral Tracker
lib/supabase.ts      browser client
lib/supabase-server.ts  server + public (anon) clients
lib/validations/     zod schemas
proxy.ts             session refresh + /dashboard route guard
types/database.ts    strict table types
```
