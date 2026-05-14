# Implementation Plan: Dishes and Diet Directory

## Overview

This plan implements the full Dishes & Diet Directory feature in incremental steps: test setup, pure calculation logic, database migration, DB functions, seed/fixture data, UI pages (coach dishes, coach templates, client plan view, client food check-in, coach adherence view), and demo mode support. Each task builds on the previous, ending with full integration.

## Tasks

- [x] 1. Set up test framework (Vitest + fast-check)
  - [x] 1.1 Install Vitest and fast-check as dev dependencies
    - Add `vitest`, `@vitest/coverage-v8`, and `fast-check` to `package.json` devDependencies
    - Create `vitest.config.ts` at repo root with TypeScript path aliases matching `tsconfig.json`
    - Add `"test": "vitest --run"` and `"test:watch": "vitest"` scripts to `package.json`
    - _Requirements: Design Testing Strategy_

- [x] 2. Implement pure macro calculation module (`src/lib/macro-calc.ts`)
  - [x] 2.1 Create `src/lib/macro-calc.ts` with all pure calculation functions
    - Implement `calculateItemMacros(per100g, grams)` — returns `(grams / 100) * per100g` for each macro field
    - Implement `calculateDishMacros(items)` — sums item contributions
    - Implement `roundMacros(macros)` — rounds each field to nearest integer
    - Implement `calculateDailyMacros(selectedDishes)` — sums dish totals
    - Implement `calculateAdherenceScore(components, selections, isIntermittentFasting, skippedSlotIds)` — percentage of adherent components
    - Implement `calculateWeeklyAdherence(dailyScores)` — arithmetic mean of submitted days
    - Implement `getTemplateDayForDate(date)` — maps JS `Date.getDay()` (0=Sun) to dayNumber (1=Sun)
    - Export `MacroValues` interface
    - _Requirements: 8.1, 8.3, 8.4, 7.2, 7.3, 7.4_

  - [ ]* 2.2 Write property test: Dish Macro Calculation Correctness (Property 1)
    - **Property 1: Dish Macro Calculation Correctness**
    - Generate arbitrary arrays of food items with random per-100g values and gram amounts
    - Assert total macros equal sum of `(grams / 100) * per_100g_value` rounded to nearest integer
    - **Validates: Requirements 1.1, 1.3, 1.4, 8.1, 9.1**

  - [ ]* 2.3 Write property test: Macro Associativity (Property 10)
    - **Property 10: Macro Associativity**
    - Generate multiple dishes with multiple items each
    - Assert summing pre-calculated dish totals equals summing all individual item contributions (within ±1 tolerance)
    - **Validates: Requirements 8.4**

  - [ ]* 2.4 Write property test: Adherence Score Calculation (Property 8)
    - **Property 8: Adherence Score Calculation**
    - Generate arbitrary component/selection pairs with random skip states
    - Assert score equals `(adherent_components / total_components) * 100`
    - Assert skipped slots count as non-adherent unless intermittent_fasting + slot marked skipped
    - **Validates: Requirements 7.2, 7.3**

  - [ ]* 2.5 Write property test: Weekly Adherence Average (Property 9)
    - **Property 9: Weekly Adherence Average**
    - Generate arrays of 1-7 daily scores
    - Assert weekly average equals arithmetic mean of submitted scores
    - **Validates: Requirements 7.4**

- [x] 3. Implement validation logic (`src/lib/template-validation.ts`)
  - [x] 3.1 Create `src/lib/template-validation.ts` with validation functions
    - Implement `validateDishInput(input)` — rejects empty name, no items, invalid category
    - Implement `validateMealSlotCount(slots)` — accepts 1-6, rejects 0 or >6
    - Implement `validateComponentCategoryMatch(dishCategory, componentCategory)` — allows match or `complete_meal`
    - Implement `validateTemplateCompleteness(days, planType)` — all 7 days have at least one slot with a dish (skipped slots exempt for intermittent_fasting)
    - Implement `filterDishes(dishes, query, categoryFilter)` — name substring + category filter
    - _Requirements: 1.2, 1.5, 2.5, 3.2, 3.3, 3.5, 3.7_

  - [ ]* 3.2 Write property test: Invalid Dish Rejection (Property 2)
    - **Property 2: Invalid Dish Rejection**
    - Generate invalid dish inputs (empty name, no items, bad category)
    - Assert validation always rejects and no side effects occur
    - **Validates: Requirements 1.2, 1.5**

  - [ ]* 3.3 Write property test: Dish Search Filter Correctness (Property 3)
    - **Property 3: Dish Search Filter Correctness**
    - Generate sets of dishes with random names/categories and random queries
    - Assert all returned dishes match criteria and no matching dish is excluded
    - **Validates: Requirements 2.5**

  - [ ]* 3.4 Write property test: Meal Slot Count Constraint (Property 4)
    - **Property 4: Meal Slot Count Constraint**
    - Generate slot counts from 0 to 10
    - Assert only 1-6 accepted, 0 and >6 rejected
    - **Validates: Requirements 3.2**

  - [ ]* 3.5 Write property test: Dish-Component Category Matching (Property 5)
    - **Property 5: Dish-Component Category Matching**
    - Generate all combinations of dish category × component category
    - Assert match succeeds only when categories equal OR dish is `complete_meal`
    - **Validates: Requirements 3.3**

  - [ ]* 3.6 Write property test: Template Completeness Validation (Property 6)
    - **Property 6: Template Completeness Validation**
    - Generate 7-day templates with varying slot/dish configurations
    - Assert validation passes only when all days have at least one non-skipped slot with a dish
    - **Validates: Requirements 3.5, 3.7**

