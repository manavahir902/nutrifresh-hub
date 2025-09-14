-- Corrected fix for notifications and meal plans system
-- This migration works with the existing database structure

-- 1. Create messages table for notifications (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'feedback' CHECK (message_type IN ('feedback', 'announcement', 'suggestion', 'reminder')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_broadcast BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create AI suggestions table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.ai_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  suggestion_type TEXT NOT NULL DEFAULT 'nutrition_tip' CHECK (suggestion_type IN ('nutrition_tip', 'health_fact', 'exercise_tip', 'motivation', 'recipe')),
  target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'students', 'teachers')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Create personalized_meal_plan_items table (only if it doesn't exist)
-- This is the new table for AI-generated meal plans
CREATE TABLE IF NOT EXISTS public.personalized_meal_plan_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_item_id UUID NOT NULL REFERENCES public.food_items(id) ON DELETE CASCADE,
  quantity_grams DECIMAL(8,2) NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_of_week, meal_type, food_item_id)
);

-- 4. Enable RLS on new tables (only if not already enabled)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'messages' AND relrowsecurity = true
    ) THEN
        ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'ai_suggestions' AND relrowsecurity = true
    ) THEN
        ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'personalized_meal_plan_items' AND relrowsecurity = true
    ) THEN
        ALTER TABLE public.personalized_meal_plan_items ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 5. Create RLS policies for messages (only if they don't exist)
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
    DROP POLICY IF EXISTS "Users can create messages" ON public.messages;
    DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
    DROP POLICY IF EXISTS "Teachers can view all messages" ON public.messages;
    
    -- Create new policies
    CREATE POLICY "Users can view their own messages" ON public.messages
      FOR SELECT USING (auth.uid() = recipient_id OR auth.uid() = sender_id);

    CREATE POLICY "Users can create messages" ON public.messages
      FOR INSERT WITH CHECK (auth.uid() = sender_id);

    CREATE POLICY "Users can update their own messages" ON public.messages
      FOR UPDATE USING (auth.uid() = recipient_id);

    -- Teachers and admins can view all messages
    CREATE POLICY "Teachers can view all messages" ON public.messages
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
        )
      );
END $$;

-- 6. Create RLS policies for AI suggestions (only if they don't exist)
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Everyone can view active AI suggestions" ON public.ai_suggestions;
    DROP POLICY IF EXISTS "Teachers and admins can manage AI suggestions" ON public.ai_suggestions;
    
    -- Create new policies
    CREATE POLICY "Everyone can view active AI suggestions" ON public.ai_suggestions
      FOR SELECT USING (is_active = true);

    CREATE POLICY "Teachers and admins can manage AI suggestions" ON public.ai_suggestions
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
        )
      );
END $$;

-- 7. Create RLS policies for personalized_meal_plan_items (only if they don't exist)
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own meal plan items" ON public.personalized_meal_plan_items;
    DROP POLICY IF EXISTS "Users can insert their own meal plan items" ON public.personalized_meal_plan_items;
    DROP POLICY IF EXISTS "Users can update their own meal plan items" ON public.personalized_meal_plan_items;
    DROP POLICY IF EXISTS "Users can delete their own meal plan items" ON public.personalized_meal_plan_items;
    DROP POLICY IF EXISTS "Teachers can view all meal plan items" ON public.personalized_meal_plan_items;
    
    -- Create new policies
    CREATE POLICY "Users can view their own meal plan items" ON public.personalized_meal_plan_items
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own meal plan items" ON public.personalized_meal_plan_items
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own meal plan items" ON public.personalized_meal_plan_items
      FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own meal plan items" ON public.personalized_meal_plan_items
      FOR DELETE USING (auth.uid() = user_id);

    -- Teachers and admins can view all meal plan items
    CREATE POLICY "Teachers can view all meal plan items" ON public.personalized_meal_plan_items
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
        )
      );
END $$;

-- 8. Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_personalized_meal_plan_items_user_id ON public.personalized_meal_plan_items(user_id);
CREATE INDEX IF NOT EXISTS idx_personalized_meal_plan_items_day_meal ON public.personalized_meal_plan_items(day_of_week, meal_type);

-- 9. Insert sample AI suggestions (only if table is empty)
INSERT INTO public.ai_suggestions (title, content, suggestion_type, target_audience)
SELECT * FROM (VALUES
('Stay Hydrated', 'Drink at least 8 glasses of water daily to maintain proper hydration and support your metabolism.', 'health_fact', 'all'),
('Balanced Breakfast', 'Start your day with a protein-rich breakfast to maintain energy levels throughout the morning.', 'nutrition_tip', 'students'),
('Portion Control', 'Use your hand as a guide: palm for protein, fist for vegetables, cupped hand for carbs, and thumb for fats.', 'nutrition_tip', 'all'),
('Regular Exercise', 'Aim for at least 30 minutes of moderate exercise daily to support your nutrition goals.', 'exercise_tip', 'students'),
('Mindful Eating', 'Eat slowly and without distractions to better recognize hunger and fullness cues.', 'nutrition_tip', 'all'),
('Sleep and Nutrition', 'Getting 7-9 hours of sleep helps regulate hunger hormones and supports healthy eating habits.', 'health_fact', 'all'),
('Meal Prep Tips', 'Prepare healthy snacks in advance to avoid reaching for unhealthy options when hungry.', 'nutrition_tip', 'students'),
('Colorful Plate', 'Include a variety of colorful fruits and vegetables to ensure you get diverse nutrients.', 'nutrition_tip', 'all')
) AS v(title, content, suggestion_type, target_audience)
WHERE NOT EXISTS (SELECT 1 FROM public.ai_suggestions LIMIT 1);

-- 10. Update food_items table to include the new categories (only if needed)
UPDATE public.food_items 
SET category = 'complete_meal' 
WHERE (name LIKE '%Rice%' OR name LIKE '%Curry%') 
AND category != 'complete_meal';

UPDATE public.food_items 
SET category = 'breakfast' 
WHERE name IN ('Wheat Roti', 'Milk', 'Curd/Yogurt') 
AND category != 'breakfast';

UPDATE public.food_items 
SET category = 'snacks' 
WHERE name IN ('Banana', 'Apple') 
AND category != 'snacks';

UPDATE public.food_items 
SET category = 'ingredients' 
WHERE name IN ('Rice (Basmati)', 'Dal (Lentils)', 'Paneer', 'Mixed Vegetables') 
AND category != 'ingredients';
