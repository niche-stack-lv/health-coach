# Build Workflow — How to Build Anything in This Codebase

This document is the step-by-step build playbook. It sits alongside CONTEXT.md and LANDMINES.md as required reading before implementing any feature.

---

## The 6-step build loop

```
Understand → Load Context → Pre-flight → Plan → Implement → Verify
```

Never skip a step. Never merge two steps. If you get blocked at any step, stop and surface the blocker — don't improvise.

---

## Step 1 — Understand

Before looking at any code:

1. **Restate the task in one sentence.** If you can't, the task is underspecified — ask.
2. **Identify the domain.** Which of these areas does it touch?
   - Coach portal (`src/app/(coach)/coach/`)
   - Client portal (`src/app/(client)/client/`)
   - Public pages (`src/app/` root-level routes)
   - Auth / guards (`src/components/auth-guard.tsx`, `src/lib/auth-context.tsx`)
   - Config / white-label (`clients/`, `site.config.ts`, `clients/types.ts`)
   - Database layer (`src/lib/db.ts`, `supabase/migrations/`)
   - Shared components (`src/components/ui/`, `src/components/shared/`)
   - PDF export (`src/lib/pdf-export.ts`, `src/lib/confirmation-pdf.ts`)
3. **Confirm understanding** with the user before loading context.

---

## Step 2 — Load Context

Use AGENT_INDEX.md's topic table to pick the right files. Always load:

| File | Why |
|---|---|
| `AGENT_INDEX.md` | Routes you to the rest |
| `LANDMINES.md` | Must read before touching anything |
| `coding-standards/correct-patterns.md` | How to write code here |
| `coding-standards/anti-patterns.md` | What to avoid |

Then load from these groups based on the domain:

**Domain: Coach / Client portals**
→ Load the concept file for the feature area (e.g., `concepts/diet-plans.md`)

**Domain: Auth, roles, guards**
→ `concepts/auth-and-roles.md`, `concepts/demo-mode.md`

**Domain: Database**
→ `integrations/supabase.md`

**Domain: Config / white-label**
→ `concepts/white-label-config.md`

**Domain: Payments, leads**
→ `concepts/leads-and-pricing.md`, `integrations/upi-payments.md`, `integrations/whatsapp.md`

---

## Step 3 — Pre-flight Landmine Check

Answer each question before writing code:

### Config safety
- [ ] Am I hardcoding any client-specific value (name, price, color, contact) in `src/`?
  → If yes: read from `config` instead
- [ ] Am I adding a required field to `clients/types.ts`?
  → If yes: update ALL existing client configs before continuing

### Database safety
- [ ] Am I adding a new column?
  → Update: (1) CREATE function input + insert, (2) UPDATE function input + update, (3) row mapper
- [ ] Am I writing a query that joins multiple tables?
  → Add RLS SELECT policy on every table in the join chain
- [ ] Am I passing a user-selected string (e.g. `"other"`, `""`) to a UUID column?
  → Convert to `null` before insert
- [ ] Am I using field names in a Supabase query?
  → Use snake_case (DB) not camelCase (TypeScript)

### File safety
- [ ] Am I creating a storage upload feature?
  → Verify bucket exists; create it via migration if not
- [ ] Am I onboarding a new client?
  → Register in BOTH `site.config.ts` AND `src/app/page.tsx`

### Regression safety
- [ ] Does my change to `src/` affect ALL client deployments?
  → Consider whether it should be in `clients/<id>/` instead

---

## Step 4 — Plan

For any task touching more than one file:

1. **List every file that will change** — source files, types, DB functions, migrations.
2. **Sequence the changes** — bottom-up (types → db.ts → page component → UI).
3. **Identify demo data needed** — every new page needs demo-mode mock data.
4. **State assumptions** — if you're unsure about a business rule, list it. Don't guess.
5. **Present the plan to the user.** One sentence for a simple addition, a short numbered list for anything multi-file.

---

## Step 5 — Implement

Work in this order:

### 1. Types first (`src/types/index.ts`)
Define the TypeScript interface before writing any DB or UI code.

```typescript
export interface NewThing {
  id: string;
  ownerId: string;
  name: string;
  // camelCase in TypeScript, maps to snake_case in DB
}
```

### 2. Migration next (`supabase/migrations/YYYYMMDDHHMMSS_name.sql`)
If a new table or column is needed, write the migration before the DB functions.
- Include RLS enable + policies
- Include indexes if queried frequently
- Never edit an applied migration — always create a new file

### 3. DB functions (`src/lib/db.ts`)
- Reads: return `data || []`, never throw
- Writes: return `{ error: string | null }`
- Use `getSupabase()` — never create a new client

