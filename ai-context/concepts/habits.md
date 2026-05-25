# Daily Habits

## What it does
Coaches assign daily habits to clients (e.g., "Drink 3L water", "10k steps", "Take creatine"). Clients check them off each day with optional value tracking (e.g., 2.5L of water). Values are persisted to the database.

## How it works (step by step)
1. Coach navigates to a client's detail page (`/coach/clients/[id]`) and opens the "Habits" tab.
2. Coach clicks "Add Habit", picks an emoji, enters a name and target, and saves.
3. `addHabit()` inserts a row into the `habits` table linked to the coach and client.
4. Client sees their habits at `/client/habits` as a daily checklist.
5. Client can enter a value (if the habit has a `unit`) and toggle completion.
6. `toggleHabitLog()` does an upsert: checks for existing log for that habit+client+date, updates if found, inserts if not. The optional `value` parameter is stored in the `habit_logs.value` column.
7. A progress bar shows completion percentage for the day.
8. Coach can delete habits from the "Habits" tab on the client detail page.

## Business rules
- Habits are per-client, assigned by the coach.
- Habit logs are per-day — one log per habit per date.
- The habit `target` is display-only text (e.g., "3L per day") — not enforced.
- The `unit` field on habits determines whether a value input is shown on the client side.
- Deleting a habit cascades to delete its logs (via FK `on delete cascade` in the schema).

## Gotchas
- In demo mode, habits are hardcoded with different IDs than the mock data in `mock-data.ts`.
- The `habits` table doesn't have a `unit` column — the demo data uses it but real DB habits won't have it. The client habits page checks `habit.unit` which will be `undefined` for real data, so the value input won't show. To add unit support to real habits, run: `ALTER TABLE habits ADD COLUMN IF NOT EXISTS unit text;` — see Landmine #21.

## Key files
- `src/app/(client)/client/habits/page.tsx` — client habit checklist
- `src/app/(coach)/coach/clients/[id]/page.tsx` — coach habit management (Habits tab)
- `src/lib/db.ts` — `getHabits`, `getHabitLogs`, `toggleHabitLog`, `addHabit`, `deleteHabit`
- `src/lib/mock-data.ts` — `mockHabits` (used by in-memory store)
