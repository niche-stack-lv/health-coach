-- Unify component categories across dishes and foods
-- New unified set: protein, carbs, fats, fiber, complete_meal, supplements

-- Drop old CHECK constraint on dishes.component_category
ALTER TABLE dishes DROP CONSTRAINT IF EXISTS dishes_component_category_check;

-- Add new CHECK with unified categories
ALTER TABLE dishes ADD CONSTRAINT dishes_component_category_check 
  CHECK (component_category IN ('protein', 'carbs', 'fats', 'fiber', 'complete_meal', 'supplements'));

-- Rename existing 'carbohydrate' to 'carbs' in dishes
UPDATE dishes SET component_category = 'carbs' WHERE component_category = 'carbohydrate';

-- Also update meal_slot_components to use new category names
UPDATE meal_slot_components SET component_category = 'carbs' WHERE component_category = 'carbohydrate';
