# Workout Plans

## What it does
Coaches create structured workout programs for clients. Each plan has multiple training days (3-6), and each day has a name (e.g., "Push", "Pull", "Legs") and a list of exercises with sets, reps, rest periods, and optional notes.

## How it works (step by step)
1. Coach navigates to `/coach/workouts/create` — a multi-step wizard.
2. Step 1: Enter plan name, select client, choose number of training days (3/4/5/6).
3. Steps 2+: For each day, name the day, then browse exercises by muscle group (chest/back/shoulders/arms/legs/core/cardio). Select an exercise → bottom sheet for sets/reps/rest/notes.
4. Review step: See all days with exercises. Can go back to edit individual days.
5. On save: `createWorkoutPlan()` inserts the plan row, then inserts all days as `workout_days` rows with exercises stored as JSONB.
6. Client views their active workout at `/client/workout` with day tabs, exercise details, and YouTube demo links.

## Business rules
- Exercises are stored as JSONB arrays in `workout_days.exercises`, not as separate rows.
- The exercise database is a static TypeScript array (`src/lib/exercise-database.ts`).
- YouTube video IDs are mapped by exercise name in `src/lib/exercise-videos.ts`.
- Custom exercises can be added during creation.
- Plan status is `active` by default — no UI to change it.

## Gotchas
- The edit page (`/coach/workouts/edit`) uses `updateWorkoutPlanDays()` which deletes all days and re-inserts them (same pattern as diet plan meals). Day IDs change on every save.
- The client workout page hardcodes `~60 min` as estimated workout duration regardless of actual exercises.

## Key files
- `src/app/(coach)/coach/workouts/create/page.tsx` — workout creation wizard
- `src/app/(coach)/coach/workouts/edit/page.tsx` — workout edit page (fetches from Supabase, persists changes)
- `src/app/(coach)/coach/workouts/page.tsx` — workout list
- `src/app/(client)/client/workout/page.tsx` — client workout view
- `src/lib/exercise-database.ts` — static exercise list
- `src/lib/exercise-videos.ts` — YouTube video ID mapping
- `src/lib/db.ts` — `createWorkoutPlan`, `getWorkoutPlans`, `getWorkoutPlan`, `getClientWorkoutPlans`, `updateWorkoutPlanDays`
- `src/lib/pdf-export.ts` — `exportWorkoutPlanPDF`
