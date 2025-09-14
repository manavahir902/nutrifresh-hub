-- Fix teacher account creation RLS policies
-- Ensure admins can create teacher credentials and profiles

-- Add missing RLS policy for profiles table to allow admins to create teacher profiles
DO $$ 
BEGIN
  -- Drop existing policy if it exists
  DROP POLICY IF EXISTS "Users can create their own profile or admins can create any profile" ON public.profiles;
  
  -- Create new policy that allows users to create their own profiles OR admins to create any profile
  CREATE POLICY "Users can create their own profile or admins can create any profile" ON public.profiles 
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR public.is_admin()
  );
END $$;

-- Ensure teacher_credentials table has proper RLS policies
DO $$ 
BEGIN
  -- Add INSERT policy for teacher_credentials if not exists
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teacher_credentials' AND policyname = 'Admins can create teacher credentials') THEN
    CREATE POLICY "Admins can create teacher credentials" ON public.teacher_credentials 
    FOR INSERT WITH CHECK (public.is_admin());
  END IF;
  
  -- Add UPDATE policy for teacher_credentials if not exists
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teacher_credentials' AND policyname = 'Admins can update teacher credentials') THEN
    CREATE POLICY "Admins can update teacher credentials" ON public.teacher_credentials 
    FOR UPDATE USING (public.is_admin());
  END IF;
  
  -- Add DELETE policy for teacher_credentials if not exists
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teacher_credentials' AND policyname = 'Admins can delete teacher credentials') THEN
    CREATE POLICY "Admins can delete teacher credentials" ON public.teacher_credentials 
    FOR DELETE USING (public.is_admin());
  END IF;
END $$;
