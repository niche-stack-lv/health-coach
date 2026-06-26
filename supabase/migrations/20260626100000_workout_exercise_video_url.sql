-- ============================================================
-- Per-exercise video link for workout slots
-- ------------------------------------------------------------
-- Lets a coach attach a demo video URL (e.g. YouTube) to any
-- exercise in a workout — including fully custom exercises that
-- have no row in the shared `exercises` library. Clients see a
-- "Watch Demo" link for exercises that have one.
-- ============================================================

alter table workout_slot_exercises
  add column if not exists video_url text;
