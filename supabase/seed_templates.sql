-- ============================================================
-- SEED DATA: Rich Diet & Workout Templates for Visual Testing
-- Run AFTER the main seed.sql (uses existing dishes)
--
-- Schema: template_meal_slots references template_id directly (no template_days)
-- IMPORTANT: Replace the coach_id below with your actual coach profile UUID
-- ============================================================

DO $$
DECLARE
  v_coach uuid := '03268025-18be-4d8a-a744-901c6196bbdd'; -- Coach UUID from profiles table

  -- New dish IDs
  d_greek_yogurt uuid;
  d_peanut_butter_toast uuid;
  d_quinoa uuid;
  d_sweet_potato uuid;
  d_salmon uuid;
  d_tofu_stir_fry uuid;
  d_lentil_soup uuid;
  d_grilled_paneer uuid;
  d_egg_bhurji uuid;
  d_tuna_salad uuid;
  d_spinach_wrap uuid;
  d_mango_lassi uuid;
  d_protein_pancakes uuid;
  d_chickpea_bowl uuid;
  d_dal_makhani uuid;
  d_greek_salad uuid;
  d_roasted_veggies uuid;
  d_fruit_bowl uuid;

  -- Template IDs
  t_muscle uuid;
  t_lean uuid;
  t_balanced uuid;

  -- Workout template IDs
  w_ppl uuid;
  w_upper_lower uuid;
  w_full_body uuid;

  -- Working variables
  v_slot uuid;
  v_comp uuid;
  v_wslot uuid;
BEGIN

-- ============================================================
-- ADDITIONAL DISHES (for variety)
-- ============================================================

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, 'Greek Yogurt Bowl', '🥛', 'complete_meal', 280, 30, 25, 8) RETURNING id INTO d_greek_yogurt;
INSERT INTO dish_items (dish_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_greek_yogurt, 'Greek Yogurt', '🥛', 97, 9, 3.6, 5, 200, 0),
       (d_greek_yogurt, 'Honey', '🍯', 304, 0.3, 82, 0, 15, 1),
       (d_greek_yogurt, 'Granola', '🥣', 471, 10, 64, 20, 30, 2);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, 'Peanut Butter Toast', '🍞', 'carbohydrate', 310, 12, 30, 16) RETURNING id INTO d_peanut_butter_toast;
INSERT INTO dish_items (dish_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_peanut_butter_toast, 'Whole Wheat Bread', '🍞', 247, 13, 41, 3.4, 60, 0),
       (d_peanut_butter_toast, 'Peanut Butter', '🥜', 588, 25, 20, 50, 32, 1);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, '200g Quinoa', '🌾', 'carbohydrate', 240, 9, 39, 4) RETURNING id INTO d_quinoa;
INSERT INTO dish_items (dish_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_quinoa, 'Cooked Quinoa', '🌾', 120, 4.4, 21, 1.9, 200, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, 'Baked Sweet Potato 250g', '🍠', 'carbohydrate', 215, 4, 50, 0) RETURNING id INTO d_sweet_potato;
INSERT INTO dish_items (dish_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_sweet_potato, 'Sweet Potato (baked)', '🍠', 86, 1.6, 20, 0.1, 250, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, '150g Grilled Salmon', '🐟', 'protein', 310, 40, 0, 16) RETURNING id INTO d_salmon;
INSERT INTO dish_items (dish_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_salmon, 'Atlantic Salmon (grilled)', '🐟', 208, 27, 0, 11, 150, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, 'Tofu Stir Fry 200g', '🥡', 'protein', 180, 18, 8, 10) RETURNING id INTO d_tofu_stir_fry;
INSERT INTO dish_items (dish_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_tofu_stir_fry, 'Firm Tofu (stir fried)', '🥡', 144, 15, 3, 9, 150, 0),
       (d_tofu_stir_fry, 'Stir Fry Veggies', '🥬', 30, 2, 5, 0.5, 50, 1);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, 'Lentil Soup 250ml', '🍲', 'protein', 165, 12, 22, 3) RETURNING id INTO d_lentil_soup;
