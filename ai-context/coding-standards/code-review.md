# Code Review Standards

Use this checklist after writing or modifying any code. Only report issues you are confident about — a clean review with zero findings is valid and expected.

## Confidence rule

Before flagging anything, answer:
1. Can I cite the exact file and line?
2. Can I describe the concrete failure mode (input → bad outcome)?
3. Have I read the surrounding context (callers, types, guards)?
4. Is the severity defensible?

If any answer is "no", drop or downgrade the finding.

---

## CRITICAL — must fix before merge

### Hardcoded secrets or UUIDs
```typescript
// BAD — coach UUID hardcoded in seed/code
const coachId = "fdc7c8d4-04c7-4e2e-a7bb-2a1b21a8433e";

// GOOD — read from env or auth context
const { user } = useAuth();
const coachId = user.id;
```
This project has been bitten by this: seed_workouts.sql used a wrong hardcoded UUID and templates showed for the wrong coach.

### Missing RLS policy on a new table
Every new table needs:
- Coach CRUD policy: `coach_id = auth.uid()`
- Client SELECT policy (if clients read it): join through `workout_assignments` or `template_assignments`

Missing client RLS = client gets empty data even though the query is correct. This happened with `workout_template_phases`.

### Write operation without error handling
```typescript
// BAD
await sb.from("things").insert(data);

// GOOD
const { error } = await sb.from("things").insert(data);
return { error: error?.message || null };
```

### Auth guard missing on a new route
All coach routes are under `(coach)/` group which has `CoachGuard`. All client routes are under `(client)/` group with `ClientGuard`. New routes outside these groups have no auth protection.

---

## HIGH — fix before merge

### Snake_case vs camelCase mismatch in DB queries
```typescript
// BAD — camelCase field in Supabase query
.eq("coachId", id)          // returns nothing, no error
.select("clientId, planType") // returns null fields

// GOOD — snake_case matches DB columns
.eq("coach_id", id)
.select("client_id, plan_type")
```

### Supabase nested select missing RLS on joined table
```typescript
// If you add a new join to an existing query:
.select("*, new_table(*)")
// Check that new_table has a SELECT policy for the querying role.
// Missing policy = the join returns [] silently.
```

### React useEffect with missing dependencies
```typescript
// BAD — stale closure, userId changes won't re-fetch
useEffect(() => {
  loadData(userId);
}, []); // userId missing

// GOOD
useEffect(() => {
  if (user) loadData(user.id);
}, [user]);
```

### Demo mode not handled in a new page
Every page that fetches data must have a demo fork:
```typescript
useEffect(() => {
  if (isDemo) { setData(demoData); setLoading(false); return; }
  if (user) loadData();
}, [user, isDemo]);
```
Missing demo mode = page crashes or shows empty state when accessed via `?demo=true`.

### Config value hardcoded in shared code
```typescript
// BAD — breaks other clients
const coachName = "Arsh Sandhu";
const whatsapp = "919876543210";

// GOOD
import { config } from "@/lib/config";
const coachName = config.coach.name;
const whatsapp = config.contact.whatsapp;
```

### New field added to `clients/types.ts` without updating all client configs
If `ClientConfig` gets a new required field, every `clients/<id>/config.ts` must be updated. Missing = build error on other client deployments.

---

## MEDIUM — should fix

### Console.log left in code
Remove all `console.log` before merge. Use `console.error` only for genuine error paths.

### `any` type used where a real type exists
```typescript
// BAD
const data: any = await getDishes(user.id);

// GOOD — check db.ts for the actual return shape
const data = await getDishes(user.id); // Dish[]
```

### File over 600 lines
Split by responsibility. Pages should be UI only — data logic in `db.ts`, types in `types/index.ts`.

### Duplicate rendering logic instead of shared component
If the same data structure is rendered in 2+ places, it belongs in `src/components/shared/`. See `correct-patterns.md` #16.

---

## LOW — note only

### Missing empty state
Every list view needs an empty state card when `data.length === 0`.

### Missing loading state
Every async data fetch needs a loading spinner while in-flight.

### `?demo=true` not preserved in `router.push()`
```typescript
// BAD
router.push("/coach/clients");

// GOOD
const demoSuffix = useDemoSuffix();
router.push(`/coach/clients${demoSuffix}`);
```

---

## Common false positives — skip these

- "Missing error handling" on a read that returns `data || []` — reads never throw in this codebase
- "Should use server component" — this project is fully client-side, no server components fetch data
- "Missing input validation" on internal DB functions — callers validate before calling
- "Should add API route" — this project has zero API routes by design
- "Magic number" for HTTP status codes, array indices, or obvious constants
- "Consider adding types" on `any[]` returns from `db.ts` — the DB returns snake_case, TypeScript types are camelCase, they don't map 1:1

---

## Review output format

```
[CRITICAL] Missing RLS policy on workout_template_phases
File: supabase/migrations/20250528000000_workout_phases.sql
Issue: Client SELECT policy uses ambiguous `template_id` column reference.
       Clients get empty phases array even when assigned.
Fix: Use `workout_template_phases.template_id` explicitly in the policy.
```

End with:
```
## Summary
| Severity | Count |
|----------|-------|
| CRITICAL | 0     |
| HIGH     | 1     |
| MEDIUM   | 0     |
| LOW      | 2     |

Verdict: WARNING — 1 HIGH issue should be resolved before merge.
```

Approve if no CRITICAL or HIGH. A clean review is a valid review.
