-- Fresh import — only yellow-highlighted items from spreadsheet
-- Breakfast and Fast Foods = all items from those sheets

DO $$
DECLARE
  v_coach uuid := '03268025-18be-4d8a-a744-901c6196bbdd';
  tag_fastfood uuid;
  tag_breakfast uuid;
  d_id uuid;
BEGIN

-- Create tags
INSERT INTO dish_tags (coach_id, name, color) VALUES (v_coach, 'Fast Food', '#f97316') RETURNING id INTO tag_fastfood;
INSERT INTO dish_tags (coach_id, name, color) VALUES (v_coach, 'Breakfast', '#eab308') RETURNING id INTO tag_breakfast;

-- ============================================================
-- CARBOHYDRATES — yellow rows only (13 items)
-- ============================================================

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat, description) VALUES
(v_coach, 'Chapati 1', '🫓', 'carbohydrate', 90, 3, 17, 2, 'Whole wheat ~30g atta'),
(v_coach, 'Cooked Brown Rice 150G', '🍚', 'carbohydrate', 164, 4, 34, 1, 'USDA'),
(v_coach, 'Cooked Millets 200G', '🌾', 'carbohydrate', 215, 6, 42, 2, 'USDA foxtail/finger millet'),
(v_coach, 'Cooked White Rice 100G', '🍚', 'carbohydrate', 130, 3, 28, 0, 'USDA'),
(v_coach, 'Daves Bread 2 slices', '🍞', 'carbohydrate', 160, 8, 30, 2, 'Daves Killer Bread Thin'),
(v_coach, 'Dosa 1', '🫓', 'carbohydrate', 180, 4, 30, 5, 'Plain dosa ~100g batter'),
(v_coach, 'Idli 1', '🍚', 'carbohydrate', 80, 3, 15, 1, 'Idli ~150g'),
(v_coach, 'Mission Low Carb Tortilla 2', '🫓', 'carbohydrate', 120, 8, 22, 4, 'Mission Carb Balance'),
(v_coach, 'Phulka 2', '🫓', 'carbohydrate', 150, 5, 29, 3, 'Thin whole wheat ~50g atta'),
(v_coach, 'Raw Quinoa 60G', '🌾', 'carbohydrate', 218, 8, 38, 4, 'USDA raw weight'),
(v_coach, 'Raw White Rice 30G', '🍚', 'carbohydrate', 108, 2, 23, 0, 'USDA raw weight'),
(v_coach, 'Salad 200Cal', '🥗', 'carbohydrate', 200, 5, 12, 14, 'Packaged salad ~250g'),
(v_coach, 'Sweet Potato 200G', '🍠', 'carbohydrate', 180, 4, 41, 0, 'Baked/boiled cooked');

-- ============================================================
-- PROTEINS — yellow rows only (21 items)
-- ============================================================

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat, description) VALUES
(v_coach, '4 Egg Whites', '🥚', 'protein', 68, 14, 1, 0, '4 large egg whites'),
(v_coach, 'Tofu 120G Extra Firm', '🥡', 'protein', 91, 10, 2, 5, 'Extra firm tofu burji'),
(v_coach, 'Isopure 1 Scoop', '🥤', 'protein', 100, 25, 0, 0, '1 scoop isopure unflavored'),
(v_coach, 'Shrimp 120G Raw', '🦐', 'protein', 101, 19, 1, 2, 'USDA raw shrimp'),
(v_coach, 'Greek Yogurt 200G', '🥛', 'protein', 130, 17, 9, 0, 'Chobani plain nonfat'),
(v_coach, 'Chicken Breast 120G Raw', '🍗', 'protein', 130, 27, 0, 3, 'USDA raw skinless'),
(v_coach, 'Dal 40G Raw', '🍲', 'protein', 140, 9, 24, 1, 'Toor/moong dal raw'),
(v_coach, 'Tilapia 4Oz', '🐟', 'protein', 145, 30, 0, 3, '4oz ~113g air fried'),
(v_coach, 'Paneer 120G Low Fat', '🧀', 'protein', 150, 18, 5, 7, 'Low fat paneer'),
(v_coach, 'Cottage Cheese 200G', '🧀', 'protein', 163, 28, 6, 2, 'Low fat cottage cheese'),
(v_coach, 'Soya Chunks 50G Dry', '🫘', 'protein', 173, 25, 9, 1, 'Soya chunks dry weight'),
(v_coach, 'Egg Burji 2+2', '🍳', 'protein', 176, 16, 2, 11, '2 whole + 2 whites burji'),
(v_coach, 'Orgain 2 Scoops', '🥤', 'protein', 200, 21, 18, 5, '2 scoops + 300ml almond milk'),
(v_coach, 'Protein Bar Barebells', '🍫', 'protein', 200, 20, 20, 7, 'Barebells protein bar'),
(v_coach, 'Salmon 4Oz', '🐟', 'protein', 208, 29, 0, 10, '4oz ~113g air fried'),
(v_coach, 'Rajma 60G Raw', '🫘', 'protein', 210, 14, 38, 1, 'Kidney beans raw'),
(v_coach, 'Chole 60G Raw', '🫘', 'protein', 220, 14, 40, 2, 'Chickpeas raw'),
(v_coach, 'Chicken Thigh 200G Raw', '🍗', 'protein', 250, 30, 0, 14, 'USDA raw skinless'),
(v_coach, 'Chicken Wings 8', '🍗', 'protein', 480, 44, 0, 32, '8 wings with hot sauce');

