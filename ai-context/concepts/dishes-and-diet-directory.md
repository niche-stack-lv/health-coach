# Dishes & Diet Directory (New System)

## What it does
A composable nutrition system where coaches build reusable **dishes** (recipes), compose them into **7-day diet templates**, assign templates to clients, and clients log daily food intake via structured check-ins. Replaces the legacy flat string-array diet plan approach.

## Architecture (layered)

```
Food Items (static food-database.ts or custom)
    → Dishes (reusable recipes with fixed quantities + macros)
        → Diet Templates
            → Template Days (7 rows per template, day_number 1-7)
                → Template Meal Slots (Breakfast, Lunch, etc.)
                    → Meal Slot Components (carb, protein, fiber, complete_meal)
                        → Meal Slot Dishes (dish alternatives per component)
            → Template Assignments (one active per client)
                → Food Check-ins (daily meal logging by client)
```

**IMPORTANT — Schema vs. Code divergence:** The migration schema has `template_days` as an intermediate table between `diet_templates` and `template_meal_slots`. However, the live DB was modified directly to also add a `template_id` column to `template_meal_slots`, and the code queries slots directly from templates (skipping `template_days` in the query). See the Gotchas section for full details.

## Key Concepts

### Dish
A pre-defined recipe with fixed quantities. Each dish has:
- Name, emoji, component category (carbohydrate | protein | fiber | complete_meal)
- One or more food items with specific gram amounts
- Pre-calculated total macros (calories, protein, carbs, fat)
- Different portion sizes = different dishes (e.g., "200g Rice" and "150g Rice" are separate dishes)

### Component Category
Every dish is tagged with one category indicating its nutritional role:
- `protein` — paneer, chicken, dal, eggs, turkey
- `carbs` — rice, roti, tortillas, oats
- `fats` — almonds, ghee, olive oil, peanut butter
- `fiber` — vegetables, fruits, salads
- `complete_meal` — overnight oats, smoothie, biryani (contains all macros, can go in any slot)
- `supplements` — whey protein, protein bars, vitamins

Categories are unified across both `dishes` and `foods` tables — same 6 values.

### Diet Template
A hierarchical structure: template → days (1-7) → meal slots → components → dishes:
- Has 1-6 meal slots per day (Breakfast, Lunch, Snack, Dinner, etc.)
- Each slot has component positions (carb, protein, fiber)
- Each component can have multiple alternative dishes (client picks one)
- Plan types: `veg`, `nonveg`, `low_carb_nonveg`, `intermittent_fasting`
- IF plans can mark slots as "skipped" (no breakfast)
- The migration schema has a `template_days` intermediate table (7 rows per template, day_number 1-7). However, in practice the code treats templates as flat by always inserting slots for day 1 only or referencing a `day_id` directly — the multi-day structure is not actively used in the UI.

### Template Assignment
Simple one-to-one link: coach assigns a template to a client.
- One active assignment per client at a time
- Coach can swap anytime (old deactivates, new activates)
- No date ranges, no versioning — edits to template are immediately visible to client

### Food Check-in
Daily record of what the client actually ate (merged with daily check-in):
- Shows today's meal slots from their assigned template
- Client selects which dish they chose for each component
- Can mark slots as skipped or enter "Other" (custom name + calories)
- Also captures weight
- Calculates adherence score (% of components where client picked a prescribed option)
- Stored in `food_check_ins` table (replaces old `daily_check_ins`)

## Database Tables (11 tables)

| Table | Purpose |
|-------|---------|
| `dishes` | Reusable recipes (coach_id, name, emoji, component_category, total macros, manual_macros flag) |
| `dish_items` | Food items within a dish (food_id or custom, grams) |
| `dish_tags` | Custom tags for organizing dishes |
| `dish_tag_links` | Many-to-many link between dishes and tags |
| `plan_types` | Dynamic plan types (coach_id, name, is_default) — replaces hardcoded enum |
| `diet_templates` | Plan templates (coach_id, name, plan_type as free text) |
| `template_meal_slots` | Meal slots within a template (template_id, name, target_calories, is_skipped) |
| `meal_slot_components` | Component positions within a slot (component_category — 6 unified values) |
| `meal_slot_dishes` | Dish OR food alternatives within a component (dish_id OR food_id + food_quantity) |
| `template_assignments` | Links template to client (status: active/inactive) |
| `food_check_ins` | Daily check-in record (macros, adherence_score, weight, notes, status, coach_feedback) |
| `food_check_in_items` | Individual selections per component (dish_id, custom_name, custom_calories) |

## RLS Pattern
- Coach: full CRUD on own dishes/templates/assignments
- Client: read via active assignment chain, CRUD on own check-ins
- Client-read policies use multi-table JOINs through the assignment chain

## How it works (step by step)

### Coach creates dishes
1. `/coach/dishes` — browse/search dish library grouped by category
2. `/coach/dishes/create` — pick food items from database, set grams, auto-calculate macros
3. Custom food items supported (manual per-100g macros, stored inline)

### Coach creates diet template
1. `/coach/diet-templates` — list all templates
2. `/coach/diet-templates/create` — name, plan type, flat list of meal slots
3. Add meal slots (1-6), per slot: add components (carb/protein/fiber), per component: pick dishes from library
4. Dish picker filters by matching component_category (or complete_meal)
5. Multiple alternatives per component = client choice

