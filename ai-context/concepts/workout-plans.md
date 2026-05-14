# Workout Plans

## What it does
Coaches create structured workout programs for clients. The system has two layers:

1. **Workout Templates** — reusable workout structures (is_template=true) that can be assigned to multiple clients
2. **Workout Plans** — client-specific instances (is_template=false) created from templates or from scratch, assigned via `workout_assignments`

## Architecture (layered)

```
Exercises (static exercise-database.ts + DB exercises table)
    → Workout Templates (reusable, is_template=true)
        → Workout Plans (is_template=false, assigned to clients)
            → Workout Assignments (latest by created_at = active)
```

## Key Concepts

### Workout Template
A reusable workout structure with:
- Name (e.g., "Push Pull Legs", "Upper Lower Split")
- 1-7 workout slots (e.g., "Push", "Pull", "Legs")
- Each slot has exercises with sets, reps, rest, notes
- `is_template=true` for library templates, `false` for client-specific plans

### Workout Slot
A single training day/session within a template:
- Name (e.g., "Push Day", "Upper A")
- Sort order
- List of exercises

### Workout Slot Exercise
An exercise within a slot:
- References `exercises` table (exercise_id) OR custom (custom_name + custom_emoji)
- Sets (integer), Reps (text — supports "10-12", "AMRAP"), Rest seconds
- Optional notes

### Workout Assignment
Links a workout template/plan to a client:
- Latest assignment by `created_at` is the active one (no status flag)
- Coach can reassign anytime

## Database Tables (4 new tables)

| Table | Purpose |
|-------|---------|
| `workout_templates` | Template/plan container (coach_id, name, is_template) |
| `workout_template_slots` | Workout days within a template (template_id, name, sort_order) |
| `workout_slot_exercises` | Exercises within a slot (exercise_id or custom, sets, reps, rest, notes) |
| `workout_assignments` | Links template to client (latest = active) |

## How it works (step by step)

### Coach creates workout template
1. `/coach/workout-templates` — list all templates
2. `/coach/workout-templates/create` — name + workout slots with exercises
3. Exercise picker shows exercises grouped by muscle group (Chest, Back, Shoulders, Arms, Legs, Core, Cardio)
4. Merges static `exerciseDatabase` with DB `exercises` table
5. Bottom sheet for sets/reps/rest/notes when adding exercise

### Coach creates workout plan for client
1. `/coach/workouts/create` — client selector + optional template pre-fill
2. Same slot/exercise editor UI as template page
3. "Create & Assign" creates a new workout_template (is_template=false) and assigns to client

### Active workout
- Latest `workout_assignments` row by `created_at` for a client = their active workout
- No status flag — just insert a new assignment to change

## Key files

### Data layer
- `src/lib/db.ts` — getWorkoutTemplates, getWorkoutTemplate, createWorkoutTemplate, updateWorkoutTemplate, deleteWorkoutTemplate, getWorkoutAssignments, getClientActiveWorkoutAssignment, assignWorkoutTemplate
- `src/lib/exercise-database.ts` — static exercise list + muscle groups
- `src/types/index.ts` — WorkoutTemplate, WorkoutTemplateSlot, WorkoutSlotExercise, WorkoutAssignment

### UI pages
- `src/app/(coach)/coach/workout-templates/page.tsx` — templates list
- `src/app/(coach)/coach/workout-templates/[id]/page.tsx` — template create/edit
- `src/app/(coach)/coach/workouts/create/page.tsx` — workout plan creation (client + template pre-fill)
- `src/app/(coach)/coach/workouts/page.tsx` — assigned workout plans list (new template system only)
- `src/app/(client)/client/workout/page.tsx` — client workout view (uses getClientActiveWorkoutAssignment)

### Shared components
- `src/components/coach/exercise-picker.tsx` — Exercise picker modal with muscle group tabs, search, and detail sheet for sets/reps/rest/notes

### Database
- `supabase/migrations/20250511000000_workout_templates.sql` — all tables + RLS + indexes

## Gotchas
- `workout_slot_exercises.exercise_id` can be NULL for custom exercises (uses custom_name + custom_emoji instead)
- Static exercises (from exercise-database.ts) have short IDs like "e1", "e2" — these are stored as custom (exercise_id=null, custom_name set) since they don't exist in the DB exercises table
- DB exercises have UUID IDs — only those get stored as exercise_id references
- Template edits are immediately visible to assigned clients (no versioning)
- The old workout system (workout_plans + workout_days tables) has been removed from the codebase — only the template system is active
- Demo mode uses hardcoded mock data — no Supabase calls
- Client needs RLS policies on workout_templates, workout_template_slots, and workout_slot_exercises to read their assigned workout (added via migration)