- [x] 4. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Database migration for new tables
  - [x] 5.1 Create Supabase migration file with all new tables and RLS policies
    - Create `supabase/migrations/<timestamp>_dishes_and_diet_directory.sql`
    - Include all tables from design: `dishes`, `dish_items`, `diet_templates`, `template_days`, `template_meal_slots`, `meal_slot_components`, `meal_slot_dishes`, `template_assignments`, `food_check_ins`, `food_check_in_items`
    - Include RLS policies: coach full CRUD on own dishes/templates, client read via assignment, client CRUD on own check-ins
    - Include indexes on foreign keys for query performance
    - _Requirements: 1.1, 3.1, 5.1, 6.5, 7.1_

- [x] 6. Add TypeScript types for the new entities
  - [x] 6.1 Add new types to `src/types/index.ts`
    - Add `ComponentCategory`, `PlanType`, `DishItem`, `Dish`, `DietTemplate`, `TemplateDay`, `TemplateMealSlot`, `MealSlotComponent`, `MealSlotDish`, `TemplateAssignment`, `FoodCheckIn`, `FoodCheckInItem` interfaces
    - Follow existing camelCase conventions in the types file
    - _Requirements: 1.1, 1.2, 3.1, 5.1, 6.1, 7.1_

- [x] 7. Implement database functions in `src/lib/db.ts`
  - [x] 7.1 Add Dishes CRUD functions to `db.ts`
    - Implement `getDishes(coachId)` — select with dish_items joined, return `data || []`
    - Implement `getDish(dishId)` — select single with items
    - Implement `createDish(input)` — insert dish + dish_items, return `{ error, dishId }`
    - Implement `updateDish(dishId, input)` — update dish row, delete-and-reinsert items, return `{ error }`
    - Implement `deleteDish(dishId)` — delete dish (cascade removes items), return `{ error }`
    - Implement `getDishReferences(dishId)` — query meal_slot_dishes → templates for reference check
    - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4_

  - [x] 7.2 Add Diet Templates CRUD functions to `db.ts`
    - Implement `getDietTemplates(coachId)` — select with nested days/slots/components/dishes
    - Implement `getDietTemplate(templateId)` — full nested select for single template
    - Implement `createDietTemplate(input)` — insert template + days + slots + components + dishes
    - Implement `updateDietTemplate(templateId, input)` — update template, delete-and-reinsert nested structure
    - Implement `deleteDietTemplate(templateId)` — delete (cascade), return `{ error }`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 7.3 Add Template Assignment functions to `db.ts`
    - Implement `getClientActiveAssignment(clientId)` — select where status='active', return single or null
    - Implement `assignTemplate(input)` — deactivate existing active assignment, then insert new active one
    - Implement `deactivateAssignment(assignmentId)` — update status to 'inactive'
    - Implement `getCoachAssignments(coachId)` — select all assignments for coach's clients
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 7.4 Write property test: Single Active Assignment Invariant (Property 7)
    - **Property 7: Single Active Assignment Invariant**
    - Test the `assignTemplate` logic: after any sequence of assignments for a client, at most one is active
    - **Validates: Requirements 5.2**

  - [x] 7.5 Add Food Check-in functions to `db.ts`
    - Implement `getFoodCheckIn(clientId, date)` — select single check-in with items for a date
    - Implement `createFoodCheckIn(input)` — upsert check-in + items, calculate adherence score, return `{ error }`
    - Implement `getClientFoodCheckIns(clientId, limit)` — select recent check-ins
    - Implement `getCoachClientAdherence(coachId, clientId)` — select check-ins for a specific client
    - _Requirements: 6.3, 6.4, 6.5, 7.1, 7.2_