-- ============================================================
-- FIBER — yellow rows only (15 items)
-- ============================================================

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat, description) VALUES
(v_coach, 'Spinach 100G', '🥬', 'fiber', 23, 3, 4, 0, NULL),
(v_coach, 'Cucumber 200G', '🥒', 'fiber', 30, 1, 7, 0, NULL),
(v_coach, 'Carrot 120G', '🥕', 'fiber', 50, 1, 12, 0, NULL),
(v_coach, 'Broccoli 150G', '🥦', 'fiber', 51, 4, 10, 1, NULL),
(v_coach, 'Strawberries 200G', '🍓', 'fiber', 64, 1, 15, 0, NULL),
(v_coach, 'Watermelon 250G', '🍉', 'fiber', 75, 2, 19, 0, NULL),
(v_coach, 'Salad Kit Half', '🥗', 'fiber', 80, 3, 8, 4, NULL),
(v_coach, 'Apple 1 Medium', '🍎', 'fiber', 95, 0, 25, 0, NULL),
(v_coach, 'Avocado Small', '🥑', 'fiber', 160, 2, 9, 15, NULL),
(v_coach, 'Cantaloupe 250G', '🍈', 'fiber', 85, 2, 20, 0, NULL),
(v_coach, 'Oranges 2', '🍊', 'fiber', 160, 0, 36, 0, NULL),
(v_coach, 'Cutie Oranges 4', '🍊', 'fiber', 160, 0, 36, 0, NULL),
(v_coach, 'Sheet Pan Veggies 250G (Costco)', '🥕', 'fiber', 130, 5, 24, 3, 'Costco sheet pan vegetables cooked');

