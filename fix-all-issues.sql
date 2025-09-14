-- Comprehensive Fix for All Database Issues
-- This script addresses all the loading and functionality problems

-- 1. Ensure all required tables exist with proper structure
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('feedback', 'announcement', 'suggestion', 'reminder')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_broadcast BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.ai_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('tip', 'fact', 'reminder', 'motivation')),
  target_audience TEXT NOT NULL CHECK (target_audience IN ('all', 'students', 'teachers')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.personalized_meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  description TEXT,
  target_calories INTEGER NOT NULL,
  target_protein INTEGER NOT NULL,
  target_carbs INTEGER NOT NULL,
  target_fat INTEGER NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 7,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.personalized_meal_plan_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID NOT NULL REFERENCES public.personalized_meal_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_item_id UUID REFERENCES public.food_items(id) ON DELETE CASCADE,
  quantity_grams INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_name TEXT NOT NULL,
  meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  student_class TEXT,
  description TEXT,
  estimated_calories INTEGER,
  estimated_cost DECIMAL(8,2),
  is_custom BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Enable RLS on all tables
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_meals ENABLE ROW LEVEL SECURITY;

-- 3. Create helper functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'teacher'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_student()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'student'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create comprehensive RLS policies

-- Messages policies
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
CREATE POLICY "Users can view their own messages" ON public.messages
FOR SELECT USING (
  auth.uid() = sender_id OR 
  auth.uid() = recipient_id OR 
  (is_broadcast = true AND public.is_student())
);

DROP POLICY IF EXISTS "Teachers can send messages" ON public.messages;
CREATE POLICY "Teachers can send messages" ON public.messages
FOR INSERT WITH CHECK (public.is_teacher());

DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
CREATE POLICY "Users can update their own messages" ON public.messages
FOR UPDATE USING (auth.uid() = recipient_id);

-- AI suggestions policies
DROP POLICY IF EXISTS "Everyone can view active AI suggestions" ON public.ai_suggestions;
CREATE POLICY "Everyone can view active AI suggestions" ON public.ai_suggestions
FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Teachers and admins can create AI suggestions" ON public.ai_suggestions;
CREATE POLICY "Teachers and admins can create AI suggestions" ON public.ai_suggestions
FOR INSERT WITH CHECK (public.is_teacher() OR public.is_admin());

-- Personalized meal plans policies
DROP POLICY IF EXISTS "Students can view their own meal plans" ON public.personalized_meal_plans;
CREATE POLICY "Students can view their own meal plans" ON public.personalized_meal_plans
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Teachers can view all meal plans" ON public.personalized_meal_plans;
CREATE POLICY "Teachers can view all meal plans" ON public.personalized_meal_plans
FOR SELECT USING (public.is_teacher());

DROP POLICY IF EXISTS "Teachers can create meal plans" ON public.personalized_meal_plans;
CREATE POLICY "Teachers can create meal plans" ON public.personalized_meal_plans
FOR INSERT WITH CHECK (public.is_teacher());

-- Personalized meal plan items policies
DROP POLICY IF EXISTS "Students can view their own meal plan items" ON public.personalized_meal_plan_items;
CREATE POLICY "Students can view their own meal plan items" ON public.personalized_meal_plan_items
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Teachers can view all meal plan items" ON public.personalized_meal_plan_items;
CREATE POLICY "Teachers can view all meal plan items" ON public.personalized_meal_plan_items
FOR SELECT USING (public.is_teacher());

DROP POLICY IF EXISTS "Teachers can create meal plan items" ON public.personalized_meal_plan_items;
CREATE POLICY "Teachers can create meal plan items" ON public.personalized_meal_plan_items
FOR INSERT WITH CHECK (public.is_teacher());

-- Student meals policies
DROP POLICY IF EXISTS "Users can view their own meals" ON public.student_meals;
CREATE POLICY "Users can view their own meals" ON public.student_meals
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Teachers can view all student meals" ON public.student_meals;
CREATE POLICY "Teachers can view all student meals" ON public.student_meals
FOR SELECT USING (public.is_teacher());

DROP POLICY IF EXISTS "Users can create their own meals" ON public.student_meals;
CREATE POLICY "Users can create their own meals" ON public.student_meals
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own meals" ON public.student_meals;
CREATE POLICY "Users can update their own meals" ON public.student_meals
FOR UPDATE USING (auth.uid() = user_id);

-- 5. Insert sample AI suggestions for daily facts
INSERT INTO public.ai_suggestions (title, content, suggestion_type, target_audience, is_active, created_by)
SELECT 
  'Daily Nutrition Tip',
  'Drink at least 8 glasses of water daily to stay hydrated and support your metabolism.',
  'tip',
  'students',
  true,
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.ai_suggestions WHERE title = 'Daily Nutrition Tip');

