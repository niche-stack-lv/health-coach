# Landmines — read before touching existing code

## 1. CLIENT_ID Required for Build
**Location:** `site.config.ts`, `next.config.ts`
**What breaks:** If `CLIENT_ID` is not set, the config loader defaults to the first registered client with a console warning. In production (Vercel), this MUST be set explicitly per project or the wrong client's config will load.
**Correct handling:** Always set `CLIENT_ID` in `.env.local` for local dev and in Vercel env vars for production. The `next.config.ts` passes it through via the `env` option.
**Status:** ⚠️ Defaults gracefully but must be explicit in production.

## 2. Supabase Credentials Require `.env.local`
**Location:** `src/lib/supabase.ts`
**What breaks:** The app throws at runtime if `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not set. There are no hardcoded fallbacks.
**Correct handling:** Set in `.env.local` for local dev, in Vercel env vars for production. Each client has their own Supabase project — never share credentials between clients.
**Status:** ✅ Resolved — credentials removed, `.env.example` added.

## 3. Landing Pages Must Be Registered in Two Places
**Location:** `site.config.ts` AND `src/app/page.tsx`
**What breaks:** If you add a new client's config to `site.config.ts` but forget to add their landing page to `src/app/page.tsx`, the landing page will render the default/fallback client's page.
**Correct handling:** Always register in both files when onboarding a new client. The config loader and landing page router are separate registries.
**Status:** ⚠️ Manual step — easy to forget.

## 4. Optional Config Fields Can Break Shared Pages
**Location:** `src/app/pricing/page.tsx`, `src/app/about-platform/page.tsx`
**What breaks:** The pricing page reads `config.programs` and `config.pricing`. The about-platform page reads `config.aboutPlatform`. These are optional in the type (`[key: string]: unknown`) but the pages assume they exist.
**Correct handling:** If a client uses the shared pricing/about pages, they MUST include `programs`, `pricing`, and `aboutPlatform` in their config. Otherwise, create custom versions of those pages for the client.
**Status:** ⚠️ Runtime error if fields are missing — no compile-time safety for optional fields.

## 2. No Error Handling on DB Read Operations
**Location:** `src/lib/db.ts` (read functions)
**What breaks:** Read functions like `getClients`, `getDietPlans`, `getCheckIns`, etc. destructure `{ data }` and return `data || []` — errors are discarded. If Supabase is down or RLS blocks a query, the UI shows "no data" instead of an error.
**Correct handling:** This is an accepted trade-off for this project's scale. All write operations return `{ error: string | null }`. If you add new DB functions, follow the same split: reads return `data || []`, writes return `{ error }`.
**Status:** ⚠️ Accepted — read errors are silently swallowed by design. Write errors are all properly surfaced.

## 3. Delete-and-Reinsert Pattern for Template Updates
**Location:** `src/lib/db.ts` → `updateDietTemplate()`, `updateWorkoutTemplate()`
**What breaks:** Updating templates deletes ALL existing meal slots/workout slots and re-inserts them. `food_check_in_items` references slots with ON DELETE SET NULL, so old check-in items get nulled slot references (acceptable — historical data preserved).
**Correct handling:** Both functions return `{ error }` so callers can detect failures. Slot IDs change on every save — don't rely on stable IDs.
**Status:** ✅ Resolved — ON DELETE SET NULL on foreign keys prevents blocking.

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

## 11. When Adding Columns, Update ALL CRUD Functions
**Rule:** When adding a new column to any table, you MUST update: (1) the CREATE function's input type + insert object, (2) the UPDATE function's input type + update object, (3) the row mapper function. Missing any one causes silent data loss on save.
**Status:** ⚠️ Recurring pattern — check every time.

## 12. Supabase Queries with Foreign Keys Must JOIN Related Tables
**Rule:** If a table has a `foreign_key_id` column pointing to another table, and the UI needs data from that related table, the `select()` query MUST include the join (e.g., `dish_items(*, food:foods(*))`). Without the join, the mapper function gets null for related fields and shows "Unknown" / 0 values.
**Status:** ⚠️ Easy to miss — always check what the UI needs to display.

## 13. TypeScript Index Signatures Make Extra Fields `unknown`
**Rule:** If an interface has `[key: string]: unknown`, accessing any field not explicitly defined returns `unknown` and causes build errors. Fix by adding frequently-used optional fields as properly typed properties. Use optional chaining (`config.pricing?.callPrice`) not `as any` casts.
**Status:** ⚠️ Affects any page using client-specific config fields.

## 14. Never Pass Non-UUID Strings to UUID Database Columns
**Rule:** When a selection value can be a special string like `"other"`, `"skipped"`, or `""`, it MUST be converted to `null` before being passed to a UUID column. Also filter out items with empty/null required fields before DB insert. Postgres will throw "invalid input syntax for type uuid" otherwise.
**Status:** ⚠️ Check every form submission that maps user selections to DB inserts.

## 15. Client-Side Pages Need RLS Policies on ALL Joined Tables
**Rule:** If a client page queries table A which joins tables B and C, the client needs SELECT policies on ALL THREE tables (A, B, and C). Having a policy on A but not B/C causes the nested data to silently return null. The page shows "not assigned" even when data exists.
**Status:** ⚠️ Check RLS on every table in the join chain when adding client-read features.

## 16. Supabase Storage Buckets Must Be Created Before Upload
**Rule:** File uploads to Supabase Storage fail silently if the target bucket doesn't exist. When adding file upload features: (1) create the bucket via migration or SQL, (2) add upload policy for authenticated users, (3) add read policy (public or authenticated). Test the upload before shipping.
**Status:** ⚠️ Not caught by TypeScript — only fails at runtime.

## 17. Editor UIs Must Show All Possible Options Even If DB Has Fewer
**Rule:** When loading data from DB into an editor form, always ensure all possible options/categories are represented in the local state — even if the DB record only has some. Otherwise the user can't add to missing categories. Fill in empty defaults for anything not in the DB response.
**Status:** ⚠️ Applies to any editor that loads partial data and needs to allow additions.

## 18. food_check_ins Schema Drift — Missing Columns in Migration
**Location:** `supabase/migrations/20250507000000_dishes_and_diet_directory.sql`, `src/lib/db.ts`
**What breaks:** The original `food_check_ins` migration only creates basic columns (id, client_id, assignment_id, date, totals, adherence_score). The live DB has additional columns that were added directly: `weight`, `status`, `notes`, `coach_feedback`, `water_litres`, `steps`, `sleep_hours`, `energy_level`, `mood`. Also `food_check_in_items` is missing `custom_name` and `custom_calories`. A fresh `supabase db push` will fail at runtime when db.ts tries to insert/read these columns.
**Correct handling:** Before using a fresh Supabase project, run the catch-up migration below manually (or add a new migration file):
```sql
ALTER TABLE food_check_ins
  ADD COLUMN IF NOT EXISTS weight numeric,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'submitted',
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS coach_feedback text,
  ADD COLUMN IF NOT EXISTS water_litres numeric,
  ADD COLUMN IF NOT EXISTS steps integer,
  ADD COLUMN IF NOT EXISTS sleep_hours numeric,
  ADD COLUMN IF NOT EXISTS energy_level integer,
  ADD COLUMN IF NOT EXISTS mood text;

