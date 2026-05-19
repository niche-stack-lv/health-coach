-- ============================================================
-- DISH ENHANCEMENTS: Tags, Description, Image, Meal Size
-- ============================================================

-- Add new fields to dishes table
ALTER TABLE dishes
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS meal_size text CHECK (meal_size IN ('small', 'medium', 'large'));

-- Custom tags table (coach creates these, they grow over time like an inventory)
CREATE TABLE IF NOT EXISTS dish_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES profiles(id),
  name text NOT NULL,
  color text DEFAULT '#6b7280',
  created_at timestamptz DEFAULT now(),
  UNIQUE(coach_id, name)
);

ALTER TABLE dish_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coach can CRUD own tags" ON dish_tags FOR ALL USING (coach_id = auth.uid());

-- Many-to-many link between dishes and tags
CREATE TABLE IF NOT EXISTS dish_tag_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id uuid NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES dish_tags(id) ON DELETE CASCADE,
  UNIQUE(dish_id, tag_id)
);

ALTER TABLE dish_tag_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coach can CRUD own dish tag links" ON dish_tag_links FOR ALL USING (
  EXISTS (SELECT 1 FROM dishes d WHERE d.id = dish_id AND d.coach_id = auth.uid())
);

-- Add meal_size to meal_slot_dishes (size selection when adding dish to a template)
ALTER TABLE meal_slot_dishes
  ADD COLUMN IF NOT EXISTS meal_size text CHECK (meal_size IN ('small', 'medium', 'large'));
