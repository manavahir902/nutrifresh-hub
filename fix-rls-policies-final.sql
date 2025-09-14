-- Fix RLS policies for teacher dashboard
-- Run this in Supabase SQL Editor

-- 1. Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can view student meals" ON public.student_meals;
DROP POLICY IF EXISTS "Teachers can view all student meals" ON public.student_meals;
DROP POLICY IF EXISTS "Users can view messages" ON public.messages;
DROP POLICY IF EXISTS "Teachers can view all messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

-- 2. Create proper RLS policies for student_meals
CREATE POLICY "Teachers can view all student meals" ON public.student_meals 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'teacher'
  )
);

CREATE POLICY "Students can view their own meals" ON public.student_meals 
FOR SELECT USING (auth.uid() = user_id);

-- 3. Create proper RLS policies for messages
CREATE POLICY "Teachers can view all messages" ON public.messages 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'teacher'
  )
);

CREATE POLICY "Users can view their own messages" ON public.messages 
FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- 4. Create proper RLS policies for ai_suggestions
DROP POLICY IF EXISTS "Users can view ai suggestions" ON public.ai_suggestions;
CREATE POLICY "Everyone can view active ai suggestions" ON public.ai_suggestions 
FOR SELECT USING (is_active = true);

-- 5. Create proper RLS policies for personalized_meal_plans
DROP POLICY IF EXISTS "Teachers can view all personalized meal plans" ON public.personalized_meal_plans;
CREATE POLICY "Teachers can view all personalized meal plans" ON public.personalized_meal_plans 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'teacher'
  )
);

-- 6. Create proper RLS policies for student_analytics
DROP POLICY IF EXISTS "Teachers can view all student analytics" ON public.student_analytics;
CREATE POLICY "Teachers can view all student analytics" ON public.student_analytics 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'teacher'
  )
);

-- 7. Test the policies
SELECT 
  'RLS Policies Fixed!' as status,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'student') as students,
  (SELECT COUNT(*) FROM public.student_meals) as meals,
  (SELECT COUNT(*) FROM public.messages) as messages,
  (SELECT COUNT(*) FROM public.ai_suggestions) as ai_suggestions;
