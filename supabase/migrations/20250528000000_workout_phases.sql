-- ============================================================
-- Workout Phases + Template Metadata
-- Adds optional phase grouping to workout templates.
-- All new columns are nullable — existing data is unaffected.
-- ============================================================

-- 1. Add metadata columns to workout_templates
ALTER TABLE workout_templates
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS level text,
  ADD COLUMN IF NOT EXISTS location text;

-- 2. New phases table (optional — templates work fine with zero phases)
CREATE TABLE IF NOT EXISTS workout_template_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  template_id uuid NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  week_start integer,
  week_end integer,
  description text
);

ALTER TABLE workout_template_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach can CRUD own workout phases" ON workout_template_phases
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workout_templates wt
      WHERE wt.id = template_id AND wt.coach_id = auth.uid()
    )
  );

-- Client read policy (needed to view their assigned workout)
CREATE POLICY "Client can read phases of assigned workout" ON workout_template_phases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workout_assignments wa
      WHERE wa.template_id = workout_template_phases.template_id AND wa.client_id = auth.uid()
    )
  );

-- 3. Add nullable phase_id FK to workout_template_slots
--    NULL = no phases used (works exactly like before)
ALTER TABLE workout_template_slots
  ADD COLUMN IF NOT EXISTS phase_id uuid REFERENCES workout_template_phases(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS warmup_notes text;

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_workout_template_phases_template_id ON workout_template_phases(template_id);
CREATE INDEX IF NOT EXISTS idx_workout_template_slots_phase_id ON workout_template_slots(phase_id);

NOTIFY pgrst, 'reload schema';
