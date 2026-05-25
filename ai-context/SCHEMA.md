# Database Schema Reference

Complete reference for every table in the Supabase (PostgreSQL) database. Tables are grouped by migration file.

---

## Migration: 20250428000000_initial_schema.sql

### `profiles`
Central user record for every account (coach and client).

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK, matches auth.users.id) |
| created_at | timestamptz | YES | now() |
| name | text | NO | — |
| email | text | NO | — |
| role | text | YES | — |

**Constraints:**
- `role` CHECK: `('coach', 'client')`
- FK: `id → auth.users(id)`

**RLS:** Insert via trigger on signup; each user reads/updates own row; coach reads all profiles.

**Covered by:** `ai-context/concepts/auth-and-roles.md`

---

### `clients`
Extends `profiles` for client-specific data. `clients.id` = `profiles.id` (same UUID).

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| coach_id | uuid | YES | — |
| created_at | timestamptz | YES | now() |
| goal | text | YES | — |
| status | text | YES | 'active' |
| current_weight | numeric | YES | — |
| target_weight | numeric | YES | — |

**Constraints:**
- FK: `id → profiles(id)`
- FK: `coach_id → profiles(id)`
- `status` CHECK: `('active', 'inactive')`

**RLS:** Coach full CRUD on own clients; client reads own row.

**Covered by:** `ai-context/concepts/user-management.md`

---

### `diet_plans` [LEGACY]
Old flat diet plan system. Superseded by the dishes/templates system. Do not use for new features.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| created_at | timestamptz | YES | now() |
| coach_id | uuid | YES | — |
| client_id | uuid | YES | — |
| title | text | YES | — |
| description | text | YES | — |
| start_date | date | YES | — |
| end_date | date | YES | — |
| weeks | int | YES | — |
| status | text | YES | — |

**Constraints:**
- FK: `coach_id → profiles(id)`, `client_id → profiles(id)`
- `status` CHECK: `('active', 'completed', 'draft')`

**Status:** LEGACY — still referenced by `check_ins.plan_id` but no active code creates new rows.

**Covered by:** `ai-context/concepts/diet-plans.md`

---

### `diet_meals` [LEGACY]
Meal rows within a legacy `diet_plans` row.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| created_at | timestamptz | YES | now() |
| plan_id | uuid | YES | — |
| name | text | YES | — |
| time | text | YES | — |
| items | text[] | YES | — |
| calories | int | YES | — |
| protein | int | YES | — |
| carbs | int | YES | — |
| fat | int | YES | — |
| sort_order | int | YES | — |

**Constraints:**
- FK: `plan_id → diet_plans(id) ON DELETE CASCADE`

**Status:** LEGACY — no active code creates new rows.

---

### `workout_plans` [ZOMBIE — UNUSED]
Never used by any code in `src/`. The active workout system uses `workout_templates`.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| created_at | timestamptz | YES | now() |
| coach_id | uuid | YES | — |
| client_id | uuid | YES | — |
| title | text | YES | — |
| status | text | YES | — |

**Constraints:**
- FK: `coach_id → profiles(id)`, `client_id → profiles(id)`
- `status` CHECK: `('active', 'completed', 'draft')`

**Status:** ZOMBIE — see Landmine #20. Should be dropped on new projects.

---

### `workout_days` [ZOMBIE — UNUSED]
Days within a `workout_plans` row. Never used.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| created_at | timestamptz | YES | now() |
| plan_id | uuid | YES | — |
| day_label | text | YES | — |
| name | text | YES | — |
| exercises | jsonb | YES | — |
| sort_order | int | YES | — |

**Constraints:**
- FK: `plan_id → workout_plans(id) ON DELETE CASCADE`

**Status:** ZOMBIE — see Landmine #20. Should be dropped on new projects.

---

### `check_ins`
Weekly photo check-ins submitted by clients.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| created_at | timestamptz | YES | now() |
| client_id | uuid | YES | — |
| plan_id | uuid | YES | — (nullable) |
| date | date | YES | — |
| week | int | YES | — |
| weight | numeric | YES | — |
| notes | text | YES | — |
| photos | jsonb | YES | — |
| coach_feedback | text | YES | — |
| status | text | YES | — |