### 4. Page / component
- `"use client"` at top
- Suspense wrapper for any page using `useSearchParams()`
- Demo mode fork in every `useEffect` that loads data
- Loading spinner, error state, empty state all handled
- Config values via `import { config } from "@/lib/config"`
- Route pushes preserve `?demo=true`

### 5. Navigation / links (if needed)
- Add sidebar item in `src/components/coach/sidebar.tsx` if it's a new coach route
- Add bottom nav item in `src/components/client/navbar.tsx` if it's a new client route

---

## Step 6 — Verify

After implementing, run through the relevant test flows from `TEST_FLOWS.md`.

| What changed | Flows to run |
|---|---|
| Any page in coach portal | F9–F15 + specific feature flow |
| Any page in client portal | F16–F22 + specific feature flow |
| Pricing, payment, leads | F5, F6, F7 |
| Config / white-label | F23, F24 |
| Auth | F2, F3, F4 |
| Public pages | F1, F8 |
| New client added | F1, F2, F23, F24 |

**Verify these pass for every change:**
- [ ] No TypeScript errors (`npm run build` is clean)
- [ ] No ESLint errors (`npm run lint` is clean)
- [ ] Page loads in demo mode without Supabase
- [ ] Page loads with real Supabase connection
- [ ] No console errors or unhandled rejections
- [ ] Loading state shows while fetching
- [ ] Empty state shows when there's no data
- [ ] Error state shows if a write fails

---

## Verification loop (for complex changes)

For any change touching multiple files or the DB, run this loop before presenting the result:

```
Write code → tsc --noEmit → fix errors → check diagnostics → test in browser → done
```

1. **TypeScript first** — run `npx tsc --noEmit`. Zero errors before moving on.
2. **Diagnostics** — use getDiagnostics on every file you touched.
3. **Demo mode** — open `localhost:3000?demo=true` and verify the page works without Supabase.
4. **Real data** — open the page logged in and verify data loads correctly.
5. **Write path** — if you added a write operation, test it end-to-end (create/update/delete).
6. **RLS check** — if you added a new table or policy, verify both coach and client can access what they should (and can't access what they shouldn't).

**If the same error appears twice:** stop patching. Diagnose the root cause. A different approach is needed.

**What "done" means:**
- Zero TypeScript errors
- Zero console errors in browser
- Demo mode works
- Real data works
- No regression in adjacent features

---

## Building specific things

### New coach page

1. Create `src/app/(coach)/coach/<feature>/page.tsx`
2. Use the Suspense + inner component shell
3. Add `useIsDemo()` + demo data fork
4. Add DB read + write functions in `db.ts`
5. Add TypeScript interface in `src/types/index.ts`
6. Add sidebar nav link in `src/components/coach/sidebar.tsx` (with `?demo=true` suffix)
7. Write migration if new table
8. Run F9–F15 + verify your new flow

### New client page

1. Create `src/app/(client)/client/<feature>/page.tsx`
2. Use the Suspense + inner component shell
3. Add `useIsDemo()` + demo data fork
4. Add DB read + write functions in `db.ts`
5. Add TypeScript interface in `src/types/index.ts`
6. Add bottom nav item in `src/components/client/navbar.tsx` if top-level
7. Write migration if new table
8. Run F16–F22 + verify your new flow

### New DB table

1. Write migration in `supabase/migrations/YYYYMMDDHHMMSS_<table_name>.sql`
   - `create table`, RLS enable, policies for coach + client, indexes
2. Add TypeScript interface in `src/types/index.ts`
3. Add CRUD functions in `src/lib/db.ts` (read → array, write → `{ error }`)
4. Update any editor UIs that need to show all possible options (see Landmine #17)

### New config field (shared platform)

1. Add typed optional field to `clients/types.ts`
2. Update ALL existing client configs in `clients/<id>/config.ts`
3. Use via `config.newField` in shared code — never hardcode
4. If it's a color: add CSS var injection in `src/components/theme-vars.tsx`

### New client onboarding

1. `mkdir clients/<client-id>`
2. `cp clients/_template.ts clients/<client-id>/config.ts` — fill in all values
3. Create `clients/<client-id>/landing.tsx` — custom landing page
4. Add images to `public/<client-id>/`
5. Register in `site.config.ts` (import + add to `clients` map)
6. Register in `src/app/page.tsx` (dynamic import + add to `landings` map)
7. Create new Supabase project
8. Run `supabase db push` against new project
9. Set Vercel env vars: `CLIENT_ID`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
10. Run F1, F2, F5, F23, F24 against new deployment

---

## Dependency rules

**Allowed:**
- Everything already in `package.json`
- Standard Web APIs

**Not allowed:**
- Adding new npm packages for anything that can be done with existing utilities
- Specifically: no shadcn, no Radix UI, no additional icon libraries, no form libraries, no state management libraries

**If you think you need a new package:** state the reason. The bar is high.