### Coach assigns template to client
1. `/coach/diet-templates/assign` — select template + client
2. If client has existing active assignment, it gets deactivated
3. Client immediately sees the plan

### Client views plan
1. `/client/diet-plan` — shows all meal slots directly (same every day)
2. Alternatives shown with "or" separator

### Client logs daily food
1. `/client/food-check-in` — shows all meal slots from assigned template (the "Daily" tab)
2. For each component: select which dish they ate (radio buttons)
3. Can skip entire meal slots or choose "Other" (enter custom name + calories)
4. Enter today's weight (optional)
5. Running macro total updates live
6. Submit calculates adherence score and persists

### Coach tracks adherence
1. `/coach/clients/[id]/adherence` — daily scores list
2. Weekly average, color-coded (green ≥90%, amber ≥70%, red <70%)

## Key Files

### Data layer
- `src/lib/db.ts` — all CRUD functions (getDishes, createDish, getDietTemplates, createDietTemplate, assignTemplate, createFoodCheckIn, etc.)
- `src/lib/macro-calc.ts` — pure calculation functions (calculateItemMacros, calculateDishMacros, calculateAdherenceScore, getTemplateDayForDate — legacy, unused)
- `src/lib/template-validation.ts` — validation functions (validateDishInput, validateMealSlotCount, validateComponentCategoryMatch, filterDishes)
- `src/lib/seed-data.ts` — structured seed data from spreadsheet (all 4 plan types)
- `src/types/index.ts` — TypeScript interfaces (Dish, DietTemplate, TemplateAssignment, FoodCheckIn, etc.)

### UI pages
- `src/app/(coach)/coach/dishes/page.tsx` — Foods & Dishes page (tabs: Dishes / Foods with full CRUD)
- `src/app/(coach)/coach/dishes/[id]/page.tsx` — dish create/edit (with manual macros toggle)
- `src/app/(coach)/coach/diet-templates/page.tsx` — templates list (with plan type filter)
- `src/app/(coach)/coach/diet-templates/[id]/page.tsx` — template create/edit (searchable plan type, food items in slots)
- `src/app/(coach)/coach/diet-templates/assign/page.tsx` — assign template to client
- `src/app/(coach)/coach/plans/create/page.tsx` — diet plan creation (2-step: details + meal builder with template pre-fill)
- `src/app/(coach)/coach/plans/page.tsx` — assigned plans list (template assignments only)
- `src/app/(coach)/coach/clients/[id]/page.tsx` — client detail (edit modal, weight from check-ins, weight graph)
- `src/app/(coach)/coach/clients/[id]/adherence/page.tsx` — adherence view
- `src/app/(client)/client/diet-plan/page.tsx` — client daily plan view (shows both dishes and food items)
- `src/app/(client)/client/food-check-in/page.tsx` — daily food check-in (supports food items in selections)

### Shared components
- `src/components/shared/meal-slot-view.tsx` — Shared meal slot renderer with mode prop (edit/view/select)
- `src/components/shared/workout-slot-view.tsx` — Shared workout slot renderer with mode prop (edit/view)
- `src/components/shared/macro-summary.tsx` — Shared macro totals display (sm/md/lg sizes)
- `src/components/coach/food-picker.tsx` — Reusable food picker with category tabs, search, and quantity sheet
- `src/components/coach/quantity-sheet.tsx` — Bottom sheet for selecting gram amounts with quick buttons and live macro preview
- `src/components/coach/dish-picker-modal.tsx` — Modal for selecting dishes filtered by component category

### Database
- `supabase/migrations/20250507000000_dishes_and_diet_directory.sql` — all tables + RLS + indexes
- `supabase/seed.sql` — seed data (dishes + veg template + partial nonveg template)

## Gotchas
- Client-read RLS policies are defined at the END of the migration (they reference `template_assignments` which must exist first)
- `dish_items.food_id` references the `foods` table but most seed data uses custom items (food_id = NULL) with inline macros
- Different portion sizes of the same food = different dishes (e.g., "200g Rice" ≠ "150g Rice")
- Template edits are immediately visible to assigned clients (no versioning)
- `food_check_ins` has a unique constraint on `(client_id, date)` — one check-in per day, upsert pattern
- Demo mode (`?demo=true`) uses hardcoded mock data on all new pages — no Supabase calls
- The `complete_meal` category dishes only show in the COMPLETE row picker (strict category matching)
- **LANDMINE #19 — template_meal_slots schema drift:** The `template_days` table EXISTS in the migration schema between `diet_templates` and `template_meal_slots`. However, the live DB was modified directly to add a `template_id` column to `template_meal_slots` as well, allowing the code to query slots directly from templates. The migration file does NOT reflect this live DB change. This means:
  - A fresh `supabase db push` will create a schema where the nested select in `TEMPLATE_NESTED_SELECT` will NOT work
  - Before deploying to a new Supabase project, you must run a manual ALTER to add `template_id` directly to `template_meal_slots`
  - See LANDMINES.md #19 for the migration SQL needed
- The template UI currently treats templates as flat (inserting slots for day 1 only) even though the schema has a 7-day structure via `template_days`
- The template editor always shows all 4 component categories (CARB, PROTEIN, FIBER, COMPLETE) even if empty in the DB
- `food_check_in_items.slot_id` and `component_id` are nullable with ON DELETE SET NULL
- "Other" selections store `custom_name` and `custom_calories` on the check-in item
- Old `daily_check_ins` table has been dropped — all daily data is in `food_check_ins`
