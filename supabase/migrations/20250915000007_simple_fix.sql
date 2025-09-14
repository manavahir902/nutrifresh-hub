-- Simple step-by-step fix for the database issues
-- This migration will create the missing tables one by one

-- Step 1: Create messages table
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

-- Step 2: Create AI suggestions table
CREATE TABLE IF NOT EXISTS public.ai_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  suggestion_type TEXT NOT NULL DEFAULT 'nutrition_tip' CHECK (suggestion_type IN ('nutrition_tip', 'health_fact', 'exercise_tip', 'motivation', 'recipe')),
  target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'students', 'teachers')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Step 3: Create personalized_meal_plan_items table
CREATE TABLE IF NOT EXISTS public.personalized_meal_plan_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_item_id UUID NOT NULL REFERENCES public.food_items(id) ON DELETE CASCADE,
  quantity_grams DECIMAL(8,2) NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Step 4: Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_meal_plan_items ENABLE ROW LEVEL SECURITY;

-- Step 5: Create basic RLS policies for messages
CREATE POLICY "messages_select_policy" ON public.messages
  FOR SELECT USING (auth.uid() = recipient_id OR auth.uid() = sender_id);

CREATE POLICY "messages_insert_policy" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "messages_update_policy" ON public.messages
  FOR UPDATE USING (auth.uid() = recipient_id);

-- Step 6: Create basic RLS policies for AI suggestions
CREATE POLICY "ai_suggestions_select_policy" ON public.ai_suggestions
  FOR SELECT USING (is_active = true);

CREATE POLICY "ai_suggestions_all_policy" ON public.ai_suggestions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );

-- Step 7: Create basic RLS policies for personalized_meal_plan_items
CREATE POLICY "meal_plan_items_select_policy" ON public.personalized_meal_plan_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "meal_plan_items_insert_policy" ON public.personalized_meal_plan_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meal_plan_items_update_policy" ON public.personalized_meal_plan_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "meal_plan_items_delete_policy" ON public.personalized_meal_plan_items
  FOR DELETE USING (auth.uid() = user_id);

-- Step 8: Insert sample AI suggestions (only if table is empty)
INSERT INTO public.ai_suggestions (title, content, suggestion_type, target_audience, created_by)
SELECT * FROM (VALUES
('Stay Hydrated', 'Drink at least 8 glasses of water daily to maintain proper hydration and support your metabolism.', 'health_fact', 'all', NULL::uuid),
('Balanced Breakfast', 'Start your day with a protein-rich breakfast to maintain energy levels throughout the morning.', 'nutrition_tip', 'students', NULL::uuid),
('Portion Control', 'Use your hand as a guide: palm for protein, fist for vegetables, cupped hand for carbs, and thumb for fats.', 'nutrition_tip', 'all', NULL::uuid),
('Regular Exercise', 'Aim for at least 30 minutes of moderate exercise daily to support your nutrition goals.', 'exercise_tip', 'students', NULL::uuid),
('Mindful Eating', 'Eat slowly and without distractions to better recognize hunger and fullness cues.', 'nutrition_tip', 'all', NULL::uuid),
('Sleep and Nutrition', 'Getting 7-9 hours of sleep helps regulate hunger hormones and supports healthy eating habits.', 'health_fact', 'all', NULL::uuid),
('Meal Prep Tips', 'Prepare healthy snacks in advance to avoid reaching for unhealthy options when hungry.', 'nutrition_tip', 'students', NULL::uuid),
('Colorful Plate', 'Include a variety of colorful fruits and vegetables to ensure you get diverse nutrients.', 'nutrition_tip', 'all', NULL::uuid)
) AS v(title, content, suggestion_type, target_audience, created_by)
WHERE NOT EXISTS (SELECT 1 FROM public.ai_suggestions LIMIT 1);