- [ ] 8. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Create seed/fixture data from spreadsheet
  - [x] 9.1 Create `src/lib/seed-data.ts` with all 4 diet plan templates as structured data
    - Define all dishes referenced across the 4 plans (Veg, Nonveg, LowCarb_NonVeg, Intermittent Fasting) as typed `Dish` objects with food items, gram amounts, and component categories
    - Define all 4 diet templates as typed `DietTemplate` objects with 7-day structures, meal slots (Breakfast, Lunch, Snack, Dinner), and dish assignments matching the spreadsheet data exactly
    - Include dishes like: "Overnight oats" (28g rolled oats + 30g greek yogurt + 1 scoop protein powder + 20g coconut milk + 2 spoon maple syrup in 200ml almond milk), "Smoothie" (1/3rd frozen banana, 100g frozen mixed berries, 250ml almond milk and protein powder), "Palak paneer 60g raw", "Soy 60g raw curry", "Ground turkey fry 150g", "Chicken breast 150g", etc.
    - Map each spreadsheet meal to the correct day number (Sunday=1, Monday=2, ..., Saturday=7)
    - Handle special cases: Saturday "No Breakfast" in Veg/LowCarb plans, all days "No Breakfast" in Intermittent Fasting plan (mark slots as `isSkipped: true`)
    - Handle the Snack column (present in Nonveg/LowCarb/IF plans but not consistently in Veg plan)
    - _Requirements: 3.1, 3.6, 3.7_

  - [x] 9.2 Create `supabase/seed.sql` Supabase seed script
    - Generate SQL INSERT statements for all dishes and their items from the seed data
    - Generate SQL INSERT statements for all 4 diet templates with their full nested structure (days → slots → components → dishes)
    - Use deterministic UUIDs (uuid_generate_v5 or hardcoded) so the seed is idempotent
    - Include a sample template assignment for a demo client
    - Include sample food check-in data (3-4 days) with realistic adherence scores
    - Script should be runnable via `supabase db reset` or manually
    - _Requirements: 3.1, 5.1, 6.5_

  - [x] 9.3 Add seed data to demo mode mock data (`src/lib/mock-data.ts`)
    - Export `mockDishes` array with all dishes from the seed data (typed as `Dish[]`)
    - Export `mockDietTemplates` array with all 4 templates (typed as `DietTemplate[]`)
    - Export `mockTemplateAssignment` with a sample active assignment
    - Export `mockFoodCheckIns` with sample check-in data and adherence scores
    - Reuse the same structured data from `seed-data.ts` to keep demo and DB seed in sync
    - _Requirements: Design Demo Mode section_

- [x] 10. Coach Dishes Directory UI (`src/app/(coach)/coach/dishes/page.tsx`)
  - [x] 10.1 Create the Dishes Directory list page
    - Display all dishes grouped by component category (carbohydrate, protein, fiber, complete_meal)
    - Show dish name, emoji, total macros (cal/protein/carbs/fat) for each dish
    - Add search input that filters by name substring (within 300ms debounce)
    - Add category filter tabs/buttons
    - Support `?demo=true` — render `mockDishes` without Supabase calls
    - Include "Create Dish" button linking to create page
    - _Requirements: 2.1, 2.5_

  - [x] 10.2 Create the Dish create/edit page (`src/app/(coach)/coach/dishes/[id]/page.tsx`)
    - Form with: dish name input, emoji picker, component category selector
    - Food item picker: browse food database (from `foods` table or static `food-database.ts`), enter gram amount
    - Support adding custom food items with manual macro entry (name, emoji, per-100g macros, grams)
    - Live macro calculation as items are added/removed/changed (using `macro-calc.ts`)
    - Visually distinguish custom items from standard food database items
    - Save button calls `createDish` or `updateDish`
    - Delete button with reference check — show warning if dish is used in templates
    - Support `?demo=true` — show pre-filled demo dish, disable save
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.2, 2.3, 2.4, 9.1, 9.2, 9.3_

