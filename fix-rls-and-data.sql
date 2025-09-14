-- Fix RLS policies and populate missing data
-- Run this in Supabase SQL Editor

-- 1. Enable RLS on all tables
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policies for meal_plans
DROP POLICY IF EXISTS "Users can view meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can create meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Teachers can view all meal plans" ON public.meal_plans;

CREATE POLICY "Users can view meal plans" ON public.meal_plans 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create meal plans" ON public.meal_plans 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teachers can view all meal plans" ON public.meal_plans 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'teacher'
  )
);

-- 3. Create RLS policies for personalized_meal_plans
DROP POLICY IF EXISTS "Users can view personalized meal plans" ON public.personalized_meal_plans;
DROP POLICY IF EXISTS "Teachers can view all personalized meal plans" ON public.personalized_meal_plans;
DROP POLICY IF EXISTS "Teachers can create personalized meal plans" ON public.personalized_meal_plans;

CREATE POLICY "Users can view personalized meal plans" ON public.personalized_meal_plans 
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view all personalized meal plans" ON public.personalized_meal_plans 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'teacher'
  )
);

CREATE POLICY "Teachers can create personalized meal plans" ON public.personalized_meal_plans 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'teacher'
  )
);

-- 4. Create RLS policies for ai_suggestions
DROP POLICY IF EXISTS "Users can view ai suggestions" ON public.ai_suggestions;
DROP POLICY IF EXISTS "Teachers can create ai suggestions" ON public.ai_suggestions;

CREATE POLICY "Users can view ai suggestions" ON public.ai_suggestions 
FOR SELECT USING (is_active = true);

CREATE POLICY "Teachers can create ai suggestions" ON public.ai_suggestions 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'teacher'
  )
);

-- 5. Create RLS policies for student_analytics
DROP POLICY IF EXISTS "Users can view student analytics" ON public.student_analytics;
DROP POLICY IF EXISTS "Teachers can view all student analytics" ON public.student_analytics;

CREATE POLICY "Users can view student analytics" ON public.student_analytics 
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view all student analytics" ON public.student_analytics 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'teacher'
  )
);

-- 6. Create RLS policies for food_items
DROP POLICY IF EXISTS "Users can view food items" ON public.food_items;

CREATE POLICY "Users can view food items" ON public.food_items 
FOR SELECT USING (true);

-- 7. Create sample AI suggestions
INSERT INTO public.ai_suggestions (title, content, suggestion_type, target_audience, created_by)
SELECT 
  'Drink More Water',
  'Stay hydrated! Aim for 8-10 glasses of water per day for optimal health.',
  'tip',
  'all',
  (SELECT user_id FROM public.profiles WHERE role = 'teacher' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.ai_suggestions WHERE title = 'Drink More Water');

INSERT INTO public.ai_suggestions (title, content, suggestion_type, target_audience, created_by)
SELECT 
  'Balanced Breakfast',
  'Start your day with a balanced breakfast including protein, carbs, and healthy fats.',
  'tip',
  'students',
  (SELECT user_id FROM public.profiles WHERE role = 'teacher' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.ai_suggestions WHERE title = 'Balanced Breakfast');

INSERT INTO public.ai_suggestions (title, content, suggestion_type, target_audience, created_by)
SELECT 
  'Portion Control',
  'Use your hand as a guide: palm for protein, fist for vegetables, cupped hand for carbs.',
  'tip',
  'students',
  (SELECT user_id FROM public.profiles WHERE role = 'teacher' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.ai_suggestions WHERE title = 'Portion Control');

-- 8. Create sample personalized meal plans for students
DO $$
DECLARE
  student_record RECORD;
  teacher_id UUID;
BEGIN
  -- Get a teacher ID
  SELECT user_id INTO teacher_id FROM public.profiles WHERE role = 'teacher' LIMIT 1;
  
  -- Create personalized meal plans for each student
  FOR student_record IN 
    SELECT user_id FROM public.profiles WHERE role = 'student'
  LOOP
    -- Create a personalized meal plan for this student
    INSERT INTO public.personalized_meal_plans (
      student_id, 
      plan_name, 
      description, 
      target_calories, 
      target_protein, 
      target_carbs, 
      target_fat, 
      duration_days, 
      created_by
    ) VALUES (
      student_record.user_id,
      'Personalized Nutrition Plan',
      'Customized meal plan based on student goals and preferences',
      2000,
      150,
      250,
      80,
      7,
      teacher_id
    ) ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- 9. Create sample student analytics
DO $$
DECLARE
  student_record RECORD;
BEGIN
  FOR student_record IN 
    SELECT user_id FROM public.profiles WHERE role = 'student'
  LOOP
    -- Insert sample analytics data
    INSERT INTO public.student_analytics (student_id, metric_name, metric_value, metric_unit, notes)
    VALUES 
      (student_record.user_id, 'weekly_calories', 14000, 'calories', 'Total calories consumed this week'),
      (student_record.user_id, 'meals_logged', 21, 'count', 'Number of meals logged this week'),
      (student_record.user_id, 'avg_daily_calories', 2000, 'calories', 'Average daily calorie intake'),
      (student_record.user_id, 'goal_progress', 75, 'percentage', 'Progress towards nutrition goals')
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- 10. Verify the setup
SELECT 
  'Setup complete!' as status,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'student') as students,
  (SELECT COUNT(*) FROM public.student_meals) as student_meals,
  (SELECT COUNT(*) FROM public.messages) as messages,
  (SELECT COUNT(*) FROM public.meal_plans) as meal_plans,
  (SELECT COUNT(*) FROM public.personalized_meal_plans) as personalized_plans,
  (SELECT COUNT(*) FROM public.ai_suggestions) as ai_suggestions,
  (SELECT COUNT(*) FROM public.student_analytics) as analytics;