INSERT INTO dish_items (dish_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_lentil_soup, 'Red Lentil Soup', '🍲', 66, 4.8, 8.8, 1.2, 250, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, 'Grilled Paneer Tikka 100g', '🧀', 'protein', 260, 20, 4, 18) RETURNING id INTO d_grilled_paneer;
INSERT INTO dish_items (dish_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_grilled_paneer, 'Paneer Tikka (grilled)', '🧀', 260, 20, 4, 18, 100, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, 'Egg Bhurji (3 eggs)', '🍳', 'protein', 270, 21, 3, 19) RETURNING id INTO d_egg_bhurji;
INSERT INTO dish_items (dish_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_egg_bhurji, 'Scrambled Eggs with Spices', '🍳', 155, 13, 1.1, 11, 150, 0),
       (d_egg_bhurji, 'Onion + Tomato', '🧅', 25, 1, 5, 0, 50, 1);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, 'Tuna Salad 150g', '🐟', 'protein', 200, 30, 5, 7) RETURNING id INTO d_tuna_salad;
INSERT INTO dish_items (dish_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_tuna_salad, 'Canned Tuna in Water', '🐟', 116, 26, 0, 1, 120, 0),
       (d_tuna_salad, 'Light Mayo + Veggies', '🥗', 80, 0.5, 3, 7, 30, 1);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, 'Protein Pancakes (3)', '🥞', 'complete_meal', 350, 35, 30, 10) RETURNING id INTO d_protein_pancakes;
INSERT INTO dish_items (dish_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_protein_pancakes, 'Oat Flour', '🥣', 389, 17, 66, 7, 40, 0),
       (d_protein_pancakes, 'Whey Protein', '🥤', 400, 80, 10, 5, 30, 1),
       (d_protein_pancakes, 'Egg Whites', '🥚', 52, 11, 0.7, 0.2, 100, 2),
       (d_protein_pancakes, 'Banana (mashed)', '🍌', 89, 1.1, 23, 0.3, 60, 3);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, 'Chickpea Buddha Bowl', '🥗', 'complete_meal', 420, 18, 55, 14) RETURNING id INTO d_chickpea_bowl;
INSERT INTO dish_items (dish_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_chickpea_bowl, 'Roasted Chickpeas', '🫘', 164, 9, 27, 2.6, 100, 0),
       (d_chickpea_bowl, 'Brown Rice', '🍚', 112, 2.6, 24, 0.9, 100, 1),
       (d_chickpea_bowl, 'Tahini Dressing', '🥄', 89, 2.6, 3.2, 8, 15, 2),
       (d_chickpea_bowl, 'Mixed Greens', '🥬', 20, 2, 3, 0.3, 80, 3);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, 'Dal Makhani 150g', '🍛', 'protein', 220, 12, 20, 10) RETURNING id INTO d_dal_makhani;
INSERT INTO dish_items (dish_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_dal_makhani, 'Dal Makhani', '🍛', 147, 8, 13, 7, 150, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, 'Greek Salad', '🥗', 'fiber', 120, 4, 10, 8) RETURNING id INTO d_greek_salad;
INSERT INTO dish_items (dish_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_greek_salad, 'Cucumber + Tomato + Feta + Olives', '🥗', 60, 2, 5, 4, 200, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, 'Roasted Veggies 250g', '🥕', 'fiber', 130, 4, 22, 4) RETURNING id INTO d_roasted_veggies;
INSERT INTO dish_items (dish_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_roasted_veggies, 'Roasted Mixed Vegetables', '🥕', 52, 1.6, 8.8, 1.6, 250, 0);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat)
VALUES (v_coach, 'Fresh Fruit Bowl', '🍇', 'fiber', 150, 2, 38, 1) RETURNING id INTO d_fruit_bowl;
INSERT INTO dish_items (dish_id, custom_name, custom_emoji, custom_calories, custom_protein, custom_carbs, custom_fat, grams, sort_order)
VALUES (d_fruit_bowl, 'Mixed Fruits (seasonal)', '🍇', 50, 0.7, 13, 0.3, 300, 0);


-- ============================================================
-- DIET TEMPLATE 1: Muscle Gain (Nonveg, 4 meals)
-- ============================================================

