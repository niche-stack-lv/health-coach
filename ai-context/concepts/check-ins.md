# Check-ins (Merged System)

## What it does
Two types of check-ins, both stored in a unified system:

1. **Daily Check-in** — client logs food selections + weight daily (merged `food_check_ins` table)
2. **Weekly Check-in** — client submits progress photos + weight + notes weekly (`check_ins` table)

## Daily Check-in (Food + Weight)

The old `daily_check_ins` table has been **removed**. All daily data now lives in `food_check_ins`.

### How it works
1. Client navigates to `/client/food-check-in` (the "Daily" tab)
2. Client sees their assigned diet template's meal slots
3. For each component: selects which dish they ate, or "Other" (with name + calories), or "Skip"
4. Client enters today's weight (optional)
5. Running macro total updates live as selections change
6. Submit calculates adherence score and persists everything to `food_check_ins`
7. Coach sees the check-in on `/coach/daily-check-ins` with full meal details, macros, adherence, and weight

### Database: `food_check_ins` table
Stores both food selections AND daily wellness data:
- `client_id`, `date` (unique per client per day — upsert pattern)
- `assignment_id` (nullable — links to template assignment)
- `total_calories`, `total_protein`, `total_carbs`, `total_fat`
- `adherence_score` (0-100%)
- `weight`, `water_litres`, `steps`, `sleep_hours`, `energy_level`, `mood`
- `notes`, `coach_feedback`, `status` (submitted/reviewed)

### Database: `food_check_in_items` table
Individual selections per component:
- `check_in_id`, `slot_id` (nullable, ON DELETE SET NULL), `component_id` (nullable, ON DELETE SET NULL)
- `dish_id` (nullable — null for skipped/other)
- `is_skipped`
- `custom_name`, `custom_calories` (for "Other" selections)

### Coach view
- `/coach/daily-check-ins` — shows all client check-ins for today
- Grouped by meal slot (Breakfast, Lunch, etc.) with dish names + calories
- Shows macros, adherence %, weight, and "Other" entries
- Coach can review and add feedback

## Weekly Check-in (Photos + Weight)

### How it works
1. Client navigates to `/client/check-in` (the "Weekly" tab)
2. Client uploads up to 3 photos (front, side, back) via file input
3. Client enters current weight (kg) and optional notes
4. On submit: photos uploaded to Supabase Storage, `check_ins` row inserted with status `"pending"`
5. Coach sees pending check-ins on dashboard and at `/coach/check-ins`
6. Coach can view photos (signed URLs, 1-hour expiry), add feedback, mark as reviewed

### Business rules
- Check-in status: `"pending"` → `"reviewed"`
- Photos stored as array of storage paths in `photos` column (JSONB)
- The `check-in-photos` Supabase Storage bucket must exist

## Removed
- `daily_check_ins` table — **DROPPED**. All daily data now in `food_check_ins`
- `/client/daily-check-in` page — **DELETED**. Merged into `/client/food-check-in`

## Key files
- `src/app/(client)/client/food-check-in/page.tsx` — unified daily check-in (food + weight)
- `src/app/(client)/client/check-in/page.tsx` — weekly photo check-in
- `src/app/(coach)/coach/daily-check-ins/page.tsx` — coach daily log review
- `src/app/(coach)/coach/check-ins/page.tsx` — coach weekly review with photos
- `src/lib/db.ts` — `createFoodCheckIn`, `getFoodCheckIn`, `getCoachDailyCheckIns`, `updateDailyCheckInFeedback`

## Gotchas
- `food_check_in_items.slot_id` and `component_id` are nullable with ON DELETE SET NULL — deleting/updating a template won't break existing check-ins
- "Other" selections store `custom_name` and `custom_calories` on the item row (dish_id = null, is_skipped = false)
- Items with empty/null slotId or componentId are filtered out before DB insert
- The adherence calculation excludes "other" and "skipped" selections from the score
