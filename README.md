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
| `/dashboard`  | Overview: War Room + Referral Tracker (auth required, redirects to `/join`) |
| `/dashboard/policy` | Dynamic Policy Dashboard – `policy_updates` feed with impact filters  |
| `/dashboard/checklists` | Automated Compliance Checklists – per-company `compliance_tasks`, auto-provisioned from industry templates, toggle/add/remove |
| `/dashboard/vault` | Secure Document Vault – `document_vault` data table, mock upload, CSV export |
| `/dashboard/forum` | Alliance Networking Hub – members-only `forum_posts` feed and composer |
| `/pain-index` | Public data viz: total documented cost + leaderboard by regulation          |

## Database

The full schema (seven tables), row-level-security policies and a seed for the policy feed live in [`supabase/schema.sql`](supabase/schema.sql). Run it in the Supabase SQL editor on a fresh project. TypeScript types for every table are in `types/database.ts`.

| Table               | Purpose                                                      | Access (RLS)                                   |
| ------------------- | ------------------------------------------------------------ | ---------------------------------------------- |
| `profiles`          | One row per auth user; referral code                          | Owner read/write                               |
| `companies`         | Company profile(s) owned by a member                          | Owner write; members read (for forum authors)  |
| `pain_submissions`  | Regulatory cost data points                                   | Public read (Pain Index); owner insert         |
| `policy_updates`    | Curated regulatory intelligence feed                          | Members read; staff/service-role write         |
| `compliance_tasks`  | Per-company checklist items                                   | Owning company only                            |
| `document_vault`    | Certificate / evidence metadata                               | Owning company only                            |
| `forum_posts`       | Networking Hub posts                                          | Members read; owning company insert/delete     |

File storage for the vault is mocked in the MVP: rows are written with a `vault://` URI so the table, export and RLS paths are exercised without a Storage bucket.

## Project layout

```
app/                 routes (page.tsx per route) + layout + globals.css
components/ui/       Button, Input, Label, Select, Switch, Card, Progress, Badge, Alert, Textarea
components/join/     onboarding wizard, sign-in form
components/dashboard sidebar nav, Burden Alert card, Referral Tracker, policy feed, checklist board, document vault, forum feed
lib/dashboard.ts    per-request auth + company context for dashboard routes
lib/compliance-templates.ts  industry checklist templates
supabase/schema.sql  tables, RLS policies, seed data
lib/supabase.ts      browser client
lib/supabase-server.ts  server + public (anon) clients
lib/validations/     zod schemas
proxy.ts             session refresh + /dashboard route guard
types/database.ts    strict table types
```
