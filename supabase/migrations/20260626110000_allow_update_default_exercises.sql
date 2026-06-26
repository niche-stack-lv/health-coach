-- ============================================================
-- Allow editing default exercises (e.g. to attach a demo video)
-- ------------------------------------------------------------
-- The original policy only allowed updating non-default exercises,
-- which blocked coaches from adding a YouTube video to any of the
-- seeded library exercises. Relax UPDATE to any authenticated user.
-- DELETE of default exercises stays blocked to protect the seed.
-- ============================================================

drop policy if exists "Authenticated users can update non-default exercises" on exercises;

create policy "Authenticated users can update exercises"
  on exercises for update using (auth.role() = 'authenticated');