INSERT INTO diet_templates (coach_id, name, plan_type)
VALUES (v_coach, 'Muscle Gain — High Protein', 'nonveg') RETURNING id INTO t_muscle;

-- Meal 1: Breakfast
INSERT INTO template_meal_slots (template_id, name, target_calories, is_skipped, sort_order)
VALUES (t_muscle, 'Breakfast', 450, false, 0) RETURNING id INTO v_slot;

INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'complete_meal', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_protein_pancakes, 0), (v_comp, d_greek_yogurt, 1);

-- Meal 2: Lunch
INSERT INTO template_meal_slots (template_id, name, target_calories, is_skipped, sort_order)
VALUES (t_muscle, 'Lunch', 650, false, 1) RETURNING id INTO v_slot;

INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'carbohydrate', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_quinoa, 0), (v_comp, d_sweet_potato, 1);

INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'protein', 1) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_salmon, 0), (v_comp, d_tuna_salad, 1);

INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'fiber', 2) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_greek_salad, 0), (v_comp, d_roasted_veggies, 1);

-- Meal 3: Snack
INSERT INTO template_meal_slots (template_id, name, target_calories, is_skipped, sort_order)
VALUES (t_muscle, 'Post-Workout Snack', 300, false, 2) RETURNING id INTO v_slot;

INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'carbohydrate', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_peanut_butter_toast, 0);

INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'fiber', 1) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_fruit_bowl, 0);

-- Meal 4: Dinner
INSERT INTO template_meal_slots (template_id, name, target_calories, is_skipped, sort_order)
VALUES (t_muscle, 'Dinner', 600, false, 3) RETURNING id INTO v_slot;

INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'carbohydrate', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_quinoa, 0);

INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'protein', 1) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_egg_bhurji, 0), (v_comp, d_salmon, 1);

INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'fiber', 2) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_roasted_veggies, 0);

-- ============================================================
-- DIET TEMPLATE 2: Lean Veg (4 meals)
-- ============================================================

INSERT INTO diet_templates (coach_id, name, plan_type)
VALUES (v_coach, 'Lean & Clean — Veg', 'veg') RETURNING id INTO t_lean;

-- Meal 1: Breakfast
INSERT INTO template_meal_slots (template_id, name, target_calories, is_skipped, sort_order)
VALUES (t_lean, 'Breakfast', 350, false, 0) RETURNING id INTO v_slot;

INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'complete_meal', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_greek_yogurt, 0), (v_comp, d_chickpea_bowl, 1);

-- Meal 2: Lunch
INSERT INTO template_meal_slots (template_id, name, target_calories, is_skipped, sort_order)
VALUES (t_lean, 'Lunch', 500, false, 1) RETURNING id INTO v_slot;

INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'carbohydrate', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_quinoa, 0), (v_comp, d_sweet_potato, 1);

INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'protein', 1) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_tofu_stir_fry, 0), (v_comp, d_grilled_paneer, 1), (v_comp, d_lentil_soup, 2);

INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'fiber', 2) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_greek_salad, 0);

-- Meal 3: Evening Snack
INSERT INTO template_meal_slots (template_id, name, target_calories, is_skipped, sort_order)
VALUES (t_lean, 'Evening Snack', 200, false, 2) RETURNING id INTO v_slot;

INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'fiber', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_fruit_bowl, 0);

INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'protein', 1) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_lentil_soup, 0);

-- Meal 4: Dinner
INSERT INTO template_meal_slots (template_id, name, target_calories, is_skipped, sort_order)
VALUES (t_lean, 'Dinner', 450, false, 3) RETURNING id INTO v_slot;

INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'carbohydrate', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_sweet_potato, 0);

INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'protein', 1) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_dal_makhani, 0), (v_comp, d_tofu_stir_fry, 1);

INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'fiber', 2) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_roasted_veggies, 0), (v_comp, d_greek_salad, 1);

-- ============================================================
-- DIET TEMPLATE 3: Balanced Nonveg (5 meals)
-- ============================================================

INSERT INTO diet_templates (coach_id, name, plan_type)
VALUES (v_coach, 'Balanced 5-Meal Plan', 'nonveg') RETURNING id INTO t_balanced;

