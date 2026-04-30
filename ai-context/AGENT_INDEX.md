# Agent Index — read this first every session

## Always load
- `ai-context/CONTEXT.md` — what the app does, stack, folder structure, domain vocabulary, business rules
- `ai-context/LANDMINES.md` — dangerous patterns that will break things
- `ai-context/coding-standards/correct-patterns.md` — how this codebase does things
- `ai-context/coding-standards/anti-patterns.md` — what NOT to do
- `ai-context/TEST_FLOWS.md` — manual QA checklist (26 flows) — run after any change

## Load by topic

### Concepts
| If the task involves... | Load |
|------------------------|------|
| Login, signup, auth, roles, guards, demo mode | `concepts/auth-and-roles.md` |
| Diet plans, meals, food database, macros | `concepts/diet-plans.md` |
| Workout plans, exercises, training days | `concepts/workout-plans.md` |
| Check-ins, progress photos, coach feedback | `concepts/check-ins.md` |
| Leads, pricing, checkout, enquiry, payments | `concepts/leads-and-pricing.md` |
| Demo mode, mock data, `?demo=true` | `concepts/demo-mode.md` |
| Habits, daily checklist, habit logs | `concepts/habits.md` |
| Body measurements, weight tracking, charts | `concepts/measurements.md` |
| White-labeling, rebranding, site.config.ts | `concepts/white-label-config.md` |

### Integrations
| If the task involves... | Load |
|------------------------|------|
| Database, auth, storage, RLS, queries | `integrations/supabase.md` |
| WhatsApp messages, wa.me links | `integrations/whatsapp.md` |
| UPI payments, QR codes, payment screenshots | `integrations/upi-payments.md` |

## How to work on this codebase

1. **Read the task.** Summarize what you understand. Wait for confirmation before writing code.
2. **Find and read the relevant files** before changing anything. Use the topic tables above to load the right context.
3. **Check LANDMINES.md** before touching existing code.
4. **Propose your approach** before implementing — one sentence for small tasks, a short plan for anything touching multiple files or the database.
5. **Work one layer at a time.** Don't rewrite things that don't need changing.
6. **After finishing:** check if anything you learned belongs in a concept file. If yes, update it.

## Red flags — stop if you're about to do this

- Change something without reading the surrounding code first
- Write business logic in a route/controller (this project has no API routes — all logic is in `db.ts` or page components)
- Skip error handling on write operations (reads can return `[]`, writes must return `{ error }`)
- Hardcode a value that should be config (especially Supabase credentials, WhatsApp number, UPI ID)
- Skip a transaction when writing to multiple tables (⚠ the codebase already does this — don't make it worse)
- Add a new dependency for something already handled by existing utilities
- Forget to handle demo mode in a new page
- Forget the Suspense boundary when using `useSearchParams()`
- Use camelCase field names when querying Supabase (DB uses snake_case)
- Add server-side data fetching (this is a fully client-side data app)
