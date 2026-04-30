# Database Migrations

This project uses the [Supabase CLI](https://supabase.com/docs/guides/cli) for database migrations.

## Setup (one time)

```bash
# Install the CLI (macOS)
brew install supabase/tap/supabase

# Link to your remote project
supabase link --project-ref wqfvxwdbkbotzhewnits
```

## How migrations work

All migration files live in `supabase/migrations/` with timestamped filenames:

```
supabase/migrations/
  20250428000000_initial_schema.sql   ← baseline (all tables)
  20250429120000_add_unit_to_habits.sql  ← example future migration
```

## Common commands

### Create a new migration
```bash
supabase migration new add_unit_to_habits
```
This creates an empty file like `supabase/migrations/20250429120000_add_unit_to_habits.sql`. Write your SQL in it.

### Push migrations to remote database
```bash
supabase db push
```
This applies any unapplied migrations to your remote Supabase project.

### Check migration status
```bash
supabase migration list
```
Shows which migrations have been applied and which are pending.

### Pull remote schema changes
If you made changes directly in the Supabase dashboard:
```bash
supabase db pull
```
This generates a migration file from the diff.

### Reset local database (if using local dev)
```bash
supabase db reset
```
Drops everything and re-runs all migrations from scratch.

## Rules

1. **Never edit an already-applied migration.** Create a new one instead.
2. **Use `create table if not exists`** and `create policy ... on ... for ...` to make migrations idempotent where possible.
3. **Always include RLS policies** when creating new tables.
4. **Test migrations locally** before pushing to production: `supabase db reset` runs them all from scratch.

## Fresh setup (new Supabase project)

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

This applies all migrations in order and sets up the complete database.