- [x] 11. Coach Diet Templates UI (`src/app/(coach)/coach/diet-templates/`)
  - [x] 11.1 Create the Diet Templates list page (`page.tsx`)
    - Display all templates with name, plan type badge, and creation date
    - Include "Create Template" button
    - Support `?demo=true` — render `mockDietTemplates`
    - _Requirements: 4.1_

  - [x] 11.2 Create the Template create/edit page (`[id]/page.tsx`)
    - Form with: template name, plan type selector (veg, nonveg, low_carb_nonveg, intermittent_fasting)
    - 7-day tab/accordion structure (Sunday through Saturday)
    - Per day: add/remove meal slots (1-6), each with name and optional target calories
    - Per slot: add component positions (carbohydrate, protein, fiber) with dish picker
    - Dish picker filters by matching component_category (or complete_meal)
    - Support multiple alternative dishes per component
    - For intermittent_fasting: allow marking slots as skipped
    - Validate completeness before save (all days have at least one non-skipped slot with a dish)
    - Show daily macro totals and per-slot macro summaries
    - Support `?demo=true`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 11.3 Create the Template assignment page (`assign/page.tsx`)
    - Select a template from the list
    - Select a client from coach's client list
    - Show warning if client already has an active assignment (will be deactivated)
    - Assign button calls `assignTemplate`
    - Support `?demo=true`
    - _Requirements: 5.1, 5.2_

- [x] 12. Client Diet Plan View (`src/app/(client)/client/diet-plan/page.tsx`)
  - [x] 12.1 Create the client weekly diet plan view page
    - Fetch client's active assignment via `getClientActiveAssignment`
    - Display full 7-day weekly view with today's day highlighted
    - Show each day's meal slots with dishes organized by component category
    - Display dish name, emoji, macros for each dish
    - Where alternatives exist, show all options with visual indicator
    - Show daily macro totals and per-slot target vs actual calories
    - Show "No plan assigned" state if no active assignment
    - Support `?demo=true` — render mock assignment/template
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.3_

- [x] 13. Client Food Check-in UI (`src/app/(client)/client/food-check-in/page.tsx`)
  - [x] 13.1 Create the daily food check-in page
    - Determine current day of week using `getTemplateDayForDate`
    - Display today's meal slots from the assigned template
    - For each meal component, show prescribed dish alternatives as selectable radio/card options
    - Allow marking a meal slot as skipped
    - Show running total of macros based on selections
    - Submit button calls `createFoodCheckIn` with all selections and calculated macros/adherence
    - Show "already submitted" state if check-in exists for today (with option to update)
    - Show "no plan assigned" state if no active assignment
    - Support `?demo=true` — render mock template day with pre-selected dishes
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 13.2 Add check-in reminder to client home page
    - On `/client` home page, check if today's food check-in exists
    - If not, display a reminder card linking to `/client/food-check-in`
    - Support `?demo=true`
    - _Requirements: 6.6_

- [x] 14. Coach Adherence View (`src/app/(coach)/coach/clients/[id]/` — adherence tab)
  - [x] 14.1 Add adherence tab to the client detail page
    - Add a new "Diet Adherence" tab to the existing client detail page
    - Fetch check-in history via `getCoachClientAdherence`
    - Display daily adherence scores in a list/calendar view
    - Show weekly adherence average (last 7 days with submissions)
    - For each day, show prescribed vs actual selections side by side
    - Highlight non-adherent components (skipped or different dish chosen)
    - Support `?demo=true` — render `mockFoodCheckIns`
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 15. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Integration wiring and final polish
  - [x] 16.1 Add navigation links for new pages
    - Add "Dishes" link to coach sidebar navigation (`src/components/coach/sidebar.tsx`)
    - Add "Diet Templates" link to coach sidebar navigation
    - Add "Diet Plan" link to client bottom navigation (`src/components/client/navbar.tsx`)
    - Add "Food Check-in" link to client bottom navigation
    - _Requirements: 2.1, 4.1, 5.3, 6.1_

  - [x] 16.2 Wire demo mode hooks for all new pages
    - Ensure `useIsDemo()` hook is used consistently across all new pages
    - Verify demo mode renders mock data without any Supabase calls
    - Verify demo mode disables write operations (create/edit/delete/assign/submit)
    - _Requirements: Design Demo Mode section_

  - [ ]* 16.3 Write integration tests for key flows
    - Test dish creation flow: validate input → create → verify macros calculated
    - Test template assignment flow: assign → verify client can read → reassign → verify old deactivated
    - Test food check-in flow: submit selections → verify adherence score → verify coach can view
    - _Requirements: 1.1, 5.2, 6.5, 7.2_

- [ ] 17. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The seed data task (9) creates real data from the user's spreadsheet that works both as Supabase seed SQL and as demo mode mock data
- All new pages follow existing patterns: Suspense boundaries, demo mode via `?demo=true`, reads return `data || []`, writes return `{ error }`
