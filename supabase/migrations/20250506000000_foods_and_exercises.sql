-- ============================================================
-- FOODS TABLE — replaces static food-database.ts
-- ============================================================
create table if not exists foods (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  category text not null check (category in ('protein', 'carbs', 'fats', 'supplements')),
  emoji text default '🍽️',
  unit text,                    -- e.g. "egg", "scoop", "roti", "tbsp"
  grams_per_unit numeric,      -- how many grams per 1 unit
  calories numeric default 0,  -- per 100g
  protein numeric default 0,   -- per 100g
  carbs numeric default 0,     -- per 100g
  fat numeric default 0,       -- per 100g
  is_default boolean default false  -- true = seeded, false = coach-added
);

alter table foods enable row level security;

create policy "Authenticated users can read foods"
  on foods for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert foods"
  on foods for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update non-default foods"
  on foods for update using (auth.role() = 'authenticated' and is_default = false);

create policy "Authenticated users can delete non-default foods"
  on foods for delete using (auth.role() = 'authenticated' and is_default = false);

-- ============================================================
-- EXERCISES TABLE — replaces static exercise-database.ts + exercise-videos.ts
-- ============================================================
create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  category text not null check (category in ('chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio')),
  emoji text default '🏋️',
  equipment text,
  video_id text,               -- YouTube video ID for demo
  is_default boolean default false
);

alter table exercises enable row level security;

create policy "Authenticated users can read exercises"
  on exercises for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert exercises"
  on exercises for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update non-default exercises"
  on exercises for update using (auth.role() = 'authenticated' and is_default = false);

create policy "Authenticated users can delete non-default exercises"
  on exercises for delete using (auth.role() = 'authenticated' and is_default = false);

-- ============================================================
-- SEED: Default Foods
-- ============================================================
insert into foods (name, category, emoji, unit, grams_per_unit, calories, protein, carbs, fat, is_default) values
  -- Protein
  ('Chicken Breast', 'protein', '🍗', null, null, 165, 31, 0, 3.6, true),
  ('Eggs (whole)', 'protein', '🥚', 'egg', 50, 155, 13, 1.1, 11, true),
  ('Egg Whites', 'protein', '🥚', 'egg white', 33, 52, 11, 0.7, 0.2, true),
  ('Paneer', 'protein', '🧀', null, null, 265, 18, 1.2, 21, true),
  ('Whey Protein', 'protein', '🥤', 'scoop', 30, 400, 80, 10, 5, true),
  ('Greek Yogurt', 'protein', '🥛', 'cup', 200, 97, 9, 3.6, 5, true),
  ('Salmon', 'protein', '🐟', null, null, 208, 20, 0, 13, true),
  ('Tuna', 'protein', '🐟', 'can', 120, 130, 29, 0, 1, true),
  ('Mutton', 'protein', '🥩', null, null, 250, 25, 0, 16, true),
  ('Tofu', 'protein', '🫘', null, null, 76, 8, 1.9, 4.8, true),
  -- Carbs
  ('Brown Rice', 'carbs', '🍚', 'cup', 185, 112, 2.6, 23, 0.9, true),
  ('White Rice', 'carbs', '🍚', 'cup', 185, 130, 2.7, 28, 0.3, true),
  ('Oats', 'carbs', '🥣', null, null, 389, 17, 66, 7, true),
  ('Sweet Potato', 'carbs', '🍠', 'piece', 130, 86, 1.6, 20, 0.1, true),
  ('Whole Wheat Roti', 'carbs', '🫓', 'roti', 40, 297, 9, 50, 7, true),
  ('Banana', 'carbs', '🍌', 'banana', 120, 89, 1.1, 23, 0.3, true),
  ('Quinoa', 'carbs', '🌾', null, null, 120, 4.4, 21, 1.9, true),
  ('White Bread', 'carbs', '🍞', 'slice', 30, 265, 9, 49, 3.2, true),
  ('Pasta', 'carbs', '🍝', null, null, 131, 5, 25, 1.1, true),
  ('Potato', 'carbs', '🥔', 'piece', 150, 77, 2, 17, 0.1, true),
  -- Fats
  ('Almonds', 'fats', '🥜', 'piece', 1.2, 579, 21, 22, 50, true),
  ('Peanut Butter', 'fats', '🥜', 'tbsp', 16, 588, 25, 20, 50, true),
  ('Ghee', 'fats', '🧈', 'tsp', 5, 900, 0, 0, 100, true),
  ('Olive Oil', 'fats', '🫒', 'tbsp', 14, 884, 0, 0, 100, true),
  ('Coconut Oil', 'fats', '🥥', 'tbsp', 14, 862, 0, 0, 100, true),
  ('Walnuts', 'fats', '🌰', 'piece', 4, 654, 15, 14, 65, true),
  ('Avocado', 'fats', '🥑', 'half', 75, 160, 2, 9, 15, true),
  ('Cheese', 'fats', '🧀', 'slice', 20, 402, 25, 1.3, 33, true),
  ('Flax Seeds', 'fats', '🌱', 'tbsp', 10, 534, 18, 29, 42, true),
  ('Dark Chocolate', 'fats', '🍫', 'square', 10, 546, 5, 60, 31, true),
  -- Supplements
  ('Creatine Monohydrate', 'supplements', '💊', 'scoop', 5, 0, 0, 0, 0, true),
  ('Fish Oil', 'supplements', '💊', 'capsule', 1, 900, 0, 0, 100, true),
  ('CLA', 'supplements', '💊', 'capsule', 1, 900, 0, 0, 100, true),
  ('Multivitamin', 'supplements', '💊', 'tablet', 1, 0, 0, 0, 0, true),
  ('BCAA', 'supplements', '💊', 'scoop', 10, 0, 0, 0, 0, true),
  ('Glutamine', 'supplements', '💊', 'scoop', 5, 0, 0, 0, 0, true),
  ('Pre-Workout', 'supplements', '⚡', 'scoop', 10, 10, 0, 2, 0, true),
  ('Ashwagandha', 'supplements', '🌿', 'capsule', 0.6, 0, 0, 0, 0, true),
  ('Vitamin D3', 'supplements', '☀️', 'capsule', 0.01, 0, 0, 0, 0, true),
  ('Zinc', 'supplements', '💊', 'tablet', 0.05, 0, 0, 0, 0, true);