-- Meal 1: Early Morning
INSERT INTO template_meal_slots (template_id, name, target_calories, is_skipped, sort_order)
VALUES (t_balanced, 'Early Morning', 300, false, 0) RETURNING id INTO v_slot;

INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'complete_meal', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_protein_pancakes, 0);

-- Meal 2: Mid-Morning
INSERT INTO template_meal_slots (template_id, name, target_calories, is_skipped, sort_order)
VALUES (t_balanced, 'Mid-Morning', 250, false, 1) RETURNING id INTO v_slot;

INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'carbohydrate', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_peanut_butter_toast, 0);

INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'fiber', 1) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_fruit_bowl, 0);

-- Meal 3: Lunch
INSERT INTO template_meal_slots (template_id, name, target_calories, is_skipped, sort_order)
VALUES (t_balanced, 'Lunch', 550, false, 2) RETURNING id INTO v_slot;

INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'carbohydrate', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_quinoa, 0), (v_comp, d_sweet_potato, 1);

INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'protein', 1) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_salmon, 0), (v_comp, d_tuna_salad, 1);

INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'fiber', 2) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_greek_salad, 0), (v_comp, d_roasted_veggies, 1);

-- Meal 4: Pre-Dinner Snack
INSERT INTO template_meal_slots (template_id, name, target_calories, is_skipped, sort_order)
VALUES (t_balanced, 'Pre-Dinner Snack', 200, false, 3) RETURNING id INTO v_slot;

INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'protein', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_egg_bhurji, 0);

-- Meal 5: Dinner
INSERT INTO template_meal_slots (template_id, name, target_calories, is_skipped, sort_order)
VALUES (t_balanced, 'Dinner', 500, false, 4) RETURNING id INTO v_slot;

INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'carbohydrate', 0) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_quinoa, 0);

INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'protein', 1) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_salmon, 0), (v_comp, d_grilled_paneer, 1);

INSERT INTO meal_slot_components (slot_id, component_category, sort_order) VALUES (v_slot, 'fiber', 2) RETURNING id INTO v_comp;
INSERT INTO meal_slot_dishes (component_id, dish_id, sort_order) VALUES (v_comp, d_roasted_veggies, 0);


-- ============================================================
-- WORKOUT TEMPLATE 1: Push Pull Legs (3 slots, 4-5 exercises each)
-- ============================================================

INSERT INTO workout_templates (coach_id, name, is_template)
VALUES (v_coach, 'Push Pull Legs', true) RETURNING id INTO w_ppl;

-- Push Day
INSERT INTO workout_template_slots (template_id, name, sort_order)
VALUES (w_ppl, 'Push Day', 0) RETURNING id INTO v_wslot;

INSERT INTO workout_slot_exercises (slot_id, custom_name, custom_emoji, sets, reps, rest_seconds, notes, sort_order) VALUES
  (v_wslot, 'Flat Bench Press', '🏋️', 4, '8-10', 90, 'Control the eccentric', 0),
  (v_wslot, 'Incline Dumbbell Press', '💪', 3, '10-12', 75, NULL, 1),
  (v_wslot, 'Overhead Press', '🔥', 3, '8-10', 90, 'Strict form, no leg drive', 2),
  (v_wslot, 'Lateral Raises', '🦅', 3, '12-15', 60, 'Light weight, high reps', 3),
  (v_wslot, 'Tricep Pushdowns', '💪', 3, '12-15', 60, NULL, 4);

-- Pull Day
INSERT INTO workout_template_slots (template_id, name, sort_order)
VALUES (w_ppl, 'Pull Day', 1) RETURNING id INTO v_wslot;

INSERT INTO workout_slot_exercises (slot_id, custom_name, custom_emoji, sets, reps, rest_seconds, notes, sort_order) VALUES
  (v_wslot, 'Deadlift', '🏋️', 4, '5', 120, 'Warm up properly', 0),
  (v_wslot, 'Barbell Row', '💪', 4, '8-10', 90, NULL, 1),
  (v_wslot, 'Lat Pulldown', '🦅', 3, '10-12', 75, 'Full stretch at top', 2),
  (v_wslot, 'Face Pulls', '🎯', 3, '15-20', 60, 'Squeeze rear delts', 3),
  (v_wslot, 'Barbell Curls', '💪', 3, '10-12', 60, NULL, 4);

