# Security Standards

Security checks specific to this codebase. Run these mentally before any PR that touches auth, DB, user input, or payments.

---

## Supabase RLS — the most common failure mode

Every table must have RLS enabled and explicit policies. Missing policies = data leaks or empty responses.

### Policy pattern for coach-owned data
```sql
-- Coach can CRUD their own rows
CREATE POLICY "Coach can CRUD own things" ON things
  FOR ALL USING (coach_id = auth.uid());
```

### Policy pattern for client-readable data
```sql
-- Client can read data linked to their assignment
CREATE POLICY "Client can read assigned things" ON things
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workout_assignments wa
      WHERE wa.template_id = things.template_id  -- explicit table reference
        AND wa.client_id = auth.uid()
    )
  );
```

**Critical:** Always use `table_name.column` in policy subqueries. Ambiguous column references silently return no rows — this happened with `workout_template_phases`.

### Checklist for every new table
- [ ] `ALTER TABLE x ENABLE ROW LEVEL SECURITY`
- [ ] Coach CRUD policy
- [ ] Client SELECT policy (if clients read it)
- [ ] Index on `coach_id` and any FK used in policies

---

## Auth guards

### Coach routes
All routes under `src/app/(coach)/` are protected by `CoachGuard` in the layout. No additional auth check needed in individual pages.

### Client routes
All routes under `src/app/(client)/` are protected by `ClientGuard`. Same.

### Public routes
`/pricing`, `/enquiry`, `/book-call`, `/about-platform` — no auth. Don't put sensitive data here.

### Demo mode bypass
`?demo=true` bypasses auth guards and shows mock data. This is intentional for demos. Never show real client data in demo mode — always use hardcoded mock data.

---

## Environment variables and secrets

### Never hardcode
```typescript
// BAD — will end up in git history
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
const coachId = "fdc7c8d4-04c7-4e2e-a7bb-2a1b21a8433e"; // seed UUID

// GOOD
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const { user } = useAuth(); // get coach ID from auth context
```

### Env var rules
- `NEXT_PUBLIC_*` — safe to expose to browser (Supabase URL, anon key)
- No prefix — server-only, never expose to client
- `.env.local` — local dev, gitignored
- `.env.production` — production values, gitignored
- `.env.example` — template with placeholder values, committed

### Seed files
SQL seed files (`seed.sql`, `seed_workouts.sql`) contain a hardcoded coach UUID. This is acceptable for seed data but must be replaced with the actual coach UUID before running. Document this clearly at the top of every seed file.

---

## Input handling

### Supabase queries use parameterized values
The Supabase JS client always parameterizes values — no SQL injection risk from standard `.eq()`, `.insert()`, `.update()` calls.

```typescript
// Safe — Supabase parameterizes this
.eq("coach_id", coachId)
.insert({ name: userInput })
```

### User-provided strings to UUID columns
```typescript
// BAD — empty string or "other" to a UUID column causes DB error
await sb.from("things").insert({ category_id: selectedCategory }); // could be ""

// GOOD — convert empty/invalid to null
await sb.from("things").insert({ category_id: selectedCategory || null });
```

### File uploads
Storage uploads go to Supabase Storage buckets. Bucket policies control access. When adding a new upload feature:
1. Verify the bucket exists (check Supabase dashboard)
2. Set bucket to private (not public) unless images need to be publicly accessible
3. Use signed URLs for private buckets: `sb.storage.from("bucket").createSignedUrl(path, 3600)`

---

## Payment security

UPI payments are manual — coach verifies via WhatsApp screenshot. No automated payment processing, no card data, no PCI scope.

The only sensitive data in the payment flow:
- UPI ID (in `config.contact.upi`) — comes from client config, not user input
- WhatsApp number (in `config.contact.whatsapp`) — same

No payment data is stored in the DB. Leads table stores plan selection and price label (strings), not payment confirmation.

---

## Data privacy

### What's stored
- `profiles` — name, email, role
- `clients` — goal, status, weight targets
- `client_onboarding` — detailed health/lifestyle questionnaire (~40 fields)
- `check_ins` — weekly photos, weight, notes
- `measurements` — body measurements over time
- `food_check_ins` — daily food logs

### Access control
- Coach can read all data for their clients (via `coach_id` FK)
- Client can only read their own data (via `client_id = auth.uid()`)
- No cross-client data access possible via RLS

### Logs
Never log: passwords, tokens, full user objects, health data, payment info.

---

## Dependency security

Before adding any new package:
1. Check it's actively maintained (last commit < 6 months)
2. Check npm audit: `npm audit --audit-level=high`
3. Prefer packages already in use (e.g., don't add `axios` when `fetch` works)

Current dependencies are pinned to exact versions in `package-lock.json`. Don't use `^` or `~` ranges for security-sensitive packages.
