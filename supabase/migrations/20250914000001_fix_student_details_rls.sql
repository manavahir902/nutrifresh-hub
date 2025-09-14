-- Fix student details RLS policies for students
-- Add missing policies for students to insert and update their own student details

-- Add INSERT policy for students (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_details' AND policyname = 'Students can insert their own student details') THEN
    CREATE POLICY "Students can insert their own student details" ON public.student_details 
    FOR INSERT WITH CHECK (
      auth.uid() = user_id AND 
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'student'
      )
    );
  END IF;
END $$;

-- Add UPDATE policy for students (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_details' AND policyname = 'Students can update their own student details') THEN
    CREATE POLICY "Students can update their own student details" ON public.student_details 
    FOR UPDATE USING (
      auth.uid() = user_id AND 
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'student'
      )
    );
  END IF;
END $$;

-- is_student() function is created in 20250914000000_create_helper_functions.sql