-- Legs Day
INSERT INTO workout_template_slots (template_id, name, sort_order)
VALUES (w_ppl, 'Legs Day', 2) RETURNING id INTO v_wslot;

INSERT INTO workout_slot_exercises (slot_id, custom_name, custom_emoji, sets, reps, rest_seconds, notes, sort_order) VALUES
  (v_wslot, 'Barbell Squat', '🦵', 4, '6-8', 120, 'Below parallel', 0),
  (v_wslot, 'Romanian Deadlift', '🏋️', 3, '10-12', 90, 'Feel the hamstring stretch', 1),
  (v_wslot, 'Leg Press', '🦵', 3, '12-15', 90, NULL, 2),
  (v_wslot, 'Walking Lunges', '🚶', 3, '12 each', 75, NULL, 3),
  (v_wslot, 'Calf Raises', '🦶', 4, '15-20', 60, 'Pause at top', 4);

-- ============================================================
-- WORKOUT TEMPLATE 2: Upper Lower Split (4 slots)
-- ============================================================

INSERT INTO workout_templates (coach_id, name, is_template)
VALUES (v_coach, 'Upper Lower Split', true) RETURNING id INTO w_upper_lower;

-- Upper A
INSERT INTO workout_template_slots (template_id, name, sort_order)
VALUES (w_upper_lower, 'Upper A — Strength', 0) RETURNING id INTO v_wslot;

INSERT INTO workout_slot_exercises (slot_id, custom_name, custom_emoji, sets, reps, rest_seconds, notes, sort_order) VALUES
  (v_wslot, 'Bench Press', '🏋️', 4, '5', 120, 'Heavy — RPE 8', 0),
  (v_wslot, 'Barbell Row', '💪', 4, '5', 120, NULL, 1),
  (v_wslot, 'Overhead Press', '🔥', 3, '6-8', 90, NULL, 2),
  (v_wslot, 'Weighted Pull-ups', '🦅', 3, '6-8', 90, 'Add weight if bodyweight is easy', 3);

-- Lower A
INSERT INTO workout_template_slots (template_id, name, sort_order)
VALUES (w_upper_lower, 'Lower A — Strength', 1) RETURNING id INTO v_wslot;

INSERT INTO workout_slot_exercises (slot_id, custom_name, custom_emoji, sets, reps, rest_seconds, notes, sort_order) VALUES
  (v_wslot, 'Barbell Squat', '🦵', 4, '5', 120, 'Heavy — RPE 8', 0),
  (v_wslot, 'Romanian Deadlift', '🏋️', 4, '6-8', 90, NULL, 1),
  (v_wslot, 'Bulgarian Split Squat', '🦵', 3, '8-10 each', 75, NULL, 2),
  (v_wslot, 'Leg Curl', '🦵', 3, '10-12', 60, NULL, 3),
  (v_wslot, 'Standing Calf Raises', '🦶', 4, '12-15', 60, NULL, 4);

-- Upper B
INSERT INTO workout_template_slots (template_id, name, sort_order)
VALUES (w_upper_lower, 'Upper B — Hypertrophy', 2) RETURNING id INTO v_wslot;

INSERT INTO workout_slot_exercises (slot_id, custom_name, custom_emoji, sets, reps, rest_seconds, notes, sort_order) VALUES
  (v_wslot, 'Incline Dumbbell Press', '💪', 4, '10-12', 75, NULL, 0),
  (v_wslot, 'Cable Rows', '🦅', 4, '10-12', 75, NULL, 1),
  (v_wslot, 'Dumbbell Lateral Raises', '🦅', 4, '12-15', 60, 'Slow and controlled', 2),
  (v_wslot, 'Hammer Curls', '💪', 3, '10-12', 60, NULL, 3),
  (v_wslot, 'Overhead Tricep Extension', '💪', 3, '10-12', 60, NULL, 4);

-- Lower B
INSERT INTO workout_template_slots (template_id, name, sort_order)
VALUES (w_upper_lower, 'Lower B — Hypertrophy', 3) RETURNING id INTO v_wslot;

