# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at localhost:3000
npm run build     # Production build (runs type-check + lint)
npm run lint      # ESLint
```

No test suite exists. Type-check only: `npx tsc --noEmit` (runs from project root, covers both `src/` and `scripts/`).

### Scripts (run from project root)

```bash
npx ts-node --esm scripts/migrate.ts ./cards-jwasham-extreme.db
npx ts-node --esm scripts/recategorize.ts
```

Both scripts require `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Migration also needs `MIGRATION_USER_ID`.

## Architecture

### App Router layout

- `(auth)/` — unauthenticated routes (`/login`, `/auth/callback`)
- `(protected)/` — all authenticated routes. The layout provides the sidebar + mobile nav shell
- `(protected)/page.tsx` — dashboard (server component, runs parallel Supabase queries)
- `(protected)/study/page.tsx` + `StudyClient.tsx` — study flow. Page is a server component that fetches all due cards and category counts, passes to the client component. Category switching is fully client-side (no URL params, no server re-fetch).
- `(protected)/cards/` — card management CRUD

### Data flow for study sessions

1. `study/page.tsx` fetches up to 200 due cards (all categories) from Supabase (server-side, with RLS)
2. Passes `CardWithFsrs[]` and `categoryCounts` to `StudyClient`, which calls `useStudySession`
3. `useStudySession` (client hook) manages `activeCategory`, `reviewedCardIds`, and `isFlipped` state. Category switching is instant (client-side filter, no server round-trip). Reviewed cards are tracked globally across category switches. Calls `lib/fsrs/scheduler.ts` to compute next intervals, then writes back to `card_fsrs_state` and `review_logs` via the browser Supabase client

### Supabase client pattern

- **Server components / Route handlers**: `import { createClient } from '@/lib/supabase/server'` — uses `@supabase/ssr` with Next.js cookie store
- **Client components / hooks**: `import { createClient } from '@/lib/supabase/client'` — standard browser client
- **Scripts**: direct `createClient` from `@supabase/supabase-js` with service role key

Auth is handled entirely by middleware (`src/middleware.ts`). Every route except `/login`, `/api/*`, and `/~offline` redirects to `/login` if unauthenticated.

### Database schema (3 tables, full RLS)

- `cards` — `id, user_id, front, back, category (enum), tags, source_id`
- `card_fsrs_state` — 1:1 with cards; all FSRS fields (`due`, `stability`, `difficulty`, `state`, etc.)
- `review_logs` — append-only log of every rating event

`category` is a Postgres enum: `general | code | data_structures | algorithms | os | networking | custom`. Migrations live in `supabase/migrations/` and must be run manually in the Supabase SQL editor.

### Card classification (`scripts/classify.ts`)

`classifyCard(front, back, originalType)` uses priority-ordered regex rules to assign categories. Priority: networking > os > algorithms > data_structures > code (type=2) > general. Context-aware patterns handle ambiguous terms ("process/thread" requires OS qualifiers, "heap" requires data-structure qualifiers).

### FSRS integration

`lib/fsrs/scheduler.ts` wraps `ts-fsrs`. FSRS is configured with `request_retention: 0.9`, `maximum_interval: 365`, fuzz and short-term scheduling enabled. `getSchedulingOptions(dbState)` returns all four rating outcomes (Again/Hard/Good/Easy) with their projected intervals. The hook calls `fsrs.repeat()` and picks the chosen rating on submit.

### UI conventions

- shadcn/ui components in `src/components/ui/` — "new-york" style, `neutral` base color, Tailwind CSS 4, CSS variables
- Add new shadcn components with: `npx shadcn add <component>`
- Lucide icons
- PWA is disabled in development; service worker only activates in production builds

### Keep-alive cron

`vercel.json` schedules `GET /api/keep-alive` daily at 10:00 UTC to prevent Supabase free-tier project pausing.
