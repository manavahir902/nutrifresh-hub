-- Fix meal plan constraints to allow multiple items per meal
-- This migration removes the restrictive unique constraint and allows multiple food items per meal

-- Drop the existing unique constraint that prevents multiple items per meal
ALTER TABLE public.personalized_meal_plan_items 
DROP CONSTRAINT IF EXISTS personalized_meal_plan_items_user_id_day_of_week_meal_type__key;

-- Drop the existing unique constraint on food_item_id
ALTER TABLE public.personalized_meal_plan_items 
DROP CONSTRAINT IF EXISTS personalized_meal_plan_items_user_id_day_of_week_meal_type_food_item_id_key;

-- Create a new unique constraint that allows multiple items per meal but prevents exact duplicates
ALTER TABLE public.personalized_meal_plan_items 
ADD CONSTRAINT personalized_meal_plan_items_unique_item 
UNIQUE (user_id, day_of_week, meal_type, food_item_id, quantity_grams);

-- Update the safe_insert_meal_plan_item function to handle multiple items per meal
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
    -- Insert the meal plan item
    INSERT INTO public.personalized_meal_plan_items (
        user_id, day_of_week, meal_type, food_item_id, quantity_grams
    ) VALUES (
        p_user_id, p_day_of_week, p_meal_type, p_food_item_id, p_quantity_grams
    ) ON CONFLICT (user_id, day_of_week, meal_type, food_item_id, quantity_grams) 
    DO UPDATE SET 
        quantity_grams = EXCLUDED.quantity_grams,
        updated_at = now()
    RETURNING id INTO result_id;
    
    RETURN result_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to clear existing meal plans for a user
CREATE OR REPLACE FUNCTION clear_user_meal_plan(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.personalized_meal_plan_items 
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to insert multiple meal plan items
CREATE OR REPLACE FUNCTION insert_meal_plan_items(
    p_user_id UUID,
    p_meal_plan_items JSONB
) RETURNS INTEGER AS $$
DECLARE
    item JSONB;
    inserted_count INTEGER := 0;
BEGIN
    -- Clear existing meal plan for this user
    PERFORM clear_user_meal_plan(p_user_id);
    
    -- Insert new meal plan items
    FOR item IN SELECT * FROM jsonb_array_elements(p_meal_plan_items)
    LOOP
        INSERT INTO public.personalized_meal_plan_items (
            user_id, 
            day_of_week, 
            meal_type, 
            food_item_id, 
            quantity_grams
        ) VALUES (
            p_user_id,
            (item->>'day_of_week')::INTEGER,
            item->>'meal_type',
            (item->>'food_item_id')::UUID,
            (item->>'quantity_grams')::DECIMAL
        );
        
        inserted_count := inserted_count + 1;
    END LOOP;
    
    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION clear_user_meal_plan(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION insert_meal_plan_items(UUID, JSONB) TO authenticated;
