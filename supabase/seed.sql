-- ============================================================
-- SEED DATA: Dishes & Diet Directory
-- Run after migration: supabase/migrations/20250507000000_dishes_and_diet_directory.sql
--
-- IMPORTANT: Replace the coach_id below with your actual coach profile UUID
-- You can find it by running: SELECT id FROM profiles WHERE role = 'coach';
-- ============================================================

DO $$
DECLARE
  v_coach uuid := 'fdc7c8d4-04c7-4e2e-a7bb-2a1b21a8433e'; -- REPLACE WITH YOUR COACH UUID

  -- Carbohydrate dish IDs
  d_rice200 uuid;
  d_roti2 uuid;
  d_caulirice uuid;
  d_lctortilla uuid;
  d_rice150 uuid;
  d_caesar uuid;
  d_applewalnut uuid;

  -- Protein dish IDs
  d_palakpaneer uuid;
  d_soycurry uuid;
  d_rajma uuid;
  d_chole uuid;
  d_palakdal uuid;
  d_turkey uuid;
  d_chicken uuid;
  d_eggs uuid;

  -- Fiber dish IDs
  d_cucumber uuid;
  d_carrot uuid;
  d_broccoli uuid;
  d_mixedveg uuid;
  d_avocado uuid;
  d_watermelon uuid;
  d_apple uuid;
  d_banana uuid;
  d_strawberry uuid;
  d_blueberry uuid;
  d_brussels uuid;

  -- Complete meal dish IDs
  d_oats uuid;
  d_smoothie uuid;
  d_shake uuid;
  d_poha uuid;
  d_idli uuid;
  d_dosa uuid;
  d_biryani uuid;

  -- Template IDs
  t_veg uuid;
  t_nonveg uuid;
  t_lowcarb uuid;
  t_if uuid;

  -- Working variables
  v_day uuid;
  v_slot uuid;
  v_comp uuid;
BEGIN

-- ============================================================
-- CARBOHYDRATE DISHES
-- ============================================================

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, '200g Cooked Rice', '🍚', 'carbohydrate', 260, 5, 56, 1) RETURNING id INTO d_rice200;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_rice200, NULL, 'White Rice (cooked)', '🍚', 130, 2.7, 28, 0.3, 200, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, '2 Roti', '🫓', 'carbohydrate', 238, 7, 40, 6) RETURNING id INTO d_roti2;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_roti2, NULL, 'Whole Wheat Roti', '🫓', 297, 9, 50, 7, 80, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, '300g Cauliflower Rice', '🥦', 'carbohydrate', 75, 6, 15, 1) RETURNING id INTO d_caulirice;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_caulirice, NULL, 'Cauliflower Rice', '🥦', 25, 2, 5, 0.3, 300, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, '2 Low Carb Tortillas', '🫓', 'carbohydrate', 140, 10, 30, 4) RETURNING id INTO d_lctortilla;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_lctortilla, NULL, 'Low Carb Tortilla', '🫓', 156, 11, 33, 4.4, 90, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, '150g Cooked Rice', '🍚', 'carbohydrate', 195, 4, 42, 0) RETURNING id INTO d_rice150;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_rice150, NULL, 'White Rice (cooked)', '🍚', 130, 2.7, 28, 0.3, 150, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, 'Half Caesar Salad', '🥗', 'carbohydrate', 200, 7, 15, 12) RETURNING id INTO d_caesar;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_caesar, NULL, 'Caesar Salad (packaged)', '🥗', 133, 4.7, 10, 8, 150, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, 'Half Apple Walnut Salad', '🥗', 'carbohydrate', 220, 5, 20, 14) RETURNING id INTO d_applewalnut;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_applewalnut, NULL, 'Apple Walnut Salad (packaged)', '🥗', 147, 3.3, 13.3, 9.3, 150, 0);

