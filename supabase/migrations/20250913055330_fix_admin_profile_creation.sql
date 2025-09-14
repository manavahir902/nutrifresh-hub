-- Fix admin profile creation RLS policies
-- Allow admins to create profiles for other users

-- Drop the existing policy that only allows users to create their own profiles
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;

-- Create a new policy that allows users to create their own profiles OR admins to create any profile
CREATE POLICY "Users can create their own profile or admins can create any profile" ON public.profiles 
FOR INSERT WITH CHECK (
  auth.uid() = user_id OR public.is_admin()
);

-- Also allow admins to create student_details for other users
DROP POLICY IF EXISTS "Users can create their own student details" ON public.student_details;

CREATE POLICY "Users can create their own student details or admins can create any student details" ON public.student_details 
FOR INSERT WITH CHECK (
  auth.uid() = user_id OR public.is_admin()
);