-- ============================================================
-- SEED: Default Exercises (with video IDs)
-- ============================================================
insert into exercises (name, category, emoji, equipment, video_id, is_default) values
  -- Chest
  ('Flat Bench Press', 'chest', '🏋️', 'Barbell', 'rT7DgCr-3pg', true),
  ('Incline Dumbbell Press', 'chest', '🏋️', 'Dumbbells', '8iPEnn-ltC8', true),
  ('Cable Flyes', 'chest', '🏋️', 'Cable', 'Iwe6AmxVf7o', true),
  ('Dips (Chest)', 'chest', '🏋️', 'Bodyweight', '2z8JmcrW-As', true),
  ('Pec Deck Machine', 'chest', '🏋️', 'Machine', 'Z57CtFmRMxA', true),
  -- Back
  ('Deadlift', 'back', '💪', 'Barbell', 'op9kVnSso6Q', true),
  ('Lat Pulldown', 'back', '💪', 'Cable', 'CAwf7n6Luuc', true),
  ('Barbell Row', 'back', '💪', 'Barbell', 'FWJR5Ve8bnQ', true),
  ('Seated Cable Row', 'back', '💪', 'Cable', 'GZbfZ033f74', true),
  ('Pull-ups', 'back', '💪', 'Bodyweight', 'eGo4IYlbE5g', true),
  -- Shoulders
  ('Overhead Press', 'shoulders', '🔥', 'Barbell', '2yjwXTZQDDI', true),
  ('Lateral Raises', 'shoulders', '🔥', 'Dumbbells', '3VcKaXpzqRo', true),
  ('Face Pulls', 'shoulders', '🔥', 'Cable', 'rep-qVOkqgk', true),
  ('Front Raises', 'shoulders', '🔥', 'Dumbbells', '-t7fuZ0KhDA', true),
  ('Rear Delt Flyes', 'shoulders', '🔥', 'Dumbbells', 'EA7u4Q_8HQ0', true),
  -- Arms
  ('Barbell Curl', 'arms', '💪', 'Barbell', 'kwG2ipFRgFo', true),
  ('Hammer Curls', 'arms', '💪', 'Dumbbells', 'zC3nLlEvin4', true),
  ('Tricep Pushdown', 'arms', '💪', 'Cable', '2-LAMcpzODU', true),
  ('Skull Crushers', 'arms', '💪', 'EZ Bar', 'd_KZxkY_0cM', true),
  ('Preacher Curl', 'arms', '💪', 'Machine', 'fIWP-FRFNU0', true),
  -- Legs
  ('Barbell Squat', 'legs', '🦵', 'Barbell', 'ultWZbUMPL8', true),
  ('Leg Press', 'legs', '🦵', 'Machine', 'IZxyjW7MPJQ', true),
  ('Romanian Deadlift', 'legs', '🦵', 'Barbell', '7j-2w4-P14I', true),
  ('Leg Extension', 'legs', '🦵', 'Machine', 'YyvSfVjQeL0', true),
  ('Leg Curl', 'legs', '🦵', 'Machine', '1Tq3QdYUuHs', true),
  ('Calf Raises', 'legs', '🦵', 'Machine', 'gwLzBJYoWlI', true),
  ('Bulgarian Split Squat', 'legs', '🦵', 'Dumbbells', '2C-uNgKwPLE', true),
  -- Core
  ('Hanging Leg Raise', 'core', '🎯', 'Bodyweight', 'hdng3Nm1x_E', true),
  ('Cable Crunch', 'core', '🎯', 'Cable', 'AV5PmrIVoLk', true),
  ('Plank', 'core', '🎯', 'Bodyweight', 'ASdvN_XEl_c', true),
  -- Cardio
  ('Treadmill Walk', 'cardio', '🏃', 'Treadmill', 'njeZ29umqVE', true),
  ('Stairmaster', 'cardio', '🏃', 'Machine', 'VCBbxjwSboQ', true),
  ('Cycling', 'cardio', '🏃', 'Bike', '0lPMwLBCMGo', true);