INSERT INTO public.ai_suggestions (title, content, suggestion_type, target_audience, is_active, created_by)
SELECT 
  'Healthy Breakfast',
  'Start your day with a balanced breakfast containing protein, complex carbs, and healthy fats.',
  'tip',
  'students',
  true,
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.ai_suggestions WHERE title = 'Healthy Breakfast');

INSERT INTO public.ai_suggestions (title, content, suggestion_type, target_audience, is_active, created_by)
SELECT 
  'Portion Control',
  'Use your hand as a guide: palm for protein, fist for vegetables, cupped hand for carbs.',
  'tip',
  'students',
  true,
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.ai_suggestions WHERE title = 'Portion Control');

INSERT INTO public.ai_suggestions (title, content, suggestion_type, target_audience, is_active, created_by)
SELECT 
  'Meal Timing',
  'Eat every 3-4 hours to maintain stable blood sugar and energy levels throughout the day.',
  'tip',
  'students',
  true,
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.ai_suggestions WHERE title = 'Meal Timing');

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_is_broadcast ON public.messages(is_broadcast);

CREATE INDEX IF NOT EXISTS idx_ai_suggestions_target_audience ON public.ai_suggestions(target_audience);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_is_active ON public.ai_suggestions(is_active);

CREATE INDEX IF NOT EXISTS idx_personalized_meal_plans_user_id ON public.personalized_meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_personalized_meal_plan_items_user_id ON public.personalized_meal_plan_items(user_id);
CREATE INDEX IF NOT EXISTS idx_personalized_meal_plan_items_day_meal ON public.personalized_meal_plan_items(day_of_week, meal_type);

CREATE INDEX IF NOT EXISTS idx_student_meals_user_id ON public.student_meals(user_id);
CREATE INDEX IF NOT EXISTS idx_student_meals_meal_date ON public.student_meals(meal_date);
CREATE INDEX IF NOT EXISTS idx_student_meals_meal_type ON public.student_meals(meal_type);

-- 7. Grant necessary permissions
GRANT SELECT ON public.messages TO authenticated;
GRANT INSERT ON public.messages TO authenticated;
GRANT UPDATE ON public.messages TO authenticated;

GRANT SELECT ON public.ai_suggestions TO authenticated;
GRANT INSERT ON public.ai_suggestions TO authenticated;

GRANT SELECT ON public.personalized_meal_plans TO authenticated;
GRANT INSERT ON public.personalized_meal_plans TO authenticated;

GRANT SELECT ON public.personalized_meal_plan_items TO authenticated;
GRANT INSERT ON public.personalized_meal_plan_items TO authenticated;

GRANT SELECT ON public.student_meals TO authenticated;
GRANT INSERT ON public.student_meals TO authenticated;
GRANT UPDATE ON public.student_meals TO authenticated;

-- 8. Create a function to get daily nutrition facts
CREATE OR REPLACE FUNCTION public.get_daily_nutrition_facts()
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  suggestion_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.title,
    s.content,
    s.suggestion_type,
    s.created_at
  FROM public.ai_suggestions s
  WHERE s.is_active = true
  AND s.target_audience IN ('all', 'students')
  ORDER BY RANDOM()
  LIMIT 4;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_daily_nutrition_facts() TO authenticated;

-- 9. Final verification
SELECT 
  'Database setup completed successfully!' as status,
  (SELECT COUNT(*) FROM public.messages) as messages_count,
  (SELECT COUNT(*) FROM public.ai_suggestions) as ai_suggestions_count,
  (SELECT COUNT(*) FROM public.personalized_meal_plans) as meal_plans_count,
  (SELECT COUNT(*) FROM public.personalized_meal_plan_items) as meal_plan_items_count,
  (SELECT COUNT(*) FROM public.student_meals) as student_meals_count;
