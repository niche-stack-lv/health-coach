# User Management — How to Create Coaches and Clients

## Architecture

Supabase has TWO user-related tables:
1. **`auth.users`** — Supabase Auth's internal table. Stores email, password hash, session tokens. You can't insert here directly from the app — you must use `auth.signUp()` or the SQL approach below.
2. **`profiles`** — Our app's table. Has a foreign key `profiles.id → auth.users.id`. Stores name, email, and **role** (`coach` or `client`).

Both must exist for a user to work. The `profiles.id` MUST match an `auth.users.id`.

## How to Create a Coach (first time setup)

There is NO coach signup flow in the app. The coach must be created manually.

### Option A: Sign up through the app, then promote

1. Go to `/signup` in the browser
2. Register with any email/password (this creates role=`client` by default)
3. In Supabase SQL editor, promote to coach:
```sql
UPDATE profiles SET role = 'coach' WHERE email = 'your-email@example.com';
```
4. Log out and log back in — you'll now see the coach dashboard

### Option B: Create via SQL (for fresh databases)

```sql
-- Step 1: Create the auth user (this is what signUp() does internally)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'coach@yourapp.com',
  crypt('YourPassword123!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}'
)
RETURNING id;

-- Step 2: Create the profile (use the UUID returned above)
INSERT INTO profiles (id, email, name, role)
VALUES ('<UUID-from-step-1>', 'coach@yourapp.com', 'Coach Name', 'coach');
```

### Option C: Use Supabase Dashboard

1. Go to Supabase Dashboard → Authentication → Users → "Add User"
2. Enter email + password, check "Auto Confirm"
3. Copy the user's UUID from the table
4. In SQL editor:
```sql
INSERT INTO profiles (id, email, name, role)
VALUES ('<UUID-from-dashboard>', 'coach@yourapp.com', 'Coach Name', 'coach');
```

## How to Create a Client

### Option A: Client self-registers (normal flow)

1. Client goes to `/signup`
2. Fills in name, email, password
3. App calls `auth.signUp()` → creates `auth.users` row
4. App inserts `profiles` row with `role: 'client'`
5. Client can now log in and see the client portal

### Option B: Coach creates client (from dashboard)

1. Coach goes to `/coach/clients` → "Add Client"
2. Enters client email, name, goal
3. App calls `auth.signUp()` with a generated temp password
4. Creates profile + client record
5. Coach shares the temp password with the client

## Common Issues

### "No rows returned" for coach query
The coach profile doesn't exist yet. Use one of the creation methods above.

### "Foreign key constraint profiles_id_fkey"
You tried to insert a profile without a matching `auth.users` row. The profile ID must reference an existing auth user.

### "Duplicate key users_email_partial_key"
The auth user already exists with that email. Find its ID:
```sql
SELECT id FROM auth.users WHERE email = 'your-email@example.com';
```
Then just create the profile using that ID.

### Coach sees client dashboard (or vice versa)
The `profiles.role` is wrong. Fix it:
```sql
UPDATE profiles SET role = 'coach' WHERE email = 'your-email@example.com';
```

## Quick Reference

| Action | Method |
|--------|--------|
| Create first coach | Sign up → promote via SQL |
| Create client (self) | `/signup` page |
| Create client (coach) | `/coach/clients` → Add Client |
| Check who exists | `SELECT * FROM profiles;` |
| Find auth user ID | `SELECT id FROM auth.users WHERE email = '...';` |
| Promote to coach | `UPDATE profiles SET role = 'coach' WHERE email = '...';` |

## For Seeding (dev/test)

After creating a coach via any method above, get their UUID:
```sql
SELECT id FROM profiles WHERE role = 'coach';
```

Use that UUID in `supabase/seed.sql` as the `v_coach` variable to seed dishes and templates under that coach.