-- ============================================================
-- PROTEIN DISHES
-- ============================================================

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, 'Palak Paneer 60g', '🧀', 'protein', 189, 13, 4, 14) RETURNING id INTO d_palakpaneer;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_palakpaneer, NULL, 'Paneer', '🧀', 265, 18, 1.2, 21, 60, 0),
       (d_palakpaneer, NULL, 'Spinach Gravy', '🥬', 30, 2, 3, 1, 100, 1);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, 'Soy Curry 60g', '🫘', 'protein', 90, 9, 6, 3) RETURNING id INTO d_soycurry;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_soycurry, NULL, 'Soy Curry', '🫘', 150, 15, 10, 5, 60, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, 'Rajma Curry 60g', '🫘', 'protein', 72, 5, 11, 1) RETURNING id INTO d_rajma;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_rajma, NULL, 'Rajma Curry', '🫘', 120, 8, 18, 2, 60, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, 'Chole Masala 60g', '🫘', 'protein', 96, 5, 12, 3) RETURNING id INTO d_chole;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_chole, NULL, 'Chole Masala', '🫘', 160, 9, 20, 5, 60, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, 'Palak Dal 50g', '🥬', 'protein', 55, 4, 8, 1) RETURNING id INTO d_palakdal;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_palakdal, NULL, 'Palak Dal', '🥬', 110, 7, 15, 2, 50, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, '150g Ground Turkey Fry', '🍖', 'protein', 255, 41, 0, 11) RETURNING id INTO d_turkey;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_turkey, NULL, 'Ground Turkey (lean)', '🍖', 170, 27, 0, 7, 150, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, '150g Chicken Breast', '🍗', 'protein', 248, 47, 0, 5) RETURNING id INTO d_chicken;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_chicken, NULL, 'Chicken Breast', '🍗', 165, 31, 0, 3.6, 150, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, '2 Eggs + 2 Egg Whites', '🥚', 'protein', 189, 21, 2, 11) RETURNING id INTO d_eggs;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_eggs, NULL, 'Whole Eggs', '🥚', 155, 13, 1.1, 11, 100, 0),
       (d_eggs, NULL, 'Egg Whites', '🥚', 52, 11, 0.7, 0.2, 66, 1);

-- ============================================================
-- FIBER DISHES
-- ============================================================

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, '300g Cucumber', '🥒', 'fiber', 45, 2, 11, 0) RETURNING id INTO d_cucumber;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_cucumber, NULL, 'Cucumber', '🥒', 15, 0.7, 3.6, 0.1, 300, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, '200g Carrot', '🥕', 'fiber', 82, 2, 20, 0) RETURNING id INTO d_carrot;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_carrot, NULL, 'Carrot', '🥕', 41, 0.9, 10, 0.2, 200, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, '200g Steamed Broccoli', '🥦', 'fiber', 70, 6, 14, 1) RETURNING id INTO d_broccoli;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_broccoli, NULL, 'Steamed Broccoli', '🥦', 35, 2.8, 7, 0.4, 200, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, '200g Mixed Veggies', '🥬', 'fiber', 100, 4, 20, 1) RETURNING id INTO d_mixedveg;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_mixedveg, NULL, 'Steamed Mixed Veggies', '🥬', 50, 2, 10, 0.5, 200, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, 'Half Avocado', '🥑', 'fiber', 120, 2, 7, 11) RETURNING id INTO d_avocado;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_avocado, NULL, 'Avocado', '🥑', 160, 2, 9, 15, 75, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, 'Watermelon 300g', '🍉', 'fiber', 90, 2, 23, 1) RETURNING id INTO d_watermelon;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_watermelon, NULL, 'Watermelon', '🍉', 30, 0.6, 7.6, 0.2, 300, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, '1 Apple', '🍎', 'fiber', 94, 1, 25, 0) RETURNING id INTO d_apple;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_apple, NULL, 'Apple', '🍎', 52, 0.3, 14, 0.2, 180, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, '1 Banana', '🍌', 'fiber', 107, 1, 28, 0) RETURNING id INTO d_banana;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_banana, NULL, 'Banana', '🍌', 89, 1.1, 23, 0.3, 120, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, '250g Strawberries', '🍓', 'fiber', 80, 2, 19, 1) RETURNING id INTO d_strawberry;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_strawberry, NULL, 'Strawberries', '🍓', 32, 0.7, 7.7, 0.3, 250, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, '200g Blueberries', '🫐', 'fiber', 114, 1, 28, 1) RETURNING id INTO d_blueberry;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_blueberry, NULL, 'Blueberries', '🫐', 57, 0.7, 14, 0.3, 200, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, '200g Brussels Sprouts', '🥬', 'fiber', 86, 7, 18, 1) RETURNING id INTO d_brussels;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_brussels, NULL, 'Brussels Sprouts', '🥬', 43, 3.4, 9, 0.3, 200, 0);

