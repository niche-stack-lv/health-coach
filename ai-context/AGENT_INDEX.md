# Agent Index — read this first every session

## Always load
- `ai-context/CONTEXT.md` — what the app does, multi-client architecture, stack, folder structure, domain vocabulary, business rules
- `ai-context/LANDMINES.md` — dangerous patterns that will break things
- `ai-context/coding-standards/correct-patterns.md` — how this codebase does things
- `ai-context/coding-standards/anti-patterns.md` — what NOT to do
- `ai-context/coding-standards/architecture.md` — layer responsibilities, constraints, bundler, state management
- `ai-context/TEST_FLOWS.md` — manual QA checklist (26 flows) — run after any change
- `ai-context/BUILD_WORKFLOW.md` — 6-step build loop for any new feature, page, or DB operation

## Load by topic

### Concepts
| If the task involves... | Load |
|------------------------|------|
| White-labeling, multi-client, adding a new client, config, CLIENT_ID | `concepts/white-label-config.md` |
| Login, signup, auth, roles, guards, demo mode | `concepts/auth-and-roles.md` |
| Diet plans, meals, food database, macros | `concepts/diet-plans.md` |
| Dishes, diet templates, meal slots, components, food check-ins, adherence | `concepts/dishes-and-diet-directory.md` |
| User management, creating coaches/clients, auth.users vs profiles | `concepts/user-management.md` |
| Workout plans, exercises, training days | `concepts/workout-plans.md` |
| Check-ins, progress photos, coach feedback | `concepts/check-ins.md` |
| Leads, pricing, checkout, enquiry, payments | `concepts/leads-and-pricing.md` |
| Demo mode, mock data, `?demo=true` | `concepts/demo-mode.md` |
| Habits, daily checklist, habit logs | `concepts/habits.md` |
| Body measurements, weight tracking, charts | `concepts/measurements.md` |

### Integrations
| If the task involves... | Load |
|------------------------|------|
| Database, auth, storage, RLS, queries | `integrations/supabase.md` |
| WhatsApp messages, wa.me links | `integrations/whatsapp.md` |
| UPI payments, QR codes, payment screenshots | `integrations/upi-payments.md` |

### Code quality
| If the task involves... | Load |
|------------------------|------|
| Reviewing code before merge | `coding-standards/code-review.md` |
| Auth, RLS, secrets, input handling | `coding-standards/security.md` |
| System design, new feature architecture | `coding-standards/architecture.md` |

## How to work on this codebase

1. **Read the task.** Summarize what you understand. Wait for confirmation before writing code.
2. **Find and read the relevant files** before changing anything. Use the topic tables above to load the right context.
3. **Check LANDMINES.md** before touching existing code.
4. **Propose your approach** before implementing — one sentence for small tasks, a short plan for anything touching multiple files or the database.
5. **Work one layer at a time.** Don't rewrite things that don't need changing.
6. **After finishing:** check if anything you learned belongs in a concept file. If yes, update it.

## Multi-client awareness

When working on this repo, always consider:
- **Shared platform code** (`src/`) affects ALL clients. Changes here deploy to everyone.
- **Client-specific code** (`clients/<id>/`) affects only that client.
- **Config fields** — if you need a new value in shared code, add it to `clients/types.ts` and update ALL client configs.
- **Landing pages** are fully custom per client — don't try to generalize them.
- **Never hardcode** client-specific values (names, prices, colors, contact info) in shared code. Always read from `config`.

## Red flags — stop if you're about to do this

- Hardcode a value that should come from config (especially in shared platform code)
- Change shared platform code without considering impact on all clients
- Add a required field to `clients/types.ts` without updating all existing client configs
- Put landing-page-specific data into the shared type
- Forget to register a new client in BOTH `site.config.ts` AND `src/app/page.tsx`
- Write business logic in a route/controller (all logic is in `db.ts` or page components)
- Skip error handling on write operations (reads return `[]`, writes return `{ error }`)
- Skip a transaction when writing to multiple tables
- Add a new dependency for something already handled by existing utilities
- Forget to handle demo mode in a new page
- Forget the Suspense boundary when using `useSearchParams()`
- Use camelCase field names when querying Supabase (DB uses snake_case)
- Add server-side data fetching (this is a fully client-side data app)
