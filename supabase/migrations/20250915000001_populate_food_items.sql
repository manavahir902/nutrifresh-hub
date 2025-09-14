-- Populate food_items table with real meal data
-- Clear existing data first
DELETE FROM public.food_items;

-- Insert real meal data
INSERT INTO public.food_items (name, calories_per_100g, cost_per_100g_rupees, is_veg, category) VALUES
-- Complete Indian Meals
('🍛 Dal Rice (Lentil Curry with Rice)', 180, 8, true, 'complete_meal'),
('🍛 Rajma Rice (Kidney Bean Curry with Rice)', 195, 10, true, 'complete_meal'),
('🍛 Chana Masala with Rice', 185, 9, true, 'complete_meal'),
('🍛 Aloo Gobi with Roti', 165, 7, true, 'complete_meal'),
('🍛 Palak Paneer with Rice', 220, 12, true, 'complete_meal'),
('🍛 Chicken Curry with Rice', 210, 15, false, 'complete_meal'),
('🍛 Mutton Curry with Rice', 250, 18, false, 'complete_meal'),
('🍛 Fish Curry with Rice', 190, 16, false, 'complete_meal'),
('🍛 Egg Curry with Rice', 200, 8, false, 'complete_meal'),
('🍛 Biryani (Chicken)', 280, 20, false, 'complete_meal'),
('🍛 Biryani (Mutton)', 320, 25, false, 'complete_meal'),
('🍛 Vegetable Biryani', 240, 12, true, 'complete_meal'),

-- Breakfast Items
('🥞 Masala Dosa', 180, 15, true, 'breakfast'),
('🥞 Plain Dosa', 160, 12, true, 'breakfast'),
('🥞 Idli (2 pieces)', 120, 8, true, 'breakfast'),
('🥞 Vada (2 pieces)', 200, 10, true, 'breakfast'),
('🥞 Upma', 140, 6, true, 'breakfast'),
('🥞 Poha', 130, 5, true, 'breakfast'),
('🥞 Paratha (Aloo)', 250, 8, true, 'breakfast'),
('🥞 Paratha (Paneer)', 280, 12, true, 'breakfast'),
('🥞 Bread Butter', 200, 4, true, 'breakfast'),
('🥞 Bread Jam', 180, 3, true, 'breakfast'),
('🥞 Cornflakes with Milk', 120, 5, true, 'breakfast'),
('🥞 Oats with Milk', 110, 4, true, 'breakfast'),

-- Snacks & Street Food
('🥟 Samosa (2 pieces)', 300, 8, true, 'snacks'),
('🥟 Kachori (2 pieces)', 320, 10, true, 'snacks'),
('🥟 Pakora (Mixed)', 280, 12, true, 'snacks'),
('🥟 Vada Pav', 250, 8, true, 'snacks'),
('🥟 Pav Bhaji', 220, 15, true, 'snacks'),
('🥟 Chole Bhature', 350, 18, true, 'snacks'),
('🥟 Momos (6 pieces)', 200, 12, true, 'snacks'),
('🥟 Chicken Momos (6 pieces)', 220, 15, false, 'snacks'),
('🥟 Spring Roll (2 pieces)', 180, 10, true, 'snacks'),
('🥟 Cutlet (2 pieces)', 200, 8, true, 'snacks'),

-- Beverages
('🥤 Tea', 5, 2, true, 'beverages'),
('🥤 Coffee', 8, 3, true, 'beverages'),
('🥤 Lassi (Sweet)', 80, 8, true, 'beverages'),
('🥤 Lassi (Salty)', 60, 6, true, 'beverages'),
('🥤 Fresh Juice (Orange)', 45, 12, true, 'beverages'),
('🥤 Fresh Juice (Apple)', 50, 10, true, 'beverages'),
('🥤 Fresh Juice (Pomegranate)', 55, 15, true, 'beverages'),
('🥤 Coconut Water', 20, 8, true, 'beverages'),
('🥤 Buttermilk', 40, 3, true, 'beverages'),
('🥤 Soft Drink (Coke/Pepsi)', 42, 5, true, 'beverages'),

-- Desserts
('🍰 Gulab Jamun (2 pieces)', 320, 8, true, 'desserts'),
('🍰 Rasgulla (3 pieces)', 150, 6, true, 'desserts'),
('🍰 Kheer (Rice Pudding)', 120, 8, true, 'desserts'),
('🍰 Halwa (Carrot)', 280, 10, true, 'desserts'),
('🍰 Halwa (Semolina)', 300, 8, true, 'desserts'),
('🍰 Jalebi (4 pieces)', 350, 12, true, 'desserts'),
('🍰 Ladoo (2 pieces)', 280, 6, true, 'desserts'),
('🍰 Barfi (2 pieces)', 320, 8, true, 'desserts'),
('🍰 Ice Cream (Vanilla)', 200, 10, true, 'desserts'),
('🍰 Ice Cream (Chocolate)', 220, 12, true, 'desserts'),

-- Fast Food
('🍔 Veg Burger', 250, 15, true, 'fast_food'),
('🍔 Chicken Burger', 280, 20, false, 'fast_food'),
('🍟 French Fries', 365, 8, true, 'fast_food'),
('🍕 Pizza (Veg)', 266, 18, true, 'fast_food'),
('🍕 Pizza (Chicken)', 290, 22, false, 'fast_food'),
('🌮 Tacos (2 pieces)', 200, 12, true, 'fast_food'),
('🌮 Chicken Tacos (2 pieces)', 220, 15, false, 'fast_food'),
('🌯 Wrap (Veg)', 180, 10, true, 'fast_food'),
('🌯 Wrap (Chicken)', 200, 12, false, 'fast_food'),
('🍝 Pasta (Veg)', 150, 12, true, 'fast_food'),
('🍝 Pasta (Chicken)', 170, 15, false, 'fast_food'),

-- Basic Ingredients (for custom meals)
('🍚 Basmati Rice (Raw)', 130, 3, true, 'ingredients'),
('🍞 Wheat Flour', 340, 2, true, 'ingredients'),
('🥔 Potato', 77, 4, true, 'ingredients'),
('🧅 Onion', 40, 3, true, 'ingredients'),
('🍅 Tomato', 18, 5, true, 'ingredients'),
('🥕 Carrot', 41, 4, true, 'ingredients'),
('🥬 Spinach', 23, 10, true, 'ingredients'),
('🥦 Cauliflower', 25, 6, true, 'ingredients'),
('🥒 Cucumber', 16, 3, true, 'ingredients'),
('🧄 Garlic', 149, 8, true, 'ingredients'),
('🥚 Eggs', 155, 5, false, 'ingredients'),
('🍗 Chicken (Raw)', 165, 30, false, 'ingredients'),
('🐟 Fish (Raw)', 97, 35, false, 'ingredients'),
('🧀 Paneer', 265, 20, true, 'ingredients'),
('🥛 Milk', 42, 2, true, 'ingredients'),
('🧈 Butter', 717, 20, true, 'ingredients'),
('🫒 Oil (Cooking)', 884, 8, true, 'ingredients'),
('🫘 Dal (Lentils)', 116, 6, true, 'ingredients'),
('🫘 Rajma (Kidney Beans)', 127, 7, true, 'ingredients'),
('🫘 Chana (Chickpeas)', 164, 8, true, 'ingredients');
