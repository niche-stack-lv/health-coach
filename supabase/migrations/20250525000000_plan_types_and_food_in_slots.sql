-- 1. Create plan_types table for custom plan types
CREATE TABLE IF NOT EXISTS plan_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  coach_id uuid NOT NULL REFERENCES profiles(id),
  name text NOT NULL,
  is_default boolean DEFAULT false
);

ALTER TABLE plan_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach can read own plan types" ON plan_types FOR SELECT USING (coach_id = auth.uid() OR is_default = true);
CREATE POLICY "Coach can insert own plan types" ON plan_types FOR INSERT WITH CHECK (coach_id = auth.uid());
CREATE POLICY "Coach can update own plan types" ON plan_types FOR UPDATE USING (coach_id = auth.uid());
CREATE POLICY "Coach can delete own plan types" ON plan_types FOR DELETE USING (coach_id = auth.uid() AND is_default = false);

-- Seed default plan types
INSERT INTO plan_types (coach_id, name, is_default) VALUES
  ('03268025-18be-4d8a-a744-901c6196bbdd', 'Veg', true),
  ('03268025-18be-4d8a-a744-901c6196bbdd', 'Nonveg', true),
  ('03268025-18be-4d8a-a744-901c6196bbdd', 'Low Carb Nonveg', true),
  ('03268025-18be-4d8a-a744-901c6196bbdd', 'Intermittent Fasting', true)
ON CONFLICT DO NOTHING;

-- 2. Add food_id and food_quantity to meal_slot_dishes
ALTER TABLE meal_slot_dishes ADD COLUMN IF NOT EXISTS food_id uuid REFERENCES foods(id) ON DELETE CASCADE;
ALTER TABLE meal_slot_dishes ADD COLUMN IF NOT EXISTS food_quantity numeric;

-- Make dish_id nullable (it was NOT NULL before)
ALTER TABLE meal_slot_dishes ALTER COLUMN dish_id DROP NOT NULL;

-- Add check constraint: exactly one of dish_id or food_id must be set
ALTER TABLE meal_slot_dishes ADD CONSTRAINT dish_or_food CHECK (
  (dish_id IS NOT NULL AND food_id IS NULL) OR
  (dish_id IS NULL AND food_id IS NOT NULL)
);
