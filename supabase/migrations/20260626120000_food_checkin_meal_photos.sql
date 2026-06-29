-- ============================================================
-- Optional per-meal photos on daily food check-ins
-- ------------------------------------------------------------
-- Stores a JSON map of { slotId: storagePath } so a client can
-- attach an optional photo to each meal in their daily check-in.
-- Photos live in the existing `check-in-photos` storage bucket;
-- only the storage path is kept here (signed URLs on read).
-- ============================================================

alter table food_check_ins
  add column if not exists meal_photos jsonb not null default '{}'::jsonb;
