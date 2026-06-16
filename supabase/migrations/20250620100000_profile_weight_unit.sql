-- Add weight unit preference to profiles. Default 'lbs' since the active
-- coach base is in Seattle. The DB stores weight values in kg always; the
-- unit only controls how it's entered and displayed in the UI.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS weight_unit text DEFAULT 'lbs'
  CHECK (weight_unit IN ('kg','lbs'));
