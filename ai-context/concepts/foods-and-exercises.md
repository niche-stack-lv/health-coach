# Foods & Exercises

## What it does
The platform maintains two catalogs — foods (for building dishes) and exercises (for building workout templates). Each catalog has TWO sources that coexist: static TypeScript files bundled with the app AND rows in the Supabase database. These are completely separate data sources and must NEVER be mixed.

---

## Two-Source Architecture

### Static files (bundled)
- `src/lib/food-database.ts` — ~40 static food items with per-100g macros
- `src/lib/exercise-database.ts` — ~33 static exercises grouped by muscle category
- `src/lib/exercise-videos.ts` — YouTube video ID mapping for exercise demos (same concept as `exercises.video_id`)

Static items have **numeric string IDs** like `"f1"`, `"f2"`, `"e1"` etc. These are TypeScript array indices, NOT database UUIDs. They never match DB UUIDs.

### Database rows
- `foods` table — seeded defaults (`is_default=true`) + coach-added custom items (`is_default=false`)
- `exercises` table — seeded defaults (`is_default=true`) + coach-added custom items (`is_default=false`)

DB items have **UUID ids** (e.g., `"3b1a2c4d-..."`). They never match static IDs.

---

## Critical Rule: Never Mix Static and DB Items

Static food IDs (`"f1"`, `"f2"`) and DB food UUIDs are completely different namespaces. If you pass a static food ID where a UUID is expected (e.g., `dish_items.food_id`), Postgres will throw "invalid input syntax for type uuid". Always check which source an item came from before using its ID for a DB operation.

---

## Foods

### DB Table: `foods`
| Column | Notes |
|--------|-------|
| `calories`, `protein`, `carbs`, `fat` | All **per 100g** — NOT per serving |
| `grams_per_unit` | Used to convert from unit (e.g., 1 egg = 50g) |
| `is_default` | `true` = seeded, `false` = coach-added (can be edited/deleted) |
| `category` | `'protein' \| 'carbs' \| 'fats' \| 'supplements'` |

### Macro calculation
When a food item appears in a dish (`dish_items.grams`), macros are calculated as:
```
item_calories = (foods.calories / 100) * dish_items.grams
```
The `dish_items.grams` column is the actual serving size for that item in that dish.

---

## Exercises

### DB Table: `exercises`
| Column | Notes |
|--------|-------|
| `video_id` | YouTube video ID (not a full URL). Same concept as `exercise-videos.ts` static map. |
| `is_default` | `true` = seeded, `false` = coach-added (can be edited/deleted) |
| `category` | `'chest' \| 'back' \| 'shoulders' \| 'arms' \| 'legs' \| 'core' \| 'cardio'` |

---

## Where Each Source Is Used

### Food Picker (`src/components/coach/food-picker.tsx`)
Loads BOTH sources and merges them:
1. Imports `foodDatabase` from `src/lib/food-database.ts` (static)
2. Calls `getFoods()` from `db.ts` (DB foods)
3. Merges the two arrays
4. Deduplicates by name (DB items win over static if names match)

This means a coach can search and select any food — static or custom — when building a dish.

### Dish Editor (`src/app/(coach)/coach/dishes/[id]/page.tsx`)
Uses **only** the static `foodDatabase` for its food picker. It does NOT call `getFoods()`. Custom DB foods are not available in the dish editor's food picker.

### Coach Settings (`src/app/(coach)/coach/settings/page.tsx`)
The coach manages their custom foods and exercises here:
- View all foods/exercises (static shown as reference, DB items shown as editable)
- Add new custom food/exercise → inserts into `foods`/`exercises` table with `is_default=false`
- Edit custom items (`is_default=false` only) — default seeded items cannot be edited
- Delete custom items (`is_default=false` only)

---

## Seeded Data
- `foods` table: ~40 default items seeded on project setup
- `exercises` table: ~33 default items seeded on project setup
- Seeding is done via `supabase/seed.sql` or migration inserts

---

## Gotchas
- Static food IDs (`"f1"`, `"f2"`) are numeric strings — NEVER pass these to `dish_items.food_id` (UUID column)
- DB foods and static foods can have the same name — the food-picker deduplicates by name, preferring DB
- The dish editor uses only static foods — a coach cannot use their custom DB foods when editing dish composition
- `foods.calories/protein/carbs/fat` are **per 100g** — always multiply by `(grams / 100)` for actual serving macros
- `exercises.video_id` is a YouTube video ID, not a URL — prepend `https://www.youtube.com/embed/` to embed

## Key Files
- `src/lib/food-database.ts` — static food items
- `src/lib/exercise-database.ts` — static exercises by category
- `src/lib/exercise-videos.ts` — YouTube video ID map
- `src/components/coach/food-picker.tsx` — merges static + DB foods
- `src/app/(coach)/coach/dishes/[id]/page.tsx` — dish editor (static foods only)
- `src/app/(coach)/coach/settings/page.tsx` — manage custom foods + exercises
- `src/lib/db.ts` — `getFoods()`, `createFood()`, `updateFood()`, `deleteFood()`, `getExercises()`, etc.
