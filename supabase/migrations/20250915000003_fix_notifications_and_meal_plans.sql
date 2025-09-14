-- Fix notifications and meal plans system
-- This migration creates the missing tables and fixes the existing ones

-- 1. Create messages table for notifications
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

-- 2. Create AI suggestions table
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

-- 3. Create student_meals table (for logged meals)
CREATE TABLE IF NOT EXISTS public.student_meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_name TEXT NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  estimated_calories INTEGER NOT NULL DEFAULT 0,
  meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Create personalized_meal_plan_items table (for AI-generated meal plans)
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

-- 5. Enable RLS on new tables
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_meal_plan_items ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for messages
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

-- 7. Create RLS policies for AI suggestions
CREATE POLICY "Everyone can view active AI suggestions" ON public.ai_suggestions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Teachers and admins can manage AI suggestions" ON public.ai_suggestions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );

-- 8. Create RLS policies for student_meals
CREATE POLICY "Users can view their own meals" ON public.student_meals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meals" ON public.student_meals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meals" ON public.student_meals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meals" ON public.student_meals
  FOR DELETE USING (auth.uid() = user_id);

-- Teachers and admins can view all student meals
CREATE POLICY "Teachers can view all student meals" ON public.student_meals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );

-- 9. Create RLS policies for personalized_meal_plan_items
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

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_student_meals_user_id ON public.student_meals(user_id);
CREATE INDEX IF NOT EXISTS idx_student_meals_meal_date ON public.student_meals(meal_date);
CREATE INDEX IF NOT EXISTS idx_personalized_meal_plan_items_user_id ON public.personalized_meal_plan_items(user_id);
CREATE INDEX IF NOT EXISTS idx_personalized_meal_plan_items_day_meal ON public.personalized_meal_plan_items(day_of_week, meal_type);

-- 11. Insert sample AI suggestions
INSERT INTO public.ai_suggestions (title, content, suggestion_type, target_audience) VALUES
('Stay Hydrated', 'Drink at least 8 glasses of water daily to maintain proper hydration and support your metabolism.', 'health_fact', 'all'),
('Balanced Breakfast', 'Start your day with a protein-rich breakfast to maintain energy levels throughout the morning.', 'nutrition_tip', 'students'),
('Portion Control', 'Use your hand as a guide: palm for protein, fist for vegetables, cupped hand for carbs, and thumb for fats.', 'nutrition_tip', 'all'),
('Regular Exercise', 'Aim for at least 30 minutes of moderate exercise daily to support your nutrition goals.', 'exercise_tip', 'students'),
('Mindful Eating', 'Eat slowly and without distractions to better recognize hunger and fullness cues.', 'nutrition_tip', 'all'),
('Sleep and Nutrition', 'Getting 7-9 hours of sleep helps regulate hunger hormones and supports healthy eating habits.', 'health_fact', 'all'),
('Meal Prep Tips', 'Prepare healthy snacks in advance to avoid reaching for unhealthy options when hungry.', 'nutrition_tip', 'students'),
('Colorful Plate', 'Include a variety of colorful fruits and vegetables to ensure you get diverse nutrients.', 'nutrition_tip', 'all');

-- 12. Update food_items table to include the new categories
UPDATE public.food_items SET category = 'complete_meal' WHERE name LIKE '%Rice%' OR name LIKE '%Curry%';
UPDATE public.food_items SET category = 'breakfast' WHERE name IN ('Wheat Roti', 'Milk', 'Curd/Yogurt');
UPDATE public.food_items SET category = 'snacks' WHERE name IN ('Banana', 'Apple');
UPDATE public.food_items SET category = 'ingredients' WHERE name IN ('Rice (Basmati)', 'Dal (Lentils)', 'Paneer', 'Mixed Vegetables');