-- ============================================================
-- BREAKFAST — all items (tagged 'Breakfast')
-- ============================================================

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat, description)
VALUES (v_coach, 'Orgain Classic Smoothie', '🥤', 'complete_meal', 280, 22, 24, 7, '2 scoops Orgain + 250ml almond milk + 100g berries')
RETURNING id INTO d_id;
INSERT INTO dish_tag_links (dish_id, tag_id) VALUES (d_id, tag_breakfast);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat, description)
VALUES (v_coach, 'Orgain Smoothie + Banana', '🥤', 'complete_meal', 360, 24, 36, 8, '2 scoops + 300ml almond milk + 100g berries + 0.5 banana')
RETURNING id INTO d_id;
INSERT INTO dish_tag_links (dish_id, tag_id) VALUES (d_id, tag_breakfast);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat, description)
VALUES (v_coach, 'Whey Protein Smoothie', '🥤', 'complete_meal', 220, 26, 22, 5, '1 scoop whey + 250ml almond milk + 100g berries')
RETURNING id INTO d_id;
INSERT INTO dish_tag_links (dish_id, tag_id) VALUES (d_id, tag_breakfast);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat, description)
VALUES (v_coach, 'Egg White + Avocado Toast', '🍳', 'complete_meal', 310, 18, 26, 16, '2-3 egg whites + 2 Daves bread + half avocado')
RETURNING id INTO d_id;
INSERT INTO dish_tag_links (dish_id, tag_id) VALUES (d_id, tag_breakfast);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat, description)
VALUES (v_coach, 'Egg White Sandwich', '🍳', 'complete_meal', 340, 26, 30, 14, '2 Daves bread + 3 egg whites + avocado + cheese')
RETURNING id INTO d_id;
INSERT INTO dish_tag_links (dish_id, tag_id) VALUES (d_id, tag_breakfast);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat, description)
VALUES (v_coach, 'Avocado Toast (Veg)', '🥑', 'complete_meal', 220, 6, 22, 14, '2 Daves bread + half avocado mash')
RETURNING id INTO d_id;
INSERT INTO dish_tag_links (dish_id, tag_id) VALUES (d_id, tag_breakfast);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat, description)
VALUES (v_coach, 'Basic Overnight Oats', '🥣', 'complete_meal', 310, 14, 42, 6, '40g oats + 200ml low-fat or almond milk')
RETURNING id INTO d_id;
INSERT INTO dish_tag_links (dish_id, tag_id) VALUES (d_id, tag_breakfast);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat, description)
VALUES (v_coach, 'Protein Overnight Oats', '🥣', 'complete_meal', 360, 22, 44, 8, '40g oats + 1 scoop protein + 50g Greek yogurt + chia + almond milk')
RETURNING id INTO d_id;
INSERT INTO dish_tag_links (dish_id, tag_id) VALUES (d_id, tag_breakfast);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat, description)
VALUES (v_coach, 'Cereal + Milk', '🥣', 'complete_meal', 310, 20, 38, 6, '40g Ratio/Catalina Crunch + 150ml Fairlife/2% milk')
RETURNING id INTO d_id;
INSERT INTO dish_tag_links (dish_id, tag_id) VALUES (d_id, tag_breakfast);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat, description)
VALUES (v_coach, 'Idli + Sambar + Greek Yogurt', '🍚', 'complete_meal', 350, 22, 46, 6, '2-3 idlis + sambar/podi + 200-250g Greek yogurt')
RETURNING id INTO d_id;
INSERT INTO dish_tag_links (dish_id, tag_id) VALUES (d_id, tag_breakfast);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat, description)
VALUES (v_coach, 'Dosa + Greek Yogurt', '🫓', 'complete_meal', 290, 18, 34, 6, '1 dosa + pickle + 200g Greek yogurt')
RETURNING id INTO d_id;
INSERT INTO dish_tag_links (dish_id, tag_id) VALUES (d_id, tag_breakfast);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat, description)
VALUES (v_coach, 'Greek Yogurt + Berries', '🥛', 'complete_meal', 160, 17, 16, 0, '200g Greek yogurt + 100g berries')
RETURNING id INTO d_id;
INSERT INTO dish_tag_links (dish_id, tag_id) VALUES (d_id, tag_breakfast);

