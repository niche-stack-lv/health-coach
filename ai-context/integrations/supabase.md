# Supabase

## What it does here
Supabase provides the entire backend: PostgreSQL database, authentication (email/password), file storage (check-in photos), and row-level security. There are no API routes — all operations go directly from the browser to Supabase using the anon key.

## Where the client/wrapper lives
- **Client singleton:** `src/lib/supabase.ts` — `getSupabase()` returns a cached `SupabaseClient`
- **All DB operations:** `src/lib/db.ts` — every CRUD function for every entity
- **Auth context:** `src/lib/auth-context.tsx` — signUp, signIn, signOut, role fetching
- **Direct usage:** `src/app/(coach)/coach/check-ins/page.tsx` (feedback update), `src/app/(client)/client/check-in/page.tsx` (photo upload), `src/app/forgot-password/page.tsx` (password reset)

## Common operations

| Function | Params | Notes |
|----------|--------|-------|
| `getClients(coachId)` | coach's user ID | Joins with profiles via FK |
| `addClient(coachId, email, name, goal)` | — | Creates auth user + profile + client record (3 separate inserts, no transaction) |
| `getDietPlans(coachId)` | — | Includes meals and client profile via joins |
| `createDietPlan(plan)` | plan object with meals array | Inserts plan then meals separately |
| `updateDietPlanMeals(planId, meals)` | — | Deletes all meals then re-inserts (no transaction). Returns `{ error }` on failure. |
| `getWorkoutPlans(coachId)` | — | Includes days and client profile |
| `getWorkoutPlan(planId)` | single plan ID | Returns single plan with days and client |
| `createWorkoutPlan(plan)` | plan with days array | Inserts plan then days separately |
| `updateWorkoutPlanDays(planId, days)` | — | Deletes all days then re-inserts (no transaction). Returns `{ error }` on failure. |
| `getCheckIns(clientId)` | — | Client's own check-ins |
| `getCoachCheckIns(coachId)` | — | First fetches client IDs, then check-ins with `.in()` |
| `createCheckIn(checkIn)` | — | Simple insert |
| `getMeasurements(clientId)` | — | Ordered by date ascending |
| `addMeasurement(m)` | — | Simple insert |
| `getHabits(clientId)` / `getHabitLogs(clientId, date)` | — | — |
| `toggleHabitLog(habitId, clientId, date, completed, value?)` | — | Upsert pattern: checks for existing, updates or inserts. Optional `value` param persisted. |
| `saveLead(lead)` | lead object | Anonymous insert (no auth required) |
| `getLeads()` / `updateLeadStatus(id, status)` | — | Requires authenticated user |
| `searchProfiles(query)` | search string | `ilike` search on name and email, role=client only |
| `promoteToClient(coachId, profileId, goal)` | — | Checks for existing client record first |
| `getCheckInPhotoUrls(paths)` | array of storage paths | Returns signed URLs (1hr expiry) for check-in photos |

## Error handling
- **Read operations:** Errors are silently swallowed. `{ data }` is destructured and `data || []` is returned.
- **Write operations:** Return `{ error: string | null }`. The error message comes from `error?.message`.
- **Auth operations:** Return `{ error: string }` from `auth-context.tsx`.

## Known quirks
- `getCoachCheckIns()` does a two-step query: first gets all client IDs for the coach, then fetches check-ins with `.in()`. This won't scale well with many clients.
- `addClient()` performs 3 sequential inserts (auth.signUp → profiles.insert → clients.insert). If step 2 or 3 fails, cleanup is attempted: profile is deleted on client insert failure, auth user deletion is best-effort (requires service role key).
- The Supabase client is created with the anon key only. There's no service role key usage — all access is governed by RLS policies.
- `@supabase/ssr` is installed but never imported anywhere. Only `@supabase/supabase-js` is used.
- All write operations return `{ error: string | null }` for consistent error handling.

## Env vars needed
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```
Both are required — the app throws at runtime if missing. Copy `.env.example` to `.env.local` to configure.

## Database tables (inferred from db.ts)

| Table | Key columns | Notes |
|-------|-------------|-------|
| `profiles` | id (= auth user id), name, email, role | Created on signup |
| `clients` | id (= profile id), coach_id, goal, status | FK to profiles |
| `diet_plans` | id, coach_id, client_id, title, description, start_date, end_date, weeks, status | — |
| `diet_meals` | id, plan_id, name, time, items (text[]), calories, protein, carbs, fat, sort_order | — |
| `workout_plans` | id, coach_id, client_id, title, status | — |
| `workout_days` | id, plan_id, day_label, name, exercises (jsonb), sort_order | — |
| `check_ins` | id, client_id, plan_id, date, week, weight, notes, photos (jsonb), coach_feedback, status | — |
| `measurements` | id, client_id, date, weight, body_fat, chest, waist, hips, arms, thighs | — |
| `habits` | id, coach_id, client_id, name, emoji, target | — |
| `habit_logs` | id, habit_id, client_id, date, completed | — |
| `leads` | id, source, name, email, phone, goal, program, plan_type, plan_label, price, duration, status, ... | Schema in `supabase-leads.sql` |

## Storage buckets
- `check-in-photos` — client progress photos, path format: `{userId}/{timestamp}_{type}.{ext}`