**Constraints:**
- FK: `client_id → profiles(id)`, `plan_id → diet_plans(id)` (nullable)
- `status` CHECK: `('pending', 'reviewed')`

**RLS:** Client inserts/reads own; coach reads/updates all.

**Covered by:** `ai-context/concepts/check-ins.md`

---

### `measurements`
Body measurement logs by clients.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| created_at | timestamptz | YES | now() |
| client_id | uuid | YES | — |
| date | date | YES | — |
| weight | numeric | YES | — |
| body_fat | numeric | YES | — |
| chest | numeric | YES | — |
| waist | numeric | YES | — |
| hips | numeric | YES | — |
| arms | numeric | YES | — |
| thighs | numeric | YES | — |

**Constraints:**
- FK: `client_id → profiles(id)`

**RLS:** Client inserts/reads own; coach reads all.

**Covered by:** `ai-context/concepts/measurements.md`

---

### `habits`
Daily habits assigned by coach to client.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| created_at | timestamptz | YES | now() |
| coach_id | uuid | YES | — |
| client_id | uuid | YES | — |
| name | text | NO | — |
| emoji | text | YES | '✅' |
| target | text | YES | — |

**Constraints:**
- FK: `coach_id → profiles(id)`, `client_id → profiles(id)`

**WARNING:** NO `unit` column exists. The demo data uses `unit` but real DB habits won't have it — value input never shows for real data. See Landmine #21.

**RLS:** Coach full CRUD; client reads own.

**Covered by:** `ai-context/concepts/habits.md`

---

### `habit_logs`
Daily completion record for each habit.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| created_at | timestamptz | YES | now() |
| habit_id | uuid | YES | — |
| client_id | uuid | YES | — |
| date | date | YES | — |
| completed | boolean | YES | — |
| value | text | YES | — |

**Constraints:**
- FK: `habit_id → habits(id) ON DELETE CASCADE`, `client_id → profiles(id)`

**RLS:** Client full CRUD on own logs; coach reads.

**Covered by:** `ai-context/concepts/habits.md`

---

### `leads`
Prospective clients captured via pricing, enquiry, and book-call flows.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| created_at | timestamptz | YES | now() |
| source | text | YES | — |
| name | text | YES | — |
| email | text | YES | — |
| phone | text | YES | — |
| goal | text | YES | — |
| program | text | YES | — |
| plan_type | text | YES | — |
| plan_label | text | YES | — |
| price | text | YES | — |
| duration | text | YES | — |
| age | text | YES | — |
| gender | text | YES | — |
| weight | text | YES | — |
| height | text | YES | — |
| diet | text | YES | — |
| gym | text | YES | — |
| experience | text | YES | — |
| injuries | text | YES | — |
| referral_source | text | YES | — |
| message | text | YES | — |
| status | text | YES | 'new' |

**RLS:** Anonymous INSERT (with check true); authenticated READ/UPDATE only.

**Covered by:** `ai-context/concepts/leads-and-pricing.md`

---

## Migration: 20250506000000

### `foods`
Food item catalog for use in dish compositions.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| created_at | timestamptz | YES | now() |
| name | text | NO | — |
| category | text | YES | — |
| emoji | text | YES | — |
| unit | text | YES | — |
| grams_per_unit | numeric | YES | — |
| calories | numeric | YES | — |
| protein | numeric | YES | — |
| carbs | numeric | YES | — |
| fat | numeric | YES | — |
| is_default | boolean | YES | — |

**Constraints:**
- `category` CHECK: `('protein', 'carbs', 'fats', 'supplements')`

**Note:** `calories`, `protein`, `carbs`, `fat` are all **per 100g**, not per serving. `is_default=true` = seeded items (40 foods). `is_default=false` = coach-added custom items.

**RLS:** Coach full CRUD; authenticated users read.

