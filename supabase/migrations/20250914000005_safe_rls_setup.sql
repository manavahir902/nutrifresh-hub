-- Safe RLS setup for remote database
-- This migration only creates missing functions and policies

-- Step 1: Create helper functions (only if they don't exist)
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

-- Step 2: Create only missing policies
DO $$ 
BEGIN
  -- Create profiles policies (only if they don't exist)
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
  
  -- Create student_details policies (only if they don't exist)
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
  
  -- Create teacher_credentials policies (only if they don't exist)
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
