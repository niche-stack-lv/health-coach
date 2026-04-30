# Landmines — read before touching existing code

## 1. Supabase Credentials Require `.env.local`
**Location:** `src/lib/supabase.ts`
**What breaks:** The app throws at runtime if `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not set. There are no hardcoded fallbacks.
**Correct handling:** Copy `.env.example` to `.env.local` and fill in your Supabase project credentials. The app logs a warning at import time and throws on first `getSupabase()` call if missing.
**Status:** ✅ Resolved — credentials removed, `.env.example` added.

## 2. No Error Handling on DB Read Operations
**Location:** `src/lib/db.ts` (read functions)
**What breaks:** Read functions like `getClients`, `getDietPlans`, `getCheckIns`, etc. destructure `{ data }` and return `data || []` — errors are discarded. If Supabase is down or RLS blocks a query, the UI shows "no data" instead of an error.
**Correct handling:** This is an accepted trade-off for this project's scale. All write operations return `{ error: string | null }`. If you add new DB functions, follow the same split: reads return `data || []`, writes return `{ error }`.
**Status:** ⚠️ Accepted — read errors are silently swallowed by design. Write errors are all properly surfaced.

## 3. Delete-and-Reinsert Pattern for Meal/Day Updates
**Location:** `src/lib/db.ts` → `updateDietPlanMeals()`, `updateWorkoutPlanDays()`
**What breaks:** Updating meals or workout days deletes ALL existing rows and re-inserts them. Not wrapped in a transaction. If the insert fails after the delete, the plan loses all its data.
**Correct handling:** Both functions return `{ error }` so callers can detect failures. Meal/day IDs change on every save — don't rely on stable IDs. For true safety, use a Supabase RPC function with a transaction.
**Status:** ✅ Resolved — error handling added. Transaction safety remains a known limitation.

## 4. Demo Mode Bypasses All Auth
**Location:** `src/components/auth-guard.tsx`, every page with `useIsDemo()`
**What breaks:** Adding `?demo=true` to any coach or client URL completely bypasses authentication.
**Correct handling:** This is intentional for the marketing site. Don't add real data fetching to demo-mode code paths.
**Status:** ✅ By design — not a bug.

## 5. Client Signup Always Sets Role to "client"
**Location:** `src/app/signup/page.tsx`
**What breaks:** No way to create a coach account through the UI.
**Correct handling:** By design (single-coach system). Coach account must be created directly in Supabase.
**Status:** ✅ By design — not a bug.

## 6. Check-in Photos Now Viewable
**Location:** `src/app/(coach)/coach/check-ins/page.tsx`
**What breaks:** Previously photos were uploaded but never displayed. Now the coach can click "View photos" to load signed URLs and see them in a lightbox.
**Correct handling:** Photos use `createSignedUrl()` with 1-hour expiry. The `check-in-photos` Supabase Storage bucket must exist and allow authenticated reads.
**Status:** ✅ Resolved — photo display with lazy loading and lightbox added.

## 7. Database Schema Managed via Migrations
**Location:** `supabase/migrations/`
**What breaks:** Previously there was no schema in the repo. Now the full schema lives in `supabase/migrations/20250428000000_initial_schema.sql` and future changes go in new timestamped migration files.
**Correct handling:** Never edit an applied migration. Create a new one with `supabase migration new <name>`. Push with `supabase db push`. See `supabase/README.md` for the full workflow.
**Status:** ✅ Resolved — Supabase CLI migration structure set up.

## 8. Coach Can Now Manage Client Habits
**Location:** `src/app/(coach)/coach/clients/[id]/page.tsx`
**What breaks:** Previously `addHabit()` and `deleteHabit()` existed in `db.ts` but had no UI.
**Correct handling:** The client detail page now has a "Habits" tab where the coach can add and remove daily habits for a client.
**Status:** ✅ Resolved — habits tab added to client detail page.

## 9. Habit Values Now Persisted
**Location:** `src/lib/db.ts` → `toggleHabitLog()`, `src/app/(client)/client/habits/page.tsx`
**What breaks:** Previously the value (e.g., "2.5L") was tracked in React state but never saved to the database.
**Correct handling:** `toggleHabitLog()` now accepts an optional `value` parameter and stores it in the `habit_logs.value` column. The habits page passes the value when toggling.
**Status:** ✅ Resolved — value column used, passed from UI.

## 10. `addClient` Now Cleans Up on Partial Failure
**Location:** `src/lib/db.ts` → `addClient()`
**What breaks:** The function performs 3 sequential inserts (auth.signUp → profiles.insert → clients.insert). Previously, if step 2 or 3 failed, orphaned records were left behind.
**Correct handling:** If the profile insert fails, the function attempts to delete the auth user (logs a warning if it can't — admin API requires service role key). If the client insert fails, the profile is cleaned up. Auth user cleanup is best-effort since the anon key can't call `admin.deleteUser`.
**Status:** ✅ Resolved — cleanup logic added with best-effort auth user removal.