INSERT INTO workout_slot_exercises (slot_id, custom_name, custom_emoji, sets, reps, rest_seconds, notes, sort_order) VALUES
  (v_wslot, 'Leg Press', '🦵', 4, '12-15', 90, NULL, 0),
  (v_wslot, 'Hack Squat', '🦵', 3, '10-12', 90, NULL, 1),
  (v_wslot, 'Leg Extension', '🦵', 3, '12-15', 60, 'Squeeze at top', 2),
  (v_wslot, 'Seated Leg Curl', '🦵', 3, '12-15', 60, NULL, 3),
  (v_wslot, 'Seated Calf Raises', '🦶', 4, '15-20', 45, NULL, 4);

-- ============================================================
-- WORKOUT TEMPLATE 3: Full Body (3 days)
-- ============================================================

INSERT INTO workout_templates (coach_id, name, is_template)
VALUES (v_coach, 'Full Body 3x/Week', true) RETURNING id INTO w_full_body;

-- Day 1
INSERT INTO workout_template_slots (template_id, name, sort_order)
VALUES (w_full_body, 'Day 1 — Squat Focus', 0) RETURNING id INTO v_wslot;

INSERT INTO workout_slot_exercises (slot_id, custom_name, custom_emoji, sets, reps, rest_seconds, notes, sort_order) VALUES
  (v_wslot, 'Barbell Squat', '🦵', 4, '6-8', 120, NULL, 0),
  (v_wslot, 'Bench Press', '🏋️', 3, '8-10', 90, NULL, 1),
  (v_wslot, 'Barbell Row', '💪', 3, '8-10', 90, NULL, 2),
  (v_wslot, 'Dumbbell Shoulder Press', '🔥', 3, '10-12', 75, NULL, 3),
  (v_wslot, 'Plank', '🧘', 3, '45-60s', 60, 'Hold steady', 4);

-- Day 2
INSERT INTO workout_template_slots (template_id, name, sort_order)
VALUES (w_full_body, 'Day 2 — Bench Focus', 1) RETURNING id INTO v_wslot;

INSERT INTO workout_slot_exercises (slot_id, custom_name, custom_emoji, sets, reps, rest_seconds, notes, sort_order) VALUES
  (v_wslot, 'Bench Press', '🏋️', 4, '6-8', 120, NULL, 0),
  (v_wslot, 'Front Squat', '🦵', 3, '8-10', 90, NULL, 1),
  (v_wslot, 'Pull-ups', '🦅', 3, 'AMRAP', 90, 'Bodyweight or assisted', 2),
  (v_wslot, 'Romanian Deadlift', '🏋️', 3, '10-12', 90, NULL, 3),
  (v_wslot, 'Hanging Leg Raises', '🧘', 3, '12-15', 60, NULL, 4);

-- Day 3
INSERT INTO workout_template_slots (template_id, name, sort_order)
VALUES (w_full_body, 'Day 3 — Deadlift Focus', 2) RETURNING id INTO v_wslot;

INSERT INTO workout_slot_exercises (slot_id, custom_name, custom_emoji, sets, reps, rest_seconds, notes, sort_order) VALUES
  (v_wslot, 'Deadlift', '🏋️', 4, '5', 150, 'Heavy singles OK', 0),
  (v_wslot, 'Overhead Press', '🔥', 3, '8-10', 90, NULL, 1),
  (v_wslot, 'Leg Press', '🦵', 3, '12-15', 90, NULL, 2),
  (v_wslot, 'Lat Pulldown', '🦅', 3, '10-12', 75, NULL, 3),
  (v_wslot, 'Ab Wheel Rollouts', '🧘', 3, '10-12', 60, 'Slow and controlled', 4);

-- ============================================================
RAISE NOTICE 'Seed templates complete!';
RAISE NOTICE 'Diet templates: Muscle Gain (%), Lean Veg (%), Balanced 5-Meal (%)', t_muscle, t_lean, t_balanced;
RAISE NOTICE 'Workout templates: PPL (%), Upper Lower (%), Full Body (%)', w_ppl, w_upper_lower, w_full_body;

END $$;
