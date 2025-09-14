-- Fix remaining issues: profile query and duplicate meal plan entries

-- Step 1: Check for duplicate profiles and clean them up
-- This will help with the "Cannot coerce the result to a single JSON object" error
WITH duplicate_profiles AS (
  SELECT user_id, COUNT(*) as count
  FROM public.profiles
  GROUP BY user_id
  HAVING COUNT(*) > 1
),
keep_profiles AS (
  SELECT DISTINCT ON (user_id) id
  FROM public.profiles
  WHERE user_id IN (SELECT user_id FROM duplicate_profiles)
  ORDER BY user_id, created_at ASC
)
DELETE FROM public.profiles 
WHERE user_id IN (SELECT user_id FROM duplicate_profiles)
AND id NOT IN (SELECT id FROM keep_profiles);

-- Step 2: Add a unique constraint to profiles table to prevent future duplicates
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_unique;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- Step 3: Fix the personalized_meal_plan_items unique constraint
-- The constraint name seems to be truncated, let's recreate it properly
ALTER TABLE public.personalized_meal_plan_items 
DROP CONSTRAINT IF EXISTS personalized_meal_plan_items_user_id_day_of_week_meal_type_food_item_id_key;

-- Create a proper unique constraint
ALTER TABLE public.personalized_meal_plan_items 
ADD CONSTRAINT personalized_meal_plan_items_unique 
UNIQUE (user_id, day_of_week, meal_type, food_item_id);

-- Step 4: Clean up any existing duplicate meal plan entries
WITH duplicate_meal_plans AS (
  SELECT user_id, day_of_week, meal_type, food_item_id, COUNT(*) as count
  FROM public.personalized_meal_plan_items
  GROUP BY user_id, day_of_week, meal_type, food_item_id
  HAVING COUNT(*) > 1
),
keep_meal_plans AS (
  SELECT DISTINCT ON (user_id, day_of_week, meal_type, food_item_id) id
  FROM public.personalized_meal_plan_items
  WHERE (user_id, day_of_week, meal_type, food_item_id) IN (
    SELECT user_id, day_of_week, meal_type, food_item_id 
    FROM duplicate_meal_plans
  )
  ORDER BY user_id, day_of_week, meal_type, food_item_id, created_at ASC
)
DELETE FROM public.personalized_meal_plan_items 
WHERE (user_id, day_of_week, meal_type, food_item_id) IN (
  SELECT user_id, day_of_week, meal_type, food_item_id 
  FROM duplicate_meal_plans
)
AND id NOT IN (SELECT id FROM keep_meal_plans);

-- Step 5: Update the TestNotifications component to handle duplicates better
-- We'll create a function to safely insert meal plan items
CREATE OR REPLACE FUNCTION safe_insert_meal_plan_item(
  p_user_id UUID,
  p_day_of_week INTEGER,
  p_meal_type TEXT,
  p_food_item_id UUID,
  p_quantity_grams DECIMAL
) RETURNS UUID AS $$
DECLARE
  result_id UUID;
BEGIN
  -- Try to insert, if duplicate exists, return the existing ID
  INSERT INTO public.personalized_meal_plan_items (
    user_id, day_of_week, meal_type, food_item_id, quantity_grams
  ) VALUES (
    p_user_id, p_day_of_week, p_meal_type, p_food_item_id, p_quantity_grams
  ) ON CONFLICT (user_id, day_of_week, meal_type, food_item_id) 
  DO UPDATE SET 
    quantity_grams = EXCLUDED.quantity_grams,
    updated_at = now()
  RETURNING id INTO result_id;
  
  RETURN result_id;
END;
$$ LANGUAGE plpgsql;
