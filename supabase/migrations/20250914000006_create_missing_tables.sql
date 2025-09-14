-- Create missing tables and fix issues for remote database
-- This migration creates all missing tables and fixes the index error

-- Step 1: Create helper functions first
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

-- Step 2: Create teacher_credentials table
CREATE TABLE IF NOT EXISTS public.teacher_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_code TEXT NOT NULL UNIQUE, -- Admin-generated unique code
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id), -- Admin who created this
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Step 3: Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for broadcast messages
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('feedback', 'announcement', 'suggestion', 'reminder')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_broadcast BOOLEAN NOT NULL DEFAULT false, -- For messages to all students
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Step 4: Create ai_suggestions table
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

-- Step 5: Create personalized_meal_plans table
CREATE TABLE IF NOT EXISTS public.personalized_meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Step 6: Create personalized_meal_plan_items table
CREATE TABLE IF NOT EXISTS public.personalized_meal_plan_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID NOT NULL REFERENCES public.personalized_meal_plans(id) ON DELETE CASCADE,
  food_item_id UUID NOT NULL REFERENCES public.food_items(id),
  quantity_grams INTEGER NOT NULL DEFAULT 100,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Step 7: Create student_analytics table
CREATE TABLE IF NOT EXISTS public.student_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  metric_unit TEXT NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Step 8: Enable RLS on all tables
ALTER TABLE public.teacher_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_analytics ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS policies for all tables
DO $$ 
BEGIN
  -- Profiles policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can view all profiles') THEN
    CREATE POLICY "Admins can view all profiles" ON public.profiles 
    FOR SELECT USING (public.is_admin());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can create any profile') THEN
    CREATE POLICY "Admins can create any profile" ON public.profiles 
    FOR INSERT WITH CHECK (public.is_admin());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can update all profiles') THEN
    CREATE POLICY "Admins can update all profiles" ON public.profiles 
    FOR UPDATE USING (public.is_admin());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can delete all profiles') THEN
    CREATE POLICY "Admins can delete all profiles" ON public.profiles 
    FOR DELETE USING (public.is_admin());
  END IF;
  
  -- Student details policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_details' AND policyname = 'Admins can view all student details') THEN
    CREATE POLICY "Admins can view all student details" ON public.student_details 
    FOR SELECT USING (public.is_admin());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_details' AND policyname = 'Admins can update all student details') THEN
    CREATE POLICY "Admins can update all student details" ON public.student_details 
    FOR UPDATE USING (public.is_admin());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_details' AND policyname = 'Admins can delete all student details') THEN
    CREATE POLICY "Admins can delete all student details" ON public.student_details 
    FOR DELETE USING (public.is_admin());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_details' AND policyname = 'Admins can create any student details') THEN
    CREATE POLICY "Admins can create any student details" ON public.student_details 
    FOR INSERT WITH CHECK (public.is_admin());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_details' AND policyname = 'Teachers can view all student details') THEN
    CREATE POLICY "Teachers can view all student details" ON public.student_details 
    FOR SELECT USING (public.is_teacher());
  END IF;
  
  -- Teacher credentials policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teacher_credentials' AND policyname = 'Admins can view all teacher credentials') THEN
    CREATE POLICY "Admins can view all teacher credentials" ON public.teacher_credentials 
    FOR SELECT USING (public.is_admin());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teacher_credentials' AND policyname = 'Admins can create teacher credentials') THEN
    CREATE POLICY "Admins can create teacher credentials" ON public.teacher_credentials 
    FOR INSERT WITH CHECK (public.is_admin());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teacher_credentials' AND policyname = 'Admins can update teacher credentials') THEN
    CREATE POLICY "Admins can update teacher credentials" ON public.teacher_credentials 
    FOR UPDATE USING (public.is_admin());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teacher_credentials' AND policyname = 'Admins can delete teacher credentials') THEN
    CREATE POLICY "Admins can delete teacher credentials" ON public.teacher_credentials 
    FOR DELETE USING (public.is_admin());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teacher_credentials' AND policyname = 'Teachers can view their own credentials') THEN
    CREATE POLICY "Teachers can view their own credentials" ON public.teacher_credentials 
    FOR SELECT USING (auth.uid() = teacher_id);
  END IF;
  
END $$;

-- Step 10: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teacher_credentials_teacher_id ON public.teacher_credentials(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_credentials_code ON public.teacher_credentials(teacher_code);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_type ON public.ai_suggestions(suggestion_type);
CREATE INDEX IF NOT EXISTS idx_personalized_meal_plans_student_id ON public.personalized_meal_plans(student_id);
CREATE INDEX IF NOT EXISTS idx_student_analytics_student_id ON public.student_analytics(student_id);