ALTER TABLE food_check_in_items
  ADD COLUMN IF NOT EXISTS custom_name text,
  ADD COLUMN IF NOT EXISTS custom_calories numeric;
```
**Status:** ⚠️ CRITICAL — migration out of sync with live DB.

## 19. template_meal_slots Schema Drift — Day ID vs Template ID
**Location:** `supabase/migrations/20250507000000_dishes_and_diet_directory.sql`, `src/lib/db.ts`
**What breaks:** The migration creates `template_meal_slots.day_id → template_days`, but the code queries `template_meal_slots` nested under `diet_templates` directly (via `TEMPLATE_NESTED_SELECT`). This requires a direct `template_id` FK on `template_meal_slots`. The live DB was altered to add this, but the migration file was not updated. A fresh `supabase db push` creates the wrong schema — the `TEMPLATE_NESTED_SELECT` query returns no meal slots.
**Correct handling:** After `supabase db push`, run:
```sql
ALTER TABLE template_meal_slots
  ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES diet_templates(id) ON DELETE CASCADE;
-- then backfill from template_days:
UPDATE template_meal_slots tms
SET template_id = td.template_id
FROM template_days td
WHERE td.id = tms.day_id;
```
**Status:** ⚠️ CRITICAL — migration out of sync with live DB.

## 20. Zombie Tables in Migration — workout_plans, workout_days, daily_check_ins
**Location:** `supabase/migrations/`
**What breaks:** Three tables exist in migrations but are never used by any code in `src/`:
- `workout_plans` + `workout_days` (initial schema) — replaced by workout_templates system
- `daily_check_ins` (20250506000002) — replaced by food_check_ins
These tables exist on every Supabase project but hold no data and waste RLS policy processing.
**Correct handling:** If setting up a new project, skip these tables or drop them after migration:
```sql
DROP TABLE IF EXISTS workout_days;
DROP TABLE IF EXISTS workout_plans;
DROP TABLE IF EXISTS daily_check_ins;
```
**Status:** ⚠️ Waste space but cause no runtime errors.

## 21. habits table has NO unit column
**Location:** `src/app/(client)/client/habits/page.tsx`, `supabase/migrations/20250428000000_initial_schema.sql`
**What breaks:** The habits page checks `habit.unit` to decide whether to show a value input (e.g., "2.5L" for water habits). Demo mode uses hardcoded habits WITH a `unit` field. But the real `habits` table has no `unit` column — it only has: id, created_at, coach_id, client_id, name, emoji, target. Real habits will always have `habit.unit === undefined`, so value inputs never show for real data.
**Correct handling:** To enable unit tracking for real data, create a migration:
```sql
ALTER TABLE habits ADD COLUMN IF NOT EXISTS unit text; -- e.g. 'L', 'steps', 'hrs'
```
**Status:** ⚠️ Feature gap — works in demo, silently absent in production.

## 22. Legacy diet_plans System Fully Removed
**Location:** `src/lib/db.ts`, `src/types/index.ts`
**What changed:** The old `diet_plans` + `diet_meals` tables and their CRUD functions (`getDietPlans`, `updateDietPlanMeals`) have been removed from the codebase. The `DietPlan` and `Meal` TypeScript types are also removed. All diet plan functionality now uses the template system (`diet_templates` + `template_assignments`).
**Correct handling:** Use `getDietTemplates`, `createDietTemplate`, `getCoachAssignments` instead. The `/coach/plans` page now only shows template assignments. The `/coach/plans/[id]` legacy editor page has been deleted.
**Status:** ✅ Resolved — old system fully removed from code (DB tables still exist but are unused).

## 23. Unified Component Categories (6 values)
**Location:** `src/types/index.ts`, `dishes` table, `meal_slot_components` table, `foods` table
**What changed:** Categories were unified across dishes and foods. Old dish categories (`carbohydrate`, `protein`, `fiber`, `complete_meal`) replaced with 6 unified values: `protein`, `carbs`, `fats`, `fiber`, `complete_meal`, `supplements`. The CHECK constraints on `dishes` and `meal_slot_components` tables were updated. All existing `carbohydrate` values were migrated to `carbs`.
**Correct handling:** Always use the 6 unified values. Never use `carbohydrate` — use `carbs` instead. The `foods.category` column already used these values.
**Status:** ✅ Resolved — DB constraints updated, all code references migrated.

## 24. Plan Types Are Now Dynamic (Not Enum)
**Location:** `plan_types` table, `diet_templates.plan_type` column
**What changed:** Plan types are no longer a hardcoded 4-value enum. They're stored in a `plan_types` table and coaches can create custom ones. The CHECK constraint on `diet_templates.plan_type` was dropped. The diet template editor uses a searchable dropdown (like dish tags) for plan type selection.
**Correct handling:** Don't hardcode plan type values. Use `getPlanTypes(coachId)` to fetch available types. The `plan_type` column on `diet_templates` stores the plan type name as a free-text string.
**Status:** ✅ Resolved — dynamic plan types with create-new option.

## 25. meal_slot_dishes Supports Both Dishes AND Food Items
**Location:** `meal_slot_dishes` table, `src/lib/db.ts`
**What changed:** The `meal_slot_dishes` table now has `food_id` (nullable FK → foods) and `food_quantity` columns alongside the existing `dish_id`. A CHECK constraint ensures exactly one of `dish_id` or `food_id` is set per row. The `dish_id` column is now nullable.
**Correct handling:** When reading meal slot dishes, check both `dishId` and `foodId`. When inserting, set one to null and the other to the value. The `MealSlotDish` TypeScript type has both fields as optional. Food items show with quantity in grams.
**Status:** ✅ Resolved — both dishes and foods can be added to diet plan meal slots.

## 26. Dish Picker No Longer Filters by Category
**Location:** `src/components/coach/dish-picker-modal.tsx`
**What changed:** The dish picker modal used to filter dishes by the component category of the row being edited. Now it shows ALL dishes regardless of category, with category filter tabs and tag filters for the coach to narrow down manually.
**Correct handling:** The `componentCategory` prop on `DishPickerModal` is now optional and unused for filtering. All dishes are shown. The coach uses the category tabs and tag filters to find what they need.
**Status:** ✅ By design — gives coaches full flexibility to add any dish to any slot.