-- ============================================================
-- FAST FOODS — all items (tagged 'Fast Food', Starbucks also 'Breakfast')
-- ============================================================

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat, meal_size, description)
VALUES (v_coach, 'Chicken Bowl (Chipotle)', '🌯', 'complete_meal', 620, 42, 68, 18, 'large', 'Chicken, rice, fajita veggies, corn salsa, hot sauce, lettuce, sour cream')
RETURNING id INTO d_id;
INSERT INTO dish_tag_links (dish_id, tag_id) VALUES (d_id, tag_fastfood);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat, meal_size, description)
VALUES (v_coach, 'Veg Bowl No Sour Cream (Chipotle)', '🌯', 'complete_meal', 480, 32, 78, 8, 'medium', 'Lowest fat option')
RETURNING id INTO d_id;
INSERT INTO dish_tag_links (dish_id, tag_id) VALUES (d_id, tag_fastfood);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat, meal_size, description)
VALUES (v_coach, 'Grilled Chicken Sandwich (Chick-fil-A)', '🐔', 'complete_meal', 390, 37, 42, 8, 'medium', 'Classic lean grilled sandwich')
RETURNING id INTO d_id;
INSERT INTO dish_tag_links (dish_id, tag_id) VALUES (d_id, tag_fastfood);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat, meal_size, description)
VALUES (v_coach, '12ct Grilled Nuggets + Fruit (Chick-fil-A)', '🐔', 'complete_meal', 340, 38, 30, 8, 'small', 'Cleanest option on the menu')
RETURNING id INTO d_id;
INSERT INTO dish_tag_links (dish_id, tag_id) VALUES (d_id, tag_fastfood);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat, meal_size, description)
VALUES (v_coach, 'Southwest Salad (Chick-fil-A)', '🥗', 'complete_meal', 540, 42, 40, 22, 'medium', 'Grilled chicken + lite dressing on side')
RETURNING id INTO d_id;
INSERT INTO dish_tag_links (dish_id, tag_id) VALUES (d_id, tag_fastfood);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat, meal_size, description)
VALUES (v_coach, 'Half Sandwich + Soup + Apple (Panera)', '🥪', 'complete_meal', 560, 32, 65, 14, 'medium', 'Half portions keep calories controlled')
RETURNING id INTO d_id;
INSERT INTO dish_tag_links (dish_id, tag_id) VALUES (d_id, tag_fastfood);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat, meal_size, description)
VALUES (v_coach, 'Spinach Feta Wrap + Latte (Starbucks)', '☕', 'complete_meal', 430, 24, 38, 16, 'medium', 'Wrap ~290 cal + soy latte ~140 cal')
RETURNING id INTO d_id;
INSERT INTO dish_tag_links (dish_id, tag_id) VALUES (d_id, tag_fastfood);
INSERT INTO dish_tag_links (dish_id, tag_id) VALUES (d_id, tag_breakfast);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat, meal_size, description)
VALUES (v_coach, 'Eggwhite Feta Wrap + Espresso (Starbucks)', '☕', 'complete_meal', 420, 22, 36, 14, 'medium', 'Eggwhite wrap + brown sugar oatmeal espresso')
RETURNING id INTO d_id;
INSERT INTO dish_tag_links (dish_id, tag_id) VALUES (d_id, tag_fastfood);
INSERT INTO dish_tag_links (dish_id, tag_id) VALUES (d_id, tag_breakfast);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat, meal_size, description)
VALUES (v_coach, 'Cantina Chicken Bowl (Taco Bell)', '🌮', 'complete_meal', 565, 32, 65, 18, 'medium', 'Watch sodium')
RETURNING id INTO d_id;
INSERT INTO dish_tag_links (dish_id, tag_id) VALUES (d_id, tag_fastfood);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat, meal_size, description)
VALUES (v_coach, 'Mediterranean Chicken + Veggies', '🥙', 'complete_meal', 520, 42, 48, 14, 'medium', 'More veggies, lite rice, sauce on side')
RETURNING id INTO d_id;
INSERT INTO dish_tag_links (dish_id, tag_id) VALUES (d_id, tag_fastfood);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat, meal_size, description)
VALUES (v_coach, 'Chicken Shawarma + Salad (Mediterranean)', '🥙', 'protein', 420, 52, 12, 18, 'medium', 'Meat only + side salad. No rice/pita')
RETURNING id INTO d_id;
INSERT INTO dish_tag_links (dish_id, tag_id) VALUES (d_id, tag_fastfood);

INSERT INTO dishes (coach_id, name, emoji, component_category, total_calories, total_protein, total_carbs, total_fat, meal_size, description)
VALUES (v_coach, 'Chicken + Beans + Guac (Cava)', '🥗', 'complete_meal', 620, 44, 58, 20, 'large', 'High fiber. Guac = healthy fat')
RETURNING id INTO d_id;
INSERT INTO dish_tag_links (dish_id, tag_id) VALUES (d_id, tag_fastfood);

RAISE NOTICE 'Import complete! 13 carbs + 21 proteins + 13 fiber + 12 breakfast + 12 fast food = 71 dishes';
END $$;