**Covered by:** `ai-context/concepts/foods-and-exercises.md`

---

### `exercises`
Exercise catalog for use in workout templates.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| created_at | timestamptz | YES | now() |
| name | text | NO | — |
| category | text | YES | — |
| emoji | text | YES | — |
| equipment | text | YES | — |
| video_id | text | YES | — |
| is_default | boolean | YES | — |

**Constraints:**
- `category` CHECK: `('chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio')`

**Note:** `video_id` is a YouTube video ID. `is_default=true` = seeded items (33 exercises). `is_default=false` = coach-added custom items.

**RLS:** Coach full CRUD; authenticated users read.

**Covered by:** `ai-context/concepts/foods-and-exercises.md`

---

## Migration: 20250506000001

### `client_onboarding`
One-row-per-client onboarding questionnaire (~21 fields).

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| client_id | uuid | NO | — |
| created_at | timestamptz | YES | now() |
| primary_goal | text | YES | — |
| other_goals | text | YES | — |
| motivation | text | YES | — |
| target_weight | numeric | YES | — |
| timeline | text | YES | — |
| age | int | YES | — |
| height | text | YES | — |
| current_weight | numeric | YES | — |
| weight_history | text | YES | — |
| activity_level | text | YES | — |
| work_type | text | YES | — |
| sleep_schedule | text | YES | — |
| breakfast | text | YES | — |
| lunch | text | YES | — |
| snacks | text | YES | — |
| dinner | text | YES | — |
| weekends | text | YES | — |
| pitfalls | text | YES | — |
| medical_conditions | text | YES | — |
| injuries | text | YES | — |
| notes | text | YES | — |

**Constraints:**
- FK: `client_id → profiles(id) ON DELETE CASCADE`
- UNIQUE: `(client_id)` — one row per client

**RLS:** Client inserts/reads/updates own row; coach reads.

**Covered by:** `ai-context/concepts/client-onboarding.md`

---

## Migration: 20250506000002

### `daily_check_ins` [ZOMBIE — UNUSED]
Created by this migration but immediately superseded by `food_check_ins`. No code in `src/` uses this table.

**Status:** ZOMBIE — see Landmine #20. Should be dropped on new projects.

---

## Migration: 20250507000000_dishes_and_diet_directory.sql

### `dishes`
Reusable recipes composed of food items. Updated in migration 20250518.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| created_at | timestamptz | YES | now() |
| coach_id | uuid | YES | — |
| name | text | YES | — |
| emoji | text | YES | — |
| component_category | text | YES | — |
| total_calories | numeric | YES | — |
| total_protein | numeric | YES | — |
| total_carbs | numeric | YES | — |
| total_fat | numeric | YES | — |
| description | text | YES | — |
| image_url | text | YES | — |
| meal_size | text | YES | — |

**Constraints:**
- FK: `coach_id → profiles(id)`
- `component_category` CHECK: `('carbohydrate', 'protein', 'fiber', 'complete_meal')`
- `meal_size` CHECK: `('small', 'medium', 'large')` — added in 20250518

**RLS:** Coach full CRUD on own dishes; client reads via assignment chain.

**Covered by:** `ai-context/concepts/dishes-and-diet-directory.md`

---

### `dish_items`
Individual food items within a dish with gram amounts.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| created_at | timestamptz | YES | now() |
| dish_id | uuid | YES | — |
| food_id | uuid | YES | — (nullable) |
| custom_name | text | YES | — |
| custom_emoji | text | YES | — |
| custom_calories | numeric | YES | — |
| custom_protein | numeric | YES | — |
| custom_carbs | numeric | YES | — |
| custom_fat | numeric | YES | — |
| grams | numeric | NO | — |
| sort_order | int | YES | — |

**Constraints:**
- FK: `dish_id → dishes(id) ON DELETE CASCADE`, `food_id → foods(id)` (nullable)

**Note:** Either `food_id` is set (DB food) OR `custom_*` fields are filled in (inline macro definition).

---

