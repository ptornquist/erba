# ERBA – European Regulatory Burden Alliance

High-velocity advocacy platform for companies and private individuals documenting the cumulative cost of EU regulation.

## Stack

- Next.js (App Router) · TypeScript (strict) · Tailwind CSS v4
- Shadcn-style primitives implemented directly in `components/ui`
- Supabase (Auth + Postgres) via `@supabase/supabase-js` and `@supabase/ssr`
- `react-hook-form` + `zod` for validation · `lucide-react` icons

## Getting started

```bash
npm install
npm run dev
# Optional: cp .env.example .env.local to point at a different Supabase project.
# The production project URL and public anon key are the defaults in lib/supabase-config.ts.
```

## Routes

| Route         | Description                                                                 |
| ------------- | --------------------------------------------------------------------------- |
| `/`           | Landing page: hero, momentum bar, "Why Now" columns                         |
| `/login`      | Dedicated member sign-in (unauthenticated dashboard visits land here)       |
| `/join`       | 3-step onboarding wizard (Account → Membership → optional Pain Index); companies and private individuals; `?ref=CODE` supported; `?mode=signin` redirects to `/login` |
| `/dashboard`  | Overview: War Room + Referral Tracker (auth required, redirects to `/login`) |
| `/dashboard/policy` | Dynamic Policy Dashboard – `policy_updates` feed with impact filters  |
| `/dashboard/checklists` | Automated Compliance Checklists – per-company `compliance_tasks`, auto-provisioned from industry templates, toggle/add/remove |
| `/dashboard/vault` | Secure Document Vault – `document_vault` data table, mock upload, CSV export |
| `/dashboard/forum` | Alliance Networking Hub – members-only `forum_posts` feed and composer |
| `/pain-index` | Public data viz: €0–€1 million scale, total documented cost + leaderboard by regulation          |
| `/playbook`    | Executive Action Playbook – three-step CEO deployment briefing                         |

Contact: `contact@euregburden.org`.

## Database

The full schema (seven tables), row-level-security policies and a seed for the policy feed live in [`supabase/schema.sql`](supabase/schema.sql); [`supabase/onboarding_trigger.sql`](supabase/onboarding_trigger.sql) adds the `auth.users` trigger that provisions `profiles`/`companies`/`pain_submissions` from the sign-up payload (required when email confirmation is enabled, since the browser has no session yet). Run both in the Supabase SQL editor on a fresh project. TypeScript types for every table are in `types/database.ts`.

Auth settings: add `<your-domain>/auth/callback` to **Authentication → URL Configuration → Redirect URLs** so email-confirmation links complete sign-in.

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
supabase/           schema.sql (tables, RLS, seed) + onboarding_trigger.sql
app/auth/callback   exchanges email-confirmation code for a session
lib/supabase.ts      browser client
lib/supabase-server.ts  server + public (anon) clients
lib/validations/     zod schemas
proxy.ts             session refresh + /dashboard → /login guard
types/database.ts    strict table types
```