-- ============================================================
-- COMPLETE MEAL DISHES
-- ============================================================

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, 'Overnight Oats', '🥣', 'complete_meal', 380, 35, 40, 12) RETURNING id INTO d_oats;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_oats, NULL, 'Rolled Oats', '🥣', 389, 17, 66, 7, 28, 0),
       (d_oats, NULL, 'Greek Yogurt', '🥛', 97, 9, 3.6, 5, 30, 1),
       (d_oats, NULL, 'Whey Protein', '🥤', 400, 80, 10, 5, 30, 2),
       (d_oats, NULL, 'Coconut Milk', '🥥', 230, 2, 6, 24, 20, 3),
       (d_oats, NULL, 'Almond Milk', '🥛', 15, 0.5, 0.5, 1.2, 200, 4);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, 'Smoothie', '🥤', 'complete_meal', 250, 28, 25, 5) RETURNING id INTO d_smoothie;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_smoothie, NULL, 'Frozen Banana (1/3)', '🍌', 89, 1.1, 23, 0.3, 40, 0),
       (d_smoothie, NULL, 'Mixed Berries (frozen)', '🫐', 50, 1, 12, 0.3, 100, 1),
       (d_smoothie, NULL, 'Almond Milk', '🥛', 15, 0.5, 0.5, 1.2, 250, 2),
       (d_smoothie, NULL, 'Whey Protein', '🥤', 400, 80, 10, 5, 30, 3);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, 'Protein Shake', '🥤', 'complete_meal', 160, 30, 5, 3) RETURNING id INTO d_shake;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_shake, NULL, 'Protein Shake (ready)', '🥤', 46, 8.6, 1.4, 0.9, 350, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, '60g Poha + Yogurt', '🍚', 'complete_meal', 290, 16, 50, 2) RETURNING id INTO d_poha;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_poha, NULL, 'Poha (flattened rice)', '🍚', 350, 6, 75, 2, 60, 0),
       (d_poha, NULL, 'Dannon Greek Yogurt', '🥛', 53, 8, 4.7, 0, 150, 1);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, '3-4 Idli + Sambar + Yogurt', '🍚', 'complete_meal', 395, 22, 43, 3) RETURNING id INTO d_idli;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_idli, NULL, 'Idli', '🍚', 80, 4, 16, 0.4, 200, 0),
       (d_idli, NULL, 'Sambar', '🍲', 50, 3, 7, 1, 150, 1),
       (d_idli, NULL, 'Dannon Greek Yogurt', '🥛', 53, 8, 4.7, 0, 150, 2);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, '2 Dosas + Aloo Curry + Yogurt', '🫓', 'complete_meal', 400, 18, 55, 12) RETURNING id INTO d_dosa;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_dosa, NULL, 'Dosa', '🫓', 200, 5, 30, 6.7, 120, 0),
       (d_dosa, NULL, 'Aloo Curry', '🥔', 100, 2, 15, 4, 100, 1),
       (d_dosa, NULL, 'Dannon Greek Yogurt', '🥛', 53, 8, 4.7, 0, 150, 2);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, 'Biryani', '🍛', 'complete_meal', 1200, 48, 150, 48) RETURNING id INTO d_biryani;

INSERT INTO dish_items (dish_id, food_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_biryani, NULL, 'Biryani', '🍛', 200, 8, 25, 8, 600, 0);


-- ============================================================
-- VEG PLAN TEMPLATE (full 7 days)
-- ============================================================

INSERT INTO diet_templates (coach_id, name, plan_type)
VALUES (v_coach, 'Veg Plan', 'veg') RETURNING id INTO t_veg;

-- Day 1 = Sunday
INSERT INTO template_days (template_id, day_number) VALUES (t_veg, 1) RETURNING id INTO v_day;

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Breakfast', 400, false, 0) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'complete_meal', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_oats, 0);

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Lunch', 500, false, 1) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'carbohydrate', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_rice200, 0), (v_comp, d_roti2, 1);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'protein', 1) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_palakpaneer, 0);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'fiber', 2) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_cucumber, 0);

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Snack', 200, false, 2) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'carbohydrate', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_lctortilla, 0);

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Dinner', 400, false, 3) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'carbohydrate', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_lctortilla, 0);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'protein', 1) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_palakpaneer, 0);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'fiber', 2) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_watermelon, 0);

-- Day 2 = Monday
INSERT INTO template_days (template_id, day_number) VALUES (t_veg, 2) RETURNING id INTO v_day;

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Breakfast', 400, false, 0) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'complete_meal', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_smoothie, 0);

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Lunch', 500, false, 1) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'carbohydrate', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_rice200, 0), (v_comp, d_roti2, 1);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'protein', 1) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_soycurry, 0);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'fiber', 2) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_carrot, 0);

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Dinner', 400, false, 2) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'carbohydrate', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_caulirice, 0);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'protein', 1) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_soycurry, 0);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'fiber', 2) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_watermelon, 0);

-- Day 3 = Tuesday
INSERT INTO template_days (template_id, day_number) VALUES (t_veg, 3) RETURNING id INTO v_day;

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Breakfast', 400, false, 0) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'complete_meal', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_shake, 0);

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Lunch', 500, false, 1) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'carbohydrate', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_rice200, 0), (v_comp, d_roti2, 1);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'protein', 1) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_rajma, 0);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'fiber', 2) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_broccoli, 0);

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Dinner', 400, false, 2) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'carbohydrate', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_roti2, 0);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'protein', 1) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_rajma, 0);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'fiber', 2) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_blueberry, 0);

