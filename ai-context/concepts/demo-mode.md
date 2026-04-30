# Demo Mode

## What it does
Allows anyone to explore the coach and client portals without authentication by appending `?demo=true` to the URL. Used for the marketing site's "Explore Platform" feature and footer demo links.

## How it works (step by step)
1. User clicks a demo link (e.g., `/coach?demo=true` or `/client?demo=true`).
2. `CoachGuard` / `ClientGuard` in `auth-guard.tsx` checks `searchParams.get("demo") === "true"`.
3. If demo mode: guard renders children immediately, skipping all auth checks.
4. Each page's `useEffect` checks `useIsDemo()` — if true, sets hardcoded mock data and returns early without calling Supabase.
5. Navigation links append `?demo=true` via `useDemoSuffix()` or manual string concatenation.

## Business rules
- Demo mode shows different (hardcoded) data on each page — it's not a shared mock database.
- Write operations in demo mode either do nothing or show a fake success after a timeout.
- The demo suffix must be propagated through all navigation — if it's lost, the user hits the auth guard and gets redirected to login.

## Gotchas
- Demo mode completely bypasses auth — there's no "demo user" concept, just no auth check at all.
- Each page independently defines its demo data. There's no consistency between pages (e.g., the client dashboard shows different data than the client plan page).
- The `useIsDemo()` hook uses `useSearchParams()` which requires a Suspense boundary.
- If a page forgets to check `isDemo` in its useEffect, it will try to fetch from Supabase with no user and silently return empty data.

## Key files
- `src/lib/use-demo.ts` — `useIsDemo()`, `useDemoLink()`, `useDemoSuffix()`
- `src/components/auth-guard.tsx` — demo bypass in guards
- `src/app/about-platform/page.tsx` — embeds demo pages in iframes
- `src/app/page.tsx` — footer links to demo pages