### `diet_templates`
Reusable diet plan structures. Coach creates templates and assigns them to clients.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| created_at | timestamptz | YES | now() |
| coach_id | uuid | YES | — |
| name | text | NO | — |
| plan_type | text | YES | — |

**Constraints:**
- FK: `coach_id → profiles(id)`
- `plan_type` CHECK: `('veg', 'nonveg', 'low_carb_nonveg', 'intermittent_fasting')`

**Covered by:** `ai-context/concepts/dishes-and-diet-directory.md`

---

### `template_days`
Day rows within a diet template (7 per template).

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| template_id | uuid | YES | — |
| day_number | int | YES | — |

**Constraints:**
- FK: `template_id → diet_templates(id) ON DELETE CASCADE`
- UNIQUE: `(template_id, day_number)` — day_number 1-7

**IMPORTANT — SCHEMA DRIFT:** The live DB was modified to add a `template_id` column directly to `template_meal_slots`, bypassing this table for the main query path. The migration does NOT reflect this change. See Landmine #19 and dishes-and-diet-directory.md.

---

### `template_meal_slots`
Meal slots within a template (Breakfast, Lunch, etc.).

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| day_id | uuid | YES | — (→ template_days) |
| name | text | YES | — |
| target_calories | numeric | YES | — |
| is_skipped | boolean | YES | — |
| sort_order | int | YES | — |

**Constraints:**
- FK: `day_id → template_days(id) ON DELETE CASCADE`

**SCHEMA DRIFT:** Live DB also has `template_id → diet_templates(id)` column added directly, not in migration. Code uses `TEMPLATE_NESTED_SELECT` which depends on this column. See Landmine #19.

---

### `meal_slot_components`
Component positions within a meal slot (carb, protein, fiber, complete_meal).

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| slot_id | uuid | YES | — |
| component_category | text | YES | — |
| sort_order | int | YES | — |

**Constraints:**
- FK: `slot_id → template_meal_slots(id) ON DELETE CASCADE`
- `component_category` CHECK: `('carbohydrate', 'protein', 'fiber', 'complete_meal')`

---

### `meal_slot_dishes`
Dish alternatives within a component. Updated in migration 20250518.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| component_id | uuid | YES | — |
| dish_id | uuid | YES | — |
| sort_order | int | YES | — |
| meal_size | text | YES | — |

**Constraints:**
- FK: `component_id → meal_slot_components(id) ON DELETE CASCADE`, `dish_id → dishes(id)`
- `meal_size` CHECK: `('small', 'medium', 'large')` — added in 20250518

---

### `template_assignments`
Links a diet template to a client.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| created_at | timestamptz | YES | now() |
| template_id | uuid | YES | — |
| client_id | uuid | YES | — |
| coach_id | uuid | YES | — |
| status | text | YES | — |

**Constraints:**
- FK: `template_id → diet_templates(id)`, `client_id → profiles(id)`, `coach_id → profiles(id)`
- `status` CHECK: `('active', 'inactive')`

---

### `food_check_ins`
Daily food + weight check-in by client.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| created_at | timestamptz | YES | now() |
| client_id | uuid | YES | — |
| assignment_id | uuid | YES | — |
| date | date | NO | — |
| total_calories | numeric | YES | — |
| total_protein | numeric | YES | — |
| total_carbs | numeric | YES | — |
| total_fat | numeric | YES | — |
| adherence_score | numeric | YES | — |

**SCHEMA DRIFT — Columns in live DB but NOT in migration:**
- `weight` numeric
- `status` text DEFAULT 'submitted'
- `notes` text
- `coach_feedback` text
- `water_litres` numeric
- `steps` integer
- `sleep_hours` numeric
- `energy_level` integer
- `mood` text

**Constraints:**
- FK: `client_id → profiles(id)`, `assignment_id → template_assignments(id)`
- UNIQUE: `(client_id, date)` — one check-in per day; code uses upsert

**See:** Landmine #18 for catch-up migration SQL.

---

