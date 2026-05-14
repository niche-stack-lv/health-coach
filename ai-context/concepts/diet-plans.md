# Diet Plans

> **NOTE:** This is the LEGACY diet plan system. The new system is in `concepts/dishes-and-diet-directory.md`.
> Both coexist — the legacy system uses `diet_plans` + `diet_meals` tables, the new system uses `dishes` + `diet_templates` + related tables.

## What it does (LEGACY)
Coaches create personalized diet plans for clients. Each plan has a title, duration (weeks), date range, and exactly 4 meals (Breakfast, Lunch, Snack, Dinner). Each meal contains food items with gram amounts and auto-calculated macros.

## How it works (step by step)
1. Coach navigates to `/coach/plans/create` — a 6-step wizard.
2. Step 1: Enter plan name, select client, choose duration (2/3/4/6 weeks).
3. Steps 2-5: Build each meal by browsing the food database (categorized as protein/carbs/fats/supplements), selecting a food, entering gram amount via bottom sheet, and seeing live macro calculations.
4. Step 6: Review all meals with daily macro totals. Can go back to edit individual meals.
5. On save: `createDietPlan()` inserts the plan row, then inserts all meals as `diet_meals` rows.
6. Coach can view/edit existing plans at `/coach/plans/[id]` — inline editing with the same food picker.
7. Client views their active plan at `/client/plan` with a PDF export option.

## Business rules
- Plans have exactly 4 meals — enforced by the UI (mealTypes array), not the database.
- Food items are stored as string arrays in `diet_meals.items` (e.g., `"Chicken Breast (200g)"`), not as structured data.
- Macros (calories, protein, carbs, fat) are calculated client-side from the food database's per-100g values and stored as totals per meal.
- The food database is a static TypeScript array (`src/lib/food-database.ts`) — not in the DB.
- Custom foods can be added during plan creation with manually entered macros.
- Plan status can be `active`, `completed`, or `draft` — but there's no UI to change status after creation.

## Gotchas
- `updateDietPlanMeals()` deletes all meals and re-inserts them without a transaction. Meal IDs change on every save.
- The plan detail page (`/coach/plans/[id]`) tries to match food names from the `items` string array back to the food database for editing. If the food was custom or the name doesn't match exactly, it falls back to a generic food item with zero macros.
- PDF export uses the TypeScript `DietPlan` type (camelCase) but DB data is snake_case — the client plan page manually maps `start_date` → `startDate` when calling `exportDietPlanPDF`.

## Key files
- `src/app/(coach)/coach/plans/create/page.tsx` — plan creation wizard
- `src/app/(coach)/coach/plans/[id]/page.tsx` — plan detail/edit
- `src/app/(coach)/coach/plans/page.tsx` — plan list
- `src/app/(client)/client/plan/page.tsx` — client plan view
- `src/lib/food-database.ts` — static food items with macros
- `src/lib/db.ts` — `createDietPlan`, `getDietPlans`, `updateDietPlanMeals`
- `src/lib/pdf-export.ts` — `exportDietPlanPDF`
