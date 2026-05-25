# Client Onboarding

## What it does
A 7-step questionnaire that captures a client's fitness background, goals, diet habits, and health history when they first join. The data is stored in `client_onboarding` and is visible to the coach in the client's detail page.

---

## How it works (step by step)

1. Client navigates to `/client/onboarding` (usually prompted on first login).
2. The 7-step form collects ~21 fields across sections: goals, motivation, body stats, activity, diet habits, health history.
3. On submit, `saveOnboarding()` does an **upsert** into `client_onboarding` (INSERT if first time, UPDATE if re-submitting).
4. Client is redirected to `/client` (home).
5. Coach can view the summary in `/coach/clients/[id]` under the "Onboarding" tab.
6. Client can re-submit (update) at any time from `/client/profile`.

---

## DB Table: `client_onboarding`

One row per client enforced by a UNIQUE constraint on `client_id`.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| client_id | uuid | FK → profiles(id) ON DELETE CASCADE, UNIQUE |
| created_at | timestamptz | Row creation timestamp |
| primary_goal | text | e.g., "Fat Loss", "Muscle Gain" |
| other_goals | text | Secondary goals (free text) |
| motivation | text | Why they want to change |
| target_weight | numeric | Desired weight in kg |
| timeline | text | Timeframe e.g., "3 months" |
| age | int | Client age in years |
| height | text | Height (free text, e.g., "175cm") |
| current_weight | numeric | Current weight in kg |
| weight_history | text | History with weight (free text) |
| activity_level | text | e.g., "Sedentary", "Moderately Active" |
| work_type | text | Desk job, physical, etc. |
| sleep_schedule | text | Sleep pattern description |
| breakfast | text | Typical breakfast |
| lunch | text | Typical lunch |
| snacks | text | Typical snacks |
| dinner | text | Typical dinner |
| weekends | text | Weekend eating habits |
| pitfalls | text | Common diet pitfalls |
| medical_conditions | text | Medical history relevant to coaching |
| injuries | text | Current or past injuries |
| notes | text | Any extra notes |

**Total: ~21 data fields** (not 40 — the form has 7 steps but many fields share a step).

---

## Key DB Functions (src/lib/db.ts)

```typescript
saveOnboarding(data: OnboardingData): Promise<{ error: string | null }>
// Does INSERT ... ON CONFLICT (client_id) DO UPDATE SET ...
// Works whether or not the client has completed onboarding before.

getOnboarding(clientId: string): Promise<ClientOnboarding | null>
// Returns the row or null if client hasn't completed onboarding yet.
// Null means the 7-step form has never been submitted.
```

---

## RLS Policies

| Actor | Permission |
|-------|-----------|
| Client | INSERT own row, SELECT own row, UPDATE own row |
| Coach | SELECT any client's row |

---

## Gotchas
- `getOnboarding()` returning `null` is normal for new clients — it means they haven't done it yet.
- The UNIQUE constraint on `client_id` means a client can never have more than one onboarding row. The upsert pattern handles re-submission cleanly.
- Re-submitting overwrites ALL fields — there is no partial update path.
- The "40 questions" description is wrong. There are ~21 columns/fields spread across 7 steps.

---

## Key Files
- `src/app/(client)/client/onboarding/page.tsx` — 7-step onboarding form
- `src/app/(client)/client/profile/page.tsx` — client can re-submit from here
- `src/app/(coach)/coach/clients/[id]/page.tsx` — coach onboarding tab (read-only view)
- `src/lib/db.ts` — `saveOnboarding()`, `getOnboarding()`
- `src/types/index.ts` — `ClientOnboarding` interface