### `food_check_in_items`
Individual food selections per component within a check-in.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| check_in_id | uuid | YES | — |
| slot_id | uuid | YES | — (nullable) |
| component_id | uuid | YES | — (nullable) |
| dish_id | uuid | YES | — (nullable) |
| is_skipped | boolean | YES | — |

**SCHEMA DRIFT — Columns in live DB but NOT in migration:**
- `custom_name` text
- `custom_calories` numeric

**Constraints:**
- FK: `check_in_id → food_check_ins(id) ON DELETE CASCADE`
- FK: `slot_id → template_meal_slots(id) ON DELETE SET NULL`
- FK: `component_id → meal_slot_components(id) ON DELETE SET NULL`
- FK: `dish_id → dishes(id)` (nullable)

**See:** Landmine #18 for catch-up migration SQL.

---

## Migration: 20250511000000

### `workout_templates`
Reusable workout template structures.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| created_at | timestamptz | YES | now() |
| coach_id | uuid | YES | — |
| name | text | NO | — |
| is_template | boolean | NO | true |

**Constraints:**
- FK: `coach_id → profiles(id)`

**Covered by:** `ai-context/concepts/workout-plans.md`

---

### `workout_template_slots`
Day/session slots within a workout template.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| template_id | uuid | YES | — |
| name | text | NO | — |
| sort_order | int | YES | — |

**Constraints:**
- FK: `template_id → workout_templates(id) ON DELETE CASCADE`

---

### `workout_slot_exercises`
Exercises within a workout slot.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| slot_id | uuid | YES | — |
| exercise_id | uuid | YES | — (nullable) |
| custom_name | text | YES | — |
| custom_emoji | text | YES | — |
| sets | int | YES | — |
| reps | text | YES | — |
| rest_seconds | int | YES | — |
| notes | text | YES | — |
| sort_order | int | YES | — |

**Constraints:**
- FK: `slot_id → workout_template_slots(id) ON DELETE CASCADE`
- FK: `exercise_id → exercises(id)` (nullable — custom exercises use `custom_name` instead)

---

### `workout_assignments`
Links a workout template to a client.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| created_at | timestamptz | YES | now() |
| template_id | uuid | YES | — |
| client_id | uuid | YES | — |
| coach_id | uuid | YES | — |

**Constraints:**
- FK: `template_id → workout_templates(id)`, `client_id → profiles(id)`, `coach_id → profiles(id)`

**Note:** No `status` column — latest assignment by `created_at` is treated as active.

**Covered by:** `ai-context/concepts/workout-plans.md`

---

## Migration: 20250518000000

### `dish_tags`
Tags for categorizing dishes (coach-specific).

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| coach_id | uuid | YES | — |
| name | text | NO | — |
| color | text | YES | — |
| created_at | timestamptz | YES | now() |

**Constraints:**
- FK: `coach_id → profiles(id)`
- UNIQUE: `(coach_id, name)`

---

### `dish_tag_links`
Many-to-many join between dishes and tags.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | — (PK) |
| dish_id | uuid | YES | — |
| tag_id | uuid | YES | — |

**Constraints:**
- FK: `dish_id → dishes(id) ON DELETE CASCADE`
- FK: `tag_id → dish_tags(id) ON DELETE CASCADE`
- UNIQUE: `(dish_id, tag_id)`

---

## Schema Drift Summary

The following live DB columns are NOT present in any migration file. A fresh `supabase db push` will be missing them:

| Table | Missing Columns | Landmine |
|-------|----------------|---------|
| `food_check_ins` | weight, status, notes, coach_feedback, water_litres, steps, sleep_hours, energy_level, mood | #18 |
| `food_check_in_items` | custom_name, custom_calories | #18 |
| `template_meal_slots` | template_id (direct FK to diet_templates) | #19 |

## Zombie Tables Summary

The following tables exist in migrations but are never used by `src/` code:

| Table | Replaced By | Landmine |
|-------|------------|---------|
| `workout_plans` | `workout_templates` | #20 |
| `workout_days` | `workout_template_slots` | #20 |
| `daily_check_ins` | `food_check_ins` | #20 |
