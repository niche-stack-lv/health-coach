-- Workout templates (same pattern as diet_templates with is_template flag)
CREATE TABLE workout_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  coach_id uuid NOT NULL REFERENCES profiles(id),
  name text NOT NULL,
  is_template boolean NOT NULL DEFAULT true
);

ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coach can CRUD own workout templates" ON workout_templates FOR ALL USING (coach_id = auth.uid());

-- Workout slots (like meal slots — "Workout 1", "Workout 2", "Workout 3")
CREATE TABLE workout_template_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer DEFAULT 0
);

ALTER TABLE workout_template_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coach can CRUD own workout slots" ON workout_template_slots FOR ALL USING (
  EXISTS (SELECT 1 FROM workout_templates wt WHERE wt.id = template_id AND wt.coach_id = auth.uid())
);

-- Exercises within a workout slot (like dishes within a meal component)
CREATE TABLE workout_slot_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id uuid NOT NULL REFERENCES workout_template_slots(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES exercises(id),
  custom_name text,
  custom_emoji text,
  sets integer DEFAULT 3,
  reps text DEFAULT '10',  -- text to support "10-12" or "AMRAP"
  rest_seconds integer DEFAULT 60,
  notes text,
  sort_order integer DEFAULT 0
);

ALTER TABLE workout_slot_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coach can CRUD own workout slot exercises" ON workout_slot_exercises FOR ALL USING (
  EXISTS (
    SELECT 1 FROM workout_template_slots wts
    JOIN workout_templates wt ON wt.id = wts.template_id
    WHERE wts.id = slot_id AND wt.coach_id = auth.uid()
  )
);

-- Workout assignments (same pattern as template_assignments — latest is active)
CREATE TABLE workout_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  template_id uuid NOT NULL REFERENCES workout_templates(id),
  client_id uuid NOT NULL REFERENCES profiles(id),
  coach_id uuid NOT NULL REFERENCES profiles(id)
);

ALTER TABLE workout_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coach can CRUD own workout assignments" ON workout_assignments FOR ALL USING (coach_id = auth.uid());
CREATE POLICY "Client can read own workout assignments" ON workout_assignments FOR SELECT USING (client_id = auth.uid());

-- Indexes
CREATE INDEX idx_workout_templates_coach_id ON workout_templates(coach_id);
CREATE INDEX idx_workout_template_slots_template_id ON workout_template_slots(template_id);
CREATE INDEX idx_workout_slot_exercises_slot_id ON workout_slot_exercises(slot_id);
CREATE INDEX idx_workout_assignments_client_id ON workout_assignments(client_id);
CREATE INDEX idx_workout_assignments_coach_id ON workout_assignments(coach_id);

NOTIFY pgrst, 'reload schema';
