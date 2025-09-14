-- Complete RLS setup for remote database
-- This migration includes all necessary functions and policies

-- Step 1: Create helper functions
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

-- Step 2: Clean up existing policies and create new ones
DO $$ 
BEGIN
  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can create their own profile or admins can create any profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can view their own student details" ON public.student_details;
  DROP POLICY IF EXISTS "Users can create their own student details" ON public.student_details;
  DROP POLICY IF EXISTS "Users can update their own student details" ON public.student_details;
  DROP POLICY IF EXISTS "Users can create their own student details or admins can create any student details" ON public.student_details;
  DROP POLICY IF EXISTS "Students can insert their own student details" ON public.student_details;
  DROP POLICY IF EXISTS "Students can update their own student details" ON public.student_details;
  DROP POLICY IF EXISTS "Admins can view all student details" ON public.student_details;
  DROP POLICY IF EXISTS "Admins can update all student details" ON public.student_details;
  DROP POLICY IF EXISTS "Admins can delete all student details" ON public.student_details;
  DROP POLICY IF EXISTS "Teachers can view all student details" ON public.student_details;
  DROP POLICY IF EXISTS "Admins can create any student details" ON public.student_details;
  
  -- Create profiles policies
  CREATE POLICY "Users can view their own profile" ON public.profiles 
  FOR SELECT USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can create their own profile" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
  CREATE POLICY "Users can update their own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = user_id);
  
  CREATE POLICY "Admins can view all profiles" ON public.profiles 
  FOR SELECT USING (public.is_admin());
  
  CREATE POLICY "Admins can create any profile" ON public.profiles 
  FOR INSERT WITH CHECK (public.is_admin());
  
  CREATE POLICY "Admins can update all profiles" ON public.profiles 
  FOR UPDATE USING (public.is_admin());
  
  CREATE POLICY "Admins can delete all profiles" ON public.profiles 
  FOR DELETE USING (public.is_admin());
  
  -- Create student_details policies
  CREATE POLICY "Users can view their own student details" ON public.student_details 
  FOR SELECT USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can create their own student details" ON public.student_details 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
  CREATE POLICY "Users can update their own student details" ON public.student_details 
  FOR UPDATE USING (auth.uid() = user_id);
  
  CREATE POLICY "Admins can view all student details" ON public.student_details 
  FOR SELECT USING (public.is_admin());
  
  CREATE POLICY "Admins can update all student details" ON public.student_details 
  FOR UPDATE USING (public.is_admin());
  
  CREATE POLICY "Admins can delete all student details" ON public.student_details 
  FOR DELETE USING (public.is_admin());
  
  CREATE POLICY "Admins can create any student details" ON public.student_details 
  FOR INSERT WITH CHECK (public.is_admin());
  
  CREATE POLICY "Teachers can view all student details" ON public.student_details 
  FOR SELECT USING (public.is_teacher());
  
  -- Create teacher_credentials policies
  CREATE POLICY "Admins can view all teacher credentials" ON public.teacher_credentials 
  FOR SELECT USING (public.is_admin());
  
  CREATE POLICY "Admins can create teacher credentials" ON public.teacher_credentials 
  FOR INSERT WITH CHECK (public.is_admin());
  
  CREATE POLICY "Admins can update teacher credentials" ON public.teacher_credentials 
  FOR UPDATE USING (public.is_admin());
  
  CREATE POLICY "Admins can delete teacher credentials" ON public.teacher_credentials 
  FOR DELETE USING (public.is_admin());
  
  CREATE POLICY "Teachers can view their own credentials" ON public.teacher_credentials 
  FOR SELECT USING (auth.uid() = teacher_id);
  
END $$;
