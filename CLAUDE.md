# Health Coach Platform — Claude Code Instructions

## Non-negotiable: read ai-context before every task

Before writing any code, touching any file, or proposing any plan — read these files in order:

1. `ai-context/AGENT_INDEX.md` — routes you to the right concept/integration files for the task
2. `ai-context/LANDMINES.md` — 17 documented footguns; check before touching existing code
3. `ai-context/coding-standards/correct-patterns.md` — how this codebase does things
4. `ai-context/coding-standards/anti-patterns.md` — what NOT to do
5. Load additional concept + integration files as directed by AGENT_INDEX.md

**If you skip this step and write code first, you will break things.** The landmines are real and have burned us before.

## What this codebase is

A white-label fitness coaching SaaS. One codebase, one Vercel deployment per coach-client, one Supabase project per coach-client. The `CLIENT_ID` env var determines which client's config and landing page to load.

**Full context:** `ai-context/CONTEXT.md`

## Stack (memorize these — no exceptions)

| Layer | Tech | Version |
|---|---|---|
| Framework | Next.js App Router | 16.2.1 |
| Language | TypeScript strict mode | 5 |
| Styling | Tailwind CSS 4 | `@tailwindcss/postcss` |
| Database + Auth | Supabase (postgres + auth + storage) | `@supabase/supabase-js` v2 |
| Charts | Recharts | 3.8 |
| PDF | jsPDF | 4.2 |
| Icons | Lucide React | latest |
| Compiler | React Compiler | enabled |

## The five rules that save you every time

### 1. All data fetching is client-side only
No server components, no server actions, no API routes. Every page is `"use client"`. Data loads in `useEffect` after `user` is set from `useAuth()`. If you're about to write an async server component — stop.

### 2. All DB operations go through `src/lib/db.ts`
Never call `getSupabase()` from a page component directly (except for the 3 existing exceptions in CONTEXT.md). Reads return `data || []`. Writes return `{ error: string | null }`.

### 3. Every page that uses `useSearchParams()` needs a Suspense boundary
```tsx
export default function MyPage() {
  return <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}><MyPageInner /></Suspense>;
}
function MyPageInner() { /* useSearchParams() here */ }
```

### 4. Every page must handle demo mode
```tsx
useEffect(() => {
  if (isDemo) { setData(HARDCODED_DEMO); setLoading(false); return; }
  if (user) loadData();
}, [user, isDemo]);
```

### 5. Never hardcode client-specific values in shared code
Brand name, coach name, prices, colors, contact info — always read from `import { config } from "@/lib/config"`.

## Critical landmines (inline — full list in ai-context/LANDMINES.md)

- **CLIENT_ID** must be set explicitly in every Vercel deployment — defaults to first client otherwise
- **Register new clients in TWO places**: `site.config.ts` AND `src/app/page.tsx`
- **Delete-and-reinsert pattern** for template updates — slot IDs change on every save, don't rely on stable IDs
- **snake_case in DB, camelCase in TypeScript** — never pass camelCase field names to Supabase queries
- **UUID columns** — convert `"other"` / `""` / `"skipped"` to `null` before insert or Postgres throws
- **RLS on ALL joined tables** — if you join A→B→C, the client needs SELECT policy on A, B, and C
- **Storage buckets** must be created before upload — no TypeScript error, only runtime failure
- **When adding a DB column** — update CREATE function, UPDATE function, AND row mapper — miss any one and data silently drops

## Workflow for every task

```
1. Read the task → summarize in one sentence → wait for confirmation
2. Load AGENT_INDEX.md → identify which concept/integration files apply → read them
3. Find the relevant source files before touching anything
4. Check LANDMINES.md against your planned change
5. Propose your approach (one line for small tasks, short plan for multi-file changes)
6. Implement one layer at a time
7. After finishing: run through relevant TEST_FLOWS.md flows
```

## Multi-client awareness

Every change to `src/` deploys to ALL clients. Ask yourself:
- Does this hardcode anything that should come from `config`?
- Does this add a required field to `clients/types.ts`? (Update ALL client configs if so)
- Does this break any other client's deployment?

## Invoke the health-coach skill for complex builds

When building a new feature, new page, or new DB operation — invoke the `health-coach` skill:

```
Skill: health-coach
```

The skill runs the full pre-flight sequence and enforces production-quality patterns specific to this stack.