-- Day 4 = Wednesday
INSERT INTO template_days (template_id, day_number) VALUES (t_veg, 4) RETURNING id INTO v_day;

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Breakfast', 400, false, 0) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'complete_meal', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_poha, 0);

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Lunch', 500, false, 1) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'carbohydrate', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_rice200, 0), (v_comp, d_roti2, 1);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'protein', 1) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_palakdal, 0);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'fiber', 2) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_mixedveg, 0);

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Dinner', 400, false, 2) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'carbohydrate', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_rice150, 0);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'protein', 1) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_palakdal, 0);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'fiber', 2) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_apple, 0);

-- Day 5 = Thursday
INSERT INTO template_days (template_id, day_number) VALUES (t_veg, 5) RETURNING id INTO v_day;

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Breakfast', 400, false, 0) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'complete_meal', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_idli, 0);

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Lunch', 500, false, 1) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'carbohydrate', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_rice200, 0), (v_comp, d_roti2, 1);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'protein', 1) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_rajma, 0);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'fiber', 2) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_avocado, 0);

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Dinner', 400, false, 2) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'carbohydrate', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_caesar, 0);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'protein', 1) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_rajma, 0);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'fiber', 2) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_banana, 0);

-- Day 6 = Friday
INSERT INTO template_days (template_id, day_number) VALUES (t_veg, 6) RETURNING id INTO v_day;

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Breakfast', 400, false, 0) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'complete_meal', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_dosa, 0);

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Lunch', 500, false, 1) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'carbohydrate', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_rice200, 0), (v_comp, d_roti2, 1);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'protein', 1) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_chole, 0);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'fiber', 2) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_brussels, 0);

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Dinner', 400, false, 2) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'carbohydrate', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_applewalnut, 0);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'protein', 1) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_chole, 0);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'fiber', 2) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_strawberry, 0);

-- Day 7 = Saturday (cheat day — biryani + smoothie)
INSERT INTO template_days (template_id, day_number) VALUES (t_veg, 7) RETURNING id INTO v_day;

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Breakfast', NULL, true, 0) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'complete_meal', 0) RETURNING id INTO v_comp;

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Lunch', 1200, false, 1) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'complete_meal', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_biryani, 0);

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Dinner', 250, false, 2) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'complete_meal', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_smoothie, 0);

-- ============================================================
-- NONVEG PLAN TEMPLATE (abbreviated — 3 days shown)
-- ============================================================

INSERT INTO diet_templates (coach_id, name, plan_type)
VALUES (v_coach, 'Nonveg Plan', 'nonveg') RETURNING id INTO t_nonveg;

-- Day 1 = Sunday
INSERT INTO template_days (template_id, day_number) VALUES (t_nonveg, 1) RETURNING id INTO v_day;

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Breakfast', 400, false, 0) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'complete_meal', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_oats, 0);

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Lunch', 500, false, 1) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'carbohydrate', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_rice200, 0), (v_comp, d_roti2, 1);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'protein', 1) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_turkey, 0);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'fiber', 2) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_cucumber, 0);

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Snack', 200, false, 2) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'complete_meal', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_shake, 0);

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Dinner', 400, false, 3) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'carbohydrate', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_lctortilla, 0);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'protein', 1) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_turkey, 0);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'fiber', 2) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_watermelon, 0);

-- Day 2 = Monday (Nonveg)
INSERT INTO template_days (template_id, day_number) VALUES (t_nonveg, 2) RETURNING id INTO v_day;

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Breakfast', 400, false, 0) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'complete_meal', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_oats, 0);

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Lunch', 500, false, 1) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'carbohydrate', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_rice200, 0), (v_comp, d_roti2, 1);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'protein', 1) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_eggs, 0);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'fiber', 2) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_carrot, 0);

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Dinner', 400, false, 2) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'carbohydrate', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_caulirice, 0);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'protein', 1) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_eggs, 0);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'fiber', 2) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_watermelon, 0);

-- Day 3 = Tuesday (Nonveg)
INSERT INTO template_days (template_id, day_number) VALUES (t_nonveg, 3) RETURNING id INTO v_day;

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Breakfast', 400, false, 0) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'complete_meal', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_smoothie, 0);

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Lunch', 500, false, 1) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'carbohydrate', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_rice200, 0), (v_comp, d_roti2, 1);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'protein', 1) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_chicken, 0);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'fiber', 2) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_broccoli, 0);

INSERT INTO template_meal_slots (day_id, name, target_calories, is_skipped, sort_order) VALUES (v_day, 'Dinner', 400, false, 2) RETURNING id INTO v_slot;
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'carbohydrate', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_roti2, 0);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'protein', 1) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_chicken, 0);
INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'fiber', 2) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_blueberry, 0);

-- Remaining days 4-7 for nonveg follow same pattern (add manually or extend this script)

RAISE NOTICE 'Seed complete! Created % dishes and templates.', 'all';
RAISE NOTICE 'Veg template ID: %', t_veg;
RAISE NOTICE 'Nonveg template ID: %', t_nonveg;

END $$;
