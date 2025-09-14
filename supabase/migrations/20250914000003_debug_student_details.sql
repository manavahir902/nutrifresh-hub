-- Debug student details RLS policies
-- Check current policies and add missing ones

-- First, let's see what policies exist
-- This is just for debugging - we'll check the policies

-- Ensure we have the basic policies for student_details
DO $$ 
BEGIN
  -- Drop existing policies to recreate them cleanly
  DROP POLICY IF EXISTS "Users can view their own student details" ON public.student_details;
  DROP POLICY IF EXISTS "Users can create their own student details" ON public.student_details;
  DROP POLICY IF EXISTS "Users can update their own student details" ON public.student_details;
  DROP POLICY IF EXISTS "Users can create their own student details or admins can create any student details" ON public.student_details;
  DROP POLICY IF EXISTS "Students can insert their own student details" ON public.student_details;
  DROP POLICY IF EXISTS "Students can update their own student details" ON public.student_details;
  
  -- Create clean policies
  CREATE POLICY "Users can view their own student details" ON public.student_details 
  FOR SELECT USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can create their own student details" ON public.student_details 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
  CREATE POLICY "Users can update their own student details" ON public.student_details 
  FOR UPDATE USING (auth.uid() = user_id);
  
  -- Admin policies (only create if they don't exist)
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
  
  -- Teacher policies (only create if they don't exist)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_details' AND policyname = 'Teachers can view all student details') THEN
    CREATE POLICY "Teachers can view all student details" ON public.student_details 
    FOR SELECT USING (public.is_teacher());
  END IF;
  
  -- Admin can create student details for any user
  CREATE POLICY "Admins can create any student details" ON public.student_details 
  FOR INSERT WITH CHECK (public.is_admin());
  
END $$;
